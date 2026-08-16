'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Package } from 'lucide-react';
import { motion } from 'framer-motion';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  React.useEffect(() => {
    if (!orderId) {
      router.replace('/');
    }
  }, [orderId, router]);

  if (!orderId) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl text-emerald-950 mb-4">
          Thank You!
        </h1>
        <p className="text-gray-600 font-sans text-sm leading-relaxed mb-6 max-w-sm mx-auto">
          Your order has been placed successfully. We&apos;ve sent a confirmation email with your
          order details and tracking information.
        </p>

        <div className="bg-gray-50 border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Package size={16} className="text-gold-600" />
            <p className="text-xs font-sans uppercase tracking-widest text-gray-500">
              Order Reference
            </p>
          </div>
          <p className="font-sans font-bold text-emerald-950 text-sm break-all">{orderId}</p>
          <p className="text-gray-400 text-xs font-sans mt-2">
            Keep this reference for tracking and support
          </p>
        </div>

        <p className="text-gray-500 font-sans text-xs mb-8 leading-relaxed">
          Our team will prepare your order with care. Typical delivery is 5–7 business days. You&apos;ll
          receive email updates at every step.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="bg-emerald-950 text-white font-sans text-xs uppercase tracking-widest px-8 py-4 hover:bg-emerald-900 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/profile"
            className="border border-emerald-950 text-emerald-950 font-sans text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-50 transition-colors"
          >
            My Orders
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
