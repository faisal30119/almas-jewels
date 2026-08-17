import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

// Revalidate every 60 seconds — reduces DB hits on repeat dashboard loads
export const revalidate = 60;

// GET /api/admin/analytics
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const now = Date.now();
  const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since7  = new Date(now -  7 * 24 * 60 * 60 * 1000).toISOString();

  // Run all 3 DB queries in parallel
  const [ordersRes, customersRes, productsRes] = await Promise.all([
    supabaseAdmin
      .from('user_orders')
      .select('amount, status, created_at, items')
      .gte('created_at', since30)
      .not('status', 'eq', 'Failed'),
    supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true }),
  ]);

  const orders30       = ordersRes.data;
  const totalCustomers = customersRes.count;
  const totalProducts  = productsRes.count;

  // ── Revenue / orders chart ───────────────────────────────────────────────
  const revenueByDay: Record<string, number> = {};
  const ordersByDay:  Record<string, number> = {};
  let totalRevenue = 0;
  let totalOrders  = 0;

  // ── Top-products aggregation maps ─────────────────────────────────────────
  // name → { qty, revenue }
  const topWeek:  Record<string, { qty: number; revenue: number }> = {};
  const topMonth: Record<string, { qty: number; revenue: number }> = {};

  (orders30 ?? []).forEach((o) => {
    const day = (o.created_at as string).slice(0, 10);
    revenueByDay[day] = (revenueByDay[day] ?? 0) + (o.amount as number);
    ordersByDay[day]  = (ordersByDay[day]  ?? 0) + 1;
    totalRevenue += o.amount as number;
    totalOrders++;

    const isThisWeek = o.created_at >= since7;
    const items: { name: string; quantity: number; price: number }[] =
      Array.isArray(o.items) ? o.items : [];

    items.forEach((item) => {
      const qty = Number(item.quantity ?? 1);
      const rev = Number(item.price ?? 0) * qty;
      const name = item.name ?? 'Unknown';

      // Month
      topMonth[name] = topMonth[name]
        ? { qty: topMonth[name].qty + qty, revenue: topMonth[name].revenue + rev }
        : { qty, revenue: rev };

      // Week
      if (isThisWeek) {
        topWeek[name] = topWeek[name]
          ? { qty: topWeek[name].qty + qty, revenue: topWeek[name].revenue + rev }
          : { qty, revenue: rev };
      }
    });
  });

  // Build last 30 days array
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }
  const revenueChart = days.map((d) => ({
    date: d,
    revenue: revenueByDay[d] ?? 0,
    orders:  ordersByDay[d]  ?? 0,
  }));

  // Sort and take top 5
  function topN(map: Record<string, { qty: number; revenue: number }>, n = 5) {
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, n);
  }

  return NextResponse.json({
    data: {
      totalRevenue,
      totalOrders,
      totalCustomers: totalCustomers ?? 0,
      totalProducts:  totalProducts  ?? 0,
      revenueChart,
      topProductsWeek:  topN(topWeek),
      topProductsMonth: topN(topMonth),
    },
  });
}
