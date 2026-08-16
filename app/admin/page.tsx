'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronDown,
  Database,
  Loader2,
  Package,
  Plus,
  Tag,
  Trash2,
  Upload,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { CATEGORIES, PLATINGS } from '@/lib/data';
import type { Product } from '@/lib/data';

const ADMIN_EMAILS = ['faisal301196@gmail.com', 'almasladiescornersakchi@gmail.com'];

function formatPrice(n: number) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  category: string;
}

interface Coupon {
  id: number;
  code: string;
  discount_amount: number;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: number;
  order_id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  items: { name: string; quantity: number; price: number }[];
  shipping_details: { name?: string; email?: string };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="border border-gray-100 p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-sans uppercase tracking-widest text-gray-400">{label}</p>
        <Icon size={16} className="text-gold-600" />
      </div>
      <p className="font-serif text-3xl text-emerald-950">{value}</p>
      {sub && <p className="text-xs font-sans text-gray-400 mt-2">{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<'products' | 'orders' | 'coupons' | 'db'>('products');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponAmount, setNewCouponAmount] = useState('');
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');

  // DB viewer state
  const [dbTable, setDbTable] = useState<string>('products');
  const [dbData, setDbData] = useState<Record<string, unknown>[]>([]);
  const [dbCount, setDbCount] = useState(0);
  const [dbLoading, setDbLoading] = useState(false);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    stoneColor: '',
    plating: '',
    description: '',
    inclusions: '',
    image: '',
  });
  const [productSaving, setProductSaving] = useState(false);
  const [productMsg, setProductMsg] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Always read the current session token at call time — never stale
  const getAuthHeader = () => ({ Authorization: `Bearer ${session?.access_token ?? ''}` });
  const authHeader = getAuthHeader();

  // Access guard
  useEffect(() => {
    if (authLoading) return;
    const envAdmins =
      (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map((e) => e.trim()).filter(Boolean);
    const allAdmins = [...ADMIN_EMAILS, ...envAdmins];
    if (!user || !allAdmins.includes(user.email ?? '')) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const [pRes, lsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/low-stock', { headers: getAuthHeader() }),
      ]);
      const pData = await pRes.json();
      const lsData = await lsRes.json();
      setProducts(Array.isArray(pData) ? pData : []);
      setLowStock(lsData.products ?? []);
    } finally {
      setProductsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/admin/db/user_orders?limit=100', { headers: getAuthHeader() });
      const data = await res.json();
      setOrders(data.data ?? []);
    } finally {
      setOrdersLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadCoupons = useCallback(async () => {
    setCouponsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons', { headers: getAuthHeader() });
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } finally {
      setCouponsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadDbTable = useCallback(async () => {
    setDbLoading(true);
    try {
      const res = await fetch(`/api/admin/db/${dbTable}?limit=50`, { headers: getAuthHeader() });
      const data = await res.json();
      setDbData(data.data ?? []);
      setDbCount(data.count ?? 0);
    } finally {
      setDbLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbTable, session]);

  useEffect(() => {
    if (!session) return;
    if (tab === 'products') loadProducts();
    if (tab === 'orders') loadOrders();
    if (tab === 'coupons') loadCoupons();
    if (tab === 'db') loadDbTable();
  }, [tab, session, loadProducts, loadOrders, loadCoupons, loadDbTable]);

  useEffect(() => {
    if (tab === 'db' && session) loadDbTable();
  }, [dbTable, tab, session, loadDbTable]);

  // ── Product form helpers ───────────────────────────────────────────────────

  function openNewProduct() {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      stock: '10',
      category: '',
      stoneColor: '',
      plating: '',
      description: '',
      inclusions: '',
      image: '',
    });
    setProductMsg('');
    setShowProductForm(true);
  }

  function openEditProduct(p: Product) {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock ?? 10),
      category: p.category ?? '',
      stoneColor: p.stoneColor ?? '',
      plating: p.plating ?? '',
      description: p.description ?? '',
      inclusions: (p.inclusions ?? []).join(', '),
      image: p.image ?? '',
    });
    setProductMsg('');
    setShowProductForm(true);
  }

  async function handleUploadImage(file: File) {
    setImageUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: getAuthHeader(),
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setProductForm((f) => ({ ...f, image: data.url }));
      } else {
        setProductMsg(data.error ?? 'Upload failed');
      }
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSaveProduct() {
    if (!productForm.name || !productForm.price) {
      setProductMsg('Name and price are required.');
      return;
    }
    setProductSaving(true);
    setProductMsg('');
    const payload = {
      name: productForm.name,
      price: Number(productForm.price),
      stock: Number(productForm.stock || 10),
      // Strip the internal '_others_' sentinel — save as empty string if user didn't type anything
      category: productForm.category === '_others_' ? '' : productForm.category,
      stoneColor: productForm.stoneColor,
      plating: productForm.plating === '_others_' ? '' : productForm.plating,
      description: productForm.description,
      image: productForm.image,
      inclusions: productForm.inclusions
        ? productForm.inclusions.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    try {
      const isEdit = editingProduct && !editingProduct.id.startsWith('p');
      const url = isEdit ? `/api/products/${editingProduct!.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) {
        setProductMsg(data.error);
      } else {
        setProductMsg(isEdit ? 'Product updated!' : 'Product created!');
        setShowProductForm(false);
        loadProducts();
      }
    } finally {
      setProductSaving(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: getAuthHeader() });
    loadProducts();
  }

  // ── Coupon helpers ─────────────────────────────────────────────────────────

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!newCouponCode || !newCouponAmount) {
      setCouponMsg('Code and discount amount are required.');
      return;
    }
    setCouponSaving(true);
    setCouponMsg('');
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ code: newCouponCode, discount_amount: Number(newCouponAmount) }),
    });
    const data = await res.json();
    setCouponSaving(false);
    if (data.error) {
      setCouponMsg(data.error);
    } else {
      setNewCouponCode('');
      setNewCouponAmount('');
      setCouponMsg('Coupon created!');
      loadCoupons();
    }
  }

  async function handleDeleteCoupon(id: number) {
    if (!confirm('Delete this coupon?')) return;
    await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE', headers: getAuthHeader() });
    loadCoupons();
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-emerald-950" />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-emerald-950 pt-24 pb-10 px-6 md:px-16">
        <p className="font-sans text-xs uppercase tracking-widest text-gold-400 mb-2">
          Admin Panel
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-white">Dashboard</h1>
      </div>

      {/* Stats row */}
      <div className="px-6 md:px-16 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <StatCard
            label="Total Products"
            value={products.length}
            icon={Box}
            sub={`${lowStock.length} low stock`}
          />
          <StatCard
            label="Total Orders"
            value={orders.length}
            icon={Package}
            sub="All time"
          />
          <StatCard
            label="Active Coupons"
            value={coupons.filter((c) => c.is_active).length}
            icon={Tag}
            sub={`${coupons.length} total`}
          />
          <StatCard
            label="Low Stock Alerts"
            value={lowStock.length}
            icon={AlertTriangle}
            sub="Stock < 5"
          />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="px-6 md:px-16 mt-8 max-w-7xl mx-auto">
        <div className="flex border-b border-gray-200 gap-6">
          {(['products', 'orders', 'coupons', 'db'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'font-sans text-xs uppercase tracking-widest pb-3 border-b-2 transition-colors',
                tab === t
                  ? 'border-emerald-950 text-emerald-950'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              {t === 'db' ? 'DB Viewer' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 md:px-16 py-8 max-w-7xl mx-auto">
        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <div>
            {/* Low stock alert */}
            {lowStock.length > 0 && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 mb-6">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-sans text-sm font-semibold text-amber-800 mb-1">
                    Low Stock Warning
                  </p>
                  <p className="font-sans text-xs text-amber-700">
                    {lowStock.map((p) => `${p.name} (${p.stock} left)`).join(' · ')}
                  </p>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="font-sans text-xs uppercase tracking-widest text-gray-400">
                {products.length} products
              </p>
              <div className="flex gap-3">
                <button
                  onClick={loadProducts}
                  className="p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={14} className="text-gray-500" />
                </button>
                <button
                  onClick={openNewProduct}
                  className="flex items-center gap-2 bg-emerald-950 text-white font-sans text-xs uppercase tracking-widest px-4 py-2 hover:bg-emerald-900 transition-colors"
                >
                  <Plus size={14} />
                  Add Product
                </button>
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="animate-spin text-emerald-950" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm font-sans">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Image', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs uppercase tracking-widest text-gray-400 pb-3 pr-6"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-6">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                              <Box size={16} className="text-gray-300" />
                            </div>
                          )}
                        </td>
                        <td className="py-4 pr-6 max-w-[200px]">
                          <p className="font-semibold text-emerald-950 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400 truncate">{p.plating}</p>
                        </td>
                        <td className="py-4 pr-6 text-gray-500">{p.category ?? '—'}</td>
                        <td className="py-4 pr-6 font-semibold text-emerald-950">
                          {formatPrice(p.price)}
                        </td>
                        <td className="py-4 pr-6">
                          <span
                            className={cn(
                              'font-sans text-xs px-2 py-1',
                              (p.stock ?? 10) < 5
                                ? 'bg-red-50 text-red-500'
                                : 'bg-emerald-50 text-emerald-700'
                            )}
                          >
                            {p.stock ?? '—'}
                          </span>
                        </td>
                        <td className="py-4 pr-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditProduct(p)}
                              className="flex items-center gap-1 font-sans text-xs text-emerald-950 hover:text-gold-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Edit
                            </button>
                            {!p.id.startsWith('p') && (
                              <button
                                onClick={() => setDeleteModal({ id: p.id, name: p.name })}
                                className="flex items-center gap-1 font-sans text-xs text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="font-sans text-xs uppercase tracking-widest text-gray-400">
                {orders.length} orders
              </p>
              <button onClick={loadOrders} className="p-2 border border-gray-200 hover:bg-gray-50">
                <RefreshCw size={14} className="text-gray-500" />
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="animate-spin text-emerald-950" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm font-sans">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs uppercase tracking-widest text-gray-400 pb-3 pr-6"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-6">
                          <p className="font-mono text-xs text-emerald-950 max-w-[140px] truncate">
                            {o.order_id ?? `#${o.id}`}
                          </p>
                        </td>
                        <td className="py-4 pr-6">
                          <p className="text-emerald-950 text-xs">
                            {o.shipping_details?.name ?? '—'}
                          </p>
                          <p className="text-gray-400 text-xs truncate max-w-[140px]">
                            {o.shipping_details?.email ?? ''}
                          </p>
                        </td>
                        <td className="py-4 pr-6 text-gray-500 text-xs">
                          {Array.isArray(o.items) ? o.items.length : 0} item
                          {Array.isArray(o.items) && o.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="py-4 pr-6 font-semibold text-emerald-950">
                          {formatPrice(o.amount)}
                        </td>
                        <td className="py-4 pr-6">
                          <span
                            className={cn(
                              'text-xs px-2 py-1 uppercase tracking-widest',
                              o.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700'
                                : o.status === 'Cancelled' || o.status === 'Failed'
                                ? 'bg-red-50 text-red-500'
                                : 'bg-amber-50 text-amber-600'
                            )}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-gray-400 text-xs">
                          {new Date(o.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── COUPONS TAB ── */}
        {tab === 'coupons' && (
          <div>
            {/* Create coupon form */}
            <form
              onSubmit={handleCreateCoupon}
              className="border border-gray-200 p-6 mb-8 bg-white"
            >
              <p className="font-sans text-xs uppercase tracking-widest text-gray-400 mb-4">
                Create New Coupon
              </p>
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="CODE (e.g. SAVE500)"
                  className="border border-gray-200 px-4 py-3 font-sans text-sm text-emerald-950 placeholder-gray-300 focus:outline-none focus:border-emerald-950 uppercase flex-1 min-w-[140px]"
                />
                <input
                  type="number"
                  value={newCouponAmount}
                  onChange={(e) => setNewCouponAmount(e.target.value)}
                  placeholder="Discount (₹)"
                  min={1}
                  className="border border-gray-200 px-4 py-3 font-sans text-sm text-emerald-950 placeholder-gray-300 focus:outline-none focus:border-emerald-950 w-40"
                />
                <button
                  type="submit"
                  disabled={couponSaving}
                  className="flex items-center gap-2 bg-emerald-950 text-white font-sans text-xs uppercase tracking-widest px-6 py-3 hover:bg-emerald-900 transition-colors disabled:opacity-60"
                >
                  {couponSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Create
                </button>
              </div>
              {couponMsg && (
                <p
                  className={cn(
                    'mt-3 text-xs font-sans',
                    couponMsg.includes('!') ? 'text-emerald-700' : 'text-red-500'
                  )}
                >
                  {couponMsg}
                </p>
              )}
            </form>

            {/* Coupon list */}
            {couponsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="animate-spin text-emerald-950" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm font-sans">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Code', 'Discount', 'Status', 'Created', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs uppercase tracking-widest text-gray-400 pb-3 pr-6"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-6 font-mono font-bold text-emerald-950">
                          {c.code}
                        </td>
                        <td className="py-4 pr-6 text-emerald-950 font-semibold">
                          {formatPrice(c.discount_amount)}
                        </td>
                        <td className="py-4 pr-6">
                          <span
                            className={cn(
                              'text-xs px-2 py-1',
                              c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
                            )}
                          >
                            {c.is_active ? 'Active' : 'Used'}
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-gray-400 text-xs">
                          {new Date(c.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-4 pr-6">
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── DB VIEWER TAB ── */}
        {tab === 'db' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <select
                  value={dbTable}
                  onChange={(e) => setDbTable(e.target.value)}
                  className="appearance-none border border-gray-200 px-4 py-2 pr-8 font-sans text-sm text-emerald-950 bg-white focus:outline-none focus:border-emerald-950"
                >
                  {['products', 'user_orders', 'user_profiles', 'coupons'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <button onClick={loadDbTable} className="p-2 border border-gray-200 hover:bg-gray-50">
                <RefreshCw size={14} className="text-gray-500" />
              </button>
              <p className="font-sans text-xs text-gray-400">{dbCount} total rows</p>
            </div>

            {dbLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="animate-spin text-emerald-950" />
              </div>
            ) : dbData.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-400 py-8">
                <Database size={16} />
                <p className="font-sans text-sm">No records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {Object.keys(dbData[0]).map((col) => (
                        <th
                          key={col}
                          className="text-left uppercase tracking-widest text-gray-400 pb-3 pr-6 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className="py-3 pr-6 text-emerald-950 max-w-[200px] truncate align-top"
                            title={typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                          >
                            {typeof val === 'object'
                              ? JSON.stringify(val).slice(0, 60) + (JSON.stringify(val).length > 60 ? '…' : '')
                              : String(val ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Product Form Modal ─────────────────────────────────────────────── */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-12 px-4">
          <div className="bg-white w-full max-w-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-emerald-950">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setShowProductForm(false)}>
                <X size={20} className="text-gray-400 hover:text-emerald-950" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
                  Product Image
                </label>
                <div className="flex gap-3 items-start">
                  {productForm.image && (
                    <img
                      src={productForm.image}
                      alt="preview"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover border border-gray-100"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm((f) => ({ ...f, image: e.target.value }))
                      }
                      placeholder="Image URL or upload below"
                      className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 placeholder-gray-300 focus:outline-none focus:border-emerald-950"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadImage(f);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="mt-2 flex items-center gap-2 text-xs font-sans text-gray-500 border border-gray-200 px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      {imageUploading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Upload size={12} />
                      )}
                      Upload Image
                    </button>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 focus:outline-none focus:border-emerald-950"
                />
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    min={0}
                    onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 focus:outline-none focus:border-emerald-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    min={0}
                    onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 focus:outline-none focus:border-emerald-950"
                  />
                </div>
              </div>

              {/* Category + Plating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
                    Category
                  </label>
                  {/* Dropdown — shows known categories + Others */}
                  <select
                    value={CATEGORIES.includes(productForm.category) ? productForm.category : 'Others'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== 'Others') {
                        setProductForm((f) => ({ ...f, category: val }));
                      } else {
                        // Clear so user can type a custom value
                        setProductForm((f) => ({ ...f, category: '_others_' }));
                      }
                    }}
                    className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 focus:outline-none focus:border-emerald-950 bg-white"
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Others">Others</option>
                  </select>
                  {/* Free-text shown when Others is chosen */}
                  {!CATEGORIES.includes(productForm.category) && (
                    <input
                      type="text"
                      value={productForm.category === '_others_' ? '' : productForm.category}
                      onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}
                      placeholder="Type custom category…"
                      autoFocus
                      className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 placeholder-gray-300 focus:outline-none focus:border-emerald-950 mt-2"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
                    Plating
                  </label>
                  <select
                    value={PLATINGS.includes(productForm.plating) ? productForm.plating : 'Others'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== 'Others') {
                        setProductForm((f) => ({ ...f, plating: val }));
                      } else {
                        setProductForm((f) => ({ ...f, plating: '_others_' }));
                      }
                    }}
                    className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 focus:outline-none focus:border-emerald-950 bg-white"
                  >
                    <option value="">Select plating…</option>
                    {PLATINGS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="Others">Others</option>
                  </select>
                  {!PLATINGS.includes(productForm.plating) && (
                    <input
                      type="text"
                      value={productForm.plating === '_others_' ? '' : productForm.plating}
                      onChange={(e) => setProductForm((f) => ({ ...f, plating: e.target.value }))}
                      placeholder="Type custom plating…"
                      autoFocus
                      className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 placeholder-gray-300 focus:outline-none focus:border-emerald-950 mt-2"
                    />
                  )}
                </div>
              </div>

              {/* Stone color */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
                  Stone Color
                </label>
                <input
                  type="text"
                  value={productForm.stoneColor}
                  onChange={(e) => setProductForm((f) => ({ ...f, stoneColor: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 focus:outline-none focus:border-emerald-950"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  rows={3}
                  onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 focus:outline-none focus:border-emerald-950 resize-none"
                />
              </div>

              {/* Inclusions */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
                  Inclusions (comma-separated)
                </label>
                <input
                  type="text"
                  value={productForm.inclusions}
                  placeholder="Necklace, Earrings, Tikka"
                  onChange={(e) => setProductForm((f) => ({ ...f, inclusions: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 font-sans text-sm text-emerald-950 placeholder-gray-300 focus:outline-none focus:border-emerald-950"
                />
              </div>

              {productMsg && (
                <p
                  className={cn(
                    'text-xs font-sans flex items-center gap-1',
                    productMsg.includes('!') ? 'text-emerald-700' : 'text-red-500'
                  )}
                >
                  {productMsg.includes('!') ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <AlertTriangle size={12} />
                  )}
                  {productMsg}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProduct}
                  disabled={productSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-950 text-white font-sans text-xs uppercase tracking-widest py-4 hover:bg-emerald-900 transition-colors disabled:opacity-60"
                >
                  {productSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="px-6 border border-gray-200 font-sans text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="bg-white w-full max-w-sm p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-red-50 flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-2xl text-emerald-950 text-center mb-2">
              Delete Product?
            </h2>
            <p className="font-sans text-sm text-gray-500 text-center leading-relaxed mb-6">
              You are about to permanently delete{' '}
              <span className="font-semibold text-emerald-950">
                &ldquo;{deleteModal.name}&rdquo;
              </span>
              . This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleDeleteProduct(deleteModal.id);
                  setDeleteModal(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-sans text-xs uppercase tracking-widest py-3.5 transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-sans text-xs uppercase tracking-widest py-3.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
