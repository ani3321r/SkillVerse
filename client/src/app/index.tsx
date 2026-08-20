import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

/* ---------------------------------------------------------
   FONT FAMILY CONSTANTS
--------------------------------------------------------- */
const FONT = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
};

/* ---------------------------------------------------------
   COLOR TOKENS (sampled from reference design)
--------------------------------------------------------- */
const COLORS = {
  primary: "#1456F0",
  primaryDark: "#0F45C7",
  navy: "#0F172A",
  slate: "#64748B",
  slateDark: "#334155",
  border: "#E7EAF0",
  heroBg: "#F9FAFC",
  badgeBg: "#EAF0FE",
  statsBg: "#EEF2FE",
  iconBlue: "#155EEF",
  iconGreen: "#34B077",
  iconPurple: "#7C4DEE",
  iconOrange: "#FEAD22",
  dark: "#0B1220",
};

/* ---------------------------------------------------------
   LINE ICONS (react-native-svg, feather-style strokes)
--------------------------------------------------------- */
function IconCalendar({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={2} />
      <Line x1={16} y1={2} x2={16} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={8} y1={2} x2={8} y2={6} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={3} y1={10} x2={21} y2={10} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function IconPin({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function IconUsers({ size = 16, color = COLORS.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function IconRocket({ size = 16, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c2.5 1.7 4 4.6 4 8.5 0 2-1 4-1 4l-3 1-3-1s-1-2-1-4c0-3.9 1.5-6.8 4-8.5z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={9} r={1.6} stroke={color} strokeWidth={1.8} />
      <Path d="M9 15l-2.5 1.5L7 19" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 15l2.5 1.5L17 19" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.5 18.5c0 1 .7 2 1.5 2.5.8-.5 1.5-1.5 1.5-2.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconTrophy({ size = 24, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M8 5H5a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={12} y1={13} x2={12} y2={17} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8.5 21h7l-1-4h-5l-1 4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IconCode({ size = 24, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="16 18 22 12 16 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="8 6 2 12 8 18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconUserPair({ size = 24, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16 21v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={9.5} cy={8} r={3.3} stroke={color} strokeWidth={1.8} />
      <Path d="M21 21v-1.5a3.7 3.7 0 0 0-2.5-3.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M15 4.3a3.3 3.3 0 0 1 0 6.4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function IconGift({ size = 24, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={8} width={18} height={4} stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 8v13" stroke={color} strokeWidth={1.8} />
      <Path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IconMedal({ size = 24, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={7} stroke={color} strokeWidth={1.8} />
      <Polyline
        points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ---------------------------------------------------------
   SCREEN
--------------------------------------------------------- */
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* NAVBAR */}
      <View style={[styles.navbar, isDesktop && styles.navbarDesktop]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoMark}>{"</>"}</Text>
          <Text style={styles.logoText}>SkillVerse</Text>
        </View>

        {isDesktop && (
          <View style={styles.navLinks}>
            <Text style={[styles.navLink, styles.navLinkActive]}>Home</Text>
            <Text style={styles.navLink}>About</Text>
            <Text style={styles.navLink}>Challenges</Text>
            <Text style={styles.navLink}>Schedule</Text>
            <Text style={styles.navLink}>Prizes</Text>
            <Text style={styles.navLink}>FAQ</Text>
            <Text style={styles.navLink}>Contact</Text>
          </View>
        )}

        <Pressable
          style={styles.registerButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.registerButtonText}>Register Now</Text>
        </Pressable>
      </View>

      {/* HERO */}
      <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
        <View
          style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Innovate • Build • Impact</Text>
          </View>

          <Text style={styles.heroTitle}>
            Build Solutions.
            {"\n"}
            Create <Text style={styles.heroHighlight}>Impact.</Text>
          </Text>

          <Text style={styles.heroDescription}>
            Join SkillVerse and collaborate with passionate minds to solve
            real-world problems and build innovative solutions.
          </Text>

          <View style={styles.heroButtons}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/login")}
            >
              <IconRocket size={16} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Register Now</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton}>
              <IconUsers size={16} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Learn More</Text>
            </Pressable>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <IconCalendar size={15} color={COLORS.primary} />
              <Text style={styles.metaText}>25 - 27 July, 2025</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <IconPin size={15} color={COLORS.primary} />
              <Text style={styles.metaText}>Online Event</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <IconUsers size={15} color={COLORS.primary} />
              <Text style={styles.metaText}>Open to All</Text>
            </View>
          </View>
        </View>

        {isDesktop && (
          <View style={styles.heroImageWrap}>
            <Image
              source={require("../../assets/images/hero-illustration.png")}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {/* WHY PARTICIPATE */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Participate?</Text>

        <View style={styles.featureGrid}>
          <FeatureCard
            icon={<IconUserPair size={22} color="#FFFFFF" />}
            iconBg={COLORS.iconBlue}
            title="Learn & Grow"
            description="Learn new skills, explore technologies, and grow with mentors and experts."
          />

          <FeatureCard
            icon={<IconTrophy size={22} color="#FFFFFF" />}
            iconBg={COLORS.iconGreen}
            title="Exciting Prizes"
            description="Win amazing prizes, goodies, and get recognition for your innovative ideas."
          />

          <FeatureCard
            icon={<IconCode size={22} color="#FFFFFF" />}
            iconBg={COLORS.iconPurple}
            title="Solve Real Problems"
            description="Work on real-world challenges and build solutions that create impact."
          />

          <FeatureCard
            icon={<IconUserPair size={22} color="#FFFFFF" />}
            iconBg={COLORS.iconOrange}
            title="Network"
            description="Connect with like-minded people and build relationships that last."
          />
        </View>

        {/* STATS BAR */}
        <View style={[styles.statsBar, isDesktop && styles.statsBarDesktop]}>
          <StatItem
            icon={<IconUsers size={26} color={COLORS.iconBlue} />}
            number="1000+"
            label="Participants"
          />
          <View style={styles.statsDivider} />
          <StatItem
            icon={<IconCode size={26} color={COLORS.iconGreen} />}
            number="20+"
            label="Challenges"
          />
          <View style={styles.statsDivider} />
          <StatItem
            icon={<IconGift size={26} color={COLORS.iconPurple} />}
            number="₹2L+"
            label="Prize Pool"
          />
          <View style={styles.statsDivider} />
          <StatItem
            icon={<IconMedal size={26} color={COLORS.iconOrange} />}
            number="50+"
            label="Mentors"
          />
        </View>
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Ready to build something great?</Text>

        <Text style={styles.ctaDescription}>
          Register now and be part of SkillVerse.
        </Text>

        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.ctaButtonText}>Register Now →</Text>
        </Pressable>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerLogoRow}>
          <Text style={styles.footerLogoMark}>{"</>"}</Text>
          <Text style={styles.footerLogo}>SkillVerse</Text>
        </View>

        <Text style={styles.footerText}>Innovate • Build • Impact</Text>
      </View>
    </ScrollView>
  );
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: iconBg }]}>
        {icon}
      </View>

      <View style={styles.featureTextCol}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function StatItem({
  icon,
  number,
  label,
}: {
  icon: React.ReactNode;
  number: string;
  label: string;
}) {
  return (
    <View style={styles.statItem}>
      {icon}
      <View>
        <Text style={styles.statNumber}>{number}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  navbar: {
    minHeight: 72,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F7",
  },

  navbarDesktop: {
    paddingHorizontal: 64,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  logoMark: {
    fontFamily: FONT.extrabold,
    fontSize: 19,
    color: COLORS.primary,
  },

  logoText: {
    fontFamily: FONT.extrabold,
    fontSize: 19,
    color: COLORS.primary,
  },

  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
  },

  navLink: {
    fontFamily: FONT.semibold,
    fontSize: 14.5,
    color: "#1F2937",
  },

  navLinkActive: {
    color: COLORS.primary,
  },

  registerButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
  },

  registerButtonText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },

  hero: {
    paddingHorizontal: 24,
    paddingVertical: 56,
    backgroundColor: COLORS.heroBg,
    alignItems: "center",
  },

  heroDesktop: {
    paddingHorizontal: 64,
    paddingVertical: 84,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 1400,
    width: "100%",
    alignSelf: "center",
  },

  heroContent: {
    width: "100%",
    maxWidth: 600,
  },

  heroContentDesktop: {
    width: "47%",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.badgeBg,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 22,
  },

  badgeText: {
    fontFamily: FONT.bold,
    color: COLORS.primary,
    fontSize: 12.5,
  },

  heroTitle: {
    fontFamily: FONT.extrabold,
    fontSize: 46,
    lineHeight: 53,
    color: COLORS.navy,
    letterSpacing: -1,
  },

  heroHighlight: {
    color: COLORS.primary,
  },

  heroDescription: {
    marginTop: 22,
    maxWidth: 500,
    fontFamily: FONT.regular,
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.slate,
  },

  heroButtons: {
    flexDirection: "row",
    gap: 14,
    marginTop: 28,
    flexWrap: "wrap",
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 9,
  },

  primaryButtonText: {
    fontFamily: FONT.bold,
    color: "#FFFFFF",
    fontSize: 15,
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 9,
  },

  secondaryButtonText: {
    fontFamily: FONT.bold,
    color: COLORS.primary,
    fontSize: 15,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 26,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#D9DEE7",
  },

  metaText: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    color: COLORS.slateDark,
  },

  heroImageWrap: {
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },

  heroImage: {
    width: "100%",
    height: 460,
  },

  featuresSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 68,
    paddingBottom: 60,
    alignItems: "center",
  },

  sectionTitle: {
    fontFamily: FONT.extrabold,
    fontSize: 29,
    color: COLORS.navy,
    marginBottom: 34,
  },

  featureGrid: {
    width: "100%",
    maxWidth: 1160,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 18,
  },

  featureCard: {
    width: 260,
    minHeight: 190,
    padding: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
  },

  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  featureTextCol: {
    gap: 6,
  },

  featureTitle: {
    fontFamily: FONT.extrabold,
    fontSize: 16,
    color: "#111827",
  },

  featureDescription: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.slate,
  },

  statsBar: {
    width: "100%",
    maxWidth: 1160,
    marginTop: 36,
    backgroundColor: COLORS.statsBg,
    borderRadius: 18,
    paddingVertical: 26,
    paddingHorizontal: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    rowGap: 24,
    columnGap: 30,
  },

  statsBarDesktop: {
    justifyContent: "space-between",
  },

  statsDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#D7DEF3",
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  statNumber: {
    fontFamily: FONT.extrabold,
    fontSize: 22,
    color: COLORS.primary,
  },

  statLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.slate,
  },

  cta: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: 24,
    paddingVertical: 70,
    alignItems: "center",
  },

  ctaTitle: {
    fontFamily: FONT.extrabold,
    color: "#FFFFFF",
    fontSize: 29,
    textAlign: "center",
  },

  ctaDescription: {
    marginTop: 12,
    fontFamily: FONT.regular,
    color: "#94A3B8",
    fontSize: 16,
    textAlign: "center",
  },

  ctaButton: {
    marginTop: 26,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 9,
  },

  ctaButtonText: {
    fontFamily: FONT.bold,
    color: "#FFFFFF",
    fontSize: 15,
  },

  footer: {
    paddingVertical: 30,
    paddingHorizontal: 24,
    backgroundColor: "#080D18",
    alignItems: "center",
  },

  footerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  footerLogoMark: {
    fontFamily: FONT.extrabold,
    color: COLORS.primary,
    fontSize: 16,
  },

  footerLogo: {
    fontFamily: FONT.extrabold,
    color: "#FFFFFF",
    fontSize: 16,
  },

  footerText: {
    marginTop: 8,
    fontFamily: FONT.regular,
    color: "#64748B",
    fontSize: 12,
  },
});