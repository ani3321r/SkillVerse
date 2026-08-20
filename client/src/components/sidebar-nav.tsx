import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, usePathname } from "expo-router";
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";

/* ---------------------------------------------------------
   TOKENS (kept in sync with login.tsx)
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
  primarySoft: "#EAF0FE",
  navy: "#0B1D3C",
  slate: "#64748B",
  slateDark: "#334155",
  border: "#EDEFF3",
  bg: "#FFFFFF",
  track: "#E7EAF0",
};

/* ---------------------------------------------------------
   NAV ICONS — 20x20, stroke-based, currentColor via prop
--------------------------------------------------------- */
function IconHome({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10.5 12 3l9 7.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconDashboard({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={8} height={8} rx={1.5} stroke={color} strokeWidth={2} />
      <Rect x={13} y={3} width={8} height={5} rx={1.5} stroke={color} strokeWidth={2} />
      <Rect x={13} y={11} width={8} height={10} rx={1.5} stroke={color} strokeWidth={2} />
      <Rect x={3} y={14} width={8} height={7} rx={1.5} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
function IconSkills({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3 2 8l10 5 10-5-10-5z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M6 11.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-4.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconAssignments({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={4} width={14} height={17} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M9 9h6M9 13h6M9 17h3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconHackathon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M8 5H5a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 13v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M8.5 21h7l-1-4h-5l-1 4z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}
function IconExplore({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={2} />
      <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconStudents({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={3.2} stroke={color} strokeWidth={2} />
      <Path d="M3 20v-1c0-2.8 2.7-5 6-5s6 2.2 6 5v1" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 4.2a3.2 3.2 0 0 1 0 6.2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M19 20v-1c0-2.1-1.4-3.9-3.4-4.6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconChat({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5h16v11H8l-4 4V5z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}
function IconBookmark({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4h12v17l-6-4-6 4V4z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}
function IconBell({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconProfile({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={2} />
      <Path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconSettings({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
      <Path
        d="M19.4 13.5a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.5a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6.1 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10.5a1.65 1.65 0 0 0 1-1.51V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10.5a1.65 1.65 0 0 0 1.51 1H19.5a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
function IconTrophySmall({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill={color} />
      <Path d="M8 5H5a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M16 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M12 13v4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M8.5 21h7l-1-4h-5l-1 4z" fill={color} />
    </Svg>
  );
}

/* ---------------------------------------------------------
   NAV DATA
--------------------------------------------------------- */
type NavItem = { label: string; route: string; Icon: (p: { color: string }) => JSX.Element };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", route: "/home", Icon: IconHome },
  { label: "Dashboard", route: "/dashboard", Icon: IconDashboard },
  { label: "Skills", route: "/skills", Icon: IconSkills },
  { label: "Assignments", route: "/assignments", Icon: IconAssignments },
  { label: "Hackathons", route: "/hackathons", Icon: IconHackathon },
  { label: "Explore", route: "/explore", Icon: IconExplore },
  { label: "Students", route: "/students", Icon: IconStudents },
  { label: "Chat", route: "/chat", Icon: IconChat },
  { label: "Bookmarks", route: "/bookmarks", Icon: IconBookmark },
  { label: "Notifications", route: "/notifications", Icon: IconBell },
  { label: "Profile", route: "/profile", Icon: IconProfile },
  { label: "Settings", route: "/settings", Icon: IconSettings },
];

/* ---------------------------------------------------------
   COMPONENT
--------------------------------------------------------- */
export default function SidebarNav({
  level = 6,
  levelLabel = "Advanced Learner",
  xp = 3200,
  xpMax = 4000,
}: {
  level?: number;
  levelLabel?: string;
  xp?: number;
  xpMax?: number;
}) {
  const pathname = usePathname();
  const progress = Math.min(1, xp / xpMax);

  return (
    <View style={styles.sidebar}>
      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.route;
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={[styles.navItem, active && styles.navItemActive]}
            >
              <item.Icon color={active ? COLORS.primary : COLORS.slate} />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.levelCard}>
        <Text style={styles.levelTitle}>Level {level}</Text>
        <Text style={styles.levelSubtitle}>{levelLabel}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.levelBottomRow}>
          <Text style={styles.xpText}>
            {xp} / {xpMax} XP
          </Text>
          <View style={styles.trophyBadge}>
            <IconTrophySmall color={COLORS.primary} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 236,
    backgroundColor: COLORS.bg,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingTop: 16,
    paddingHorizontal: 12,
    justifyContent: "space-between",
    height: "100%",
  },
  navList: {
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: COLORS.primarySoft,
  },
  navLabel: {
    fontFamily: FONT.medium,
    fontSize: 14.5,
    color: COLORS.slateDark,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontFamily: FONT.semibold,
  },
  levelCard: {
    marginTop: 18,
    marginBottom: 16,
    backgroundColor: "#F8F9FC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  levelTitle: {
    fontFamily: FONT.extrabold,
    fontSize: 17,
    color: COLORS.navy,
  },
  levelSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: COLORS.slate,
    marginTop: 2,
  },
  progressTrack: {
    marginTop: 14,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.track,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  levelBottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  xpText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: COLORS.slate,
  },
  trophyBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
});