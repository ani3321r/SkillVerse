import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import AppLayout from "../components/app-layout";

const NOTIFICATION_TYPES = [
  { icon: "💬", label: "Comments on your posts" },
  { icon: "❤️", label: "Likes on your posts" },
  { icon: "🎯", label: "Assignment results" },
  { icon: "🚀", label: "New hackathons" },
  { icon: "👥", label: "New students joining" },
];

export default function NotificationsScreen() {
  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={s.title}>Notifications</Text>
        <Text style={s.subtitle}>Stay up to date with activity on SkillVerse.</Text>
      </View>

      <View style={s.emptyCard}>
        <View style={s.iconBox}>
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke="#1456F0" strokeWidth={1.8} strokeLinejoin="round" fill="#EAF0FE"/>
            <Path d="M10 19a2 2 0 0 0 4 0" stroke="#1456F0" strokeWidth={1.8} strokeLinecap="round"/>
          </Svg>
        </View>
        <Text style={s.emptyTitle}>All caught up!</Text>
        <Text style={s.emptyText}>
          You have no new notifications right now. We'll let you know when something happens.
        </Text>
      </View>

      <Text style={s.sectionTitle}>You'll be notified about</Text>
      <View style={s.typesCard}>
        {NOTIFICATION_TYPES.map((t, i) => (
          <View key={t.label} style={[s.typeRow, i === NOTIFICATION_TYPES.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={s.typeIcon}>{t.icon}</Text>
            <Text style={s.typeLabel}>{t.label}</Text>
          </View>
        ))}
      </View>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  header:     { marginBottom: 28 },
  title:      { fontSize: 28, fontWeight: "800", color: "#0B1D3C" },
  subtitle:   { marginTop: 6, fontSize: 14, color: "#64748B" },
  emptyCard:  { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E8ECF2", padding: 48, alignItems: "center", marginBottom: 28, maxWidth: 680, width: "100%", alignSelf: "center" },
  iconBox:    { width: 72, height: 72, borderRadius: 36, backgroundColor: "#EAF0FE", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#0B1D3C" },
  emptyText:  { marginTop: 10, fontSize: 14, lineHeight: 22, color: "#64748B", textAlign: "center", maxWidth: 360 },
  sectionTitle:{ fontSize: 16, fontWeight: "800", color: "#0B1D3C", marginBottom: 12, maxWidth: 680, width: "100%", alignSelf: "center" },
  typesCard:  { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E8ECF2", overflow: "hidden", maxWidth: 680, width: "100%", alignSelf: "center" },
  typeRow:    { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  typeIcon:   { fontSize: 22 },
  typeLabel:  { fontSize: 14, fontWeight: "600", color: "#334155" },
});
