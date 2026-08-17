import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

// GET /api/admin/customers
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page   = parseInt(searchParams.get('page')  ?? '1');
  const limit  = parseInt(searchParams.get('limit') ?? '20');
  const search = searchParams.get('search') ?? '';
  const from   = (page - 1) * limit;

  // Count query
  let countQ = supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true });
  if (search) countQ = countQ.ilike('email', `%${search}%`);
  const { count } = await countQ;

  // Data query — no join (no FK between user_profiles and user_orders)
  let dataQ = supabaseAdmin
    .from('user_profiles')
    .select('id, uid, email, display_name, created_at')
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);
  if (search) dataQ = dataQ.ilike('email', `%${search}%`);
  const { data, error: dbErr } = await dataQ;
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  // Fetch order counts per user in one query
  const uids = (data ?? []).map((u) => u.uid);
  let orderCounts: Record<string, number> = {};
  if (uids.length > 0) {
    const { data: orders } = await supabaseAdmin
      .from('user_orders')
      .select('user_id')
      .in('user_id', uids);
    (orders ?? []).forEach((o) => {
      orderCounts[o.user_id] = (orderCounts[o.user_id] ?? 0) + 1;
    });
  }

  // Attach order count to each customer
  const enriched = (data ?? []).map((u) => ({
    ...u,
    order_count: orderCounts[u.uid] ?? 0,
  }));

  return NextResponse.json({ data: enriched, count: count ?? 0 });
}
