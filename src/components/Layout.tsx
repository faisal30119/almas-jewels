import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, User, LogOut, Instagram, Menu, X, Check, Search } from 'lucide-react';
import { WhatsAppIcon } from './icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Layout() {
  const { cartCount } = useCart();
  const { user, signInWithGoogle, signOut } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReturnPolicyOpen, setIsReturnPolicyOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val) {
      const params = new URLSearchParams(location.search);
      params.set('search', val);
      navigate(`/shop?${params.toString()}`);
    } else {
      if (location.pathname === '/shop') {
        const params = new URLSearchParams(location.search);
        params.delete('search');
        navigate(`/shop?${params.toString()}`);
      }
    }
  };

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
    <>
      <div className="min-h-screen bg-[#FAFAFA] text-emerald-950 font-sans selection:bg-gold-500 selection:text-white flex flex-col">
        <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 md:px-12 lg:px-24 transition-all duration-300 border-b gap-2",
        isHome 
          ? (isScrolled || isMobileMenuOpen)
            ? "bg-emerald-950/95 backdrop-blur-md text-white shadow-md border-white/10" 
            : "bg-transparent text-white border-transparent"
          : "bg-emerald-950/95 backdrop-blur-md text-white shadow-md border-white/10"
      )}>
        {/* Left: Logo */}
        <div className={cn("flex justify-start transition-all duration-300", isSearchOpen ? "hidden lg:flex lg:flex-1 pr-2" : "flex-1 pr-2")}>
          <Link to="/" className="text-lg sm:text-xl lg:text-2xl font-serif font-bold tracking-widest uppercase whitespace-nowrap shrink-0">
            Almas Jewels
          </Link>
        </div>
        
        {/* Center: Nav Links */}
        <div className="hidden md:flex flex-[2] lg:flex-1 justify-center gap-4 lg:gap-10 text-xs lg:text-sm uppercase tracking-widest font-medium">
          <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-gold-400 transition-colors whitespace-nowrap">Shop Collection</Link>
          <Link to="/track" className="hover:text-gold-400 transition-colors whitespace-nowrap">Track Order</Link>
        </div>
        
        {/* Right: Icons & Actions */}
        <div className="flex flex-1 justify-end items-center gap-3 lg:gap-6">
          <div className="relative flex items-center h-6">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div
                  key="search-input"
                  initial={{ maxWidth: 0, opacity: 0 }}
                  animate={{ maxWidth: 250, opacity: 1 }}
                  exit={{ maxWidth: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-[100px] sm:w-[140px] md:w-[200px] overflow-hidden flex items-center"
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full bg-transparent border-b border-white/30 focus:border-gold-400 text-sm text-white placeholder:text-white/50 px-1 py-1 pr-6 outline-none transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      if (searchQuery) {
                        setSearchQuery('');
                        if (location.pathname === '/shop') {
                          const params = new URLSearchParams(location.search);
                          params.delete('search');
                          navigate(`/shop?${params.toString()}`);
                        }
                      }
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="search-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="hover:text-gold-400 transition-colors shrink-0"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          {user ? (
            <div className="flex items-center gap-3 md:gap-4">
              {user.email === 'faisal301196@gmail.com' && (
                <Link to="/admin" className="hidden md:block text-xs font-light opacity-80 hover:opacity-100 hover:text-gold-400 transition-colors uppercase">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="text-sm font-light opacity-80 hover:opacity-100 hover:text-gold-400 transition-colors truncate max-w-[80px] sm:max-w-[100px]" title="My Profile">
                {user.displayName?.split(' ')[0] || 'User'}
              </Link>
              <button onClick={signOut} className="hidden md:block hover:text-gold-400 transition-colors" title="Sign Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={async () => {
              try {
                await signInWithGoogle();
              } catch (e) {}
            }} className="flex items-center gap-2 hover:text-gold-400 transition-colors duration-300 uppercase text-xs sm:text-sm tracking-widest font-medium shrink-0" title="Sign In">
              <span className="hidden sm:inline">Sign In</span>
              <User className="w-5 h-5 sm:hidden" />
            </button>
          )}
          <Link to="/cart" className="relative hover:text-gold-400 transition-colors shrink-0">
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
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (e) {}
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
              <p className="text-center">&copy; {new Date().getFullYear()} Almas Jewels.</p>
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
          <div className="mb-20">
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold tracking-widest uppercase mb-8">Almas Jewels</h3>
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
                    <li><button onClick={() => setIsReturnPolicyOpen(true)} className="hover:text-gold-400 transition-colors">Returns & Exchanges</button></li>
                    <li><a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
                  </ul>
                  <div className="space-y-4">
                    <h4 className="text-white font-medium mb-2">Visit Us</h4>
                    <p>Almas Ladies Corner<br/>Shop no.08, Block no.05,<br/>Churi Lane, Sakchi.,<br/>Jamshedpur, Jharkhand 831001</p>
                  </div>
                </div>
              </div>
              <div className="mt-16 flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-0 pt-8 border-t border-white/10 text-xs text-white/40 font-light">
                <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Almas Jewels. All rights reserved.</p>
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
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/919973819387" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-8 h-8" />
        <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm py-2 px-4 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Need help? Chat with us
        </span>
      </a>

      {/* Return & Exchange Policy Modal */}
      <AnimatePresence>
        {isReturnPolicyOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm"
              onClick={() => setIsReturnPolicyOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-serif text-emerald-950">RETURN OR EXCHANGE POLICY</h2>
                <button 
                  onClick={() => setIsReturnPolicyOpen(false)}
                  className="text-gray-400 hover:text-emerald-950 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar text-gray-600 text-sm leading-relaxed space-y-6">
                <p>
                  We have a <strong className="text-emerald-950">3 Day Return/Exchange policy</strong>, which means you have 3 Days from the date of delivery to register an order return/exchange. Return window will be automatically closed after 3 days. 
                </p>
                <p>
                  You can mail us @ <a href="mailto:almasladiescornersakchi@gmail.com" className="text-emerald-900 font-medium hover:underline">almasladiescornersakchi@gmail.com</a> or WhatsApp us @ <a href="https://wa.me/919973819387" className="text-emerald-900 font-medium hover:underline">+91 99738-19387</a> for the return/exchange request.
                </p>
                <p className="font-medium text-emerald-950 bg-emerald-50 p-4 rounded-md">
                  Refund will be issued as Store Credit in the form of Coupon Code only. 
                </p>
                
                <div>
                  <h3 className="font-semibold text-emerald-950 mb-3 text-base">Please note:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong className="text-emerald-950">UNBOXING VIDEO*</strong> is mandatory in case of any Return/Exchange request.</li>
                    <li><strong className="text-emerald-950">WE CANNOT ARRANGE A RETURN PICKUP FOR YOU UNLESS YOU HAVE RECEIVED A DAMAGED OR WRONG PRODUCT.</strong></li>
                    <li>Products purchased during ANY SALE is <strong className="text-emerald-950">NON-REFUNDABLE</strong>. You can only exchange it with some other product or ask for a coupon code of the same value you have paid.</li>
                    <li>The to and fro courier cost will be borne by you if you wish to return the product. Additionally, there is a shipping fee of ₹100/- for sending the product from our side, which you will need to bear.</li>
                    <li>For exchange we shall provide you with a unique code once we receive the order back at our warehouse. We shall only provide the value paid for the product returned and not any shipping if applicable. This process can take up to 10 working days upon receiving your order back at our warehouse.</li>
                    <li>Kindly allow 5-7 days from the delivery date for the returns to be processed and the Coupon Code/ Credit Note to be shared with you.</li>
                    <li><strong>PLEASE NOTE: WE DO NOT HAVE ANY REFUND POLICY. PLEASE REFRAIN FROM IMPULSIVE BUYING.</strong></li>
                    <li>Payments made with COD option / Prepaid Option WILL RECEIVE A COUPON CODE WORTH THE SAME AMOUNT AS YOUR PRODUCT VALUE. NO REFUND ON COD OR PREPAID ORDERS.</li>
                    <li>Please return your products unused in the same condition as you received it. If the products are found to be used or damaged we will not be able to refund your money or help you with exchange.</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-5 rounded-md border border-gray-100">
                  <h3 className="font-semibold text-emerald-950 mb-2">Customer Support Hours</h3>
                  <p className="mb-2">Feel free to get in touch with us if you have any doubts or you want further assistance by emailing us at <a href="mailto:almasladiescornersakchi@gmail.com" className="text-emerald-900 font-medium hover:underline">almasladiescornersakchi@gmail.com</a> or send us a message on WhatsApp <a href="https://wa.me/919973819387" className="text-emerald-900 font-medium hover:underline">+91 9973819387</a>.</p>
                  <p className="mb-2">All your queries will be solved between <strong className="text-emerald-950">Monday-Saturday, 11:00am-5:00pm</strong>. All pending queries will be solved the next day.</p>
                  <p className="text-red-600 font-medium">We do not work on SUNDAY or on National Holidays.</p>
                  <p className="mt-3 font-medium text-emerald-950 uppercase text-xs tracking-wider">We cannot help you on Instagram DM or Facebook Message for all order related queries. Kindly Whatsapp us or email us with your query.</p>
                  <p className="mt-2 text-sm italic">We request you to keep all your communication with us either on email, or on WhatsApp for all your order related queries.</p>
                </div>

                <p className="font-medium text-emerald-950">
                  Cancellations will only be possible till the order has not been dispatched from our warehouse. 
                </p>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-semibold text-emerald-950 mb-3 text-base">*Ensure that the following address is securely pasted on the return package along with your Full Name and Order ID*</h3>
                  <div className="bg-emerald-950 text-white p-5 rounded-md text-sm leading-relaxed font-light">
                    <strong className="block text-gold-400 text-lg mb-2 font-serif">Almas Jewels</strong>
                    Almas Ladies Corner<br/>
                    Shop no.08, Block no.05,<br/>
                    Churi Lane, Sakchi.,<br/>
                    Jamshedpur, Jharkhand 831001<br/><br/>
                    <span className="text-gold-400">Phone Number:</span> +91 99738-19387
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 pb-4">
                  <h3 className="font-semibold text-emerald-950 mb-3 text-base">How to shoot an Unboxing Video?</h3>
                  <p>
                    Start the video from showing a 360 degree view of the parcel in packed condition so as to confirm the parcel is not tampered before. Open the package and the products in front on the camera itself without taking the screen away from the parcel. Check the products in the parcel and if any damage is found, show it in the camera before you switch off the camera.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                <button 
                  onClick={() => setIsReturnPolicyOpen(false)}
                  className="bg-emerald-950 hover:bg-emerald-900 text-white px-6 py-2.5 rounded font-medium text-sm tracking-wide transition-colors"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
