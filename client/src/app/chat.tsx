import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable,
  FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { io, Socket } from "socket.io-client";
import Svg, { Path, Circle, Line, Polyline } from "react-native-svg";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import AppLayout from "../components/app-layout";
import { useAuth } from "../context/AuthContext";
import { apiFetch, API_URL } from "../services/api";

/* ── TOKENS ─────────────────────────────── */
const P   = "#1456F0";
const PS  = "#EAF0FE";
const NV  = "#0B1D3C";
const SL  = "#64748B";
const SLL = "#94A3B8";
const BD  = "#E8ECF2";
const WH  = "#FFFFFF";
const BG  = "#F4F6FB";
const GR  = "#22C55E";

const F = {
  r: "PlusJakartaSans_400Regular",
  m: "PlusJakartaSans_500Medium",
  s: "PlusJakartaSans_600SemiBold",
  b: "PlusJakartaSans_700Bold",
  x: "PlusJakartaSans_800ExtraBold",
};

/* ── TYPES ──────────────────────────────── */
type Conversation = {
  conversation_id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_email: string;
  other_user_avatar: string | null;
  last_message: string | null;
  last_message_time: string | null;
};

type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  sender_name?: string;
};

/* ── AVATAR COLORS ──────────────────────── */
const AV_COLORS = [
  { bg: "#DBEAFE", tx: "#1D4ED8" },
  { bg: "#FCE7F3", tx: "#9D174D" },
  { bg: "#FEF3C7", tx: "#92400E" },
  { bg: "#DCFCE7", tx: "#065F46" },
  { bg: "#EDE9FE", tx: "#5B21B6" },
  { bg: "#FFE4E6", tx: "#9F1239" },
  { bg: "#E0F2FE", tx: "#0369A1" },
];
function avColor(id: number) { return AV_COLORS[id % AV_COLORS.length]; }
function getInitials(name: string) {
  return name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "S";
}

/* ── TIME FORMAT ────────────────────────── */
function fmtTime(d: string) {
  if (!d) return "";
  const date = new Date(d);
  const now  = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)   return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function isToday(d: string) {
  const date = new Date(d);
  const now  = new Date();
  return date.toDateString() === now.toDateString();
}

function groupByDate(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  let current = "";
  for (const m of messages) {
    const label = isToday(m.created_at) ? "Today" : new Date(m.created_at).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    if (label !== current) {
      current = label;
      groups.push({ label, messages: [m] });
    } else {
      groups[groups.length - 1].messages.push(m);
    }
  }
  return groups;
}

/* ── ICONS ──────────────────────────────── */
function SearchIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={SLL} strokeWidth={2}/>
      <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={SLL} strokeWidth={2} strokeLinecap="round"/>
    </Svg>
  );
}
function SendIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13" stroke={WH} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M22 2L15 22l-4-9-9-4 20-7z" stroke={WH} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function AttachIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83L15.9 6.27" stroke={SL} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function EmojiIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={SL} strokeWidth={1.8}/>
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={SL} strokeWidth={1.8} strokeLinecap="round"/>
      <Circle cx={9} cy={10} r={1} fill={SL}/>
      <Circle cx={15} cy={10} r={1} fill={SL}/>
    </Svg>
  );
}
function ComposeIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={P} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={P} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function BackArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Polyline points="15 18 9 12 15 6" stroke={SL} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function CheckDouble() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Polyline points="20 6 9 17 4 12" stroke={P} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <Polyline points="16 6 9 13" stroke={P} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

