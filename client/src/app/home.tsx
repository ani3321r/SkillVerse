import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import SidebarNav from "../components/sidebar-nav";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

/* ---------------------------------------------------------
   TOKENS
--------------------------------------------------------- */
const FONT = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
};

const COLORS = {
  primary: "#1456F0",
  primarySoft: "#EAF0FE",
  navy: "#0B1D3C",
  slate: "#64748B",
  slateDark: "#334155",
  border: "#EDEFF3",
  bg: "#F5F7FB",
  card: "#FFFFFF",
  green: "#16A34A",
  greenSoft: "#E7F8ED",
  purple: "#7C3AED",
  purpleSoft: "#F1EAFE",
  orange: "#F59E0B",
  orangeSoft: "#FEF1DD",
  red: "#EF4444",
};

/* ---------------------------------------------------------
   ICONS
--------------------------------------------------------- */
function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 40 44" fill="none">
      <Path d="M20 1 L38 11.5 V32.5 L20 43 L2 32.5 V11.5 Z" fill={COLORS.primary} />
      <Path d="M20 1 L38 11.5 L20 22 L2 11.5 Z" fill="#3B76FF" />
    </Svg>
  );
}
function IconSearch({ size = 18, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={2} />
      <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconPlus({ size = 16, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={12} y1={5} x2={12} y2={19} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Line x1={5} y1={12} x2={19} y2={12} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}
function IconBell({ size = 20, color = COLORS.slateDark }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconChatBubble({ size = 20, color = COLORS.slateDark }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5h16v11H8l-4 4V5z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}
function IconChevronDown({ size = 14, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="6 9 12 15 18 9" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconLink({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.3-1.3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconHash({ size = 14, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={9} y1={4} x2={7} y2={20} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={17} y1={4} x2={15} y2={20} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4} y1={9} x2={20} y2={9} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={3} y1={15} x2={19} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconThumbsUp({ size = 16, color = COLORS.slate, filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm0 0 4.5-7a1.5 1.5 0 0 1 2.7.3L15 8h4a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 16.7 19H10a3 3 0 0 1-3-3v-5z"
        stroke={filled ? COLORS.primary : color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill={filled ? COLORS.primary : "none"}
      />
    </Svg>
  );
}
function IconComment({ size = 16, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5h16v11H8l-4 4V5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}
function IconShare({ size = 16, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m3 12 18-8-8 18-2-8-8-2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}
function IconBookmarkOutline({ size = 18, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4h12v17l-6-4-6 4V4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}
function IconDots({ size = 18, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={5} cy={12} r={1.6} fill={color} />
      <Circle cx={12} cy={12} r={1.6} fill={color} />
      <Circle cx={19} cy={12} r={1.6} fill={color} />
    </Svg>
  );
}
function IconX({ size = 14, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconTextT({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 5h14M12 5v14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}
function IconUsersSmall({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
function IconTarget({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={0.8} fill={color} />
    </Svg>
  );
}
function IconRefresh({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Polyline points="21 3 21 8 16 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Polyline points="3 21 3 16 8 16" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */
type Post = {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: number;
  user_name: string;
  college: string;
  department: string;
  avatar_url: string | null;
  like_count: number;
  comment_count: number;
};

type Comment = {
  id: number;
  comment: string;
  created_at: string;
  user_id: number;
  user_name: string;
  avatar_url: string | null;
};

type UserSkill = {
  skill_id: number;
  name: string;
  progress: number;
  score: number;
  level: string;
  assignments_completed: number;
};

/* ---------------------------------------------------------
   STATIC RIGHT-RAIL DATA
--------------------------------------------------------- */
const TABS = ["All", "Discussions", "Projects", "Announcements", "Events"];

const TRENDING = [
  { tag: "WebDevelopment", count: "12.1K posts" },
  { tag: "MachineLearning", count: "8.7K posts" },
  { tag: "ReactJS", count: "7.3K posts" },
  { tag: "Hackathon", count: "6.2K posts" },
  { tag: "OpenSource", count: "5.1K posts" },
];

const QUICK_LINKS = [
  { label: "Find Study Groups", Icon: IconUsersSmall, route: "/students" },
  { label: "Explore Students", Icon: IconTarget, route: "/explore" },
  { label: "Browse Skills", Icon: IconRefresh, route: "/skills" },
];

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */
function getInitial(name: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "S";
}

function formatDate(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/** Derive a display level + XP from the user's skills list. */
function deriveXpStats(skills: UserSkill[]) {
  if (!skills.length) return { level: 1, levelLabel: "Newcomer", xp: 0, xpMax: 500 };

  const totalCompleted = skills.reduce((s, sk) => s + sk.assignments_completed, 0);
  const avgProgress = Math.round(skills.reduce((s, sk) => s + sk.progress, 0) / skills.length);

  // Each assignment = 100 XP
  const xp = totalCompleted * 100 + avgProgress;
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const xpInLevel = xp % 500;
  const xpMax = 500;

  const labels = ["Newcomer", "Explorer", "Learner", "Builder", "Developer", "Expert", "Master"];
  const levelLabel = labels[Math.min(level - 1, labels.length - 1)];

  return { level, levelLabel, xp: xpInLevel, xpMax };
}

/* ---------------------------------------------------------
   SCREEN
--------------------------------------------------------- */
export default function HomeScreen() {
  const { token, userId, user } = useAuth();

  const [activeTab, setActiveTab] = useState("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // composer
  const [composerOpen, setComposerOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // likes / comments
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<number | null>(null);

  // skills (for XP card)
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // ============================================================
  // LOAD FEED
  // ============================================================

  const loadFeed = useCallback(async () => {
    try {
      const res = await apiFetch("/api/feed", token);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load feed");
      setPosts(data.posts || []);
    } catch {
      // silent — don't alert on every refresh
    } finally {
      setFeedLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // ============================================================
  // LOAD USER SKILLS (for XP)
  // ============================================================

  const loadSkills = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const res = await apiFetch(`/api/skills/user/${userId}`, token);
      const data = await res.json();
      if (data.success) setUserSkills(data.skills || []);
    } catch {
      // non-critical
    }
  }, [userId, token]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
      loadSkills();
    }, [loadFeed, loadSkills])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  // ============================================================
  // CREATE POST
  // ============================================================

  const handleCreatePost = useCallback(async () => {
    const trimmed = postText.trim();
    if (!trimmed || !userId || !token) return;

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/feed", token, {
        method: "POST",
        body: JSON.stringify({ userId, content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create post");
      setPostText("");
      setComposerOpen(false);
      await loadFeed();
    } catch (error) {
      Alert.alert("Post Failed", error instanceof Error ? error.message : "Could not create post.");
    } finally {
      setSubmitting(false);
    }
  }, [postText, userId, token, loadFeed]);

  // ============================================================
  // LIKE
  // ============================================================

  const handleToggleLike = useCallback(async (post: Post) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/api/feed/${post.id}/like`, token, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      setLikedPosts((prev) =>
        data.liked ? [...prev, post.id] : prev.filter((id) => id !== post.id)
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, like_count: p.like_count + (data.liked ? 1 : -1) }
            : p
        )
      );
    } catch {
      // silent
    }
  }, [token]);

  // ============================================================
  // COMMENTS
  // ============================================================

  const loadComments = useCallback(async (postId: number) => {
    setCommentLoading(postId);
    try {
      const res = await apiFetch(`/api/feed/${postId}/comments`, token);
      const data = await res.json();
      if (data.success) setComments((prev) => ({ ...prev, [postId]: data.comments || [] }));
    } catch {
      // silent
    } finally {
      setCommentLoading(null);
    }
  }, [token]);

  const toggleComments = useCallback(async (postId: number) => {
    const isExpanded = expandedComments.includes(postId);
    if (isExpanded) {
      setExpandedComments((prev) => prev.filter((id) => id !== postId));
      return;
    }
    setExpandedComments((prev) => [...prev, postId]);
    await loadComments(postId);
  }, [expandedComments, loadComments]);

  const addComment = useCallback(async (postId: number) => {
    const text = commentText[postId]?.trim() || "";
    if (!text || !token) return;
    setCommentLoading(postId);
    try {
      const res = await apiFetch(`/api/feed/${postId}/comments`, token, {
        method: "POST",
        body: JSON.stringify({ comment: text }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
        await loadComments(postId);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p
          )
        );
      }
    } catch {
      // silent
    } finally {
      setCommentLoading(null);
    }
  }, [commentText, token, loadComments]);

  // ============================================================
  // DELETE POST
  // ============================================================

  const deletePost = useCallback((postId: number) => {
    Alert.alert("Delete post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await apiFetch(`/api/feed/${postId}`, token, { method: "DELETE" });
            const data = await res.json();
            if (data.success) setPosts((prev) => prev.filter((p) => p.id !== postId));
          } catch {
            Alert.alert("Error", "Could not delete post.");
          }
        },
      },
    ]);
  }, [token]);

  if (!fontsLoaded) return <View style={styles.page} />;

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const xpStats = deriveXpStats(userSkills);
  const avatarLetter = user?.name ? getInitial(user.name) : "S";

  return (
    <View style={styles.page}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Pressable style={styles.logoRow} onPress={() => router.push("/home")}>
          <LogoMark size={30} />
          <Text style={styles.logoWordmark}>
            Skill<Text style={styles.logoWordmarkBlue}>Verse</Text>
          </Text>
        </Pressable>

        <View style={styles.searchBar}>
          <IconSearch />
          <TextInput
            placeholder="Search posts, people, skills..."
            placeholderTextColor={COLORS.slate}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.createPostBtn} onPress={() => setComposerOpen(true)}>
            <IconPlus />
            <Text style={styles.createPostText}>Create Post</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => router.push("/notifications")}>
            <IconBell />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => router.push("/chat" as any)}>
            <IconChatBubble />
          </Pressable>
          <Pressable
            style={styles.avatarRow}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>
            <IconChevronDown />
          </Pressable>
        </View>
      </View>

      {/* ===== BODY ===== */}
      <View style={styles.body}>
        {/* Sidebar receives real XP from user_skills */}
        <SidebarNav
          level={xpStats.level}
          levelLabel={xpStats.levelLabel}
          xp={xpStats.xp}
          xpMax={xpStats.xpMax}
        />

        {/* ===== MAIN FEED COLUMN ===== */}
        <ScrollView
          style={styles.mainCol}
          contentContainerStyle={styles.mainColContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* COMPOSER */}
          <View style={styles.card}>
            <View style={styles.composerTopRow}>
              <View style={styles.composerAvatar}>
                <Text style={styles.composerAvatarLetter}>{avatarLetter}</Text>
              </View>

              {composerOpen ? (
                <TextInput
                  autoFocus
                  multiline
                  value={postText}
                  onChangeText={setPostText}
                  placeholder={`What's on your mind, ${firstName}?`}
                  placeholderTextColor={COLORS.slate}
                  style={styles.composerInput}
                />
              ) : (
                <Pressable style={{ flex: 1 }} onPress={() => setComposerOpen(true)}>
                  <Text style={styles.composerGreeting}>
                    {`What's on your mind, ${firstName}?`}
                  </Text>
                </Pressable>
              )}

              {composerOpen && (
                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    setComposerOpen(false);
                    setPostText("");
                  }}
                >
                  <IconX />
                </Pressable>
              )}
            </View>

            {composerOpen ? (
              <View style={styles.composerSubmitRow}>
                <Text style={styles.composerCharCount}>{postText.length}/500</Text>
                <Pressable
                  style={[
                    styles.postSubmitBtn,
                    (!postText.trim() || submitting) && styles.postSubmitBtnDisabled,
                  ]}
                  disabled={!postText.trim() || submitting}
                  onPress={handleCreatePost}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.postSubmitText}>Post</Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <View style={styles.composerActionsRow}>
                <ComposerAction
                  Icon={IconTextT}
                  label="Post"
                  color={COLORS.primary}
                  bg={COLORS.primarySoft}
                  onPress={() => setComposerOpen(true)}
                />
              </View>
            )}
          </View>

          {/* FILTER TABS */}
          <View style={styles.tabsRow}>
            <View style={styles.tabsGroup}>
              {TABS.map((tab) => {
                const active = tab === activeTab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[styles.tabPill, active && styles.tabPillActive]}
                  >
                    <Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>
                      {tab}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* FEED POSTS */}
          {feedLoading ? (
            <View style={styles.feedLoader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : posts.length === 0 ? (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>
                Be the first to share something with the SkillVerse community.
              </Text>
            </View>
          ) : (
            posts.map((post) => {
              const isLiked = likedPosts.includes(post.id);
              const isCommentsExpanded = expandedComments.includes(post.id);
              const postComments = comments[post.id] || [];

              return (
                <View key={post.id} style={styles.card}>
                  {/* Post header */}
                  <View style={styles.postHeaderRow}>
                    <View style={styles.postAvatarCircle}>
                      <Text style={styles.postAvatarLetter}>
                        {getInitial(post.user_name)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.postNameRow}>
                        <Pressable
                          onPress={() =>
                            router.push(`/student-profile?id=${post.user_id}` as any)
                          }
                        >
                          <Text style={styles.postName}>{post.user_name}</Text>
                        </Pressable>
                      </View>
                      <Text style={styles.postMeta}>
                        {formatDate(post.created_at)} · {post.college}
                      </Text>
                    </View>
                    {post.user_id === userId && (
                      <Pressable hitSlop={8} onPress={() => deletePost(post.id)}>
                        <IconDots />
                      </Pressable>
                    )}
                  </View>

                  <Text style={styles.postText}>{post.content}</Text>

                  {/* Footer actions */}
                  <View style={styles.postFooterRow}>
                    <View style={styles.postFooterLeft}>
                      <Pressable
                        style={styles.footerAction}
                        onPress={() => handleToggleLike(post)}
                      >
                        <IconThumbsUp filled={isLiked} />
                        <Text
                          style={[
                            styles.footerActionText,
                            isLiked && { color: COLORS.primary },
                          ]}
                        >
                          {post.like_count}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.footerAction}
                        onPress={() => toggleComments(post.id)}
                      >
                        <IconComment />
                        <Text style={styles.footerActionText}>{post.comment_count}</Text>
                      </Pressable>
                      <Pressable style={styles.footerAction}>
                        <IconShare />
                        <Text style={styles.footerActionText}>Share</Text>
                      </Pressable>
                    </View>
                    <Pressable hitSlop={8}>
                      <IconBookmarkOutline />
                    </Pressable>
                  </View>

                  {/* Comments section */}
                  {isCommentsExpanded && (
                    <View style={styles.commentsSection}>
                      <View style={styles.commentInputRow}>
                        <TextInput
                          value={commentText[post.id] || ""}
                          onChangeText={(text) =>
                            setCommentText((prev) => ({ ...prev, [post.id]: text }))
                          }
                          placeholder="Write a comment..."
                          placeholderTextColor="#94A3B8"
                          style={styles.commentInput}
                        />
                        <Pressable
                          style={styles.commentSendBtn}
                          onPress={() => addComment(post.id)}
                          disabled={commentLoading === post.id}
                        >
                          {commentLoading === post.id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.commentSendText}>→</Text>
                          )}
                        </Pressable>
                      </View>

                      {postComments.length === 0 ? (
                        <Text style={styles.noComments}>
                          No comments yet. Be the first!
                        </Text>
                      ) : (
                        postComments.map((c) => (
                          <View key={c.id} style={styles.comment}>
                            <View style={styles.commentAvatarCircle}>
                              <Text style={styles.commentAvatarLetter}>
                                {getInitial(c.user_name)}
                              </Text>
                            </View>
                            <View style={styles.commentBody}>
                              <Text style={styles.commentUser}>{c.user_name}</Text>
                              <Text style={styles.commentText}>{c.comment}</Text>
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
        </ScrollView>

        {/* ===== RIGHT RAIL ===== */}
        <ScrollView style={styles.rightCol} contentContainerStyle={styles.rightColContent}>
          {/* Trending */}
          <View style={styles.card}>
            <View style={styles.railHeaderRow}>
              <Text style={styles.railTitle}>Trending Topics</Text>
            </View>
            {TRENDING.map((t, i) => (
              <View
                key={t.tag}
                style={[styles.trendingRow, i === 0 && { marginTop: 4 }]}
              >
                <View style={styles.trendingLeft}>
                  <View style={styles.hashCircle}>
                    <IconHash />
                  </View>
                  <Text style={styles.trendingTag} numberOfLines={1}>
                    {t.tag}
                  </Text>
                </View>
                <Text style={styles.trendingCount}>{t.count}</Text>
              </View>
            ))}
          </View>

          {/* Quick links */}
          <View style={styles.card}>
            <Text style={[styles.railTitle, { marginBottom: 10 }]}>Quick Links</Text>
            {QUICK_LINKS.map((q) => (
              <Pressable
                key={q.label}
                style={styles.quickLinkRow}
                onPress={() => router.push(q.route as any)}
              >
                <View style={styles.quickLinkIconWrap}>
                  <q.Icon />
                </View>
                <Text style={styles.quickLinkText} numberOfLines={1}>
                  {q.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Community stats card */}
          <View style={styles.card}>
            <Text style={[styles.railTitle, { marginBottom: 10 }]}>Your Stats</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Skills learning</Text>
              <Text style={styles.statValue}>{userSkills.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Assignments done</Text>
              <Text style={styles.statValue}>
                {userSkills.reduce((s, sk) => s + sk.assignments_completed, 0)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Avg progress</Text>
              <Text style={styles.statValue}>
                {userSkills.length
                  ? Math.round(
                      userSkills.reduce((s, sk) => s + sk.progress, 0) / userSkills.length
                    )
                  : 0}
                %
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------
   COMPOSER ACTION BUTTON
--------------------------------------------------------- */
function ComposerAction({
  Icon,
  label,
  color,
  bg,
  onPress,
}: {
  Icon: (p: { color: string; size?: number }) => JSX.Element;
  label: string;
  color: string;
  bg: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.composerAction} onPress={onPress}>
      <View style={[styles.composerActionIcon, { backgroundColor: bg }]}>
        <Icon color={color} />
      </View>
      <Text style={styles.composerActionLabel}>{label}</Text>
    </Pressable>
  );
}

/* ---------------------------------------------------------
   STYLES
--------------------------------------------------------- */
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.bg },

  // HEADER
  header: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoWordmark: { fontFamily: FONT.extrabold, fontSize: 19, color: "#0F172A" },
  logoWordmarkBlue: { color: COLORS.primary },
  searchBar: {
    flex: 1,
    maxWidth: 560,
    height: 42,
    backgroundColor: "#F2F4F8",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: COLORS.navy,
    outlineStyle: "none" as any,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14, marginLeft: "auto" },
  createPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
  },
  createPostText: { fontFamily: FONT.semibold, fontSize: 13.5, color: "#FFFFFF" },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 4 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 14 },

  // BODY
  body: { flex: 1, flexDirection: "row" },
  mainCol: { flex: 1 },
  mainColContent: { padding: 24, gap: 20, maxWidth: 860 },
  rightCol: { width: 248, borderLeftWidth: 1, borderLeftColor: COLORS.border },
  rightColContent: { padding: 16, gap: 16 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },

  // COMPOSER
  composerTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  composerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  composerAvatarLetter: { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 17 },
  composerGreeting: { fontFamily: FONT.bold, fontSize: 17, color: COLORS.navy },
  composerInput: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.navy,
    minHeight: 44,
    maxHeight: 140,
    outlineStyle: "none" as any,
  },
  composerSubmitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  composerCharCount: { fontFamily: FONT.medium, fontSize: 12, color: COLORS.slate },
  postSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 74,
  },
  postSubmitBtnDisabled: { backgroundColor: COLORS.border },
  postSubmitText: { fontFamily: FONT.semibold, fontSize: 13.5, color: "#FFFFFF" },
  composerActionsRow: { flexDirection: "row", gap: 10, marginTop: 16, flexWrap: "wrap" },
  composerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  composerActionIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  composerActionLabel: { fontFamily: FONT.semibold, fontSize: 13, color: COLORS.slateDark },

  // TABS
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  tabsGroup: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabPillText: { fontFamily: FONT.semibold, fontSize: 13, color: COLORS.slateDark },
  tabPillTextActive: { color: "#FFFFFF" },

  // FEED
  feedLoader: { paddingVertical: 60, alignItems: "center" },
  emptyCard: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontFamily: FONT.bold, fontSize: 18, color: COLORS.navy },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.slate,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 360,
  },

  // POST
  postHeaderRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  postAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  postAvatarLetter: { fontFamily: FONT.bold, fontSize: 17, color: COLORS.primary },
  postNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  postName: { fontFamily: FONT.bold, fontSize: 14.5, color: COLORS.navy },
  postMeta: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: COLORS.slate,
    marginTop: 2,
  },
  postText: {
    fontFamily: FONT.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORS.slateDark,
    marginTop: 14,
  },
  postFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  postFooterLeft: { flexDirection: "row", gap: 22 },
  footerAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerActionText: { fontFamily: FONT.semibold, fontSize: 13, color: COLORS.slate },

  // COMMENTS
  commentsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentInputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  commentInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.navy,
    backgroundColor: "#F8FAFC",
    fontFamily: FONT.regular,
  },
  commentSendBtn: {
    width: 42,
    height: 42,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  commentSendText: { color: "#FFFFFF", fontSize: 18, fontFamily: FONT.bold },
  noComments: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.slate,
    textAlign: "center",
    paddingVertical: 8,
  },
  comment: { flexDirection: "row", marginBottom: 12 },
  commentAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarLetter: { fontFamily: FONT.bold, fontSize: 13, color: COLORS.primary },
  commentBody: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
  },
  commentUser: { fontFamily: FONT.bold, fontSize: 12, color: COLORS.slateDark },
  commentText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
    marginTop: 3,
  },

  // RIGHT RAIL
  railHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  railTitle: { fontFamily: FONT.bold, fontSize: 14.5, color: COLORS.navy },
  trendingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    gap: 8,
  },
  trendingLeft: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  hashCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  trendingTag: {
    fontFamily: FONT.semibold,
    fontSize: 12.5,
    color: COLORS.navy,
    flexShrink: 1,
  },
  trendingCount: { fontFamily: FONT.regular, fontSize: 11, color: COLORS.slate },
  quickLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
  },
  quickLinkIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLinkText: {
    fontFamily: FONT.semibold,
    fontSize: 12.5,
    color: COLORS.slateDark,
    flexShrink: 1,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: { fontFamily: FONT.regular, fontSize: 12.5, color: COLORS.slate },
  statValue: { fontFamily: FONT.bold, fontSize: 13, color: COLORS.primary },
});
