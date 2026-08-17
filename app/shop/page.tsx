'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import {
  FALLBACK_PRODUCTS,
  CATEGORIES,
  STONE_COLORS,
  PLATINGS,
  PRICE_RANGES,
  type Product,
} from '@/lib/data';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function getOldPrice(price: number) {
  const pct = Math.floor(Math.random() * 21 + 40); // 40-60%
  return Math.round(price / (1 - pct / 100));
}

// stable old-price map so it doesn't flicker per render
const oldPriceCache = new Map<string, number>();
function stableOldPrice(id: string, price: number) {
  if (!oldPriceCache.has(id)) oldPriceCache.set(id, getOldPrice(price));
  return oldPriceCache.get(id)!;
}

function discountPct(price: number, oldPrice: number) {
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedCategory = searchParams.get('category') ?? '';
  const selectedColor = searchParams.get('color') ?? '';
  const selectedPlating = searchParams.get('plating') ?? '';
  const selectedPrice = searchParams.get('price') ?? '';
  const sortBy = searchParams.get('sort') ?? '';

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : FALLBACK_PRODUCTS))
      .catch(() => setProducts(FALLBACK_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  }

  function clearFilters() {
    router.push('/shop');
  }

  const filteredProducts = useCallback((): Product[] => {
    let list = [...products];

    if (selectedCategory)
      list = list.filter((p) => p.category === selectedCategory);
    if (selectedColor)
      list = list.filter((p) => p.stoneColor === selectedColor);
    if (selectedPlating)
      list = list.filter((p) => p.plating === selectedPlating);
    if (selectedPrice) {
      const range = PRICE_RANGES.find((r) => r.label === selectedPrice);
      if (range) list = list.filter((p) => p.price >= range.min && p.price <= range.max);
    }

    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, selectedCategory, selectedColor, selectedPlating, selectedPrice, sortBy]);

  // Lock scroll when mobile filter sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const displayed = filteredProducts();
  const hasFilters = !!(selectedCategory || selectedColor || selectedPlating || selectedPrice || sortBy);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Page header ─── */}
      <div className="bg-emerald-950 py-12 sm:py-16 px-4 sm:px-6 text-center">
        <p className="text-gold-400 uppercase tracking-widest text-xs font-sans mb-2 sm:mb-3">
          The Collection
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white">Shop Bridal Jewelry</h1>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Mobile filter & sort bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 border border-emerald-950 px-3.5 py-2 text-xs sm:text-sm font-sans uppercase tracking-wider text-emerald-950 bg-white hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={14} />
              Filters {hasFilters && '•'}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="border border-gray-300 px-2.5 py-2 text-xs sm:text-sm font-sans bg-white text-emerald-950 focus:outline-none focus:border-emerald-950"
            >
              <option value="">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm font-sans">{displayed.length} items</p>
        </div>

        <div className="flex gap-8">
          {/* ─── Sidebar ─── */}
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <FilterPanel
              selectedCategory={selectedCategory}
              selectedColor={selectedColor}
              selectedPlating={selectedPlating}
              selectedPrice={selectedPrice}
              sortBy={sortBy}
              setFilter={setFilter}
              clearFilters={clearFilters}
              hasFilters={hasFilters}
              count={displayed.length}
            />
          </aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative bg-white w-full max-w-xs h-full overflow-y-auto p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <h3 className="font-serif text-lg text-emerald-950">Filters</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-900"
                    aria-label="Close filters"
                  >
                    <X size={20} />
                  </button>
                </div>
                <FilterPanel
                  selectedCategory={selectedCategory}
                  selectedColor={selectedColor}
                  selectedPlating={selectedPlating}
                  selectedPrice={selectedPrice}
                  sortBy={sortBy}
                  setFilter={(k, v) => {
                    setFilter(k, v);
                  }}
                  clearFilters={() => {
                    clearFilters();
                  }}
                  hasFilters={hasFilters}
                  count={displayed.length}
                />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-full mt-8 bg-emerald-950 text-white font-sans text-xs uppercase tracking-widest py-3 hover:bg-emerald-900 transition-colors"
                >
                  View Results ({displayed.length})
                </button>
              </div>
            </div>
          )}

          {/* ─── Grid ─── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={36} className="animate-spin text-gold-500" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-400 font-sans text-lg">No products match your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-gold-600 underline text-sm font-sans"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {displayed.map((product) => {
                  const oldPrice = stableOldPrice(product.id, product.price);
                  const discount = discountPct(product.price, oldPrice);
                  const wished = isWishlisted(product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      oldPrice={oldPrice}
                      discount={discount}
                      wished={wished}
                      onWishlist={() => toggleWishlist(product.id)}
                      onAddToCart={() => addToCart(product)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterPanelProps {
  selectedCategory: string;
  selectedColor: string;
  selectedPlating: string;
  selectedPrice: string;
  sortBy: string;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  hasFilters: boolean;
  count: number;
}

function FilterPanel({
  selectedCategory,
  selectedColor,
  selectedPlating,
  selectedPrice,
  sortBy,
  setFilter,
  clearFilters,
  hasFilters,
  count,
}: FilterPanelProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="font-sans text-xs uppercase tracking-widest text-gray-500">{count} items</p>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gold-600 underline font-sans"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-emerald-950 font-semibold mb-3">
          Sort By
        </p>
        <div className="space-y-1">
          {[
            { v: '', l: 'Default' },
            { v: 'price_asc', l: 'Price: Low to High' },
            { v: 'price_desc', l: 'Price: High to Low' },
            { v: 'name', l: 'Name A-Z' },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setFilter('sort', v)}
              className={cn(
                'block w-full text-left text-sm font-sans px-2 py-1',
                sortBy === v ? 'text-gold-600 font-semibold' : 'text-gray-600 hover:text-emerald-950'
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-emerald-950 font-semibold mb-3">
          Category
        </p>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter('category', selectedCategory === cat ? '' : cat)}
              className={cn(
                'block w-full text-left text-sm font-sans px-2 py-1',
                selectedCategory === cat
                  ? 'text-gold-600 font-semibold'
                  : 'text-gray-600 hover:text-emerald-950'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stone Color */}
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-emerald-950 font-semibold mb-3">
          Stone Color
        </p>
        <div className="flex flex-wrap gap-2">
          {STONE_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setFilter('color', selectedColor === color ? '' : color)}
              className={cn(
                'px-3 py-1 text-xs font-sans border',
                selectedColor === color
                  ? 'bg-emerald-950 text-white border-emerald-950'
                  : 'border-gray-300 text-gray-600 hover:border-emerald-950'
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Plating */}
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-emerald-950 font-semibold mb-3">
          Plating
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATINGS.map((pl) => (
            <button
              key={pl}
              onClick={() => setFilter('plating', selectedPlating === pl ? '' : pl)}
              className={cn(
                'px-3 py-1 text-xs font-sans border',
                selectedPlating === pl
                  ? 'bg-emerald-950 text-white border-emerald-950'
                  : 'border-gray-300 text-gray-600 hover:border-emerald-950'
              )}
            >
              {pl}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="font-sans text-xs uppercase tracking-widest text-emerald-950 font-semibold mb-3">
          Price Range
        </p>
        <div className="space-y-1">
          {PRICE_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setFilter('price', selectedPrice === r.label ? '' : r.label)}
              className={cn(
                'block w-full text-left text-sm font-sans px-2 py-1',
                selectedPrice === r.label
                  ? 'text-gold-600 font-semibold'
                  : 'text-gray-600 hover:text-emerald-950'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  oldPrice: number;
  discount: number;
  wished: boolean;
  onWishlist: () => void;
  onAddToCart: () => void;
}

function ProductCard({ product, oldPrice, discount, wished, onWishlist }: ProductCardProps) {
  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden aspect-square bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 bg-gold-500 text-emerald-950 text-xs font-sans font-bold px-2 py-1 uppercase tracking-wide">
            {discount}% OFF
          </div>
        </div>
        <div className="pt-3 pb-1">
          <p className="text-xs text-gold-600 font-sans uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="font-serif text-sm text-emerald-950 leading-snug line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-emerald-950 font-sans font-bold text-sm">
              {formatPrice(product.price)}
            </span>
            <span className="text-gray-400 text-xs line-through font-sans">
              {formatPrice(oldPrice)}
            </span>
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          onWishlist();
        }}
        aria-label="Toggle wishlist"
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white transition-colors"
      >
        <Heart
          size={16}
          className={wished ? 'fill-red-500 text-red-500' : 'text-gray-400'}
        />
      </button>
    </div>
  );
}



export default function ShopPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" /></div>}>
      <ShopContent />
    </React.Suspense>
  );
}

