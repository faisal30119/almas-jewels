'use client';
import { useEffect, useState } from 'react';
import { adminFetch, formatPrice } from '@/lib/admin-utils';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChart: { date: string; revenue: number; orders: number }[];
}

const COLORS = ['#064e3b', '#D4AF37', '#b5952f', '#022c22', '#34d399'];

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 p-5">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/analytics').then((r) => r.json()).then((d) => {
      setData(d.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl font-playfair font-bold text-gray-900 mb-6">Analytics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 animate-pulse bg-gray-100" />)}
        </div>
        <div className="h-64 animate-pulse bg-gray-100" />
      </div>
    );
  }

  if (!data) return <div className="p-4 sm:p-6 text-gray-400">Failed to load analytics</div>;

  // Weekly aggregation from daily data
  const weeklyRevenue: { week: string; revenue: number }[] = [];
  const weekMap: Record<string, number> = {};
  data.revenueChart.forEach((d) => {
    const date = new Date(d.date);
    const weekNum = Math.ceil(date.getDate() / 7);
    const key = `W${weekNum} ${date.toLocaleString('default', { month: 'short' })}`;
    weekMap[key] = (weekMap[key] ?? 0) + d.revenue;
  });
  Object.entries(weekMap).forEach(([week, revenue]) => weeklyRevenue.push({ week, revenue }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-playfair font-bold text-gray-900">Analytics</h1>
        <p className="text-xs sm:text-sm text-gray-500">Business performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPI label="Total Revenue" value={formatPrice(data.totalRevenue)} />
        <KPI label="Total Orders" value={data.totalOrders} />
        <KPI label="Total Customers" value={data.totalCustomers} />
        <KPI label="Total Products" value={data.totalProducts} />
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white border border-gray-200 p-5 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Daily Revenue — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.revenueChart} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#064e3b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#064e3b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} interval={4} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: unknown) => formatPrice(Number(v))} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#064e3b" strokeWidth={2} fill="url(#grad1)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Bar Chart */}
        <div className="bg-white border border-gray-200 p-5">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Daily Order Volume</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.revenueChart} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} interval={4} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" name="Orders" fill="#D4AF37" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Revenue Bar Chart */}
        <div className="bg-white border border-gray-200 p-5">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyRevenue} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => formatPrice(Number(v))} />
              <Bar dataKey="revenue" name="Revenue" fill="#064e3b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 p-5 mt-6">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">30-Day Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Avg Order Value</div>
            <div className="font-bold text-gray-900">{data.totalOrders > 0 ? formatPrice(Math.round(data.totalRevenue / data.totalOrders)) : '—'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Revenue per Customer</div>
            <div className="font-bold text-gray-900">{data.totalCustomers > 0 ? formatPrice(Math.round(data.totalRevenue / data.totalCustomers)) : '—'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Daily Avg Orders</div>
            <div className="font-bold text-gray-900">{(data.totalOrders / 30).toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Daily Avg Revenue</div>
            <div className="font-bold text-gray-900">{formatPrice(Math.round(data.totalRevenue / 30))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
