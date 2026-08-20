import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";

function IconBell({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z"
        stroke="#1456F0"
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="#EAF0FE"
      />
      <Path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="#1456F0"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Example notification types for when the feature is built out
const NOTIFICATION_TYPES = [
  { icon: "💬", label: "Comments on your posts" },
  { icon: "❤️", label: "Likes on your posts" },
  { icon: "🎯", label: "Assignment results" },
  { icon: "🚀", label: "New hackathons" },
  { icon: "👥", label: "New students joining" },
];

export default function NotificationsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Stay up to date with activity on SkillVerse.</Text>

      <View style={styles.emptyCard}>
        <IconBell size={60} />
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptyText}>
          You have no new notifications right now. We'll let you know when something happens.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>You'll be notified about</Text>
      <View style={styles.typesCard}>
        {NOTIFICATION_TYPES.map((t) => (
          <View key={t.label} style={styles.typeRow}>
            <Text style={styles.typeIcon}>{t.icon}</Text>
            <Text style={styles.typeLabel}>{t.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  content: { padding: 28, paddingBottom: 60, maxWidth: 800, width: "100%", alignSelf: "center" },
  back: { color: "#1456F0", fontSize: 15, fontWeight: "700", marginBottom: 24 },
  title: { fontSize: 32, fontWeight: "800", color: "#0B1D3C" },
  subtitle: { marginTop: 8, fontSize: 15, color: "#64748B", marginBottom: 36 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDEFF3",
    padding: 48,
    alignItems: "center",
    marginBottom: 28,
  },
  emptyTitle: { marginTop: 20, fontSize: 20, fontWeight: "800", color: "#0B1D3C" },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 360,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1D3C",
    marginBottom: 14,
  },
  typesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDEFF3",
    overflow: "hidden",
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  typeIcon: { fontSize: 22 },
  typeLabel: { fontSize: 14, fontWeight: "600", color: "#334155" },
});
