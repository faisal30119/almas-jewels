'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, AlertCircle, MapPin, Clock } from 'lucide-react';

interface Order {
  id: number;
  order_id: string;
  status: string;
  amount: number;
  created_at: string;
  shipping_details: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    name?: string;
    email?: string;
  };
  items: { id: string; name: string; price: number; quantity: number }[];
}

const STATUS_STEPS = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

function statusIndex(status: string) {
  const idx = STATUS_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') ?? '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [inputVal, setInputVal] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function lookupOrder(id: string) {
    if (!id.trim()) {
      setError('Please enter an order ID.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Order not found.');
      } else {
        setOrder(data.order);
        setOrderId(id.trim());
      }
    } catch {
      setError('Failed to fetch order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-lookup if orderId from URL
  useEffect(() => {
    if (initialOrderId) lookupOrder(initialOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

  const stepIdx = order ? statusIndex(order.status) : -1;
  const isCancelled = order?.status === 'Cancelled' || order?.status === 'Failed';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 md:px-16 border-b border-gray-100 text-center">
        <p className="font-sans text-xs uppercase tracking-widest text-gold-600 mb-3">
          Where&apos;s my order?
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-emerald-950">Track Order</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Search form */}
        <div className="flex gap-3 mb-12">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookupOrder(inputVal)}
            placeholder="Enter your Razorpay order ID (order_…)"
            className="flex-1 border border-gray-200 px-4 py-3 font-sans text-sm text-emerald-950 placeholder-gray-300 focus:outline-none focus:border-emerald-950"
          />
          <button
            onClick={() => lookupOrder(inputVal)}
            disabled={loading}
            className="bg-emerald-950 text-white font-sans text-xs uppercase tracking-widest px-6 py-3 hover:bg-emerald-900 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
            Track
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-4 mb-8">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="font-sans text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Order details */}
        {order && (
          <div className="space-y-8">
            {/* Status header */}
            <div className="border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-sans uppercase tracking-widest text-gray-400 mb-1">
                    Order ID
                  </p>
                  <p className="font-sans text-sm font-semibold text-emerald-950 break-all">
                    {order.order_id}
                  </p>
                </div>
                <span
                  className={`font-sans text-xs uppercase tracking-widest px-3 py-1 ${
                    isCancelled
                      ? 'bg-red-50 text-red-500'
                      : order.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex gap-4 mt-4 text-xs font-sans text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Placed {formatDate(order.created_at)}
                </span>
                <span className="font-semibold text-emerald-950">{formatPrice(order.amount)}</span>
              </div>
            </div>

            {/* Progress stepper */}
            {!isCancelled && (
              <div className="border border-gray-100 p-6">
                <p className="text-xs font-sans uppercase tracking-widest text-gray-400 mb-6">
                  Order Progress
                </p>
                <div className="relative">
                  {/* Track line */}
                  <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-100" />
                  <div
                    className="absolute top-3 left-3 h-0.5 bg-emerald-950 transition-all duration-700"
                    style={{
                      width:
                        stepIdx === 0
                          ? '0%'
                          : `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <div
                          className={`w-6 h-6 flex items-center justify-center z-10 ${
                            i <= stepIdx
                              ? 'bg-emerald-950'
                              : 'bg-white border-2 border-gray-200'
                          }`}
                        >
                          {i <= stepIdx && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path
                                d="M1.5 5L4 7.5L8.5 2.5"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <p
                          className={`text-center font-sans text-xs leading-tight max-w-[60px] ${
                            i === stepIdx
                              ? 'text-emerald-950 font-semibold'
                              : i < stepIdx
                              ? 'text-gray-500'
                              : 'text-gray-300'
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping address */}
            {order.shipping_details?.address && (
              <div className="border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={14} className="text-gold-600" />
                  <p className="text-xs font-sans uppercase tracking-widest text-gray-400">
                    Shipping To
                  </p>
                </div>
                <p className="font-sans text-sm text-emerald-950">
                  {order.shipping_details.name ??
                    `${order.shipping_details.firstName ?? ''} ${order.shipping_details.lastName ?? ''}`.trim()}
                </p>
                <p className="font-sans text-sm text-gray-500 mt-1">
                  {order.shipping_details.address}
                </p>
                <p className="font-sans text-sm text-gray-500">
                  {order.shipping_details.city}
                  {order.shipping_details.postalCode
                    ? ` – ${order.shipping_details.postalCode}`
                    : ''}
                </p>
              </div>
            )}

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="border border-gray-100 p-6">
                <p className="text-xs font-sans uppercase tracking-widest text-gray-400 mb-4">
                  Items Ordered
                </p>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="font-sans text-sm text-emerald-950">{item.name}</p>
                        <p className="font-sans text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-sans text-sm font-semibold text-emerald-950">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help note */}
        {!order && !loading && (
          <p className="text-center text-xs font-sans text-gray-400 mt-12">
            Need help?{' '}
            <a
              href="mailto:almasladiescornersakchi@gmail.com"
              className="text-emerald-950 hover:underline"
            >
              Contact us
            </a>{' '}
            with your order reference.
          </p>
        )}

        <div className="text-center mt-16">
          <Link
            href="/profile"
            className="inline-block border border-emerald-950 text-emerald-950 font-sans text-xs uppercase tracking-widest px-8 py-4 hover:bg-emerald-950 hover:text-white transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 size={28} className="animate-spin text-emerald-950" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
