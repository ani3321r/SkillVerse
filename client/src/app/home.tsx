import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
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
function IconTextT({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 5h14M12 5v14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}
function IconImage({ size = 16, color = COLORS.green }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={16} rx={2} stroke={color} strokeWidth={2} />
      <Circle cx={9} cy={10} r={1.6} stroke={color} strokeWidth={2} />
      <Path d="m4 17 5-5 4 4 3-3 4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconCodeBrackets({ size = 16, color = COLORS.purple }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="16 18 22 12 16 6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="8 6 2 12 8 18" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
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
function IconUsersSmall({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
function IconFolder({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
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
type FeedPost = {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: number;
  user_name: string;
  user_email: string;
  college: string;
  department: string;
  avatar_url: string | null;
  like_count: number;
  comment_count: number;
};

const QUICK_LINKS = [
  { label: "Find Study Groups", Icon: IconUsersSmall },
  { label: "Browse Resources", Icon: IconFolder },
  { label: "Explore Projects", Icon: IconTarget },
  { label: "Practice Skills", Icon: IconRefresh },
];

/* ---------------------------------------------------------
   SCREEN
--------------------------------------------------------- */
export default function HomeScreen() {
  const { user, token, userId, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  // Feed state
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // ============================================
  // LOAD FEED
  // ============================================

  const loadFeed = useCallback(async () => {
    if (!token) return;
    try {
      setFeedLoading(true);
      const res = await apiFetch("/api/feed", token);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts ?? []);
      }
    } catch (error) {
      console.error("Feed load error:", error);
    } finally {
      setFeedLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed])
  );

  // ============================================
  // CREATE POST
  // ============================================

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
      if (!res.ok || !data.success) throw new Error(data.message);

      setPostText("");
      setComposerOpen(false);
      await loadFeed();
    } catch (error) {
      Alert.alert("Error", "Could not create post.");
    } finally {
      setSubmitting(false);
    }
  }, [postText, userId, token, loadFeed]);

  // ============================================
  // LIKE
  // ============================================

  const toggleLike = useCallback(async (post: FeedPost) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/api/feed/${post.id}/like`, token, { method: "POST" });
      const data = await res.json();
      if (!data.success) return;

      setLikedPosts(prev => {
        const next = new Set(prev);
        data.liked ? next.add(post.id) : next.delete(post.id);
        return next;
      });
      setPosts(prev =>
        prev.map(p =>
          p.id === post.id
            ? { ...p, like_count: p.like_count + (data.liked ? 1 : -1) }
            : p
        )
      );
    } catch { /* silent */ }
  }, [token]);

  // ============================================
  // DELETE
  // ============================================

  const deletePost = useCallback((postId: number) => {
    Alert.alert("Delete post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/feed/${postId}`, token, { method: "DELETE" });
            setPosts(prev => prev.filter(p => p.id !== postId));
          } catch { /* silent */ }
        },
      },
    ]);
  }, [token]);

  // ============================================
  // HELPERS
  // ============================================

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

  const getInitials = (name: string) =>
    name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  if (!fontsLoaded) return <View style={styles.page} />;

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const initials = user ? getInitials(user.name) : "?";

  return (
    <View style={styles.page}>

      {/* ============================================
          HEADER
      ============================================ */}
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
          <Pressable
            style={styles.createPostBtn}
            onPress={() => { setComposerOpen(true); }}
          >
            <IconPlus />
            <Text style={styles.createPostText}>Create Post</Text>
          </Pressable>

          <Pressable style={styles.iconBtn}>
            <IconBell />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push("/feed")}
          >
            <IconChatBubble />
          </Pressable>

          {/* AVATAR — tapping opens profile */}
          <Pressable
            style={styles.avatarCircle}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.avatarInitials}>{initials}</Text>
          </Pressable>
        </View>
      </View>

      {/* ============================================
          BODY
      ============================================ */}
      <View style={styles.body}>

        {/* SIDEBAR */}
        {isDesktop && <SidebarNav />}

        {/* MAIN FEED COLUMN */}
        <ScrollView
          style={styles.mainCol}
          contentContainerStyle={styles.mainColContent}
          showsVerticalScrollIndicator={false}
        >

          {/* COMPOSER CARD */}
          <View style={styles.card}>
            <View style={styles.composerTopRow}>
              {/* My avatar */}
              <View style={styles.composerAvatar}>
                <Text style={styles.composerAvatarText}>{initials}</Text>
              </View>

              {composerOpen ? (
                <TextInput
                  autoFocus
                  multiline
                  value={postText}
                  onChangeText={setPostText}
                  placeholder={`What's happening, ${firstName}?`}
                  placeholderTextColor={COLORS.slate}
                  style={styles.composerInput}
                />
              ) : (
                <Pressable style={{ flex: 1 }} onPress={() => setComposerOpen(true)}>
                  <Text style={styles.composerGreeting}>
                    What's happening, {firstName}?
                  </Text>
                </Pressable>
              )}

              {composerOpen && (
                <Pressable
                  hitSlop={8}
                  onPress={() => { setComposerOpen(false); setPostText(""); }}
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
                  {submitting
                    ? <ActivityIndicator size="small" color="#FFFFFF" />
                    : <Text style={styles.postSubmitText}>Post</Text>
                  }
                </Pressable>
              </View>
            ) : (
              <View style={styles.composerActionsRow}>
                <ComposerAction Icon={IconTextT}       label="Text"    color={COLORS.primary} bg={COLORS.primarySoft} onPress={() => setComposerOpen(true)} />
                <ComposerAction Icon={IconImage}       label="Image"   color={COLORS.green}   bg={COLORS.greenSoft} />
                <ComposerAction Icon={IconCodeBrackets} label="Project" color={COLORS.purple}  bg={COLORS.purpleSoft} />
                <ComposerAction Icon={IconLink}        label="Link"    color={COLORS.primary} bg={COLORS.primarySoft} />
              </View>
            )}
          </View>

          {/* FEED */}
          {feedLoading ? (
            <View style={styles.feedLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.feedLoadingText}>Loading feed...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyFeed}>
              <Text style={styles.emptyFeedIcon}>✨</Text>
              <Text style={styles.emptyFeedTitle}>No posts yet</Text>
              <Text style={styles.emptyFeedText}>
                Be the first to share something with the SkillVerse community.
              </Text>
            </View>
          ) : (
            posts.map(post => {
              const liked = likedPosts.has(post.id);
              const isMine = post.user_id === userId;

              return (
                <View key={post.id} style={styles.card}>
                  {/* POST HEADER */}
                  <View style={styles.postHeaderRow}>
                    {/* Avatar */}
                    <View style={styles.postAvatarCircle}>
                      <Text style={styles.postAvatarText}>
                        {getInitials(post.user_name)}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.postNameRow}>
                        <Pressable onPress={() => router.push(`/student-profile?id=${post.user_id}`)}>
                          <Text style={styles.postName}>{post.user_name}</Text>
                        </Pressable>
                        <View style={styles.deptBadge}>
                          <Text style={styles.deptBadgeText}>{post.department || post.college}</Text>
                        </View>
                      </View>
                      <Text style={styles.postMeta}>{formatDate(post.created_at)}</Text>
                    </View>

                    {isMine && (
                      <Pressable
                        hitSlop={8}
                        onPress={() => deletePost(post.id)}
                      >
                        <IconDots />
                      </Pressable>
                    )}
                  </View>

                  {/* CONTENT */}
                  <Text style={styles.postText}>{post.content}</Text>

                  {/* ACTIONS */}
                  <View style={styles.postFooterRow}>
                    <View style={styles.postFooterLeft}>
                      <Pressable style={styles.footerAction} onPress={() => toggleLike(post)}>
                        <IconThumbsUp filled={liked} />
                        <Text style={[styles.footerActionText, liked && { color: COLORS.primary }]}>
                          {post.like_count}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.footerAction}
                        onPress={() => router.push("/feed")}
                      >
                        <IconComment />
                        <Text style={styles.footerActionText}>{post.comment_count}</Text>
                      </Pressable>
                      <Pressable style={styles.footerAction}>
                        <IconShare />
                        <Text style={styles.footerActionText}>Share</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          )}

        </ScrollView>

        {/* ============================================
            RIGHT RAIL
        ============================================ */}
        {isDesktop && (
          <ScrollView
            style={styles.rightCol}
            contentContainerStyle={styles.rightColContent}
            showsVerticalScrollIndicator={false}
          >

            {/* USER CARD */}
            <View style={styles.card}>
              <View style={styles.userCardHeader}>
                <View style={styles.userCardAvatar}>
                  <Text style={styles.userCardAvatarText}>{initials}</Text>
                </View>
                <View style={styles.userCardInfo}>
                  <Text style={styles.userCardName} numberOfLines={1}>{user?.name ?? "—"}</Text>
                  <Text style={styles.userCardSub} numberOfLines={1}>{user?.department ?? ""}</Text>
                </View>
              </View>

              <View style={styles.userCardDivider} />

              <UserRow label="College"  value={user?.college   ?? "—"} />
              <UserRow label="Year"     value={user?.year      ?? "—"} />
              <UserRow label="Location" value={user?.location  ?? "—"} />
              <UserRow label="Interest" value={user?.interest  ?? "—"} />

              <Pressable
                style={styles.editProfileBtn}
                onPress={() => router.push("/profile")}
              >
                <Text style={styles.editProfileBtnText}>Edit Profile</Text>
              </Pressable>
            </View>

            {/* QUICK LINKS */}
            <View style={styles.card}>
              <Text style={styles.railTitle}>Quick Links</Text>
              <View style={{ marginTop: 8 }}>
                {QUICK_LINKS.map(q => (
                  <Pressable key={q.label} style={styles.quickLinkRow}>
                    <View style={styles.quickLinkIconWrap}>
                      <q.Icon />
                    </View>
                    <Text style={styles.quickLinkText} numberOfLines={1}>{q.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* NAVIGATE */}
            <View style={styles.card}>
              <Text style={styles.railTitle}>Navigate</Text>
              <View style={{ marginTop: 8 }}>
                <NavRow label="Dashboard"  onPress={() => router.push(`/dashboard?userId=${userId}`)} />
                <NavRow label="My Skills"  onPress={() => router.push("/skills")} />
                <NavRow label="Students"   onPress={() => router.push("/students")} />
                <NavRow label="Hackathons" onPress={() => router.push("/hackathons")} />
              </View>
            </View>

          </ScrollView>
        )}

      </View>
    </View>
  );
}

/* ---------------------------------------------------------
   SUB-COMPONENTS
--------------------------------------------------------- */
function ComposerAction({
  Icon, label, color, bg, onPress,
}: {
  Icon: (p: { color: string; size?: number }) => JSX.Element;
  label: string; color: string; bg: string; onPress?: () => void;
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

function UserRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.userRow}>
      <Text style={styles.userRowLabel}>{label}</Text>
      <Text style={styles.userRowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function NavRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.navRow} onPress={onPress}>
      <Text style={styles.navRowText}>{label}</Text>
      <Text style={styles.navRowArrow}>→</Text>
    </Pressable>
  );
}

