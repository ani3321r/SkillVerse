import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */
type Student = {
  id: number;
  name: string;
  college: string;
  department: string;
  year: string;
  location: string;
  interest: string;
  avatar_url?: string | null;
  skills: string[];
};

/* ---------------------------------------------------------
   FILTER OPTIONS
--------------------------------------------------------- */
const INTEREST_OPTIONS = [
  { label: "All", value: "" },
  { label: "Software", value: "software" },
  { label: "Hardware", value: "hardware" },
  { label: "Both", value: "both" },
];

const YEAR_OPTIONS = [
  { label: "All Years", value: "" },
  { label: "1st Year", value: "1st Year" },
  { label: "2nd Year", value: "2nd Year" },
  { label: "3rd Year", value: "3rd Year" },
  { label: "4th Year", value: "4th Year" },
];

/* ---------------------------------------------------------
   PILL FILTER BUTTON
--------------------------------------------------------- */
function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

/* ---------------------------------------------------------
   STUDENT CARD
--------------------------------------------------------- */
function StudentCard({ student }: { student: Student }) {
  const initial = student.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <View style={styles.studentCard}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentDept}>{student.department}</Text>
          <Text style={styles.studentCollege} numberOfLines={1}>
            🎓 {student.college}
          </Text>
        </View>
        <View style={styles.cardMeta}>
          <View style={[styles.interestBadge, interestColor(student.interest)]}>
            <Text style={[styles.interestText, interestTextColor(student.interest)]}>
              {student.interest}
            </Text>
          </View>
          <Text style={styles.yearText}>{student.year}</Text>
        </View>
      </View>

      {student.skills?.length > 0 && (
        <View style={styles.skillsRow}>
          {student.skills.slice(0, 4).map((skill, i) => (
            <View key={i} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{skill}</Text>
            </View>
          ))}
          {student.skills.length > 4 && (
            <Text style={styles.moreSkills}>+{student.skills.length - 4}</Text>
          )}
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.locationText}>📍 {student.location}</Text>
        <Pressable
          style={styles.viewBtn}
          onPress={() =>
            router.push({
              pathname: "/student-profile",
              params: { id: String(student.id) },
            })
          }
        >
          <Text style={styles.viewBtnText}>View Profile →</Text>
        </Pressable>
      </View>
    </View>
  );
}

function interestColor(interest: string) {
  if (interest === "software") return { backgroundColor: "#EAF0FE" };
  if (interest === "hardware") return { backgroundColor: "#E7F8ED" };
  return { backgroundColor: "#F1EAFE" };
}
function interestTextColor(interest: string) {
  if (interest === "software") return { color: "#1456F0" };
  if (interest === "hardware") return { color: "#16A34A" };
  return { color: "#7C3AED" };
}

/* ---------------------------------------------------------
   SCREEN
--------------------------------------------------------- */
export default function ExploreScreen() {
  const { token } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [interest, setInterest] = useState("");
  const [year, setYear] = useState("");
  const [college, setCollege] = useState("");
  const [location, setLocation] = useState("");

  // ============================================================
  // FETCH STUDENTS
  // ============================================================

  const fetchStudents = useCallback(async () => {
    if (!token) return;
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (interest) params.set("interest", interest);
      if (year) params.set("year", year);
      if (college.trim()) params.set("college", college.trim());
      if (location.trim()) params.set("location", location.trim());

      const query = params.toString();
      const res = await apiFetch(
        `/api/discover${query ? `?${query}` : ""}`,
        token
      );
      const data = await res.json();
      if (data.success) setStudents(data.students || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [token, search, interest, year, college, location]);

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [fetchStudents])
  );

  const clearFilters = () => {
    setSearch("");
    setInterest("");
    setYear("");
    setCollege("");
    setLocation("");
  };

  const hasFilters = !!(search || interest || year || college || location);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      {/* HEADER */}
      <Text style={styles.title}>Explore Students</Text>
      <Text style={styles.subtitle}>
        Discover students across colleges, filter by interest, year, and location.
      </Text>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchStudents}
          returnKeyType="search"
          placeholder="Search by name, skill, college..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
        {searching && <ActivityIndicator size="small" color="#1456F0" />}
      </View>

      {/* FILTER ROW — Interest */}
      <Text style={styles.filterLabel}>Interest</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {INTEREST_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            label={opt.label}
            active={interest === opt.value}
            onPress={() => {
              setInterest(opt.value);
            }}
          />
        ))}
      </ScrollView>

      {/* FILTER ROW — Year */}
      <Text style={styles.filterLabel}>Year</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {YEAR_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            label={opt.label}
            active={year === opt.value}
            onPress={() => {
              setYear(opt.value);
            }}
          />
        ))}
      </ScrollView>

      {/* SECONDARY FILTERS */}
      <View style={styles.secondaryRow}>
        <TextInput
          value={college}
          onChangeText={setCollege}
          placeholder="Filter by college..."
          placeholderTextColor="#94A3B8"
          style={styles.secondaryInput}
        />
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Filter by city..."
          placeholderTextColor="#94A3B8"
          style={styles.secondaryInput}
        />
      </View>

      {/* ACTION ROW */}
      <View style={styles.actionRow}>
        <Pressable style={styles.searchBtn} onPress={fetchStudents} disabled={searching}>
          <Text style={styles.searchBtnText}>
            {searching ? "Searching..." : "Apply Filters"}
          </Text>
        </Pressable>
        {hasFilters && (
          <Pressable style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* RESULTS HEADER */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {loading ? "Loading..." : `${students.length} student${students.length !== 1 ? "s" : ""} found`}
        </Text>
      </View>

      {/* RESULTS */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1456F0" />
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔎</Text>
          <Text style={styles.emptyTitle}>No students found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your filters or clearing the search to see more students.
          </Text>
          {hasFilters && (
            <Pressable style={styles.clearBtnLarge} onPress={clearFilters}>
              <Text style={styles.clearBtnLargeText}>Clear All Filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))
      )}
    </ScrollView>
  );
}

/* ---------------------------------------------------------
   STYLES
--------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  content: { padding: 28, paddingBottom: 70, maxWidth: 1100, width: "100%", alignSelf: "center" },
  back: { color: "#1456F0", fontSize: 15, fontWeight: "700", marginBottom: 24 },
  title: { fontSize: 32, fontWeight: "800", color: "#0B1D3C" },
  subtitle: { marginTop: 8, fontSize: 15, color: "#64748B", marginBottom: 24 },

  // SEARCH
  searchBar: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDEFF3",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  searchIcon: { fontSize: 17 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    height: "100%",
  },

  // FILTER PILLS
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 16,
    paddingRight: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#EDEFF3",
  },
  pillActive: {
    backgroundColor: "#1456F0",
    borderColor: "#1456F0",
  },
  pillText: { fontSize: 13, fontWeight: "600", color: "#334155" },
  pillTextActive: { color: "#FFFFFF" },

  // SECONDARY FILTERS
  secondaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  secondaryInput: {
    flex: 1,
    minWidth: 140,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDEFF3",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111827",
  },

  // ACTION ROW
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  searchBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#1456F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  clearBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#EDEFF3",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtnText: { color: "#64748B", fontWeight: "700", fontSize: 14 },

  // RESULTS HEADER
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsCount: { fontSize: 14, fontWeight: "700", color: "#334155" },

  // LOADING
  loadingBox: { paddingVertical: 60, alignItems: "center" },

  // EMPTY
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDEFF3",
    padding: 48,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#0B1D3C" },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 360,
  },
  clearBtnLarge: {
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: "#1456F0",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  clearBtnLargeText: { color: "#1456F0", fontWeight: "700", fontSize: 14 },

  // STUDENT CARD
  studentCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDEFF3",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EAF0FE",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 22, fontWeight: "900", color: "#1456F0" },
  cardInfo: { flex: 1 },
  studentName: { fontSize: 17, fontWeight: "800", color: "#0B1D3C" },
  studentDept: { marginTop: 3, fontSize: 13, color: "#64748B" },
  studentCollege: { marginTop: 4, fontSize: 13, color: "#475569" },
  cardMeta: { alignItems: "flex-end", gap: 6 },
  interestBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  interestText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  yearText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },
  skillChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  skillChipText: { fontSize: 12, fontWeight: "600", color: "#334155" },
  moreSkills: { fontSize: 12, color: "#64748B", alignSelf: "center" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  locationText: { fontSize: 13, color: "#64748B" },
  viewBtn: {
    backgroundColor: "#1456F0",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  viewBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
});
