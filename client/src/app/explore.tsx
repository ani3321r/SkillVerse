import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, Pressable,
  ScrollView, TextInput, ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import Svg, { Path, Circle, Line, Rect } from "react-native-svg";
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
import { apiFetch } from "../services/api";

/* ── TOKENS ─────────────────────────────── */
const P  = "#1456F0";
const PS = "#EAF0FE";
const NV = "#0B1D3C";
const SL = "#64748B";
const BD = "#E8ECF2";
const WH = "#FFFFFF";
const BG = "#F4F6FB";

const F = {
  r: "PlusJakartaSans_400Regular",
  m: "PlusJakartaSans_500Medium",
  s: "PlusJakartaSans_600SemiBold",
  b: "PlusJakartaSans_700Bold",
  x: "PlusJakartaSans_800ExtraBold",
};

/* ── TYPES ──────────────────────────────── */
type Student = {
  id: number; name: string; college: string; department: string;
  year: string; location: string; interest: string;
  avatar_url?: string | null; skills: string[];
};

/* ── FILTER DATA ────────────────────────── */
const INTEREST_TABS = [
  { label: "All",      value: "" },
  { label: "Software", value: "software" },
  { label: "Hardware", value: "hardware" },
  { label: "Both",     value: "both" },
];

const YEAR_TABS = [
  { label: "All Years", value: "" },
  { label: "1st Year",  value: "1st Year" },
  { label: "2nd Year",  value: "2nd Year" },
  { label: "3rd Year",  value: "3rd Year" },
  { label: "4th Year",  value: "4th Year" },
];

/* ── SKILL CHIP COLORS ─────────────────── */
const SKILL_COLORS = [
  { bg: "#EAF0FE", tx: "#1456F0" },
  { bg: "#DCFCE7", tx: "#15803D" },
  { bg: "#FEF9C3", tx: "#A16207" },
  { bg: "#EDE9FE", tx: "#6D28D9" },
  { bg: "#FFE4E6", tx: "#BE123C" },
  { bg: "#E0F2FE", tx: "#0369A1" },
  { bg: "#FEF3C7", tx: "#D97706" },
  { bg: "#DCFCE7", tx: "#166534" },
];

function skillColor(idx: number) {
  return SKILL_COLORS[idx % SKILL_COLORS.length];
}

/* ── YEAR BADGE COLOR ──────────────────── */
function yearColor(year: string) {
  if (year.includes("1")) return { bg: "#DCFCE7", tx: "#15803D" };
  if (year.includes("2")) return { bg: "#EAF0FE", tx: "#1456F0" };
  if (year.includes("3")) return { bg: "#FEF3C7", tx: "#D97706" };
  if (year.includes("4")) return { bg: "#EDE9FE", tx: "#6D28D9" };
  return { bg: "#F1F5F9", tx: "#64748B" };
}

/* ── AVATAR INITIALS COLORS ────────────── */
const AVATAR_COLORS = [
  { bg: "#DBEAFE", tx: "#1D4ED8" },
  { bg: "#FCE7F3", tx: "#9D174D" },
  { bg: "#FEF3C7", tx: "#92400E" },
  { bg: "#DCFCE7", tx: "#065F46" },
  { bg: "#EDE9FE", tx: "#5B21B6" },
  { bg: "#FFE4E6", tx: "#9F1239" },
];
function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

/* ── ICONS ──────────────────────────────── */
function IconSearch() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke="#94A3B8" strokeWidth={2}/>
      <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke="#94A3B8" strokeWidth={2} strokeLinecap="round"/>
    </Svg>
  );
}
function IconLocation() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#94A3B8" strokeWidth={1.8} strokeLinejoin="round"/>
      <Circle cx={12} cy={10} r={3} stroke="#94A3B8" strokeWidth={1.8}/>
    </Svg>
  );
}
function IconBookmark() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4h12v17l-6-4-6 4V4z" stroke="#94A3B8" strokeWidth={1.8} strokeLinejoin="round"/>
    </Svg>
  );
}
function IconReset() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" stroke={P} strokeWidth={2} strokeLinecap="round"/>
      <Path d="M21 3v5h-5" stroke={P} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function IconFilter() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h16M7 12h10M10 18h4" stroke={WH} strokeWidth={2} strokeLinecap="round"/>
    </Svg>
  );
}
function IconArrowRight() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={P} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function IconChevronDown() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={SL} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

