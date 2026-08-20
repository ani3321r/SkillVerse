import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable,
  ScrollView, ActivityIndicator, Alert, TextInput,
} from "react-native";
import { router } from "expo-router";
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
const P  = "#1456F0";
const PS = "#EAF0FE";
const NV = "#0B1D3C";
const SL = "#64748B";
const SLL= "#94A3B8";
const BD = "#E8ECF2";
const BG = "#F4F6FB";
const WH = "#FFFFFF";
const GR = "#22C55E";

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

/* ── SKILL UI DEFINITIONS
   Keyed by the exact DB name. Provides icon, color, description for display.
   Only skills that exist in the DB (schema.sql seed) are used.
───────────────────────────────────────── */
const SKILL_UI: Record<string, { icon: string; bg: string; desc: string; category: "software" | "hardware" }> = {
  "JavaScript":       { icon: "JS",  bg: "#F59F00", desc: "Master JavaScript for web development",          category: "software" },
  "React":            { icon: "Re",  bg: "#1C7ED6", desc: "Build interactive user interfaces",               category: "software" },
  "Node.js":          { icon: "NJ",  bg: "#2F9E44", desc: "Backend development with Node.js",                category: "software" },
  "Python":           { icon: "PY",  bg: "#3B7DD8", desc: "Learn Python programming",                        category: "software" },
  "Java":             { icon: "Ja",  bg: "#E8590C", desc: "Build enterprise applications",                   category: "software" },
  "C++":              { icon: "C+",  bg: "#1C7ED6", desc: "Learn system and competitive programming",        category: "software" },
  "Data Structures":  { icon: "DS",  bg: "#7950F2", desc: "Master data structures and algorithms",           category: "software" },
  "Machine Learning": { icon: "ML",  bg: "#E03131", desc: "Build intelligent applications with AI/ML",       category: "software" },
  "UI/UX Design":     { icon: "UX",  bg: "#E64980", desc: "Design intuitive user experiences",               category: "software" },
  "Cybersecurity":    { icon: "CS",  bg: "#364FC7", desc: "Learn security fundamentals and ethical hacking", category: "software" },
  "Arduino":          { icon: "Ar",  bg: "#00979D", desc: "Build microcontroller-based projects",            category: "hardware" },
  "ESP32":            { icon: "E32", bg: "#0077B6", desc: "IoT development with ESP32 microcontroller",      category: "hardware" },
  "Robotics":         { icon: "Ro",  bg: "#264653", desc: "Design and control robotic systems",              category: "hardware" },
};

type Skill = { id: number; name: string; category: string; description: string };

