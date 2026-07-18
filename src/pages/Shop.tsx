import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Loader2, Heart } from 'lucide-react';
import { products as hardcodedProducts, Product, categories, stoneColors, platings, priceRanges } from '../data';
import { cn } from '../lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useWishlist } from '../context/WishlistContext';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      let pgProducts: Product[] = [];
      let fbProducts: Product[] = [];
      
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          pgProducts = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch products from API:", err);
      }
      
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        fbProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
      } catch (fbErr) {
        console.error("Failed to fetch from Firebase:", fbErr);
      }
      
      setDbProducts([...hardcodedProducts, ...pgProducts, ...fbProducts]);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const activeCategory = searchParams.get('category');
  const activeStone = searchParams.get('stone');
  const activePlating = searchParams.get('plating');
  const activePriceRange = searchParams.get('price');
  const activeSort = searchParams.get('sort') || 'featured';
  const activeSearch = searchParams.get('search')?.toLowerCase() || '';

  const filteredProducts = useMemo(() => {
    let result = dbProducts.filter(p => {
      if (activeSearch && !p.name.toLowerCase().includes(activeSearch)) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeStone && p.stoneColor !== activeStone) return false;
      if (activePlating && p.plating !== activePlating) return false;
      if (activePriceRange) {
        const range = priceRanges.find(r => r.label === activePriceRange);
        if (range) {
          if (p.price < range.min || p.price > range.max) return false;
        }
      }
      return true;
    });

    if (activeSort === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, activeStone, activePlating, activePriceRange, activeSort, activeSearch, dbProducts]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="pt-12 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-4">The Collection</h1>
        <div className="w-16 h-0.5 bg-gold-500 mx-auto mb-6"></div>
        <p className="text-gray-500 font-light max-w-2xl mx-auto">
          Explore our complete range of meticulously crafted artificial bridal jewelry.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Mobile Filter Toggle & Header */}
        <div className="lg:hidden flex items-center justify-between border-b border-emerald-950/20 pb-4">
          <button 
            className="flex items-center gap-2 text-emerald-950 font-medium tracking-wide text-sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4" /> Filter and sort
          </button>
          <span className="text-gray-500 text-sm font-light">{filteredProducts.length} products</span>
        </div>

        {/* Filters Sidebar */}
        <aside className={cn(
          "lg:w-64 flex-shrink-0 transition-all duration-300 overflow-hidden",
          isFilterOpen ? "max-h-[2000px] mt-6 lg:mt-0" : "max-h-0 lg:max-h-full"
        )}>
          <div className="grid grid-cols-2 lg:flex lg:flex-col gap-x-4 gap-y-8 lg:gap-y-10">
            {/* Sort Filter */}
            <div className="col-span-2 lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-950 mb-4">Sort By</h3>
              <select
                value={activeSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full border border-gray-200 p-3 bg-white text-gray-700 text-sm focus:outline-none focus:border-emerald-950 font-light"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-950 mb-4">Type</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => updateFilter('category', null)}
                  className={cn("block text-sm font-light text-left transition-colors", !activeCategory ? "text-gold-600 font-medium" : "text-gray-500 hover:text-emerald-950")}
                >
                  All Types
                </button>
                {categories.map(c => (
                  <button 
                    key={c}
                    onClick={() => updateFilter('category', c)}
                    className={cn("block text-sm font-light text-left transition-colors", activeCategory === c ? "text-gold-600 font-medium" : "text-gray-500 hover:text-emerald-950")}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Stone Color Filter */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-950 mb-4">Color</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => updateFilter('stone', null)}
                  className={cn("block text-sm font-light text-left transition-colors", !activeStone ? "text-gold-600 font-medium" : "text-gray-500 hover:text-emerald-950")}
                >
                  All Colors
                </button>
                {stoneColors.map(c => (
                  <button 
                    key={c}
                    onClick={() => updateFilter('stone', c)}
                    className={cn("block text-sm font-light text-left transition-colors", activeStone === c ? "text-gold-600 font-medium" : "text-gray-500 hover:text-emerald-950")}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-950 mb-4">Price Range</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => updateFilter('price', null)}
                  className={cn("block text-sm font-light text-left transition-colors", !activePriceRange ? "text-gold-600 font-medium" : "text-gray-500 hover:text-emerald-950")}
                >
                  All Prices
                </button>
                {priceRanges.map(pr => (
                  <button 
                    key={pr.label}
                    onClick={() => updateFilter('price', pr.label)}
                    className={cn("block text-sm font-light text-left transition-colors", activePriceRange === pr.label ? "text-gold-600 font-medium" : "text-gray-500 hover:text-emerald-950")}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Plating Filter */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-950 mb-4">Plating</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => updateFilter('plating', null)}
                  className={cn("block text-sm font-light text-left transition-colors", !activePlating ? "text-gold-600 font-medium" : "text-gray-500 hover:text-emerald-950")}
                >
                  All Platings
                </button>
                {platings.map(p => (
                  <button 
                    key={p}
                    onClick={() => updateFilter('plating', p)}
                    className={cn("block text-sm font-light text-left transition-colors", activePlating === p ? "text-gold-600 font-medium" : "text-gray-500 hover:text-emerald-950")}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden lg:flex items-center justify-between mb-8">
            <h2 className="text-xl font-serif text-emerald-950">Collection</h2>
            <span className="text-gray-500 font-light text-sm">{filteredProducts.length} products</span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-light">
              No products found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
              {filteredProducts.map((product, idx) => {
                const discount = 40 + (String(product.id).charCodeAt(0) % 20);
                const oldPrice = Math.round(product.price / (1 - discount / 100));
                return (
                <motion.div 
                  key={product.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={fadeInUp}
                  className="group relative"
                >
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className="absolute top-2 right-2 md:top-4 md:right-4 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-emerald-950 hover:bg-white transition-colors shadow-sm"
                  >
                    <Heart className={cn("w-4 h-4 md:w-5 md:h-5 transition-all duration-300", isInWishlist(product.id) ? "fill-gold-500 text-gold-500" : "hover:scale-110")} />
                  </button>
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="overflow-hidden aspect-[4/5] relative mb-3 md:mb-4 bg-gray-100 rounded-lg md:rounded-xl">
                      <div className="absolute inset-0 bg-emerald-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 bg-emerald-950/80 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm font-medium tracking-wide">
                        -{discount}%
                      </div>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="text-center px-1 md:px-2">
                      <h3 className="text-xs md:text-base font-serif text-emerald-950 mb-1 group-hover:text-gold-600 transition-colors truncate">{product.name}</h3>
                      <div className="flex flex-col items-center gap-0.5 md:gap-1 mt-1 md:mt-2">
                        <span className="text-[11px] md:text-sm text-gray-500 line-through decoration-gray-400">Rs. {oldPrice.toLocaleString('en-IN')}.00</span>
                        <span className="text-sm md:text-lg text-emerald-900 font-semibold tracking-wide">Rs. {product.price.toLocaleString('en-IN')}.00</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
