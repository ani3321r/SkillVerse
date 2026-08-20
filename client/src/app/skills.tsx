import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Skill = { id: number; name: string; category: string; description: string };

export default function SkillsScreen() {
  const { token, userId } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSkills(); }, []);

  const loadSkills = async () => {
    try {
      // Skills list is public — no token needed
      const res = await apiFetch("/api/skills", token);
      const data = await res.json();
      if (data.success) setSkills(data.skills);
      else Alert.alert("Error", "Could not load skills");
    } catch (error) {
      Alert.alert("Connection Error", "Could not connect to SkillVerse server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const startLearning = async () => {
    if (selectedSkills.length === 0) {
      Alert.alert("Select a skill", "Please select at least one skill.");
      return;
    }
    if (!userId || !token) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    setSaving(true);
    try {
      // Save each selected skill
      for (const skillId of selectedSkills) {
        const res = await apiFetch("/api/skills/user", token, {
          method: "POST",
          body: JSON.stringify({ userId, skillId }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to save skill");
      }

      // Generate first assignment for the first selected skill
      const firstSkillId = selectedSkills[0];
      const assignmentRes = await apiFetch("/api/ai/generate-assignment", token, {
        method: "POST",
        body: JSON.stringify({ userId, skillId: firstSkillId, difficulty: "Beginner" }),
      });
      const assignmentData = await assignmentRes.json();

      if (!assignmentRes.ok || !assignmentData.success) {
        throw new Error(assignmentData.message || "Failed to generate assignment");
      }

      router.push(`/assignment?id=${assignmentData.assignment.id}`);
    } catch (error) {
      console.error("Start learning error:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Could not start learning.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading skills...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Choose Your Skills</Text>
      <Text style={styles.subtitle}>Select the skills you want to learn and improve.</Text>

      {skills.map(skill => {
        const selected = selectedSkills.includes(skill.id);
        return (
          <Pressable
            key={skill.id}
            onPress={() => toggleSkill(skill.id)}
            style={[styles.skillCard, selected && styles.selectedCard]}
          >
            <View style={styles.cardTop}>
              <View style={styles.icon}>
                <Text style={styles.iconText}>{skill.name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.category}>{skill.category}</Text>
              </View>
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.check}>✓</Text>}
              </View>
            </View>
            <Text style={styles.description}>{skill.description}</Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={startLearning}
        disabled={saving}
        style={[styles.button, saving && styles.buttonDisabled]}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Start Learning →</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: { padding: 24, paddingBottom: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F9FC" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748B" },
  back: { color: "#2563EB", fontSize: 16, fontWeight: "700", marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "800", color: "#111827", marginTop: 10 },
  subtitle: { fontSize: 16, color: "#64748B", marginTop: 8, marginBottom: 25 },
  skillCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 18, padding: 18, marginBottom: 14 },
  selectedCard: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  cardTop: { flexDirection: "row", alignItems: "center" },
  icon: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  iconText: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  info: { flex: 1, marginLeft: 14 },
  skillName: { fontSize: 19, fontWeight: "700", color: "#111827" },
  category: { marginTop: 3, fontSize: 13, color: "#2563EB", fontWeight: "600" },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: "#CBD5E1", justifyContent: "center", alignItems: "center" },
  checkboxSelected: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  check: { color: "#FFFFFF", fontWeight: "800" },
  description: { marginTop: 15, fontSize: 14, lineHeight: 21, color: "#64748B" },
  button: { marginTop: 20, height: 56, borderRadius: 16, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
