import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  // Create Supabase client inside function to avoid build-time errors
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await req.json();
    const { tier, name, email, role, appName, appUrl } = body;

    // Validate required fields
    if (!tier || !name || !email || !appName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate tier
    const tierPrices: Record<string, number> = {
      basic: 4900, // $49 in cents
      standard: 14900, // $149 in cents
      premium: 29900, // $299 in cents
    };

    const price = tierPrices[tier];
    if (!price) {
      return NextResponse.json(
        { error: 'Invalid review tier' },
        { status: 400 }
      );
    }

    // Create review record in database (pending payment)
    const { data: review, error: dbError } = await supabase
      .from('app_reviews')
      .insert({
        customer_name: name,
        customer_email: email,
        customer_role: role || null,
        app_name: appName,
        app_url: appUrl || null,
        review_tier: tier,
        price_paid_cents: price,
        status: 'submitted',
      })
      .select()
      .single();

    if (dbError || !review) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create review record' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} App Review - ${appName}`,
              description: `App safety review for ${appName}`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wasatchwise.com'}/ask-before-you-app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wasatchwise.com'}/ask-before-you-app/request`,
      customer_email: email,
      metadata: {
        review_id: review.id,
        tier: tier,
        app_name: appName,
      },
    });

    // Update review with Stripe payment intent ID
    await supabase
      .from('app_reviews')
      .update({ stripe_payment_intent_id: session.payment_intent as string })
      .eq('id', review.id);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
