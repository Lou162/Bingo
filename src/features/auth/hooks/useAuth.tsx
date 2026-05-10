import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  googleWebClientId,
  googleIosClientId,
} from "../../../shared/config/firebase";
import * as authService from "../services/authService";
import type { AuthContextValue } from "../types";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    if (!googleWebClientId.trim()) {
      console.warn(
        "Google Sign-In: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing. Google auth can fail until configured.",
      );
    }
    GoogleSignin.configure({
      webClientId: googleWebClientId,
      iosClientId: googleIosClientId || undefined,
      offlineAccess: false,
    });
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
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await authService.googleSignIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
      throw e;
    }
  }, []);

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
    [],
  );

  const signOut = useCallback(async () => {
    const { signOut: firebaseSignOut } = await import("firebase/auth");
    await firebaseSignOut(auth);
    if (await GoogleSignin.hasPreviousSignIn()) {
      await GoogleSignin.signOut();
    }
  }, []);

  const setDisplayName = useCallback(async (name: string) => {
    if (!auth.currentUser) return;
    await authService.updateUserDisplayName(auth.currentUser.uid, name);
    await import("firebase/auth").then(({ updateProfile }) =>
      updateProfile(auth.currentUser!, { displayName: name }),
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
    signInWithGoogle,
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
