'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Heart, ShoppingBag, User, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'Shop',
      href: '/shop',
      icon: LayoutGrid,
      isActive: pathname === '/shop',
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      badge: wishlist.length > 0 ? wishlist.length : undefined,
      isActive: pathname === '/wishlist',
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
      isActive: pathname === '/cart',
    },
    {
      label: 'Account',
      href: user ? '/profile' : '#',
      onClick: !user ? () => openAuthModal('login') : undefined,
      icon: User,
      isActive: pathname === '/profile',
    },
    {
      label: 'Search',
      href: '/shop',
      icon: Search,
      isActive: false,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#022c22] border-t border-[#D4AF37]/25 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="flex flex-col items-center justify-center py-1 relative">
              <div className="relative">
                <Icon
                  size={20}
                  className={cn(
                    'transition-colors duration-200',
                    item.isActive
                      ? 'text-[#D4AF37] stroke-[2.3]'
                      : 'text-white/70 hover:text-white stroke-[1.8]'
                  )}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#D4AF37] text-[#022c22] text-[9px] font-bold min-w-4 h-4 rounded-full px-1 flex items-center justify-center border border-[#022c22] shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-sans mt-1 tracking-wider uppercase transition-colors duration-200',
                  item.isActive ? 'text-[#D4AF37] font-semibold' : 'text-white/70'
                )}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center justify-center focus:outline-none"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="w-full flex items-center justify-center focus:outline-none"
              aria-label={item.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

