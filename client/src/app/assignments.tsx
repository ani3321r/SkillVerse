import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, Pressable,
  ScrollView, ActivityIndicator, Alert, TextInput,
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

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

/* ── TOKENS ─────────────────────────────── */
const P   = "#1456F0";
const PS  = "#EAF0FE";
const NV  = "#0B1D3C";
const SL  = "#64748B";
const SLL = "#94A3B8";
const BD  = "#E8ECF2";
const BG  = "#F4F6FB";
const WH  = "#FFFFFF";

const F = {
  r: "PlusJakartaSans_400Regular",
  m: "PlusJakartaSans_500Medium",
  s: "PlusJakartaSans_600SemiBold",
  b: "PlusJakartaSans_700Bold",
  x: "PlusJakartaSans_800ExtraBold",
};

/* ── SIDEBAR NAV ────────────────────────── */
const NAV = [
  { label: "Home",        path: "/home" },
  { label: "Dashboard",   path: "/dashboard" },
  { label: "Skills",      path: "/skills" },
  { label: "Assignments", path: "/assignments" },
  { label: "Explore",     path: "/explore" },
  { label: "Students",    path: "/students" },
  { label: "Chat",        path: "/chat" },
  { label: "Profile",     path: "/profile" },
  { label: "Settings",    path: "/settings" },
];

function NavIcon({ name, color }: { name: string; color: string }) {
  const s = 17;
  if (name === "Home")        return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M3 10.5 12 3l9 7.5" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"/><Path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"/></Svg>;
  if (name === "Dashboard")   return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x={3} y={3} width={8} height={8} rx={1.5} stroke={color} strokeWidth={1.9}/><Rect x={13} y={3} width={8} height={5} rx={1.5} stroke={color} strokeWidth={1.9}/><Rect x={13} y={11} width={8} height={10} rx={1.5} stroke={color} strokeWidth={1.9}/><Rect x={3} y={14} width={8} height={7} rx={1.5} stroke={color} strokeWidth={1.9}/></Svg>;
  if (name === "Skills")      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M12 3 2 8l10 5 10-5-10-5z" stroke={color} strokeWidth={1.9} strokeLinejoin="round"/><Path d="M6 11.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-4.5" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"/></Svg>;
  if (name === "Assignments")  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x={5} y={4} width={14} height={17} rx={2} stroke={color} strokeWidth={1.9}/><Path d="M9 9h6M9 13h6M9 17h3" stroke={color} strokeWidth={1.9} strokeLinecap="round"/></Svg>;
  if (name === "Explore")     return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.9}/><Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={color} strokeWidth={1.9} strokeLinecap="round"/></Svg>;
  if (name === "Students")    return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx={9} cy={7} r={3.2} stroke={color} strokeWidth={1.9}/><Path d="M3 20v-1c0-2.8 2.7-5 6-5s6 2.2 6 5v1" stroke={color} strokeWidth={1.9} strokeLinecap="round"/><Path d="M16 4.2a3.2 3.2 0 0 1 0 6.2" stroke={color} strokeWidth={1.9} strokeLinecap="round"/><Path d="M19 20v-1c0-2.1-1.4-3.9-3.4-4.6" stroke={color} strokeWidth={1.9} strokeLinecap="round"/></Svg>;
  if (name === "Chat")        return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M4 5h16v11H8l-4 4V5z" stroke={color} strokeWidth={1.9} strokeLinejoin="round"/></Svg>;
  if (name === "Profile")     return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.9}/><Path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={color} strokeWidth={1.9} strokeLinecap="round"/></Svg>;
  return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.9}/><Path d="M19.4 13.5a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.5a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6.1 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10.5a1.65 1.65 0 0 0 1-1.51V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10.5a1.65 1.65 0 0 0 1.51 1H19.5a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth={1.4} strokeLinejoin="round"/></Svg>;
}

/* ── SKILL ICON PALETTE ─────────────────── */
const SKILL_PALETTE: Record<string, { bg: string; text: string; icon: string }> = {
  "JavaScript":      { bg: "#FEF3C7", text: "#D97706", icon: "JS" },
  "React":           { bg: "#DBEAFE", text: "#1D4ED8", icon: "Re" },
  "Node.js":         { bg: "#DCFCE7", text: "#15803D", icon: "NJ" },
  "Python":          { bg: "#EDE9FE", text: "#6D28D9", icon: "PY" },
  "Java":            { bg: "#FEE2E2", text: "#B91C1C", icon: "Ja" },
  "C++":             { bg: "#E0F2FE", text: "#0369A1", icon: "C+" },
  "Data Structures": { bg: "#EDE9FE", text: "#7C3AED", icon: "DS" },
  "Machine Learning":{ bg: "#FEE2E2", text: "#DC2626", icon: "ML" },
  "UI/UX Design":    { bg: "#FCE7F3", text: "#BE185D", icon: "UX" },
  "Cybersecurity":   { bg: "#DBEAFE", text: "#1E40AF", icon: "CS" },
  "Arduino":         { bg: "#CCFBF1", text: "#0F766E", icon: "Ar" },
  "ESP32":           { bg: "#E0F2FE", text: "#0369A1", icon: "E3" },
  "Robotics":        { bg: "#E2E8F0", text: "#334155", icon: "Ro" },
};

