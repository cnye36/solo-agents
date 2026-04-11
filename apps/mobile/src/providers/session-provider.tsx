import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthFormResult = {
  error: string | null;
  info?: string | null;
};

type SessionContextValue = {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthFormResult>;
  signUp: (email: string, password: string) => Promise<AuthFormResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  children: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      return { error: "Email and password are required." };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      return { error: "Email and password are required." };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.session) {
      return {
        error: null,
        info: "Check your email to confirm your account before signing in.",
      };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session ?? null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshSession,
    }),
    [isLoading, refreshSession, session, signIn, signOut, signUp],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside SessionProvider.");
  }

  return context;
}
