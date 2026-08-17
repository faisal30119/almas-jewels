import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

export async function GET(request: Request) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupons: data });
}

export async function POST(request: Request) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { code, discount_amount, discount_type, min_order_amount, usage_limit, expires_at } = body;

  if (!code || !discount_amount) {
    return NextResponse.json({ error: 'code and discount_amount are required' }, { status: 400 });
  }

  if (typeof discount_amount !== 'number' || discount_amount <= 0) {
    return NextResponse.json({ error: 'discount_amount must be a positive number' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .insert({
      code: code.toUpperCase().trim(),
      discount_amount: Math.round(discount_amount),
      discount_type: discount_type ?? 'flat',
      min_order_amount: Number(min_order_amount ?? 0),
      usage_limit: usage_limit ?? null,
      expires_at: expires_at ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('coupons').delete().eq('id', Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
