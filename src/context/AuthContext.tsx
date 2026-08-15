import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  db,
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  googleProvider, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  updateProfile
} from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
    // Process redirect result if user signed in via signInWithRedirect
    getRedirectResult(auth).catch((error) => {
      console.error("Error handling redirect result:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. Direct Firestore profile sync (client-side)
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch {
          // Non-blocking Firestore sync
        }

        // 2. Server-side sync endpoint (with safe error handling)
        try {
          const token = await currentUser.getIdToken();
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
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    if (fullName && cred.user) {
      await updateProfile(cred.user, { displayName: fullName });
      setUser({ ...cred.user, displayName: fullName });
    }
  };

  const resetPassword = async (email: string) => {
    // sendPasswordResetEmail sends reset link
    await sendPasswordResetEmail(auth, email);
  };

  const verifyResetCode = async (code: string) => {
    return await verifyPasswordResetCode(auth, code);
  };

  const confirmPasswordResetWithCode = async (code: string, newPassword: string) => {
    await confirmPasswordReset(auth, code, newPassword);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        setUser(result.user);
        setIsAuthModalOpen(false);
        return result.user;
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed or cancelled popup, harmless
        return;
      }
      
      console.error("Error signing in with Google:", error);

      if (error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (e) {
          console.error("Redirect error:", e);
        }
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isAdmin = checkIsAdminEmail(user?.email);

  return (
    <AuthContext.Provider value={{ 
      user, 
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
