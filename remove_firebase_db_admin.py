import sys

with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

firebase_block = """      // 1. Add to Firebase Firestore (only if adding new)
      if (!editingProductId) {
        await addDoc(collection(firebaseDb, 'products'), {
          name: formData.name,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image: formData.image || 'https://images.unsplash.com/photo-1599643478514-4a410f081467?q=80&w=600&auto=format&fit=crop',
          category: formData.category,
          stoneColor: formData.stoneColor,
          plating: formData.plating,
          description: formData.description,
          inclusions: inclusionsArray
        });
      }"""

content = content.replace(firebase_block, "")

# Remove imports
content = content.replace("import { collection, addDoc } from 'firebase/firestore';", "")
content = content.replace("import { db as firebaseDb } from '../lib/firebase';", "")
content = content.replace("Add Product (Firebase)", "Add Product")

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(content)

print("Removed Firebase write from Admin.tsx")
