import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

export default function ProfileScreen() {
  const { user, token, userId, logout, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [college, setCollege] = useState(user?.college || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [year, setYear] = useState(user?.year || "");
  const [location, setLocation] = useState(user?.location || "");
  const [githubUrl, setGithubUrl] = useState(user?.github_url || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolio_url || "");

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Not logged in.</Text>
        <Pressable onPress={() => router.replace("/login")} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  // ==========================================
  // SAVE PROFILE CHANGES
  // ==========================================

  const saveProfile = async () => {
    if (!college.trim() || !department.trim() || !year.trim() || !location.trim()) {
      Alert.alert("Incomplete", "College, department, year and location are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch("/api/users/profile", token, {
        method: "POST",
        body: JSON.stringify({
          googleId: user.google_id,
          name: user.name,
          email: user.email,
          college: college.trim(),
          department: department.trim(),
          year: year.trim(),
          location: location.trim(),
          interest: user.interest,
          githubUrl: githubUrl.trim() || null,
          linkedinUrl: linkedinUrl.trim() || null,
          portfolioUrl: portfolioUrl.trim() || null,
          avatarUrl: user.avatar_url,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update profile");

      await updateUser(data.user);
      setEditing(false);
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out", style: "destructive",
        onPress: async () => { await logout(); router.replace("/login"); },
      },
    ]);
  };

  const initials = user.name
    ?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "SK";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      {/* AVATAR + NAME */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.interestBadge}>
          <Text style={styles.interestText}>{user.interest}</Text>
        </View>
      </View>

      {/* DETAILS */}
      {!editing ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Info</Text>
            <Pressable onPress={() => setEditing(true)} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>

          <InfoRow label="College" value={user.college} />
          <InfoRow label="Department" value={user.department} />
          <InfoRow label="Year" value={user.year} />
          <InfoRow label="Location" value={user.location} />
          {user.github_url ? <InfoRow label="GitHub" value={user.github_url} /> : null}
          {user.linkedin_url ? <InfoRow label="LinkedIn" value={user.linkedin_url} /> : null}
          {user.portfolio_url ? <InfoRow label="Portfolio" value={user.portfolio_url} /> : null}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>

          <Field label="College" value={college} onChange={setCollege} />
          <Field label="Department" value={department} onChange={setDepartment} />
          <Field label="Year" value={year} onChange={setYear} placeholder="e.g. 3rd Year" />
          <Field label="Location" value={location} onChange={setLocation} placeholder="e.g. Kolkata" />
          <Field label="GitHub URL" value={githubUrl} onChange={setGithubUrl} autoCapitalize="none" />
          <Field label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} autoCapitalize="none" />
          <Field label="Portfolio URL" value={portfolioUrl} onChange={setPortfolioUrl} autoCapitalize="none" />

          <View style={styles.editActions}>
            <Pressable
              style={[styles.cancelButton]}
              onPress={() => setEditing(false)}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveProfile}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </Pressable>
          </View>
        </View>
      )}

      {/* QUICK NAV */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <Pressable style={styles.navRow} onPress={() => router.push(`/dashboard?userId=${userId}`)}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
          <Text style={styles.navArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.navRow} onPress={() => router.push("/skills")}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navLabel}>Browse Skills</Text>
          <Text style={styles.navArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.navRow} onPress={() => router.push("/home")}>
          <Text style={styles.navIcon}>🌐</Text>
          <Text style={styles.navLabel}>Community Feed</Text>
          <Text style={styles.navArrow}>→</Text>
        </Pressable>
      </View>

      {/* LOGOUT */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, autoCapitalize }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        placeholderTextColor="#94A3B8"
        autoCapitalize={autoCapitalize || "sentences"}
        style={styles.fieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: { padding: 25, paddingBottom: 60, maxWidth: 800, width: "100%", alignSelf: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F9FC" },
  errorText: { fontSize: 16, color: "#64748B" },
  loginButton: { marginTop: 16, backgroundColor: "#2563EB", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  loginButtonText: { color: "#FFFFFF", fontWeight: "700" },
  back: { color: "#2563EB", fontSize: 16, fontWeight: "700", marginBottom: 24 },
  profileCard: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", padding: 30, alignItems: "center", marginBottom: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 32, fontWeight: "900", color: "#FFFFFF" },
  name: { marginTop: 16, fontSize: 26, fontWeight: "900", color: "#111827" },
  email: { marginTop: 4, fontSize: 14, color: "#64748B" },
  interestBadge: { marginTop: 12, backgroundColor: "#EFF6FF", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  interestText: { color: "#1D4ED8", fontSize: 13, fontWeight: "700", textTransform: "capitalize" },
  section: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", padding: 22, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 4 },
  editButton: { backgroundColor: "#EFF6FF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  editButtonText: { color: "#2563EB", fontWeight: "700", fontSize: 13 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  infoLabel: { fontSize: 14, color: "#64748B", fontWeight: "600" },
  infoValue: { fontSize: 14, color: "#111827", fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  fieldWrapper: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 },
  fieldInput: { height: 48, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 14, fontSize: 14, color: "#111827", backgroundColor: "#F8FAFC" },
  editActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, height: 48, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", justifyContent: "center", alignItems: "center" },
  cancelButtonText: { fontSize: 14, fontWeight: "700", color: "#64748B" },
  saveButton: { flex: 2, height: 48, borderRadius: 10, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  navRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  navIcon: { fontSize: 22, marginRight: 14 },
  navLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#111827" },
  navArrow: { fontSize: 18, color: "#94A3B8" },
  logoutButton: { marginTop: 8, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: "#EF4444", justifyContent: "center", alignItems: "center" },
  logoutText: { color: "#EF4444", fontSize: 15, fontWeight: "700" },
});
