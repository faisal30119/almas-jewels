'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Track Order', href: '/track' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, openAuthModal, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const navBg =
    isHome && !scrolled
      ? 'bg-transparent'
      : 'bg-[#022c22] shadow-lg';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30 transition-all duration-300',
        navBg
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col leading-none">
            <span className="font-serif text-[#D4AF37] text-lg lg:text-xl font-bold tracking-wider">
              ALMAS
            </span>
            <span className="text-white/70 text-[9px] tracking-[0.3em] uppercase">
              Jewels
            </span>
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-xs tracking-widest uppercase transition-colors',
                  pathname === link.href
                    ? 'text-[#D4AF37]'
                    : 'text-white/80 hover:text-[#D4AF37]'
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  'text-xs tracking-widest uppercase transition-colors',
                  pathname === '/admin'
                    ? 'text-[#D4AF37]'
                    : 'text-white/80 hover:text-[#D4AF37]'
                )}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <Link
              href="/shop"
              className="p-2 text-white/80 hover:text-[#D4AF37] transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 text-white/80 hover:text-[#D4AF37] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-[#022c22] text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-white/80 hover:text-[#D4AF37] transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-[#022c22] text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="p-2 text-white/80 hover:text-[#D4AF37] transition-colors"
                  aria-label="Account"
                >
                  <User size={18} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl border border-gray-100 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="p-2 text-white/80 hover:text-[#D4AF37] transition-colors"
                aria-label="Sign In"
              >
                <User size={18} />
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 text-white/80 hover:text-[#D4AF37] transition-colors ml-1"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-[#022c22] border-t border-white/10"
          >
            <nav className="flex flex-col px-6 py-4 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'py-3 text-xs tracking-widest uppercase border-b border-white/10 last:border-0',
                    pathname === link.href ? 'text-[#D4AF37]' : 'text-white/80'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="py-3 text-xs tracking-widest uppercase text-[#D4AF37]"
                >
                  Admin
                </Link>
              )}
              {!user && (
                <button
                  onClick={() => { openAuthModal('login'); setMobileOpen(false); }}
                  className="mt-3 text-left text-xs tracking-widest uppercase text-white/70 hover:text-[#D4AF37]"
                >
                  Sign In / Register
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
