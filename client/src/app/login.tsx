import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Svg, {
  Path,
  Rect,
  Polyline,
  Circle,
  Text as SvgText,
} from "react-native-svg";
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
import { shadow } from "../utils/shadow";

WebBrowser.maybeCompleteAuthSession();

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
  border: "#E7EAF0",
  panelBg: "#F2F5FE",
  iconBlueBg: "#DCE7FE",
  iconGreenBg: "#DBF6E6",
  iconPurpleBg: "#EDE6FE",
  iconGreen: "#22B573",
  iconPurple: "#7C3AED",
};

/* ---------------------------------------------------------
   ICONS
--------------------------------------------------------- */
function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 40 44" fill="none">
      <Path
        d="M20 1 L38 11.5 V32.5 L20 43 L2 32.5 V11.5 Z"
        fill={COLORS.primary}
      />
      <Path d="M20 1 L38 11.5 L20 22 L2 11.5 Z" fill="#3B76FF" />
      <SvgText x={20} y={30} fontSize={20} fontWeight="800" fill="#FFFFFF" textAnchor="middle">
        S
      </SvgText>
    </Svg>
  );
}

function IconLock({ size = 26, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={11} width={14} height={10} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={16} r={1.6} fill={color} />
    </Svg>
  );
}

function IconMail({ size = 18, color = COLORS.navy }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={2} stroke={color} strokeWidth={2} />
      <Polyline points="3 7 12 13 21 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconUsers({ size = 22, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function IconCode({ size = 22, color = COLORS.iconGreen }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="16 18 22 12 16 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="8 6 2 12 8 18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconTrophy({ size = 22, color = COLORS.iconPurple }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M8 5H5a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M16 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M12 13v4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M8.5 21h7l-1-4h-5l-1 4z" fill={color} stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
    </Svg>
  );
}

function GoogleG({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8741 2.6836-6.6154z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1818l-2.9087-2.2581c-.8064.54-1.8368.8618-3.0477.8618-2.3436 0-4.3282-1.5818-5.0359-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
      <Path fill="#FBBC05" d="M3.9641 10.71c-.18-.54-.2823-1.1159-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9641 10.71z" />
      <Path fill="#EA4335" d="M9 3.5782c1.3214 0 2.5077.4541 3.4405 1.3459l2.5818-2.5818C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9641 7.29C4.6718 5.1614 6.6564 3.5782 9 3.5782z" />
    </Svg>
  );
}

