import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

import royalCollectionImg from '../assets/images/collection_royal_1783594977165.jpg';
import solitaireCollectionImg from '../assets/images/collection_solitaire_1783594992085.jpg';
import occasionCollectionImg from '../assets/images/collection_occasion_1783595002665.jpg';

const imageMap: Record<string, string> = {
  '/assets/images/collection_royal_1783594977165.jpg': royalCollectionImg,
  '/assets/images/collection_solitaire_1783594992085.jpg': solitaireCollectionImg,
  '/assets/images/collection_occasion_1783595002665.jpg': occasionCollectionImg,
};

import { products as hardcodedProducts, Product } from '../data';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Cart() {
  const { items, cartCount, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log('Started fetching products');
      let pgProducts: Product[] = [];
      let fbProducts: Product[] = [];
      
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          pgProducts = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,
            image: item.image?.includes('unsplash.com') ? occasionCollectionImg : (imageMap[item.image] || item.image)
          }));
        }
      } catch (err) {
        console.error("Failed to fetch products from API:", err);
      }
      
      try {
        
        const querySnapshot = await Promise.race([
          getDocs(collection(db, 'products')),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 5000))
        ]) as any;

        fbProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(), image: doc.data().image?.includes('unsplash.com') ? occasionCollectionImg : doc.data().image
        })) as Product[];
      } catch (fbErr) {
        console.error("Failed to fetch from Firebase:", fbErr);
      }
      
      setDbProducts([...hardcodedProducts, ...pgProducts, ...fbProducts]);
      console.log('Finished fetching products'); setProductsLoading(false);
    };
    fetchProducts().catch(e => console.error('Unhandled error:', e));
  }, []);

  if (cartCount === 0) {
    return (
      <div className="pt-32 pb-24 text-center min-h-[60vh] px-6">
        <h2 className="text-3xl font-serif text-emerald-950 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 font-light mb-8 max-w-md mx-auto">Looks like you haven't added any elegant pieces yet. Explore our collections to find your perfect match.</p>
        <Link to="/shop" className="inline-block bg-emerald-950 hover:bg-emerald-900 text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors">
          Explore Collection
        </Link>
      </div>
    );
  }

  if (productsLoading) {
    return (
      <div className="pt-32 pb-24 flex justify-center min-h-[60vh] items-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  const cartItems = items.map(item => {
    const product = dbProducts.find(p => String(p.id) === String(item.productId));
    return { ...item, product };
  }).filter(item => item.product !== undefined);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="pt-24 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl md:text-4xl font-serif text-emerald-950 mb-12 text-center">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex gap-6 pb-8 border-b border-gray-200">
              <Link to={`/product/${item.productId}`} className="w-32 h-40 bg-gray-50 flex-shrink-0">
                <img src={item.product!.image} alt={item.product!.name} className="w-full h-full object-cover mix-blend-multiply" referrerPolicy="no-referrer" />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="text-emerald-950 font-medium text-lg mb-1 hover:text-gold-600 transition-colors">{item.product!.name}</h3>
                    </Link>
                    <button 
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-500 font-light text-sm mb-4">{item.product!.category}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-200">
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-3 text-gray-500 hover:text-emerald-950 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium text-emerald-950">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-3 text-gray-500 hover:text-emerald-950 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-medium text-emerald-950 text-lg">
                    ₹{(item.product!.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-emerald-950/5 p-8">
            <h2 className="text-xl font-serif text-emerald-950 mb-6 border-b border-emerald-950/10 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm font-light text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-emerald-950">₹{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-emerald-950">₹{shipping.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-lg font-serif text-emerald-950 pt-6 border-t border-emerald-950/10 mb-8">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            
            <Link 
              to="/checkout"
              className="w-full bg-emerald-950 hover:bg-emerald-900 text-white py-4 flex items-center justify-center gap-2 uppercase tracking-widest font-medium text-sm transition-colors"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
