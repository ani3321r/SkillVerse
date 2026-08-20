import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Student = {
  id: number; name: string; email: string; college: string;
  department: string; year: string; location: string; interest: string;
  avatar_url?: string | null; skills: string[];
};

export default function StudentsScreen() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/students", token);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStudents(data.students);
    } catch (error) {
      console.error("Student loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async (text: string) => {
    setSearch(text);
    if (!text.trim()) { loadStudents(); return; }

    try {
      setSearching(true);
      const res = await apiFetch(`/api/students/search?q=${encodeURIComponent(text)}`, token);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStudents(data.students);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => { loadStudents(); }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Finding students...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Discover Students</Text>
      <Text style={styles.subtitle}>
        Find students, explore their skills, and connect with people learning similar things.
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={searchStudents}
          placeholder="Search by name, skill, college..."
          placeholderTextColor="#94A3B8"
        />
        {searching && <ActivityIndicator size="small" color="#2563EB" />}
      </View>

      <Text style={styles.resultCount}>
        {students.length} student{students.length !== 1 ? "s" : ""} found
      </Text>

      {students.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No students found</Text>
          <Text style={styles.emptyText}>Try searching with another name, skill, college, or location.</Text>
        </View>
      ) : (
        students.map(student => (
          <View key={student.id} style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{student.name?.charAt(0)?.toUpperCase()}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.department}>{student.department}</Text>
              </View>
            </View>

            <Text style={styles.detail}>🎓 {student.college}</Text>
            <Text style={styles.detail}>📍 {student.location}</Text>
            <Text style={styles.detail}>📚 {student.year}</Text>

            <Text style={styles.skillsLabel}>Skills</Text>
            <View style={styles.skillsContainer}>
              {student.skills?.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.profileButton}
              onPress={() => router.push({ pathname: "/student-profile", params: { id: String(student.id) } })}
            >
              <Text style={styles.profileButtonText}>View Profile →</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: { padding: 25, paddingBottom: 60, maxWidth: 1100, width: "100%", alignSelf: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F9FC" },
  loadingText: { marginTop: 12, color: "#64748B" },
  back: { color: "#2563EB", fontSize: 16, fontWeight: "700", marginBottom: 25 },
  title: { fontSize: 32, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 10, fontSize: 15, lineHeight: 23, color: "#64748B", maxWidth: 700 },
  searchContainer: { marginTop: 25, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 15, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  searchInput: { flex: 1, height: 44, fontSize: 16, color: "#111827" },
  resultCount: { marginTop: 20, marginBottom: 15, color: "#64748B", fontSize: 14, fontWeight: "600" },
  studentCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 18, padding: 20, marginBottom: 16 },
  studentHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 20, fontWeight: "900", color: "#2563EB" },
  studentInfo: { marginLeft: 14 },
  studentName: { fontSize: 19, fontWeight: "800", color: "#111827" },
  department: { marginTop: 3, fontSize: 14, color: "#64748B" },
  detail: { marginTop: 10, fontSize: 14, color: "#475569" },
  skillsLabel: { marginTop: 18, fontSize: 14, fontWeight: "800", color: "#334155" },
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 9 },
  skillBadge: { backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6 },
  skillText: { color: "#1D4ED8", fontSize: 12, fontWeight: "700" },
  profileButton: { marginTop: 18, height: 45, borderRadius: 12, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  profileButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  emptyCard: { marginTop: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 18, padding: 30, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  emptyText: { marginTop: 8, textAlign: "center", color: "#64748B", lineHeight: 21 },
});
