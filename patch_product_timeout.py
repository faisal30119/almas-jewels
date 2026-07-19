import sys

def patch_file(file_name):
    with open(file_name, 'r') as f:
        content = f.read()

    firebase_fetch = "const docSnap = await getDoc(docRef);"
    timeout_fetch = """
        const docSnap = await Promise.race([
          getDoc(docRef),
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

patch_file('src/pages/Product.tsx')
