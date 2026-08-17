'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle, ArrowUpRight, Trophy } from 'lucide-react';
import { adminFetch, formatPrice, formatDate } from '@/lib/admin-utils';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

interface TopProduct { name: string; qty: number; revenue: number }
interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChart: { date: string; revenue: number; orders: number }[];
  topProductsWeek: TopProduct[];
  topProductsMonth: TopProduct[];
}
interface LowStockItem { id: number; name: string; stock: number; category: string }
interface RecentOrder {
  id: number; order_id: string; amount: number; status: string;
  created_at: string; shipping_details: { name?: string };
}

const STATUS_COLORS: Record<string, string> = {
  Processing: 'bg-yellow-100 text-yellow-800',
  Confirmed:  'bg-blue-100 text-blue-800',
  Shipped:    'bg-indigo-100 text-indigo-800',
  Delivered:  'bg-green-100 text-green-800',
  Cancelled:  'bg-red-100 text-red-800',
  Failed:     'bg-gray-100 text-gray-600',
};

function TopProductsTable({
  data, loading, maxQty,
}: { data: TopProduct[]; loading: boolean; maxQty: number }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }
  if (data.length === 0) {
    return <p className="text-sm text-gray-400 py-6 text-center">No orders in this period</p>;
  }
  return (
    <div className="space-y-3">
      {data.map((p, i) => {
        const pct = maxQty > 0 ? Math.round((p.qty / maxQty) * 100) : 0;
        return (
          <div key={p.name}>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-xs font-bold w-5 text-center shrink-0 ${
                  i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300'
                }`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span className="font-medium text-gray-800 truncate">{p.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="text-xs text-gray-500">{p.qty} sold</span>
                <span className="text-xs font-semibold text-emerald-700">{formatPrice(p.revenue)}</span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 w-full">
              <div
                className="h-full bg-emerald-700 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ana, ls, ord] = await Promise.all([
        adminFetch('/api/admin/analytics').then((r) => r.json()),
        adminFetch('/api/admin/low-stock').then((r) => r.json()),
        adminFetch('/api/admin/orders?limit=5').then((r) => r.json()),
      ]);
      setAnalytics(ana.data);
      setLowStock(ls.data ?? []);
      setRecentOrders(ord.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const kpis = [
    { label: 'Total Revenue',  value: analytics ? formatPrice(analytics.totalRevenue) : '—', icon: TrendingUp, color: 'text-emerald-700' },
    { label: 'Total Orders',   value: analytics?.totalOrders   ?? '—', icon: ShoppingCart, color: 'text-blue-700' },
    { label: 'Customers',      value: analytics?.totalCustomers ?? '—', icon: Users,        color: 'text-purple-700' },
    { label: 'Products',       value: analytics?.totalProducts  ?? '—', icon: Package,      color: 'text-orange-700' },
  ];

  const weekMax  = analytics?.topProductsWeek[0]?.qty  ?? 1;
  const monthMax = analytics?.topProductsMonth[0]?.qty ?? 1;

  return (
    <div className="p-6 max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-2xl font-playfair font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back — here&apos;s an overview of Almas Jewels</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? <span className="animate-pulse text-gray-300">•••</span> : value}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-4">Revenue — Last 30 Days</h2>
        {loading ? (
          <div className="h-60 animate-pulse bg-gray-100" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={analytics?.revenueChart ?? []}
              margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#064e3b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#064e3b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(v: unknown) => {
                  if (typeof v !== 'string' || v.length < 10) return String(v);
                  const [y, m, d] = v.split('-');
                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  return `${d}-${months[parseInt(m, 10) - 1]}-${y}`;
                }}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                allowDecimals={false}
                width={52}
                domain={[0, (dataMax: number) => Math.max(dataMax, 5000)]}
                tickCount={6}
              />
              <Tooltip
                formatter={(v: unknown) => [formatPrice(Number(v)), 'Revenue']}
                labelFormatter={(l: unknown) => {
                  if (typeof l !== 'string' || l.length < 10) return `Date: ${l}`;
                  const [y, m, d] = l.split('-');
                  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                  return `${d}-${months[parseInt(m, 10) - 1]}-${y}`;
                }}
              />
              {(analytics?.totalRevenue ?? 0) === 0 && (
                <text x="50%" y="48%" textAnchor="middle" fill="#d1d5db" fontSize={13}>
                  No revenue in the last 30 days
                </text>
              )}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#064e3b"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Products — Week & Month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* This Week */}
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <Trophy size={14} className="text-yellow-500" /> Top Products — This Week
            </h2>
            <a href="/admin/orders" className="text-xs text-emerald-700 hover:underline flex items-center gap-1">
              Orders <ArrowUpRight size={12} />
            </a>
          </div>
          <TopProductsTable
            data={analytics?.topProductsWeek ?? []}
            loading={loading}
            maxQty={weekMax}
          />
        </div>

        {/* This Month */}
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <Trophy size={14} className="text-emerald-600" /> Top Products — This Month
            </h2>
            <a href="/admin/orders" className="text-xs text-emerald-700 hover:underline flex items-center gap-1">
              Orders <ArrowUpRight size={12} />
            </a>
          </div>
          <TopProductsTable
            data={analytics?.topProductsMonth ?? []}
            loading={loading}
            maxQty={monthMax}
          />
        </div>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-emerald-700 hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse bg-gray-100" />)}</div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No orders yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="font-medium text-gray-800">{o.shipping_details?.name ?? 'Guest'}</div>
                    <div className="text-xs text-gray-400">{o.order_id} · {formatDate(o.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(o.amount)}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 font-medium ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" /> Low Stock
            </h2>
            <a href="/admin/products" className="text-xs text-emerald-700 hover:underline flex items-center gap-1">
              Manage <ArrowUpRight size={12} />
            </a>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse bg-gray-100" />)}</div>
          ) : lowStock.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">All products well-stocked</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="font-medium text-gray-800 truncate max-w-[200px]">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.category}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 ${
                    p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
