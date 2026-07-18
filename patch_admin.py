import sys

with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

# Add editing state
import_block = "const [activeTable, setActiveTable] = useState('users');"
new_import_block = """  const [activeTable, setActiveTable] = useState('users');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);"""
content = content.replace(import_block, new_import_block)

# Handle Edit function
func_block = """  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };"""
new_func_block = """  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (product: any) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name || '',
      price: String(product.price || ''),
      stock: String(product.stock || ''),
      image: product.image || '',
      category: product.category || categories[0],
      stoneColor: product.stoneColor || product.stone_color || stoneColors[0],
      plating: product.plating || platings[0],
      description: product.description || '',
      inclusions: Array.isArray(product.inclusions) ? product.inclusions.join(', ') : (product.inclusions || '')
    });
    setActiveTab('add');
    setMessage('');
  };

  const resetForm = () => {
    setEditingProductId(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      image: '',
      category: categories[0],
      stoneColor: stoneColors[0],
      plating: platings[0],
      description: '',
      inclusions: ''
    });
  };
"""
content = content.replace(func_block, new_func_block)


# Update handleSubmit to handle PUT for edits
submit_block = """      // 2. Add to Cloud SQL
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
      }
      
      setMessage('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        stock: '',
        image: '',
        category: categories[0],
        stoneColor: stoneColors[0],
        plating: platings[0],
        description: '',
        inclusions: ''
      });"""
      
new_submit_block = """      const token = await user.getIdToken();
      
      let res;
      if (editingProductId) {
        // Edit Cloud SQL product
        res = await fetch(`/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            price: Number(formData.price),
            stock: Number(formData.stock),
            image: formData.image || 'https://images.unsplash.com/photo-1599643478514-4a410f081467?q=80&w=600&auto=format&fit=crop',
            category: formData.category,
            stoneColor: formData.stoneColor,
            plating: formData.plating,
            description: formData.description,
            inclusions: inclusionsArray
          })
        });
      } else {
        // 2. Add to Cloud SQL
        res = await fetch('/api/products', {
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
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${editingProductId ? 'update' : 'add'} product to database`);
      }
      
      setMessage(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
      resetForm();"""

content = content.replace(submit_block, new_submit_block)

# Prevent Firebase insert when editing since we don't have mapping easily without querying it
firebase_block = """      // 1. Add to Firebase Firestore
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
      });"""

new_firebase_block = """      // 1. Add to Firebase Firestore (only if adding new)
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
content = content.replace(firebase_block, new_firebase_block)

# Update Tab logic to include Edit
tab_block = """        <button 
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'add' ? 'border-b-2 border-emerald-950 text-emerald-950' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Plus className="w-4 h-4" /> Add Product (Firebase)
        </button>"""
new_tab_block = """        <button 
          onClick={() => { setActiveTab('add'); resetForm(); }}
          className={`flex items-center gap-2 py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'add' ? 'border-b-2 border-emerald-950 text-emerald-950' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Plus className="w-4 h-4" /> {editingProductId ? 'Edit Product' : 'Add Product'}
        </button>"""
content = content.replace(tab_block, new_tab_block)

button_block = """<button type="submit" disabled={loading} className="w-full bg-emerald-950 text-white font-medium py-3 rounded hover:bg-emerald-900 transition-colors disabled:opacity-50">
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>"""
new_button_block = """<div className="flex gap-4">
              <button type="submit" disabled={loading} className="flex-1 bg-emerald-950 text-white font-medium py-3 rounded hover:bg-emerald-900 transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : editingProductId ? 'Update Product' : 'Add Product'}
              </button>
              {editingProductId && (
                <button type="button" onClick={resetForm} className="px-6 border border-gray-300 font-medium py-3 rounded hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              )}
            </div>"""
content = content.replace(button_block, new_button_block)

table_header_block = """                  <tr className="bg-gray-50">
                    {Object.keys(dbData[0]).map(key => (
                      <th key={key} className="p-3 border-b text-emerald-950 font-medium">{key}</th>
                    ))}
                  </tr>"""
new_table_header_block = """                  <tr className="bg-gray-50">
                    {activeTable === 'products' && (
                      <th className="p-3 border-b text-emerald-950 font-medium w-16">Actions</th>
                    )}
                    {Object.keys(dbData[0]).map(key => (
                      <th key={key} className="p-3 border-b text-emerald-950 font-medium">{key}</th>
                    ))}
                  </tr>"""
content = content.replace(table_header_block, new_table_header_block)

table_body_block = """                  {dbData.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      {Object.values(row).map((val: any, vIdx) => (
                        <td key={vIdx} className="p-3 text-gray-700 max-w-xs truncate">
                          {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}"""
new_table_body_block = """                  {dbData.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      {activeTable === 'products' && (
                        <td className="p-3 border-b">
                          <button 
                            onClick={() => handleEditClick(row)}
                            className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      )}
                      {Object.values(row).map((val: any, vIdx) => (
                        <td key={vIdx} className="p-3 text-gray-700 max-w-xs truncate">
                          {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}"""
content = content.replace(table_body_block, new_table_body_block)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(content)
print("Patched Admin.tsx Edit")
