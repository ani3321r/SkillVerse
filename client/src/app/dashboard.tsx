import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import Svg, {
  Path, Circle, Rect, Line, Polyline, G,
} from "react-native-svg";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

/* ─────────────────────────────────────────
   TOKENS
───────────────────────────────────────── */
const C = {
  primary:     "#1456F0",
  primarySoft: "#EAF0FE",
  navy:        "#0B1D3C",
  slate:       "#64748B",
  slateLight:  "#94A3B8",
  slateDark:   "#334155",
  border:      "#E8ECF2",
  bg:          "#F4F6FB",
  card:        "#FFFFFF",
  green:       "#22C55E",
  greenSoft:   "#DCFCE7",
  orange:      "#F59E0B",
  orangeSoft:  "#FEF3C7",
  red:         "#EF4444",
  redSoft:     "#FEE2E2",
  purple:      "#8B5CF6",
  purpleSoft:  "#EDE9FE",
};

const FONT = {
  regular:   "PlusJakartaSans_400Regular",
  medium:    "PlusJakartaSans_500Medium",
  semibold:  "PlusJakartaSans_600SemiBold",
  bold:      "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
};

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
function IconSearch({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={C.slateLight} strokeWidth={1.8} />
      <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={C.slateLight} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IconBell({ size = 20, color = C.slate }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IconChevronDown({ size = 14, color = C.slate }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="6 9 12 15 18 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconArrowLeft({ size = 16, color = C.primary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconBookOpen({ size = 22, color = C.primary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 7v14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M3 7a4 4 0 0 1 4-4h5v18H7a4 4 0 0 1-4-4V7z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M21 7a4 4 0 0 0-4-4h-5v18h5a4 4 0 0 0 4-4V7z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}
function IconClipboard({ size = 22, color = C.green }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={8} y={2} width={8} height={4} rx={1} stroke={color} strokeWidth={1.8} />
      <Path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M9 12h6M9 16h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IconStar({ size = 22, color = C.orange }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth={1.8} fill={color} strokeLinejoin="round" />
    </Svg>
  );
}
function IconCheckSquare({ size = 22, color = C.purple }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3} stroke={color} strokeWidth={1.8} />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconArrowUp({ size = 12, color = C.green }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 19V5M5 12l7-7 7 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconChevronLeft({ size = 16, color = C.slate }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconChevronRight({ size = 16, color = C.slate }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconCheckCircle({ size = 18, color = C.green }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} fill={color} />
      <Path d="M8 12l3 3 5-5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconTrophy({ size = 18, color = C.purple }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill={color} />
      <Path d="M8 5H5a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M16 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M12 13v4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M8.5 21h7l-1-4h-5l-1 4z" fill={color} />
    </Svg>
  );
}
function IconDoc({ size = 18, color = C.primary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={3} width={14} height={18} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M9 8h6M9 12h6M9 16h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IconAward({ size = 18, color = C.orange }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={6} stroke={color} strokeWidth={1.8} />
      <Path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ─────────────────────────────────────────
   SIDEBAR  (same as home.tsx uses but
   self-contained here so dashboard owns it)
───────────────────────────────────────── */
const NAV = [
  { label: "Home",          route: "/home",          icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M3 10.5 12 3l9 7.5" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /><Path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg> },
  { label: "Dashboard",     route: "/dashboard",     icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Rect x={3} y={3} width={8} height={8} rx={1.5} stroke={c} strokeWidth={1.8} /><Rect x={13} y={3} width={8} height={5} rx={1.5} stroke={c} strokeWidth={1.8} /><Rect x={13} y={11} width={8} height={10} rx={1.5} stroke={c} strokeWidth={1.8} /><Rect x={3} y={14} width={8} height={7} rx={1.5} stroke={c} strokeWidth={1.8} /></Svg> },
  { label: "Skills",        route: "/skills",        icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M12 3 2 8l10 5 10-5-10-5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" /><Path d="M6 11.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-4.5" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg> },
  { label: "Assignments",   route: "/assignments",   icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Rect x={5} y={4} width={14} height={17} rx={2} stroke={c} strokeWidth={1.8} /><Path d="M9 9h6M9 13h6M9 17h3" stroke={c} strokeWidth={1.8} strokeLinecap="round" /></Svg> },
  { label: "Explore",       route: "/explore",       icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle cx={11} cy={11} r={7} stroke={c} strokeWidth={1.8} /><Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={c} strokeWidth={1.8} strokeLinecap="round" /></Svg> },
  { label: "Students",      route: "/students",      icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle cx={9} cy={7} r={3.2} stroke={c} strokeWidth={1.8} /><Path d="M3 20v-1c0-2.8 2.7-5 6-5s6 2.2 6 5v1" stroke={c} strokeWidth={1.8} strokeLinecap="round" /><Path d="M16 4.2a3.2 3.2 0 0 1 0 6.2" stroke={c} strokeWidth={1.8} strokeLinecap="round" /><Path d="M19 20v-1c0-2.1-1.4-3.9-3.4-4.6" stroke={c} strokeWidth={1.8} strokeLinecap="round" /></Svg> },
  { label: "Chat",          route: "/chat",          icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M4 5h16v11H8l-4 4V5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" /></Svg> },
  { label: "Profile",       route: "/profile",       icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={8} r={3.5} stroke={c} strokeWidth={1.8} /><Path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={c} strokeWidth={1.8} strokeLinecap="round" /></Svg> },
  { label: "Settings",      route: "/settings",      icon: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={12} r={3} stroke={c} strokeWidth={1.8} /><Path d="M19.4 13.5a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.5a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6.1 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10.5a1.65 1.65 0 0 0 1-1.51V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10.5a1.65 1.65 0 0 0 1.51 1H19.5a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={c} strokeWidth={1.4} strokeLinejoin="round" /></Svg> },
];

/* ─────────────────────────────────────────
   CALENDAR HELPER
───────────────────────────────────────── */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const prev  = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number; current: boolean }> = [];
  for (let i = first - 1; i >= 0; i--) cells.push({ day: prev - i, current: false });
  for (let d = 1; d <= days; d++)       cells.push({ day: d, current: true });
  while (cells.length % 7 !== 0)        cells.push({ day: cells.length - days - first + 1, current: false });
  return cells;
}

/* ─────────────────────────────────────────
   XP DERIVER  (mirrors home.tsx logic)
───────────────────────────────────────── */
function deriveXp(skills: any[]) {
  if (!skills.length) return { level: 1, levelLabel: "Newcomer", xp: 0, xpMax: 500 };
  const totalAssign = skills.reduce((s: number, sk: any) => s + (sk.assignments_completed || 0), 0);
  const avgProg     = Math.round(skills.reduce((s: number, sk: any) => s + (sk.progress || 0), 0) / skills.length);
  const xp          = totalAssign * 100 + avgProg;
  const level       = Math.max(1, Math.floor(xp / 500) + 1);
  const labels      = ["Newcomer","Explorer","Learner","Builder","Developer","Expert","Master"];
  return { level, levelLabel: labels[Math.min(level - 1, labels.length - 1)], xp: xp % 500, xpMax: 500 };
}

/* ─────────────────────────────────────────
   SKILL ICON COLOURS  (cycle through palette)
───────────────────────────────────────── */
const SKILL_COLORS = [
  { bg: "#EAF0FE", text: "#1456F0" },
  { bg: "#DCFCE7", text: "#16A34A" },
  { bg: "#FEF3C7", text: "#D97706" },
  { bg: "#EDE9FE", text: "#7C3AED" },
  { bg: "#FEE2E2", text: "#DC2626" },
  { bg: "#E0F2FE", text: "#0369A1" },
];

function skillInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}

/* ─────────────────────────────────────────
   UPCOMING ASSIGNMENTS  (derived from skills)
   We build fake upcoming items from the real
   skill list so the section is never empty.
───────────────────────────────────────── */
const PRIORITY_LABELS = ["High", "Medium", "Low"] as const;
const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High:   { bg: "#FEE2E2", text: "#DC2626" },
  Medium: { bg: "#FEF3C7", text: "#D97706" },
  Low:    { bg: "#DCFCE7", text: "#16A34A" },
};

function buildUpcoming(skills: any[]) {
  return skills.slice(0, 3).map((sk, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i + 1) * 4);
    return {
      month: MONTHS[d.getMonth()].slice(0, 3).toUpperCase(),
      day:   d.getDate(),
      title: `${sk.name} Assignment`,
      due:   `Due in ${(i + 1) * 4} days`,
      priority: PRIORITY_LABELS[i % 3],
    };
  });
}

/* ─────────────────────────────────────────
   RECENT ACTIVITY  (derived from skills)
───────────────────────────────────────── */
function buildActivity(skills: any[], stats: any) {
  const items: Array<{ icon: JSX.Element; text: string; time: string }> = [];

  if (stats?.assignments > 0)
    items.push({ icon: <IconCheckCircle />, text: `Completed ${stats.assignments} assignment${stats.assignments !== 1 ? "s" : ""} total`, time: "recently" });

  skills.slice(0, 2).forEach((sk) => {
    if (sk.assignments_completed > 0)
      items.push({ icon: <IconDoc />, text: `Submitted assignment for "${sk.name}"`, time: `${sk.assignments_completed} completed` });
  });

  if (stats?.verifiedSkills > 0)
    items.push({ icon: <IconTrophy size={18} color={C.purple} />, text: `Learning ${stats.verifiedSkills} skill${stats.verifiedSkills !== 1 ? "s" : ""}`, time: "active" });

  if (items.length === 0)
    items.push({ icon: <IconAward />, text: "Welcome to SkillVerse! Start your learning journey.", time: "just now" });

  return items.slice(0, 4);
}

/* ─────────────────────────────────────────
   SCREEN
───────────────────────────────────────── */
export default function DashboardScreen() {
  const { token, userId, user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading]     = useState(true);

  // Calendar state
  const now      = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  /* ── LOAD DASHBOARD (unchanged logic) ── */
  const loadDashboard = async () => {
    if (!userId || !token) return;
    try {
      const res  = await apiFetch(`/api/dashboard/${userId}`, token);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load dashboard");
      setDashboard(data);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, [userId, token]);

  /* ── CONTINUE LEARNING (unchanged logic) ── */
  const startLearning = async (skillId: number, level: string = "Beginner") => {
    if (!userId || !token) return;
    try {
      const res  = await apiFetch("/api/ai/generate-assignment", token, {
        method: "POST",
        body: JSON.stringify({ userId, skillId, difficulty: level }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to generate assignment");
      router.push(`/assignment?id=${data.assignment.id}`);
    } catch (error) {
      Alert.alert("Error", "Could not generate assignment. Please try again.");
    }
  };

  /* ── LOGOUT (unchanged logic) ── */
  const handleLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: async () => { await logout(); router.replace("/login"); } },
    ]);
  };

  /* ── LOADING ── */
  if (!fontsLoaded || loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.loadingText}>Could not load dashboard.</Text>
      </View>
    );
  }

  /* ── DERIVED VALUES ── */
  const { user: dbUser, stats, skills } = dashboard;
  const initials  = dbUser.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "SK";
  const xpStats   = deriveXp(skills);
  const xpPct     = Math.round((xpStats.xp / xpStats.xpMax) * 100);
  const upcoming  = buildUpcoming(skills);
  const activity  = buildActivity(skills, stats);

  // Points = assignments × 150 (display metric)
  const points    = stats.assignments * 150;

  // Calendar
  const calCells  = buildCalendar(calYear, calMonth);
  const todayDay  = now.getDate();
  const isToday   = (day: number, current: boolean) =>
    current && day === todayDay && calYear === now.getFullYear() && calMonth === now.getMonth();

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  return (
    <View style={s.root}>
      {/* ══════════════ TOP NAVBAR ══════════════ */}
      <View style={s.navbar}>
        {/* Logo */}
        <Pressable style={s.logoRow} onPress={() => router.push("/home")}>
          <View style={s.logoBox}>
            <Svg width={22} height={22} viewBox="0 0 40 44" fill="none">
              <Path d="M20 1 L38 11.5 V32.5 L20 43 L2 32.5 V11.5 Z" fill={C.primary} />
              <Path d="M20 1 L38 11.5 L20 22 L2 11.5 Z" fill="#3B76FF" />
            </Svg>
          </View>
          <Text style={s.logoText}>
            Skill<Text style={{ color: C.primary }}>Verse</Text>
          </Text>
        </Pressable>

        {/* Search */}
        <View style={s.searchBar}>
          <IconSearch size={16} />
          <TextInput
            placeholder="Search posts, people, skills, projects..."
            placeholderTextColor={C.slateLight}
            style={s.searchInput}
          />
        </View>

        {/* Right */}
        <View style={s.navRight}>
          <Pressable style={s.navIconBtn} onPress={() => router.push("/notifications")}>
            <IconBell size={20} color={C.slate} />
            <View style={s.notifDot} />
          </Pressable>
          <Pressable style={s.userPill} onPress={() => router.push("/profile")}>
            <View style={s.userAvatar}>
              <Text style={s.userAvatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={s.userName}>{dbUser.name}</Text>
              <Text style={s.userRole}>{dbUser.department || "Student"}</Text>
            </View>
            <IconChevronDown size={13} color={C.slate} />
          </Pressable>
        </View>
      </View>

      {/* ══════════════ BODY ══════════════ */}
      <View style={s.body}>

        {/* ─── SIDEBAR ─── */}
        <View style={s.sidebar}>
          <View style={s.navList}>
            {NAV.map((item) => {
              const active = false; // pathname hook not imported here — active state handled via nav
              const isActive = item.route === "/dashboard";
              return (
                <Pressable
                  key={item.route}
                  style={[s.navItem, isActive && s.navItemActive]}
                  onPress={() => router.push(item.route as any)}
                >
                  {item.icon(isActive ? C.primary : C.slate)}
                  <Text style={[s.navLabel, isActive && s.navLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* XP Card */}
          <View style={s.xpCard}>
            <Text style={s.xpLevel}>Level {xpStats.level}</Text>
            <Text style={s.xpLabel}>{xpStats.levelLabel}</Text>
            <View style={s.xpTrack}>
              <View style={[s.xpFill, { width: `${xpPct}%` as any }]} />
            </View>
            <View style={s.xpRow}>
              <Text style={s.xpText}>{xpStats.xp} / {xpStats.xpMax} XP</Text>
              <View style={s.trophyCircle}>
                <IconTrophy size={14} color={C.primary} />
              </View>
            </View>
          </View>
        </View>

        {/* ─── MAIN SCROLL ─── */}
        <ScrollView style={s.main} contentContainerStyle={s.mainContent} showsVerticalScrollIndicator={false}>

          {/* BACK + TITLE */}
          <View style={s.pageHeader}>
            <Pressable style={s.backBtn} onPress={() => router.push("/home")}>
              <IconArrowLeft size={15} color={C.primary} />
              <Text style={s.backText}>Back</Text>
            </Pressable>
            <View>
              <Text style={s.pageTitle}>Dashboard</Text>
              <Text style={s.pageSubtitle}>Track your learning progress and stay on top of your goals.</Text>
            </View>
          </View>

          {/* ── STAT CARDS ── */}
          <View style={s.statRow}>
            <StatCard
              icon={<View style={[s.statIconBg, { backgroundColor: "#EAF0FE" }]}><IconBookOpen size={22} color={C.primary} /></View>}
              label="Skills Learned"
              value={stats.verifiedSkills}
              trend={`${stats.verifiedSkills} this month`}
            />
            <StatCard
              icon={<View style={[s.statIconBg, { backgroundColor: "#DCFCE7" }]}><IconClipboard size={22} color={C.green} /></View>}
              label="Assignments"
              value={stats.assignments}
              trend={`${stats.assignments} this week`}
            />
            <StatCard
              icon={<View style={[s.statIconBg, { backgroundColor: "#FEF3C7" }]}><IconStar size={22} color={C.orange} /></View>}
              label="Points"
              value={points}
              trend={`${points} this month`}
            />
            <StatCard
              icon={<View style={[s.statIconBg, { backgroundColor: "#EDE9FE" }]}><IconCheckSquare size={22} color={C.purple} /></View>}
              label="Completed Tasks"
              value={stats.assignments}
              trend={`${stats.assignments} this week`}
            />
          </View>

          {/* ── MIDDLE ROW: Continue Learning + Upcoming Assignments ── */}
          <View style={s.midRow}>

            {/* Continue Learning */}
            <View style={[s.card, s.learnCard]}>
              <View style={s.cardHeaderRow}>
                <Text style={s.cardTitle}>Continue Learning</Text>
                <Pressable onPress={() => router.push("/skills")}>
                  <Text style={s.viewAll}>View all</Text>
                </Pressable>
              </View>

              {skills.length === 0 ? (
                <View style={s.emptyLearn}>
                  <Text style={s.emptyLearnText}>No skills added yet.</Text>
                  <Pressable style={s.addSkillBtn} onPress={() => router.push("/skills")}>
                    <Text style={s.addSkillText}>Choose Skills →</Text>
                  </Pressable>
                </View>
              ) : (
                skills.slice(0, 3).map((skill: any, idx: number) => {
                  const col = SKILL_COLORS[idx % SKILL_COLORS.length];
                  return (
                    <Pressable
                      key={skill.id}
                      style={s.learnRow}
                      onPress={() => startLearning(skill.skill_id, skill.level)}
                    >
                      <View style={[s.skillIcon, { backgroundColor: col.bg }]}>
                        <Text style={[s.skillIconText, { color: col.text }]}>
                          {skillInitials(skill.name)}
                        </Text>
                      </View>
                      <View style={s.learnInfo}>
                        <Text style={s.learnName}>{skill.name}</Text>
                        <View style={s.learnProgressTrack}>
                          <View style={[s.learnProgressFill, { width: `${skill.progress}%` as any, backgroundColor: col.text }]} />
                        </View>
                        <Text style={s.learnMeta}>
                          {skill.level} · {skill.assignments_completed} Lessons
                        </Text>
                      </View>
                      <Text style={[s.learnPct, { color: col.text }]}>{skill.progress}%</Text>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* Upcoming Assignments */}
            <View style={[s.card, s.upcomingCard]}>
              <View style={s.cardHeaderRow}>
                <Text style={s.cardTitle}>Upcoming Assignments</Text>
                <Pressable onPress={() => router.push("/assignments")}>
                  <Text style={s.viewAll}>View all</Text>
                </Pressable>
              </View>

              {upcoming.length === 0 ? (
                <Text style={s.emptyLearnText}>No upcoming assignments.</Text>
              ) : (
                upcoming.map((a, i) => {
                  const pc = PRIORITY_COLORS[a.priority];
                  return (
                    <View key={i} style={s.upcomingRow}>
                      <View style={s.upcomingDate}>
                        <Text style={s.upcomingMonth}>{a.month}</Text>
                        <Text style={s.upcomingDay}>{a.day}</Text>
                      </View>
                      <View style={s.upcomingInfo}>
                        <Text style={s.upcomingTitle} numberOfLines={1}>{a.title}</Text>
                        <Text style={s.upcomingDue}>{a.due}</Text>
                      </View>
                      <View style={[s.priorityBadge, { backgroundColor: pc.bg }]}>
                        <Text style={[s.priorityText, { color: pc.text }]}>{a.priority}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* ── BOTTOM ROW: Recent Activity + Calendar ── */}
          <View style={s.bottomRow}>

            {/* Recent Activity */}
            <View style={[s.card, s.activityCard]}>
              <View style={s.cardHeaderRow}>
                <Text style={s.cardTitle}>Recent Activity</Text>
                <Pressable>
                  <Text style={s.viewAll}>View all</Text>
                </Pressable>
              </View>

              {activity.map((a, i) => (
                <View key={i} style={s.activityRow}>
                  <View style={s.activityIconWrap}>{a.icon}</View>
                  <Text style={s.activityText} numberOfLines={2}>{a.text}</Text>
                  <Text style={s.activityTime}>{a.time}</Text>
                </View>
              ))}
            </View>

            {/* Calendar */}
            <View style={[s.card, s.calCard]}>
              <View style={s.cardHeaderRow}>
                <Text style={s.cardTitle}>Calendar</Text>
                <Pressable>
                  <Text style={s.viewAll}>View full calendar</Text>
                </Pressable>
              </View>

              {/* Month nav */}
              <View style={s.calMonthRow}>
                <Text style={s.calMonthLabel}>{MONTHS[calMonth]} {calYear}</Text>
                <View style={s.calNavBtns}>
                  <Pressable style={s.calNavBtn} onPress={prevMonth}>
                    <IconChevronLeft size={14} color={C.slate} />
                  </Pressable>
                  <Pressable style={s.calNavBtn} onPress={nextMonth}>
                    <IconChevronRight size={14} color={C.slate} />
                  </Pressable>
                </View>
              </View>

              {/* Day headers */}
              <View style={s.calDayHeaders}>
                {DAYS.map((d) => (
                  <Text key={d} style={s.calDayHeader}>{d}</Text>
                ))}
              </View>

              {/* Cells */}
              <View style={s.calGrid}>
                {calCells.map((cell, idx) => {
                  const today = isToday(cell.day, cell.current);
                  return (
                    <View key={idx} style={s.calCell}>
                      <View style={[s.calDayWrap, today && s.calDayToday]}>
                        <Text style={[
                          s.calDayText,
                          !cell.current && s.calDayOther,
                          today && s.calDayTodayText,
                        ]}>
                          {cell.day}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────
   STAT CARD COMPONENT
───────────────────────────────────────── */
function StatCard({ icon, label, value, trend }: {
  icon: JSX.Element;
  label: string;
  value: number;
  trend: string;
}) {
  return (
    <View style={s.statCard}>
      {icon}
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value.toLocaleString()}</Text>
      <View style={s.trendRow}>
        <IconArrowUp size={11} color={C.green} />
        <Text style={s.trendText}>{trend}</Text>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.bg },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg },
  loadingText:    { marginTop: 12, fontSize: 15, color: C.slate, fontFamily: FONT.medium },

  /* NAVBAR */
  navbar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    zIndex: 10,
  },
  logoRow:    { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 160 },
  logoBox:    { width: 34, height: 34, borderRadius: 9, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" },
  logoText:   { fontFamily: FONT.extrabold, fontSize: 18, color: C.navy },
  searchBar:  { flex: 1, maxWidth: 480, height: 40, backgroundColor: "#F1F4FA", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 },
  searchInput:{ flex: 1, fontFamily: FONT.regular, fontSize: 13, color: C.navy, outlineStyle: "none" as any },
  navRight:   { flexDirection: "row", alignItems: "center", gap: 12, marginLeft: "auto" },
  navIconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", position: "relative" },
  notifDot:   { position: "absolute", top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: C.red, borderWidth: 1.5, borderColor: C.card },
  userPill:   { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  userAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  userAvatarText: { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 12 },
  userName:   { fontFamily: FONT.bold, fontSize: 13, color: C.navy },
  userRole:   { fontFamily: FONT.regular, fontSize: 11, color: C.slate, marginTop: 1 },

  /* BODY */
  body: { flex: 1, flexDirection: "row" },

  /* SIDEBAR */
  sidebar: {
    width: 220,
    backgroundColor: C.card,
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingTop: 14,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  navList:      { gap: 2 },
  navItem:      { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10 },
  navItemActive:{ backgroundColor: C.primarySoft },
  navLabel:     { fontFamily: FONT.medium, fontSize: 13.5, color: C.slateDark },
  navLabelActive:{ color: C.primary, fontFamily: FONT.semibold },
  xpCard:       { marginBottom: 14, backgroundColor: "#F8F9FC", borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14 },
  xpLevel:      { fontFamily: FONT.extrabold, fontSize: 15, color: C.navy },
  xpLabel:      { fontFamily: FONT.regular, fontSize: 11.5, color: C.slate, marginTop: 1 },
  xpTrack:      { height: 6, borderRadius: 3, backgroundColor: "#E4E8F0", marginTop: 12, overflow: "hidden" },
  xpFill:       { height: "100%", borderRadius: 3, backgroundColor: C.primary },
  xpRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  xpText:       { fontFamily: FONT.medium, fontSize: 11, color: C.slate },
  trophyCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" },

  /* MAIN */
  main:        { flex: 1 },
  mainContent: { padding: 28, gap: 22, paddingBottom: 40 },

  /* PAGE HEADER */
  pageHeader: { flexDirection: "row", alignItems: "center", gap: 20 },
  backBtn:    { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  backText:   { fontFamily: FONT.semibold, fontSize: 13, color: C.primary },
  pageTitle:  { fontFamily: FONT.extrabold, fontSize: 26, color: C.navy },
  pageSubtitle:{ fontFamily: FONT.regular, fontSize: 13, color: C.slate, marginTop: 3 },

  /* STAT CARDS */
  statRow:  { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: 160, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 20, gap: 6 },
  statIconBg:{ width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  statLabel:{ fontFamily: FONT.medium, fontSize: 13, color: C.slate },
  statValue:{ fontFamily: FONT.extrabold, fontSize: 28, color: C.navy },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  trendText:{ fontFamily: FONT.medium, fontSize: 11.5, color: C.green },

  /* MID ROW */
  midRow:       { flexDirection: "row", gap: 20, flexWrap: "wrap" },
  card:         { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 20 },
  learnCard:    { flex: 2, minWidth: 280 },
  upcomingCard: { flex: 1.4, minWidth: 240 },
  cardHeaderRow:{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  cardTitle:    { fontFamily: FONT.bold, fontSize: 15, color: C.navy },
  viewAll:      { fontFamily: FONT.semibold, fontSize: 12.5, color: C.primary },

  /* LEARN ROW */
  emptyLearn:    { alignItems: "center", paddingVertical: 20 },
  emptyLearnText:{ fontFamily: FONT.regular, fontSize: 13, color: C.slate },
  addSkillBtn:   { marginTop: 12, backgroundColor: C.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  addSkillText:  { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 13 },
  learnRow:      { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  skillIcon:     { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  skillIconText: { fontFamily: FONT.extrabold, fontSize: 14 },
  learnInfo:     { flex: 1 },
  learnName:     { fontFamily: FONT.bold, fontSize: 14, color: C.navy },
  learnProgressTrack:{ height: 5, backgroundColor: "#E8ECF2", borderRadius: 3, marginTop: 7, marginBottom: 5, overflow: "hidden" },
  learnProgressFill: { height: "100%", borderRadius: 3 },
  learnMeta:     { fontFamily: FONT.regular, fontSize: 11.5, color: C.slate },
  learnPct:      { fontFamily: FONT.bold, fontSize: 14 },

  /* UPCOMING */
  upcomingRow:  { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  upcomingDate: { width: 44, alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 10, paddingVertical: 8 },
  upcomingMonth:{ fontFamily: FONT.semibold, fontSize: 9.5, color: C.primary },
  upcomingDay:  { fontFamily: FONT.extrabold, fontSize: 18, color: C.primary, marginTop: -1 },
  upcomingInfo: { flex: 1 },
  upcomingTitle:{ fontFamily: FONT.bold, fontSize: 13.5, color: C.navy },
  upcomingDue:  { fontFamily: FONT.regular, fontSize: 11.5, color: C.slate, marginTop: 2 },
  priorityBadge:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priorityText: { fontFamily: FONT.bold, fontSize: 11.5 },

  /* BOTTOM ROW */
  bottomRow:    { flexDirection: "row", gap: 20, flexWrap: "wrap" },
  activityCard: { flex: 2, minWidth: 280 },
  calCard:      { flex: 1.4, minWidth: 240 },

  /* ACTIVITY */
  activityRow:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  activityIconWrap:{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  activityText:   { flex: 1, fontFamily: FONT.medium, fontSize: 13, color: C.slateDark, lineHeight: 19 },
  activityTime:   { fontFamily: FONT.regular, fontSize: 11.5, color: C.slateLight, flexShrink: 0 },

  /* CALENDAR */
  calMonthRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  calMonthLabel: { fontFamily: FONT.bold, fontSize: 14, color: C.navy },
  calNavBtns:    { flexDirection: "row", gap: 4 },
  calNavBtn:     { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  calDayHeaders: { flexDirection: "row", marginBottom: 6 },
  calDayHeader:  { flex: 1, fontFamily: FONT.semibold, fontSize: 10.5, color: C.slateLight, textAlign: "center" },
  calGrid:       { flexDirection: "row", flexWrap: "wrap" },
  calCell:       { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: "center", justifyContent: "center", paddingVertical: 2 },
  calDayWrap:    { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  calDayToday:   { backgroundColor: C.primary },
  calDayText:    { fontFamily: FONT.medium, fontSize: 12, color: C.slateDark },
  calDayOther:   { color: C.slateLight },
  calDayTodayText:{ color: "#FFFFFF", fontFamily: FONT.bold },
});
