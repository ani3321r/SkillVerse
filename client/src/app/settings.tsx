import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";

type SettingRowProps = {
  label: string;
  description?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  rightLabel?: string;
  danger?: boolean;
};

function SettingRow({ label, description, value, onToggle, onPress, rightLabel, danger }: SettingRowProps) {
  return (
    <Pressable
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && onToggle === undefined}
    >
      <View style={styles.settingLeft}>
        <Text style={[styles.settingLabel, danger && styles.dangerText]}>{label}</Text>
        {description ? <Text style={styles.settingDescription}>{description}</Text> : null}
      </View>
      {onToggle !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#E2E8F0", true: "#1456F0" }}
          thumbColor="#FFFFFF"
        />
      ) : rightLabel ? (
        <Text style={styles.rightLabel}>{rightLabel}</Text>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showSkills, setShowSkills] = useState(true);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => Alert.alert("Contact Support", "Please email support@skillverse.app to delete your account.") },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Manage your account preferences and privacy.</Text>

      {/* ACCOUNT */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.section}>
        <SettingRow
          label="Edit Profile"
          description="Update your name, college, department and more"
          onPress={() => router.push("/profile")}
        />
        <SettingRow
          label="Email Address"
          rightLabel={user?.email || "—"}
        />
        <SettingRow
          label="Connected Account"
          rightLabel="Google"
        />
      </View>

      {/* NOTIFICATIONS */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.section}>
        <SettingRow
          label="Email Notifications"
          description="Receive updates about activity via email"
          value={emailNotifs}
          onToggle={setEmailNotifs}
        />
        <SettingRow
          label="Push Notifications"
          description="Receive in-app alerts for new activity"
          value={pushNotifs}
          onToggle={setPushNotifs}
        />
      </View>

      {/* PRIVACY */}
      <Text style={styles.sectionTitle}>Privacy</Text>
      <View style={styles.section}>
        <SettingRow
          label="Public Profile"
          description="Let other students find and view your profile"
          value={publicProfile}
          onToggle={setPublicProfile}
        />
        <SettingRow
          label="Show My Skills"
          description="Display your skills and progress on your profile"
          value={showSkills}
          onToggle={setShowSkills}
        />
      </View>

      {/* ABOUT */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.section}>
        <SettingRow label="App Version" rightLabel="1.0.0" />
        <SettingRow label="Terms of Service" onPress={() => Alert.alert("Terms", "Terms of Service coming soon.")} />
        <SettingRow label="Privacy Policy" onPress={() => Alert.alert("Privacy", "Privacy Policy coming soon.")} />
      </View>

      {/* DANGER ZONE */}
      <Text style={styles.sectionTitle}>Account Actions</Text>
      <View style={styles.section}>
        <SettingRow
          label="Log Out"
          danger
          onPress={handleLogout}
        />
        <SettingRow
          label="Delete Account"
          description="Permanently remove your account and all data"
          danger
          onPress={handleDeleteAccount}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  content: { padding: 28, paddingBottom: 60, maxWidth: 800, width: "100%", alignSelf: "center" },
  back: { color: "#1456F0", fontSize: 15, fontWeight: "700", marginBottom: 24 },
  title: { fontSize: 32, fontWeight: "800", color: "#0B1D3C" },
  subtitle: { marginTop: 8, fontSize: 15, color: "#64748B", marginBottom: 28 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.8, marginTop: 28, marginBottom: 10 },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDEFF3",
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingLeft: { flex: 1, marginRight: 16 },
  settingLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  settingDescription: { marginTop: 3, fontSize: 12.5, color: "#64748B", lineHeight: 18 },
  dangerText: { color: "#EF4444" },
  rightLabel: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  chevron: { fontSize: 22, color: "#94A3B8", fontWeight: "300" },
});