function getSkillPalette(name: string) {
  return SKILL_PALETTE[name] ?? { bg: PS, text: P, icon: name.slice(0, 2).toUpperCase() };
}

/* ── STATUS CONFIG ──────────────────────── */
type StatusKey = "To Do" | "In Progress" | "Submitted" | "Graded";
const STATUS_CONFIG: Record<StatusKey, { bg: string; text: string }> = {
  "To Do":      { bg: "#EAF0FE", text: "#1456F0" },
  "In Progress":{ bg: "#FEF3C7", text: "#D97706" },
  "Submitted":  { bg: "#DCFCE7", text: "#16A34A" },
  "Graded":     { bg: "#F3E8FF", text: "#7C3AED" },
};

/* ── STATUS DERIVED FROM SKILL DATA ─────── */
function getStatus(skill: Skill): StatusKey {
  if (skill.assignments_completed === 0) return "To Do";
  if (skill.progress < 40)               return "In Progress";
  if (skill.progress < 80)               return "Submitted";
  return "Graded";
}

/* ── FILTER TABS ────────────────────────── */
const TABS = ["All", "To Do", "In Progress", "Submitted", "Graded"] as const;
type TabKey = typeof TABS[number];

/* ── TYPES ──────────────────────────────── */
type Skill = {
  skill_id: number;
  name: string;
  category: string;
  level: string;
  progress: number;
  assignments_completed: number;
};

/* ── POINTS BY LEVEL ─────────────────────── */
const LEVEL_POINTS: Record<string, number> = {
  Beginner:     100,
  Intermediate: 150,
  Advanced:     200,
};

/* ── DUE DATE (relative from today) ─────── */
function fakeDue(index: number): string {
  const d = new Date();
  d.setDate(d.getDate() + (index + 1) * 4);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(",", "");
}

