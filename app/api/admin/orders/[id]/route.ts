import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

// GET /api/admin/orders/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { data: order, error: dbErr } = await supabaseAdmin
    .from('user_orders')
    .select('*')
    .eq('id', params.id)
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 404 });

  const { data: timeline } = await supabaseAdmin
    .from('order_timeline')
    .select('*')
    .eq('order_id', params.id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ data: { ...order, timeline: timeline ?? [] } });
}
