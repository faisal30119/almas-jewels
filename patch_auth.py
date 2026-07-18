import sys

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

old_signin = """  const signInWithGoogle = async () => {
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

new_signin = """  const signInWithGoogle = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isIframe = window.self !== window.top;
      
      if (isIframe) {
        console.warn("Sign-in might be blocked in iframe. Please open the app in a new tab using the button in the top right of the preview.");
      }

      if (isMobile && !isIframe) {
        // On mobile browsers outside iframe, redirect is much more reliable than popup
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed by user or cancelled");
      } else {
        console.error("Error signing in with Google:", error);
        alert(`Sign-in failed: ${error.message}\\n\\nPlease try opening the app in a normal (non-incognito) browser tab.`);
      }
      throw error;
    }
  };"""

if old_signin in content:
    content = content.replace(old_signin, new_signin)
    with open('src/context/AuthContext.tsx', 'w') as f:
        f.write(content)
    print("Patched AuthContext.tsx for mobile")
else:
    print("Could not find block in AuthContext.tsx")
