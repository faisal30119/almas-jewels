import os

filepath = 'src/context/AuthContext.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_signin = """  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed by user or cancelled.");
        alert("The sign-in popup was closed before completion. If you didn't close it, your browser's popup blocker might have stopped it. Please allow popups for this site and try again.");
      } else if (error.code === 'auth/popup-blocked') {
        alert("Sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
      } else {
        console.error("Error signing in with Google:", error);
        if (error.code === 'auth/unauthorized-domain') {
           alert("Domain not authorized for Google Sign-In.\\n\\n1. If you just added it, Firebase can take up to 5-10 minutes to propagate the change. Please wait a moment and try again.\\n\\n2. Make sure you added exactly: " + window.location.hostname + "\\n\\n3. Also try adding 'ai.studio' to your Authorized Domains if you are still having issues.");
        } else {
           alert(`Sign-in failed: ${error.message} (${error.code})`);
        }
      }
      throw error;
    }
  };"""

new_signin = """  const signInWithGoogle = async () => {
    try {
      // Use redirect by default in production/standalone contexts to avoid COOP/popup blocker issues
      // In iframes (like the AI studio preview), we try popup first.
      const isIframe = window !== window.top;
      if (!isIframe) {
         await signInWithRedirect(auth, googleProvider);
      } else {
         await signInWithPopup(auth, googleProvider);
      }
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        alert("The sign-in popup was closed before completion. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        // Fallback to redirect if popup is blocked
        await signInWithRedirect(auth, googleProvider);
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("Domain not authorized for Google Sign-In.\\n\\nFirebase can take up to 5-10 minutes to propagate domain additions. Please wait a moment and try again.\\n\\nHost: " + window.location.hostname);
      } else {
        // As a last resort fallback, try redirect
        await signInWithRedirect(auth, googleProvider);
      }
    }
  };"""

if old_signin in content:
    content = content.replace(old_signin, new_signin)
    with open(filepath, 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find the sign in block to replace")

