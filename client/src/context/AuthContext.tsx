import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================
// TYPES
// ============================================

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  college: string;
  department: string;
  year: string;
  location: string;
  interest: string;
  google_id?: string | null;
  avatar_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  userId: number | null;
  isLoading: boolean;          // true while restoring from storage
  login: (token: string, user: AuthUser) => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_TOKEN_KEY = "skillverse_token";
const STORAGE_USER_KEY  = "skillverse_user";

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]     = useState<string | null>(null);
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ------------------------------------------
  // RESTORE SESSION ON MOUNT
  // ------------------------------------------

  useEffect(() => {
    const restore = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_TOKEN_KEY),
          AsyncStorage.getItem(STORAGE_USER_KEY),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("AuthContext: restore session error", error);
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  // ------------------------------------------
  // LOGIN — save token + user to state + storage
  // ------------------------------------------

  const login = useCallback(async (newToken: string, newUser: AuthUser) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_TOKEN_KEY, newToken),
        AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser)),
      ]);
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error("AuthContext: login error", error);
    }
  }, []);

  // ------------------------------------------
  // UPDATE USER — after profile save
  // ------------------------------------------

  const updateUser = useCallback(async (updatedUser: AuthUser) => {
    try {
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("AuthContext: updateUser error", error);
    }
  }, []);

  // ------------------------------------------
  // LOGOUT — clear state + storage
  // ------------------------------------------

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_TOKEN_KEY),
        AsyncStorage.removeItem(STORAGE_USER_KEY),
      ]);
    } catch (error) {
      console.error("AuthContext: logout error", error);
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    userId: user?.id ?? null,
    isLoading,
    login,
    updateUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
