import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path, Rect, Circle, Line, Polyline } from "react-native-svg";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

/* ---------------------------------------------------------
   TOKENS
--------------------------------------------------------- */
const FONT = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
};

const COLORS = {
  primary: "#1456F0",
  navy: "#0B1D3C",
  slate: "#64748B",
  slateDark: "#334155",
  border: "#E5E9F0",
  pageBg: "#F4F6FB",
  iconBlueBg: "#DCE7FE",
  iconGreenBg: "#DBF6E6",
  iconPurpleBg: "#EDE6FE",
  iconGreen: "#22B573",
  iconPurple: "#7C3AED",
  danger: "#EF4444",
};

/* ---------------------------------------------------------
   ICONS  (kept identical to original)
--------------------------------------------------------- */
function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 40 44" fill="none">
      <Path d="M20 1 L38 11.5 V32.5 L20 43 L2 32.5 V11.5 Z" fill={COLORS.primary} />
      <Path d="M20 1 L38 11.5 L20 22 L2 11.5 Z" fill="#3B76FF" />
      <Path d="M15 15c0-1.6 1.6-2.8 5-2.8s5 1.1 5 2.6-1.6 2-4 2.2c-2.7.2-6 .6-6 3s2.7 3.6 6 3.6 5-1.2 5-2.8" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
