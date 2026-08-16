'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';

const ADMIN_EMAILS = [
  'faisal301196@gmail.com',
  'almasladiescornersakchi@gmail.com',
  ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') ?? []),
];

type AuthModalMode = 'login' | 'register' | 'forgot';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  confirmPasswordResetWithCode: (
    newPassword: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  const supabase = createClient();

  const syncUser = useCallback(async (sess: Session | null) => {
    if (!sess) return;
    try {
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sess.access_token}`,
        },
      });
    } catch {}
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setIsAdmin(ADMIN_EMAILS.includes(sess?.user?.email ?? ''));
      setLoading(false);
      if (sess) syncUser(sess);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setIsAdmin(ADMIN_EMAILS.includes(sess?.user?.email ?? ''));
      setLoading(false);
      if (sess) syncUser(sess);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAuthModal = useCallback((mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const confirmPasswordResetWithCode = useCallback(
    async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        confirmPasswordResetWithCode,
        signOut,
      }}
    >
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
