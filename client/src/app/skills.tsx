import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";

const API_URL = "http://localhost:5000";

type Skill = {
  id: number;
  name: string;
  category: string;
  description: string;
};

export default function SkillsScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // GET SKILLS
  // ==========================================

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await fetch(`${API_URL}/api/skills`);

      const data = await response.json();

      if (data.success) {
        setSkills(data.skills);
      } else {
        Alert.alert("Error", "Could not load skills");
      }
    } catch (error) {
      console.error("Load skills error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to SkillVerse server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SELECT / UNSELECT
  // ==========================================

  const toggleSkill = (skillId: number) => {
    setSelectedSkills((previous) => {
      if (previous.includes(skillId)) {
        return previous.filter((id) => id !== skillId);
      }

      return [...previous, skillId];
    });
  };

  // ==========================================
  // SAVE SKILLS
  // ==========================================

  const startLearning = async () => {
  if (selectedSkills.length === 0) {
    Alert.alert(
      "Select a skill",
      "Please select at least one skill."
    );

    return;
  }

  setSaving(true);

  try {
    const userId = 1;

    // ==========================================
    // STEP 1: SAVE SELECTED SKILLS
    // ==========================================

    for (const skillId of selectedSkills) {
      const response = await fetch(
        `${API_URL}/api/skills/user`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId,
            skillId,
          }),
        }
      );

      const data = await response.json();

      console.log("SAVE SKILL RESPONSE:", data);

      if (!data.success) {
        throw new Error(
          data.message || "Failed to save skill"
        );
      }
    }

    // ==========================================
    // STEP 2: GENERATE AI ASSIGNMENT
    // ==========================================

    const firstSkillId = selectedSkills[0];

    console.log(
      "GENERATING ASSIGNMENT FOR SKILL:",
      firstSkillId
    );

    const assignmentResponse = await fetch(
      `${API_URL}/api/ai/generate-assignment`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId,
          skillId: firstSkillId,
          difficulty: "Beginner",
        }),
      }
    );

    console.log(
      "ASSIGNMENT RESPONSE STATUS:",
      assignmentResponse.status
    );

    const assignmentData =
      await assignmentResponse.json();

    console.log(
      "ASSIGNMENT DATA:",
      assignmentData
    );

    if (
      !assignmentResponse.ok ||
      !assignmentData.success
    ) {
      throw new Error(
        assignmentData.message ||
        "Failed to generate assignment"
      );
    }

    // ==========================================
    // STEP 3: GET ASSIGNMENT ID
    // ==========================================

    const assignmentId =
      assignmentData.assignment.id;

    console.log(
      "GENERATED ASSIGNMENT ID:",
      assignmentId
    );

    // ==========================================
    // STEP 4: OPEN ASSIGNMENT SCREEN
    // ==========================================

    router.push(
      `/assignment?id=${assignmentId}`
    );

  } catch (error) {

    console.error(
      "Start learning error:",
      error
    );

    Alert.alert(
      "Error",
      error instanceof Error
        ? error.message
        : "Could not start learning."
    );

  } finally {

    setSaving(false);

  }
};

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading skills...
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

      <Text style={styles.title}>
        Choose Your Skills
      </Text>

      <Text style={styles.subtitle}>
        Select the skills you want to learn and improve.
      </Text>

      {skills.map((skill) => {
        const selected = selectedSkills.includes(skill.id);

        return (
          <Pressable
            key={skill.id}
            onPress={() => toggleSkill(skill.id)}
            style={[
              styles.skillCard,
              selected && styles.selectedCard,
            ]}
          >

            <View style={styles.cardTop}>

              <View style={styles.icon}>
                <Text style={styles.iconText}>
                  {skill.name.charAt(0)}
                </Text>
              </View>

              <View style={styles.info}>

                <Text style={styles.skillName}>
                  {skill.name}
                </Text>

                <Text style={styles.category}>
                  {skill.category}
                </Text>

              </View>

              <View
                style={[
                  styles.checkbox,
                  selected && styles.checkboxSelected,
                ]}
              >
                {selected && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}
              </View>

            </View>

            <Text style={styles.description}>
              {skill.description}
            </Text>

          </Pressable>
        );
      })}

      <Pressable
        onPress={startLearning}
        disabled={saving}
        style={[
          styles.button,
          saving && styles.buttonDisabled,
        ]}
      >

        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Start Learning →
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
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginTop: 30,
  },

  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
    marginBottom: 25,
  },

  skillCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  selectedCard: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  iconText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  skillName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },

  category: {
    marginTop: 3,
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  check: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  description: {
    marginTop: 15,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  button: {
    marginTop: 20,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

});