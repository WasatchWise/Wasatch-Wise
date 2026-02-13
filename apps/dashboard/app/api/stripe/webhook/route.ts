import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/lib/stripe/webhooks';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  return verifyStripeWebhook(req, async (event: Stripe.Event) => {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const productType = session.metadata?.product_type;
      const productName = session.metadata?.product_name;

      if (session.payment_status !== 'paid') return;

      const customerEmail =
        session.customer_email ||
        (typeof session.customer === 'string'
          ? null
          : (session.customer as Stripe.Customer)?.email);
      if (!customerEmail) {
        console.warn('[Stripe webhook] No customer email for session', session.id);
        return;
      }

      if (productType === 'starter-kit') {
        await supabase.from('product_purchases').insert({
          customer_email: customerEmail,
          product_type: 'starter-kit',
          product_name: productName || 'AI Governance Starter Kit',
          stripe_session_id: session.id,
        });

        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wasatchwise.com';
        const downloadPageUrl = `${siteUrl}/starter-kit/success?session_id=${session.id}`;

        const resend = new Resend(process.env.RESEND_API_KEY);
        if (process.env.RESEND_API_KEY) {
          resend.emails
            .send({
              from: 'WasatchWise <hello@wasatchwise.com>',
              to: customerEmail,
              subject: 'Your AI Governance Starter Kit is Ready',
              html: getStarterKitEmailHtml(downloadPageUrl),
            })
            .catch((err) => console.error('[Stripe webhook] Resend error:', err));
        }
      }
    }
  });
}

function getStarterKitEmailHtml(downloadPageUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="color:#111827;font-size:24px;margin:0 0 8px;">Your AI Governance Starter Kit</h1>
      <p style="color:#6b7280;font-size:16px;margin:0 0 24px;">Thank you for your purchase.</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">
        Click the button below to access your three professional documents. Links are valid for 24 hours.
        Save the files to your computer for long-term access.
      </p>
      <a href="${downloadPageUrl}"
         style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
        Download Your Starter Kit
      </a>
      <p style="color:#6b7280;font-size:14px;margin-top:24px;">
        Includes: AI Policy Template (13 pages), Vendor Vetting Checklist (7 pages), Board Presentation Template (12 pages).
      </p>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
        Questions? Reply to this email. We read every one.
      </p>
      <p style="color:#374151;font-size:14px;margin-top:24px;">
        John Lyman<br>
        <span style="color:#6b7280;">Founder, WasatchWise</span>
      </p>
    </div>
  </div>
</body>
</html>`;
}
