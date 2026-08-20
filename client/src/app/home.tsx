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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
   ICONS  (unchanged — same set as before)
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
function IconPoll({ size = 16, color = COLORS.orange }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={5} y1={20} x2={5} y2={13} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Line x1={12} y1={20} x2={12} y2={7} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Line x1={19} y1={20} x2={19} y2={10} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
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
function IconPlay({ size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5v14l11-7-11-7z" fill="#FFFFFF" />
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
function IconX({ size = 14, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/* ---------------------------------------------------------
   PROFILE — fetched, not hardcoded.
   Swap the body of fetchProfile() for your real endpoint:
     const res = await fetch(`${API_BASE}/api/profile/me`);
     return res.json();
--------------------------------------------------------- */
type Profile = {
  id: string;
  name: string;
  avatar: string;
  dept: string;
  level: number;
  levelLabel: string;
  xp: number;
  xpMax: number;
};

async function fetchProfile(): Promise<Profile> {
  await new Promise((r) => setTimeout(r, 350)); // simulate network
  return {
    id: "u_current",
    name: "Alex Carter",
    avatar: "https://i.pravatar.cc/100?img=68",
    dept: "Computer Science",
    level: 6,
    levelLabel: "Advanced Learner",
    xp: 3200,
    xpMax: 4000,
  };
}

/* ---------------------------------------------------------
   MOCK FEED DATA
--------------------------------------------------------- */
const TABS = ["All", "Discussions", "Projects", "Announcements", "Events", "Resources"];

const TRENDING = [
  { tag: "WebDevelopment", count: "12.1K posts" },
  { tag: "MachineLearning", count: "8.7K posts" },
  { tag: "ReactJS", count: "7.3K posts" },
  { tag: "Hackathon", count: "6.2K posts" },
  { tag: "OpenSource", count: "5.1K posts" },
];

const EVENTS = [
  { month: "JUN", day: "20", title: "AI Innovation Challenge", subtitle: "Online Hackathon", date: "20 Jun \u2013 22 Jun, 2025" },
  { month: "JUL", day: "05", title: "Web Dev Bootcamp", subtitle: "Online Workshop", date: "5 Jul, 2025 \u00b7 6:00 PM" },
];

const QUICK_LINKS = [
  { label: "Find Study Groups", Icon: IconUsersSmall },
  { label: "Browse Resources", Icon: IconFolder },
  { label: "Explore Projects", Icon: IconTarget },
  { label: "Practice Skills", Icon: IconRefresh },
];

type Post = {
  id: string;
  name: string;
  badge: { label: string; color: string; bg: string };
  time: string;
  dept: string;
  avatar: string;
  text: string;
  linkCard?: { image: string; title: string; description: string; url: string };
  video?: string;
  likes: number;
  comments: number;
  liked?: boolean;
};

const FEED_POSTS: Post[] = [
  {
    id: "1",
    name: "Riya Sharma",
    badge: { label: "Top Contributor", color: COLORS.purple, bg: COLORS.purpleSoft },
    time: "2h ago",
    dept: "Computer Science",
    avatar: "https://i.pravatar.cc/100?img=47",
    text: "Just finished building my portfolio website! \ud83d\ude80\nWould love your feedback on the design and functionality.",
    linkCard: {
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80",
      title: "My Portfolio",
      description: "A modern portfolio website built with React and Tailwind CSS.",
      url: "riyasharma.dev",
    },
    likes: 24,
    comments: 6,
  },
  {
    id: "2",
    name: "Arjun Mehta",
    badge: { label: "Student", color: COLORS.green, bg: COLORS.greenSoft },
    time: "5h ago",
    dept: "Electronics & Communication",
    avatar: "https://i.pravatar.cc/100?img=12",
    text: "Working on an IoT based smart plant watering system using ESP32 and Soil Moisture Sensor. \ud83c\udf31\ud83d\udca7\nHere's a quick demo of the prototype:",
    video: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80",
    likes: 41,
    comments: 9,
  },
];

/* ---------------------------------------------------------
   SCREEN
--------------------------------------------------------- */
export default function HomeScreen() {
  const { userId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("All");

  // profile state — fetched on mount
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // feed state — starts from mock, grows with real posts
  const [posts, setPosts] = useState<Post[]>(FEED_POSTS);

  // composer state
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

  useEffect(() => {
    let active = true;
    setProfileLoading(true);
    fetchProfile()
      .then((p) => {
        if (active) setProfile(p);
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const handleCreatePost = useCallback(() => {
    const trimmed = postText.trim();
    if (!trimmed || !profile) return;
    setSubmitting(true);

    const newPost: Post = {
      id: `local_${Date.now()}`,
      name: profile.name,
      badge: { label: "You", color: COLORS.primary, bg: COLORS.primarySoft },
      time: "Just now",
      dept: profile.dept,
      avatar: profile.avatar,
      text: trimmed,
      likes: 0,
      comments: 0,
    };

    // Optimistic insert — swap for an actual POST /api/posts call,
    // then reconcile the returned post id/timestamp here.
    setPosts((prev) => [newPost, ...prev]);
    setPostText("");
    setComposerOpen(false);
    setSubmitting(false);
  }, [postText, profile]);

  const handleToggleLike = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }, []);

  if (!fontsLoaded) return <View style={styles.page} />;

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <View style={styles.page}>
      {/* HEADER */}
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
            placeholder="Search posts, people, skills, projects..."
            placeholderTextColor={COLORS.slate}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.createPostBtn} onPress={() => setComposerOpen(true)}>
            <IconPlus />
            <Text style={styles.createPostText}>Create Post</Text>
          </Pressable>

          <Pressable style={styles.iconBtn}>
            <IconBell />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <IconChatBubble />
          </Pressable>

          <Pressable style={styles.avatarRow}>
            <View>
              {profileLoading ? (
                <View style={[styles.avatarImg, styles.avatarSkeleton]} />
              ) : (
                <Image source={{ uri: profile!.avatar }} style={styles.avatarImg} />
              )}
              <View style={styles.onlineDot} />
            </View>
            <IconChevronDown />
          </Pressable>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        <SidebarNav
          level={profile?.level}
          levelLabel={profile?.levelLabel}
          xp={profile?.xp}
          xpMax={profile?.xpMax}
        />

        <ScrollView style={styles.mainCol} contentContainerStyle={styles.mainColContent}>
          {/* COMPOSER */}
          <View style={styles.card}>
            <View style={styles.composerTopRow}>
              {profileLoading ? (
                <View style={[styles.composerAvatar, styles.avatarSkeleton]} />
              ) : (
                <Image source={{ uri: profile!.avatar }} style={styles.composerAvatar} />
              )}

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
                    {profileLoading ? "Loading..." : `What's happening, ${firstName}?`}
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
                <ComposerAction Icon={IconTextT} label="Text" color={COLORS.primary} bg={COLORS.primarySoft} onPress={() => setComposerOpen(true)} />
                <ComposerAction Icon={IconImage} label="Image" color={COLORS.green} bg={COLORS.greenSoft} />
                <ComposerAction Icon={IconCodeBrackets} label="Project" color={COLORS.purple} bg={COLORS.purpleSoft} />
                <ComposerAction Icon={IconPoll} label="Poll" color={COLORS.orange} bg={COLORS.orangeSoft} />
                <ComposerAction Icon={IconLink} label="Link" color={COLORS.primary} bg={COLORS.primarySoft} />
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
            <Pressable style={styles.sortRow}>
              <Text style={styles.sortText}>Most Recent</Text>
              <IconChevronDown />
            </Pressable>
          </View>

          {/* FEED */}
          {posts.map((post) => (
            <View key={post.id} style={styles.card}>
              <View style={styles.postHeaderRow}>
                <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
                <View style={{ flex: 1 }}>
                  <View style={styles.postNameRow}>
                    <Text style={styles.postName}>{post.name}</Text>
                    <View style={[styles.badge, { backgroundColor: post.badge.bg }]}>
                      <View style={[styles.badgeDot, { backgroundColor: post.badge.color }]} />
                      <Text style={[styles.badgeText, { color: post.badge.color }]}>
                        {post.badge.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.postMeta}>
                    {post.time} · {post.dept}
                  </Text>
                </View>
                <Pressable hitSlop={8}>
                  <IconDots />
                </Pressable>
              </View>

              <Text style={styles.postText}>{post.text}</Text>

              {post.linkCard && (
                <View style={styles.linkCard}>
                  <Image source={{ uri: post.linkCard.image }} style={styles.linkCardImage} />
                  <View style={styles.linkCardInfo}>
                    <Text style={styles.linkCardTitle}>{post.linkCard.title}</Text>
                    <Text style={styles.linkCardDesc}>{post.linkCard.description}</Text>
                    <View style={styles.linkCardUrlRow}>
                      <IconLink size={13} />
                      <Text style={styles.linkCardUrl}>{post.linkCard.url}</Text>
                    </View>
                  </View>
                </View>
              )}

              {post.video && (
                <View style={styles.videoWrap}>
                  <Image source={{ uri: post.video }} style={styles.videoImage} />
                  <View style={styles.playButton}>
                    <IconPlay />
                  </View>
                </View>
              )}

              <View style={styles.postFooterRow}>
                <View style={styles.postFooterLeft}>
                  <Pressable style={styles.footerAction} onPress={() => handleToggleLike(post.id)}>
                    <IconThumbsUp filled={!!post.liked} />
                    <Text
                      style={[
                        styles.footerActionText,
                        post.liked && { color: COLORS.primary },
                      ]}
                    >
                      {post.likes}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.footerAction}>
                    <IconComment />
                    <Text style={styles.footerActionText}>{post.comments}</Text>
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
            </View>
          ))}
        </ScrollView>

        {/* RIGHT RAIL — narrowed */}
        <ScrollView style={styles.rightCol} contentContainerStyle={styles.rightColContent}>
          <View style={styles.card}>
            <View style={styles.railHeaderRow}>
              <Text style={styles.railTitle}>Trending Topics</Text>
              <Pressable>
                <Text style={styles.railViewAll}>View all</Text>
              </Pressable>
            </View>
            {TRENDING.map((t, i) => (
              <View key={t.tag} style={[styles.trendingRow, i === 0 && { marginTop: 4 }]}>
                <View style={styles.trendingLeft}>
                  <View style={styles.hashCircle}>
                    <IconHash />
                  </View>
                  <Text style={styles.trendingTag} numberOfLines={1}>{t.tag}</Text>
                </View>
                <Text style={styles.trendingCount}>{t.count}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.railHeaderRow}>
              <Text style={styles.railTitle}>Upcoming Events</Text>
              <Pressable>
                <Text style={styles.railViewAll}>View all</Text>
              </Pressable>
            </View>
            {EVENTS.map((e, i) => (
              <View key={e.title}>
                <View style={styles.eventRow}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeMonth}>{e.month}</Text>
                    <Text style={styles.dateBadgeDay}>{e.day}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{e.title}</Text>
                    <Text style={styles.eventSubtitle}>{e.subtitle}</Text>
                    <Text style={styles.eventDate}>{e.date}</Text>
                  </View>
                </View>
                {i < EVENTS.length - 1 && <View style={styles.eventDivider} />}
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={[styles.railTitle, { marginBottom: 10 }]}>Quick Links</Text>
            {QUICK_LINKS.map((q) => (
              <Pressable key={q.label} style={styles.quickLinkRow}>
                <View style={styles.quickLinkIconWrap}>
                  <q.Icon />
                </View>
                <Text style={styles.quickLinkText} numberOfLines={1}>{q.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

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
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  avatarSkeleton: { backgroundColor: COLORS.border },
  onlineDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  /* BODY LAYOUT */
  body: { flex: 1, flexDirection: "row" },
  mainCol: { flex: 1 },
  mainColContent: { padding: 24, gap: 20, maxWidth: 860 },
  // narrowed right rail: 320 -> 248
  rightCol: { width: 248, borderLeftWidth: 1, borderLeftColor: COLORS.border },
  rightColContent: { padding: 16, gap: 16 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },

  /* COMPOSER */
  composerTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  composerAvatar: { width: 44, height: 44, borderRadius: 22 },
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
  composerActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },
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

  /* TABS */
  tabsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
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
  sortRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sortText: { fontFamily: FONT.semibold, fontSize: 13, color: COLORS.slateDark },

  /* POST */
  postHeaderRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  postAvatar: { width: 44, height: 44, borderRadius: 22 },
  postNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  postName: { fontFamily: FONT.bold, fontSize: 14.5, color: COLORS.navy },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: FONT.semibold, fontSize: 11.5 },
  postMeta: { fontFamily: FONT.regular, fontSize: 12.5, color: COLORS.slate, marginTop: 2 },
  postText: { fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: COLORS.slateDark, marginTop: 14 },

  linkCard: {
    marginTop: 14,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  linkCardImage: { width: 190, height: 130 },
  linkCardInfo: { flex: 1, padding: 14, justifyContent: "center", gap: 4 },
  linkCardTitle: { fontFamily: FONT.bold, fontSize: 14.5, color: COLORS.navy },
  linkCardDesc: { fontFamily: FONT.regular, fontSize: 12.5, color: COLORS.slate, lineHeight: 18 },
  linkCardUrlRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  linkCardUrl: { fontFamily: FONT.semibold, fontSize: 12.5, color: COLORS.primary },

  videoWrap: {
    marginTop: 14,
    borderRadius: 12,
    overflow: "hidden",
    height: 280,
  },
  videoImage: { width: "100%", height: "100%" },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -26,
    marginLeft: -26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
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

  /* RIGHT RAIL */
  railHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  railTitle: { fontFamily: FONT.bold, fontSize: 14.5, color: COLORS.navy },
  railViewAll: { fontFamily: FONT.semibold, fontSize: 12, color: COLORS.primary },
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
  trendingTag: { fontFamily: FONT.semibold, fontSize: 12.5, color: COLORS.navy, flexShrink: 1 },
  trendingCount: { fontFamily: FONT.regular, fontSize: 11, color: COLORS.slate },

  eventRow: { flexDirection: "row", gap: 10, paddingVertical: 12 },
  dateBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBadgeMonth: { fontFamily: FONT.semibold, fontSize: 9.5, color: COLORS.primary },
  dateBadgeDay: { fontFamily: FONT.extrabold, fontSize: 15, color: COLORS.primary, marginTop: -2 },
  eventTitle: { fontFamily: FONT.bold, fontSize: 12.5, color: COLORS.navy },
  eventSubtitle: { fontFamily: FONT.regular, fontSize: 11, color: COLORS.slate, marginTop: 1 },
  eventDate: { fontFamily: FONT.regular, fontSize: 10.5, color: COLORS.slate, marginTop: 2 },
  eventDivider: { height: 1, backgroundColor: COLORS.border },

  quickLinkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9 },
  quickLinkIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLinkText: { fontFamily: FONT.semibold, fontSize: 12.5, color: COLORS.slateDark, flexShrink: 1 },
});