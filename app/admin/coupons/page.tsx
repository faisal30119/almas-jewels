'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { adminFetch, formatPrice, formatDate } from '@/lib/admin-utils';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface Coupon {
  id: number; code: string; discount_amount: number; discount_type: string;
  is_active: boolean; usage_count: number; usage_limit: number | null;
  min_order_amount: number; expires_at: string | null; created_at: string;
}

const INPUT = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-800';
const LABEL = 'block text-xs uppercase tracking-widest text-gray-500 mb-1';

const EMPTY = { code: '', discount_amount: '', discount_type: 'flat', min_order_amount: '0', usage_limit: '', expires_at: '' };

export default function CouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  async function load() {
    setLoading(true);
    const res = await adminFetch('/api/admin/coupons');
    const data = await res.json();
    setCoupons(data.coupons ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.code || !form.discount_amount) { toast('Code and discount are required', 'error'); return; }
    setSaving(true);
    const res = await adminFetch('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        discount_amount: Number(form.discount_amount),
        discount_type: form.discount_type,
        min_order_amount: Number(form.min_order_amount || 0),
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      }),
    });
    const data = await res.json();
    if (data.error) toast(data.error, 'error');
    else { toast('Coupon created'); setShowForm(false); setForm(EMPTY); load(); }
    setSaving(false);
  }

  async function deleteCoupon() {
    if (!deleteTarget) return;
    const res = await adminFetch(`/api/admin/coupons?id=${deleteTarget.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error) toast(data.error, 'error');
    else { toast('Coupon deleted'); load(); }
    setDeleteTarget(null);
  }

  function F(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">{coupons.filter((c) => c.is_active).length} active</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-900 text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-emerald-800">
          <Plus size={14} /> New Coupon
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', ''].map((h, i) => (
                <th key={i} className="text-left text-xs uppercase tracking-widest text-gray-400 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => <tr key={i} className="border-b border-gray-50"><td colSpan={7} className="px-4 py-3"><div className="h-4 animate-pulse bg-gray-100 w-full" /></td></tr>)
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No coupons yet</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-gray-900">{c.code}</td>
                <td className="px-4 py-3 font-semibold">{c.discount_type === 'percent' ? `${c.discount_amount}%` : formatPrice(c.discount_amount)}</td>
                <td className="px-4 py-3 text-gray-600">{c.min_order_amount > 0 ? formatPrice(c.min_order_amount) : '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.usage_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.expires_at ? formatDate(c.expires_at) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 font-medium ${c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteTarget(c)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget} title="Delete Coupon"
        message={`Delete coupon "${deleteTarget?.code}"?`}
        onConfirm={deleteCoupon} onCancel={() => setDeleteTarget(null)}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-playfair text-xl font-bold">New Coupon</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div><label className={LABEL}>Code *</label><input type="text" value={form.code} onChange={F('code')} className={INPUT} style={{ textTransform: 'uppercase' }} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Type</label>
                  <select value={form.discount_type} onChange={F('discount_type')} className={INPUT + ' bg-white'}>
                    <option value="flat">Flat (₹)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
                <div><label className={LABEL}>Amount *</label><input type="number" value={form.discount_amount} min={1} onChange={F('discount_amount')} className={INPUT} /></div>
              </div>
              <div><label className={LABEL}>Min Order Amount (₹)</label><input type="number" value={form.min_order_amount} min={0} onChange={F('min_order_amount')} className={INPUT} /></div>
              <div><label className={LABEL}>Usage Limit (blank = unlimited)</label><input type="number" value={form.usage_limit} min={1} onChange={F('usage_limit')} className={INPUT} /></div>
              <div><label className={LABEL}>Expires At</label><input type="date" value={form.expires_at} onChange={F('expires_at')} className={INPUT} /></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2.5 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-emerald-900 text-white py-2.5 text-sm hover:bg-emerald-800 disabled:opacity-60">
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
