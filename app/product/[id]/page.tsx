'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Share2,
  ChevronDown,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { FALLBACK_PRODUCTS, type Product } from '@/lib/data';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-gray-200">
      <button
        className="w-full flex items-center justify-between py-4 text-left font-sans text-sm uppercase tracking-widest text-emerald-950 font-semibold"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <ChevronDown
          size={16}
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-gray-600 text-sm font-sans leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/products/${params.id}`)
      .then((r) => {
        if (r.status === 404) throw new Error('not found');
        return r.json();
      })
      .then((data: Product) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        // fallback to local data
        const found = FALLBACK_PRODUCTS.find((p) => p.id === params.id);
        if (found) {
          setProduct(found);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [params.id]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [product, quantity, addToCart]);

  function shareWhatsApp() {
    const url = `https://wa.me/?text=Check+out+${encodeURIComponent(product?.name ?? '')}+at+${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-gold-500" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="font-serif text-4xl text-emerald-950">Product Not Found</h1>
        <p className="text-gray-500 font-sans text-sm">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/shop"
          className="bg-emerald-950 text-white font-sans text-sm uppercase tracking-widest px-8 py-3"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = Array(5).fill(product.image);
  const wished = isWishlisted(product.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 px-4 sm:px-6 py-3 overflow-x-auto hide-scrollbar">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-sans text-gray-400 whitespace-nowrap">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-emerald-950 shrink-0">
            <ChevronLeft size={14} /> Back
          </button>
          <span>/</span>
          <Link href="/shop" className="hover:text-emerald-950 shrink-0">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-emerald-950 shrink-0">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-emerald-950 truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ─── LEFT: Gallery ─── */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Thumbnails - Desktop/Tablet */}
          <div className="hidden sm:flex flex-col gap-2 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  'w-16 h-16 overflow-hidden border-2 transition-colors',
                  activeImg === i ? 'border-gold-500' : 'border-transparent'
                )}
              >
                <img
                  src={img}
                  alt={`View ${i + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          {/* Main image */}
          <div className="flex-1 flex flex-col">
            <div
              className="relative overflow-hidden bg-gray-50 cursor-zoom-in aspect-square w-full"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              <img
                src={images[activeImg]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className={cn(
                  'w-full h-full object-cover transition-transform duration-300',
                  zoomed ? 'scale-110' : 'scale-100'
                )}
              />
            </div>
            {/* Mobile thumbnail dots/pills */}
            <div className="flex sm:hidden justify-center items-center gap-2 mt-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    activeImg === i ? 'bg-gold-500 w-6' : 'bg-gray-300'
                  )}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Details ─── */}
        <div className="flex flex-col gap-5 sm:gap-6">
          <div>
            <p className="text-gold-600 text-xs font-sans uppercase tracking-widest mb-1 sm:mb-2">
              {product.category}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-emerald-950 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
            <span className="font-serif text-2xl sm:text-3xl text-emerald-950">
              {formatPrice(product.price)}
            </span>
            <span className="text-gray-400 text-xs sm:text-sm font-sans line-through">
              {formatPrice(Math.round(product.price / 0.55))}
            </span>
            <span className="bg-gold-500 text-emerald-950 text-[10px] sm:text-xs font-sans font-bold px-2 py-0.5 uppercase">
              45% OFF
            </span>
          </div>

          <p className="text-gray-600 text-xs sm:text-sm font-sans leading-relaxed">{product.description}</p>

          {/* Attributes */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 sm:p-4">
            <div>
              <p className="text-[10px] sm:text-xs font-sans uppercase tracking-wider text-gray-400 mb-1">Stone Color</p>
              <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-950">{product.stoneColor}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-sans uppercase tracking-wider text-gray-400 mb-1">Plating</p>
              <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-950">{product.plating}</p>
            </div>
            {product.stock !== undefined && (
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] sm:text-xs font-sans uppercase tracking-wider text-gray-400 mb-1">Stock</p>
                <p className={cn('text-xs sm:text-sm font-sans font-semibold', product.stock < 5 ? 'text-red-500' : 'text-emerald-600')}>
                  {product.stock < 5 ? `Only ${product.stock} left!` : 'In Stock'}
                </p>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <p className="text-xs font-sans uppercase tracking-wider text-gray-500">Quantity</p>
            <div className="flex items-center border border-gray-300">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200"
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-sans font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>


          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-4 font-sans text-sm uppercase tracking-widest font-bold transition-colors',
                addedToCart
                  ? 'bg-emerald-900 text-white'
                  : 'bg-emerald-950 hover:bg-emerald-900 text-white'
              )}
            >
              <ShoppingBag size={16} />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label="Toggle wishlist"
              className={cn(
                'w-14 h-14 flex items-center justify-center border transition-colors',
                wished
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'border-gray-300 text-gray-400 hover:border-emerald-950'
              )}
            >
              <Heart size={18} className={wished ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* Share */}
          <div className="flex items-center gap-3">
            <Share2 size={14} className="text-gray-400" />
            <p className="text-xs font-sans text-gray-400 uppercase tracking-wider">Share:</p>
            <button
              onClick={shareWhatsApp}
              className="text-xs font-sans text-emerald-700 hover:underline uppercase tracking-wider"
            >
              WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="text-xs font-sans text-gray-500 hover:underline uppercase tracking-wider"
            >
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          {/* Accordions */}
          <div className="border-t border-gray-200">
            <Accordion title="Set Inclusions">
              <ul className="list-disc list-inside space-y-1">
                {product.inclusions.map((inc) => (
                  <li key={inc}>{inc}</li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Jewelry Care Tips">
              <ul className="space-y-2">
                <li>• Store in a dry, airtight jewelry box away from direct sunlight.</li>
                <li>• Avoid contact with perfumes, lotions, and water.</li>
                <li>• Gently wipe with a soft, dry cloth after each wear.</li>
                <li>• Remove before bathing, swimming, or exercising.</li>
                <li>• For polki and kundan pieces, avoid excessive rubbing.</li>
              </ul>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
