import { Platform } from "react-native";

/**
 * Cross-platform shadow helper.
 * On web, React Native Web accepts `boxShadow` as a style prop.
 * On native, use the standard shadow* props.
 *
 * Usage:
 *   style={[styles.card, shadow(0, 8, 24, 0.08)]}
 */
export function shadow(
  offsetX = 0,
  offsetY = 8,
  blurRadius = 24,
  opacity = 0.08,
  color = "#1E293B"
) {
  if (Platform.OS === "web") {
    // Parse hex color to rgb for rgba()
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px rgba(${r}, ${g}, ${b}, ${opacity})`,
    } as any;
  }

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blurRadius / 2,
    elevation: Math.round(offsetY * 1.5),
  };
}
