import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from './client';
import { getServerEnv } from '@/lib/env';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function verifyStripeWebhook(
  req: NextRequest,
  handler: (event: Stripe.Event) => Promise<void>
) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  const env = getServerEnv();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 503 }
    );
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    await handler(event);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
