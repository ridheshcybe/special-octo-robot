"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loadSession, supabase, envReady, type SessionState } from "../lib/supabase";

interface AuthContextValue extends SessionState {
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  userId: null,
  email: null,
  profile: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    userId: null,
    email: null,
    profile: null,
  });
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const next = await loadSession();
    setState(next);
  }

  useEffect(() => {
    if (!envReady) {
      setLoading(false);
      return;
    }
    void refresh().finally(() => setLoading(false));

    const sb = supabase();
    const { data } = sb.auth.onAuthStateChange((_event) => {
      void refresh();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (envReady) await supabase().auth.signOut();
    setState({ userId: null, email: null, profile: null });
  }

  return (
    <AuthContext.Provider value={{ ...state, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
