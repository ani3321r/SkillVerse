import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { io, Socket } from "socket.io-client";

import AppLayout from "../components/app-layout";
import { useAuth } from "../context/AuthContext";
import { apiFetch, API_URL } from "../services/api";

type Message = {
  id: number; conversation_id: number;
  sender_id: number; message: string; created_at: string;
};

export default function ChatScreen() {
  const params               = useLocalSearchParams();
  const { token, userId }    = useAuth();

  const targetUserId = Number(params.userId);
  const targetName   = String(params.name || "Student");

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages,       setMessages]       = useState<Message[]>([]);
  const [text,           setText]           = useState("");
  const [loading,        setLoading]        = useState(true);
  const socketRef = useRef<Socket | null>(null);

  /* ── Init conversation + socket ── */
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!userId || !targetUserId || userId === targetUserId) { setLoading(false); return; }

      try {
        const res  = await apiFetch("/api/chat/conversations", token, {
          method: "POST",
          body: JSON.stringify({ otherUserId: targetUserId }),
        });
        const data = await res.json();
        if (!data.success || !mounted) { setLoading(false); return; }

        const id = data.conversationId as number;
        setConversationId(id);

        const msgRes  = await apiFetch(`/api/chat/conversations/${id}/messages`, token);
        const msgData = await msgRes.json();
        if (msgData.success && mounted) setMessages(msgData.messages);

        const socket = io(API_URL);
        socketRef.current = socket;
        socket.on("connect", () => {
          socket.emit("join-user", userId);
          socket.emit("join-conversation", { conversationId: id, userId });
        });
        socket.on("new-message", (msg: Message) => {
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        });
      } catch { /* silent */ }
      finally { if (mounted) setLoading(false); }
    };
    init();
    return () => { mounted = false; socketRef.current?.disconnect(); socketRef.current = null; };
  }, [userId, targetUserId, token]);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !conversationId || !socketRef.current || !userId) return;
    socketRef.current.emit("send-message", { conversationId, senderId: userId, message: trimmed });
    setText("");
  };

  const renderMsg = ({ item }: { item: Message }) => {
    const mine = item.sender_id === userId;
    return (
      <View style={[s.msgRow, mine ? s.myRow : s.otherRow]}>
        <View style={[s.bubble, mine ? s.myBubble : s.otherBubble]}>
          <Text style={[s.msgTxt, mine ? s.myTxt : s.otherTxt]}>{item.message}</Text>
          <Text style={[s.time, mine ? s.myTime : s.otherTime]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  };

  /* Chat wraps AppLayout with scrollable=false so it manages its own layout */
  return (
    <AppLayout scrollable={false}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Chat header */}
        <View style={s.chatHeader}>
          <View style={s.chatAvatar}>
            <Text style={s.chatAvatarTxt}>{targetName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={s.chatName}>{targetName}</Text>
            <Text style={s.chatStatus}>SkillVerse student</Text>
          </View>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={s.loadBox}><ActivityIndicator size="large" color="#1456F0"/></View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={item => String(item.id)}
            renderItem={renderMsg}
            contentContainerStyle={s.msgList}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyTitle}>Start the conversation 👋</Text>
                <Text style={s.emptyTxt}>Say hello and connect with {targetName}.</Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a message..."
            placeholderTextColor="#94A3B8"
            style={s.input}
            multiline
          />
          <Pressable
            onPress={sendMessage}
            disabled={!text.trim()}
            style={[s.sendBtn, !text.trim() && s.sendDis]}
          >
            <Text style={s.sendTxt}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  flex:        { flex: 1 },
  chatHeader:  { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E8ECF2" },
  chatAvatar:  { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1456F0", justifyContent: "center", alignItems: "center" },
  chatAvatarTxt:{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  chatName:    { fontSize: 15, fontWeight: "800", color: "#0B1D3C" },
  chatStatus:  { fontSize: 11, color: "#22C55E", marginTop: 2 },
  loadBox:     { flex: 1, justifyContent: "center", alignItems: "center" },
  msgList:     { padding: 16, flexGrow: 1 },
  msgRow:      { flexDirection: "row", marginBottom: 10 },
  myRow:       { justifyContent: "flex-end" },
  otherRow:    { justifyContent: "flex-start" },
  bubble:      { maxWidth: "75%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  myBubble:    { backgroundColor: "#1456F0", borderBottomRightRadius: 5 },
  otherBubble: { backgroundColor: "#E2E8F0", borderBottomLeftRadius: 5 },
  msgTxt:      { fontSize: 14, lineHeight: 20 },
  myTxt:       { color: "#FFFFFF" },
  otherTxt:    { color: "#111827" },
  time:        { marginTop: 4, fontSize: 10 },
  myTime:      { color: "#DBEAFE", textAlign: "right" },
  otherTime:   { color: "#64748B" },
  empty:       { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyTitle:  { fontSize: 17, fontWeight: "800", color: "#0B1D3C", marginBottom: 8 },
  emptyTxt:    { textAlign: "center", color: "#64748B", lineHeight: 21 },
  inputRow:    { flexDirection: "row", alignItems: "flex-end", padding: 12, gap: 10, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E8ECF2" },
  input:       { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: "#F1F5F9", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#111827" },
  sendBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1456F0", justifyContent: "center", alignItems: "center" },
  sendDis:     { opacity: 0.4 },
  sendTxt:     { color: "#FFFFFF", fontSize: 18 },
});
