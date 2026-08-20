import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TextInput,
  Pressable, ActivityIndicator, Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AppLayout from "../components/app-layout";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Assignment = {
  id: number; skill_id: number; title: string; description: string;
  difficulty: string; questions: { question: string; expectedConcepts: string[] };
  skill_name: string; skill_category: string;
};

export default function AssignmentScreen() {
  const { id }             = useLocalSearchParams();
  const { token, userId }  = useAuth();

  const [assignment,  setAssignment]  = useState<Assignment | null>(null);
  const [answer,      setAnswer]      = useState("");
  const [loading,     setLoading]     = useState(true);
  const [evaluation,  setEvaluation]  = useState<any>(null);
  const [progress,    setProgress]    = useState<any>(null);
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => { loadAssignment(); }, [id]);

  const loadAssignment = async () => {
    try {
      const res  = await apiFetch(`/api/ai/assignment/${id}`, token);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setAssignment(data.assignment);
    } catch {
      Alert.alert("Error", "Could not load assignment.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) { Alert.alert("Answer required", "Please write your answer first."); return; }
    if (!userId || !token) return;
    setSubmitting(true);
    try {
      const res  = await apiFetch("/api/ai/evaluate-answer", token, {
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
      const res  = await apiFetch("/api/ai/generate-assignment", token, {
        method: "POST",
        body: JSON.stringify({ userId, skillId: assignment.skill_id, difficulty }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      setEvaluation(null); setProgress(null); setAnswer("");
      router.replace(`/assignment?id=${data.assignment.id}`);
    } catch {
      Alert.alert("Error", "Could not generate the next assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <View style={s.loadBox}><ActivityIndicator size="large" color="#1456F0"/></View>
      </AppLayout>
    );
  }

  if (!assignment) {
    return <AppLayout><Text style={s.notFound}>Assignment not found.</Text></AppLayout>;
  }

  return (
    <AppLayout>
      {/* Skill + difficulty */}
      <Text style={s.skillLabel}>{assignment.skill_name}</Text>
      <View style={s.diffBadge}><Text style={s.diffTxt}>{assignment.difficulty}</Text></View>

      {/* Title + description */}
      <Text style={s.title}>{assignment.title}</Text>
      <Text style={s.desc}>{assignment.description}</Text>

      {/* Task */}
      <View style={s.taskCard}>
        <Text style={s.taskLabel}>YOUR TASK</Text>
        <Text style={s.taskText}>{assignment.questions.question}</Text>
      </View>

      {/* Answer */}
      <Text style={s.answerLabel}>Your Answer</Text>
      <TextInput
        style={s.input}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Write your solution here..."
        placeholderTextColor="#94A3B8"
        multiline
        textAlignVertical="top"
        editable={!evaluation}
      />

      {/* Evaluation result */}
      {evaluation && (
        <View style={s.resultCard}>
          <Text style={s.resultTitle}>Assignment Result</Text>
          <Text style={s.score}>{evaluation.score}/100</Text>
          <Text style={[s.status, evaluation.passed ? s.passed : s.failed]}>
            {evaluation.passed ? "✓ Passed" : "✕ Needs Improvement"}
          </Text>

          {progress && (
            <View style={s.progSection}>
              <Text style={s.progLabel}>Your Skill Progress</Text>
              <View style={s.progBar}>
                <View style={[s.progFill, { width: `${progress.progress}%` as any }]}/>
              </View>
              <Text style={s.progTxt}>{progress.progress}% · {progress.level}</Text>
            </View>
          )}

          <Text style={s.sectionTitle}>AI Feedback</Text>
          <Text style={s.feedback}>{evaluation.feedback}</Text>

          <Text style={s.sectionTitle}>Strengths</Text>
          {evaluation.strengths?.map((item: string, i: number) => <Text key={i} style={s.listItem}>✓ {item}</Text>)}

          <Text style={s.sectionTitle}>Improvements</Text>
          {evaluation.improvements?.map((item: string, i: number) => <Text key={i} style={s.listItem}>• {item}</Text>)}
        </View>
      )}

      <Pressable
        style={[s.btn, submitting && s.btnDis]}
        onPress={evaluation ? nextAssignment : submitAnswer}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#FFFFFF"/>
          : <Text style={s.btnTxt}>{evaluation ? "Next Assignment →" : "Submit Answer →"}</Text>
        }
      </Pressable>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  loadBox:      { paddingVertical: 60, alignItems: "center" },
  notFound:     { fontSize: 15, color: "#64748B", textAlign: "center", marginTop: 40 },
  skillLabel:   { fontSize: 14, color: "#1456F0", fontWeight: "700" },
  diffBadge:    { alignSelf: "flex-start", backgroundColor: "#DBEAFE", paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, marginTop: 8 },
  diffTxt:      { color: "#1D4ED8", fontWeight: "700", fontSize: 12 },
  title:        { fontSize: 26, fontWeight: "800", color: "#0B1D3C", marginTop: 16 },
  desc:         { fontSize: 14, lineHeight: 22, color: "#64748B", marginTop: 10, maxWidth: 780 },
  taskCard:     { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, marginTop: 22, borderWidth: 1, borderColor: "#E8ECF2", maxWidth: 780 },
  taskLabel:    { fontSize: 11, fontWeight: "800", color: "#1456F0", letterSpacing: 1 },
  taskText:     { fontSize: 15, lineHeight: 24, color: "#1E293B", marginTop: 10 },
  answerLabel:  { fontSize: 16, fontWeight: "700", color: "#0B1D3C", marginTop: 24, marginBottom: 8 },
  input:        { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 14, minHeight: 200, padding: 14, fontSize: 14, color: "#111827", maxWidth: 780 },
  btn:          { height: 52, backgroundColor: "#1456F0", borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 18, maxWidth: 780 },
  btnDis:       { opacity: 0.6 },
  btnTxt:       { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  resultCard:   { marginTop: 24, padding: 22, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E8ECF2", maxWidth: 780 },
  resultTitle:  { fontSize: 20, fontWeight: "800", color: "#0B1D3C" },
  score:        { marginTop: 12, fontSize: 44, fontWeight: "900", color: "#1456F0" },
  status:       { marginTop: 4, fontSize: 15, fontWeight: "700" },
  passed:       { color: "#16A34A" },
  failed:       { color: "#DC2626" },
  progSection:  { marginTop: 20 },
  progLabel:    { fontSize: 14, fontWeight: "700", color: "#334155" },
  progBar:      { height: 10, marginTop: 8, backgroundColor: "#E2E8F0", borderRadius: 8, overflow: "hidden" },
  progFill:     { height: "100%", backgroundColor: "#1456F0", borderRadius: 8 },
  progTxt:      { marginTop: 6, fontSize: 12, color: "#64748B" },
  sectionTitle: { marginTop: 20, marginBottom: 6, fontSize: 15, fontWeight: "800", color: "#0B1D3C" },
  feedback:     { fontSize: 14, lineHeight: 21, color: "#475569" },
  listItem:     { marginTop: 6, fontSize: 14, lineHeight: 20, color: "#475569" },
});
