import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, User, LogOut, Instagram, Menu, X } from 'lucide-react';
import { WhatsAppIcon } from './icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function Layout() {
  const { cartCount } = useCart();
  const { user, signInWithGoogle, signOut } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-emerald-950 font-sans selection:bg-gold-500 selection:text-white flex flex-col">
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 lg:px-24 transition-all duration-300 border-b",
        isHome 
          ? (isScrolled || isMobileMenuOpen)
            ? "bg-emerald-950/95 backdrop-blur-md text-white shadow-md border-white/10" 
            : "bg-transparent text-white border-transparent"
          : "bg-emerald-950/95 backdrop-blur-md text-white shadow-md border-white/10"
      )}>
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="text-2xl font-serif font-bold tracking-widest uppercase shrink-0">
            Almas Bridal
          </Link>
        </div>
        
        {/* Center: Nav Links */}
        <div className="hidden md:flex flex-1 justify-center gap-10 text-sm uppercase tracking-widest font-medium">
          <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-gold-400 transition-colors">Shop Collection</Link>
          <Link to="/track" className="hover:text-gold-400 transition-colors">Track Order</Link>
        </div>
        
        {/* Right: Icons & Actions */}
        <div className="flex-1 flex justify-end items-center gap-4 md:gap-6">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                {user.email === 'faisal301196@gmail.com' && (
                  <Link to="/admin" className="text-xs font-light opacity-80 hover:opacity-100 hover:text-gold-400 transition-colors uppercase">
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="text-xs font-light opacity-80 hover:opacity-100 hover:text-gold-400 transition-colors truncate max-w-[100px]">
                  {user.displayName?.split(' ')[0]}
                </Link>
                <button onClick={signOut} className="hover:text-gold-400 transition-colors" title="Sign Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
              <Link to="/profile" className="md:hidden hover:text-gold-400 transition-colors shrink-0" title="My Profile">
                <User className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <button onClick={signInWithGoogle} className="hidden md:flex items-center gap-2 hover:text-gold-400 transition-colors duration-300 uppercase text-xs tracking-widest font-medium shrink-0">
                <User className="w-4 h-4" />
                Sign In
              </button>
              <button onClick={signInWithGoogle} className="md:hidden hover:text-gold-400 transition-colors shrink-0" title="Sign In">
                <User className="w-5 h-5" />
              </button>
            </>
          )}
          <Link to="/checkout" className="relative hover:text-gold-400 transition-colors shrink-0">
            <ShoppingBag className="w-5 h-5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 bg-gold-500 text-emerald-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-gold-400 transition-colors focus:outline-none shrink-0"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[73px] bottom-0 bg-emerald-950/98 backdrop-blur-md z-40 flex flex-col px-8 py-12 md:hidden"
          >
            <div className="flex flex-col gap-8 text-lg uppercase tracking-widest font-serif font-medium text-white/90">
              <Link to="/" className="hover:text-gold-400 transition-colors py-2 border-b border-white/5">Home</Link>
              <Link to="/shop" className="hover:text-gold-400 transition-colors py-2 border-b border-white/5">Shop Collection</Link>
              <Link to="/track" className="hover:text-gold-400 transition-colors py-2 border-b border-white/5">Track Order</Link>
              
              {user ? (
                <>
                  <Link to="/profile" className="hover:text-gold-400 transition-colors py-2 border-b border-white/5">
                    My Profile ({user.displayName?.split(' ')[0]})
                  </Link>
                  {user.email === 'faisal301196@gmail.com' && (
                    <Link to="/admin" className="hover:text-gold-400 transition-colors py-2 border-b border-white/5 text-gold-400">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 hover:text-gold-400 transition-colors py-2 text-left text-sm uppercase tracking-widest font-sans font-normal opacity-80 mt-4"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    signInWithGoogle();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 bg-gold-500 text-emerald-950 px-6 py-3 font-sans uppercase text-sm tracking-widest font-medium hover:bg-gold-400 transition-colors mt-4 justify-center"
                >
                  <User className="w-4 h-4" /> Sign In
                </button>
              )}
            </div>
            
            <div className="mt-auto pt-8 border-t border-white/5 flex flex-col gap-4 text-xs text-white/40 font-light">
              <div className="flex gap-4 justify-center">
                <a href="https://instagram.com/almasladiescorner" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  <span>@almasladiescorner</span>
                </a>
              </div>
              <p className="text-center">&copy; {new Date().getFullYear()} Almas Bridal.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <div className={cn(!isHome && "pt-[73px]")}>
          <Outlet />
        </div>
      </main>

      <footer className="bg-emerald-950 text-white pt-24 pb-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-20">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 text-gold-400">Found Your Dream Set?</h2>
              <p className="text-white/70 font-light mb-10 max-w-md text-lg">Let's customize your look. Reach out to our bridal stylists to discuss your requirements.</p>
              
              <form className="space-y-6 max-w-md" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <input type="text" placeholder="Your Name" className="w-full bg-transparent border-b border-white/30 py-3 text-white placeholder-white/50 focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div>
                  <input type="email" placeholder="Email Address" className="w-full bg-transparent border-b border-white/30 py-3 text-white placeholder-white/50 focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div>
                  <input type="text" placeholder="Wedding Date" className="w-full bg-transparent border-b border-white/30 py-3 text-white placeholder-white/50 focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <button type="button" className="bg-gold-500 hover:bg-gold-400 text-emerald-950 px-8 py-4 font-medium tracking-wide transition-all duration-300 flex-1">
                    Send Inquiry
                  </button>
                  <a href="https://wa.me/919973819387" target="_blank" rel="noopener noreferrer" className="border border-white/30 hover:border-white text-white px-8 py-4 font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group">
                    <WhatsAppIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    WhatsApp Us
                  </a>
                </div>
              </form>
            </div>

            <div className="lg:pl-20 lg:border-l border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold tracking-widest uppercase mb-8">Almas Bridal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-sm text-white/60 font-light">
                  <ul className="space-y-4">
                    <li><Link to="/shop" className="hover:text-gold-400 transition-colors">Shop All</Link></li>
                    <li><a href="#" className="hover:text-gold-400 transition-colors">Bridal Sets</a></li>
                    <li><a href="#" className="hover:text-gold-400 transition-colors">Necklaces</a></li>
                    <li><a href="#" className="hover:text-gold-400 transition-colors">Earrings</a></li>
                  </ul>
                  <ul className="space-y-4">
                    <li><a href="#" className="hover:text-gold-400 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-gold-400 transition-colors">Shipping Info</a></li>
                    <li><a href="#" className="hover:text-gold-400 transition-colors">Returns & Exchanges</a></li>
                    <li><a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
                  </ul>
                  <div className="space-y-4">
                    <h4 className="text-white font-medium mb-2">Visit Us</h4>
                    <p>Almas Ladies Corner<br/>Shop no.08, Block no.05,<br/>Churi Lane, Sakchi.,<br/>Jamshedpur, Jharkhand 831001</p>
                  </div>
                </div>
              </div>
              <div className="mt-16 flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-0 pt-8 border-t border-white/10 text-xs text-white/40 font-light">
                <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Almas Bridal. All rights reserved.</p>
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
                  <a href="https://instagram.com/almasladiescorner" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    <span>@almasladiescorner</span>
                  </a>
                  <a href="mailto:almasladiescornersakchi@gmail.com" className="hover:text-gold-400 transition-colors text-center">almasladiescornersakchi@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
