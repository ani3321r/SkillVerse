import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, ActivityIndicator, Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Assignment = {
  id: number;
  skill_id: number;
  title: string;
  description: string;
  difficulty: string;
  questions: { question: string; expectedConcepts: string[] };
  skill_name: string;
  skill_category: string;
};

export default function AssignmentScreen() {
  const { id } = useLocalSearchParams();
  const { token, userId } = useAuth();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadAssignment(); }, [id]);

  const loadAssignment = async () => {
    try {
      const res = await apiFetch(`/api/ai/assignment/${id}`, token);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setAssignment(data.assignment);
    } catch (error) {
      Alert.alert("Error", "Could not load assignment.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      Alert.alert("Answer required", "Please write your answer first.");
      return;
    }
    if (!userId || !token) return;

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/ai/evaluate-answer", token, {
        method: "POST",
        body: JSON.stringify({ userId, assignmentId: Number(id), answer: answer.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Evaluation failed");
      setEvaluation(data.evaluation);
      setProgress(data.progress);
    } catch (error) {
      Alert.alert("Evaluation Error", error instanceof Error ? error.message : "Could not evaluate answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextAssignment = async () => {
    if (!assignment || !userId || !token) return;

    setSubmitting(true);
    try {
      const difficulty = progress?.level || assignment.difficulty || "Beginner";
      const res = await apiFetch("/api/ai/generate-assignment", token, {
        method: "POST",
        body: JSON.stringify({ userId, skillId: assignment.skill_id, difficulty }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to generate next assignment");

      setEvaluation(null);
      setProgress(null);
      setAnswer("");
      router.replace(`/assignment?id=${data.assignment.id}`);
    } catch (error) {
      Alert.alert("Error", "Could not generate the next assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loading}>Loading assignment...</Text>
      </View>
    );
  }

  if (!assignment) {
    return <View style={styles.center}><Text>Assignment not found.</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.category}>{assignment.skill_name}</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{assignment.difficulty}</Text>
      </View>

      <Text style={styles.title}>{assignment.title}</Text>
      <Text style={styles.description}>{assignment.description}</Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>YOUR TASK</Text>
        <Text style={styles.question}>{assignment.questions.question}</Text>
      </View>

      <Text style={styles.answerLabel}>Your Answer</Text>
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Write your solution here..."
        placeholderTextColor="#94A3B8"
        multiline
        textAlignVertical="top"
        editable={!evaluation}
      />

      {/* EVALUATION RESULT */}
      {evaluation && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Assignment Result</Text>
          <Text style={styles.score}>{evaluation.score}/100</Text>
          <Text style={[styles.status, evaluation.passed ? styles.passed : styles.failed]}>
            {evaluation.passed ? "✓ Passed" : "✕ Needs Improvement"}
          </Text>

          {progress && (
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Your Skill Progress</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress.progress}% · {progress.level}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>AI Feedback</Text>
          <Text style={styles.feedback}>{evaluation.feedback}</Text>

          <Text style={styles.sectionTitle}>Strengths</Text>
          {evaluation.strengths?.map((item: string, i: number) => (
            <Text key={i} style={styles.listItem}>✓ {item}</Text>
          ))}

          <Text style={styles.sectionTitle}>Improvements</Text>
          {evaluation.improvements?.map((item: string, i: number) => (
            <Text key={i} style={styles.listItem}>• {item}</Text>
          ))}
        </View>
      )}

      <Pressable
        style={[styles.button, submitting && styles.disabled]}
        onPress={evaluation ? nextAssignment : submitAnswer}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            {evaluation ? "Next Assignment →" : "Submit Answer →"}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: { padding: 24, paddingBottom: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F9FC" },
  loading: { marginTop: 12, color: "#64748B" },
  back: { fontSize: 16, color: "#2563EB", fontWeight: "600", marginBottom: 25 },
  category: { fontSize: 15, color: "#2563EB", fontWeight: "700" },
  badge: { alignSelf: "flex-start", backgroundColor: "#DBEAFE", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  badgeText: { color: "#1D4ED8", fontWeight: "700", fontSize: 13 },
  title: { fontSize: 30, fontWeight: "800", color: "#111827", marginTop: 18 },
  description: { fontSize: 16, lineHeight: 25, color: "#64748B", marginTop: 12 },
  questionCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 20, marginTop: 25, borderWidth: 1, borderColor: "#E2E8F0" },
  questionLabel: { fontSize: 12, fontWeight: "800", color: "#2563EB", letterSpacing: 1 },
  question: { fontSize: 17, lineHeight: 27, color: "#1E293B", marginTop: 12 },
  answerLabel: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 28, marginBottom: 10 },
  input: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 16, minHeight: 220, padding: 16, fontSize: 16, color: "#111827" },
  button: { height: 56, backgroundColor: "#2563EB", borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 20 },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  resultCard: { marginTop: 28, padding: 24, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  resultTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  score: { marginTop: 14, fontSize: 48, fontWeight: "900", color: "#2563EB" },
  status: { marginTop: 5, fontSize: 17, fontWeight: "700" },
  passed: { color: "#16A34A" },
  failed: { color: "#DC2626" },
  progressSection: { marginTop: 24 },
  progressLabel: { fontSize: 16, fontWeight: "700", color: "#334155" },
  progressBar: { height: 12, marginTop: 10, backgroundColor: "#E2E8F0", borderRadius: 10, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2563EB", borderRadius: 10 },
  progressText: { marginTop: 8, fontSize: 14, color: "#64748B" },
  sectionTitle: { marginTop: 24, marginBottom: 8, fontSize: 17, fontWeight: "800", color: "#111827" },
  feedback: { fontSize: 15, lineHeight: 23, color: "#475569" },
  listItem: { marginTop: 8, fontSize: 15, lineHeight: 22, color: "#475569" },
});