/* ══════════════════════════════════════════
   SCREEN
══════════════════════════════════════════ */
export default function AssignmentsScreen() {
  const { token, userId, user } = useAuth();

  const [skills,     setSkills]     = useState<Skill[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState<number | null>(null);
  const [activeTab,  setActiveTab]  = useState<TabKey>("All");

  const initials = user?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "SK";

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  /* ── LOAD SKILLS (unchanged logic) ── */
  const loadSkills = useCallback(async () => {
    if (!userId || !token) return;
    try {
      setLoading(true);
      const res  = await apiFetch(`/api/skills/user/${userId}`, token);
      const data = await res.json();
      if (data.success) setSkills(data.skills || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useFocusEffect(useCallback(() => { loadSkills(); }, [loadSkills]));

  /* ── GENERATE ASSIGNMENT — server decides difficulty, client only sends userId + skillId ── */
  const startAssignment = async (skillId: number) => {
    if (!userId || !token) return;
    setGenerating(skillId);
    try {
      const res  = await apiFetch("/api/ai/generate-assignment", token, {
        method: "POST",
        body: JSON.stringify({ userId: Number(userId), skillId: Number(skillId) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to generate");
      router.push(`/assignment?id=${data.assignment.id}`);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Could not generate assignment.");
    } finally {
      setGenerating(null);
    }
  };

  /* ── FILTER ── */
  const filtered = activeTab === "All"
    ? skills
    : skills.filter((sk) => getStatus(sk) === activeTab);

  if (!fontsLoaded || loading) {
    return (
      <View style={g.center}>
        <ActivityIndicator size="large" color={P} />
        <Text style={g.loadTxt}>Loading assignments...</Text>
      </View>
    );
  }

  return (
    <View style={g.root}>

      {/* ═══ NAVBAR ═══ */}
      <View style={g.navbar}>
        <Pressable style={g.logoWrap} onPress={() => router.push("/home")}>
          <View style={g.logoBox}>
            <Svg width={16} height={18} viewBox="0 0 40 44" fill="none">
              <Path d="M20 1 L38 11.5 V32.5 L20 43 L2 32.5 V11.5 Z" fill={P}/>
              <Path d="M20 1 L38 11.5 L20 22 L2 11.5 Z" fill="#3B76FF"/>
            </Svg>
          </View>
          <Text style={g.logoTxt}>Skill<Text style={{ color: P }}>Verse</Text></Text>
        </Pressable>

        <View style={g.searchBar}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={7} stroke={SLL} strokeWidth={2}/>
            <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={SLL} strokeWidth={2} strokeLinecap="round"/>
          </Svg>
          <TextInput
            placeholder="Search posts, people, skills, projects..."
            placeholderTextColor={SLL}
            style={g.searchInput}
          />
        </View>

        <View style={g.navRight}>
          <Pressable style={g.iconBtn} onPress={() => router.push("/notifications")}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke={SL} strokeWidth={1.8} strokeLinejoin="round"/>
              <Path d="M10 19a2 2 0 0 0 4 0" stroke={SL} strokeWidth={1.8} strokeLinecap="round"/>
            </Svg>
            <View style={g.notifDot}><Text style={g.notifNum}>3</Text></View>
          </Pressable>
          <Pressable style={g.userPill} onPress={() => router.push("/profile")}>
            <View style={g.uAvatar}><Text style={g.uInitial}>{initials}</Text></View>
            <View>
              <Text style={g.uName}>{user?.name || "Student"}</Text>
              <Text style={g.uRole}>{user?.department || "Student"}</Text>
            </View>
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
              <Polyline points="6 9 12 15 18 9" stroke={SL} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* ═══ BODY ═══ */}
      <View style={g.body}>

        {/* SIDEBAR */}
        <View style={g.sidebar}>
          <View style={g.navList}>
            {NAV.map((item) => {
              const active = item.path === "/assignments";
              return (
                <Pressable key={item.path} style={[g.navItem, active && g.navActive]} onPress={() => router.push(item.path as any)}>
                  <NavIcon name={item.label} color={active ? P : SL}/>
                  <Text style={[g.navLabel, active && g.navLabelActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* XP card — static placeholder */}
          <View style={g.xpCard}>
            <Text style={g.xpLv}>Level {Math.max(1, Math.floor(skills.reduce((s, sk) => s + sk.assignments_completed, 0) / 5) + 1)}</Text>
            <Text style={g.xpSub}>{skills.length > 0 ? "Active Learner" : "Newcomer"}</Text>
            <View style={g.xpTrack}>
              <View style={[g.xpFill, { width: `${Math.min(100, skills.reduce((s, sk) => s + sk.progress, 0) / Math.max(1, skills.length))}%` as any }]}/>
            </View>
            <View style={g.xpRow}>
              <Text style={g.xpNum}>{skills.reduce((s, sk) => s + sk.assignments_completed * 100, 0)} XP</Text>
              <View style={g.xpTrophy}>
                <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                  <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill={P}/>
                  <Path d="M8.5 21h7l-1-4h-5l-1 4z" fill={P}/>
                </Svg>
              </View>
            </View>
          </View>
        </View>

        {/* MAIN CONTENT */}
        <ScrollView style={g.main} contentContainerStyle={g.mainPad} showsVerticalScrollIndicator={false}>

          {/* PAGE HEADER */}
          <View style={g.pageHead}>
            <Pressable style={g.backBtn} onPress={() => router.back()}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5" stroke={P} strokeWidth={2} strokeLinecap="round"/>
                <Path d="M12 19l-7-7 7-7" stroke={P} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={g.backTxt}>Back</Text>
            </Pressable>
            <View>
              <Text style={g.pageTitle}>Assignments</Text>
              <Text style={g.pageSub}>Track, submit and manage all your assignments.</Text>
            </View>
          </View>

          {/* FILTER TABS */}
          <View style={g.tabsRow}>
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                style={[g.tab, activeTab === tab && g.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[g.tabTxt, activeTab === tab && g.tabTxtActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>

          {/* EMPTY STATE */}
          {skills.length === 0 ? (
            <View style={g.emptyCard}>
              <View style={g.emptyIconBox}>
                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                  <Rect x={5} y={4} width={14} height={17} rx={2} stroke={P} strokeWidth={1.8}/>
                  <Path d="M9 9h6M9 13h6M9 17h3" stroke={P} strokeWidth={1.8} strokeLinecap="round"/>
                </Svg>
              </View>
              <Text style={g.emptyTitle}>No assignments yet</Text>
              <Text style={g.emptyText}>Add skills first to start receiving AI-powered assignments.</Text>
              <Pressable style={g.emptyBtn} onPress={() => router.push("/skills")}>
                <Text style={g.emptyBtnTxt}>Choose Skills →</Text>
              </Pressable>
            </View>
          ) : filtered.length === 0 ? (
            <View style={g.emptyCard}>
              <Text style={g.emptyTitle}>No {activeTab} assignments</Text>
              <Text style={g.emptyText}>No assignments in this category yet.</Text>
            </View>
          ) : (
            <View style={g.list}>
              {filtered.map((skill, idx) => {
                const pal    = getSkillPalette(skill.name);
                const status = getStatus(skill);
                const stCfg  = STATUS_CONFIG[status];
                const pts    = LEVEL_POINTS[skill.level] ?? 100;
                const due    = fakeDue(idx);
                const isGen  = generating === skill.skill_id;

                return (
                  <Pressable
                    key={skill.skill_id}
                    style={g.card}
                    onPress={() => startAssignment(skill.skill_id)}
                  >
                    {/* SKILL ICON */}
                    <View style={[g.skillIcon, { backgroundColor: pal.bg }]}>
                      <Text style={[g.skillIconTxt, { color: pal.text }]}>{pal.icon}</Text>
                    </View>

                    {/* CONTENT */}
                    <View style={g.cardContent}>
                      {/* Title + category tag */}
                      <Text style={g.cardTitle} numberOfLines={1}>
                        {skill.name} Assignment
                      </Text>
                      <View style={[g.catTag, { backgroundColor: pal.bg }]}>
                        <Text style={[g.catTagTxt, { color: pal.text }]}>{skill.name}</Text>
                      </View>

                      {/* Description */}
                      <Text style={g.cardDesc} numberOfLines={2}>
                        Complete an AI-generated {skill.level.toLowerCase()} assignment for {skill.name}.{" "}
                        {skill.assignments_completed > 0
                          ? `${skill.assignments_completed} assignment${skill.assignments_completed !== 1 ? "s" : ""} completed so far.`
                          : "No assignments completed yet."}
                      </Text>

                      {/* Meta row */}
                      <View style={g.metaRow}>
                        <View style={g.metaItem}>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                            <Rect x={3} y={4} width={18} height={18} rx={2} stroke={SLL} strokeWidth={1.8}/>
                            <Line x1={16} y1={2} x2={16} y2={6} stroke={SLL} strokeWidth={1.8} strokeLinecap="round"/>
                            <Line x1={8} y1={2} x2={8} y2={6} stroke={SLL} strokeWidth={1.8} strokeLinecap="round"/>
                            <Line x1={3} y1={10} x2={21} y2={10} stroke={SLL} strokeWidth={1.8}/>
                          </Svg>
                          <Text style={g.metaTxt}>Due: {due}</Text>
                        </View>
                        <View style={g.metaItem}>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                            <Circle cx={12} cy={12} r={9} stroke={SLL} strokeWidth={1.8}/>
                            <Path d="M12 7v5l3 3" stroke={SLL} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
                          </Svg>
                          <Text style={g.metaTxt}>11:59 PM</Text>
                        </View>
                        <View style={g.metaItem}>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                            <Path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.2L12 14l-4.8 2.5.9-5.2L4.3 7.6l5.3-.8L12 2z" fill={SLL} stroke={SLL} strokeWidth={0.5}/>
                          </Svg>
                          <Text style={g.metaTxt}>{pts} Points</Text>
                        </View>
                      </View>
                    </View>

                    {/* STATUS + ARROW */}
                    <View style={g.cardRight}>
                      <View style={[g.statusBadge, { backgroundColor: stCfg.bg }]}>
                        {isGen
                          ? <ActivityIndicator size="small" color={stCfg.text}/>
                          : <Text style={[g.statusTxt, { color: stCfg.text }]}>{status}</Text>
                        }
                      </View>
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Polyline points="9 18 15 12 9 6" stroke={SLL} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

/* ── STYLES ──────────────────────────────── */
const g = StyleSheet.create({
  root:    { flex: 1, backgroundColor: BG },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BG },
  loadTxt: { marginTop: 12, fontSize: 14, color: SL, fontFamily: F.m },

  /* NAVBAR */
  navbar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
    backgroundColor: WH,
    borderBottomWidth: 1,
    borderBottomColor: BD,
  },
  logoWrap:  { flexDirection: "row", alignItems: "center", gap: 7, width: 148 },
  logoBox:   { width: 30, height: 30, borderRadius: 8, backgroundColor: PS, alignItems: "center", justifyContent: "center" },
  logoTxt:   { fontFamily: F.x, fontSize: 16.5, color: NV },
  searchBar: { flex: 1, height: 38, backgroundColor: "#F1F4FA", borderRadius: 9, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, gap: 7 },
  searchInput:{ flex: 1, fontFamily: F.r, fontSize: 13, color: NV, outlineStyle: "none" as any },
  navRight:  { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn:   { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center", position: "relative" },
  notifDot:  { position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" },
  notifNum:  { color: WH, fontSize: 9, fontFamily: F.b },
  userPill:  { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, borderWidth: 1, borderColor: BD },
  uAvatar:   { width: 30, height: 30, borderRadius: 15, backgroundColor: P, alignItems: "center", justifyContent: "center" },
  uInitial:  { color: WH, fontFamily: F.b, fontSize: 12 },
  uName:     { fontFamily: F.b, fontSize: 12.5, color: NV },
  uRole:     { fontFamily: F.r, fontSize: 10.5, color: SL },

  /* BODY */
  body: { flex: 1, flexDirection: "row" },

  /* SIDEBAR */
  sidebar: { width: 220, backgroundColor: WH, borderRightWidth: 1, borderRightColor: BD, paddingTop: 14, paddingHorizontal: 10, justifyContent: "space-between" },
  navList: { gap: 2 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10 },
  navActive:{ backgroundColor: PS },
  navLabel: { fontFamily: F.m, fontSize: 13.5, color: "#334155" },
  navLabelActive: { color: P, fontFamily: F.s },
  xpCard:   { marginBottom: 14, backgroundColor: "#F8F9FC", borderRadius: 14, borderWidth: 1, borderColor: BD, padding: 14 },
  xpLv:     { fontFamily: F.x, fontSize: 15, color: NV },
  xpSub:    { fontFamily: F.r, fontSize: 11.5, color: SL, marginTop: 1 },
  xpTrack:  { height: 6, borderRadius: 3, backgroundColor: "#E4E8F0", marginTop: 12, overflow: "hidden" },
  xpFill:   { height: "100%", borderRadius: 3, backgroundColor: P },
  xpRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  xpNum:    { fontFamily: F.m, fontSize: 11, color: SL },
  xpTrophy: { width: 22, height: 22, borderRadius: 11, backgroundColor: PS, alignItems: "center", justifyContent: "center" },

  /* MAIN */
  main:    { flex: 1 },
  mainPad: { padding: 28, paddingBottom: 40 },

  /* PAGE HEADER */
  pageHead: { flexDirection: "row", alignItems: "flex-start", gap: 16, marginBottom: 24 },
  backBtn:  { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: BD, backgroundColor: WH, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 4 },
  backTxt:  { fontFamily: F.s, fontSize: 13, color: P },
  pageTitle:{ fontFamily: F.x, fontSize: 26, color: NV },
  pageSub:  { fontFamily: F.r, fontSize: 13, color: SL, marginTop: 3 },

  /* FILTER TABS */
  tabsRow: {
    flexDirection: "row",
    gap: 0,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BD,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  tabActive: { borderBottomColor: P },
  tabTxt:    { fontFamily: F.s, fontSize: 13.5, color: SL },
  tabTxtActive: { color: P, fontFamily: F.b },

  /* EMPTY STATE */
  emptyCard: {
    backgroundColor: WH,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BD,
    padding: 52,
    alignItems: "center",
    marginTop: 8,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PS,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: { fontFamily: F.b, fontSize: 19, color: NV },
  emptyText:  { fontFamily: F.r, fontSize: 13.5, color: SL, marginTop: 8, textAlign: "center", maxWidth: 340, lineHeight: 21 },
  emptyBtn:   { marginTop: 22, backgroundColor: P, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  emptyBtnTxt:{ color: WH, fontFamily: F.b, fontSize: 14 },

  /* ASSIGNMENT LIST */
  list: {
    backgroundColor: WH,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BD,
    overflow: "hidden",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: WH,
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: BD,
  },

  skillIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  skillIconTxt: { fontFamily: F.b, fontSize: 14 },

  cardContent: { flex: 1, gap: 5 },
  cardTitle:   { fontFamily: F.b, fontSize: 15.5, color: NV },
  catTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  catTagTxt: { fontFamily: F.s, fontSize: 11.5 },
  cardDesc:  { fontFamily: F.r, fontSize: 13, color: SL, lineHeight: 19, marginTop: 3 },

  metaRow:  { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 8, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaTxt:  { fontFamily: F.r, fontSize: 12, color: SL },

  cardRight: { alignItems: "center", gap: 10, flexShrink: 0 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 30,
  },
  statusTxt: { fontFamily: F.s, fontSize: 12.5 },
});