/* ── STUDENT CARD ───────────────────────── */
function StudentCard({ student }: { student: Student }) {
  const ac  = avatarColor(student.id);
  const yc  = yearColor(student.year);
  const initial = student.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <View style={g.card}>
      {/* Card header */}
      <View style={g.cardHead}>
        {/* Avatar */}
        <View style={[g.avatar, { backgroundColor: ac.bg }]}>
          <Text style={[g.avatarTxt, { color: ac.tx }]}>{initial}</Text>
        </View>

        {/* Name + dept + college */}
        <View style={g.cardNameCol}>
          <View style={g.cardNameRow}>
            <Text style={g.studentName} numberOfLines={1}>{student.name}</Text>
            <View style={[g.yearBadge, { backgroundColor: yc.bg }]}>
              <Text style={[g.yearTxt, { color: yc.tx }]}>{student.year}</Text>
            </View>
          </View>
          <Text style={g.deptTxt} numberOfLines={1}>{student.department}</Text>
          <View style={g.collegeRow}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path d="M12 3 2 8l10 5 10-5-10-5z" stroke="#94A3B8" strokeWidth={1.8} strokeLinejoin="round"/>
              <Path d="M6 11.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-4.5" stroke="#94A3B8" strokeWidth={1.8} strokeLinecap="round"/>
            </Svg>
            <Text style={g.collegeTxt} numberOfLines={1}>{student.college}</Text>
          </View>
        </View>
      </View>

      {/* Skill chips */}
      {student.skills?.length > 0 && (
        <View style={g.skillsRow}>
          {student.skills.slice(0, 3).map((sk, i) => {
            const sc = skillColor(i);
            return (
              <View key={i} style={[g.skillChip, { backgroundColor: sc.bg }]}>
                <Text style={[g.skillChipTxt, { color: sc.tx }]}>{sk}</Text>
              </View>
            );
          })}
          {student.skills.length > 3 && (
            <View style={g.skillChipMore}>
              <Text style={g.skillChipMoreTxt}>+{student.skills.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Location + actions */}
      <View style={g.cardFooter}>
        <View style={g.locationRow}>
          <IconLocation/>
          <Text style={g.locationTxt}>{student.location}</Text>
        </View>
        <View style={g.cardActions}>
          <Pressable
            style={g.viewProfileBtn}
            onPress={() => router.push({ pathname: "/student-profile", params: { id: String(student.id) } })}
          >
            <Text style={g.viewProfileTxt}>View Profile</Text>
            <IconArrowRight/>
          </Pressable>
          <Pressable style={g.bookmarkBtn}>
            <IconBookmark/>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ── SCREEN ─────────────────────────────── */
export default function ExploreScreen() {
  const { token } = useAuth();

  const [students,  setStudents]  = useState<Student[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [searching, setSearching] = useState(false);

  const [search,   setSearch]   = useState("");
  const [interest, setInterest] = useState("");
  const [year,     setYear]     = useState("");
  const [college,  setCollege]  = useState("");
  const [location, setLocation] = useState("");

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  /* ── FETCH ── */
  const fetchStudents = useCallback(async () => {
    if (!token) return;
    setSearching(true);
    try {
      const p = new URLSearchParams();
      if (search.trim())   p.set("search",   search.trim());
      if (interest)        p.set("interest", interest);
      if (year)            p.set("year",     year);
      if (college.trim())  p.set("college",  college.trim());
      if (location.trim()) p.set("location", location.trim());
      const q   = p.toString();
      const res = await apiFetch(`/api/discover${q ? `?${q}` : ""}`, token);
      const d   = await res.json();
      if (d.success) setStudents(d.students || []);
    } catch { /* silent */ }
    finally { setLoading(false); setSearching(false); }
  }, [token, search, interest, year, college, location]);

  useFocusEffect(useCallback(() => { fetchStudents(); }, [fetchStudents]));

  const applyFilters = () => fetchStudents();
  const resetFilters = () => {
    setSearch(""); setInterest(""); setYear(""); setCollege(""); setLocation("");
  };

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: BG }}/>;

  return (
    <AppLayout>

      {/* ── HERO HEADER ── */}
      <View style={g.heroSection}>
        <View style={g.heroLeft}>
          <Text style={g.heroTitle}>Explore Students</Text>
          <Text style={g.heroSub}>Discover talented learners and connect with them.</Text>

          {/* Search bar */}
          <View style={g.searchBar}>
            <IconSearch/>
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={applyFilters}
              returnKeyType="search"
              placeholder="Search by name, skill, college..."
              placeholderTextColor="#94A3B8"
              style={g.searchInput}
            />
            {searching && <ActivityIndicator size="small" color={P} style={{ marginRight: 8 }}/>}
          </View>
        </View>

        {/* Hero decoration */}
        <View style={g.heroDecor}>
          <View style={g.decorCircle1}/>
          <View style={g.decorCircle2}/>
          <View style={g.decorCircle3}/>
          <View style={g.decorSearchBox}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <Circle cx={11} cy={11} r={7} stroke={P} strokeWidth={2}/>
              <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={P} strokeWidth={2.5} strokeLinecap="round"/>
            </Svg>
          </View>
          {["👤","👤","👤"].map((e, i) => (
            <View key={i} style={[g.decorAvatar, { right: 20 + i * 44, top: i === 1 ? 14 : 32 }]}>
              <Text style={{ fontSize: 20 }}>{e}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── FILTER BAR ── */}
      <View style={g.filterBar}>
        {/* Interest */}
        <View style={g.filterGroup}>
          <Text style={g.filterGroupLabel}>Interest</Text>
          <View style={g.filterPills}>
            {INTEREST_TABS.map(t => (
              <Pressable
                key={t.value}
                style={[g.filterPill, interest === t.value && g.filterPillActive]}
                onPress={() => setInterest(t.value)}
              >
                <Text style={[g.filterPillTxt, interest === t.value && g.filterPillTxtActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Year */}
        <View style={g.filterGroup}>
          <Text style={g.filterGroupLabel}>Year</Text>
          <View style={g.filterPills}>
            {YEAR_TABS.map(t => (
              <Pressable
                key={t.value}
                style={[g.filterPill, year === t.value && g.filterPillActive]}
                onPress={() => setYear(t.value)}
              >
                <Text style={[g.filterPillTxt, year === t.value && g.filterPillTxtActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* College dropdown (text input) */}
        <View style={g.filterGroup}>
          <Text style={g.filterGroupLabel}>College</Text>
          <View style={g.dropdownBox}>
            <TextInput
              value={college}
              onChangeText={setCollege}
              placeholder="All Colleges"
              placeholderTextColor="#94A3B8"
              style={g.dropdownInput}
            />
            <IconChevronDown/>
          </View>
        </View>

        {/* City dropdown */}
        <View style={g.filterGroup}>
          <Text style={g.filterGroupLabel}>City</Text>
          <View style={g.dropdownBox}>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="All Cities"
              placeholderTextColor="#94A3B8"
              style={g.dropdownInput}
            />
            <IconChevronDown/>
          </View>
        </View>

        {/* Action buttons */}
        <View style={g.filterActions}>
          <Pressable style={g.resetBtn} onPress={resetFilters}>
            <IconReset/>
            <Text style={g.resetTxt}>Reset Filters</Text>
          </Pressable>
          <Pressable style={g.applyBtn} onPress={applyFilters} disabled={searching}>
            <IconFilter/>
            <Text style={g.applyTxt}>Apply Filters</Text>
          </Pressable>
        </View>
      </View>

      {/* ── RESULTS HEADER ── */}
      <View style={g.resultsHeader}>
        <Text style={g.resultsCount}>
          {loading ? "Loading…" : `${students.length} student${students.length !== 1 ? "s" : ""} found`}
        </Text>
        <View style={g.sortRow}>
          <Text style={g.sortLabel}>Sort by:</Text>
          <View style={g.sortBox}>
            <Text style={g.sortValue}>Most Relevant</Text>
            <IconChevronDown/>
          </View>
        </View>
      </View>

      {/* ── STUDENT GRID ── */}
      {loading ? (
        <View style={g.loadBox}>
          <ActivityIndicator size="large" color={P}/>
        </View>
      ) : students.length === 0 ? (
        <View style={g.emptyCard}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>🔎</Text>
          <Text style={g.emptyTitle}>No students found</Text>
          <Text style={g.emptyTxt}>Try adjusting your filters or search term.</Text>
          <Pressable style={g.resetBtnLarge} onPress={resetFilters}>
            <Text style={g.resetBtnLargeTxt}>Reset Filters</Text>
          </Pressable>
        </View>
      ) : (
        <View style={g.grid}>
          {students.map(st => <StudentCard key={st.id} student={st}/>)}
        </View>
      )}
    </AppLayout>
  );
}

/* ── STYLES ──────────────────────────────── */
const g = StyleSheet.create({

  /* HERO */
  heroSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: WH,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BD,
    padding: 28,
    marginBottom: 20,
    overflow: "hidden",
    minHeight: 160,
  },
  heroLeft:   { flex: 1, maxWidth: 560 },
  heroTitle:  { fontFamily: F.x, fontSize: 28, color: NV },
  heroSub:    { fontFamily: F.r, fontSize: 14, color: SL, marginTop: 6, marginBottom: 18 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: BD,
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 14,
    gap: 10,
    maxWidth: 500,
  },
  searchInput: { flex: 1, fontFamily: F.r, fontSize: 13.5, color: NV, outlineStyle: "none" as any },

  heroDecor: { width: 200, height: 120, position: "relative" },
  decorCircle1: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "#EAF0FE", top: 10, right: 10, opacity: 0.7 },
  decorCircle2: { position: "absolute", width: 50, height: 50, borderRadius: 25, backgroundColor: "#E7F8ED", top: 50, right: 100, opacity: 0.7 },
  decorCircle3: { position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: "#FEF3C7", top: 5, right: 80, opacity: 0.5 },
  decorSearchBox: { position: "absolute", width: 60, height: 60, borderRadius: 14, backgroundColor: WH, borderWidth: 1, borderColor: BD, alignItems: "center", justifyContent: "center", top: 28, right: 40, shadowColor: "#1E293B", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  decorAvatar: { position: "absolute", width: 38, height: 38, borderRadius: 19, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },

  /* FILTER BAR */
  filterBar: {
    backgroundColor: WH,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BD,
    padding: 18,
    marginBottom: 20,
    gap: 14,
  },
  filterGroup:      { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  filterGroupLabel: { fontFamily: F.s, fontSize: 12.5, color: SL, width: 56, flexShrink: 0 },
  filterPills:      { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterPill:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: BD },
  filterPillActive: { backgroundColor: P, borderColor: P },
  filterPillTxt:    { fontFamily: F.s, fontSize: 12.5, color: SL },
  filterPillTxtActive: { color: WH },

  dropdownBox:  { flexDirection: "row", alignItems: "center", height: 36, borderWidth: 1, borderColor: BD, borderRadius: 8, paddingHorizontal: 12, gap: 6, minWidth: 140, backgroundColor: WH },
  dropdownInput:{ flex: 1, fontFamily: F.r, fontSize: 13, color: NV, outlineStyle: "none" as any },

  filterActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  resetBtn:  { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: BD, backgroundColor: WH },
  resetTxt:  { fontFamily: F.s, fontSize: 12.5, color: P },
  applyBtn:  { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: P },
  applyTxt:  { fontFamily: F.s, fontSize: 12.5, color: WH },

  /* RESULTS HEADER */
  resultsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  resultsCount:  { fontFamily: F.b, fontSize: 14, color: NV },
  sortRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  sortLabel:     { fontFamily: F.m, fontSize: 13, color: SL },
  sortBox:       { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: BD, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: WH },
  sortValue:     { fontFamily: F.s, fontSize: 12.5, color: NV },

  /* GRID — 3 columns */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },

  /* STUDENT CARD */
  card: {
    width: "31%",
    minWidth: 260,
    flexGrow: 1,
    backgroundColor: WH,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BD,
    padding: 18,
  },
  cardHead:    { flexDirection: "row", gap: 12, marginBottom: 14 },
  avatar:      { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarTxt:   { fontFamily: F.x, fontSize: 18 },
  cardNameCol: { flex: 1 },
  cardNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, flexWrap: "wrap" },
  studentName: { fontFamily: F.b, fontSize: 15, color: NV, flexShrink: 1 },
  yearBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, flexShrink: 0 },
  yearTxt:     { fontFamily: F.s, fontSize: 11 },
  deptTxt:     { fontFamily: F.r, fontSize: 12, color: SL, marginTop: 3 },
  collegeRow:  { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
  collegeTxt:  { fontFamily: F.r, fontSize: 11.5, color: SL, flex: 1 },

  /* Skill chips */
  skillsRow:      { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  skillChip:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  skillChipTxt:   { fontFamily: F.s, fontSize: 11.5 },
  skillChipMore:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: "#F1F5F9" },
  skillChipMoreTxt: { fontFamily: F.s, fontSize: 11.5, color: SL },

  /* Card footer */
  cardFooter:   { paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationRow:  { flexDirection: "row", alignItems: "center", gap: 5 },
  locationTxt:  { fontFamily: F.r, fontSize: 11.5, color: SL },
  cardActions:  { flexDirection: "row", alignItems: "center", gap: 10 },
  viewProfileBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: BD },
  viewProfileTxt: { fontFamily: F.s, fontSize: 12, color: P },
  bookmarkBtn:    { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: BD, alignItems: "center", justifyContent: "center" },

  /* EMPTY / LOADING */
  loadBox:         { paddingVertical: 60, alignItems: "center" },
  emptyCard:       { backgroundColor: WH, borderRadius: 16, borderWidth: 1, borderColor: BD, padding: 52, alignItems: "center" },
  emptyTitle:      { fontFamily: F.b, fontSize: 18, color: NV },
  emptyTxt:        { fontFamily: F.r, fontSize: 13, color: SL, marginTop: 8, textAlign: "center" },
  resetBtnLarge:   { marginTop: 20, borderWidth: 1.5, borderColor: P, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 10 },
  resetBtnLargeTxt:{ fontFamily: F.b, fontSize: 13, color: P },
});
