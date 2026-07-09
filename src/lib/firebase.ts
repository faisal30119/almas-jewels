import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAiwqhLNOjWLRCKr-Xx6DSJtvEDfsAZ54c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ancient-episode-sn50x.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ancient-episode-sn50x",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ancient-episode-sn50x.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "167668085938",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:167668085938:web:a76d6275e2bca07e3e45ab"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };
