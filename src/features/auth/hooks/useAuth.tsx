import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../shared/config";
import * as authService from "../services/authService";
import type { AuthContextValue } from "../types";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    setLoading(false);
    return unsub;
  }, []);

  const signInAnonymously = useCallback(async () => {
    setError(null);
    try {
      await authService.signInAnonymously();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Anonymous sign-in failed");
      throw e;
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        await authService.signInWithEmail(email, password);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign-in failed");
        throw e;
      }
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      setError(null);
      try {
        await authService.signUpWithEmail(email, password, displayName);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign-up failed");
        throw e;
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    const { signOut: firebaseSignOut } = await import("firebase/auth");
    await firebaseSignOut(auth);
  }, []);

  const setDisplayName = useCallback(async (name: string) => {
    if (!auth.currentUser) return;
    await authService.updateUserDisplayName(auth.currentUser.uid, name);
    await import("firebase/auth").then(({ updateProfile }) =>
      updateProfile(auth.currentUser!, { displayName: name })
    );
    setUser({ ...auth.currentUser, displayName: name });
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    setDisplayName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
