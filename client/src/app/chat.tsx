import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { io, Socket } from "socket.io-client";


const API_URL =
  "http://localhost:5000";

const SOCKET_URL =
  "http://localhost:5000";


type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  created_at: string;
};


export default function ChatScreen() {

  const params =
    useLocalSearchParams();


  // ---------------------------------------------
  // TEMPORARY CURRENT USER
  // ---------------------------------------------
  // We will replace this with the actual
  // logged-in user later.

  const currentUserId =
    Number(params.currentUserId) || 1;


  const targetUserId =
    Number(params.userId);


  const targetName =
    String(params.name || "Student");


  const [conversationId, setConversationId] =
    useState<number | null>(null);


  const [messages, setMessages] =
    useState<Message[]>([]);


  const [text, setText] =
    useState("");


  const [loading, setLoading] =
    useState(true);


  const socketRef =
    useRef<Socket | null>(null);


  // =================================================
  // CREATE / GET CONVERSATION
  // =================================================

  const createConversation =
    async () => {

      try {

        const response =
          await fetch(
            `${API_URL}/api/chat/conversations`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                userId:
                  currentUserId,

                otherUserId:
                  targetUserId,
              }),
            }
          );


        const data =
          await response.json();


        if (!response.ok ||
            !data.success) {

          throw new Error(
            data.message ||
            "Failed to create conversation"
          );
        }


        return data.conversationId;

      } catch (error) {

        console.error(
          "Conversation error:",
          error
        );

        return null;
      }
    };


  // =================================================
  // LOAD MESSAGES
  // =================================================

  const loadMessages =
    async (
      id: number
    ) => {

      try {

        const response =
          await fetch(
            `${API_URL}/api/chat/conversations/${id}/messages?userId=${currentUserId}`
          );


        const data =
          await response.json();


        if (!response.ok ||
            !data.success) {

          throw new Error(
            data.message ||
            "Failed to load messages"
          );
        }


        setMessages(
          data.messages
        );

      } catch (error) {

        console.error(
          "Load messages error:",
          error
        );
      }
    };


  // =================================================
  // INITIALIZE
  // =================================================

  useEffect(() => {

    let mounted = true;


    const initialize =
      async () => {

        if (
          !currentUserId ||
          !targetUserId ||
          currentUserId === targetUserId
        ) {

          setLoading(false);

          return;
        }


        const id =
          await createConversation();


        if (!id || !mounted) {

          setLoading(false);

          return;
        }


        setConversationId(id);


        await loadMessages(id);


        if (!mounted) {
          return;
        }


        // -----------------------------------------
        // SOCKET
        // -----------------------------------------

        const socket =
          io(SOCKET_URL);


        socketRef.current =
          socket;


        socket.on(
          "connect",
          () => {

            console.log(
              "Socket connected:",
              socket.id
            );


            socket.emit(
              "join-user",
              currentUserId
            );


            socket.emit(
              "join-conversation",
              {
                conversationId: id,
                userId: currentUserId,
              }
            );
          }
        );


        socket.on(
          "new-message",
          (
            newMessage: Message
          ) => {

            setMessages(
              (previous) => {

                const alreadyExists =
                  previous.some(
                    (item) =>
                      item.id ===
                      newMessage.id
                  );


                if (alreadyExists) {
                  return previous;
                }


                return [
                  ...previous,
                  newMessage,
                ];
              }
            );
          }
        );

      };


    initialize();


    return () => {

      mounted = false;

      socketRef.current?.disconnect();

      socketRef.current = null;

    };

  }, [
    currentUserId,
    targetUserId,
  ]);


  // =================================================
  // SEND MESSAGE
  // =================================================

  const sendMessage =
    () => {

      const trimmed =
        text.trim();


      if (
        !trimmed ||
        !conversationId ||
        !socketRef.current
      ) {
        return;
      }


      socketRef.current.emit(
        "send-message",
        {
          conversationId,

          senderId:
            currentUserId,

          message:
            trimmed,
        }
      );


      setText("");
    };


  // =================================================
  // MESSAGE ITEM
  // =================================================

  const renderMessage =
    ({
      item,
    }: {
      item: Message;
    }) => {

      const mine =
        item.sender_id ===
        currentUserId;


      return (
        <View
          style={[
            styles.messageRow,

            mine
              ? styles.myRow
              : styles.otherRow,
          ]}
        >

          <View
            style={[
              styles.bubble,

              mine
                ? styles.myBubble
                : styles.otherBubble,
            ]}
          >

            <Text
              style={[
                styles.messageText,

                mine
                  ? styles.myText
                  : styles.otherText,
              ]}
            >
              {item.message}
            </Text>


            <Text
              style={[
                styles.time,

                mine
                  ? styles.myTime
                  : styles.otherTime,
              ]}
            >
              {new Date(
                item.created_at
              ).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </Text>

          </View>

        </View>
      );
    };


  // =================================================
  // LOADING
  // =================================================

  if (loading) {

    return (
      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loading}>
          Opening chat...
        </Text>

      </View>
    );
  }


  // =================================================
  // UI
  // =================================================

  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      {/* HEADER */}

      <View style={styles.header}>

        <Pressable
          onPress={() => router.back()}
        >

          <Text style={styles.back}>
            ←
          </Text>

        </Pressable>


        <View style={styles.headerInfo}>

          <Text style={styles.headerName}>
            {targetName}
          </Text>

          <Text style={styles.headerStatus}>
            SkillVerse student
          </Text>

        </View>

      </View>


      {/* MESSAGES */}

      <FlatList
        data={messages}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={
          renderMessage
        }
        contentContainerStyle={
          styles.messageList
        }
        ListEmptyComponent={
          <View style={styles.empty}>

            <Text style={styles.emptyTitle}>
              Start the conversation 👋
            </Text>

            <Text style={styles.emptyText}>
              Say hello and connect
              with {targetName}.
            </Text>

          </View>
        }
      />


      {/* INPUT */}

      <View style={styles.inputContainer}>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write a message..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
          multiline
        />


        <Pressable
          onPress={sendMessage}
          disabled={!text.trim()}
          style={[
            styles.sendButton,

            !text.trim() &&
              styles.sendDisabled,
          ]}
        >

          <Text style={styles.sendText}>
            ➤
          </Text>

        </Pressable>

      </View>

    </KeyboardAvoidingView>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: "#F7F9FC",
    },

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        "#F7F9FC",
    },

    loading: {
      marginTop: 12,
      color: "#64748B",
    },

    header: {
      height: 72,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 20,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
    },

    back: {
      fontSize: 30,
      color: "#2563EB",
      marginRight: 16,
    },

    headerInfo: {
      flex: 1,
    },

    headerName: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
    },

    headerStatus: {
      marginTop: 3,
      fontSize: 12,
      color: "#22C55E",
    },

    messageList: {
      padding: 16,
      flexGrow: 1,
    },

    messageRow: {
      flexDirection: "row",
      marginBottom: 10,
    },

    myRow: {
      justifyContent: "flex-end",
    },

    otherRow: {
      justifyContent: "flex-start",
    },

    bubble: {
      maxWidth: "75%",
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 18,
    },

    myBubble: {
      backgroundColor: "#2563EB",
      borderBottomRightRadius: 5,
    },

    otherBubble: {
      backgroundColor: "#E2E8F0",
      borderBottomLeftRadius: 5,
    },

    messageText: {
      fontSize: 15,
      lineHeight: 21,
    },

    myText: {
      color: "#FFFFFF",
    },

    otherText: {
      color: "#111827",
    },

    time: {
      marginTop: 4,
      fontSize: 10,
    },

    myTime: {
      color: "#DBEAFE",
      textAlign: "right",
    },

    otherTime: {
      color: "#64748B",
    },

    empty: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      padding: 40,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 8,
    },

    emptyText: {
      textAlign: "center",
      color: "#64748B",
      lineHeight: 21,
    },

    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      padding: 12,
      gap: 10,
      backgroundColor: "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: "#E2E8F0",
    },

    input: {
      flex: 1,
      minHeight: 46,
      maxHeight: 120,
      backgroundColor: "#F1F5F9",
      borderRadius: 23,
      paddingHorizontal: 18,
      paddingVertical: 12,
      fontSize: 15,
      color: "#111827",
    },

    sendButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "#2563EB",
      justifyContent: "center",
      alignItems: "center",
    },

    sendDisabled: {
      opacity: 0.4,
    },

    sendText: {
      color: "#FFFFFF",
      fontSize: 20,
    },

  });