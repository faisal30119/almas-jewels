import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

// GET /api/admin/orders — list with pagination + filters
export async function GET(req: NextRequest) {
  const { user, error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const status = searchParams.get('status');
  const search = searchParams.get('search') ?? '';
  const from = (page - 1) * limit;

  let query = supabaseAdmin
    .from('user_orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('order_id', `%${search}%`);

  const { data, error: dbErr, count } = await query;
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ data, count });
}

// PATCH /api/admin/orders — update status
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { id, status, tracking_number, notes } = await req.json();
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

  const { data, error: dbErr } = await supabaseAdmin
    .from('user_orders')
    .update({ status, tracking_number, notes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  // add timeline entry
  await supabaseAdmin.from('order_timeline').insert({ order_id: id, status, note: notes ?? null });

  return NextResponse.json({ data });
}
