'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { FALLBACK_PRODUCTS, type Product } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => setAllProducts(Array.isArray(data) ? data : FALLBACK_PRODUCTS))
      .catch(() => setAllProducts(FALLBACK_PRODUCTS))
      .finally(() => setHydrated(true));
  }, []);

  // Hydrate cart items with latest product data from API if available
  const cartItems = items.map((item) => {
    const fresh = allProducts.find((p) => p.id === item.product.id);
    return { ...item, product: fresh ?? item.product };
  });

  const SHIPPING = 10;
  const total = cartTotal + SHIPPING;

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-gold-500" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <ShoppingBag size={64} className="text-gray-200" />
        <h1 className="font-serif text-4xl text-emerald-950">Your Cart is Empty</h1>
        <p className="text-gray-500 font-sans text-sm text-center max-w-xs">
          You haven&apos;t added any pieces yet. Explore our bridal collections to find your perfect match.
        </p>
        <Link
          href="/shop"
          className="bg-emerald-950 text-white font-sans text-sm uppercase tracking-widest px-10 py-4 hover:bg-emerald-900 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-emerald-950 py-14 px-6 text-center">
        <h1 className="font-serif text-4xl text-white">Your Cart</h1>
        <p className="text-white/50 font-sans text-sm mt-2">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ─── Cart Items ─── */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 border border-gray-100 p-4"
            >
              <Link href={`/product/${product.id}`} className="flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 md:w-28 md:h-28 object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-gold-600 text-xs font-sans uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <Link
                  href={`/product/${product.id}`}
                  className="font-serif text-emerald-950 text-sm md:text-base leading-snug hover:underline line-clamp-2"
                >
                  {product.name}
                </Link>
                <p className="text-gray-400 text-xs font-sans mt-1">
                  {product.stoneColor} · {product.plating}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xs font-sans font-semibold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-sans font-bold text-emerald-950 text-sm">
                  {formatPrice(product.price * quantity)}
                </p>
                {quantity > 1 && (
                  <p className="text-gray-400 text-xs font-sans">{formatPrice(product.price)} each</p>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <Link
              href="/shop"
              className="text-gold-600 text-xs font-sans uppercase tracking-wider hover:underline"
            >
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-gray-400 text-xs font-sans uppercase tracking-wider hover:text-red-400"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* ─── Order Summary ─── */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-100 p-6 sticky top-24">
            <h2 className="font-serif text-xl text-emerald-950 mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">₹{SHIPPING}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-emerald-950 text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full mt-6 bg-gold-500 hover:bg-gold-400 text-emerald-950 font-sans font-bold uppercase tracking-widest text-sm py-4 transition-colors"
            >
              Proceed to Checkout
            </button>
            <p className="text-gray-400 text-xs font-sans text-center mt-3">
              Secure checkout · GST included
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
