import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth-helper';

export async function POST(request: Request) {
  const { user, error: authError } = await requireAuth(request);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
  }

  // Fetch the order and verify it belongs to this user.
  // The profile page sends the Razorpay order_id string (e.g. "order_Xxx").
  // Fall back to numeric DB id if the value is a plain number.
  const isRazorpayId = typeof orderId === 'string' && orderId.startsWith('order_');
  const query = supabaseAdmin
    .from('user_orders')
    .select('*')
    .eq('user_id', user.id);
  const { data: order, error: fetchError } = await (
    isRazorpayId
      ? query.eq('order_id', orderId).single()
      : query.eq('id', Number(orderId)).single()
  );

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!['Processing', 'Confirmed'].includes(order.status)) {
    return NextResponse.json({ error: `Cannot cancel an order with status: ${order.status}` }, { status: 400 });
  }

  // Attempt Razorpay refund if there's a payment ID
  const paymentId = order.shipping_details?.payment_id;
  let refundId: string | undefined;

  if (paymentId && process.env.RAZORPAY_KEY_ID) {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: order.amount * 100, // paise
        notes: { reason: 'Customer cancellation', order_id: orderId },
      });
      refundId = refund.id;
    } catch (err: unknown) {
      // Log but don't block — update status regardless
      console.error('Razorpay refund failed:', err instanceof Error ? err.message : err);
    }
  }

  // Update order status to Cancelled
  const { error: updateError } = await supabaseAdmin
    .from('user_orders')
    .update({
      status: 'Cancelled',
      shipping_details: {
        ...order.shipping_details,
        refund_id: refundId ?? null,
        cancelled_at: new Date().toISOString(),
      },
    })
    .eq('id', order.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, refundId: refundId ?? null });
}
