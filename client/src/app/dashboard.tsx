import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";

const API_URL = "http://localhost:5000";

export default function DashboardScreen() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/1`
      );

      const data = await response.json();

      console.log("DASHBOARD DATA:", data);

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load dashboard"
        );
      }

      setDashboard(data);

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (!dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Could not load dashboard.
        </Text>
      </View>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================
const startLearning = async (skillId: number) => {
  try {
    console.log("START LEARNING");
    console.log("SKILL ID:", skillId);

    const response = await fetch(
      `${API_URL}/api/ai/generate-assignment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: 1,
          skillId: skillId,
          difficulty: "Beginner",
        }),
      }
    );

    console.log("GENERATE STATUS:", response.status);

    const data = await response.json();

    console.log("GENERATED ASSIGNMENT:", data);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to generate assignment"
      );
    }

    const assignmentId = data.assignment.id;

    console.log("ASSIGNMENT ID:", assignmentId);

    router.push(`/assignment?id=${assignmentId}`);

  } catch (error) {
    console.error("START LEARNING ERROR:", error);
  }
};
  return (
    <View style={styles.container}>

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <View style={styles.navbar}>

        <Text style={styles.logo}>
          SkillVerse
        </Text>

        <Pressable
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.avatar}>
            SC
          </Text>
        </Pressable>

      </View>


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <View style={styles.content}>

        <Text style={styles.greeting}>
          Welcome, {dashboard.user.name} 👋
        </Text>

        <Text style={styles.subtitle}>
          Your personalized student skill dashboard.
        </Text>


        {/* ==========================================
            STAT CARDS
        ========================================== */}

        <View style={styles.cards}>

          <View style={styles.card}>

            <Text style={styles.cardNumber}>
              {dashboard.stats.verifiedSkills}
            </Text>

            <Text style={styles.cardLabel}>
              Verified Skills
            </Text>

          </View>


          <View style={styles.card}>

            <Text style={styles.cardNumber}>
              {dashboard.stats.overallProgress}%
            </Text>

            <Text style={styles.cardLabel}>
              Overall Progress
            </Text>

          </View>


          <View style={styles.card}>

            <Text style={styles.cardNumber}>
              {dashboard.stats.assignments}
            </Text>

            <Text style={styles.cardLabel}>
              Assignments
            </Text>

          </View>

        </View>


        {/* ==========================================
            CHOOSE SKILL
        ========================================== */}

        <Text style={styles.sectionTitle}>
          Start building your skills
        </Text>

        <Pressable
          style={styles.learnCard}
          onPress={() => router.push("/skills")}
        >

          <Text style={styles.learnTitle}>
            📚 Choose a skill to learn
          </Text>

          <Text style={styles.learnText}>
            Start learning and receive AI-powered assignments.
          </Text>

        </Pressable>


        {/* ==========================================
            MY SKILLS
        ========================================== */}

        <Text style={styles.skillsTitle}>
          My Skills
        </Text>


        {dashboard.skills.length === 0 ? (

          <View style={styles.emptySkillsCard}>

            <Text style={styles.emptySkillsTitle}>
              No skills added yet
            </Text>

            <Text style={styles.emptySkillsText}>
              Choose a skill to start your learning journey.
            </Text>

          </View>

        ) : (

          <View style={styles.skillsContainer}>

            {dashboard.skills.map((skill: any) => (

              <View
                key={skill.id}
                style={styles.skillCard}
              >

                {/* Skill Header */}

                <View style={styles.skillHeader}>

                  <View>

                    <Text style={styles.skillName}>
                      {skill.name}
                    </Text>

                    <Text style={styles.skillCategory}>
                      {skill.category}
                    </Text>

                  </View>


                  <Text style={styles.skillProgressText}>
                    {skill.progress}%
                  </Text>

                </View>


                {/* Progress Bar */}

                <View style={styles.progressBar}>

                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${skill.progress}%`,
                      },
                    ]}
                  />

                </View>


                {/* Skill Footer */}

                <View style={styles.skillFooter}>

                  <Text style={styles.levelText}>
                    Level: {skill.level}
                  </Text>

                  <Text style={styles.assignmentText}>
                    {skill.assignments_completed} assignments
                  </Text>

                </View>
                <Pressable
  style={styles.continueButton}
  onPress={() => startLearning(skill.skill_id)}
>
  <Text style={styles.continueButtonText}>
    Continue Learning →
  </Text>
</Pressable>


                {/* ==========================================
                    CONTINUE LEARNING BUTTON
                ========================================== */}

                <Pressable
                  style={styles.continueButton}
                  onPress={async () => {

                    try {

                      console.log(
                        "CONTINUE LEARNING:",
                        skill.skill_id
                      );

                      const response = await fetch(
                        `${API_URL}/api/ai/generate-assignment`,
                        {
                          method: "POST",

                          headers: {
                            "Content-Type": "application/json",
                          },

                          body: JSON.stringify({
                            userId: 1,
                            skillId: skill.skill_id,
                            difficulty:
                              skill.level || "Beginner",
                          }),
                        }
                      );

                      console.log(
                        "ASSIGNMENT STATUS:",
                        response.status
                      );

                      const data =
                        await response.json();

                      console.log(
                        "ASSIGNMENT DATA:",
                        data
                      );

                      if (
                        !response.ok ||
                        !data.success
                      ) {
                        throw new Error(
                          data.message ||
                          "Could not generate assignment"
                        );
                      }

                      const assignmentId =
                        data.assignment.id;

                      console.log(
                        "OPENING ASSIGNMENT:",
                        assignmentId
                      );

                      router.push(
                        `/assignment?id=${assignmentId}`
                      );

                    } catch (error) {

                      console.error(
                        "Continue learning error:",
                        error
                      );

                    }

                  }}
                >

                  <Text style={styles.continueButtonText}>
                    Continue Learning →
                  </Text>

                </Pressable>

              </View>

            ))}

          </View>

        )}


        {/* ==========================================
            BACK HOME
        ========================================== */}

        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/")}
        >

          <Text style={styles.backText}>
            Back to Home
          </Text>

        </Pressable>

      </View>

    </View>
  );
}


// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  navbar: {
    height: 72,
    paddingHorizontal: 30,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 11,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },

  content: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    padding: 35,
  },

  greeting: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 15,
  },

  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 35,
  },

  card: {
    width: 200,
    minHeight: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
  },

  cardNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2563EB",
  },

  cardLabel: {
    marginTop: 8,
    fontSize: 13,
    color: "#64748B",
  },

  sectionTitle: {
    marginTop: 45,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  learnCard: {
    marginTop: 18,
    padding: 25,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  learnTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E40AF",
  },

  learnText: {
    marginTop: 8,
    color: "#475569",
    fontSize: 14,
  },

  skillsTitle: {
    marginTop: 40,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  skillsContainer: {
    marginTop: 18,
    gap: 16,
  },

  skillCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
  },

  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  skillName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  skillCategory: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  skillProgressText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
  },

  progressBar: {
    height: 9,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 18,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 10,
  },

  skillFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  levelText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  assignmentText: {
    fontSize: 13,
    color: "#64748B",
  },

  continueButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  emptySkillsCard: {
    marginTop: 18,
    padding: 25,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptySkillsTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  emptySkillsText: {
    marginTop: 7,
    fontSize: 14,
    color: "#64748B",
  },

  backButton: {
    marginTop: 30,
  },

  backText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  

});