import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Switch, Alert } from "react-native";
import { router } from "expo-router";

import AppLayout from "../components/app-layout";
import { useAuth } from "../context/AuthContext";

type RowProps = {
  label: string;
  description?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  rightLabel?: string;
  danger?: boolean;
};

function SettingRow({ label, description, value, onToggle, onPress, rightLabel, danger }: RowProps) {
  return (
    <Pressable style={s.row} onPress={onPress} disabled={!onPress && onToggle === undefined}>
      <View style={s.rowLeft}>
        <Text style={[s.rowLabel, danger && s.danger]}>{label}</Text>
        {description ? <Text style={s.rowDesc}>{description}</Text> : null}
      </View>
      {onToggle !== undefined && value !== undefined ? (
        <Switch value={value} onValueChange={onToggle} trackColor={{ false: "#E2E8F0", true: "#1456F0" }} thumbColor="#FFFFFF"/>
      ) : rightLabel ? (
        <Text style={s.rightLbl}>{rightLabel}</Text>
      ) : (
        <Text style={s.chevron}>›</Text>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const [emailNotifs,   setEmailNotifs]   = useState(true);
  const [pushNotifs,    setPushNotifs]    = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showSkills,    setShowSkills]    = useState(true);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: async () => { await logout(); router.replace("/login"); } },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Delete Account", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => Alert.alert("Contact Support", "Email support@skillverse.app to delete your account.") },
    ]);
  };

  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={s.title}>Settings</Text>
        <Text style={s.subtitle}>Manage your account preferences and privacy.</Text>
      </View>

      <Text style={s.section}>ACCOUNT</Text>
      <View style={s.card}>
        <SettingRow label="Edit Profile" description="Update your name, college, department and more" onPress={() => router.push("/profile")}/>
        <SettingRow label="Email Address" rightLabel={user?.email || "—"}/>
        <SettingRow label="Connected Account" rightLabel="Google"/>
      </View>

      <Text style={s.section}>NOTIFICATIONS</Text>
      <View style={s.card}>
        <SettingRow label="Email Notifications" description="Receive updates about activity via email" value={emailNotifs} onToggle={setEmailNotifs}/>
        <SettingRow label="Push Notifications" description="Receive in-app alerts for new activity" value={pushNotifs} onToggle={setPushNotifs}/>
      </View>

      <Text style={s.section}>PRIVACY</Text>
      <View style={s.card}>
        <SettingRow label="Public Profile" description="Let other students find and view your profile" value={publicProfile} onToggle={setPublicProfile}/>
        <SettingRow label="Show My Skills" description="Display your skills and progress on your profile" value={showSkills} onToggle={setShowSkills}/>
      </View>

      <Text style={s.section}>ABOUT</Text>
      <View style={s.card}>
        <SettingRow label="App Version" rightLabel="1.0.0"/>
        <SettingRow label="Terms of Service" onPress={() => Alert.alert("Terms", "Coming soon.")}/>
        <SettingRow label="Privacy Policy" onPress={() => Alert.alert("Privacy", "Coming soon.")}/>
      </View>

      <Text style={s.section}>ACCOUNT ACTIONS</Text>
      <View style={s.card}>
        <SettingRow label="Log Out" danger onPress={handleLogout}/>
        <SettingRow label="Delete Account" description="Permanently remove your account and all data" danger onPress={handleDelete}/>
      </View>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  header:   { marginBottom: 24 },
  title:    { fontSize: 28, fontWeight: "800", color: "#0B1D3C" },
  subtitle: { marginTop: 6, fontSize: 14, color: "#64748B" },
  section:  { fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  card:     { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E8ECF2", overflow: "hidden", maxWidth: 780, width: "100%", marginBottom: 4 },
  row:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 15, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  rowLeft:  { flex: 1, marginRight: 16 },
  rowLabel: { fontSize: 14.5, fontWeight: "600", color: "#111827" },
  rowDesc:  { marginTop: 3, fontSize: 12, color: "#64748B", lineHeight: 17 },
  danger:   { color: "#EF4444" },
  rightLbl: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  chevron:  { fontSize: 22, color: "#94A3B8" },
});
