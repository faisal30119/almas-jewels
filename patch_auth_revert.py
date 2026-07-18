import sys

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

old_signin = """  const signInWithGoogle = async () => {
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

new_signin = """  const signInWithGoogle = async () => {
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
print("Reverted AuthContext.tsx")
