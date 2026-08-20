import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router, Stack, useSegments } from "expo-router";
import * as WebBrowser from "expo-web-browser";

import { AuthProvider, useAuth } from "../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

// ============================================
// REDIRECT GUARD
// Runs inside AuthProvider so useAuth works.
// - While session is restoring → show spinner
// - No token → send to /login (unless already there)
// - Has token → send to /dashboard if on /login or /
// ============================================

function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, isLoading, userId } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = segments[0] ?? "";

    // Public routes that don't need a token
    const publicRoutes = ["login", "index", "setup-profile"];
    const isPublic = publicRoutes.includes(currentRoute);

    if (!token && !isPublic) {
      // Not logged in → kick to login
      router.replace("/login");
      return;
    }

    if (token && (currentRoute === "login" || currentRoute === "index")) {
      // Already logged in → go to home
      router.replace("/home");
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <>{children}</>;
}

// ============================================
// ROOT LAYOUT
// ============================================

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGate>
    </AuthProvider>
  );
}
