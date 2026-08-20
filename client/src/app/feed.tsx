import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, Alert, Pressable,
  RefreshControl, ScrollView, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Post = {
  id: number; content: string; image_url: string | null;
  created_at: string; updated_at: string;
  user_id: number; user_name: string; user_email: string;
  college: string; department: string; avatar_url: string | null;
  like_count: number; comment_count: number;
};

type Comment = {
  id: number; comment: string; created_at: string;
  user_id: number; user_name: string; avatar_url: string | null;
};

export default function FeedScreen() {
  const { token, userId, user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [postText, setPostText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<number | null>(null);

  // ============================================
  // LOAD FEED
  // ============================================

  const loadFeed = async () => {
    try {
      const res = await apiFetch("/api/feed", token);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load feed");
      setPosts(data.posts || []);
    } catch (error) {
      Alert.alert("Feed Error", "Could not load the feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadFeed(); }, [token]));

  const handleRefresh = () => { setRefreshing(true); loadFeed(); };

  // ============================================
  // CREATE POST
  // ============================================

  const createPost = async () => {
    const content = postText.trim();
    if (!content) { Alert.alert("Empty post", "Please write something before posting."); return; }
    if (!userId || !token) return;

    try {
      setPosting(true);
      const res = await apiFetch("/api/feed", token, {
        method: "POST",
        body: JSON.stringify({ userId, content }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create post");
      setPostText("");
      await loadFeed();
    } catch (error) {
      Alert.alert("Post Failed", error instanceof Error ? error.message : "Could not create post.");
    } finally {
      setPosting(false);
    }
  };

  // ============================================
  // LIKE / UNLIKE
  // ============================================

  const toggleLike = async (post: Post) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/api/feed/${post.id}/like`, token, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to like post");

      setLikedPosts(prev => data.liked ? [...prev, post.id] : prev.filter(id => id !== post.id));
      setPosts(prev => prev.map(item =>
        item.id === post.id ? { ...item, like_count: item.like_count + (data.liked ? 1 : -1) } : item
      ));
    } catch (error) {
      Alert.alert("Error", "Could not update like.");
    }
  };

  // ============================================
  // COMMENTS
  // ============================================

  const loadComments = async (postId: number) => {
    try {
      setCommentLoading(postId);
      const res = await apiFetch(`/api/feed/${postId}/comments`, token);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setComments(prev => ({ ...prev, [postId]: data.comments || [] }));
    } catch (error) {
      Alert.alert("Error", "Could not load comments.");
    } finally {
      setCommentLoading(null);
    }
  };

  const toggleComments = async (postId: number) => {
    const isExpanded = expandedComments.includes(postId);
    if (isExpanded) {
      setExpandedComments(prev => prev.filter(id => id !== postId));
      return;
    }
    setExpandedComments(prev => [...prev, postId]);
    await loadComments(postId);
  };

  const addComment = async (postId: number) => {
    const text = commentText[postId]?.trim() || "";
    if (!text || !token) return;

    try {
      setCommentLoading(postId);
      const res = await apiFetch(`/api/feed/${postId}/comments`, token, {
        method: "POST",
        body: JSON.stringify({ comment: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setCommentText(prev => ({ ...prev, [postId]: "" }));
      await loadComments(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p));
    } catch (error) {
      Alert.alert("Error", "Could not add comment.");
    } finally {
      setCommentLoading(null);
    }
  };

  // ============================================
  // DELETE POST
  // ============================================

  const deletePost = (postId: number) => {
    Alert.alert("Delete post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            const res = await apiFetch(`/api/feed/${postId}`, token, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message);
            setPosts(prev => prev.filter(p => p.id !== postId));
          } catch (error) {
            Alert.alert("Error", "Could not delete post.");
          }
        },
      },
    ]);
  };

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getInitial = (name: string) => name?.trim()?.charAt(0)?.toUpperCase() || "S";
  const myInitial = user?.name ? getInitial(user.name) : "S";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading SkillVerse Feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SkillVerse</Text>
          <Text style={styles.headerSubtitle}>Student Community</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshIcon}>↻</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* CREATE POST */}
        <View style={styles.createCard}>
          <View style={styles.createHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{myInitial}</Text>
            </View>
            <Text style={styles.createTitle}>What's happening?</Text>
          </View>
          <TextInput
            value={postText}
            onChangeText={setPostText}
            placeholder="Share your learning journey, project, achievement..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            style={styles.postInput}
          />
          <View style={styles.createFooter}>
            <Text style={styles.characterCount}>{postText.length} characters</Text>
            <Pressable
              style={[styles.postButton, (!postText.trim() || posting) && styles.postButtonDisabled]}
              onPress={createPost}
              disabled={!postText.trim() || posting}
            >
              {posting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.postButtonText}>Post</Text>}
            </Pressable>
          </View>
        </View>

        {/* FEED */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Community Feed</Text>
          <Text style={styles.feedCount}>{posts.length} {posts.length === 1 ? "post" : "posts"}</Text>
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>Be the first student to share something with the community.</Text>
          </View>
        ) : (
          posts.map(post => {
            const isLiked = likedPosts.includes(post.id);
            const isCommentsExpanded = expandedComments.includes(post.id);
            const postComments = comments[post.id] || [];

            return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.postUser}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitial(post.user_name)}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Pressable onPress={() => router.push(`/student-profile?id=${post.user_id}`)}>
                        <Text style={styles.userName}>{post.user_name}</Text>
                      </Pressable>
                      <Text style={styles.userDetails}>{post.college}</Text>
                      <Text style={styles.postTime}>{formatDate(post.created_at)}</Text>
                    </View>
                  </View>
                  {post.user_id === userId && (
                    <Pressable onPress={() => deletePost(post.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteText}>•••</Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                <View style={styles.actionRow}>
                  <Pressable style={styles.actionButton} onPress={() => toggleLike(post)}>
                    <Text style={[styles.actionIcon, isLiked && styles.likedIcon]}>{isLiked ? "♥" : "♡"}</Text>
                    <Text style={[styles.actionText, isLiked && styles.likedText]}>{post.like_count}</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => toggleComments(post.id)}>
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionText}>{post.comment_count}</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <Text style={styles.actionIcon}>↗</Text>
                    <Text style={styles.actionText}>Share</Text>
                  </Pressable>
                </View>

                {isCommentsExpanded && (
                  <View style={styles.commentsSection}>
                    <View style={styles.commentInputRow}>
                      <TextInput
                        value={commentText[post.id] || ""}
                        onChangeText={text => setCommentText(prev => ({ ...prev, [post.id]: text }))}
                        placeholder="Write a comment..."
                        placeholderTextColor="#94A3B8"
                        style={styles.commentInput}
                      />
                      <Pressable
                        style={styles.commentSendButton}
                        onPress={() => addComment(post.id)}
                        disabled={commentLoading === post.id}
                      >
                        {commentLoading === post.id
                          ? <ActivityIndicator size="small" color="#FFFFFF" />
                          : <Text style={styles.commentSendText}>→</Text>
                        }
                      </Pressable>
                    </View>

                    {postComments.length === 0 ? (
                      <Text style={styles.noComments}>No comments yet. Be the first!</Text>
                    ) : (
                      postComments.map(comment => (
                        <View key={comment.id} style={styles.comment}>
                          <View style={styles.smallAvatar}>
                            <Text style={styles.smallAvatarText}>{getInitial(comment.user_name)}</Text>
                          </View>
                          <View style={styles.commentBody}>
                            <Text style={styles.commentUser}>{comment.user_name}</Text>
                            <Text style={styles.commentText}>{comment.comment}</Text>
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
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#64748B" },
  header: { height: 76, paddingHorizontal: 24, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  headerSubtitle: { marginTop: 2, fontSize: 12, color: "#64748B" },
  refreshButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
  refreshIcon: { fontSize: 24, color: "#2563EB" },
  scroll: { flex: 1 },
  scrollContent: { width: "100%", maxWidth: 850, alignSelf: "center", padding: 24, paddingBottom: 60 },
  createCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, padding: 20, marginBottom: 24 },
  createHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  createTitle: { marginLeft: 12, fontSize: 15, fontWeight: "700", color: "#334155" },
  postInput: { minHeight: 100, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 14, fontSize: 14, color: "#111827", backgroundColor: "#F8FAFC" },
  createFooter: { marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  characterCount: { fontSize: 11, color: "#94A3B8" },
  postButton: { minWidth: 90, height: 42, paddingHorizontal: 20, borderRadius: 10, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  postButtonDisabled: { opacity: 0.45 },
  postButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  feedHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  feedTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  feedCount: { fontSize: 12, color: "#64748B" },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", padding: 40, alignItems: "center" },
  emptyIcon: { fontSize: 35, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  emptyText: { marginTop: 8, maxWidth: 400, fontSize: 13, lineHeight: 20, color: "#64748B", textAlign: "center" },
  postCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, padding: 20, marginBottom: 16 },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  postUser: { flexDirection: "row", flex: 1 },
  userInfo: { marginLeft: 11, flex: 1 },
  userName: { fontSize: 14, fontWeight: "800", color: "#111827" },
  userDetails: { marginTop: 2, fontSize: 11, color: "#64748B" },
  postTime: { marginTop: 2, fontSize: 10, color: "#94A3B8" },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 16, color: "#64748B" },
  postContent: { marginTop: 18, fontSize: 14, lineHeight: 22, color: "#334155" },
  actionRow: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#F1F5F9", flexDirection: "row", alignItems: "center" },
  actionButton: { flexDirection: "row", alignItems: "center", marginRight: 25 },
  actionIcon: { fontSize: 19, color: "#64748B" },
  likedIcon: { color: "#EF4444" },
  actionText: { marginLeft: 6, fontSize: 12, fontWeight: "600", color: "#64748B" },
  likedText: { color: "#EF4444" },
  commentsSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  commentInputRow: { flexDirection: "row", alignItems: "center" },
  commentInput: { flex: 1, height: 42, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 12, fontSize: 13, color: "#111827", backgroundColor: "#F8FAFC" },
  commentSendButton: { width: 42, height: 42, marginLeft: 8, borderRadius: 10, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  commentSendText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  noComments: { marginTop: 15, fontSize: 12, color: "#94A3B8", textAlign: "center" },
  comment: { marginTop: 14, flexDirection: "row" },
  smallAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" },
  smallAvatarText: { color: "#2563EB", fontSize: 12, fontWeight: "800" },
  commentBody: { flex: 1, marginLeft: 10, backgroundColor: "#F8FAFC", borderRadius: 10, padding: 10 },
  commentUser: { fontSize: 12, fontWeight: "800", color: "#334155" },
  commentText: { marginTop: 3, fontSize: 12, lineHeight: 18, color: "#475569" },
  bottomSpace: { height: 30 },
});