/* ── SCREEN ─────────────────────────────── */
export default function SkillsScreen() {
  const { token, userId, user } = useAuth();

  // apiSkills = exactly what the server has — these are what we display
  const [apiSkills,      setApiSkills]      = useState<Skill[]>([]);
  // selectedIds = IDs of skills the user has ticked
  const [selectedIds,    setSelectedIds]    = useState<number[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "software" | "hardware">("all");

  const initials = user?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "SK";

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  /* ── LOAD SKILLS FROM API ── */
  useEffect(() => { loadSkills(); }, []);

  const loadSkills = async () => {
    try {
      const res  = await apiFetch("/api/skills", token);
      const data = await res.json();
      if (data.success) setApiSkills(data.skills);
      else Alert.alert("Error", "Could not load skills.");
    } catch {
      Alert.alert("Connection Error", "Could not connect to SkillVerse server.");
    } finally {
      setLoading(false);
    }
  };

  /* ── TOGGLE by skill ID ── */
  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ── START LEARNING ── */
  const startLearning = async () => {
    if (selectedIds.length === 0) {
      Alert.alert("Select a skill", "Please select at least one skill.");
      return;
    }
    if (!userId || !token) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    setSaving(true);
    try {
      const uid = Number(userId);
      const firstSkillId = Number(selectedIds[0]);

      // STEP 1 — save skills (best-effort, don't block assignment on failure)
      for (const skillId of selectedIds) {
        try {
          await apiFetch("/api/skills/user", token, {
            method: "POST",
            body: JSON.stringify({ userId: uid, skillId: Number(skillId) }),
          });
        } catch {
          // silently ignore — skill may already exist
        }
      }

      // STEP 2 — generate assignment for first selected skill
      const res  = await apiFetch("/api/ai/generate-assignment", token, {
        method: "POST",
        body: JSON.stringify({ userId: uid, skillId: firstSkillId, difficulty: "Beginner" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Server returned ${res.status}`);
      }

      // STEP 3 — go to assignment page
      const assignmentId = data.assignment.id;
      router.push(`/assignment?id=${assignmentId}`);

    } catch (error) {
      Alert.alert(
        "Could not start learning",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── FILTERED LIST ──
     Display API skills enriched with UI metadata (icon, color, desc).
     Fallback values used for any skill not in SKILL_UI map.
  ── */
  const displaySkills = apiSkills
    .filter((sk) =>
      activeCategory === "all" ? true :
      activeCategory === "software" ? sk.category?.toLowerCase() === "software" :
      sk.category?.toLowerCase() === "hardware"
    )
    .map((sk) => {
      const ui = SKILL_UI[sk.name] ?? {
        icon: sk.name.slice(0, 2).toUpperCase(),
        bg:   "#1456F0",
        desc: sk.description || sk.name,
        category: (sk.category?.toLowerCase() === "hardware" ? "hardware" : "software") as "software" | "hardware",
      };
      return { ...sk, ...ui };
    });

  /* ── SELECTED SKILL NAMES for bottom bar chips ── */
  const selectedSkillNames = selectedIds.map(
    (id) => apiSkills.find((s) => s.id === id)?.name ?? ""
  ).filter(Boolean);

  if (!fontsLoaded || loading) {
    return (
      <View style={g.center}>
        <ActivityIndicator size="large" color={P} />
        <Text style={g.loadTxt}>Loading skills...</Text>
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
              <Path d="M20 1 L38 11.5 V32.5 L20 43 L2 32.5 V11.5 Z" fill={P} />
              <Path d="M20 1 L38 11.5 L20 22 L2 11.5 Z" fill="#3B76FF" />
            </Svg>
          </View>
          <Text style={g.logoTxt}>Skill<Text style={{ color: P }}>Verse</Text></Text>
        </Pressable>

        <View style={g.searchBar}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={7} stroke={SLL} strokeWidth={2} />
            <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={SLL} strokeWidth={2} strokeLinecap="round" />
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
              <Path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke={SL} strokeWidth={1.8} strokeLinejoin="round" />
              <Path d="M10 19a2 2 0 0 0 4 0" stroke={SL} strokeWidth={1.8} strokeLinecap="round" />
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
              <Polyline points="6 9 12 15 18 9" stroke={SL} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
              const active = item.path === "/skills";
              return (
                <Pressable key={item.path} style={[g.navItem, active && g.navActive]} onPress={() => router.push(item.path as any)}>
                  <NavIcon name={item.label} color={active ? P : SL} />
                  <Text style={[g.navLabel, active && g.navLabelActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* XP card */}
          <View style={g.xpCard}>
            <Text style={g.xpLv}>Level 1</Text>
            <Text style={g.xpSub}>Newcomer</Text>
            <View style={g.xpTrack}><View style={[g.xpFill, { width: "0%" as any }]} /></View>
            <View style={g.xpRow}>
              <Text style={g.xpNum}>0 / 500 XP</Text>
              <View style={g.xpTrophy}>
                <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                  <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill={P} />
                  <Path d="M8.5 21h7l-1-4h-5l-1 4z" fill={P} />
                </Svg>
              </View>
            </View>
          </View>
        </View>

        {/* MAIN */}
        <View style={g.mainWrap}>
          <ScrollView
            style={g.main}
            contentContainerStyle={g.mainPad}
            showsVerticalScrollIndicator={false}
          >
            {/* PAGE HEADER ROW */}
            <View style={g.pageHeadRow}>
              {/* Left: back + title */}
              <View style={g.pageHeadLeft}>
                <Pressable style={g.backBtn} onPress={() => router.back()}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M19 12H5" stroke={P} strokeWidth={2} strokeLinecap="round" />
                    <Path d="M12 19l-7-7 7-7" stroke={P} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={g.backTxt}>Back</Text>
                </Pressable>
                <View style={g.pageHeadText}>
                  <Text style={g.pageTitle}>Choose Your Skills</Text>
                  <Text style={g.pageSub}>Select the skills you want to learn. You can choose multiple skills and update them anytime.</Text>
                </View>
              </View>

              {/* Right: 2 step indicators */}
              <View style={g.steps}>
                <View style={g.stepItem}>
                  <View style={[g.stepCircle, g.stepActive]}><Text style={g.stepNumActive}>1</Text></View>
                  <Text style={[g.stepLabel, g.stepLabelActive]}>Choose Skills</Text>
                </View>
                <View style={g.stepLine} />
                <View style={g.stepItem}>
                  <View style={g.stepCircle}><Text style={g.stepNum}>2</Text></View>
                  <Text style={g.stepLabel}>Start Learning</Text>
                </View>
              </View>
            </View>

            {/* PROMO BANNER */}
            <View style={g.banner}>
              <View style={g.bannerIcon}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={12} r={10} stroke={P} strokeWidth={1.8} />
                  <Path d="M12 8v4l3 3" stroke={P} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M7 16l1.5-1.5" stroke={P} strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
              </View>
              <View>
                <Text style={g.bannerTitle}>Build Your Future</Text>
                <Text style={g.bannerSub}>Choose the skills that match your interests and career goals. Learn, practice and grow with SkillVerse!</Text>
              </View>
            </View>

            {/* CATEGORY TABS + COUNT */}
            <View style={g.catRow}>
              <View style={g.catTabs}>
                {(["all", "software", "hardware"] as const).map((cat) => (
                  <Pressable
                    key={cat}
                    style={[g.catTab, activeCategory === cat && g.catTabActive]}
                    onPress={() => setActiveCategory(cat)}
                  >
                    <Text style={[g.catTabTxt, activeCategory === cat && g.catTabTxtActive]}>
                      {cat === "all" ? "All Skills" : cat === "software" ? "Software" : "Hardware"}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={g.skillCount}>{displaySkills.length} skills available</Text>
            </View>

            {/* SKILLS GRID — section label */}
            <Text style={g.sectionLabel}>Popular Skills</Text>

            <View style={g.grid}>
              {displaySkills.map((def) => {
                const selected = selectedIds.includes(def.id);
                return (
                  <Pressable
                    key={def.id}
                    style={[g.card, selected && g.cardSelected]}
                    onPress={() => toggle(def.id)}
                  >
                    <View style={[g.skillIcon, { backgroundColor: def.bg }]}>
                      <Text style={g.skillIconTxt}>{def.icon}</Text>
                    </View>
                    <View style={g.cardBody}>
                      <Text style={g.skillName} numberOfLines={1}>{def.name}</Text>
                      <Text style={g.skillDesc} numberOfLines={2}>{def.desc}</Text>
                    </View>
                    <View style={[g.checkbox, selected && g.checkboxOn]}>
                      {selected && (
                        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                          <Path d="M5 13l4 4L19 7" stroke={WH} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Bottom padding so content clears the sticky footer */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* ═══ STICKY BOTTOM BAR ═══ */}
          <View style={g.bottomBar}>
            <View style={g.bottomLeft}>
              <Text style={g.selectedCount}>{selectedIds.length} skill{selectedIds.length !== 1 ? "s" : ""} selected</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={g.tagsRow}>
                {selectedSkillNames.map((name) => (
                  <View key={name} style={g.tag}>
                    <Text style={g.tagTxt}>{name}</Text>
                    <Pressable
                      hitSlop={6}
                      onPress={() => {
                        const sk = apiSkills.find((s) => s.name === name);
                        if (sk) toggle(sk.id);
                      }}
                    >
                      <Text style={g.tagX}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>

            <Pressable
              style={[g.continueBtn, (saving || selectedIds.length === 0) && g.continueBtnDisabled]}
              onPress={startLearning}
              disabled={saving || selectedIds.length === 0}
            >
              {saving ? (
                <ActivityIndicator size="small" color={WH} />
              ) : (
                <>
                  <Text style={g.continueTxt}>Start Learning</Text>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12h14M12 5l7 7-7 7" stroke={WH} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </>
              )}
            </Pressable>
          </View>
        </View>
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
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 7, width: 148 },
  logoBox:  { width: 30, height: 30, borderRadius: 8, backgroundColor: PS, alignItems: "center", justifyContent: "center" },
  logoTxt:  { fontFamily: F.x, fontSize: 16.5, color: NV },
  searchBar:{ flex: 1, height: 38, backgroundColor: "#F1F4FA", borderRadius: 9, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, gap: 7 },
  searchInput: { flex: 1, fontFamily: F.r, fontSize: 13, color: NV, outlineStyle: "none" as any },
  navRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn:  { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center", position: "relative" },
  notifDot: { position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" },
  notifNum: { color: WH, fontSize: 9, fontFamily: F.b },
  userPill: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, borderWidth: 1, borderColor: BD },
  uAvatar:  { width: 30, height: 30, borderRadius: 15, backgroundColor: P, alignItems: "center", justifyContent: "center" },
  uInitial: { color: WH, fontFamily: F.b, fontSize: 12 },
  uName:    { fontFamily: F.b, fontSize: 12.5, color: NV },
  uRole:    { fontFamily: F.r, fontSize: 10.5, color: SL },

  /* BODY */
  body: { flex: 1, flexDirection: "row" },

  /* SIDEBAR */
  sidebar: { width: 220, backgroundColor: WH, borderRightWidth: 1, borderRightColor: BD, paddingTop: 14, paddingHorizontal: 10, justifyContent: "space-between" },
  navList: { gap: 2 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10 },
  navActive: { backgroundColor: PS },
  navLabel: { fontFamily: F.m, fontSize: 13.5, color: "#334155" },
  navLabelActive: { color: P, fontFamily: F.s },
  xpCard:  { marginBottom: 14, backgroundColor: "#F8F9FC", borderRadius: 14, borderWidth: 1, borderColor: BD, padding: 14 },
  xpLv:    { fontFamily: F.x, fontSize: 15, color: NV },
  xpSub:   { fontFamily: F.r, fontSize: 11.5, color: SL, marginTop: 1 },
  xpTrack: { height: 6, borderRadius: 3, backgroundColor: "#E4E8F0", marginTop: 12, overflow: "hidden" },
  xpFill:  { height: "100%", borderRadius: 3, backgroundColor: P },
  xpRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  xpNum:   { fontFamily: F.m, fontSize: 11, color: SL },
  xpTrophy:{ width: 22, height: 22, borderRadius: 11, backgroundColor: PS, alignItems: "center", justifyContent: "center" },

  /* MAIN WRAP */
  mainWrap: { flex: 1, position: "relative" },
  main:     { flex: 1 },
  mainPad:  { padding: 28, paddingBottom: 20 },

  /* PAGE HEADER ROW */
  pageHeadRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, gap: 20, flexWrap: "wrap" },
  pageHeadLeft: { flexDirection: "row", alignItems: "flex-start", gap: 16, flex: 1 },
  pageHeadText: { flex: 1 },
  backBtn:  { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: BD, backgroundColor: WH, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 4 },
  backTxt:  { fontFamily: F.s, fontSize: 13, color: P },
  pageTitle:{ fontFamily: F.x, fontSize: 26, color: NV },
  pageSub:  { fontFamily: F.r, fontSize: 13, color: SL, marginTop: 4, maxWidth: 560 },

  /* STEP INDICATORS */
  steps:       { flexDirection: "row", alignItems: "center", gap: 0, marginTop: 4 },
  stepItem:    { alignItems: "center", gap: 5 },
  stepLine:    { width: 48, height: 2, backgroundColor: BD, marginHorizontal: 4, marginBottom: 18 },
  stepCircle:  { width: 32, height: 32, borderRadius: 16, backgroundColor: "#E8ECF2", alignItems: "center", justifyContent: "center" },
  stepActive:  { backgroundColor: P },
  stepNum:     { fontFamily: F.b, fontSize: 13, color: SL },
  stepNumActive:{ fontFamily: F.b, fontSize: 13, color: WH },
  stepLabel:   { fontFamily: F.r, fontSize: 11, color: SL, textAlign: "center" },
  stepLabelActive: { color: P, fontFamily: F.s },

  /* BANNER */
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: PS,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C7D9FD",
    padding: 18,
    marginBottom: 22,
  },
  bannerIcon:  { width: 52, height: 52, borderRadius: 26, backgroundColor: WH, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bannerTitle: { fontFamily: F.b, fontSize: 16, color: NV },
  bannerSub:   { fontFamily: F.r, fontSize: 13, color: SL, marginTop: 3, maxWidth: 680 },

  /* CATEGORY TABS */
  catRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  catTabs:   { flexDirection: "row", gap: 8 },
  catTab:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: WH, borderWidth: 1.5, borderColor: BD },
  catTabActive: { backgroundColor: P, borderColor: P },
  catTabTxt: { fontFamily: F.s, fontSize: 13, color: "#334155" },
  catTabTxtActive: { color: WH },
  skillCount:{ fontFamily: F.m, fontSize: 13, color: SL },
  sectionLabel: { fontFamily: F.b, fontSize: 17, color: NV, marginTop: 10, marginBottom: 14 },

  /* GRID */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },

  card: {
    width: "22%",
    minWidth: 200,
    flexGrow: 1,
    backgroundColor: WH,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BD,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardSelected: {
    borderColor: P,
    backgroundColor: "#F5F8FF",
  },

  skillIcon:    { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  skillIconTxt: { color: WH, fontFamily: F.b, fontSize: 13 },
  cardBody:     { flex: 1 },
  skillName:    { fontFamily: F.b, fontSize: 14, color: NV, flexShrink: 1 },
  skillDesc:    { fontFamily: F.r, fontSize: 11.5, color: SL, marginTop: 3, lineHeight: 16 },
  checkbox:     { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  checkboxOn:   { backgroundColor: P, borderColor: P },

  /* BOTTOM BAR */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: WH,
    borderTopWidth: 1,
    borderTopColor: BD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    gap: 20,
  },
  bottomLeft:  { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  selectedCount: { fontFamily: F.b, fontSize: 14, color: NV, flexShrink: 0 },
  tagsRow:     { flexDirection: "row", gap: 8, alignItems: "center" },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: PS,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagTxt: { fontFamily: F.s, fontSize: 12.5, color: P },
  tagX:   { fontFamily: F.b, fontSize: 16, color: P, lineHeight: 18 },

  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: P,
    paddingHorizontal: 28,
    height: 46,
    borderRadius: 12,
    flexShrink: 0,
  },
  continueBtnDisabled: { opacity: 0.45 },
  continueTxt: { fontFamily: F.b, fontSize: 15, color: WH },
});
