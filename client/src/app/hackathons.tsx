import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, ActivityIndicator, Linking, Alert,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

type Hackathon = {
  id: number; title?: string; description?: string; organizer?: string;
  location?: string; start_date?: string; end_date?: string;
  registration_deadline?: string; event_url?: string; registration_url?: string;
};

export default function HackathonsScreen() {
  const { token } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filtered, setFiltered] = useState<Hackathon[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHackathons = async () => {
    try {
      setLoading(true);
      // GET hackathons is public — no token required
      const res = await apiFetch("/api/hackathons", token);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      const list = Array.isArray(data.hackathons) ? data.hackathons : [];
      setHackathons(list);
      setFiltered(list);
    } catch (error) {
      Alert.alert("Error", "Could not load hackathons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHackathons(); }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) { setFiltered(hackathons); return; }
    setFiltered(hackathons.filter(h =>
      (h.title || "").toLowerCase().includes(q) ||
      (h.description || "").toLowerCase().includes(q) ||
      (h.organizer || "").toLowerCase().includes(q) ||
      (h.location || "").toLowerCase().includes(q)
    ));
  }, [search, hackathons]);

  const crawlHackathons = async () => {
    if (!token) { Alert.alert("Not logged in", "Please log in to refresh hackathons."); return; }
    try {
      setRefreshing(true);
      const res = await apiFetch("/api/hackathons/crawl", token, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      await loadHackathons();
      Alert.alert("Hackathons Updated", `${data.saved || 0} hackathons are now available.`);
    } catch (error) {
      Alert.alert("Error", "Could not update hackathons.");
    } finally {
      setRefreshing(false);
    }
  };

  const openHackathon = async (h: Hackathon) => {
    const url = h.event_url || h.registration_url;
    if (!url) { Alert.alert("Link unavailable", "Original hackathon website link is not available."); return; }
    try { await Linking.openURL(url); }
    catch { Alert.alert("Error", "Could not open hackathon website."); }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";
    try { return new Date(date).toLocaleDateString(); }
    catch { return date; }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading hackathons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Hackathons</Text>
            <Text style={styles.subtitle}>Discover hackathons and opportunities to build, compete and learn.</Text>
          </View>
          <Pressable style={[styles.refreshButton, refreshing && styles.disabled]} onPress={crawlHackathons} disabled={refreshing}>
            {refreshing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.refreshText}>↻ Refresh</Text>}
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search hackathons..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.countRow}>
          <Text style={styles.countText}>{filtered.length} Hackathons</Text>
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Text style={styles.clearText}>Clear search</Text>
            </Pressable>
          )}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyTitle}>No hackathons found</Text>
            <Text style={styles.emptyText}>Try another search or refresh the hackathon list.</Text>
          </View>
        ) : (
          filtered.map((h, index) => (
            <View key={h.id ?? `${h.title}-${index}`} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>🚀</Text>
                </View>
                <View style={styles.cardHeading}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{h.title || "Untitled Hackathon"}</Text>
                  <Text style={styles.organizer} numberOfLines={1}>{h.organizer || "Hackathon Organizer"}</Text>
                </View>
              </View>

              {h.description && <Text style={styles.description} numberOfLines={3}>{h.description}</Text>}

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>📍 Location</Text>
                  <Text style={styles.infoValue}>{h.location || "Online"}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>📅 Deadline</Text>
                  <Text style={styles.infoValue}>{formatDate(h.registration_deadline)}</Text>
                </View>
              </View>

              {(h.start_date || h.end_date) && (
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>📅 {formatDate(h.start_date)}{"  →  "}{formatDate(h.end_date)}</Text>
                </View>
              )}

              <Pressable style={styles.viewButton} onPress={() => openHackathon(h)}>
                <Text style={styles.viewButtonText}>View Hackathon →</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: { width: "100%", maxWidth: 1100, alignSelf: "center", padding: 24, paddingBottom: 70 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F9FC" },
  loadingText: { marginTop: 12, color: "#64748B", fontSize: 15 },
  back: { color: "#2563EB", fontSize: 16, fontWeight: "700", marginBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 20 },
  headerText: { flex: 1 },
  title: { fontSize: 34, fontWeight: "900", color: "#0F172A" },
  subtitle: { marginTop: 8, fontSize: 16, lineHeight: 24, color: "#64748B", maxWidth: 650 },
  refreshButton: { backgroundColor: "#2563EB", paddingHorizontal: 18, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  refreshText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.6 },
  searchBox: { marginTop: 28, height: 54, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, flexDirection: "row", alignItems: "center", paddingHorizontal: 16 },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: "#111827" },
  countRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 14 },
  countText: { fontSize: 16, fontWeight: "800", color: "#334155" },
  clearText: { color: "#2563EB", fontWeight: "600" },
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 18, padding: 22, marginBottom: 16 },
  cardTop: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginRight: 14 },
  iconText: { fontSize: 25 },
  cardHeading: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  organizer: { marginTop: 5, fontSize: 14, color: "#64748B" },
  description: { marginTop: 16, fontSize: 15, lineHeight: 23, color: "#475569" },
  infoRow: { flexDirection: "row", marginTop: 18, gap: 30 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  infoValue: { marginTop: 5, fontSize: 14, fontWeight: "600", color: "#1E293B" },
  dateBox: { marginTop: 16, backgroundColor: "#F8FAFC", borderRadius: 10, padding: 12 },
  dateText: { fontSize: 13, color: "#475569", fontWeight: "600" },
  viewButton: { marginTop: 18, height: 46, borderRadius: 12, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  viewButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  emptyCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 18, padding: 50, alignItems: "center", marginTop: 10 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { marginTop: 14, fontSize: 20, fontWeight: "800", color: "#1E293B" },
  emptyText: { marginTop: 8, fontSize: 15, color: "#64748B", textAlign: "center", maxWidth: 450, lineHeight: 22 },
});
