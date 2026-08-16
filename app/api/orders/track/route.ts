import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
  }

  // Look up by Razorpay order_id (the string like order_Xxxxxxxxxxx)
  const { data, error } = await supabaseAdmin
    .from('user_orders')
    .select('id, order_id, amount, status, created_at, shipping_details, items')
    .eq('order_id', orderId.trim())
    .neq('status', 'Failed') // Don't expose failed/logged-only records
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order: data });
}
