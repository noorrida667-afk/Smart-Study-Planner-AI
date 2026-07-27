import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";

const NOT_CONFIGURED =
  "Firebase isn't configured yet. Add VITE_FIREBASE_API_KEY to enable sign in.";


export function firebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password. Please try again.";
    case "auth/invalid-email":
      return "That email address doesn't look valid.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/requires-recent-login":
      return "Please log out and log back in before making this change.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function toMessage(e: unknown): string {
  const code = (e as { code?: string })?.code;
  if (code) return firebaseErrorMessage(code);
  return e instanceof Error ? e.message : "Something went wrong. Please try again.";
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.error("Firebase auth init failed", e);
      setLoading(false);
    }
  }, []);


  const value: AuthCtx = {
    user,
    loading,
    signIn: async (email, password) => {
      if (!isFirebaseConfigured) return { error: NOT_CONFIGURED };
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return {};
      } catch (e) {
        return { error: toMessage(e) };
      }
    },
    signUp: async (email, password, fullName) => {
      if (!isFirebaseConfigured) return { error: NOT_CONFIGURED };
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: fullName });
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          fullName,
          email,
          createdAt: serverTimestamp(),
        });
        return {};
      } catch (e) {
        return { error: toMessage(e) };
      }
    },
    signOut: async () => {
      if (!isFirebaseConfigured) return;
      await fbSignOut(auth);
    },
    resetPassword: async (email) => {
      if (!isFirebaseConfigured) return { error: NOT_CONFIGURED };
      try {
        await sendPasswordResetEmail(auth, email);
        return {};
      } catch (e) {
        return { error: toMessage(e) };
      }
    },

  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
