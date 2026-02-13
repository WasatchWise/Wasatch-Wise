import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';

const STARTER_KIT_PRICE_ID = process.env.STRIPE_STARTER_KIT_PRICE_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const product = body?.product || 'starter-kit';

    if (product !== 'starter-kit') {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Stripe] Missing STRIPE_SECRET_KEY');
      return NextResponse.json(
        { error: 'Checkout is not configured' },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wasatchwise.com';

    const lineItems = STARTER_KIT_PRICE_ID
      ? [{ price: STARTER_KIT_PRICE_ID, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'usd',
              unit_amount: 7900,
              product_data: {
                name: 'AI Governance Starter Kit for School Districts',
                description:
                  '3 professional PDFs: Policy Template, Vendor Checklist, Board Presentation Template',
                images: siteUrl
                  ? [`${siteUrl}/wasatchwiselogo.png`]
                  : undefined,
                metadata: {
                  product_type: 'starter-kit',
                  product_name: 'AI Governance Starter Kit',
                },
              },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${siteUrl}/starter-kit/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/starter-kit`,
      metadata: {
        product_type: 'starter-kit',
        product_name: 'AI Governance Starter Kit',
      },
      customer_email: undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe create-checkout]', error);
    return NextResponse.json(
      { error: 'Checkout failed. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
