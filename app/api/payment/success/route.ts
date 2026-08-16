import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth-helper';

export async function POST(request: Request) {
  const { user, error: authError } = await requireAuth(request);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    email,
    name,
    shippingAddress,
    items,
    amount,
    couponCode,
    couponDiscount,
  } = body;

  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // Save order to Supabase
  const { data: order, error: dbError } = await supabaseAdmin
    .from('user_orders')
    .insert({
      user_id: user.id,
      order_id: razorpay_order_id,
      amount: Math.round(amount),
      items: items ?? [],
      status: 'Processing',
      shipping_details: {
        ...shippingAddress,
        name,
        email,
        payment_id: razorpay_payment_id,
        coupon_code: couponCode ?? null,
        coupon_discount: couponDiscount ?? 0,
      },
      payment_method: 'Razorpay',
    })
    .select()
    .single();

  if (dbError) {
    console.error('Order save error:', dbError.message);
    // Still return success — payment already captured
    return NextResponse.json({ success: true, orderId: razorpay_order_id, dbError: dbError.message });
  }

  // Mark coupon as used (deactivate single-use coupons)
  if (couponCode) {
    await supabaseAdmin
      .from('coupons')
      .update({ is_active: false })
      .eq('code', couponCode.toUpperCase());
  }

  // Reduce stock for each item
  for (const item of items ?? []) {
    const numId = Number(item.id);
    if (!isNaN(numId)) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', numId)
        .single();
      if (product && product.stock > 0) {
        await supabaseAdmin
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq('id', numId);
      }
    }
  }

  return NextResponse.json({ success: true, orderId: razorpay_order_id, dbOrderId: order.id });
}
