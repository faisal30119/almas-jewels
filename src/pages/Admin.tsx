import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { categories, stoneColors, platings } from '../data';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.email !== 'faisal301196@gmail.com') {
      setMessage('You are not authorized to add products.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const inclusionsArray = formData.inclusions.split(',').map(s => s.trim()).filter(Boolean);
      
      await addDoc(collection(db, 'products'), {
        name: formData.name,
        price: Number(formData.price),
        image: formData.image || 'https://images.unsplash.com/photo-1599643478514-4a410f081467?q=80&w=600&auto=format&fit=crop', // default placeholder
        category: formData.category,
        stoneColor: formData.stoneColor,
        plating: formData.plating,
        description: formData.description,
        inclusions: inclusionsArray
      });
      
      setMessage('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        image: '',
        category: categories[0],
        stoneColor: stoneColors[0],
        plating: platings[0],
        description: '',
        inclusions: ''
      });
    } catch (err: any) {
      console.error(err);
      setMessage(`Error adding product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif text-emerald-950 mb-8">Admin Dashboard - Add Product</h1>
      
      {!user || user.email !== 'faisal301196@gmail.com' ? (
        <div className="p-4 bg-red-50 text-red-700">Access Denied. You are not authorized to view this page.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
              <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." className="w-full border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
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
          
          <button disabled={loading} type="submit" className="bg-emerald-950 text-white px-8 py-3 hover:bg-emerald-900 transition-colors disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      )}
    </div>
  );
}
