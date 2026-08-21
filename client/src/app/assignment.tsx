import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TextInput,
  Pressable, ActivityIndicator, Alert,
  ScrollView, Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
const P   = "#1456F0";
const PS  = "#EAF0FE";
const NV  = "#0B1D3C";
const SL  = "#64748B";
const SLL = "#94A3B8";
const BD  = "#E8ECF2";
const WH  = "#FFFFFF";
const BG  = "#F4F6FB";
const GR  = "#22C55E";
const OR  = "#F59E0B";
const RD  = "#EF4444";

const F = {
  r: "PlusJakartaSans_400Regular",
  m: "PlusJakartaSans_500Medium",
  s: "PlusJakartaSans_600SemiBold",
  b: "PlusJakartaSans_700Bold",
  x: "PlusJakartaSans_800ExtraBold",
};

/* ── TYPES ── */
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

type Evaluation = {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  passed: boolean;
};

type Progression = {
  leveledUp: boolean;
  levelUpMessage: string | null;
  currentLevel: string;
  nextLevel: string | null;
  passesAtCurrentLevel: number;
  passesRequired: number;
  progress: number;
  assignmentsCompleted: number;
  isMaxLevel: boolean;
  nextDifficulty: string;
};

/* ── DIFFICULTY COLORS ── */
const DIFF: Record<string, { bg: string; tx: string }> = {
  Beginner:     { bg: "#DCFCE7", tx: "#15803D" },
  Intermediate: { bg: "#FEF9C3", tx: "#A16207" },
  Advanced:     { bg: "#FEE2E2", tx: "#DC2626" },
};
function dc(d: string) { return DIFF[d] ?? { bg: PS, tx: P }; }

/* ── SCORE COLOR ── */
function scoreColor(s: number) {
  if (s >= 80) return GR;
  if (s >= 50) return OR;
  return RD;
}

