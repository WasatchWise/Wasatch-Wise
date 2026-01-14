import { NextRequest, NextResponse } from 'next/server';
import { stripe } from './client';
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

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
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
