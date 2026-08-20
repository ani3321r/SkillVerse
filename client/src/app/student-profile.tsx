import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Skill = {
  id: number; name: string; category: string; description: string;
  progress: number; score: number; level: string;
  assignments_completed: number; tests_completed: number;
};

type Student = {
  id: number; name: string; email: string; college: string;
  department: string; year: string; location: string; interest: string;
  github_url?: string | null; linkedin_url?: string | null;
  portfolio_url?: string | null; avatar_url?: string | null;
};

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams();
  const { token, userId } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await apiFetch(`/api/students/${id}`, token);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStudent(data.student);
      setSkills(data.skills);
    } catch (error) {
      console.error("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, [id, token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loading}>Loading profile...</Text>
      </View>
    );
  }

  if (!student) {
    return <View style={styles.center}><Text>Student not found.</Text></View>;
  }

  const isSelf = userId === student.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back to Students</Text>
      </Pressable>

      {/* PROFILE HEADER */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.department}>{student.department}</Text>
        <Text style={styles.college}>🎓 {student.college}</Text>
        <Text style={styles.location}>📍 {student.location}</Text>
        <Text style={styles.year}>📚 {student.year}</Text>

        {!isSelf && (
          <Pressable
            style={styles.messageButton}
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: {
                  userId: String(student.id),
                  name: student.name,
                },
              })
            }
          >
            <Text style={styles.messageButtonText}>💬 Message</Text>
          </Pressable>
        )}
      </View>

      {/* ABOUT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.about}>Interested in {student.interest}.</Text>
      </View>

      {/* SKILLS */}
      <Text style={styles.mainTitle}>Skills</Text>

      {skills.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>This student has not added any skills yet.</Text>
        </View>
      ) : (
        skills.map(skill => (
          <View key={skill.id} style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <View>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillCategory}>{skill.category}</Text>
              </View>
              <Text style={styles.level}>{skill.level}</Text>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(Math.max(Number(skill.progress) || 0, 0), 100)}%` }]} />
            </View>

            <Text style={styles.progressText}>{skill.progress}% progress</Text>
            <Text style={styles.assignmentText}>{skill.assignments_completed} assignments completed</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: { padding: 25, paddingBottom: 60, maxWidth: 900, width: "100%", alignSelf: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F9FC" },
  loading: { marginTop: 12, color: "#64748B" },
  back: { color: "#2563EB", fontSize: 16, fontWeight: "700", marginBottom: 25 },
  profileCard: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", padding: 30, alignItems: "center" },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 36, fontWeight: "900", color: "#2563EB" },
  name: { marginTop: 18, fontSize: 28, fontWeight: "900", color: "#111827" },
  department: { marginTop: 5, fontSize: 15, color: "#64748B" },
  college: { marginTop: 16, fontSize: 14, color: "#475569" },
  location: { marginTop: 8, fontSize: 14, color: "#475569" },
  year: { marginTop: 8, fontSize: 14, color: "#475569" },
  messageButton: { marginTop: 20, width: "100%", backgroundColor: "#2563EB", paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  messageButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  section: { marginTop: 25, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 22, borderWidth: 1, borderColor: "#E2E8F0" },
  sectionTitle: { fontSize: 19, fontWeight: "800", color: "#111827" },
  about: { marginTop: 10, fontSize: 15, color: "#64748B" },
  mainTitle: { marginTop: 30, marginBottom: 15, fontSize: 22, fontWeight: "900", color: "#111827" },
  skillCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", padding: 20, marginBottom: 14 },
  skillHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skillName: { fontSize: 18, fontWeight: "800", color: "#111827" },
  skillCategory: { marginTop: 4, fontSize: 13, color: "#64748B" },
  level: { backgroundColor: "#EFF6FF", color: "#1D4ED8", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, fontSize: 12, fontWeight: "700", overflow: "hidden" },
  progressBar: { height: 10, backgroundColor: "#E2E8F0", borderRadius: 10, overflow: "hidden", marginTop: 18 },
  progressFill: { height: "100%", backgroundColor: "#2563EB", borderRadius: 10 },
  progressText: { marginTop: 8, fontSize: 13, color: "#64748B" },
  assignmentText: { marginTop: 6, fontSize: 13, color: "#64748B" },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 25, borderWidth: 1, borderColor: "#E2E8F0" },
  emptyText: { color: "#64748B", textAlign: "center" },
});