/* ---------------------------------------------------------
   SCREEN
--------------------------------------------------------- */
export default function LoginScreen() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  // ==========================================
  // GOOGLE RESPONSE
  // ==========================================

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleLogin(response.authentication);
    }
  }, [response]);

  // ==========================================
  // HANDLE GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = async (authentication: any) => {
    try {
      setLoading(true);

      if (!authentication?.accessToken) {
        throw new Error("Google access token not found");
      }

      // Get Google user info
      const googleResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        { headers: { Authorization: `Bearer ${authentication.accessToken}` } }
      );
      const googleUser = await googleResponse.json();

      if (!googleUser.id || !googleUser.email) {
        throw new Error("Could not get Google account information");
      }

      // Send to backend — no token needed for this public endpoint
      const res = await apiFetch("/api/auth/google", null, {
        method: "POST",
        body: JSON.stringify({
          googleId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Google authentication failed");
      }

      if (data.isNewUser) {
        // New user — complete profile first.
        // Pass the token via URL so setup-profile can use it.
        router.replace(
          `/setup-profile?id=${data.user.id}&email=${encodeURIComponent(
            data.user.email
          )}&googleId=${encodeURIComponent(
            data.user.google_id || googleUser.id
          )}&name=${encodeURIComponent(
            data.user.name || googleUser.name || ""
          )}&avatarUrl=${encodeURIComponent(
            data.user.avatar_url || googleUser.picture || ""
          )}&token=${encodeURIComponent(data.token)}`
        );
      } else {
  // Existing user
  router.replace(
    `/home?userId=${data.user.id}`
  );
      }
    } catch (error) {
      console.error("GOOGLE LOGIN ERROR:", error);
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Could not login with Google."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = async () => {
    if (!request) {
      Alert.alert("Please wait", "Google login is still loading.");
      return;
    }
    try {
      await promptAsync();
    } catch (error) {
      console.error("Google prompt error:", error);
    }
  };

  const handleEmailPress = () =>
    Alert.alert("Coming soon", "Email sign-in isn't set up yet — use Google for now.");

  const handleSignUpPress = () =>
    Alert.alert("Coming soon", "Sign up isn't set up yet — use Google to get started.");

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      {/* LEFT PANEL */}
      {isDesktop && (
        <View style={styles.leftPanel}>
          <View style={styles.decorCircle} />
          <View style={styles.logoRow}>
            <LogoMark size={38} />
            <Text style={styles.logoWordmark}>
              Skill<Text style={styles.logoWordmarkBlue}>Verse</Text>
            </Text>
          </View>
          <Text style={styles.leftHeadline}>
            Welcome Back!{"\n"}Let's build something{"\n"}amazing{" "}
            <Text style={styles.leftHeadlineBlue}>together</Text>.
          </Text>
          <Text style={styles.leftSubtext}>
            Sign in to your account to continue your journey and
            collaborate with innovative minds.
          </Text>
          <View style={styles.featureList}>
            <FeatureRow icon={<IconUsers size={22} color={COLORS.primary} />} iconBg={COLORS.iconBlueBg} title="Collaborate" description="Work with passionate developers and designers." />
            <FeatureRow icon={<IconCode size={22} color={COLORS.iconGreen} />} iconBg={COLORS.iconGreenBg} title="Innovate" description="Solve real-world problems and build impactful solutions." />
            <FeatureRow icon={<IconTrophy size={22} color={COLORS.iconPurple} />} iconBg={COLORS.iconPurpleBg} title="Win Prizes" description="Compete, showcase your ideas and win exciting rewards." />
          </View>
          <View style={styles.illustrationWrap}>
            <View style={styles.chatChip}>
              <Text style={styles.chatChipText}>{"</>"}</Text>
            </View>
            <Image
              source={require("../../assets/images/hero-illustration.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      {/* RIGHT PANEL */}
      <View style={styles.rightPanel}>
        <View style={styles.card}>
          <View style={styles.lockCircle}>
            <IconLock size={26} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Sign in to SkillVerse</Text>
          <Text style={styles.subtitle}>Choose a method to sign in to your account</Text>

          <Pressable
            style={[styles.googleButton, (loading || !request) && styles.disabled]}
            onPress={handleGooglePress}
            disabled={loading || !request}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <GoogleG size={19} />
                <Text style={styles.googleText}>Continue with Google</Text>
              </>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.emailButton} onPress={handleEmailPress}>
            <IconMail size={18} color={COLORS.navy} />
            <Text style={styles.emailText}>Continue with Email</Text>
          </Pressable>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable onPress={handleSignUpPress}>
              <Text style={styles.signupLink}>Sign up</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Terms of Service</Text>
          <Text style={styles.footerDot}>·</Text>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerDot}>·</Text>
          <Text style={styles.footerLink}>Help Center</Text>
        </View>
        <Text style={styles.footerCopyright}>© 2025 SkillVerse. All rights reserved.</Text>
        <Pressable onPress={() => router.push("/")} style={styles.backButton}>
          <Text style={styles.backText}>← Back to SkillVerse</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FeatureRow({ icon, iconBg, title, description }: { icon: React.ReactNode; iconBg: string; title: string; description: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.featureTextCol}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFBFE" },
  containerDesktop: { flexDirection: "row" },
  leftPanel: { width: "46%", backgroundColor: COLORS.panelBg, paddingHorizontal: 56, paddingTop: 48, overflow: "hidden" },
  decorCircle: { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "#E7ECFC", bottom: -100, left: -100 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoWordmark: { fontFamily: FONT.extrabold, fontSize: 22, color: "#0F172A" },
  logoWordmarkBlue: { color: COLORS.primary },
  leftHeadline: { marginTop: 44, fontFamily: FONT.extrabold, fontSize: 33, lineHeight: 42, color: COLORS.navy, letterSpacing: -0.5 },
  leftHeadlineBlue: { color: COLORS.primary },
  leftSubtext: { marginTop: 18, maxWidth: 420, fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: COLORS.slate },
  featureList: { marginTop: 34, gap: 22 },
  featureRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  featureIcon: { width: 48, height: 48, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  featureTextCol: { flex: 1, gap: 3 },
  featureTitle: { fontFamily: FONT.bold, fontSize: 15, color: "#111827" },
  featureDescription: { fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: COLORS.slate, maxWidth: 300 },
  illustrationWrap: { marginTop: 34, alignItems: "center", position: "relative" },
  illustrationImage: { width: "100%", height: 220 },
  chatChip: { position: "absolute", top: -6, left: 40, width: 34, height: 34, borderRadius: 9, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", zIndex: 2 },
  chatChipText: { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 13 },
  rightPanel: { flex: 1, backgroundColor: "#FBFBFE", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 460, backgroundColor: "#FFFFFF", borderRadius: 22, padding: 44, alignItems: "center", borderWidth: 1, borderColor: COLORS.border, ...shadow(0, 16, 60, 0.06), elevation: 3 },
  lockCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#E7EEFE", alignItems: "center", justifyContent: "center" },
  title: { marginTop: 22, fontFamily: FONT.extrabold, fontSize: 24, color: COLORS.navy, textAlign: "center" },
  subtitle: { marginTop: 10, fontFamily: FONT.regular, fontSize: 14, color: COLORS.slate, textAlign: "center" },
  googleButton: { width: "100%", marginTop: 28, height: 54, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  disabled: { opacity: 0.6 },
  googleText: { fontFamily: FONT.bold, fontSize: 14.5, color: COLORS.navy },
  dividerRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontFamily: FONT.semibold, fontSize: 12, color: COLORS.slate },
  emailButton: { width: "100%", height: 54, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  emailText: { fontFamily: FONT.bold, fontSize: 14.5, color: COLORS.navy },
  signupRow: { flexDirection: "row", marginTop: 22 },
  signupText: { fontFamily: FONT.regular, fontSize: 13.5, color: COLORS.slateDark },
  signupLink: { fontFamily: FONT.bold, fontSize: 13.5, color: COLORS.primary },
  footerLinks: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 36 },
  footerLink: { fontFamily: FONT.medium, fontSize: 12.5, color: COLORS.slate },
  footerDot: { color: "#CBD5E1", fontSize: 12 },
  footerCopyright: { marginTop: 8, fontFamily: FONT.regular, fontSize: 11.5, color: "#94A3B8" },
  backButton: { marginTop: 22 },
  backText: { fontFamily: FONT.bold, fontSize: 13, color: COLORS.primary },
});
