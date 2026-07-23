import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthStateChanged, signInWithPopup, signInWithRedirect, googleProvider, signOut as firebaseSignOut } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const signInWithGoogle = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isIframe = window.self !== window.top;
      



      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed by user or cancelled");
      } else {
        console.error("Error signing in with Google:", error);
        if (error.code === 'auth/unauthorized-domain') {
           alert("Domain not authorized for Google Sign-In.\n\n1. If you just added it, Firebase can take up to 5-10 minutes to propagate the change. Please wait a moment and try again.\n\n2. Make sure you added exactly: " + window.location.hostname + "\n\n3. Also try adding 'ai.studio' to your Authorized Domains if you are still having issues.");
        } else {
           alert(`Sign-in failed: ${error.message} (${error.code})`);
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

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
