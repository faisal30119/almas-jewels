'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminFetch } from '@/lib/admin-utils';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface Category { id: number; name: string; slug: string; parent_id: number | null; sort_order: number }

const INPUT = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-800';
const LABEL = 'block text-xs uppercase tracking-widest text-gray-500 mb-1';

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', parent_id: '', sort_order: '0' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  async function load() {
    setLoading(true);
    const res = await adminFetch('/api/admin/categories');
    const data = await res.json();
    setCategories(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: '', slug: '', parent_id: '', sort_order: '0' });
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, parent_id: c.parent_id ? String(c.parent_id) : '', sort_order: String(c.sort_order) });
    setShowForm(true);
  }

  async function save() {
    if (!form.name) { toast('Name is required', 'error'); return; }
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = {
      name: form.name, slug,
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      sort_order: Number(form.sort_order),
      ...(editing ? { id: editing.id } : {}),
    };
    const method = editing ? 'PUT' : 'POST';
    const res = await adminFetch('/api/admin/categories', { method, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.error) toast(data.error, 'error');
    else { toast(editing ? 'Category updated' : 'Category created'); setShowForm(false); load(); }
    setSaving(false);
  }

  async function deleteCategory() {
    if (!deleteTarget) return;
    const res = await adminFetch('/api/admin/categories', { method: 'DELETE', body: JSON.stringify({ id: deleteTarget.id }) });
    const data = await res.json();
    if (data.error) toast(data.error, 'error');
    else { toast('Category deleted'); load(); }
    setDeleteTarget(null);
  }

  const topLevel = categories.filter((c) => !c.parent_id);
  const children = (pid: number) => categories.filter((c) => c.parent_id === pid);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-playfair font-bold text-gray-900">Categories</h1>
          <p className="text-xs sm:text-sm text-gray-500">{categories.length} categories</p>
        </div>
        <button onClick={openNew} className="self-start sm:self-auto flex items-center gap-2 bg-emerald-900 text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-emerald-800">
          <Plus size={14} /> Add Category
        </button>
      </div>


      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : topLevel.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No categories yet</div>
        ) : topLevel.map((cat) => (
          <div key={cat.id} className="border-b border-gray-100 last:border-0">
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div>
                <span className="font-medium text-gray-900">{cat.name}</span>
                <span className="ml-2 text-xs text-gray-400">/{cat.slug}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">order: {cat.sort_order}</span>
                <button onClick={() => openEdit(cat)} className="text-emerald-700 hover:text-emerald-900 p-1"><Pencil size={13} /></button>
                <button onClick={() => setDeleteTarget(cat)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
              </div>
            </div>
            {children(cat.id).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-4 py-2.5 pl-10 bg-gray-50/50 border-t border-gray-50 hover:bg-gray-50">
                <div>
                  <span className="text-sm text-gray-700">↳ {sub.name}</span>
                  <span className="ml-2 text-xs text-gray-400">/{sub.slug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(sub)} className="text-emerald-700 hover:text-emerald-900 p-1"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteTarget(sub)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!deleteTarget} title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={deleteCategory} onCancel={() => setDeleteTarget(null)}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-playfair text-xl font-bold">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div><label className={LABEL}>Name *</label><input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={INPUT} /></div>
              <div><label className={LABEL}>Slug (auto-generated if blank)</label><input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={INPUT} /></div>
              <div>
                <label className={LABEL}>Parent Category</label>
                <select value={form.parent_id} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))} className={INPUT + ' bg-white'}>
                  <option value="">None (top-level)</option>
                  {categories.filter((c) => !editing || c.id !== editing.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div><label className={LABEL}>Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} className={INPUT} /></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
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