/* ── ICONS ── */
function IconCheck({ size = 16, color = GR }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function IconX({ size = 16, color = RD }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round"/>
      <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round"/>
    </Svg>
  );
}
function IconClock({ size = 16, color = OR }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8}/>
      <Path d="M12 7v5l3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function IconStar({ size = 16, color = OR }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} stroke={color} strokeWidth={0.5}/>
    </Svg>
  );
}
function IconAI({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" stroke={P} strokeWidth={1.8}/>
      <Path d="M3 20a9 9 0 0 1 18 0" stroke={P} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}
function IconArrow() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={WH} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

/* ── CIRCULAR SCORE GAUGE ── */
function ScoreGauge({ score }: { score: number }) {
  const r    = 36;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  const col  = scoreColor(score);
  return (
    <View style={g.gauge}>
      <Svg width={90} height={90} viewBox="0 0 90 90">
        <Circle cx={45} cy={45} r={r} stroke="#E8ECF2" strokeWidth={7} fill="none"/>
        <Circle
          cx={45} cy={45} r={r}
          stroke={col} strokeWidth={7} fill="none"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
      </Svg>
      <View style={g.gaugeInner}>
        <Text style={[g.gaugeNum, { color: col }]}>{score}%</Text>
      </View>
    </View>
  );
}

/* ══════════════════════════════════════════
   SCREEN
══════════════════════════════════════════ */
export default function AssignmentScreen() {
  const { id }            = useLocalSearchParams();
  const { token, userId } = useAuth();

  const [assignment,  setAssignment]  = useState<Assignment | null>(null);
  const [answer,      setAnswer]      = useState("");
  const [loading,     setLoading]     = useState(true);
  const [evaluation,  setEvaluation]  = useState<Evaluation | null>(null);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [generating,  setGenerating]  = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (id) loadAssignment();
  }, [id]);

  /* ── LOAD ASSIGNMENT ── */
  const loadAssignment = async () => {
    setLoading(true);
    setEvaluation(null);
    setProgression(null);
    setAnswer("");
    try {
      const res  = await apiFetch(`/api/ai/assignment/${id}`, token);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Assignment not found");
      setAssignment(data.assignment);
    } catch (error) {
      Alert.alert(
        "Could not load assignment",
        error instanceof Error ? error.message : "Please try again.",
        [{ text: "Go back", onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── SUBMIT ANSWER ── */
  const submitAnswer = async () => {
    if (!answer.trim()) {
      Alert.alert("Empty answer", "Please write your answer before submitting.");
      return;
    }
    if (!userId || !token) return;

    setSubmitting(true);
    try {
      const res  = await apiFetch("/api/ai/evaluate-answer", token, {
        method: "POST",
        body: JSON.stringify({
          userId:       Number(userId),
          assignmentId: Number(id),
          answer:       answer.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Evaluation failed");
      setEvaluation(data.evaluation);
      setProgression(data.progression ?? null);
    } catch (error) {
      Alert.alert(
        "Evaluation Error",
        error instanceof Error ? error.message : "Could not evaluate your answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── NEXT ASSIGNMENT ── */
  const nextAssignment = async () => {
    if (!assignment || !userId || !token) return;
    setGenerating(true);
    try {
      const res  = await apiFetch("/api/ai/next-assignment", token, {
        method: "POST",
        body: JSON.stringify({
          userId:  Number(userId),
          skillId: Number(assignment.skill_id),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to generate next assignment");
      setEvaluation(null);
      setProgression(null);
      setAnswer("");
      router.replace(`/assignment?id=${data.assignment.id}`);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Could not generate next assignment.");
    } finally {
      setGenerating(false);
    }
  };

  /* ── LOADING ── */
  if (!fontsLoaded || loading) {
    return (
      <AppLayout>
        <View style={g.loadBox}>
          <ActivityIndicator size="large" color={P}/>
          <Text style={g.loadTxt}>
            {loading ? "Loading assignment..." : "Loading..."}
          </Text>
        </View>
      </AppLayout>
    );
  }

  if (!assignment) {
    return (
      <AppLayout>
        <View style={g.loadBox}>
          <Text style={g.notFound}>Assignment not found.</Text>
          <Pressable style={g.goBackBtn} onPress={() => router.back()}>
            <Text style={g.goBackTxt}>← Go back</Text>
          </Pressable>
        </View>
      </AppLayout>
    );
  }

  const dclr    = dc(assignment.difficulty);
  const passed  = evaluation?.passed ?? false;
  const score   = evaluation?.score ?? 0;
  const passesLeft = progression
    ? Math.max(0, progression.passesRequired - progression.passesAtCurrentLevel)
    : null;

  return (
    <AppLayout>
      {/* ── BACK + PAGE TITLE ── */}
      <View style={g.topRow}>
        <Pressable style={g.backBtn} onPress={() => router.push("/assignments")}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5" stroke={P} strokeWidth={2} strokeLinecap="round"/>
            <Path d="M12 19l-7-7 7-7" stroke={P} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <Text style={g.backTxt}>Back</Text>
        </Pressable>
        <View style={g.pageTitleCol}>
          <Text style={g.pageTitle}>AI Assignment Checker</Text>
          <Text style={g.pageSub}>Complete the task below and get instant AI feedback with marks.</Text>
        </View>
        {/* Stats chips */}
        {evaluation && (
          <View style={g.statsRow}>
            <View style={g.statChip}>
              <Text style={g.statChipLabel}>Your Score</Text>
              <Text style={[g.statChipVal, { color: scoreColor(score) }]}>{score}%</Text>
            </View>
            <View style={g.statChip}>
              <Text style={g.statChipLabel}>Status</Text>
              <Text style={[g.statChipVal, { color: passed ? GR : RD }]}>
                {passed ? "Passed" : "Failed"}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={g.twoCol}>

        {/* ═══ LEFT — Problem + Answer ═══ */}
        <View style={g.leftCol}>

          {/* Section 1 — Problem Statement */}
          <View style={g.sectionCard}>
            <View style={g.sectionHeader}>
              <Text style={g.sectionNum}>1.</Text>
              <Text style={g.sectionTitle}>Problem Statement</Text>
              <View style={[g.diffBadge, { backgroundColor: dclr.bg }]}>
                <Text style={[g.diffTxt, { color: dclr.tx }]}>{assignment.difficulty}</Text>
              </View>
              <View style={g.skillBadge}>
                <Text style={g.skillBadgeTxt}>{assignment.skill_name}</Text>
              </View>
            </View>

            <Text style={g.assignmentTitle}>{assignment.title}</Text>
            <Text style={g.assignmentDesc}>{assignment.description}</Text>

            <View style={g.taskBox}>
              <Text style={g.taskBoxLabel}>YOUR TASK</Text>
              <Text style={g.taskBoxText}>{assignment.questions.question}</Text>
            </View>

            {assignment.questions.expectedConcepts?.length > 0 && (
              <View style={g.conceptsRow}>
                <Text style={g.conceptsLabel}>Key concepts to cover:</Text>
                <View style={g.conceptChips}>
                  {assignment.questions.expectedConcepts.map((c, i) => (
                    <View key={i} style={g.conceptChip}>
                      <Text style={g.conceptChipTxt}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Section 2 — Answer Box */}
          <View style={g.sectionCard}>
            <View style={g.sectionHeader}>
              <Text style={g.sectionNum}>2.</Text>
              <Text style={g.sectionTitle}>Your Answer</Text>
              <Text style={g.answerHint}>Write your solution, explanation, or code below.</Text>
            </View>

            <TextInput
              style={[g.answerInput, evaluation && g.answerInputDone]}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Type your answer here...&#10;&#10;You can write code, explanations, or a mix of both."
              placeholderTextColor={SLL}
              multiline
              textAlignVertical="top"
              editable={!evaluation}
            />

            {!evaluation ? (
              <Pressable
                style={[g.submitBtn, (!answer.trim() || submitting) && g.submitBtnDis]}
                onPress={submitAnswer}
                disabled={!answer.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={WH}/>
                ) : (
                  <>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" stroke={WH} strokeWidth={1.8}/>
                      <Path d="M3 20a9 9 0 0 1 18 0" stroke={WH} strokeWidth={1.8} strokeLinecap="round"/>
                    </Svg>
                    <Text style={g.submitTxt}>Check with AI →</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Pressable
                style={[g.nextBtn, generating && g.submitBtnDis]}
                onPress={nextAssignment}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color={WH}/>
                ) : (
                  <>
                    <Text style={g.nextTxt}>
                      {progression?.isMaxLevel
                        ? "Practice Again (Advanced)"
                        : `Next ${progression?.nextDifficulty ?? ""} Assignment`}
                    </Text>
                    <IconArrow/>
                  </>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* ═══ RIGHT — AI Result ═══ */}
        <View style={g.rightCol}>

          {!evaluation ? (
            /* ── Placeholder before submit ── */
            <View style={g.placeholderCard}>
              <View style={g.placeholderIconBox}>
                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" stroke={P} strokeWidth={1.6} fill={PS}/>
                  <Path d="M3 20a9 9 0 0 1 18 0" stroke={P} strokeWidth={1.6} strokeLinecap="round"/>
                </Svg>
              </View>
              <Text style={g.placeholderTitle}>AI Result</Text>
              <Text style={g.placeholderTxt}>
                Write your answer and click "Check with AI" to get instant feedback, marks, and improvement tips.
              </Text>
              <View style={g.placeholderPoints}>
                {["Instant scoring (0–100)", "Detailed AI feedback", "Strengths & improvements", "Skill progress tracking"].map(p => (
                  <View key={p} style={g.placeholderPoint}>
                    <View style={g.placeholderDot}/>
                    <Text style={g.placeholderPointTxt}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            /* ── AI Result card ── */
            <View style={g.resultCard}>
              {/* Header */}
              <View style={g.resultHeader}>
                <Text style={g.resultTitle}>2. AI Result</Text>
                <View style={[g.resultStatusBadge, { backgroundColor: passed ? "#DCFCE7" : "#FEE2E2" }]}>
                  {passed ? <IconCheck size={13}/> : <IconX size={13}/>}
                  <Text style={[g.resultStatusTxt, { color: passed ? GR : RD }]}>
                    {passed ? "Passed" : "Needs Work"}
                  </Text>
                </View>
              </View>

              <Text style={g.resultFeedbackMain}>{evaluation.feedback}</Text>

              {/* Score gauge */}
              <View style={g.gaugeRow}>
                <ScoreGauge score={score}/>
                <View style={g.gaugeLabels}>
                  <Text style={g.gaugeLabelMain}>{score >= 80 ? "Excellent!" : score >= 60 ? "Good Job!" : "Keep Trying"}</Text>
                  <Text style={g.gaugeLabelSub}>
                    {score >= 80 ? "Great understanding shown." : score >= 60 ? "Solid effort, some gaps." : "Review the concepts and retry."}
                  </Text>
                </View>
              </View>

              {/* Criteria */}
              <View style={g.criteriaList}>
                {/* Strengths */}
                {evaluation.strengths?.map((s, i) => (
                  <View key={`s${i}`} style={g.criteriaRow}>
                    <View style={[g.criteriaIcon, { backgroundColor: "#DCFCE7" }]}>
                      <IconCheck size={12} color={GR}/>
                    </View>
                    <View style={g.criteriaInfo}>
                      <Text style={g.criteriaLabel}>Strength</Text>
                      <Text style={g.criteriaTxt}>{s}</Text>
                    </View>
                  </View>
                ))}

                {/* Improvements */}
                {evaluation.improvements?.map((imp, i) => (
                  <View key={`i${i}`} style={g.criteriaRow}>
                    <View style={[g.criteriaIcon, { backgroundColor: "#FEF9C3" }]}>
                      <IconStar size={12} color={OR}/>
                    </View>
                    <View style={g.criteriaInfo}>
                      <Text style={g.criteriaLabel}>Suggestion</Text>
                      <Text style={g.criteriaTxt}>{imp}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* AI Confidence score */}
              <View style={g.confidenceRow}>
                <Text style={g.confidenceLabel}>AI Confidence Score</Text>
                <Text style={[g.confidenceVal, { color: scoreColor(score) }]}>
                  {Math.min(99, score + Math.floor(Math.random() * 5 + 1))}%
                </Text>
              </View>
              <Text style={g.confidenceSub}>
                {score >= 60 ? "High confidence this is a correct solution." : "Low confidence — review your answer."}
              </Text>

              {/* Level progress */}
              {progression && (
                <View style={g.progCard}>
                  <View style={g.progHeaderRow}>
                    <Text style={g.progTitle}>Skill Progress</Text>
                    <View style={[g.levelBadge, { backgroundColor: PS }]}>
                      <Text style={[g.levelBadgeTxt, { color: P }]}>{progression.currentLevel}</Text>
                    </View>
                  </View>
                  <View style={g.progBar}>
                    <View style={[g.progFill, { width: `${Math.min(100, progression.progress)}%` as any }]}/>
                  </View>
                  <View style={g.progMetaRow}>
                    <Text style={g.progMeta}>{progression.progress}% avg score</Text>
                    <Text style={g.progMeta}>{progression.assignmentsCompleted} completed</Text>
                  </View>
                  {progression.leveledUp && (
                    <View style={g.levelUpBanner}>
                      <Text style={g.levelUpTxt}>🎉 Level up! You unlocked {progression.currentLevel}</Text>
                    </View>
                  )}
                  {!progression.leveledUp && !progression.isMaxLevel && passesLeft !== null && passesLeft > 0 && (
                    <Text style={g.progHint}>
                      Pass {passesLeft} more to unlock {progression.nextLevel}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </AppLayout>
  );
}

/* ── STYLES ──────────────────────────────── */
const g = StyleSheet.create({
  loadBox:   { paddingVertical: 80, alignItems: "center" },
  loadTxt:   { marginTop: 14, fontSize: 14, color: SL, fontFamily: F.m },
  notFound:  { fontSize: 15, color: SL, textAlign: "center", marginTop: 40, fontFamily: F.m },
  goBackBtn: { marginTop: 16, borderWidth: 1, borderColor: BD, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9 },
  goBackTxt: { color: P, fontSize: 13, fontFamily: F.s },

  /* TOP ROW */
  topRow:      { flexDirection: "row", alignItems: "flex-start", gap: 16, marginBottom: 22, flexWrap: "wrap" },
  backBtn:     { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: BD, backgroundColor: WH, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9, marginTop: 4, flexShrink: 0 },
  backTxt:     { fontFamily: F.s, fontSize: 13, color: P },
  pageTitleCol:{ flex: 1 },
  pageTitle:   { fontFamily: F.x, fontSize: 22, color: NV },
  pageSub:     { fontFamily: F.r, fontSize: 13, color: SL, marginTop: 3 },
  statsRow:    { flexDirection: "row", gap: 12 },
  statChip:    { backgroundColor: WH, borderRadius: 12, borderWidth: 1, borderColor: BD, paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" },
  statChipLabel:{ fontFamily: F.r, fontSize: 11, color: SLL },
  statChipVal: { fontFamily: F.x, fontSize: 18 },

  /* TWO COLUMN */
  twoCol:  { flexDirection: "row", gap: 20, alignItems: "flex-start" },
  leftCol: { flex: 1.3, gap: 18 },
  rightCol:{ flex: 1, minWidth: 280 },

  /* SECTION CARD */
  sectionCard:  { backgroundColor: WH, borderRadius: 16, borderWidth: 1, borderColor: BD, padding: 22 },
  sectionHeader:{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  sectionNum:   { fontFamily: F.x, fontSize: 16, color: P },
  sectionTitle: { fontFamily: F.b, fontSize: 15.5, color: NV },
  diffBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  diffTxt:      { fontFamily: F.s, fontSize: 11.5 },
  skillBadge:   { backgroundColor: BG, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  skillBadgeTxt:{ fontFamily: F.s, fontSize: 11.5, color: SL },
  answerHint:   { fontFamily: F.r, fontSize: 12, color: SLL, flex: 1 },

  /* PROBLEM */
  assignmentTitle:{ fontFamily: F.b, fontSize: 17, color: NV, marginBottom: 8 },
  assignmentDesc: { fontFamily: F.r, fontSize: 13.5, color: SL, lineHeight: 21, marginBottom: 16 },
  taskBox:        { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 16, borderLeftWidth: 3, borderLeftColor: P, marginBottom: 14 },
  taskBoxLabel:   { fontFamily: F.x, fontSize: 10, color: P, letterSpacing: 1.2, marginBottom: 8 },
  taskBoxText:    { fontFamily: F.m, fontSize: 14, color: NV, lineHeight: 22 },
  conceptsRow:    { marginTop: 4 },
  conceptsLabel:  { fontFamily: F.s, fontSize: 11, color: SLL, marginBottom: 7 },
  conceptChips:   { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  conceptChip:    { backgroundColor: PS, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  conceptChipTxt: { fontFamily: F.s, fontSize: 11.5, color: P },

  /* ANSWER */
  answerInput:    { minHeight: 200, maxHeight: 380, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: BD, borderRadius: 12, padding: 16, fontSize: 14, color: NV, lineHeight: 22, fontFamily: F.r, marginBottom: 14 },
  answerInputDone:{ backgroundColor: "#F1F5F9", color: SL },
  submitBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, backgroundColor: P, borderRadius: 12 },
  submitBtnDis:   { opacity: 0.45 },
  submitTxt:      { color: WH, fontFamily: F.b, fontSize: 15 },
  nextBtn:        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, backgroundColor: "#0B1D3C", borderRadius: 12 },
  nextTxt:        { color: WH, fontFamily: F.b, fontSize: 14 },

  /* PLACEHOLDER */
  placeholderCard:    { backgroundColor: WH, borderRadius: 16, borderWidth: 1, borderColor: BD, padding: 28, alignItems: "center" },
  placeholderIconBox: { width: 70, height: 70, borderRadius: 35, backgroundColor: PS, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  placeholderTitle:   { fontFamily: F.b, fontSize: 16, color: NV, marginBottom: 8 },
  placeholderTxt:     { fontFamily: F.r, fontSize: 13, color: SL, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  placeholderPoints:  { width: "100%", gap: 10 },
  placeholderPoint:   { flexDirection: "row", alignItems: "center", gap: 10 },
  placeholderDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: P, flexShrink: 0 },
  placeholderPointTxt:{ fontFamily: F.m, fontSize: 13, color: SL },

  /* RESULT */
  resultCard:       { backgroundColor: WH, borderRadius: 16, borderWidth: 1, borderColor: BD, padding: 20 },
  resultHeader:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  resultTitle:      { fontFamily: F.b, fontSize: 15.5, color: NV },
  resultStatusBadge:{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  resultStatusTxt:  { fontFamily: F.s, fontSize: 12 },
  resultFeedbackMain:{ fontFamily: F.r, fontSize: 13.5, color: SL, lineHeight: 20, marginBottom: 16 },

  /* GAUGE */
  gaugeRow:    { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 18 },
  gauge:       { position: "relative", width: 90, height: 90, alignItems: "center", justifyContent: "center" },
  gaugeInner:  { position: "absolute", alignItems: "center" },
  gaugeNum:    { fontFamily: F.x, fontSize: 18 },
  gaugeLabels: { flex: 1 },
  gaugeLabelMain:{ fontFamily: F.b, fontSize: 14, color: NV },
  gaugeLabelSub: { fontFamily: F.r, fontSize: 12, color: SL, marginTop: 4 },

  /* CRITERIA */
  criteriaList:  { gap: 10, marginBottom: 16 },
  criteriaRow:   { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  criteriaIcon:  { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  criteriaInfo:  { flex: 1 },
  criteriaLabel: { fontFamily: F.s, fontSize: 11, color: SLL, marginBottom: 2 },
  criteriaTxt:   { fontFamily: F.r, fontSize: 13, color: SL, lineHeight: 18 },

  /* CONFIDENCE */
  confidenceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", marginBottom: 8 },
  confidenceLabel:{ fontFamily: F.s, fontSize: 13, color: SL },
  confidenceVal: { fontFamily: F.x, fontSize: 18 },
  confidenceSub: { fontFamily: F.r, fontSize: 12, color: SLL, marginBottom: 16 },

  /* PROGRESS */
  progCard:      { backgroundColor: BG, borderRadius: 12, padding: 14 },
  progHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  progTitle:     { fontFamily: F.b, fontSize: 13, color: NV },
  levelBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  levelBadgeTxt: { fontFamily: F.s, fontSize: 11.5 },
  progBar:       { height: 7, backgroundColor: "#E2E8F0", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  progFill:      { height: "100%", backgroundColor: P, borderRadius: 4 },
  progMetaRow:   { flexDirection: "row", justifyContent: "space-between" },
  progMeta:      { fontFamily: F.r, fontSize: 11, color: SLL },
  levelUpBanner: { marginTop: 10, backgroundColor: "#DCFCE7", borderRadius: 8, padding: 10 },
  levelUpTxt:    { fontFamily: F.b, fontSize: 12.5, color: "#15803D" },
  progHint:      { marginTop: 8, fontFamily: F.r, fontSize: 12, color: SLL },
});
