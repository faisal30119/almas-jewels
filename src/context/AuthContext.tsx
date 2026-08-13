import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
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
import AuthModal from '../components/AuthModal';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
        try {
          const token = await currentUser.getIdToken();
          await fetch('/api/users/sync', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error("Failed to sync user:", error);
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
      const isIframe = window !== window.top;
      if (!isIframe) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed or cancelled popup, handled gracefully without error
        return;
      }
      
      console.error("Error signing in with Google:", error);

      if (error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (e) {
          console.error("Redirect error:", e);
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("Domain not authorized for Google Sign-In.\n\nFirebase can take up to 5-10 minutes to propagate domain additions. Please wait a moment and try again.\n\nHost: " + window.location.hostname);
      } else {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (e) {
          console.error("Redirect fallback error:", e);
        }
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
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
