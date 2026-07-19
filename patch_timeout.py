import sys

def patch_file(file_name):
    with open(file_name, 'r') as f:
        content = f.read()

    # Wrap the Firebase fetch in Promise.race for a 5-second timeout
    firebase_fetch = "const querySnapshot = await getDocs(collection(db, 'products'));"
    timeout_fetch = """
        const querySnapshot = await Promise.race([
          getDocs(collection(db, 'products')),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 5000))
        ]) as any;
"""
    
    if firebase_fetch in content:
        content = content.replace(firebase_fetch, timeout_fetch)
        with open(file_name, 'w') as f:
            f.write(content)
        print(f"Patched {file_name}")
    else:
        print(f"Could not find block in {file_name}")

patch_file('src/pages/Cart.tsx')
patch_file('src/pages/Checkout.tsx')
patch_file('src/pages/Shop.tsx')
