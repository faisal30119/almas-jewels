import sys

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

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

new_signin = """  const signInWithGoogle = async () => {
    try {
      // If we are in the AI Studio iframe preview, warn the user.
      if (window.self !== window.top) {
        console.warn("Sign-in might be blocked in iframe. Please open the app in a new tab using the button in the top right of the preview.");
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed by user or cancelled");
      } else {
        console.error("Error signing in with Google:", error);
        alert(`Sign-in failed: ${error.message}.\\n\\nIf you are using the AI Studio preview, please open the app in a new tab, or ensure your app URL is added to the Firebase Authorized Domains.`);
      }
      throw error;
    }
  };"""

if old_signin in content:
    content = content.replace(old_signin, new_signin)
    with open('src/context/AuthContext.tsx', 'w') as f:
        f.write(content)
    print("Patched AuthContext.tsx alert")
else:
    print("Could not find block in AuthContext.tsx")
