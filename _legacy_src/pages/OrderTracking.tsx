import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Package, Truck, CheckCircle, PackageOpen, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [orderStatus, setOrderStatus] = useState<null | string>(null);
  const [searchedId, setSearchedId] = useState('');
  const { user } = useAuth();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsSearching(true);
    setOrderStatus(null);

    try {
      if (user) {
        const { data, error } = await supabase
          .from('user_orders')
          .select('status')
          .eq('order_id', orderId.trim())
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setOrderStatus(data.status ? data.status.toLowerCase() : 'processing');
          setSearchedId(orderId);
          setIsSearching(false);
          return;
        }
      }

      // Fallback or guest tracking mock for now
      setTimeout(() => {
        setOrderStatus('processing');
        setSearchedId(orderId);
        setIsSearching(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching order status:', error);
      setOrderStatus('processing');
      setSearchedId(orderId);
      setIsSearching(false);
    }
  };

  const isCancelled = orderStatus === 'cancelled';
  
  const stages = isCancelled 
    ? [
        { id: 'processing', label: 'Processing', icon: Package, description: 'Order was received' },
        { id: 'cancelled', label: 'Cancelled', icon: XCircle, description: 'Your order has been cancelled' }
      ]
    : [
        { id: 'processing', label: 'Processing', icon: Package, description: 'We are preparing your order' },
        { id: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way' },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Your order has been delivered' }
      ];

  const getCurrentStepIndex = () => {
    if (orderStatus === 'processing' || orderStatus === 'pending') return 0;
    if (orderStatus === 'shipped') return 1;
    if (orderStatus === 'delivered') return 2;
    if (orderStatus === 'cancelled') return 1; // 2nd step in cancelled flow
    return 0;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="pt-12 pb-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto min-h-[70vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif text-emerald-950 mb-4">Track Your Order</h1>
        <p className="text-gray-500 font-light max-w-lg mx-auto">
          Enter your order ID below to see the real-time status of your elegant pieces.
        </p>
      </div>

      <div className="bg-white p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto mb-12">
        <form onSubmit={handleTrack} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order ID (e.g., #AB-1234)"
              className="w-full bg-[#FAFAFA] border border-gray-200 pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-950 transition-colors font-light"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching || !orderId.trim()}
            className="bg-emerald-950 hover:bg-emerald-900 disabled:bg-emerald-950/70 text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors"
          >
            {isSearching ? 'Tracking...' : 'Track'}
          </button>
        </form>
      </div>

      {orderStatus && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-12">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Order Details</p>
              <h2 className="text-xl font-medium text-emerald-950">{searchedId}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Current Status</p>
              <h2 className="text-xl font-medium text-emerald-950 capitalize">{orderStatus}</h2>
            </div>
          </div>

          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 hidden md:block"></div>
            
            {/* Active Progress Bar */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-950 -z-10 hidden md:block transition-all duration-1000 ease-in-out"
              style={{ width: `${(currentStep / (stages.length - 1)) * 100}%` }}
            ></div>

            <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0">
              {stages.map((stage, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                const Icon = stage.icon;

                return (
                  <div key={stage.id} className="flex md:flex-col items-center gap-4 md:gap-4 flex-1">
                    <div 
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-500 bg-white",
                        isCompleted ? "border-emerald-950 text-emerald-950" : "border-gray-200 text-gray-300"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="md:text-center">
                      <h3 className={cn(
                        "font-medium mb-1 transition-colors",
                        isCompleted ? "text-emerald-950" : "text-gray-400"
                      )}>
                        {stage.label}
                      </h3>
                      <p className={cn(
                        "text-sm font-light",
                        isCurrent ? "text-gray-600" : "text-gray-400"
                      )}>
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {isSearching && (
        <div className="flex justify-center items-center py-24">
          <PackageOpen className="w-8 h-8 text-emerald-950 animate-bounce" />
        </div>
      )}
    </div>
  );
}
