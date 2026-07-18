import sys

with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

old_block = '''      const inclusionsArray = formData.inclusions.split(',').map(s => s.trim()).filter(Boolean);
      
      await addDoc(collection(firebaseDb, 'products'), {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: formData.image || 'https://images.unsplash.com/photo-1599643478514-4a410f081467?q=80&w=600&auto=format&fit=crop', // default placeholder
        category: formData.category,
        stoneColor: formData.stoneColor,
        plating: formData.plating,
        description: formData.description,
        inclusions: inclusionsArray
      });'''

new_block = '''      const inclusionsArray = formData.inclusions.split(',').map(s => s.trim()).filter(Boolean);
      
      const token = await user.getIdToken();
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image: formData.image || 'https://images.unsplash.com/photo-1599643478514-4a410f081467?q=80&w=600&auto=format&fit=crop', // default placeholder
          category: formData.category,
          stoneColor: formData.stoneColor,
          plating: formData.plating,
          description: formData.description,
          inclusions: inclusionsArray
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add product to database');
      }'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('src/pages/Admin.tsx', 'w') as f:
        f.write(content)
    print("Patched Admin.tsx successfully")
else:
    print("Could not find replacement block in Admin.tsx")

