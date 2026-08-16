import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { razorpay_order_id, razorpay_payment_id, error: paymentError, userId } = body;

  // Log failed payment for admin visibility
  const { error: dbError } = await supabaseAdmin.from('user_orders').insert({
    user_id: userId ?? null,
    order_id: razorpay_order_id ?? null,
    amount: 0,
    items: [],
    status: 'Failed',
    shipping_details: {
      payment_id: razorpay_payment_id ?? null,
    },
    payment_method: 'Razorpay',
    error: paymentError ?? 'Payment failed',
  });

  if (dbError) {
    console.error('Failed to log payment failure:', dbError.message);
  }

  return NextResponse.json({ received: true });
}
