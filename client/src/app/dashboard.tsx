import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

export default function DashboardScreen() {
  const { token, userId, user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async () => {
    if (!userId || !token) return;

    try {
      const res = await apiFetch(`/api/dashboard/${userId}`, token);
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to load dashboard");

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [userId, token]);

  // ==========================================
  // CONTINUE LEARNING
  // ==========================================

  const startLearning = async (skillId: number, level: string = "Beginner") => {
    if (!userId || !token) return;

    try {
      const res = await apiFetch("/api/ai/generate-assignment", token, {
        method: "POST",
        body: JSON.stringify({ userId, skillId, difficulty: level }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || "Failed to generate assignment");

      router.push(`/assignment?id=${data.assignment.id}`);
    } catch (error) {
      console.error("Start learning error:", error);
      Alert.alert("Error", "Could not generate assignment. Please try again.");
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Could not load dashboard.</Text>
      </View>
    );
  }

  const initials = dashboard.user.name
    ?.split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SK";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>SkillVerse</Text>
        <Pressable onPress={handleLogout}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.greeting}>Welcome, {dashboard.user.name} 👋</Text>
        <Text style={styles.subtitle}>Your personalized student skill dashboard.</Text>

        {/* STAT CARDS */}
        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{dashboard.stats.verifiedSkills}</Text>
            <Text style={styles.cardLabel}>Verified Skills</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{dashboard.stats.overallProgress}%</Text>
            <Text style={styles.cardLabel}>Overall Progress</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{dashboard.stats.assignments}</Text>
            <Text style={styles.cardLabel}>Assignments</Text>
          </View>
        </View>

        {/* QUICK LINKS */}
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.quickLinks}>
          <Pressable style={styles.quickCard} onPress={() => router.push("/feed")}>
            <Text style={styles.quickIcon}>🌐</Text>
            <Text style={styles.quickLabel}>Community Feed</Text>
          </Pressable>
          <Pressable style={styles.quickCard} onPress={() => router.push("/students")}>
            <Text style={styles.quickIcon}>👥</Text>
            <Text style={styles.quickLabel}>Discover Students</Text>
          </Pressable>
          <Pressable style={styles.quickCard} onPress={() => router.push("/hackathons")}>
            <Text style={styles.quickIcon}>🚀</Text>
            <Text style={styles.quickLabel}>Hackathons</Text>
          </Pressable>
          <Pressable style={styles.quickCard} onPress={() => router.push("/profile")}>
            <Text style={styles.quickIcon}>👤</Text>
            <Text style={styles.quickLabel}>My Profile</Text>
          </Pressable>
        </View>

        {/* CHOOSE SKILL */}
        <Text style={styles.sectionTitle}>Start building your skills</Text>
        <Pressable style={styles.learnCard} onPress={() => router.push("/skills")}>
          <Text style={styles.learnTitle}>📚 Choose a skill to learn</Text>
          <Text style={styles.learnText}>Start learning and receive AI-powered assignments.</Text>
        </Pressable>

        {/* MY SKILLS */}
        <Text style={styles.skillsTitle}>My Skills</Text>

        {dashboard.skills.length === 0 ? (
          <View style={styles.emptySkillsCard}>
            <Text style={styles.emptySkillsTitle}>No skills added yet</Text>
            <Text style={styles.emptySkillsText}>Choose a skill to start your learning journey.</Text>
          </View>
        ) : (
          <View style={styles.skillsContainer}>
            {dashboard.skills.map((skill: any) => (
              <View key={skill.id} style={styles.skillCard}>
                <View style={styles.skillHeader}>
                  <View>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillCategory}>{skill.category}</Text>
                  </View>
                  <Text style={styles.skillProgressText}>{skill.progress}%</Text>
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${skill.progress}%` }]} />
                </View>

                <View style={styles.skillFooter}>
                  <Text style={styles.levelText}>Level: {skill.level}</Text>
                  <Text style={styles.assignmentText}>{skill.assignments_completed} assignments</Text>
                </View>

                <Pressable
                  style={styles.continueButton}
                  onPress={() => startLearning(skill.skill_id, skill.level)}
                >
                  <Text style={styles.continueButtonText}>Continue Learning →</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingBottom: 40 },
  navbar: { height: 72, paddingHorizontal: 30, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 21, fontWeight: "800", color: "#111827" },
  avatarBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  content: { width: "100%", maxWidth: 1100, alignSelf: "center", padding: 35 },
  greeting: { fontSize: 32, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 8, color: "#64748B", fontSize: 15 },
  cards: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 35 },
  card: { width: 200, minHeight: 120, backgroundColor: "#FFFFFF", borderRadius: 15, borderWidth: 1, borderColor: "#E5E7EB", padding: 20 },
  cardNumber: { fontSize: 28, fontWeight: "800", color: "#2563EB" },
  cardLabel: { marginTop: 8, fontSize: 13, color: "#64748B" },
  sectionTitle: { marginTop: 40, fontSize: 22, fontWeight: "800", color: "#111827" },
  quickLinks: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 },
  quickCard: { width: 140, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", padding: 18, alignItems: "center" },
  quickIcon: { fontSize: 28 },
  quickLabel: { marginTop: 8, fontSize: 13, fontWeight: "700", color: "#334155", textAlign: "center" },
  learnCard: { marginTop: 18, padding: 25, borderRadius: 15, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE" },
  learnTitle: { fontSize: 18, fontWeight: "800", color: "#1E40AF" },
  learnText: { marginTop: 8, color: "#475569", fontSize: 14 },
  skillsTitle: { marginTop: 40, fontSize: 22, fontWeight: "800", color: "#111827" },
  skillsContainer: { marginTop: 18, gap: 16 },
  skillCard: { backgroundColor: "#FFFFFF", borderRadius: 15, borderWidth: 1, borderColor: "#E5E7EB", padding: 20 },
  skillHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skillName: { fontSize: 18, fontWeight: "800", color: "#111827" },
  skillCategory: { marginTop: 4, fontSize: 13, color: "#64748B" },
  skillProgressText: { fontSize: 20, fontWeight: "800", color: "#2563EB" },
  progressBar: { height: 9, backgroundColor: "#E5E7EB", borderRadius: 10, overflow: "hidden", marginTop: 18 },
  progressFill: { height: "100%", backgroundColor: "#2563EB", borderRadius: 10 },
  skillFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  levelText: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  assignmentText: { fontSize: 13, color: "#64748B" },
  continueButton: { marginTop: 18, height: 48, borderRadius: 12, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  continueButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  emptySkillsCard: { marginTop: 18, padding: 25, backgroundColor: "#FFFFFF", borderRadius: 15, borderWidth: 1, borderColor: "#E5E7EB" },
  emptySkillsTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  emptySkillsText: { marginTop: 7, fontSize: 14, color: "#64748B" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748B" },
});
