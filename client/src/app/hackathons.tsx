import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";

import { router } from "expo-router";

const API_URL = "http://localhost:5000";

type Hackathon = {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  organizer?: string;
  platform?: string;
  location?: string;
  mode?: string;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  registration_deadline?: string;
  eventUrl?: string;
  registrationUrl?: string;
  image_url?: string;
};

export default function HackathonsScreen() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>(
    []
  );

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // LOAD HACKATHONS
  // ==========================================

  const loadHackathons = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/hackathons`);

      const data = await response.json();

      console.log("HACKATHON RESPONSE:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load hackathons"
        );
      }

      const list = Array.isArray(data.hackathons)
        ? data.hackathons
        : [];

      setHackathons(list);
      setFilteredHackathons(list);
    } catch (error) {
      console.error("HACKATHON LOAD ERROR:", error);

      Alert.alert(
        "Error",
        "Could not load hackathons."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadHackathons();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setFilteredHackathons(hackathons);
      return;
    }

    const results = hackathons.filter((hackathon) => {
      const title =
        hackathon.title ||
        hackathon.name ||
        "";

      const description =
        hackathon.description ||
        "";

      const organizer =
        hackathon.organizer ||
        "";

      const platform =
        hackathon.platform ||
        "";

      const location =
        hackathon.location ||
        "";

      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        organizer.toLowerCase().includes(query) ||
        platform.toLowerCase().includes(query) ||
        location.toLowerCase().includes(query)
      );
    });

    setFilteredHackathons(results);
  }, [search, hackathons]);

  // ==========================================
  // CRAWL NEW HACKATHONS
  // ==========================================

  const crawlHackathons = async () => {
    try {
      setRefreshing(true);

      const response = await fetch(
        `${API_URL}/api/hackathons/crawl`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log("CRAWL RESPONSE:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to crawl hackathons"
        );
      }

      await loadHackathons();

      Alert.alert(
        "Hackathons Updated",
        `${data.saved || 0} hackathons are now available.`
      );
    } catch (error) {
      console.error("CRAWL ERROR:", error);

      Alert.alert(
        "Error",
        "Could not update hackathons."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // OPEN HACKATHON
  // ==========================================

  const openHackathon = async (hackathon: Hackathon) => {
  const url =
    hackathon.eventUrl ||
    hackathon.registrationUrl;

  if (!url) {
    Alert.alert(
      "Link unavailable",
      "Original hackathon website link is not available."
    );
    return;
  }

  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error("OPEN LINK ERROR:", error);

    Alert.alert(
      "Error",
      "Could not open hackathon website."
    );
  }
};

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date?: string) => {
    if (!date) {
      return "Not specified";
    }

    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading hackathons...
        </Text>
      </View>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* BACK */}

        <Pressable
          onPress={() => router.back()}
        >
          <Text style={styles.back}>
            ← Back
          </Text>
        </Pressable>


        {/* HEADER */}

        <View style={styles.headerRow}>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Hackathons
            </Text>

            <Text style={styles.subtitle}>
              Discover hackathons and opportunities
              to build, compete and learn.
            </Text>
          </View>

          <Pressable
            style={[
              styles.refreshButton,
              refreshing && styles.disabled,
            ]}
            onPress={crawlHackathons}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.refreshText}>
                ↻ Refresh
              </Text>
            )}
          </Pressable>

        </View>


        {/* SEARCH */}

        <View style={styles.searchBox}>

          <Text style={styles.searchIcon}>
            🔍
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search hackathons..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />

        </View>


        {/* COUNT */}

        <View style={styles.countRow}>

          <Text style={styles.countText}>
            {filteredHackathons.length} Hackathons
          </Text>

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
            >
              <Text style={styles.clearText}>
                Clear search
              </Text>
            </Pressable>
          )}

        </View>


        {/* EMPTY */}

        {filteredHackathons.length === 0 ? (

          <View style={styles.emptyCard}>

            <Text style={styles.emptyIcon}>
              🔎
            </Text>

            <Text style={styles.emptyTitle}>
              No hackathons found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or refresh the
              hackathon list.
            </Text>

          </View>

        ) : (

          /* HACKATHON LIST */

          filteredHackathons.map((hackathon, index) => {

            const title =
              hackathon.title ||
              hackathon.name ||
              "Untitled Hackathon";

            const organizer =
              hackathon.organizer ||
              hackathon.platform ||
              "Hackathon Organizer";

            const location =
              hackathon.location ||
              hackathon.mode ||
              "Online";

            const deadline =
              hackathon.deadline ||
              hackathon.registration_deadline;

            return (
              <View
                key={
                  hackathon.id ??
                  `${title}-${index}`
                }
                style={styles.card}
              >

                {/* TOP */}

                <View style={styles.cardTop}>

                  <View style={styles.iconBox}>
                    <Text style={styles.iconText}>
                      🚀
                    </Text>
                  </View>

                  <View style={styles.cardHeading}>

                    <Text
                      style={styles.cardTitle}
                      numberOfLines={2}
                    >
                      {title}
                    </Text>

                    <Text
                      style={styles.organizer}
                      numberOfLines={1}
                    >
                      {organizer}
                    </Text>

                  </View>

                </View>


                {/* DESCRIPTION */}

                {hackathon.description && (
                  <Text
                    style={styles.description}
                    numberOfLines={3}
                  >
                    {hackathon.description}
                  </Text>
                )}


                {/* INFORMATION */}

                <View style={styles.infoRow}>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>
                      📍 Location
                    </Text>

                    <Text style={styles.infoValue}>
                      {location}
                    </Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>
                      📅 Deadline
                    </Text>

                    <Text style={styles.infoValue}>
                      {formatDate(deadline)}
                    </Text>
                  </View>

                </View>


                {/* DATES */}

                {(hackathon.start_date ||
                  hackathon.end_date) && (

                  <View style={styles.dateBox}>

                    <Text style={styles.dateText}>
                      📅{" "}
                      {formatDate(
                        hackathon.start_date
                      )}

                      {"  →  "}

                      {formatDate(
                        hackathon.end_date
                      )}
                    </Text>

                  </View>
                )}


                {/* BUTTON */}

                <Pressable
                  style={styles.viewButton}
                  onPress={() =>
                    openHackathon(hackathon)
                  }
                >
                  <Text style={styles.viewButtonText}>
                    View Hackathon →
                  </Text>
                </Pressable>

              </View>
            );
          })
        )}

      </ScrollView>
    </View>
  );
}


// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  content: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 70,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 15,
  },

  back: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: "#64748B",
    maxWidth: 650,
  },

  refreshButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  refreshText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.6,
  },

  searchBox: {
    marginTop: 28,
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#111827",
    outlineStyle: "none" as any,
  },

  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 14,
  },

  countText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#334155",
  },

  clearText: {
    color: "#2563EB",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  iconText: {
    fontSize: 25,
  },

  cardHeading: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  organizer: {
    marginTop: 5,
    fontSize: 14,
    color: "#64748B",
  },

  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 23,
    color: "#475569",
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 30,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },

  infoValue: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },

  dateBox: {
    marginTop: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
  },

  dateText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },

  viewButton: {
    marginTop: 18,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 50,
    alignItems: "center",
    marginTop: 10,
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 450,
    lineHeight: 22,
  },

});