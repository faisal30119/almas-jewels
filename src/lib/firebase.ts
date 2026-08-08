import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// We prioritize the generated config, and only use env variables if they look valid.
const getEnv = (key, fallback) => {
  const val = import.meta.env[key];
  if (val && val !== 'alc_mahmood@8' && val !== 'almas_bridal') return val;
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', "AIzaSyAiwqhLNOjWLRCKr-Xx6DSJtvEDfsAZ54c"),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', "ancient-episode-sn50x.firebaseapp.com"),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', "ancient-episode-sn50x"),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', "ancient-episode-sn50x.firebasestorage.app"),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', "167668085938"),
  appId: getEnv('VITE_FIREBASE_APP_ID', "1:167668085938:web:a76d6275e2bca07e3e45ab")
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "ai-studio-almasbridal-56acefbb-6df3-451a-a59f-324bc890894b");

export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged };
