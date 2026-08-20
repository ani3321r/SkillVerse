/**
 * AppLayout
 * ─────────
 * Shared wrapper used by every authenticated screen.
 * Renders the top navbar + left sidebar, then places
 * {children} in the scrollable main content area.
 *
 * Usage:
 *   <AppLayout activeRoute="/profile">
 *     <YourContent />
 *   </AppLayout>
 *
 * The children are placed inside a ScrollView by default.
 * Pass scrollable={false} when the child manages its own
 * scroll (e.g. FlatList, chat screen).
 */

import React from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, useWindowDimensions,
} from "react-native";
import { router, usePathname } from "expo-router";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { useAuth } from "../context/AuthContext";

/* ── TOKENS ─────────────────────────────── */
export const C = {
  primary:     "#1456F0",
  primarySoft: "#EAF0FE",
  navy:        "#0B1D3C",
  slate:       "#64748B",
  slateLight:  "#94A3B8",
  slateDark:   "#334155",
  border:      "#E8ECF2",
  bg:          "#F4F6FB",
  card:        "#FFFFFF",
};

export const F = {
  r: "PlusJakartaSans_400Regular",
  m: "PlusJakartaSans_500Medium",
  s: "PlusJakartaSans_600SemiBold",
  b: "PlusJakartaSans_700Bold",
  x: "PlusJakartaSans_800ExtraBold",
};

/* ── NAV ITEMS ──────────────────────────── */
const NAV_ITEMS = [
  { label: "Home",          route: "/home" },
  { label: "Dashboard",     route: "/dashboard" },
  { label: "Skills",        route: "/skills" },
  { label: "Assignments",   route: "/assignments" },
  { label: "Hackathons",    route: "/hackathons" },
  { label: "Explore",       route: "/explore" },
  { label: "Chat",          route: "/chat" },
  { label: "Bookmarks",     route: "/bookmarks" },
  { label: "Notifications", route: "/notifications" },
  { label: "Profile",       route: "/profile" },
  { label: "Settings",      route: "/settings" },
];

/* ── NAV ICONS ──────────────────────────── */
function NavIcon({ route, color }: { route: string; color: string }) {
  const s = 18;
  if (route === "/home")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M3 10.5 12 3l9 7.5" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"/><Path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"/></Svg>;
  if (route === "/dashboard")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x={3} y={3} width={8} height={8} rx={1.5} stroke={color} strokeWidth={1.9}/><Rect x={13} y={3} width={8} height={5} rx={1.5} stroke={color} strokeWidth={1.9}/><Rect x={13} y={11} width={8} height={10} rx={1.5} stroke={color} strokeWidth={1.9}/><Rect x={3} y={14} width={8} height={7} rx={1.5} stroke={color} strokeWidth={1.9}/></Svg>;
  if (route === "/skills")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M12 3 2 8l10 5 10-5-10-5z" stroke={color} strokeWidth={1.9} strokeLinejoin="round"/><Path d="M6 11.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-4.5" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"/></Svg>;
  if (route === "/assignments")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x={5} y={4} width={14} height={17} rx={2} stroke={color} strokeWidth={1.9}/><Path d="M9 9h6M9 13h6M9 17h3" stroke={color} strokeWidth={1.9} strokeLinecap="round"/></Svg>;
  if (route === "/hackathons")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" stroke={color} strokeWidth={1.9} strokeLinejoin="round"/><Path d="M8 5H5a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" stroke={color} strokeWidth={1.9} strokeLinecap="round"/><Path d="M16 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" stroke={color} strokeWidth={1.9} strokeLinecap="round"/><Path d="M12 13v4" stroke={color} strokeWidth={1.9} strokeLinecap="round"/><Path d="M8.5 21h7l-1-4h-5l-1 4z" stroke={color} strokeWidth={1.9} strokeLinejoin="round"/></Svg>;
  if (route === "/explore")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.9}/><Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={color} strokeWidth={1.9} strokeLinecap="round"/></Svg>;
  if (route === "/chat")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M4 5h16v11H8l-4 4V5z" stroke={color} strokeWidth={1.9} strokeLinejoin="round"/></Svg>;
  if (route === "/bookmarks")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M6 4h12v17l-6-4-6 4V4z" stroke={color} strokeWidth={1.9} strokeLinejoin="round"/></Svg>;
  if (route === "/notifications")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke={color} strokeWidth={1.9} strokeLinejoin="round"/><Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.9} strokeLinecap="round"/></Svg>;
  if (route === "/profile")
    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.9}/><Path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={color} strokeWidth={1.9} strokeLinecap="round"/></Svg>;
  // settings
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.9}/><Path d="M19.4 13.5a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.5a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6.1 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10.5a1.65 1.65 0 0 0 1-1.51V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10.5a1.65 1.65 0 0 0 1.51 1H19.5a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth={1.4} strokeLinejoin="round"/></Svg>;
}

/* ── PROPS ──────────────────────────────── */
type Props = {
  children: React.ReactNode;
  /** Pass false when the child manages its own scroll (e.g. chat FlatList) */
  scrollable?: boolean;
  /** contentContainerStyle for the inner ScrollView */
  contentStyle?: object;
};

/* ── COMPONENT ──────────────────────────── */
export default function AppLayout({ children, scrollable = true, contentStyle }: Props) {
  const { user } = useAuth();
  const pathname = usePathname();

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const initials = user?.name
    ?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "SK";

  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>

      {/* ═══ TOP NAVBAR ═══ */}
      <View style={s.navbar}>
        {/* Logo */}
        <Pressable style={s.logoWrap} onPress={() => router.push("/home")}>
          <View style={s.logoBox}>
            <Svg width={16} height={18} viewBox="0 0 40 44" fill="none">
              <Path d="M20 1 L38 11.5 V32.5 L20 43 L2 32.5 V11.5 Z" fill={C.primary}/>
              <Path d="M20 1 L38 11.5 L20 22 L2 11.5 Z" fill="#3B76FF"/>
            </Svg>
          </View>
          <Text style={s.logoTxt}>
            Skill<Text style={{ color: C.primary }}>Verse</Text>
          </Text>
        </Pressable>

        {/* Search */}
        <View style={s.searchBar}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={7} stroke={C.slateLight} strokeWidth={2}/>
            <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={C.slateLight} strokeWidth={2} strokeLinecap="round"/>
          </Svg>
          <TextInput
            placeholder="Search posts, people, skills, projects..."
            placeholderTextColor={C.slateLight}
            style={s.searchInput}
          />
        </View>

        {/* Right actions */}
        <View style={s.navRight}>
          <Pressable style={s.iconBtn} onPress={() => router.push("/notifications")}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke={C.slate} strokeWidth={1.8} strokeLinejoin="round"/>
              <Path d="M10 19a2 2 0 0 0 4 0" stroke={C.slate} strokeWidth={1.8} strokeLinecap="round"/>
            </Svg>
            <View style={s.notifDot} />
          </Pressable>

          <Pressable style={s.userPill} onPress={() => router.push("/profile")}>
            <View style={s.uAvatar}>
              <Text style={s.uInitial}>{initials}</Text>
            </View>
            <View>
              <Text style={s.uName} numberOfLines={1}>{user?.name || "Student"}</Text>
              <Text style={s.uRole} numberOfLines={1}>{user?.department || "Student"}</Text>
            </View>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <Polyline points="6 9 12 15 18 9" stroke={C.slate} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* ═══ BODY ═══ */}
      <View style={s.body}>

        {/* SIDEBAR */}
        <View style={s.sidebar}>
          <View style={s.navList}>
            {NAV_ITEMS.map((item) => {
              // treat /assignment as active for /assignments
              const active =
                pathname === item.route ||
                (item.route === "/assignments" && pathname === "/assignment");
              return (
                <Pressable
                  key={item.route}
                  style={[s.navItem, active && s.navActive]}
                  onPress={() => router.push(item.route as any)}
                >
                  <NavIcon route={item.route} color={active ? C.primary : C.slate} />
                  <Text style={[s.navLabel, active && s.navLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* XP card */}
          <View style={s.xpCard}>
            <Text style={s.xpLv}>SkillVerse</Text>
            <Text style={s.xpSub}>Your learning journey</Text>
            <View style={s.xpTrack}>
              <View style={[s.xpFill, { width: "40%" }]} />
            </View>
            <View style={s.xpRow}>
              <Text style={s.xpNum}>Keep learning 🚀</Text>
            </View>
          </View>
        </View>

        {/* MAIN CONTENT */}
        {scrollable ? (
          <ScrollView
            style={s.main}
            contentContainerStyle={[s.mainPad, contentStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={s.main}>
            {children}
          </View>
        )}
      </View>
    </View>
  );
}

/* ── STYLES ──────────────────────────────── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  /* NAVBAR */
  navbar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    zIndex: 10,
  },
  logoWrap:  { flexDirection: "row", alignItems: "center", gap: 7, width: 148 },
  logoBox:   { width: 30, height: 30, borderRadius: 8, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" },
  logoTxt:   { fontFamily: F.x, fontSize: 16.5, color: C.navy },
  searchBar: { flex: 1, height: 38, backgroundColor: "#F1F4FA", borderRadius: 9, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, gap: 7 },
  searchInput: { flex: 1, fontFamily: F.r, fontSize: 13, color: C.navy, outlineStyle: "none" as any },
  navRight:  { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn:   { width: 36, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center", position: "relative" },
  notifDot:  { position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: C.card },
  userPill:  { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9, borderWidth: 1, borderColor: C.border },
  uAvatar:   { width: 30, height: 30, borderRadius: 15, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  uInitial:  { color: "#FFFFFF", fontFamily: F.b, fontSize: 12 },
  uName:     { fontFamily: F.b, fontSize: 12.5, color: C.navy, maxWidth: 120 },
  uRole:     { fontFamily: F.r, fontSize: 10.5, color: C.slate },

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
  navList:       { gap: 2 },
  navItem:       { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10 },
  navActive:     { backgroundColor: C.primarySoft },
  navLabel:      { fontFamily: F.m, fontSize: 13.5, color: C.slateDark },
  navLabelActive:{ color: C.primary, fontFamily: F.s },

  /* XP CARD */
  xpCard:  { marginBottom: 14, backgroundColor: "#F8F9FC", borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14 },
  xpLv:    { fontFamily: F.x, fontSize: 13.5, color: C.navy },
  xpSub:   { fontFamily: F.r, fontSize: 11, color: C.slate, marginTop: 1 },
  xpTrack: { height: 5, borderRadius: 3, backgroundColor: "#E4E8F0", marginTop: 10, overflow: "hidden" },
  xpFill:  { height: "100%", borderRadius: 3, backgroundColor: C.primary },
  xpRow:   { marginTop: 8 },
  xpNum:   { fontFamily: F.m, fontSize: 11, color: C.slate },

  /* MAIN */
  main:    { flex: 1 },
  mainPad: { padding: 28, paddingBottom: 40 },
});