/* ══════════════════════════════════════════
   SCREEN
══════════════════════════════════════════ */
export default function ChatScreen() {
  const params            = useLocalSearchParams();
  const { token, userId, user } = useAuth();

  /* ── state ── */
  const [conversations,     setConversations]     = useState<Conversation[]>([]);
  const [convLoading,       setConvLoading]       = useState(true);
  const [activeConvId,      setActiveConvId]      = useState<number | null>(null);
  const [activeOtherUser,   setActiveOtherUser]   = useState<{ id: number; name: string } | null>(null);
  const [messages,          setMessages]          = useState<Message[]>([]);
  const [msgLoading,        setMsgLoading]        = useState(false);
  const [text,              setText]              = useState("");
  const [convSearch,        setConvSearch]        = useState("");
  const [convFilter,        setConvFilter]        = useState<"All" | "Unread" | "Groups">("All");

  const socketRef  = useRef<Socket | null>(null);
  const flatRef    = useRef<FlatList>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep a ref to active conv id so the socket handler always reads the latest
  const activeConvIdRef = useRef<number | null>(null);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  /* ── LOAD CONVERSATION LIST (silently refreshes without resetting UI) ── */
  const loadConversations = useCallback(async (showSpinner = false) => {
    if (!token) return;
    try {
      if (showSpinner) setConvLoading(true);
      const res  = await apiFetch("/api/chat/conversations", token);
      const data = await res.json();
      if (data.success) setConversations(data.conversations || []);
    } catch { /* silent */ }
    finally { if (showSpinner) setConvLoading(false); }
  }, [token]);

  /* ── PERSISTENT SOCKET — connects once, stays alive for the whole session ── */
  useEffect(() => {
    if (!userId || !token) return;

    const socket = io(API_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      // Join the personal user room so we receive messages from ALL conversations
      socket.emit("join-user", userId);
    });

    socket.on("new-message", (msg: Message) => {
      // If the incoming message belongs to the currently open conversation,
      // append it to the message list immediately
      if (msg.conversation_id === activeConvIdRef.current) {
        setMessages(prev =>
          prev.some(m => m.id === msg.id) ? prev : [...prev, msg]
        );
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
      }
      // Always refresh the conversation list so the preview + timestamp update
      loadConversations(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, token, loadConversations]);

  /* ── POLLING — refresh conversation list every 5 seconds ── */
  useFocusEffect(
    useCallback(() => {
      loadConversations(true);
      // Poll silently every 5s while on this screen
      pollRef.current = setInterval(() => loadConversations(false), 5000);
      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [loadConversations])
  );

  /* ── HANDLE INCOMING PARAMS (from student-profile "Message" button) ── */
  useEffect(() => {
    const targetId   = Number(params.userId);
    const targetName = String(params.name || "");
    if (!targetId || !userId || !token) return;
    openOrCreateConversation(targetId, targetName);
  }, [params.userId, userId, token]);

  /* ── OPEN OR CREATE A CONVERSATION ── */
  const openOrCreateConversation = async (otherUserId: number, otherName: string) => {
    if (!token || !userId) return;
    try {
      // Try to find existing conversation first
      const existing = conversations.find(c => c.other_user_id === otherUserId);
      if (existing) {
        selectConversation(existing.conversation_id, otherUserId, otherName);
        return;
      }
      // Create if not found
      const res  = await apiFetch("/api/chat/conversations", token, {
        method: "POST",
        body: JSON.stringify({ otherUserId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadConversations();
        selectConversation(data.conversationId, otherUserId, otherName);
      }
    } catch { /* silent */ }
  };

  /* ── SELECT A CONVERSATION ── */
  const selectConversation = async (convId: number, otherUserId: number, otherName: string) => {
    setActiveConvId(convId);
    activeConvIdRef.current = convId;
    setActiveOtherUser({ id: otherUserId, name: otherName });
    setMsgLoading(true);
    setMessages([]);

    try {
      const res  = await apiFetch(`/api/chat/conversations/${convId}/messages`, token);
      const data = await res.json();
      if (data.success) setMessages(data.messages || []);
    } catch { /* silent */ }
    finally {
      setMsgLoading(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100);
    }

    // Join this conversation room on the persistent socket so we can send messages
    // (receiving is handled by the user room — no need to rejoin for receiving)
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-conversation", { conversationId: convId, userId });
    }
  };

  /* ── SEND MESSAGE ── */
  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !activeConvId || !socketRef.current || !userId) return;
    socketRef.current.emit("send-message", {
      conversationId: activeConvId,
      senderId: userId,
      message: trimmed,
    });
    setText("");
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  /* ── FILTERED CONVERSATIONS ── */
  const filteredConvs = conversations.filter(c => {
    if (convSearch.trim()) {
      return c.other_user_name.toLowerCase().includes(convSearch.toLowerCase()) ||
             (c.last_message || "").toLowerCase().includes(convSearch.toLowerCase());
    }
    return true;
  });

  /* ── MESSAGE GROUPS ── */
  const messageGroups = groupByDate(messages);

  if (!fontsLoaded) return <View style={{ flex: 1 }}/>;

  const myInitials = user?.name ? getInitials(user.name) : "Me";

  return (
    <AppLayout scrollable={false}>
      <View style={g.chatRoot}>

        {/* ═══════════════════════════════════
            LEFT PANEL — Conversation list
        ═══════════════════════════════════ */}
        <View style={g.leftPanel}>
          {/* Header */}
          <View style={g.leftHeader}>
            <Text style={g.leftTitle}>Chat</Text>
            <Pressable style={g.composeBtn}>
              <ComposeIcon/>
            </Pressable>
          </View>

          {/* Search */}
          <View style={g.searchBar}>
            <SearchIcon/>
            <TextInput
              value={convSearch}
              onChangeText={setConvSearch}
              placeholder="Search conversations..."
              placeholderTextColor={SLL}
              style={g.searchInput}
            />
          </View>

          {/* Filter tabs */}
          <View style={g.filterTabs}>
            {(["All", "Unread", "Groups"] as const).map(tab => (
              <Pressable
                key={tab}
                style={[g.filterTab, convFilter === tab && g.filterTabActive]}
                onPress={() => setConvFilter(tab)}
              >
                <Text style={[g.filterTabTxt, convFilter === tab && g.filterTabTxtActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>

          {/* Conversation list */}
          {convLoading ? (
            <View style={g.convLoadBox}><ActivityIndicator color={P}/></View>
          ) : filteredConvs.length === 0 ? (
            <View style={g.convEmpty}>
              <Text style={g.convEmptyTxt}>No conversations yet.</Text>
              <Text style={g.convEmptyHint}>Go to a student's profile and tap Message to start chatting.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredConvs.map(conv => {
                const ac      = avColor(conv.other_user_id);
                const inits   = getInitials(conv.other_user_name);
                const active  = conv.conversation_id === activeConvId;
                return (
                  <Pressable
                    key={conv.conversation_id}
                    style={[g.convItem, active && g.convItemActive]}
                    onPress={() => selectConversation(conv.conversation_id, conv.other_user_id, conv.other_user_name)}
                  >
                    {/* Avatar */}
                    <View style={[g.convAvatar, { backgroundColor: ac.bg }]}>
                      <Text style={[g.convAvatarTxt, { color: ac.tx }]}>{inits}</Text>
                    </View>

                    {/* Info */}
                    <View style={g.convInfo}>
                      <View style={g.convInfoRow}>
                        <Text style={[g.convName, active && g.convNameActive]} numberOfLines={1}>
                          {conv.other_user_name}
                        </Text>
                        {conv.last_message_time && (
                          <Text style={g.convTime}>{fmtTime(conv.last_message_time)}</Text>
                        )}
                      </View>
                      <Text style={g.convLastMsg} numberOfLines={1}>
                        {conv.last_message || "Start a conversation"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ═══════════════════════════════════
            RIGHT PANEL — Active chat
        ═══════════════════════════════════ */}
        {activeOtherUser ? (
          <KeyboardAvoidingView
            style={g.rightPanel}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* Chat header */}
            <View style={g.chatHeader}>
              <Pressable style={g.chatBackBtn} onPress={() => { setActiveConvId(null); setActiveOtherUser(null); activeConvIdRef.current = null; }}>
                <BackArrow/>
              </Pressable>
              <View style={[g.chatHeaderAvatar, { backgroundColor: avColor(activeOtherUser.id).bg }]}>
                <Text style={[g.chatHeaderAvatarTxt, { color: avColor(activeOtherUser.id).tx }]}>
                  {getInitials(activeOtherUser.name)}
                </Text>
              </View>
              <View style={g.chatHeaderInfo}>
                <Text style={g.chatHeaderName}>{activeOtherUser.name}</Text>
                <View style={g.onlineRow}>
                  <View style={g.onlineDot}/>
                  <Text style={g.onlineTxt}>Online</Text>
                </View>
              </View>
            </View>

            {/* Messages */}
            {msgLoading ? (
              <View style={g.msgLoadBox}><ActivityIndicator size="large" color={P}/></View>
            ) : (
              <FlatList
                ref={flatRef}
                data={messageGroups}
                keyExtractor={(_, i) => String(i)}
                onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
                contentContainerStyle={g.msgListContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={g.msgEmpty}>
                    <Text style={g.msgEmptyTitle}>Say hello 👋</Text>
                    <Text style={g.msgEmptyTxt}>Start the conversation with {activeOtherUser.name}.</Text>
                  </View>
                }
                renderItem={({ item: group }) => (
                  <View>
                    {/* Date divider */}
                    <View style={g.dateDivider}>
                      <View style={g.dateDividerLine}/>
                      <Text style={g.dateDividerTxt}>{group.label}</Text>
                      <View style={g.dateDividerLine}/>
                    </View>

                    {/* Messages in group */}
                    {group.messages.map(msg => {
                      const mine = msg.sender_id === userId;
                      const ac   = avColor(msg.sender_id);
                      return (
                        <View key={msg.id} style={[g.msgRow, mine ? g.msgRowRight : g.msgRowLeft]}>
                          {/* Other person avatar */}
                          {!mine && (
                            <View style={[g.msgAvatar, { backgroundColor: ac.bg }]}>
                              <Text style={[g.msgAvatarTxt, { color: ac.tx }]}>
                                {getInitials(msg.sender_name || activeOtherUser.name)}
                              </Text>
                            </View>
                          )}

                          {/* Bubble */}
                          <View style={[g.bubble, mine ? g.myBubble : g.otherBubble]}>
                            <Text style={[g.bubbleTxt, mine ? g.myBubbleTxt : g.otherBubbleTxt]}>
                              {msg.message}
                            </Text>
                            <View style={g.bubbleFooter}>
                              <Text style={[g.bubbleTime, mine ? g.myBubbleTime : g.otherBubbleTime]}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </Text>
                              {mine && <CheckDouble/>}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              />
            )}

            {/* Input bar */}
            <View style={g.inputBar}>
              <Pressable style={g.inputActionBtn}>
                <AttachIcon/>
              </Pressable>

              <View style={g.inputWrap}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Type a message..."
                  placeholderTextColor={SLL}
                  style={g.input}
                  multiline
                  onSubmitEditing={sendMessage}
                />
              </View>

              <Pressable style={g.inputActionBtn}>
                <EmojiIcon/>
              </Pressable>

              <Pressable
                style={[g.sendBtn, !text.trim() && g.sendBtnDis]}
                onPress={sendMessage}
                disabled={!text.trim()}
              >
                <SendIcon/>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        ) : (
          /* ── EMPTY STATE — no conversation selected ── */
          <View style={g.noChat}>
            <View style={g.noChatIcon}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Path d="M4 5h16v11H8l-4 4V5z" stroke={P} strokeWidth={1.5} strokeLinejoin="round" fill={PS}/>
              </Svg>
            </View>
            <Text style={g.noChatTitle}>Your Messages</Text>
            <Text style={g.noChatTxt}>
              Select a conversation from the left, or go to a student's profile and tap Message to start chatting.
            </Text>
          </View>
        )}
      </View>
    </AppLayout>
  );
}

/* ── STYLES ──────────────────────────────── */
const g = StyleSheet.create({
  chatRoot: { flex: 1, flexDirection: "row", backgroundColor: WH, borderRadius: 16, borderWidth: 1, borderColor: BD, overflow: "hidden", minHeight: 560 },

  /* LEFT PANEL */
  leftPanel: { width: 300, borderRightWidth: 1, borderRightColor: BD, flexDirection: "column" },
  leftHeader:{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: BD },
  leftTitle: { fontFamily: F.x, fontSize: 18, color: NV },
  composeBtn:{ width: 34, height: 34, borderRadius: 9, borderWidth: 1, borderColor: BD, alignItems: "center", justifyContent: "center" },

  searchBar:  { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 14, marginVertical: 10, height: 38, backgroundColor: BG, borderRadius: 9, paddingHorizontal: 12 },
  searchInput:{ flex: 1, fontFamily: F.r, fontSize: 13, color: NV, outlineStyle: "none" as any },

  filterTabs:      { flexDirection: "row", paddingHorizontal: 14, gap: 6, marginBottom: 8 },
  filterTab:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: BG },
  filterTabActive: { backgroundColor: P },
  filterTabTxt:    { fontFamily: F.s, fontSize: 12.5, color: SL },
  filterTabTxtActive: { color: WH },

  convLoadBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  convEmpty:   { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  convEmptyTxt:{ fontFamily: F.b, fontSize: 14, color: NV, textAlign: "center" },
  convEmptyHint:{ fontFamily: F.r, fontSize: 12, color: SL, textAlign: "center", marginTop: 8, lineHeight: 18 },

  convItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10, marginHorizontal: 6 },
  convItemActive: { backgroundColor: PS },
  convAvatar:    { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  convAvatarTxt: { fontFamily: F.b, fontSize: 15 },
  convInfo:      { flex: 1, minWidth: 0 },
  convInfoRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  convName:      { fontFamily: F.b, fontSize: 13.5, color: NV, flex: 1 },
  convNameActive:{ color: P },
  convTime:      { fontFamily: F.r, fontSize: 11, color: SLL, marginLeft: 6, flexShrink: 0 },
  convLastMsg:   { fontFamily: F.r, fontSize: 12, color: SL, marginTop: 2 },

  /* RIGHT PANEL */
  rightPanel: { flex: 1, flexDirection: "column" },

  /* Chat header */
  chatHeader:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BD },
  chatBackBtn:      { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  chatHeaderAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  chatHeaderAvatarTxt:{ fontFamily: F.b, fontSize: 15 },
  chatHeaderInfo:   { flex: 1 },
  chatHeaderName:   { fontFamily: F.b, fontSize: 15, color: NV },
  onlineRow:        { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: GR },
  onlineTxt:        { fontFamily: F.r, fontSize: 11.5, color: GR },

  /* Messages */
  msgLoadBox:     { flex: 1, justifyContent: "center", alignItems: "center" },
  msgListContent: { padding: 20, flexGrow: 1 },
  msgEmpty:       { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  msgEmptyTitle:  { fontFamily: F.b, fontSize: 17, color: NV, marginBottom: 8 },
  msgEmptyTxt:    { fontFamily: F.r, fontSize: 13, color: SL, textAlign: "center" },

  /* Date divider */
  dateDivider:    { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 16 },
  dateDividerLine:{ flex: 1, height: 1, backgroundColor: BD },
  dateDividerTxt: { fontFamily: F.s, fontSize: 11.5, color: SLL },

  /* Message rows */
  msgRow:       { flexDirection: "row", marginBottom: 6, alignItems: "flex-end", gap: 8 },
  msgRowLeft:   { justifyContent: "flex-start" },
  msgRowRight:  { justifyContent: "flex-end" },
  msgAvatar:    { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 4 },
  msgAvatarTxt: { fontFamily: F.b, fontSize: 12 },

  /* Bubbles */
  bubble:        { maxWidth: "62%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  myBubble:      { backgroundColor: "#E8F0FE", borderBottomRightRadius: 4 },
  otherBubble:   { backgroundColor: WH, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: BD },
  bubbleTxt:     { fontFamily: F.m, fontSize: 14, lineHeight: 20 },
  myBubbleTxt:   { color: NV },
  otherBubbleTxt:{ color: NV },
  bubbleFooter:  { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 5 },
  bubbleTime:    { fontFamily: F.r, fontSize: 10.5 },
  myBubbleTime:  { color: SL },
  otherBubbleTime:{ color: SLL },

  /* Input bar */
  inputBar:      { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: BD, gap: 10, backgroundColor: WH },
  inputActionBtn:{ width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  inputWrap:     { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: BG, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8, justifyContent: "center" },
  input:         { fontFamily: F.r, fontSize: 14, color: NV, outlineStyle: "none" as any },
  sendBtn:       { width: 44, height: 44, borderRadius: 22, backgroundColor: P, alignItems: "center", justifyContent: "center" },
  sendBtnDis:    { opacity: 0.4 },

  /* No chat selected */
  noChat:      { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  noChatIcon:  { width: 80, height: 80, borderRadius: 40, backgroundColor: PS, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  noChatTitle: { fontFamily: F.b, fontSize: 18, color: NV, marginBottom: 8 },
  noChatTxt:   { fontFamily: F.r, fontSize: 13, color: SL, textAlign: "center", maxWidth: 340, lineHeight: 20 },
});
