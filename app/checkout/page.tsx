'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Tag, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, session, loading: authLoading, openAuthModal } = useAuth();
  const { items, cartTotal, clearCart } = useCart();

  const SHIPPING = 10;
  const [subtotal, setSubtotal] = useState(cartTotal);
  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    setSubtotal(cartTotal);
  }, [cartTotal]);

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? '';
      const parts = name.split(' ');
      setForm((f) => ({
        ...f,
        email: user.email ?? f.email,
        firstName: parts[0] ?? f.firstName,
        lastName: parts.slice(1).join(' ') ?? f.lastName,
      }));
    }
  }, [user]);

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function validateCoupon() {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.discount) {
        setCouponDiscount(data.discount);
        setCouponApplied(true);
      } else {
        setCouponError(data.error ?? 'Invalid coupon code');
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  }

  const total = subtotal + SHIPPING - couponDiscount;

  function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !session) {
      openAuthModal('login');
      return;
    }
    if (items.length === 0) {
      setFormError('Your cart is empty.');
      return;
    }
    setFormError('');
    setSubmitting(true);

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: total,
          userId: user.id,
          email: form.email,
          name: `${form.firstName} ${form.lastName}`,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.id) throw new Error(orderData.error ?? 'Failed to create order');

      // 2. Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Failed to load Razorpay');

      // 3. Open Razorpay widget
      const rzp = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency ?? 'INR',
        name: 'Almas Jewels',
        description: 'Bridal Jewelry Order',
        order_id: orderData.id,
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#022c22' },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Confirm payment
          await fetch('/api/payment/success', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              email: form.email,
              name: `${form.firstName} ${form.lastName}`,
              shippingAddress: form,
              items: items.map((i) => ({
                id: i.product.id,
                name: i.product.name,
                price: i.product.price,
                quantity: i.quantity,
              })),
              amount: total,
              couponCode: couponApplied ? coupon : undefined,
              couponDiscount,
            }),
          });
          clearCart();
          router.push(`/success?orderId=${response.razorpay_order_id}`);
        },
      });

      rzp.on('payment.failed', async () => {
        await fetch('/api/payment/failed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: form.email,
            amount: total,
            razorpayOrderId: orderData.id,
          }),
        });
        setFormError('Payment failed. Please try again.');
        setSubmitting(false);
      });

      rzp.open();
      setSubmitting(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-gold-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="font-serif text-4xl text-emerald-950">Sign In to Checkout</h1>
        <p className="text-gray-500 font-sans text-sm text-center max-w-sm">
          Please sign in or create an account to complete your purchase securely.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => openAuthModal('login')}
            className="bg-emerald-950 text-white font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-emerald-900 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="border border-emerald-950 text-emerald-950 font-sans text-sm uppercase tracking-widest px-8 py-3 hover:bg-emerald-50 transition-colors"
          >
            Create Account
          </button>
        </div>
        <Link href="/cart" className="text-gold-600 text-xs font-sans hover:underline">
          ← Back to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-emerald-950 py-14 px-6 text-center">
        <h1 className="font-serif text-4xl text-white">Checkout</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ─── Shipping Form ─── */}
        <div>
          <h2 className="font-serif text-2xl text-emerald-950 mb-6">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  First Name *
                </label>
                <input
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-emerald-950"
                />
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Last Name *
                </label>
                <input
                  name="lastName"
                  required
                  value={form.lastName}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-emerald-950"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                Email *
              </label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleFormChange}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-emerald-950"
              />
            </div>
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                Phone *
              </label>
              <input
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleFormChange}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-emerald-950"
              />
            </div>
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                Address *
              </label>
              <input
                name="address"
                required
                value={form.address}
                onChange={handleFormChange}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-emerald-950"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  City *
                </label>
                <input
                  name="city"
                  required
                  value={form.city}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-emerald-950"
                />
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Postal Code *
                </label>
                <input
                  name="postalCode"
                  required
                  value={form.postalCode}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-emerald-950"
                />
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-3 text-red-600 text-sm font-sans">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-emerald-950 font-sans font-bold uppercase tracking-widest text-sm py-4 transition-colors',
                submitting && 'opacity-70 cursor-not-allowed'
              )}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Processing...' : 'Pay Now'}
            </button>
          </form>
        </div>

        {/* ─── Order Summary ─── */}
        <div>
          <h2 className="font-serif text-2xl text-emerald-950 mb-6">Order Summary</h2>
          <div className="bg-gray-50 border border-gray-100 p-6 space-y-4">
            {/* Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-xs text-emerald-950 line-clamp-1">{product.name}</p>
                    <p className="text-gray-400 text-xs font-sans">Qty: {quantity}</p>
                  </div>
                  <p className="text-sm font-sans font-bold text-emerald-950">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-sans uppercase tracking-wider text-gray-500 mb-2">
                Coupon Code
              </p>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setCouponError('');
                    if (couponApplied) {
                      setCouponApplied(false);
                      setCouponDiscount(0);
                    }
                  }}
                  placeholder="WELCOME10"
                  className="flex-1 border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-emerald-950 uppercase"
                />
                <button
                  onClick={validateCoupon}
                  disabled={couponLoading || couponApplied}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors',
                    couponApplied
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-emerald-950 text-white hover:bg-emerald-900'
                  )}
                >
                  <Tag size={12} />
                  {couponApplied ? 'Applied!' : couponLoading ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && (
                <p className="text-red-500 text-xs font-sans mt-1">{couponError}</p>
              )}
              {couponApplied && (
                <p className="text-emerald-600 text-xs font-sans mt-1">
                  Coupon applied! You save {formatPrice(couponDiscount)}.
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm font-sans">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>₹{SHIPPING}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>− {formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-emerald-950 text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
