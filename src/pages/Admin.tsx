import React, { useState, useEffect } from 'react';


import { categories, stoneColors, platings } from '../data';
import { useAuth } from '../context/AuthContext';
import { Database, Plus, AlertTriangle } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'db' | 'alerts'>('add');
  const [dbData, setDbData] = useState<any[]>([]);
    const [activeTable, setActiveTable] = useState('users');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [lowStockLoading, setLowStockLoading] = useState(false);
  
  const [formData, setFormData] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    setLocalPreview(null);
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.email !== 'faisal301196@gmail.com') {
      setMessage('You are not authorized to add products.');
      return;
    }
    
    setSubmitLoading(true);
    setMessage('');
    
    try {
      const inclusionsArray = formData.inclusions.split(',').map(s => s.trim()).filter(Boolean);
      


      const token = await user.getIdToken();
      
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
      resetForm();
      
      // Switch to database viewer to show the product table
      setActiveTable('products');
      setActiveTab('db');
    } catch (err: any) {
      console.error(err);
      setMessage(`Error adding product: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'db') {
      fetchTableData(activeTable);
    }
  }, [activeTab, activeTable]);

  useEffect(() => {
    if (user) {
      fetchLowStockProducts();
    }
  }, [user]);

  const fetchLowStockProducts = async () => {
    if (!user) return;
    setLowStockLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/low-stock`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLowStockProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLowStockLoading(false);
    }
  };

  const fetchTableData = async (table: string) => {
    if (!user) return;
    setDbLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/db/${table}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDbData(data);
      } else {
        console.error('Failed to fetch table data');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDbLoading(false);
    }
  };

  if (!user || user.email !== 'faisal301196@gmail.com') {
    return (
      <div className="pt-12 pb-24 px-6 max-w-3xl mx-auto">
         <div className="p-4 bg-red-50 text-red-700">Access Denied. You are not authorized to view this page.</div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-24 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif text-emerald-950 mb-8">Admin Dashboard</h1>
      
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button 
          onClick={() => { setActiveTab('add'); resetForm(); }}
          className={`flex items-center gap-2 py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'add' ? 'border-b-2 border-emerald-950 text-emerald-950' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Plus className="w-4 h-4" /> {editingProductId ? 'Edit Product' : 'Add Product'}
        </button>
        <button 
          onClick={() => setActiveTab('db')}
          className={`flex items-center gap-2 py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'db' ? 'border-b-2 border-emerald-950 text-emerald-950' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Database className="w-4 h-4" /> Database Viewer (Cloud SQL)
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 py-3 px-6 font-medium whitespace-nowrap ${activeTab === 'alerts' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="relative">
            <AlertTriangle className="w-4 h-4" />
            {lowStockProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
            {lowStockProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
          Alerts
          {lowStockProducts.length > 0 && (
            <span className="ml-1 bg-red-100 text-red-700 py-0.5 px-2 rounded-full text-xs">
              {lowStockProducts.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                  <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." className="w-full sm:flex-1 border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
                  <span className="text-gray-400 text-center sm:text-left">or</span>
                  <label className="bg-gray-100 px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-gray-700">{uploadLoading ? 'Uploading...' : 'Upload Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        // Create local preview immediately
                        const objectUrl = URL.createObjectURL(file);
                        setLocalPreview(objectUrl);
                        
                        setUploadLoading(true);
                        const uploadData = new FormData();
                        uploadData.append('file', file);
                        
                        try {
                          const token = await user?.getIdToken();
                          const res = await fetch('/api/admin/upload', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            },
                            body: uploadData
                          });
                          const data = await res.json();
                          if (data.url) {
                            setFormData(prev => ({ ...prev, image: data.url }));
                          } else {
                            throw new Error(data.error || 'Failed to upload image');
                          }
                        } catch (err: any) {
                          alert(`Error uploading image: ${err.message}`);
                        } finally {
                          setUploadLoading(false);
                          e.target.value = '';
                        }
                      }} 
                    />
                  </label>
                </div>
                {(localPreview || formData.image) && (
                  <div className="mt-3 relative inline-block">
                    <img src={localPreview || formData.image} alt="Preview" className="w-24 h-24 object-cover rounded border border-gray-200 shadow-sm" />
                    {uploadLoading && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded">
                        <div className="w-5 h-5 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stone Color</label>
                <select name="stoneColor" value={formData.stoneColor} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none">
                  {stoneColors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plating</label>
                <select name="plating" value={formData.plating} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none">
                  {platings.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Inclusions (Comma separated)</label>
                <input required type="text" name="inclusions" value={formData.inclusions} onChange={handleChange} placeholder="Necklace, Earrings, Maang Tikka" className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none"></textarea>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button disabled={submitLoading || uploadLoading} type="submit" className="bg-emerald-950 text-white px-8 py-3 hover:bg-emerald-900 transition-colors disabled:opacity-50">
                {submitLoading ? 'Saving...' : editingProductId ? 'Update Product' : 'Add Product'}
              </button>
              {editingProductId && (
                <button type="button" onClick={resetForm} className="px-8 border border-gray-300 text-gray-700 py-3 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'db' && (
        <div>
          <div className="flex gap-4 mb-6">
            {['users', 'products', 'orders', 'order_items'].map(table => (
              <button
                key={table}
                onClick={() => setActiveTable(table)}
                className={`px-4 py-2 text-sm rounded ${activeTable === table ? 'bg-emerald-950 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {table}
              </button>
            ))}
          </div>

          <div className="bg-white rounded shadow border border-gray-200 overflow-x-auto">
            {dbLoading ? (
              <div className="p-8 text-center text-gray-500">Loading data...</div>
            ) : dbData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No data found in {activeTable}.</div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {activeTable === 'products' && (
                      <th className="p-3 border-b text-emerald-950 font-medium w-16">Actions</th>
                    )}
                    {Object.keys(dbData[0]).map(key => (
                      <th key={key} className="p-3 border-b text-emerald-950 font-medium">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dbData.map((row, idx) => (
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
                      {Object.entries(row).map(([key, val]: [string, any], vIdx) => {
                        let displayVal = val;
                        if (activeTable === 'orders' && key === 'totalAmount' && typeof val === 'number') {
                          displayVal = val / 100;
                        }
                        if (activeTable === 'orders' && key === 'userId' && val === null) {
                          displayVal = "Guest (Not logged in)";
                        }
                        return (
                          <td key={vIdx} className="p-3 text-gray-700 max-w-xs truncate">
                            {typeof displayVal === 'object' && displayVal !== null ? JSON.stringify(displayVal) : String(displayVal)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="max-w-4xl">
          <h2 className="text-xl font-medium text-emerald-950 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Low Stock Alerts
          </h2>
          {lowStockLoading ? (
            <div className="p-8 text-center text-gray-500">Checking inventory...</div>
          ) : lowStockProducts.length === 0 ? (
            <div className="p-8 bg-green-50 border border-green-200 rounded text-green-700 flex items-center justify-center gap-2">
              All products have sufficient stock.
            </div>
          ) : (
            <div className="bg-white rounded shadow border border-red-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-red-50">
                    <th className="p-3 border-b text-red-900 font-medium">ID</th>
                    <th className="p-3 border-b text-red-900 font-medium">Product</th>
                    <th className="p-3 border-b text-red-900 font-medium">Stock Level</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-700">{product.id}</td>
                      <td className="p-3 text-gray-900 font-medium">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {product.stock} remaining
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
