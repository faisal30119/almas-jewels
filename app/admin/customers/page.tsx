'use client';
import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminFetch, formatDate } from '@/lib/admin-utils';

interface Customer {
  id: string; uid: string; email: string; display_name: string;
  created_at: string; order_count: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 20;

  async function load(p = page, q = search) {
    setLoading(true);
    const res = await adminFetch(`/api/admin/customers?page=${p}&limit=${PAGE_SIZE}&search=${q}`);
    const data = await res.json();
    setCustomers(data.data ?? []);
    setTotal(data.count ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-playfair font-bold text-gray-900">Customers</h1>
        <p className="text-xs sm:text-sm text-gray-500">{total} registered customers</p>
      </div>


      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} placeholder="Search by email…"
          onChange={(e) => { setSearch(e.target.value); setPage(1); load(1, e.target.value); }}
          className="w-full border border-gray-200 pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-800"
        />
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Name', 'Email', 'Orders', 'Joined'].map((h) => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-gray-400 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[...Array(4)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse bg-gray-100 w-24" /></td>)}
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">No customers found</td></tr>
            ) : customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.display_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-600">{c.order_count ?? 0}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => { const p = page - 1; setPage(p); load(p); }} className="p-1.5 border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={14} /></button>
            <button disabled={page === pages} onClick={() => { const p = page + 1; setPage(p); load(p); }} className="p-1.5 border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