function IconHelp({ size = 16, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.35-1 .8-1 1.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={17} r={0.9} fill={color} />
    </Svg>
  );
}
function IconPerson({ size = 18, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IconBuilding({ size = 18, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={3} width={16} height={18} rx={1} stroke={color} strokeWidth={1.8} />
      <Line x1={8} y1={7} x2={8} y2={7.01} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={12} y1={7} x2={12} y2={7.01} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={16} y1={7} x2={16} y2={7.01} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={8} y1={11} x2={8} y2={11.01} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={12} y1={11} x2={12} y2={11.01} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={16} y1={11} x2={16} y2={11.01} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M9 21v-4h6v4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
function IconGradCap({ size = 18, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4 2 9l10 5 10-5-10-5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M22 9v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IconCalendar({ size = 18, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={1.8} />
      <Line x1={16} y1={2} x2={16} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={8} y1={2} x2={8} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={3} y1={10} x2={21} y2={10} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
function IconPin({ size = 18, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
function IconLaptop({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={5} width={16} height={11} rx={1.2} stroke={color} strokeWidth={1.8} />
      <Path d="M2 19h20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IconChip({ size = 16, color = COLORS.iconGreen }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={7} y={7} width={10} height={10} rx={1.4} stroke={color} strokeWidth={1.8} />
      <Rect x={10} y={10} width={4} height={4} stroke={color} strokeWidth={1.6} />
      <Line x1={9} y1={2} x2={9} y2={5} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={15} y1={2} x2={15} y2={5} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={9} y1={19} x2={9} y2={22} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={15} y1={19} x2={15} y2={22} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={2} y1={9} x2={5} y2={9} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={2} y1={15} x2={5} y2={15} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={19} y1={9} x2={22} y2={9} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={19} y1={15} x2={22} y2={15} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
function IconLayers({ size = 16, color = COLORS.iconPurple }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="12 2 2 8 12 14 22 8 12 2" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Polyline points="2 14 12 20 22 14" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="2 11 12 17 22 11" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconGithub({ size = 18, color = COLORS.navy }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.3 6.84 9.65.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.1-1.52-1.1-1.52-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05a9.34 9.34 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.2C22 6.58 17.52 2 12 2z" fill={color} />
    </Svg>
  );
}
function IconLinkedin({ size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={2} width={20} height={20} rx={3} fill="#0A66C2" />
      <Circle cx={7.2} cy={8} r={1.5} fill="#FFFFFF" />
      <Rect x={6} y={10.3} width={2.4} height={7.7} fill="#FFFFFF" />
      <Path d="M11.5 10.3h2.3v1.1c.4-.7 1.2-1.3 2.4-1.3 2 0 3.1 1.3 3.1 3.8v4.1h-2.4v-3.7c0-1.1-.4-1.9-1.4-1.9-.8 0-1.3.6-1.5 1.1-.1.2-.1.5-.1.7v3.8h-2.4v-7.7z" fill="#FFFFFF" />
    </Svg>
  );
}
function IconGlobe({ size = 18, color = COLORS.iconPurple }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M3 12h18" stroke={color} strokeWidth={1.8} />
      <Path d="M12 3c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3z" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
function IconLock({ size = 15, color = COLORS.slate }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={11} width={14} height={9} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function IconShield({ size = 18, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ---------------------------------------------------------
   SCREEN
--------------------------------------------------------- */
export default function SetupProfileScreen() {
  const params = useLocalSearchParams();
  const auth = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  // The token was passed as a URL param from login.tsx
  const tempToken = (params.token as string) || null;

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [name, setName] = useState((params.name as string) || "");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [interest, setInterest] = useState<"software" | "hardware" | "both" | "">("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleContinue = async () => {
    if (!name.trim() || !college.trim() || !department.trim() || !year.trim() || !location.trim() || !interest) {
      Alert.alert("Incomplete Profile", "Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      // Use the temp token passed from login for this one call
      const res = await apiFetch("/api/users/profile", tempToken, {
        method: "POST",
        body: JSON.stringify({
          googleId: (params.googleId as string) || null,
          name: name.trim(),
          email: (params.email as string) || "",
          college: college.trim(),
          department: department.trim(),
          year: year.trim(),
          location: location.trim(),
          interest,
          githubUrl: githubUrl.trim() || null,
          linkedinUrl: linkedinUrl.trim() || null,
          portfolioUrl: portfolioUrl.trim() || null,
          avatarUrl: (params.avatarUrl as string) || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save profile");
      }

      // Persist session — token came from login step, user from profile save
      if (tempToken) {
        await auth.login(tempToken, data.user);
      }

      // Navigate immediately — no Alert blocking the transition.
      // router.replace so the back button never returns to setup-profile.
      router.replace("/home");
    } catch (error) {
      console.error("PROFILE SAVE ERROR:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return <View style={styles.screen} />;

  return (
    <View style={styles.screen}>
      {/* TOP NAV */}
      <View style={styles.navbar}>
        <View style={styles.logoRow}>
          <LogoMark size={26} />
          <Text style={styles.logoWordmark}>
            Skill<Text style={styles.logoWordmarkBlue}>Verse</Text>
          </Text>
        </View>
        <View style={styles.helpRow}>
          <IconHelp size={16} color={COLORS.slate} />
          <Text style={styles.helpText}>Need help?</Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 70 }}>
        <View style={[styles.body, isDesktop && styles.bodyDesktop]}>

          {/* LEFT DECORATION (desktop only) */}
          {isDesktop && (
            <View style={styles.leftCol}>
              <View style={styles.decorBlob}>
                <View style={styles.mockCard}>
                  <View style={styles.mockAvatar}>
                    <IconPerson size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.mockLine} />
                  <View style={[styles.mockLine, { width: "70%" }]} />
                  <View style={[styles.mockLine, { width: "50%" }]} />
                </View>
              </View>
              <View style={styles.journeyBadge}>
                <IconShield size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.journeyTitle}>Your journey starts here</Text>
              <Text style={styles.journeyText}>
                Complete your profile to get personalized recommendations, projects, and opportunities.
              </Text>
            </View>
          )}

          {/* FORM CARD */}
          <View style={[styles.card, isDesktop && styles.cardDesktop]}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarCircle}>
                <IconPerson size={26} color="#FFFFFF" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.title}>Create your profile</Text>
                <Text style={styles.subtitle}>
                  Tell us about yourself so SkillVerse can personalize your learning journey.
                </Text>
              </View>
            </View>

            <FormField label="Full Name" required>
              <View style={styles.inputRow}>
                <IconPerson size={17} color="#94A3B8" />
                <TextInput placeholder="Your name" placeholderTextColor="#94A3B8" value={name} onChangeText={setName} style={styles.inputText} />
              </View>
            </FormField>

            <View style={[styles.fieldRow, isDesktop && styles.fieldRowDesktop]}>
              <FormField label="College" required style={styles.fieldHalf}>
                <View style={styles.inputRow}>
                  <IconBuilding size={17} color="#94A3B8" />
                  <TextInput placeholder="Enter your college" placeholderTextColor="#94A3B8" value={college} onChangeText={setCollege} style={styles.inputText} />
                </View>
              </FormField>
              <FormField label="Department" required style={styles.fieldHalf}>
                <View style={styles.inputRow}>
                  <IconGradCap size={17} color="#94A3B8" />
                  <TextInput placeholder="e.g. Computer Science" placeholderTextColor="#94A3B8" value={department} onChangeText={setDepartment} style={styles.inputText} />
                </View>
              </FormField>
            </View>

            <View style={[styles.fieldRow, isDesktop && styles.fieldRowDesktop]}>
              <FormField label="Year" required style={styles.fieldHalf}>
                <View style={styles.inputRow}>
                  <IconCalendar size={17} color="#94A3B8" />
                  <TextInput placeholder="e.g. 3rd Year" placeholderTextColor="#94A3B8" value={year} onChangeText={setYear} style={styles.inputText} />
                </View>
              </FormField>
              <FormField label="Location" required style={styles.fieldHalf}>
                <View style={styles.inputRow}>
                  <IconPin size={17} color="#94A3B8" />
                  <TextInput placeholder="e.g. Kolkata" placeholderTextColor="#94A3B8" value={location} onChangeText={setLocation} style={styles.inputText} />
                </View>
              </FormField>
            </View>

            <Text style={styles.label}>Primary Interest <Text style={styles.required}>*</Text></Text>
            <View style={styles.interestRow}>
              <InterestOption label="Software" selected={interest === "software"} onPress={() => setInterest("software")} iconBg={COLORS.iconBlueBg} icon={<IconLaptop size={15} color={COLORS.primary} />} />
              <InterestOption label="Hardware" selected={interest === "hardware"} onPress={() => setInterest("hardware")} iconBg={COLORS.iconGreenBg} icon={<IconChip size={15} color={COLORS.iconGreen} />} />
              <InterestOption label="Both" selected={interest === "both"} onPress={() => setInterest("both")} iconBg={COLORS.iconPurpleBg} icon={<IconLayers size={15} color={COLORS.iconPurple} />} />
            </View>

            <FormField label="GitHub">
              <View style={styles.inputRow}>
                <IconGithub size={17} color={COLORS.navy} />
                <TextInput placeholder="https://github.com/..." placeholderTextColor="#94A3B8" value={githubUrl} onChangeText={setGithubUrl} autoCapitalize="none" style={styles.inputText} />
              </View>
            </FormField>

            <FormField label="LinkedIn">
              <View style={styles.inputRow}>
                <IconLinkedin size={19} />
                <TextInput placeholder="https://linkedin.com/in/..." placeholderTextColor="#94A3B8" value={linkedinUrl} onChangeText={setLinkedinUrl} autoCapitalize="none" style={styles.inputText} />
              </View>
            </FormField>

            <FormField label="Portfolio">
              <View style={styles.inputRow}>
                <IconGlobe size={17} color={COLORS.iconPurple} />
                <TextInput placeholder="https://..." placeholderTextColor="#94A3B8" value={portfolioUrl} onChangeText={setPortfolioUrl} autoCapitalize="none" style={styles.inputText} />
              </View>
            </FormField>

            <View style={styles.divider} />

            <View style={styles.actionsRow}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonIcon}>←</Text>
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
              <Pressable style={[styles.continueButton, loading && styles.disabledButton]} onPress={handleContinue} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.continueText}>Continue</Text>
                    <Text style={styles.continueIcon}>→</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.safeRow}>
          <IconLock size={14} color={COLORS.slate} />
          <Text style={styles.safeText}>Your information is safe with us.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FormField({ label, required, children, style }: { label: string; required?: boolean; children: React.ReactNode; style?: any }) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
      {children}
    </View>
  );
}

function InterestOption({ label, selected, onPress, iconBg, icon }: { label: string; selected: boolean; onPress: () => void; iconBg: string; icon: React.ReactNode }) {
  return (
    <Pressable style={[styles.interestButton, selected && styles.interestSelected]} onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={[styles.interestIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.interestText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.pageBg },
  container: { flex: 1 },
  navbar: { height: 66, paddingHorizontal: 28, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#EEF1F5", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoWordmark: { fontFamily: FONT.extrabold, fontSize: 19, color: "#0F172A" },
  logoWordmarkBlue: { color: COLORS.primary },
  helpRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  helpText: { fontFamily: FONT.semibold, fontSize: 13, color: COLORS.slate },
  body: { width: "100%", maxWidth: 1180, alignSelf: "center", padding: 28 },
  bodyDesktop: { flexDirection: "row", gap: 40, paddingTop: 48 },
  leftCol: { width: 280 },
  decorBlob: { width: 260, height: 260, borderRadius: 130, backgroundColor: "#E9EEFC", alignItems: "center", justifyContent: "center" },
  mockCard: { width: 130, height: 160, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, alignItems: "center", shadowColor: "#1E293B", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  mockAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  mockLine: { width: "85%", height: 6, borderRadius: 3, backgroundColor: "#E2E8F5", marginTop: 8 },
  journeyBadge: { marginTop: 28, width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.iconBlueBg, alignItems: "center", justifyContent: "center" },
  journeyTitle: { marginTop: 14, fontFamily: FONT.extrabold, fontSize: 18, color: COLORS.navy },
  journeyText: { marginTop: 8, maxWidth: 240, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 21, color: COLORS.slate },
  card: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 22, padding: 30, borderWidth: 1, borderColor: COLORS.border },
  cardDesktop: { padding: 40 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 18, marginBottom: 26 },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  cardHeaderText: { flex: 1 },
  title: { fontFamily: FONT.extrabold, fontSize: 24, color: COLORS.navy },
  subtitle: { marginTop: 6, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: COLORS.slate },
  fieldRow: { gap: 16 },
  fieldRowDesktop: { flexDirection: "row" },
  fieldHalf: { flex: 1 },
  label: { marginTop: 16, marginBottom: 8, fontFamily: FONT.bold, fontSize: 13, color: COLORS.slateDark },
  required: { color: COLORS.danger },
  inputRow: { height: 50, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: "#FFFFFF", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  inputText: { flex: 1, fontFamily: FONT.medium, fontSize: 14, color: "#111827", height: "100%" },
  interestRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  interestButton: { flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, backgroundColor: "#FFFFFF" },
  interestSelected: { borderColor: COLORS.primary, backgroundColor: "#F3F7FF" },
  radioOuter: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center" },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  interestIcon: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  interestText: { fontFamily: FONT.bold, fontSize: 13.5, color: COLORS.slateDark },
  divider: { height: 1, backgroundColor: COLORS.border, marginTop: 30, marginBottom: 22 },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#FFFFFF" },
  backButtonIcon: { fontSize: 14, color: COLORS.navy, fontFamily: FONT.bold },
  backButtonText: { fontFamily: FONT.bold, fontSize: 14, color: COLORS.navy },
  continueButton: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 26, height: 50, borderRadius: 10, justifyContent: "center" },
  disabledButton: { opacity: 0.6 },
  continueText: { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 15 },
  continueIcon: { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 15 },
  safeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 26 },
  safeText: { fontFamily: FONT.medium, fontSize: 12.5, color: COLORS.slate },
});
