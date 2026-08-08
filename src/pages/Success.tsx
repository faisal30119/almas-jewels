import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function Success() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-24 px-6 relative overflow-hidden bg-emerald-950">
      <div className="absolute inset-0 bg-[url('/assets/images/collection_royal_1783594977165.jpg')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 to-emerald-950"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white p-10 md:p-16 max-w-2xl w-full text-center shadow-2xl"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </motion.div>
        
        <h1 className="text-4xl font-serif text-emerald-950 mb-4">Thank You</h1>
        <p className="text-gray-500 font-light mb-2">Your order has been placed successfully.</p>
        
        <div className="bg-[#F5F5F0] py-6 px-8 inline-block mx-auto mt-6 mb-10 border border-emerald-950/10">
          <span className="block text-xs uppercase tracking-widest text-emerald-900/60 mb-2">Order Reference</span>
          <span className="text-2xl font-mono text-emerald-950">{orderId}</span>
        </div>
        
        <p className="text-gray-600 font-light max-w-md mx-auto mb-12 leading-relaxed">
          We've sent a confirmation email with your order details and tracking information. A bridal stylist will be in touch shortly to assist with any customization needs.
        </p>

        <Link 
          to="/shop"
          className="bg-gold-500 hover:bg-gold-400 text-emerald-950 px-10 py-5 uppercase tracking-widest text-sm font-medium transition-colors inline-flex items-center gap-2 group"
        >
          Continue Shopping <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}
