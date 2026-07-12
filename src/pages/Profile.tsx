import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Calendar, LogOut, Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { products as hardcodedProducts, Product } from '../data';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist'>('orders');

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as any[];
        
        fetchedOrders.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      setLoadingWishlist(true);
      try {
        if (wishlistIds.length === 0) {
          setWishlistProducts([]);
          setLoadingWishlist(false);
          return;
        }

        const fetchedProducts: Product[] = [];
        
        // Find in hardcoded first
        for (const id of wishlistIds) {
          const hc = hardcodedProducts.find(p => p.id === id);
          if (hc) {
            fetchedProducts.push(hc);
          } else {
            // Fetch from firestore
            const docRef = doc(db, 'products', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              fetchedProducts.push({ id: docSnap.id, ...docSnap.data() } as Product);
            }
          }
        }
        
        setWishlistProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
      } finally {
        setLoadingWishlist(false);
      }
    };
    
    fetchWishlistProducts();
  }, [wishlistIds]);

  if (!user) {
    return (
      <div className="pt-20 pb-24 text-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-24 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif text-emerald-950 mb-2">My Profile</h1>
          <p className="text-gray-500 font-light text-lg">Welcome back, {user.displayName}</p>
        </div>
        <button 
          onClick={signOut}
          className="flex items-center gap-2 text-sm uppercase tracking-widest font-medium text-gray-500 hover:text-emerald-950 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="flex gap-8 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={cn(
            "pb-4 text-sm font-medium uppercase tracking-widest transition-colors relative",
            activeTab === 'orders' ? "text-emerald-950" : "text-gray-400 hover:text-emerald-950"
          )}
        >
          <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Orders</span>
          {activeTab === 'orders' && (
            <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-950" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={cn(
            "pb-4 text-sm font-medium uppercase tracking-widest transition-colors relative",
            activeTab === 'wishlist' ? "text-emerald-950" : "text-gray-400 hover:text-emerald-950"
          )}
        >
          <span className="flex items-center gap-2">
            <Heart className="w-4 h-4" /> 
            Wishlist 
            <span className="bg-gray-100 text-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] ml-1">
              {wishlistIds.length}
            </span>
          </span>
          {activeTab === 'wishlist' && (
            <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-950" />
          )}
        </button>
      </div>

      <div className="bg-white p-8 border border-gray-100 shadow-sm">
        {activeTab === 'orders' && (
          <>
            {loadingOrders ? (
              <div className="py-12 text-center text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-light">
                You haven't placed any orders yet.
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order, index) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-100 p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-gray-200 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-emerald-950">Order {order.orderId}</span>
                        <span className="text-xs bg-emerald-50 text-emerald-900 px-2 py-1 rounded-full uppercase tracking-wider font-medium">
                          {order.status || 'Processing'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {order.items?.length || 0} items
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end justify-center gap-1">
                      <span className="text-xs uppercase tracking-widest text-gray-400">Total Amount</span>
                      <span className="text-lg font-medium text-emerald-950 flex items-center">
                        ₹{order.amount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'wishlist' && (
          <>
            {loadingWishlist ? (
              <div className="py-12 text-center text-gray-500">Loading wishlist...</div>
            ) : wishlistProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-light">
                Your wishlist is empty.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {wishlistProducts.map((product, idx) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group border border-gray-100 rounded-sm overflow-hidden flex flex-col"
                  >
                    <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="p-4 flex flex-col flex-grow bg-white">
                      <Link to={`/product/${product.id}`} className="block mb-2">
                        <h3 className="font-serif text-emerald-950 group-hover:text-gold-600 transition-colors line-clamp-1">{product.name}</h3>
                      </Link>
                      <p className="text-emerald-900 font-medium tracking-wide mb-4 flex-grow">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className="flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-medium py-3 border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors w-full"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
