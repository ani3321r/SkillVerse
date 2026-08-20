import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";

function IconBookmark({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4h12v17l-6-4-6 4V4z"
        stroke="#1456F0"
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="#EAF0FE"
      />
    </Svg>
  );
}

export default function BookmarksScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Bookmarks</Text>
      <Text style={styles.subtitle}>Save posts, skills, and hackathons to revisit later.</Text>

      <View style={styles.emptyCard}>
        <IconBookmark size={60} />
        <Text style={styles.emptyTitle}>No bookmarks yet</Text>
        <Text style={styles.emptyText}>
          Tap the bookmark icon on any post or hackathon to save it here for quick access.
        </Text>
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={() => router.push("/home")}>
            <Text style={styles.actionBtnText}>Browse Feed</Text>
          </Pressable>
          <Pressable style={styles.actionBtnOutline} onPress={() => router.push("/hackathons")}>
            <Text style={styles.actionBtnOutlineText}>Browse Hackathons</Text>
          </Pressable>
        </View>
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
  actions: { flexDirection: "row", gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: "center" },
  actionBtn: {
    backgroundColor: "#1456F0",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: "#1456F0",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnOutlineText: { color: "#1456F0", fontWeight: "700", fontSize: 14 },
});
