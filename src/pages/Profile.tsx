import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Calendar, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        
        // Sort locally to avoid needing a Firestore composite index
        fetchedOrders.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="pt-32 pb-24 text-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto min-h-[70vh]">
      <div class7Name="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
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

      <div className="bg-white p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
          <Package className="w-5 h-5 text-emerald-950" />
          <h2 className="text-xl font-medium text-emerald-950">Order History</h2>
        </div>

        {loading ? (
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
                    ₹{order.amount?.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
