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

    // segments[0] is "" when expo-router hasn't resolved yet, or when
    // the app is at the root "/" — both map to the index (landing) page.
    const currentRoute = segments[0] || "index";

    // Routes that are always accessible without a token
    const publicRoutes = ["index", "login", "setup-profile"];
    const isPublic = publicRoutes.includes(currentRoute);

    if (!token && !isPublic) {
      // Not logged in and trying to access a protected screen → login
      router.replace("/login");
      return;
    }

    if (token && currentRoute === "login") {
      // Already logged in, no need to show the login screen again
      router.replace("/home");
    }

    // NOTE: index (landing page) is intentionally kept accessible even
    // when the user is logged in — they can navigate away manually.
    // This lets the landing page always render for logged-out visitors.
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
