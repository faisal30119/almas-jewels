import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { code } = body;

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
  }

  // Return `discount` field — matches what checkout page reads as `data.discount`
  return NextResponse.json({
    discount: data.discount_amount,
    code: data.code,
  });
}
