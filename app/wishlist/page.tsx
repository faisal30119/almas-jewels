'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/lib/data';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { wishlist: wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal('login');
      router.replace('/shop');
    }
  }, [user, authLoading, openAuthModal, router]);

  // Fetch all products and filter by wishlist IDs
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch('/api/products')
      .then((r) => r.json())
      .then((all: Product[]) => {
        const wished = all.filter((p: Product) => wishlistIds.includes(p.id));
        setProducts(wished);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user, wishlistIds]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-emerald-950" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 md:px-16 border-b border-gray-100">
        <p className="font-sans text-xs uppercase tracking-widest text-gold-600 mb-3">
          Your Collection
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-emerald-950">Wishlist</h1>
        <p className="text-gray-500 font-sans text-sm mt-3">
          {wishlistIds.length} saved {wishlistIds.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      <div className="px-6 md:px-16 py-16 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-emerald-950" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <Heart size={28} className="text-gray-300" />
            </div>
            <p className="font-serif text-2xl text-emerald-950 mb-3">Your wishlist is empty</p>
            <p className="text-gray-500 font-sans text-sm mb-8">
              Explore our collections and save your favourite pieces.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-emerald-950 text-white font-sans text-xs uppercase tracking-widest px-8 py-4 hover:bg-emerald-900 transition-colors"
            >
              Browse Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden bg-gray-50 aspect-square mb-4">
                    <Link href={`/product/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Remove from wishlist */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Remove from wishlist"
                      className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <p className="text-xs font-sans uppercase tracking-widest text-gray-400">
                      {product.category}
                    </p>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-serif text-base text-emerald-950 leading-tight hover:text-gold-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="font-sans text-sm font-semibold text-emerald-950">
                      {formatPrice(product.price)}
                    </p>

                    {/* Add to cart */}
                    <button
                      onClick={() => {
                        addToCart(product);
                        toggleWishlist(product.id);
                      }}
                      className="w-full flex items-center justify-center gap-2 border border-emerald-950 text-emerald-950 font-sans text-xs uppercase tracking-widest py-3 hover:bg-emerald-950 hover:text-white transition-colors mt-3"
                    >
                      <ShoppingCart size={14} />
                      Move to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
