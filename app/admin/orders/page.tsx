'use client';
import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react';
import { adminFetch, formatPrice, formatDate } from '@/lib/admin-utils';
import { useToast } from '@/components/admin/Toast';

interface Order {
  id: number; order_id: string; amount: number; status: string; created_at: string;
  shipping_details: { name?: string; email?: string; phone?: string; address?: string };
  items: { name: string; quantity: number; price: number }[];
  tracking_number?: string; notes?: string; timeline?: { status: string; note: string; created_at: string }[];
}

const STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLORS: Record<string, string> = {
  Processing: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Failed: 'bg-gray-100 text-gray-600',
};

const INPUT = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-800';

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);
  const PAGE_SIZE = 20;

  async function load(p = page, q = search, s = statusFilter) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE), search: q });
    if (s) params.set('status', s);
    const res = await adminFetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.data ?? []);
    setTotal(data.count ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function openDetail(id: number) {
    const res = await adminFetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    if (data.data) {
      setDetail(data.data);
      setUpdatingStatus(data.data.status);
      setTrackingInput(data.data.tracking_number ?? '');
      setNotesInput(data.data.notes ?? '');
    }
  }

  async function saveUpdate() {
    if (!detail) return;
    setSavingUpdate(true);
    const res = await adminFetch('/api/admin/orders', {
      method: 'PATCH',
      body: JSON.stringify({ id: detail.id, status: updatingStatus, tracking_number: trackingInput, notes: notesInput }),
    });
    const data = await res.json();
    if (data.error) toast(data.error, 'error');
    else {
      toast('Order updated');
      setDetail(null);
      load();
    }
    setSavingUpdate(false);
  }

  function exportCSV() {
    const rows = [
      ['Order ID', 'Customer', 'Amount', 'Status', 'Date'],
      ...orders.map((o) => [o.order_id, o.shipping_details?.name ?? '', o.amount, o.status, o.created_at]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{total} total orders</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-gray-200 text-gray-700 text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-gray-50">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} placeholder="Search by order ID…"
            onChange={(e) => { setSearch(e.target.value); setPage(1); load(1, e.target.value, statusFilter); }}
            className="w-full border border-gray-200 pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-800"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}
          className="border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-emerald-800">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date', ''].map((h, i) => (
                <th key={i} className="text-left text-xs uppercase tracking-widest text-gray-400 px-4 py-3 font-medium">{h}</th>
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
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No orders found</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{o.order_id ?? `#${o.id}`}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{o.shipping_details?.name ?? 'Guest'}</div>
                  <div className="text-xs text-gray-400">{o.shipping_details?.email ?? ''}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{Array.isArray(o.items) ? o.items.length : 0}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(o.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 font-medium ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openDetail(o.id)} className="text-emerald-700 hover:text-emerald-900"><Eye size={14} /></button>
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

      {/* Order Detail Drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="bg-white w-full max-w-lg overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 flex items-center justify-between">
              <h2 className="font-playfair text-xl font-bold">Order Detail</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Info */}
              <div className="bg-gray-50 p-4 text-sm space-y-1">
                <div><span className="text-gray-500">Order ID:</span> <span className="font-mono font-medium">{detail.order_id}</span></div>
                <div><span className="text-gray-500">Date:</span> {formatDate(detail.created_at)}</div>
                <div><span className="text-gray-500">Amount:</span> <strong>{formatPrice(detail.amount)}</strong></div>
              </div>

              {/* Shipping */}
              {detail.shipping_details && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Shipping Details</p>
                  <div className="text-sm space-y-1">
                    <div>{detail.shipping_details.name}</div>
                    <div>{detail.shipping_details.email}</div>
                    <div>{detail.shipping_details.phone}</div>
                    <div className="text-gray-500">{detail.shipping_details.address}</div>
                  </div>
                </div>
              )}

              {/* Items */}
              {detail.items?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Items</p>
                  <div className="space-y-2">
                    {detail.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-gray-400">Update Order</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select value={updatingStatus} onChange={(e) => setUpdatingStatus(e.target.value)} className={INPUT + ' bg-white'}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs text-gray-500 mb-1">Tracking Number</label><input type="text" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} className={INPUT} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Notes</label><textarea value={notesInput} rows={2} onChange={(e) => setNotesInput(e.target.value)} className={INPUT + ' resize-none'} /></div>
                <button onClick={saveUpdate} disabled={savingUpdate} className="w-full bg-emerald-900 text-white py-2.5 text-sm hover:bg-emerald-800 disabled:opacity-60">
                  {savingUpdate ? 'Saving…' : 'Save Changes'}
                </button>
              </div>

              {/* Timeline */}
              {detail.timeline && detail.timeline.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Timeline</p>
                  <div className="relative pl-4 space-y-4">
                    {detail.timeline.map((t, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-emerald-600" />
                        <div className="text-sm font-medium text-gray-800">{t.status}</div>
                        {t.note && <div className="text-xs text-gray-500">{t.note}</div>}
                        <div className="text-xs text-gray-400">{formatDate(t.created_at)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
