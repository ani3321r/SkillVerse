import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, Pressable,
  TextInput, ActivityIndicator, Alert,
  RefreshControl, ScrollView,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import AppLayout from "../components/app-layout";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Post = {
  id: number; content: string; image_url: string | null;
  created_at: string; user_id: number; user_name: string;
  college: string; department: string; avatar_url: string | null;
  like_count: number; comment_count: number;
};

type Comment = {
  id: number; comment: string; created_at: string;
  user_id: number; user_name: string; avatar_url: string | null;
};

function fmt(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

function getInitial(name: string) { return name?.trim()?.charAt(0)?.toUpperCase() || "S"; }

export default function FeedScreen() {
  const { token, userId, user } = useAuth();

  const [posts,    setPosts]    = useState<Post[]>([]);
  const [postText, setPostText] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting,  setPosting]  = useState(false);

  const [likedPosts,        setLikedPosts]        = useState<number[]>([]);
  const [expandedComments,  setExpandedComments]  = useState<number[]>([]);
  const [comments,          setComments]          = useState<Record<number, Comment[]>>({});
  const [commentText,       setCommentText]       = useState<Record<number, string>>({});
  const [commentLoading,    setCommentLoading]    = useState<number | null>(null);

  /* ── LOAD FEED ── */
  const loadFeed = useCallback(async () => {
    try {
      const res  = await apiFetch("/api/feed", token);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setPosts(data.posts || []);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useFocusEffect(useCallback(() => { loadFeed(); }, [loadFeed]));

  /* ── CREATE POST ── */
  const createPost = async () => {
    const content = postText.trim();
    if (!content) { Alert.alert("Empty post", "Please write something."); return; }
    if (!userId || !token) return;
    try {
      setPosting(true);
      const res  = await apiFetch("/api/feed", token, {
        method: "POST",
        body: JSON.stringify({ userId, content }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setPostText("");
      await loadFeed();
    } catch (error) {
      Alert.alert("Post Failed", error instanceof Error ? error.message : "Could not create post.");
    } finally { setPosting(false); }
  };

  /* ── LIKE ── */
  const toggleLike = async (post: Post) => {
    if (!token) return;
    try {
      const res  = await apiFetch(`/api/feed/${post.id}/like`, token, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      setLikedPosts(prev => data.liked ? [...prev, post.id] : prev.filter(id => id !== post.id));
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, like_count: p.like_count + (data.liked ? 1 : -1) } : p));
    } catch { /* silent */ }
  };

  /* ── COMMENTS ── */
  const loadComments = async (postId: number) => {
    setCommentLoading(postId);
    try {
      const res  = await apiFetch(`/api/feed/${postId}/comments`, token);
      const data = await res.json();
      if (data.success) setComments(prev => ({ ...prev, [postId]: data.comments || [] }));
    } catch { /* silent */ }
    finally { setCommentLoading(null); }
  };

  const toggleComments = async (postId: number) => {
    const expanded = expandedComments.includes(postId);
    if (expanded) { setExpandedComments(prev => prev.filter(id => id !== postId)); return; }
    setExpandedComments(prev => [...prev, postId]);
    await loadComments(postId);
  };

  const addComment = async (postId: number) => {
    const text = commentText[postId]?.trim() || "";
    if (!text || !token) return;
    setCommentLoading(postId);
    try {
      const res  = await apiFetch(`/api/feed/${postId}/comments`, token, {
        method: "POST",
        body: JSON.stringify({ comment: text }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentText(prev => ({ ...prev, [postId]: "" }));
        await loadComments(postId);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p));
      }
    } catch { /* silent */ }
    finally { setCommentLoading(null); }
  };

  /* ── DELETE ── */
  const deletePost = (postId: number) => {
    Alert.alert("Delete post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          const res  = await apiFetch(`/api/feed/${postId}`, token, { method: "DELETE" });
          const data = await res.json();
          if (data.success) setPosts(prev => prev.filter(p => p.id !== postId));
        } catch { Alert.alert("Error", "Could not delete post."); }
      }},
    ]);
  };

  const myInitial = user?.name ? getInitial(user.name) : "S";

  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={s.title}>Community Feed</Text>
        <Text style={s.subtitle}>Share your learning journey with the SkillVerse community.</Text>
      </View>

      {/* Composer */}
      <View style={s.composeCard}>
        <View style={s.composeRow}>
          <View style={s.avatar}><Text style={s.avatarTxt}>{myInitial}</Text></View>
          <TextInput
            value={postText}
            onChangeText={setPostText}
            placeholder="Share your learning journey, project, achievement..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            style={s.composeInput}
          />
        </View>
        <View style={s.composeFooter}>
          <Text style={s.charCount}>{postText.length} characters</Text>
          <Pressable
            style={[s.postBtn, (!postText.trim() || posting) && s.postBtnDis]}
            onPress={createPost}
            disabled={!postText.trim() || posting}
          >
            {posting ? <ActivityIndicator size="small" color="#FFFFFF"/> : <Text style={s.postBtnTxt}>Post</Text>}
          </Pressable>
        </View>
      </View>

      {/* Feed header */}
      <View style={s.feedHead}>
        <Text style={s.feedTitle}>Posts</Text>
        <Pressable onPress={() => { setRefreshing(true); loadFeed(); }}>
          <Text style={s.refreshTxt}>↻ Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={s.loadBox}><ActivityIndicator size="large" color="#1456F0"/></View>
      ) : posts.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyTitle}>No posts yet</Text>
          <Text style={s.emptyTxt}>Be the first student to share something with the community.</Text>
        </View>
      ) : (
        posts.map(post => {
          const isLiked    = likedPosts.includes(post.id);
          const isExpanded = expandedComments.includes(post.id);
          const postComments = comments[post.id] || [];

          return (
            <View key={post.id} style={s.postCard}>
              <View style={s.postHead}>
                <View style={s.postAvatarWrap}>
                  <View style={s.postAvatar}><Text style={s.postAvatarTxt}>{getInitial(post.user_name)}</Text></View>
                  <View style={s.postUserInfo}>
                    <Pressable onPress={() => router.push(`/student-profile?id=${post.user_id}` as any)}>
                      <Text style={s.postUserName}>{post.user_name}</Text>
                    </Pressable>
                    <Text style={s.postMeta}>{post.college} · {fmt(post.created_at)}</Text>
                  </View>
                </View>
                {post.user_id === userId && (
                  <Pressable onPress={() => deletePost(post.id)} style={s.dotsBtn}>
                    <Text style={s.dotsTxt}>•••</Text>
                  </Pressable>
                )}
              </View>

              <Text style={s.postContent}>{post.content}</Text>

              <View style={s.actionsRow}>
                <Pressable style={s.actionBtn} onPress={() => toggleLike(post)}>
                  <Text style={[s.actionIcon, isLiked && s.likedIcon]}>{isLiked ? "♥" : "♡"}</Text>
                  <Text style={[s.actionTxt, isLiked && s.likedTxt]}>{post.like_count}</Text>
                </Pressable>
                <Pressable style={s.actionBtn} onPress={() => toggleComments(post.id)}>
                  <Text style={s.actionIcon}>💬</Text>
                  <Text style={s.actionTxt}>{post.comment_count}</Text>
                </Pressable>
                <Pressable style={s.actionBtn}>
                  <Text style={s.actionIcon}>↗</Text>
                  <Text style={s.actionTxt}>Share</Text>
                </Pressable>
              </View>

              {isExpanded && (
                <View style={s.commentsSection}>
                  <View style={s.commentInputRow}>
                    <TextInput
                      value={commentText[post.id] || ""}
                      onChangeText={text => setCommentText(prev => ({ ...prev, [post.id]: text }))}
                      placeholder="Write a comment..."
                      placeholderTextColor="#94A3B8"
                      style={s.commentInput}
                    />
                    <Pressable style={s.commentSendBtn} onPress={() => addComment(post.id)} disabled={commentLoading === post.id}>
                      {commentLoading === post.id
                        ? <ActivityIndicator size="small" color="#FFFFFF"/>
                        : <Text style={s.commentSendTxt}>→</Text>
                      }
                    </Pressable>
                  </View>
                  {postComments.length === 0 ? (
                    <Text style={s.noComments}>No comments yet. Be the first!</Text>
                  ) : (
                    postComments.map(c => (
                      <View key={c.id} style={s.comment}>
                        <View style={s.commentAvatar}><Text style={s.commentAvatarTxt}>{getInitial(c.user_name)}</Text></View>
                        <View style={s.commentBody}>
                          <Text style={s.commentUser}>{c.user_name}</Text>
                          <Text style={s.commentText}>{c.comment}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </AppLayout>
  );
}

const s = StyleSheet.create({
  header:        { marginBottom: 22 },
  title:         { fontSize: 28, fontWeight: "800", color: "#0B1D3C" },
  subtitle:      { marginTop: 6, fontSize: 14, color: "#64748B" },
  composeCard:   { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 16, padding: 18, marginBottom: 18, maxWidth: 860 },
  composeRow:    { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar:        { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1456F0", alignItems: "center", justifyContent: "center" },
  avatarTxt:     { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  composeInput:  { flex: 1, minHeight: 80, borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 10, padding: 12, fontSize: 13, color: "#111827", backgroundColor: "#F8FAFC" },
  composeFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  charCount:     { fontSize: 11, color: "#94A3B8" },
  postBtn:       { minWidth: 80, height: 38, paddingHorizontal: 18, borderRadius: 9, backgroundColor: "#1456F0", alignItems: "center", justifyContent: "center" },
  postBtnDis:    { opacity: 0.45 },
  postBtnTxt:    { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  feedHead:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14, maxWidth: 860 },
  feedTitle:     { fontSize: 17, fontWeight: "800", color: "#0B1D3C" },
  refreshTxt:    { color: "#1456F0", fontWeight: "700", fontSize: 13 },
  loadBox:       { paddingVertical: 50, alignItems: "center" },
  emptyCard:     { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E8ECF2", padding: 36, alignItems: "center", maxWidth: 860 },
  emptyTitle:    { fontSize: 17, fontWeight: "800", color: "#0B1D3C" },
  emptyTxt:      { marginTop: 8, fontSize: 13, color: "#64748B", textAlign: "center", maxWidth: 360 },
  postCard:      { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 16, padding: 18, marginBottom: 14, maxWidth: 860 },
  postHead:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  postAvatarWrap:{ flexDirection: "row", flex: 1 },
  postAvatar:    { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EAF0FE", alignItems: "center", justifyContent: "center" },
  postAvatarTxt: { color: "#1456F0", fontSize: 15, fontWeight: "800" },
  postUserInfo:  { marginLeft: 10, flex: 1 },
  postUserName:  { fontSize: 13, fontWeight: "800", color: "#111827" },
  postMeta:      { marginTop: 2, fontSize: 11, color: "#64748B" },
  dotsBtn:       { padding: 6 },
  dotsTxt:       { fontSize: 14, color: "#64748B" },
  postContent:   { marginTop: 14, fontSize: 13.5, lineHeight: 21, color: "#334155" },
  actionsRow:    { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", flexDirection: "row", alignItems: "center" },
  actionBtn:     { flexDirection: "row", alignItems: "center", marginRight: 22 },
  actionIcon:    { fontSize: 17, color: "#64748B" },
  likedIcon:     { color: "#EF4444" },
  actionTxt:     { marginLeft: 5, fontSize: 12, fontWeight: "600", color: "#64748B" },
  likedTxt:      { color: "#EF4444" },
  commentsSection: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  commentInputRow: { flexDirection: "row", alignItems: "center" },
  commentInput:  { flex: 1, height: 40, borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 9, paddingHorizontal: 11, fontSize: 12.5, color: "#111827", backgroundColor: "#F8FAFC" },
  commentSendBtn:{ width: 40, height: 40, marginLeft: 8, borderRadius: 9, backgroundColor: "#1456F0", alignItems: "center", justifyContent: "center" },
  commentSendTxt:{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  noComments:    { marginTop: 12, fontSize: 12, color: "#94A3B8", textAlign: "center" },
  comment:       { marginTop: 12, flexDirection: "row" },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#EAF0FE", alignItems: "center", justifyContent: "center" },
  commentAvatarTxt:{ color: "#1456F0", fontSize: 12, fontWeight: "800" },
  commentBody:   { flex: 1, marginLeft: 8, backgroundColor: "#F8FAFC", borderRadius: 9, padding: 9 },
  commentUser:   { fontSize: 11, fontWeight: "800", color: "#334155" },
  commentText:   { marginTop: 2, fontSize: 11, lineHeight: 17, color: "#475569" },
});
