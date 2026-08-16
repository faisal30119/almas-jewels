'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Package, Heart, User, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { FALLBACK_PRODUCTS, type Product } from '@/lib/data';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type OrderStatus = string;

interface Order {
  id: string;
  order_id: string;
  amount: number;
  status: OrderStatus;
  items: { id: string; name: string; price: number; quantity: number }[];
  shipping_address: Record<string, string>;
  created_at: string;
}

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusColor(s: string): string {
  const l = s.toLowerCase();
  if (l === 'delivered') return 'bg-emerald-50 text-emerald-700';
  if (l === 'cancelled' || l === 'failed') return 'bg-red-50 text-red-600';
  if (l === 'shipped' || l === 'out for delivery') return 'bg-indigo-50 text-indigo-700';
  return 'bg-amber-50 text-amber-700';
}

type Tab = 'orders' | 'wishlist' | 'account';

export default function ProfilePage() {
  const router = useRouter();
  const { user, session, loading: authLoading, openAuthModal, signOut, resetPassword } = useAuth();
  const { wishlist } = useWishlist();

  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch orders
  useEffect(() => {
    if (!user || !session) return;
    setOrdersLoading(true);
    supabase
      .from('user_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setOrdersLoading(false);
      });
  }, [user, session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch wishlist products
  useEffect(() => {
    if (!user || wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setWishlistLoading(true);
    const fromFallback = FALLBACK_PRODUCTS.filter((p) => wishlist.includes(p.id));
    const missingIds = wishlist.filter((id) => !fromFallback.find((p) => p.id === id));
    if (missingIds.length === 0) {
      setWishlistProducts(fromFallback);
      setWishlistLoading(false);
    } else {
      fetch('/api/products')
        .then((r) => r.json())
        .then((data: Product[]) => {
          const all = Array.isArray(data) ? data : FALLBACK_PRODUCTS;
          setWishlistProducts(all.filter((p) => wishlist.includes(p.id)));
        })
        .catch(() => setWishlistProducts(fromFallback))
        .finally(() => setWishlistLoading(false));
    }
  }, [user, wishlist]);

  async function handleCancelOrder(order: Order) {
    if (!session) return;
    setCancellingId(order.id);
    try {
      await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orderId: order.order_id, userId: user?.id }),
      });
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' } : o))
      );
    } finally {
      setCancellingId(null);
    }
  }

  async function handleResetPassword() {
    if (!user?.email) return;
    await resetPassword(user.email);
    setResetSent(true);
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
        <h1 className="font-serif text-4xl text-emerald-950">My Account</h1>
        <p className="text-gray-500 font-sans text-sm text-center max-w-sm">
          Sign in to view your orders, wishlist, and account settings.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => openAuthModal('login')}
            className="bg-emerald-950 text-white font-sans text-sm uppercase tracking-widest px-8 py-3"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="border border-emerald-950 text-emerald-950 font-sans text-sm uppercase tracking-widest px-8 py-3"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? user.email ?? 'Customer';

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-emerald-950 py-14 px-6 text-center">
        <p className="text-gold-400 text-xs uppercase tracking-widest font-sans mb-2">
          Welcome back
        </p>
        <h1 className="font-serif text-4xl text-white">{displayName}</h1>
        <p className="text-white/50 text-sm font-sans mt-1">{user.email}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 flex">
          {(
            [
              { key: 'orders', icon: <Package size={16} />, label: 'Orders' },
              { key: 'wishlist', icon: <Heart size={16} />, label: 'Wishlist' },
              { key: 'account', icon: <User size={16} />, label: 'Account' },
            ] as { key: Tab; icon: React.ReactNode; label: string }[]
          ).map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-xs font-sans uppercase tracking-widest border-b-2 transition-colors',
                tab === key
                  ? 'border-gold-500 text-emerald-950 font-semibold'
                  : 'border-transparent text-gray-400 hover:text-emerald-950'
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* ─── ORDERS TAB ─── */}
        {tab === 'orders' && (
          <div>
            <h2 className="font-serif text-2xl text-emerald-950 mb-6">My Orders</h2>
            {ordersLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={28} className="animate-spin text-gold-500" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Package size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-sans text-sm">No orders yet.</p>
                <Link
                  href="/shop"
                  className="mt-4 inline-block text-gold-600 text-xs font-sans underline"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <p className="text-xs font-sans text-gray-400 uppercase tracking-wider mb-1">
                          Order ID
                        </p>
                        <p className="font-sans text-sm text-emerald-950 font-semibold break-all">
                          {order.order_id}
                        </p>
                        <p className="text-gray-400 text-xs font-sans mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'text-xs font-sans uppercase tracking-wider px-3 py-1',
                            statusColor(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                        <p className="font-sans font-bold text-emerald-950 text-sm">
                          {formatPrice(order.amount)}
                        </p>
                      </div>
                    </div>
                    {Array.isArray(order.items) && order.items.length > 0 && (
                      <ul className="text-xs font-sans text-gray-500 space-y-1 mb-3">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-3">
                      <Link
                        href={`/track?orderId=${order.order_id}`}
                        className="text-xs font-sans text-gold-600 hover:underline uppercase tracking-wider"
                      >
                        Track Order
                      </Link>
                      {order.status.toLowerCase() !== 'cancelled' &&
                        order.status.toLowerCase() !== 'delivered' &&
                        order.status.toLowerCase() !== 'failed' && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          disabled={cancellingId === order.id}
                          className="text-xs font-sans text-red-400 hover:underline uppercase tracking-wider"
                        >
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── WISHLIST TAB ─── */}
        {tab === 'wishlist' && (
          <div>
            <h2 className="font-serif text-2xl text-emerald-950 mb-6">My Wishlist</h2>
            {wishlistLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={28} className="animate-spin text-gold-500" />
              </div>
            ) : wishlistProducts.length === 0 ? (
              <div className="text-center py-16">
                <Heart size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-sans text-sm">Your wishlist is empty.</p>
                <Link
                  href="/shop"
                  className="mt-4 inline-block text-gold-600 text-xs font-sans underline"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {wishlistProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group block border border-gray-100 hover:border-gold-500 transition-colors"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-serif text-xs text-emerald-950 line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-gold-600 text-xs font-sans font-bold mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ACCOUNT TAB ─── */}
        {tab === 'account' && (
          <div className="max-w-md">
            <h2 className="font-serif text-2xl text-emerald-950 mb-6">Account & Security</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-5">
                <p className="text-xs font-sans uppercase tracking-wider text-gray-400 mb-3">
                  Profile
                </p>
                <div className="space-y-2 text-sm font-sans">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="text-emerald-950 font-semibold">{displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-emerald-950">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5">
                <p className="text-xs font-sans uppercase tracking-wider text-gray-400 mb-3">
                  Security
                </p>
                {resetSent ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-sans">
                    <CheckCircle size={16} />
                    Password reset email sent! Check your inbox.
                  </div>
                ) : (
                  <button
                    onClick={handleResetPassword}
                    className="text-sm font-sans text-gold-600 hover:underline uppercase tracking-wider"
                  >
                    Send Password Reset Email
                  </button>
                )}
              </div>

              <button
                onClick={() => signOut().then(() => router.push('/'))}
                className="w-full border border-red-200 text-red-500 font-sans text-xs uppercase tracking-widest py-3 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
