import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Minus, ArrowLeft, Check, Instagram, Link2, Loader2, Heart } from 'lucide-react';
import { WhatsAppIcon } from '../components/icons';
const royalCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg';
const solitaireCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg';
const occasionCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg';
const pendantMainImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277893/almas_bridal/assets/panbrhgotshii2pl5zkb.jpg';
const pendantSub1Img = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277895/almas_bridal/assets/blteocmlx1mlsl7qtzx0.jpg';
const pendantSub2Img = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277897/almas_bridal/assets/uffidivwpwv2wicg7m71.jpg';
const pendantSub3Img = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277900/almas_bridal/assets/e5g5yagqr1ksbakallnl.jpg';


const imageMap: Record<string, string> = {
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg': royalCollectionImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg': solitaireCollectionImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg': occasionCollectionImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277893/almas_bridal/assets/panbrhgotshii2pl5zkb.jpg': pendantMainImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277895/almas_bridal/assets/blteocmlx1mlsl7qtzx0.jpg': pendantSub1Img,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277897/almas_bridal/assets/uffidivwpwv2wicg7m71.jpg': pendantSub2Img,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277900/almas_bridal/assets/e5g5yagqr1ksbakallnl.jpg': pendantSub3Img,

};

import { Product } from '../data';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { cn } from '../lib/utils';
import { fetchProductById } from '../lib/productsService';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('inclusions');
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setMainImage(product.image);
    }
  }, [product]);

  const [isAdded, setIsAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const getDescriptionBullets = (desc: string) => {
    if (!desc) return [];
    if (desc.includes('\n')) {
      return desc.split('\n').map(s => s.trim()).filter(Boolean);
    }
    const colonSplit = desc.split(/(?=[A-Z][a-zA-Z0-9\s\-]{2,35}:)/).map(s => s.trim()).filter(Boolean);
    if (colonSplit.length > 1) {
      return colonSplit;
    }
    const sentences = desc.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
    if (sentences.length > 1) {
      return sentences;
    }
    return [desc];
  };

  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      if (!id) return;
      try {
        const prod = await fetchProductById(id);
        if (isMounted && prod) {
          setProduct(prod);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="pt-20 pb-24 flex justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 pb-24 text-center min-h-[60vh]">
        <h2 className="text-2xl font-serif text-emerald-950 mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-gold-600 hover:text-gold-500 underline underline-offset-4">Return to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(prev => prev === section ? null : section);
  };

  return (
    <div className="pt-12 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm uppercase tracking-widest text-gray-500 hover:text-emerald-950 transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/5] bg-gray-100 overflow-hidden relative cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <img 
              src={mainImage || product.image} 
              alt={product.name} 
              className={cn(
                "w-full h-full object-cover transition-transform duration-300 ease-out origin-center",
                isHovering && "scale-[2]"
              )}
              style={{
                transformOrigin: isHovering ? `${mousePos.x}% ${mousePos.y}%` : 'center center'
              }}
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {/* Thumbnail placeholders */}
          <div className="grid grid-cols-5 gap-2">
            {(product.name.includes("Rubans Pendant") 
              ? [
                  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277879/almas_bridal/assets/dwicfvexas9ouzwhu56z.jpg', 
                  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277878/almas_bridal/assets/je12xqrwjpdebpjmz6nx.jpg', 
                  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277880/almas_bridal/assets/p6ubeaiczadlglie4blr.jpg', 
                  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277881/almas_bridal/assets/bbzpw89ilrymnvsx399q.jpg', 
                  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277877/almas_bridal/assets/daitayklpsxz51ig2kma.jpg'
                ]
              : [product.image, product.image, product.image, product.image, product.image]
            ).map((img, i) => (
              <div key={i} onClick={() => setMainImage(img)} className={`aspect-square bg-gray-200 overflow-hidden cursor-pointer transition-opacity group ${mainImage === img ? 'ring-2 ring-emerald-950 opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                <img src={img} alt={`${product.name} view ${i}`} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-sm text-gold-600 uppercase tracking-widest font-medium mb-4">{product.category}</p>
            <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6 leading-tight">{product.name}</h1>
            <p className="text-2xl text-emerald-900 mb-8">₹{product.price.toLocaleString('en-IN')}</p>
            
            {(() => {
              const bullets = getDescriptionBullets(product.description);
              const hasMore = bullets.length > 2;
              const visibleBullets = isDescExpanded ? bullets : bullets.slice(0, 2);

              return (
                <div className="mb-10 font-sans">
                  <ul className="space-y-2.5 text-gray-600 font-light text-sm leading-relaxed list-disc pl-5">
                    {visibleBullets.map((bullet, idx) => {
                      const colonIndex = bullet.indexOf(':');
                      let title = '';
                      let body = bullet;
                      if (colonIndex > 0 && colonIndex <= 45) {
                        title = bullet.slice(0, colonIndex + 1);
                        body = bullet.slice(colonIndex + 1);
                      }
                      return (
                        <li key={idx} className="marker:text-gold-500">
                          {title && <strong className="font-medium text-emerald-950 mr-1">{title}</strong>}
                          <span>{body}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="mt-3 text-xs uppercase tracking-widest font-medium text-gold-600 hover:text-gold-700 transition-colors inline-flex items-center gap-1 py-1"
                    >
                      <span>{isDescExpanded ? 'See Less' : 'See More'}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-300",
                          isDescExpanded ? "rotate-180" : "rotate-0"
                        )}
                      />
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Attributes */}
            <div className="grid grid-cols-2 gap-6 mb-10 border-y border-emerald-950/10 py-6">
              <div>
                <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Stone Color</span>
                <span className="text-emerald-950 font-medium">{product.stoneColor}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Plating</span>
                <span className="text-emerald-950 font-medium">{product.plating}</span>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <div className="flex items-center border border-emerald-950/20 px-4 py-4 w-full sm:w-32 justify-between">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-500 hover:text-emerald-950"><Minus className="w-4 h-4" /></button>
                <span className="font-medium text-emerald-950">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-gray-500 hover:text-emerald-950"><Plus className="w-4 h-4" /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={isAdded}
                className={cn(
                  "flex-1 py-4 uppercase tracking-widest font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2",
                  isAdded ? "bg-emerald-900 text-white" : "bg-gold-500 hover:bg-gold-400 text-emerald-950"
                )}
              >
                {isAdded ? (
                  <><Check className="w-5 h-5" /> Added to Cart</>
                ) : (
                  'Add to Cart'
                )}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className="flex items-center justify-center w-full sm:w-16 h-14 border border-emerald-950/20 text-emerald-950 hover:bg-emerald-50 transition-colors shrink-0"
                title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={cn("w-5 h-5", isInWishlist(product.id) ? "fill-gold-500 text-gold-500" : "")} />
              </button>
            </div>

            {/* Share */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <span className="text-xs uppercase tracking-widest text-gray-400">Share:</span>
              <button 
                onClick={() => {
                  const text = `Check out this beautiful jewelry piece from Almas Jewels: ${product.name} - ₹${product.price.toLocaleString('en-IN')}\n\n${window.location.href}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-950/20 text-emerald-950 hover:bg-gold-100 hover:border-gold-300 transition-colors"
                title="Share on WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
              <button 
                onClick={() => {
                  window.open(`https://www.instagram.com/almasladiescorner`, '_blank');
                }}
                className="w-10 h-10 rounded-full border border-emerald-950/20 flex items-center justify-center text-emerald-950 hover:bg-gold-100 hover:border-gold-300 transition-colors"
                title="Visit our Instagram"
              >
                <Instagram className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-950/20 text-emerald-950 hover:bg-gold-100 hover:border-gold-300 transition-colors"
                title="Copy Link"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
                <span className="text-sm font-medium">{isCopied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Accordions */}
            <div className="space-y-4">
              {/* Inclusions Accordion */}
              <div className="border-b border-emerald-950/10">
                <button 
                  onClick={() => toggleAccordion('inclusions')}
                  className="w-full flex items-center justify-between py-4 text-left font-serif text-lg text-emerald-950"
                >
                  Set Inclusions
                  <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", activeAccordion === 'inclusions' && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'inclusions' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="pb-6 pl-4 space-y-2 text-gray-600 font-light list-disc">
                        {(product.inclusions || []).map((inc, i) => (
                          <li key={i}>{inc}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Care Tips Accordion */}
              <div className="border-b border-emerald-950/10">
                <button 
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex items-center justify-between py-4 text-left font-serif text-lg text-emerald-950"
                >
                  Jewelry Care Tips
                  <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", activeAccordion === 'care' && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'care' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-gray-600 font-light space-y-3">
                        <p>To preserve the brilliance and plating of your artificial jewelry:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Keep away from moisture, perfumes, and harsh chemicals.</li>
                          <li>Store in the provided velvet box or a ziplock pouch after use.</li>
                          <li>Wipe with a soft, dry cloth after wearing to remove oils.</li>
                          <li>Wear your jewelry last, after makeup and hair spray.</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
