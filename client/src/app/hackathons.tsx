import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable,
  ActivityIndicator, Linking, Alert, ScrollView,
} from "react-native";
import { useFocusEffect } from "expo-router";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";
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
const SLL= "#94A3B8";
const BD = "#E8ECF2";
const WH = "#FFFFFF";
const GR = "#22C55E";

const F = {
  r: "PlusJakartaSans_400Regular",
  m: "PlusJakartaSans_500Medium",
  s: "PlusJakartaSans_600SemiBold",
  b: "PlusJakartaSans_700Bold",
  x: "PlusJakartaSans_800ExtraBold",
};

/* ── TYPE ───────────────────────────────── */
type Hackathon = {
  id: number;
  title?: string;
  organizer?: string;
  description?: string;
  location?: string;
  is_online?: boolean;
  start_date?: string;
  end_date?: string;
  registration_deadline?: string;
  event_url?: string;
  registration_url?: string;
  technologies?: string[];
  source?: string;
};

/* ── FILTER TABS ────────────────────────── */
const TABS = ["All", "Upcoming", "Live", "Completed", "My Hackathons"] as const;
type Tab = typeof TABS[number];

/* ── TOP CATEGORIES — derived from real technologies[] field ── */
// Built dynamically from hackathon data, not hardcoded

/* ── WHY PARTICIPATE (static — genuinely true) ───────────── */
const WHY = [
  { label: "Learn new skills" },
  { label: "Build real-world solutions" },
  { label: "Win exciting prizes" },
  { label: "Network with innovators" },
];

/* ── HELPERS ────────────────────────────── */
function fmtDate(d?: string) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
}

function fmtDateRange(s?: string, e?: string) {
  const sd = fmtDate(s);
  const ed = fmtDate(e);
  if (sd && ed) return `${sd} – ${ed}`;
  if (sd) return `From ${sd}`;
  if (ed) return `Until ${ed}`;
  return "Date TBD";
}

function getStatus(h: Hackathon): "Upcoming" | "Live" | "Completed" {
  const now = Date.now();
  const start = h.start_date ? new Date(h.start_date).getTime() : null;
  const end   = h.end_date   ? new Date(h.end_date).getTime()   : null;
  if (start && end) {
    if (now < start) return "Upcoming";
    if (now >= start && now <= end) return "Live";
    return "Completed";
  }
  if (start && now < start) return "Upcoming";
  if (end && now > end) return "Completed";
  return "Upcoming";
}

function statusStyle(s: string) {
  if (s === "Live")      return { bg: "#DCFCE7", tx: "#15803D" };
  if (s === "Completed") return { bg: "#F1F5F9", tx: "#64748B" };
  return { bg: "#FEF9C3", tx: "#D97706" };
}

/* ── HACKATHON LOGO ─────────────────────── */
const LOGO_COLORS = [
  { bg: "#1456F0", abbr: "WD" },
  { bg: "#7C3AED", abbr: "</>" },
  { bg: "#DC2626", abbr: "NASA" },
  { bg: "#059669", abbr: "H" },
  { bg: "#D97706", abbr: "B" },
  { bg: "#0E7490", abbr: "🔗" },
];
function logoFor(h: Hackathon, idx: number) {
  const c = LOGO_COLORS[idx % LOGO_COLORS.length];
  const abbr = (h.title || "H").slice(0, 3).toUpperCase();
  return { bg: c.bg, abbr };
}