/* ---------------------------------------------------------
   STYLES
--------------------------------------------------------- */
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.bg },

  // ─── HEADER ───────────────────────────────────────────
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoWordmark: { fontFamily: FONT.extrabold, fontSize: 19, color: "#0F172A" },
  logoWordmarkBlue: { color: COLORS.primary },
  searchBar: {
    flex: 1,
    maxWidth: 480,
    height: 40,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
  },
  createPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 9,
  },
  createPostText: { fontFamily: FONT.semibold, fontSize: 13, color: "#FFFFFF" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontFamily: FONT.bold, fontSize: 13, color: "#FFFFFF" },

  // ─── BODY LAYOUT ──────────────────────────────────────
  body: { flex: 1, flexDirection: "row" },

  // ─── MAIN FEED COLUMN ─────────────────────────────────
  mainCol: { flex: 1 },
  mainColContent: {
    padding: 20,
    gap: 16,
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
  },

  // ─── RIGHT RAIL ───────────────────────────────────────
  // Pushed further right: no left border, natural flow
  rightCol: {
    width: 280,
    marginRight: 24,   // breathing room from the window edge
  },
  rightColContent: {
    paddingTop: 20,
    paddingBottom: 40,
    gap: 14,
  },

  // ─── CARD ─────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },

  // ─── COMPOSER ─────────────────────────────────────────
  composerTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  composerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  composerAvatarText: { fontFamily: FONT.bold, fontSize: 14, color: "#FFFFFF" },
  composerGreeting: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.slate,
  },
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
    minWidth: 70,
  },
  postSubmitBtnDisabled: { opacity: 0.4 },
  postSubmitText: { fontFamily: FONT.semibold, fontSize: 13.5, color: "#FFFFFF" },
  composerActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
  },
  composerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  composerActionIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  composerActionLabel: { fontFamily: FONT.semibold, fontSize: 12.5, color: COLORS.slateDark },

  // ─── FEED STATE ───────────────────────────────────────
  feedLoading: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  feedLoadingText: { fontFamily: FONT.medium, fontSize: 14, color: COLORS.slate },
  emptyFeed: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 48,
    alignItems: "center",
    gap: 8,
  },
  emptyFeedIcon: { fontSize: 36 },
  emptyFeedTitle: { fontFamily: FONT.bold, fontSize: 18, color: COLORS.navy },
  emptyFeedText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.slate,
    textAlign: "center",
    maxWidth: 340,
    lineHeight: 21,
  },

  // ─── POST CARD ────────────────────────────────────────
  postHeaderRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  postAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  postAvatarText: { fontFamily: FONT.bold, fontSize: 14, color: COLORS.primary },
  postNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  postName: { fontFamily: FONT.bold, fontSize: 14.5, color: COLORS.navy },
  deptBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  deptBadgeText: { fontFamily: FONT.semibold, fontSize: 11, color: COLORS.primary },
  postMeta: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.slate, marginTop: 2 },
  postText: {
    fontFamily: FONT.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORS.slateDark,
    marginTop: 12,
  },
  postFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  postFooterLeft: { flexDirection: "row", gap: 20 },
  footerAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerActionText: { fontFamily: FONT.semibold, fontSize: 13, color: COLORS.slate },

  // ─── RIGHT RAIL INTERNALS ─────────────────────────────
  railTitle: { fontFamily: FONT.bold, fontSize: 14, color: COLORS.navy, marginBottom: 4 },

  // User card
  userCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  userCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  userCardAvatarText: { fontFamily: FONT.extrabold, fontSize: 17, color: "#FFFFFF" },
  userCardInfo: { flex: 1 },
  userCardName: { fontFamily: FONT.bold, fontSize: 15, color: COLORS.navy },
  userCardSub: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.slate, marginTop: 2 },
  userCardDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  userRowLabel: { fontFamily: FONT.semibold, fontSize: 12, color: COLORS.slate },
  userRowValue: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: COLORS.navy,
    maxWidth: 140,
    textAlign: "right",
    textTransform: "capitalize",
  },
  editProfileBtn: {
    marginTop: 14,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  editProfileBtnText: { fontFamily: FONT.semibold, fontSize: 13, color: COLORS.primary },

  // Quick links
  quickLinkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  quickLinkIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLinkText: { fontFamily: FONT.semibold, fontSize: 13, color: COLORS.slateDark },

  // Navigate
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navRowText: { fontFamily: FONT.semibold, fontSize: 13, color: COLORS.navy },
  navRowArrow: { fontSize: 14, color: COLORS.slate },
});
