import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { requireAuth } from '@/lib/auth-helper';

export async function POST(request: Request) {
  const { user, error: authError } = await requireAuth(request);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { amount, email, name } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay uses paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        email: email ?? '',
        name: name ?? '',
        user_id: user.id,
      },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
