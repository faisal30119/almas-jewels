'use client';
import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { adminFetch, formatPrice } from '@/lib/admin-utils';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { CATEGORIES, PLATINGS } from '@/lib/data';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  stone_color: string;
  plating: string;
  description: string;
  inclusions: string[];
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  slug: string;
}

const EMPTY_FORM: Partial<Product> & { incStr: string } = {
  name: '', price: 0, stock: 10, image: '', category: '', stone_color: '',
  plating: '', description: '', incStr: '', is_featured: false, meta_title: '', meta_description: '', slug: '',
};

const INPUT = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-800';
const LABEL = 'block text-xs uppercase tracking-widest text-gray-500 mb-1';

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 20;

  async function load(p = page, q = search) {
    setLoading(true);
    const res = await adminFetch(`/api/products?page=${p}&limit=${PAGE_SIZE}&search=${q}`);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : data.data ?? []);
    setTotal(data.count ?? (Array.isArray(data) ? data.length : 0));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ ...p, incStr: (p.inclusions ?? []).join(', ') });
    setShowForm(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd, headers: {} });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, image: data.url }));
    else toast(data.error ?? 'Upload failed', 'error');
    setUploading(false);
  }

  async function save() {
    if (!form.name || !form.price) { toast('Name and price are required', 'error'); return; }
    setSaving(true);
    const payload = {
      name: form.name, price: Number(form.price), stock: Number(form.stock ?? 10),
      category: form.category, stone_color: form.stone_color, plating: form.plating,
      description: form.description, image: form.image,
      inclusions: (form.incStr ?? '').split(',').map((s) => s.trim()).filter(Boolean),
      is_featured: form.is_featured ?? false,
      meta_title: form.meta_title, meta_description: form.meta_description, slug: form.slug,
    };
    const url = editing ? `/api/products/${editing.id}` : '/api/products';
    const method = editing ? 'PUT' : 'POST';
    const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.error) toast(data.error, 'error');
    else {
      toast(editing ? 'Product updated' : 'Product created');
      setShowForm(false);
      load();
    }
    setSaving(false);
  }

  async function deleteProduct() {
    if (!deleteTarget) return;
    const res = await adminFetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error) toast(data.error, 'error');
    else { toast('Product deleted'); load(); }
    setDeleteTarget(null);
  }

  function F(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{total} total products</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-emerald-900 text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-emerald-800 transition-colors">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={search} placeholder="Search products…"
          onChange={(e) => { setSearch(e.target.value); setPage(1); load(1, e.target.value); }}
          className="w-full border border-gray-200 pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-800"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Image', 'Name', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map((h) => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-gray-400 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse bg-gray-100 w-20" /></td>)}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No products found</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  {p.image ? (
                    <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100" />
                  )}
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <div className="font-medium text-gray-900 truncate">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.plating}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.category ?? '—'}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 font-medium ${p.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  {p.is_featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5">Featured</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(p)} className="text-emerald-700 hover:text-emerald-900"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteTarget(p)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => { const p = page - 1; setPage(p); load(p); }} className="p-1.5 border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={14} /></button>
            <button disabled={page === pages} onClick={() => { const p = page + 1; setPage(p); load(p); }} className="p-1.5 border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget} title="Delete Product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={deleteProduct} onCancel={() => setDeleteTarget(null)}
      />

      {/* Product Form Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="bg-white w-full max-w-lg overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-playfair text-xl font-bold">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Image */}
              <div>
                <label className={LABEL}>Product Image</label>
                <div className="flex gap-3 items-start">
                  {form.image && <img src={form.image} alt="preview" referrerPolicy="no-referrer" className="w-16 h-16 object-cover border border-gray-100 shrink-0" />}
                  <div className="flex-1">
                    <input type="text" value={form.image ?? ''} onChange={F('image')} placeholder="Image URL" className={INPUT} />
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="mt-2 flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50">
                      <Upload size={12} /> {uploading ? 'Uploading…' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              <div><label className={LABEL}>Name *</label><input type="text" value={form.name ?? ''} onChange={F('name')} className={INPUT} /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={LABEL}>Price (₹) *</label><input type="number" value={form.price ?? ''} min={0} onChange={F('price')} className={INPUT} /></div>
                <div><label className={LABEL}>Stock</label><input type="number" value={form.stock ?? ''} min={0} onChange={F('stock')} className={INPUT} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Category</label>
                  <select value={form.category ?? ''} onChange={F('category')} className={INPUT + ' bg-white'}>
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Plating</label>
                  <select value={form.plating ?? ''} onChange={F('plating')} className={INPUT + ' bg-white'}>
                    <option value="">Select…</option>
                    {PLATINGS.map((p) => <option key={p} value={p}>{p}</option>)}
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>
              </div>

              <div><label className={LABEL}>Stone Color</label><input type="text" value={form.stone_color ?? ''} onChange={F('stone_color')} className={INPUT} /></div>
              <div><label className={LABEL}>Description</label><textarea value={form.description ?? ''} rows={3} onChange={F('description')} className={INPUT + ' resize-none'} /></div>
              <div><label className={LABEL}>Inclusions (comma-separated)</label><input type="text" value={form.incStr ?? ''} onChange={F('incStr')} placeholder="Necklace, Earrings, Tikka" className={INPUT} /></div>

              {/* SEO */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">SEO</p>
                <div className="space-y-3">
                  <div><label className={LABEL}>Slug</label><input type="text" value={form.slug ?? ''} onChange={F('slug')} className={INPUT} /></div>
                  <div><label className={LABEL}>Meta Title</label><input type="text" value={form.meta_title ?? ''} onChange={F('meta_title')} className={INPUT} /></div>
                  <div><label className={LABEL}>Meta Description</label><textarea value={form.meta_description ?? ''} rows={2} onChange={F('meta_description')} className={INPUT + ' resize-none'} /></div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured ?? false} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 accent-emerald-700" />
                <span className="text-sm text-gray-700">Featured Product</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2.5 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-emerald-900 text-white py-2.5 text-sm hover:bg-emerald-800 disabled:opacity-60">
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
