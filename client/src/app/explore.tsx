import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Explore
      </Text>

      <Text style={styles.subtitle}>
        Discover students, skills, projects and opportunities.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
});