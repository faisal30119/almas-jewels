import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import AuthModal from '../components/AuthModal';

export const DEFAULT_ADMIN_EMAILS = [
  'faisal301196@gmail.com',
  'almasladiescornersakchi@gmail.com'
];

export const checkIsAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const envAdmins = (import.meta as any).env?.VITE_ADMIN_EMAILS
    ? String((import.meta as any).env.VITE_ADMIN_EMAILS).split(',').map((e: string) => e.trim().toLowerCase())
    : [];
  const allAdmins = [...DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase()), ...envAdmins];
  return allAdmins.includes(normalized);
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<string>;
  confirmPasswordResetWithCode: (code: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  isAuthModalOpen: false,
  authModalMode: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  verifyResetCode: async () => '',
  confirmPasswordResetWithCode: async () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        syncUser(session.user.id, session.user.email, session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        syncUser(session.user.id, session.user.email, session.access_token);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUser = async (uid: string, email: string | undefined, token: string) => {
    // Sync user profile in Supabase (upsert to users table via server)
    try {
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).catch(() => {
        // Ignore offline/transient network errors
      });
    } catch {
      // Ignore transient fetch failure
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || undefined,
          display_name: fullName || undefined
        }
      }
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  };

  // Supabase uses a token-based flow via URL hash — verifyResetCode is a no-op shim
  // that returns an empty string (the email is not extractable from the code in Supabase).
  // The ResetPassword page detects the session from the URL hash automatically.
  const verifyResetCode = async (_code: string): Promise<string> => {
    return '';
  };

  const confirmPasswordResetWithCode = async (_code: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = checkIsAdminEmail(user?.email);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAdmin,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      verifyResetCode,
      confirmPasswordResetWithCode,
      signOut
    }}>
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </AuthContext.Provider>
  );
};
