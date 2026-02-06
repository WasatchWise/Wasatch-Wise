import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/lib/stripe/webhooks';
import { getServerEnv } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email/send';

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

        const customerEmail =
          (session.customer_details?.email as string) ||
          (session.customer_email as string) ||
          null;
        const { data: review } = await supabase
          .from('app_reviews')
          .select('customer_email, customer_name, app_name, review_tier')
          .eq('id', reviewId)
          .single();

        const email = customerEmail || review?.customer_email;
        const name = review?.customer_name || 'Customer';
        const appName = review?.app_name || 'App';

        if (process.env.RESEND_API_KEY) {
          await sendEmail({
            to: 'john@wasatchwise.com',
            subject: `[ABYA] Paid app review started: ${appName} (${reviewId})`,
            html: `
              <h2>Paid app review payment received</h2>
              <p><strong>Review ID:</strong> ${reviewId}</p>
              <p><strong>Customer:</strong> ${name} &lt;${email}&gt;</p>
              <p><strong>App:</strong> ${appName}</p>
              <p><strong>Tier:</strong> ${review?.review_tier ?? '—'}</p>
              <p>Status updated to in_progress. Proceed with the review.</p>
            `,
          }).catch((err) => console.error('Webhook admin email failed:', err));

          if (email) {
            await sendEmail({
              to: email,
              subject: 'We received your payment — Ask Before You App review',
              html: `
                <p>Hi ${name},</p>
                <p>Thank you for your payment. Your app review for <strong>${appName}</strong> is now in progress.</p>
                <p>We'll be in touch with next steps and the report when it's ready.</p>
                <p>Best,<br />Ask Before You App</p>
              `,
            }).catch((err) => console.error('Webhook customer email failed:', err));
          }
        }
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // Additional payment success handling if needed
    }
  });
}
