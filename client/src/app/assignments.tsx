import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Skill = {
  skill_id: number;
  name: string;
  category: string;
  level: string;
  progress: number;
  assignments_completed: number;
};

export default function AssignmentsScreen() {
  const { token, userId } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<number | null>(null);

  const loadSkills = useCallback(async () => {
    if (!userId || !token) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/api/skills/user/${userId}`, token);
      const data = await res.json();
      if (data.success) setSkills(data.skills || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useFocusEffect(
    useCallback(() => {
      loadSkills();
    }, [loadSkills])
  );

  const startAssignment = async (skillId: number, level: string) => {
    if (!userId || !token) return;
    setGenerating(skillId);
    try {
      const res = await apiFetch("/api/ai/generate-assignment", token, {
        method: "POST",
        body: JSON.stringify({ userId, skillId, difficulty: level }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to generate");
      router.push(`/assignment?id=${data.assignment.id}` as any);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not generate assignment."
      );
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1456F0" />
        <Text style={styles.loadingText}>Loading your assignments...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Assignments</Text>
      <Text style={styles.subtitle}>
        Generate AI-powered assignments for your skills and track your progress.
      </Text>

      {skills.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No skills added yet</Text>
          <Text style={styles.emptyText}>
            Add skills to your profile first to start getting assignments.
          </Text>
          <Pressable style={styles.addSkillBtn} onPress={() => router.push("/skills")}>
            <Text style={styles.addSkillBtnText}>Choose Skills →</Text>
          </Pressable>
        </View>
      ) : (
        skills.map((skill) => (
          <View key={skill.skill_id} style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <View>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillCategory}>{skill.category}</Text>
              </View>
              <View style={[styles.levelBadge]}>
                <Text style={styles.levelText}>{skill.level}</Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(Math.max(skill.progress, 0), 100)}%` },
                ]}
              />
            </View>

            <View style={styles.skillMeta}>
              <Text style={styles.skillMetaText}>{skill.progress}% progress</Text>
              <Text style={styles.skillMetaText}>
                {skill.assignments_completed} completed
              </Text>
            </View>

            <Pressable
              style={[styles.startBtn, generating === skill.skill_id && styles.startBtnDisabled]}
              onPress={() => startAssignment(skill.skill_id, skill.level)}
              disabled={generating === skill.skill_id}
            >
              {generating === skill.skill_id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.startBtnText}>
                  Generate New Assignment →
                </Text>
              )}
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  content: { padding: 28, paddingBottom: 60, maxWidth: 900, width: "100%", alignSelf: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F7FB" },
  loadingText: { marginTop: 12, fontSize: 15, color: "#64748B" },
  back: { color: "#1456F0", fontSize: 15, fontWeight: "700", marginBottom: 24 },
  title: { fontSize: 32, fontWeight: "800", color: "#0B1D3C" },
  subtitle: { marginTop: 8, fontSize: 15, color: "#64748B", marginBottom: 28 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDEFF3",
    padding: 48,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#0B1D3C" },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 340,
  },
  addSkillBtn: {
    marginTop: 24,
    backgroundColor: "#1456F0",
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },
  addSkillBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  skillCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EDEFF3",
    padding: 22,
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillName: { fontSize: 19, fontWeight: "800", color: "#0B1D3C" },
  skillCategory: { marginTop: 4, fontSize: 13, color: "#64748B" },
  levelBadge: {
    backgroundColor: "#EAF0FE",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  levelText: { color: "#1456F0", fontSize: 12, fontWeight: "700" },
  progressBar: {
    height: 8,
    backgroundColor: "#EDEFF3",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 18,
  },
  progressFill: { height: "100%", backgroundColor: "#1456F0", borderRadius: 10 },
  skillMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  skillMetaText: { fontSize: 12.5, color: "#64748B" },
  startBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1456F0",
    justifyContent: "center",
    alignItems: "center",
  },
  startBtnDisabled: { opacity: 0.6 },
  startBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
