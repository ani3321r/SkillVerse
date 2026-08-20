import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

const API_URL = "http://localhost:5000";

type Assignment = {
  id: number;
  skill_id: number;
  title: string;
  description: string;
  difficulty: string;
  questions: {
    question: string;
    expectedConcepts: string[];
  };
  skill_name: string;
  skill_category: string;
};

export default function AssignmentScreen() {

  const { id } = useLocalSearchParams();

  const [assignment, setAssignment] =
    useState<Assignment | null>(null);

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<any>(null);
const [progress, setProgress] = useState<any>(null);

  const [submitting, setSubmitting] =
    useState(false);


  // ==========================================
  // LOAD ASSIGNMENT
  // ==========================================

  useEffect(() => {
    loadAssignment();
  }, []);


  const loadAssignment = async () => {

    try {

      const response = await fetch(
        `${API_URL}/api/ai/assignment/${id}`
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setAssignment(data.assignment);

    } catch (error) {

      console.error(error);

      Alert.alert(
        "Error",
        "Could not load assignment."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // SUBMIT
  // ==========================================

  const submitAnswer = async () => {
  console.log("SUBMIT FUNCTION STARTED");

  if (!answer.trim()) {
    console.log("ANSWER IS EMPTY");

    Alert.alert(
      "Answer required",
      "Please write your answer first."
    );

    return;
  }

  console.log("ANSWER:", answer);

  setSubmitting(true);

  try {
    console.log("CALLING API...");

    const url = `${API_URL}/api/ai/evaluate-answer`;

    console.log("API URL:", url);

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: 1,
        assignmentId: Number(id),
        answer: answer.trim(),
      }),
    });

    console.log("API RESPONSE STATUS:", response.status);

    const data = await response.json();

    console.log("API RESPONSE DATA:", data);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Evaluation failed"
      );
    }
    setEvaluation(data.evaluation);
    setProgress(data.progress);


  } catch (error) {
    console.error("SUBMIT ERROR:", error);

    Alert.alert(
      "Evaluation Error",
      error instanceof Error
        ? error.message
        : "Could not evaluate answer."
    );

  } finally {
    console.log("SUBMIT FINISHED");
    setSubmitting(false);
  }
};
const nextAssignment = async () => {
  console.log("NEXT ASSIGNMENT PRESSED");

  if (!assignment) {
    return;
  }

  try {
    setSubmitting(true);

    console.log("SKILL ID:", assignment.skill_id);

    // Use the level earned from the previous submission
    const difficulty =
      progress?.level || assignment.difficulty || "Beginner";

    console.log("NEXT DIFFICULTY:", difficulty);

    const response = await fetch(
      `${API_URL}/api/ai/generate-assignment`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: 1,
          skillId: assignment.skill_id,
          difficulty: difficulty,
        }),
      }
    );

    console.log(
      "NEXT ASSIGNMENT STATUS:",
      response.status
    );

    const data = await response.json();

    console.log(
      "NEXT ASSIGNMENT DATA:",
      data
    );

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Failed to generate next assignment"
      );
    }

    const newAssignmentId =
      data.assignment.id;

    console.log(
      "NEW ASSIGNMENT ID:",
      newAssignmentId
    );

    // Clear previous result
    setEvaluation(null);
    setProgress(null);
    setAnswer("");

    // Open new assignment
    router.replace(
      `/assignment?id=${newAssignmentId}`
    );

  } catch (error) {

    console.error(
      "NEXT ASSIGNMENT ERROR:",
      error
    );

    Alert.alert(
      "Error",
      "Could not generate the next assignment."
    );

  } finally {

    setSubmitting(false);

  }
};

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <View style={styles.center}>

        <ActivityIndicator size="large" />

        <Text style={styles.loading}>
          Loading assignment...
        </Text>

      </View>
    );

  }


  if (!assignment) {

    return (
      <View style={styles.center}>

        <Text>
          Assignment not found.
        </Text>

      </View>
    );

  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <Pressable
        onPress={() => router.back()}
      >

        <Text style={styles.back}>
          ← Back
        </Text>

      </Pressable>


      <Text style={styles.category}>
        {assignment.skill_name}
      </Text>


      <View style={styles.badge}>

        <Text style={styles.badgeText}>
          {assignment.difficulty}
        </Text>

      </View>


      <Text style={styles.title}>
        {assignment.title}
      </Text>


      <Text style={styles.description}>
        {assignment.description}
      </Text>


      <View style={styles.questionCard}>

        <Text style={styles.questionLabel}>
          YOUR TASK
        </Text>

        <Text style={styles.question}>
          {assignment.questions.question}
        </Text>

      </View>


      <Text style={styles.answerLabel}>
        Your Answer
      </Text>


      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Write your solution here..."
        placeholderTextColor="#94A3B8"
        multiline
        textAlignVertical="top"
      />
{/* ==========================================
          AI EVALUATION RESULT
      ========================================== */}

      {evaluation && (
        <View style={styles.resultCard}>

          <Text style={styles.resultTitle}>
            Assignment Result
          </Text>


          <Text style={styles.score}>
            {evaluation.score}/100
          </Text>


          <Text
            style={[
              styles.status,
              evaluation.passed
                ? styles.passed
                : styles.failed,
            ]}
          >
            {evaluation.passed
              ? "✓ Passed"
              : "✕ Needs Improvement"}
          </Text>


          {/* PROGRESS */}

          {progress && (
            <View style={styles.progressSection}>

              <Text style={styles.progressLabel}>
                Your Skill Progress
              </Text>


              <View style={styles.progressBar}>

                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress.progress}%`,
                    },
                  ]}
                />

              </View>


              <Text style={styles.progressText}>
                {progress.progress}% · {progress.level}
              </Text>

            </View>
          )}


          {/* FEEDBACK */}

          <Text style={styles.sectionTitle}>
            AI Feedback
          </Text>

          <Text style={styles.feedback}>
            {evaluation.feedback}
          </Text>


          {/* STRENGTHS */}

          <Text style={styles.sectionTitle}>
            Strengths
          </Text>

          {evaluation.strengths?.map(
            (item: string, index: number) => (
              <Text
                key={index}
                style={styles.listItem}
              >
                ✓ {item}
              </Text>
            )
          )}


          {/* IMPROVEMENTS */}

          <Text style={styles.sectionTitle}>
            Improvements
          </Text>

          {evaluation.improvements?.map(
            (item: string, index: number) => (
              <Text
                key={index}
                style={styles.listItem}
              >
                • {item}
              </Text>
            )
          )}

        </View>
      )}

      <Pressable
  style={[
    styles.button,
    submitting && styles.disabled,
  ]}
  onPress={() => {
    if (evaluation) {
      nextAssignment();
    } else {
      console.log("SUBMIT BUTTON PRESSED");
      submitAnswer();
    }
  }}
  disabled={submitting}
>
  {submitting ? (

    <ActivityIndicator color="#FFFFFF" />

  ) : (

    <Text style={styles.buttonText}>
      {evaluation
        ? "Next Assignment →"
        : "Submit Answer →"}
    </Text>

  )}
</Pressable>

    </ScrollView>
  );
}


// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  content: {
    padding: 24,
    paddingBottom: 60,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },

  loading: {
    marginTop: 12,
    color: "#64748B",
  },

  back: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 25,
  },

  category: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "700",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },

  badgeText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 13,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginTop: 18,
  },

  description: {
    fontSize: 16,
    lineHeight: 25,
    color: "#64748B",
    marginTop: 12,
  },

  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  questionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 1,
  },

  question: {
    fontSize: 17,
    lineHeight: 27,
    color: "#1E293B",
    marginTop: 12,
  },

  answerLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 28,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    minHeight: 220,
    padding: 16,
    fontSize: 16,
    color: "#111827",
  },

  button: {
    height: 56,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  disabled: {
    opacity: 0.6,
  },

    buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },


  // ==========================================
  // AI RESULT CARD
  // ==========================================

  resultCard: {
    marginTop: 28,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  score: {
    marginTop: 14,
    fontSize: 48,
    fontWeight: "900",
    color: "#2563EB",
  },

  status: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: "700",
  },

  passed: {
    color: "#16A34A",
  },

  failed: {
    color: "#DC2626",
  },


  // ==========================================
  // PROGRESS
  // ==========================================

  progressSection: {
    marginTop: 24,
  },

  progressLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },

  progressBar: {
    height: 12,
    marginTop: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 10,
  },

  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
  },


  // ==========================================
  // FEEDBACK
  // ==========================================

  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  feedback: {
    fontSize: 15,
    lineHeight: 23,
    color: "#475569",
  },

  listItem: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },

});