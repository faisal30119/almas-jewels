'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, Ticket,
  Settings, Search, Image, BarChart2, ChevronLeft, ChevronRight, LogOut, Gem, ExternalLink, Menu, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/seo', label: 'SEO', icon: Search },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <>
      {/* ─── MOBILE TOP BAR ─── */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:text-emerald-900 focus:outline-none"
            aria-label="Open admin menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Gem size={18} className="text-emerald-800 shrink-0" />
            <span className="font-playfair font-bold text-emerald-900 text-sm tracking-wide">
              Almas Admin
            </span>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-medium"
        >
          <span>Store</span>
          <ExternalLink size={13} />
        </Link>
      </header>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Gem size={20} className="text-emerald-800 shrink-0" />
                <span className="font-playfair font-bold text-emerald-900 text-sm tracking-wide">
                  Almas Admin
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-3 overflow-y-auto px-2">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors mb-0.5 ${
                      active
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="border-t border-gray-100 p-3 space-y-1">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
              >
                <ExternalLink size={17} className="shrink-0" />
                <span>View Store</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={17} className="shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside
        className={`hidden md:flex relative flex-col bg-white border-r border-gray-200 transition-all duration-200 shrink-0 ${
          collapsed ? 'w-[60px]' : 'w-[220px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-gray-100 overflow-hidden">
          <Gem size={20} className="text-emerald-800 shrink-0" />
          {!collapsed && (
            <span className="font-playfair font-bold text-emerald-900 text-sm tracking-wide truncate">
              Almas Admin
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 mx-1 text-sm transition-colors ${
                  active
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-100 pb-2">
          {/* View Store */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? 'View Store' : undefined}
            className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
          >
            <ExternalLink size={17} className="shrink-0" />
            {!collapsed && <span>View Store</span>}
          </Link>
          {/* Sign out */}
          <button
            onClick={handleSignOut}
            title={collapsed ? 'Sign Out' : undefined}
            className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 w-[calc(100%-8px)] transition-colors"
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}

