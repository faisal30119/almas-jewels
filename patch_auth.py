import sys

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

content = content.replace("signInWithPopup, signOut", "signInWithPopup, signInWithRedirect, signOut")

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
print("Patched firebase.ts")

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { auth, onAuthStateChanged, signInWithPopup, googleProvider, signOut as firebaseSignOut } from '../lib/firebase';", "import { auth, onAuthStateChanged, signInWithPopup, signInWithRedirect, googleProvider, signOut as firebaseSignOut } from '../lib/firebase';")

new_signin = """  const signInWithGoogle = async () => {
    try {
      // If we are in an iframe (like AI Studio preview), use signInWithRedirect
      if (window.self !== window.top) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed by user or cancelled");
      } else {
        console.error("Error signing in with Google:", error);
      }
      throw error;
    }
  };"""

old_signin = """  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed by user or cancelled");
      } else {
        console.error("Error signing in with Google:", error);
      }
      throw error;
    }
  };"""

content = content.replace(old_signin, new_signin)

with open('src/context/AuthContext.tsx', 'w') as f:
    f.write(content)
print("Patched AuthContext.tsx")
