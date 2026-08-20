import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable,
  TextInput, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

import AppLayout from "../components/app-layout";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Student = {
  id: number; name: string; email: string; college: string;
  department: string; year: string; location: string; interest: string;
  avatar_url?: string | null; skills: string[];
};

export default function StudentsScreen() {
  const { token } = useAuth();
  const [students,  setStudents]  = useState<Student[]>([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [searching, setSearching] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res  = await apiFetch("/api/students", token);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStudents(data.students);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const searchStudents = async (text: string) => {
    setSearch(text);
    if (!text.trim()) { loadStudents(); return; }
    try {
      setSearching(true);
      const res  = await apiFetch(`/api/students/search?q=${encodeURIComponent(text)}`, token);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStudents(data.students);
    } catch { /* silent */ }
    finally { setSearching(false); }
  };

  useEffect(() => { loadStudents(); }, [token]);

  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={s.title}>Discover Students</Text>
        <Text style={s.subtitle}>Find students, explore their skills, and connect with people learning similar things.</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={searchStudents}
          placeholder="Search by name, skill, college..."
          placeholderTextColor="#94A3B8"
        />
        {searching && <ActivityIndicator size="small" color="#1456F0" style={{ marginLeft: 10 }}/>}
      </View>

      <Text style={s.count}>{loading ? "Loading…" : `${students.length} student${students.length !== 1 ? "s" : ""} found`}</Text>

      {loading ? (
        <View style={s.loadBox}><ActivityIndicator size="large" color="#1456F0"/></View>
      ) : students.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyTitle}>No students found</Text>
          <Text style={s.emptyText}>Try searching with another name, skill, college, or location.</Text>
        </View>
      ) : (
        students.map(st => (
          <View key={st.id} style={s.card}>
            <View style={s.cardHead}>
              <View style={s.avatar}><Text style={s.avatarTxt}>{st.name?.charAt(0)?.toUpperCase()}</Text></View>
              <View style={s.info}>
                <Text style={s.name}>{st.name}</Text>
                <Text style={s.dept}>{st.department}</Text>
              </View>
            </View>
            <Text style={s.detail}>🎓 {st.college}</Text>
            <Text style={s.detail}>📍 {st.location}</Text>
            <Text style={s.detail}>📚 {st.year}</Text>
            <Text style={s.skillsLabel}>Skills</Text>
            <View style={s.skillsRow}>
              {st.skills?.map((sk, i) => <View key={i} style={s.chip}><Text style={s.chipTxt}>{sk}</Text></View>)}
            </View>
            <Pressable
              style={s.viewBtn}
              onPress={() => router.push({ pathname: "/student-profile", params: { id: String(st.id) } })}
            >
              <Text style={s.viewTxt}>View Profile →</Text>
            </Pressable>
          </View>
        ))
      )}
    </AppLayout>
  );
}

const s = StyleSheet.create({
  header:     { marginBottom: 22 },
  title:      { fontSize: 28, fontWeight: "800", color: "#0B1D3C" },
  subtitle:   { marginTop: 6, fontSize: 14, color: "#64748B", maxWidth: 680 },
  searchRow:  { height: 50, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 16 },
  searchInput:{ flex: 1, fontSize: 14, color: "#111827" },
  count:      { fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 14 },
  loadBox:    { paddingVertical: 50, alignItems: "center" },
  emptyCard:  { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E8ECF2", padding: 36, alignItems: "center" },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: "#0B1D3C" },
  emptyText:  { marginTop: 8, fontSize: 13, color: "#64748B", textAlign: "center" },
  card:       { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 16, padding: 18, marginBottom: 14 },
  cardHead:   { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar:     { width: 48, height: 48, borderRadius: 24, backgroundColor: "#EAF0FE", justifyContent: "center", alignItems: "center" },
  avatarTxt:  { fontSize: 20, fontWeight: "900", color: "#1456F0" },
  info:       { marginLeft: 12 },
  name:       { fontSize: 16, fontWeight: "800", color: "#0B1D3C" },
  dept:       { marginTop: 3, fontSize: 12, color: "#64748B" },
  detail:     { marginTop: 7, fontSize: 13, color: "#475569" },
  skillsLabel:{ marginTop: 14, fontSize: 12, fontWeight: "800", color: "#334155" },
  skillsRow:  { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 7 },
  chip:       { backgroundColor: "#EAF0FE", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  chipTxt:    { color: "#1456F0", fontSize: 11, fontWeight: "700" },
  viewBtn:    { marginTop: 14, height: 44, borderRadius: 10, backgroundColor: "#1456F0", justifyContent: "center", alignItems: "center" },
  viewTxt:    { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
});
