import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";

import AppLayout from "../components/app-layout";

export default function BookmarksScreen() {
  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={s.title}>Bookmarks</Text>
        <Text style={s.subtitle}>Save posts, skills, and hackathons to revisit later.</Text>
      </View>

      <View style={s.emptyCard}>
        <View style={s.iconBox}>
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path d="M6 4h12v17l-6-4-6 4V4z" stroke="#1456F0" strokeWidth={1.8} strokeLinejoin="round" fill="#EAF0FE"/>
          </Svg>
        </View>
        <Text style={s.emptyTitle}>No bookmarks yet</Text>
        <Text style={s.emptyText}>
          Tap the bookmark icon on any post or hackathon to save it here for quick access.
        </Text>
        <View style={s.actions}>
          <Pressable style={s.btn} onPress={() => router.push("/home")}>
            <Text style={s.btnTxt}>Browse Feed</Text>
          </Pressable>
          <Pressable style={s.btnOutline} onPress={() => router.push("/hackathons")}>
            <Text style={s.btnOutlineTxt}>Browse Hackathons</Text>
          </Pressable>
        </View>
      </View>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  header:    { marginBottom: 28 },
  title:     { fontSize: 28, fontWeight: "800", color: "#0B1D3C" },
  subtitle:  { marginTop: 6, fontSize: 14, color: "#64748B" },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E8ECF2", padding: 52, alignItems: "center", maxWidth: 680, width: "100%", alignSelf: "center" },
  iconBox:   { width: 72, height: 72, borderRadius: 36, backgroundColor: "#EAF0FE", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle:{ fontSize: 20, fontWeight: "800", color: "#0B1D3C" },
  emptyText: { marginTop: 10, fontSize: 14, lineHeight: 22, color: "#64748B", textAlign: "center", maxWidth: 360 },
  actions:   { flexDirection: "row", gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: "center" },
  btn:       { backgroundColor: "#1456F0", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 },
  btnTxt:    { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  btnOutline:{ borderWidth: 1.5, borderColor: "#1456F0", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 },
  btnOutlineTxt:{ color: "#1456F0", fontWeight: "700", fontSize: 14 },
});
