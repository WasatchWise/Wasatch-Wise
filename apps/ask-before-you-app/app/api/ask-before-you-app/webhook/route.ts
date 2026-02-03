import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/lib/stripe/webhooks';
import { getServerEnv } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const env = getServerEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY required for webhook' },
      { status: 503 }
    );
  }
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  return verifyStripeWebhook(req, async (event: Stripe.Event) => {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const reviewId = session.metadata?.review_id;

      if (reviewId) {
        // Update review status to paid
        await supabase
          .from('app_reviews')
          .update({
            status: 'in_progress',
            stripe_customer_id: session.customer as string,
            started_at: new Date().toISOString(),
          })
          .eq('id', reviewId);

        // TODO: Send email notification to you (admin)
        // TODO: Send confirmation email to customer
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // Additional payment success handling if needed
    }
  });
}