/* ── ICONS ──────────────────────────────── */
function CalIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={SLL} strokeWidth={1.8}/>
      <Line x1={16} y1={2} x2={16} y2={6} stroke={SLL} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={8} y1={2} x2={8} y2={6} stroke={SLL} strokeWidth={1.8} strokeLinecap="round"/>
      <Line x1={3} y1={10} x2={21} y2={10} stroke={SLL} strokeWidth={1.8}/>
    </Svg>
  );
}
function ArrowRight({ color = SLL }: { color?: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function RefreshIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" stroke={WH} strokeWidth={2} strokeLinecap="round"/>
      <Path d="M21 3v5h-5" stroke={WH} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

/* ══════════════════════════════════════════
   SCREEN
══════════════════════════════════════════ */
export default function HackathonsScreen() {
  const { token } = useAuth();

  const [all,        setAll]        = useState<Hackathon[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState<Tab>("All");
  const [showAll,    setShowAll]    = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  /* ── LOAD ── */
  const load = useCallback(async () => {
    try {
      const res  = await apiFetch("/api/hackathons", token);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setAll(Array.isArray(data.hackathons) ? data.hackathons : []);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  /* ── CRAWL ── */
  const crawl = async () => {
    if (!token) { Alert.alert("Not logged in"); return; }
    try {
      setRefreshing(true);
      const res  = await apiFetch("/api/hackathons/crawl", token, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      await load();
      Alert.alert("Updated", `${data.saved || 0} hackathons refreshed.`);
    } catch { Alert.alert("Error", "Could not refresh hackathons."); }
    finally { setRefreshing(false); }
  };

  /* ── OPEN URL ── */
  const openUrl = async (h: Hackathon) => {
    const url = h.event_url || h.registration_url;
    if (!url) { Alert.alert("Link unavailable"); return; }
    try { await Linking.openURL(url); }
    catch { Alert.alert("Error", "Could not open link."); }
  };

  /* ── FILTER ── */
  const filtered = all.filter(h => {
    if (activeTab === "All" || activeTab === "My Hackathons") return true;
    return getStatus(h) === activeTab;
  });

  const upcoming  = all.filter(h => getStatus(h) === "Upcoming");
  const liveList  = all.filter(h => getStatus(h) === "Live");
  const doneList  = all.filter(h => getStatus(h) === "Completed");
  const tableList = showAll ? filtered : filtered.slice(0, 8);

  /* ── REAL CATEGORIES from technologies[] field ── */
  const catMap = new Map<string, number>();
  all.forEach(h => {
    (h.technologies || []).forEach(tech => {
      const t = tech.trim();
      if (t) catMap.set(t, (catMap.get(t) || 0) + 1);
    });
  });
  const topCategories = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  if (!fontsLoaded) return <View style={{ flex: 1 }}/>;

  /* ── STATUS COUNTS (real) ── */
  const liveCount     = liveList.length;
  const completedCount= doneList.length;
  const totalCount    = all.length;

  return (
    <AppLayout>
      {/* ── TWO-COLUMN LAYOUT ── */}
      <View style={g.twoCol}>

        {/* ═══ LEFT / MAIN COLUMN ═══ */}
        <View style={g.mainCol}>

          {/* PAGE HEADER */}
          <View style={g.pageHead}>
            <View>
              <Text style={g.pageTitle}>Hackathons</Text>
              <Text style={g.pageTagline}>Compete. Build. Innovate.</Text>
              <Text style={g.pageSub}>Participate in hackathons, build solutions and win exciting rewards.</Text>
            </View>
            <Pressable
              style={[g.crawlBtn, refreshing && g.crawlBtnDis]}
              onPress={crawl}
              disabled={refreshing}
            >
              {refreshing
                ? <ActivityIndicator size="small" color={WH}/>
                : <><RefreshIcon/><Text style={g.crawlTxt}>Refresh</Text></>
              }
            </Pressable>
          </View>

          {/* FILTER TABS */}
          <View style={g.tabsRow}>
            {TABS.map(tab => (
              <Pressable
                key={tab}
                style={[g.tab, activeTab === tab && g.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[g.tabTxt, activeTab === tab && g.tabTxtActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>

          {loading ? (
            <View style={g.loadBox}><ActivityIndicator size="large" color={P}/></View>
          ) : (
            <>
              {/* UPCOMING SECTION (show top 3 as featured cards) */}
              {(activeTab === "All" || activeTab === "Upcoming") && upcoming.length > 0 && (
                <View style={g.section}>
                  <Text style={g.sectionTitle}>Upcoming Hackathons</Text>
                  {upcoming.slice(0, 3).map((h, idx) => {
                    const logo = logoFor(h, idx);
                    return (
                      <View key={h.id} style={g.featuredCard}>
                        {/* Logo */}
                        <View style={[g.featuredLogo, { backgroundColor: logo.bg }]}>
                          <Text style={g.featuredLogoTxt}>{logo.abbr}</Text>
                        </View>

                        {/* Info */}
                        <View style={g.featuredInfo}>
                          <Text style={g.featuredTitle} numberOfLines={1}>{h.title || "Hackathon"}</Text>
                          <Text style={g.featuredDesc} numberOfLines={2}>
                            {h.description || "Build innovative solutions and compete with others."}
                          </Text>
                        </View>

          {/* Right: date + location + button */}
                        <View style={g.featuredRight}>
                          <View style={g.featuredDateRow}>
                            <CalIcon/>
                            <Text style={g.featuredDate}>{fmtDateRange(h.start_date, h.end_date)}</Text>
                          </View>
                          <Text style={g.prizeAmt}>
                            {h.is_online ? "🌐 Online" : h.location ? `📍 ${h.location}` : "📍 Offline"}
                          </Text>
                          <Pressable style={g.viewDetailsBtn} onPress={() => openUrl(h)}>
                            <Text style={g.viewDetailsTxt}>View Details</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* ALL HACKATHONS TABLE */}
              {filtered.length > 0 && (
                <View style={g.section}>
                  <Text style={g.sectionTitle}>
                    {activeTab === "All" ? "All Hackathons" : `${activeTab} Hackathons`}
                  </Text>

                  {/* Table header */}
                  <View style={g.tableHeader}>
                    <Text style={[g.tableHdrCell, { flex: 2.5 }]}>Hackathon</Text>
                    <Text style={[g.tableHdrCell, { flex: 1.5 }]}>Date</Text>
                    <Text style={[g.tableHdrCell, { flex: 1 }]}>Type</Text>
                    <Text style={[g.tableHdrCell, { flex: 0.6, textAlign: "right" }]}>›</Text>
                  </View>

                  {/* Table rows */}
                  {tableList.map((h, idx) => {
                    const logo   = logoFor(h, idx);
                    const status = getStatus(h);
                    const sc     = statusStyle(status);
                    return (
                      <Pressable key={h.id} style={g.tableRow} onPress={() => openUrl(h)}>
                        {/* Logo */}
                        <View style={[g.tableLogo, { backgroundColor: logo.bg }]}>
                          <Text style={g.tableLogoTxt}>{logo.abbr.slice(0, 2)}</Text>
                        </View>

                        {/* Title + status */}
                        <View style={[g.tableCell, { flex: 2.5 }]}>
                          <Text style={g.tableTitle} numberOfLines={1}>{h.title || "Hackathon"}</Text>
                          <View style={[g.statusBadge, { backgroundColor: sc.bg }]}>
                            <Text style={[g.statusTxt, { color: sc.tx }]}>{status}</Text>
                          </View>
                        </View>

                        {/* Date */}
                        <View style={[g.tableCell, { flex: 1.5 }]}>
                          <Text style={g.tableMeta}>{fmtDateRange(h.start_date, h.end_date)}</Text>
                        </View>

                        {/* Type */}
                        <View style={[g.tableCell, { flex: 1 }]}>
                          <Text style={g.tableMeta}>{h.is_online ? "Online" : "Hybrid"}</Text>
                        </View>

                        {/* Arrow */}
                        <View style={{ flex: 0.6, alignItems: "flex-end" }}>
                          <ArrowRight color={SLL}/>
                        </View>
                      </Pressable>
                    );
                  })}

                  {/* View all link */}
                  {filtered.length > 8 && (
                    <Pressable style={g.viewAllRow} onPress={() => setShowAll(v => !v)}>
                      <Text style={g.viewAllTxt}>
                        {showAll ? "Show less ↑" : `View all hackathons →`}
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}

              {filtered.length === 0 && (
                <View style={g.emptyCard}>
                  <Text style={{ fontSize: 36, marginBottom: 12 }}>🔍</Text>
                  <Text style={g.emptyTitle}>No hackathons found</Text>
                  <Text style={g.emptyTxt}>
                    Try a different filter or tap Refresh to fetch the latest hackathons.
                  </Text>
                  <Pressable style={g.crawlBtnLg} onPress={crawl} disabled={refreshing}>
                    <Text style={g.crawlBtnLgTxt}>Refresh Hackathons</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <View style={g.rightCol}>

          {/* TOP CATEGORIES — built from real technologies[] data */}
          <View style={g.sideCard}>
            <Text style={g.sideCardTitle}>Top Technologies</Text>
            {topCategories.length === 0 ? (
              <Text style={g.emptyTxt}>
                {loading ? "Loading…" : "No technology data yet. Refresh hackathons to populate."}
              </Text>
            ) : (
              topCategories.map((cat, i) => (
                <View key={cat.label} style={g.catRow}>
                  <View style={[g.catIcon, { backgroundColor: ["#EAF0FE","#DCFCE7","#FEF9C3","#EDE9FE","#FFE4E6"][i % 5] }]}>
                    <Text style={{ fontSize: 13 }}>{"🌐🤖⛓📡🏥".split("")[i] ?? "🔧"}</Text>
                  </View>
                  <Text style={g.catLabel} numberOfLines={1}>{cat.label}</Text>
                  <Text style={g.catCount}>{cat.count}</Text>
                </View>
              ))
            )}
            <Pressable style={g.viewAllCatBtn}>
              <Text style={g.viewAllCatTxt}>View all categories →</Text>
            </Pressable>
          </View>

          {/* WHY PARTICIPATE */}
          <View style={g.sideCard}>
            <Text style={g.sideCardTitle}>Why Participate?</Text>
            {WHY.map(w => (
              <View key={w.label} style={g.whyRow}>
                <View style={g.whyDot}/>
                <Text style={g.whyLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </AppLayout>
  );
}

/* ── STYLES ──────────────────────────────── */
const g = StyleSheet.create({
  /* TWO-COLUMN LAYOUT */
  twoCol:  { flexDirection: "row", gap: 24, alignItems: "flex-start" },
  mainCol: { flex: 1, minWidth: 0 },
  rightCol:{ width: 240, flexShrink: 0, gap: 16 },

  /* PAGE HEADER */
  pageHead:    { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16 },
  pageTitle:   { fontFamily: F.x, fontSize: 26, color: NV },
  pageTagline: { fontFamily: F.b, fontSize: 13.5, color: SL, marginTop: 2 },
  pageSub:     { fontFamily: F.r, fontSize: 12.5, color: SLL, marginTop: 3, maxWidth: 480 },
  crawlBtn:    { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: P, paddingHorizontal: 14, height: 38, borderRadius: 9, marginTop: 4 },
  crawlBtnDis: { opacity: 0.6 },
  crawlTxt:    { fontFamily: F.s, fontSize: 13, color: WH },

  /* TABS */
  tabsRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BD, marginBottom: 22 },
  tab:     { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: "transparent", marginBottom: -1 },
  tabActive:   { borderBottomColor: P },
  tabTxt:      { fontFamily: F.s, fontSize: 13, color: SL },
  tabTxtActive:{ color: P, fontFamily: F.b },

  loadBox: { paddingVertical: 60, alignItems: "center" },

  /* SECTION */
  section:      { marginBottom: 24 },
  sectionTitle: { fontFamily: F.b, fontSize: 16, color: NV, marginBottom: 14 },

  /* FEATURED CARD */
  featuredCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: WH,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BD,
    padding: 16,
    marginBottom: 10,
  },
  featuredLogo:    { width: 54, height: 54, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  featuredLogoTxt: { fontFamily: F.x, fontSize: 13, color: WH },
  featuredInfo:    { flex: 1, minWidth: 0 },
  featuredTitle:   { fontFamily: F.b, fontSize: 14.5, color: NV },
  featuredDesc:    { fontFamily: F.r, fontSize: 12, color: SL, marginTop: 4, lineHeight: 17 },
  featuredRight:   { alignItems: "flex-end", gap: 6, flexShrink: 0 },
  featuredDateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  featuredDate:    { fontFamily: F.m, fontSize: 11.5, color: SL },
  prizeAmt:        { fontFamily: F.b, fontSize: 13, color: P },
  viewDetailsBtn:  { borderWidth: 1, borderColor: BD, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  viewDetailsTxt:  { fontFamily: F.s, fontSize: 12, color: NV },

  /* TABLE */
  tableHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#F8FAFC", borderRadius: 10, borderWidth: 1, borderColor: BD, marginBottom: 2 },
  tableHdrCell:{ fontFamily: F.s, fontSize: 11.5, color: SLL },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: WH,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableLogo:    { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0 },
  tableLogoTxt: { fontFamily: F.b, fontSize: 10, color: WH },
  tableCell:    { paddingRight: 8 },
  tableTitle:   { fontFamily: F.b, fontSize: 13, color: NV, marginBottom: 4 },
  statusBadge:  { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusTxt:    { fontFamily: F.s, fontSize: 10.5 },
  tableMeta:    { fontFamily: F.r, fontSize: 12, color: SL },

  viewAllRow: { paddingVertical: 16, alignItems: "center", borderTopWidth: 1, borderTopColor: BD },
  viewAllTxt: { fontFamily: F.s, fontSize: 13, color: P },

  /* EMPTY */
  emptyCard:     { backgroundColor: WH, borderRadius: 16, borderWidth: 1, borderColor: BD, padding: 48, alignItems: "center" },
  emptyTitle:    { fontFamily: F.b, fontSize: 18, color: NV },
  emptyTxt:      { fontFamily: F.r, fontSize: 13, color: SL, marginTop: 8, textAlign: "center", maxWidth: 360 },
  crawlBtnLg:    { marginTop: 20, backgroundColor: P, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 },
  crawlBtnLgTxt: { fontFamily: F.b, fontSize: 14, color: WH },

  /* RIGHT SIDEBAR */
  sideCard:      { backgroundColor: WH, borderRadius: 14, borderWidth: 1, borderColor: BD, padding: 18 },
  sideCardTitle: { fontFamily: F.b, fontSize: 14.5, color: NV, marginBottom: 14 },

  /* MY HACKATHONS */
  myHackRow:     { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  myHackItem:    { alignItems: "center", gap: 4 },
  myHackNum:     { fontFamily: F.x, fontSize: 22, color: NV },
  myHackLbl:     { fontFamily: F.r, fontSize: 10.5, color: SL },
  myHackIcons:   { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  myHackIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  viewAllMyBtn:  { paddingVertical: 8, alignItems: "center" },
  viewAllMyTxt:  { fontFamily: F.s, fontSize: 12, color: P },

  /* CATEGORIES */
  catRow:   { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  catIcon:  { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  catLabel: { flex: 1, fontFamily: F.m, fontSize: 13, color: NV },
  catCount: { fontFamily: F.s, fontSize: 13, color: SL },
  viewAllCatBtn: { paddingTop: 12, alignItems: "center" },
  viewAllCatTxt: { fontFamily: F.s, fontSize: 12, color: P },

  /* WHY PARTICIPATE */
  whyRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  whyDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: P, flexShrink: 0 },
  whyLabel:{ fontFamily: F.m, fontSize: 13, color: NV },
});
