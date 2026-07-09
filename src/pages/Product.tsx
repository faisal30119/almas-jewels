import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Minus, ArrowLeft, Check } from 'lucide-react';
import { products } from '../data';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('inclusions');
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center min-h-[60vh]">
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

  const toggleAccordion = (section: string) => {
    setActiveAccordion(prev => prev === section ? null : section);
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
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
            className="aspect-[4/5] bg-gray-100 overflow-hidden"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          {/* Thumbnail placeholders */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 overflow-hidden opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                <img src={product.image} alt={`${product.name} view ${i}`} className="w-full h-full object-cover" />
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
            
            <p className="text-gray-600 font-light leading-relaxed mb-10">
              {product.description}
            </p>

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
                        {product.inclusions.map((inc, i) => (
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
