import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

// GET /api/admin/customers
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get('page')  ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const search = searchParams.get('search') ?? '';
  const from = (page - 1) * limit;

  // Separate count query (joining user_orders breaks count: exact)
  let countQuery = supabaseAdmin
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });
  if (search) countQuery = countQuery.ilike('email', `%${search}%`);
  const { count } = await countQuery;

  // Data query with order count joined
  let dataQuery = supabaseAdmin
    .from('user_profiles')
    .select('*, user_orders(count)')
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);
  if (search) dataQuery = dataQuery.ilike('email', `%${search}%`);

  const { data, error: dbErr } = await dataQuery;
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  return NextResponse.json({ data, count: count ?? 0 });
}
