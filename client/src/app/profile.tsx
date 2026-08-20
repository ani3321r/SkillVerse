import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable,
  TextInput, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";

import AppLayout from "../components/app-layout";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, autoCapitalize }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        placeholderTextColor="#94A3B8"
        autoCapitalize={autoCapitalize || "sentences"}
        style={s.fieldInput}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const { user, token, userId, logout, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const [college,      setCollege]      = useState(user?.college || "");
  const [department,   setDepartment]   = useState(user?.department || "");
  const [year,         setYear]         = useState(user?.year || "");
  const [location,     setLocation]     = useState(user?.location || "");
  const [githubUrl,    setGithubUrl]    = useState(user?.github_url || "");
  const [linkedinUrl,  setLinkedinUrl]  = useState(user?.linkedin_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolio_url || "");

  if (!user) {
    return (
      <AppLayout>
        <View style={s.center}>
          <Text style={s.notLogged}>Not logged in.</Text>
          <Pressable onPress={() => router.replace("/login")} style={s.loginBtn}>
            <Text style={s.loginBtnTxt}>Go to Login</Text>
          </Pressable>
        </View>
      </AppLayout>
    );
  }

  const saveProfile = async () => {
    if (!college.trim() || !department.trim() || !year.trim() || !location.trim()) {
      Alert.alert("Incomplete", "College, department, year and location are required.");
      return;
    }
    setSaving(true);
    try {
      const res  = await apiFetch("/api/users/profile", token, {
        method: "POST",
        body: JSON.stringify({
          googleId: user.google_id, name: user.name, email: user.email,
          college: college.trim(), department: department.trim(),
          year: year.trim(), location: location.trim(), interest: user.interest,
          githubUrl: githubUrl.trim() || null, linkedinUrl: linkedinUrl.trim() || null,
          portfolioUrl: portfolioUrl.trim() || null, avatarUrl: user.avatar_url,
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
    Alert.alert("Log out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: async () => { await logout(); router.replace("/login"); } },
    ]);
  };

  const initials = user.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "SK";

  return (
    <AppLayout>
      {/* Avatar + Name */}
      <View style={s.profileCard}>
        <View style={s.avatar}><Text style={s.avatarTxt}>{initials}</Text></View>
        <Text style={s.name}>{user.name}</Text>
        <Text style={s.email}>{user.email}</Text>
        <View style={s.intBadge}><Text style={s.intTxt}>{user.interest}</Text></View>
      </View>

      {/* Info / Edit */}
      {!editing ? (
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Profile Info</Text>
            <Pressable onPress={() => setEditing(true)} style={s.editBtn}>
              <Text style={s.editBtnTxt}>Edit</Text>
            </Pressable>
          </View>
          <InfoRow label="College"    value={user.college}    />
          <InfoRow label="Department" value={user.department} />
          <InfoRow label="Year"       value={user.year}       />
          <InfoRow label="Location"   value={user.location}   />
          {user.github_url    && <InfoRow label="GitHub"    value={user.github_url}    />}
          {user.linkedin_url  && <InfoRow label="LinkedIn"  value={user.linkedin_url}  />}
          {user.portfolio_url && <InfoRow label="Portfolio" value={user.portfolio_url} />}
        </View>
      ) : (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Edit Profile</Text>
          <Field label="College"       value={college}      onChange={setCollege}      />
          <Field label="Department"    value={department}   onChange={setDepartment}   />
          <Field label="Year"          value={year}         onChange={setYear}         placeholder="e.g. 3rd Year"/>
          <Field label="Location"      value={location}     onChange={setLocation}     placeholder="e.g. Kolkata"/>
          <Field label="GitHub URL"    value={githubUrl}    onChange={setGithubUrl}    autoCapitalize="none"/>
          <Field label="LinkedIn URL"  value={linkedinUrl}  onChange={setLinkedinUrl}  autoCapitalize="none"/>
          <Field label="Portfolio URL" value={portfolioUrl} onChange={setPortfolioUrl} autoCapitalize="none"/>
          <View style={s.editActions}>
            <Pressable style={s.cancelBtn} onPress={() => setEditing(false)} disabled={saving}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </Pressable>
            <Pressable style={[s.saveBtn, saving && s.saveBtnDis]} onPress={saveProfile} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" size="small"/> : <Text style={s.saveTxt}>Save Changes</Text>}
            </Pressable>
          </View>
        </View>
      )}

      {/* Logout */}
      <Pressable style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutTxt}>Log Out</Text>
      </Pressable>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  center:      { alignItems: "center", paddingTop: 60 },
  notLogged:   { fontSize: 15, color: "#64748B", marginBottom: 16 },
  loginBtn:    { backgroundColor: "#1456F0", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 },
  loginBtnTxt: { color: "#FFFFFF", fontWeight: "700" },
  profileCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E8ECF2", padding: 28, alignItems: "center", marginBottom: 18, maxWidth: 680, width: "100%", alignSelf: "center" },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1456F0", justifyContent: "center", alignItems: "center" },
  avatarTxt:   { fontSize: 30, fontWeight: "900", color: "#FFFFFF" },
  name:        { marginTop: 14, fontSize: 22, fontWeight: "900", color: "#0B1D3C" },
  email:       { marginTop: 4, fontSize: 13, color: "#64748B" },
  intBadge:    { marginTop: 10, backgroundColor: "#EAF0FE", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  intTxt:      { color: "#1456F0", fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  section:     { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E8ECF2", padding: 20, marginBottom: 14, maxWidth: 680, width: "100%", alignSelf: "center" },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle:{ fontSize: 16, fontWeight: "800", color: "#0B1D3C" },
  editBtn:     { backgroundColor: "#EAF0FE", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  editBtnTxt:  { color: "#1456F0", fontWeight: "700", fontSize: 13 },
  infoRow:     { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  infoLabel:   { fontSize: 13, color: "#64748B", fontWeight: "600" },
  infoValue:   { fontSize: 13, color: "#111827", fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  fieldWrap:   { marginBottom: 12 },
  fieldLabel:  { fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 5 },
  fieldInput:  { height: 46, borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 9, paddingHorizontal: 12, fontSize: 13, color: "#111827", backgroundColor: "#F8FAFC" },
  editActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  cancelBtn:   { flex: 1, height: 46, borderRadius: 9, borderWidth: 1, borderColor: "#E8ECF2", justifyContent: "center", alignItems: "center" },
  cancelTxt:   { fontSize: 13, fontWeight: "700", color: "#64748B" },
  saveBtn:     { flex: 2, height: 46, borderRadius: 9, backgroundColor: "#1456F0", justifyContent: "center", alignItems: "center" },
  saveBtnDis:  { opacity: 0.6 },
  saveTxt:     { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  logoutBtn:   { height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: "#EF4444", justifyContent: "center", alignItems: "center", maxWidth: 680, width: "100%", alignSelf: "center" },
  logoutTxt:   { color: "#EF4444", fontSize: 14, fontWeight: "700" },
});
