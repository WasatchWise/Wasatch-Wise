import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { staykitId, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    if (!staykitId) {
      return NextResponse.json({ error: 'StayKit ID required' }, { status: 400 });
    }

    // Fetch StayKit details
    const { data: staykit, error } = await supabase
      .from('staykits')
      .select('*')
      .eq('id', staykitId)
      .single();

    if (error || !staykit) {
      return NextResponse.json({ error: 'StayKit not found' }, { status: 404 });
    }

    // Check if user already has access
    const { data: existingAccess } = await supabase
      .from('customer_product_access')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', staykitId)
      .eq('product_type', 'staykit')
      .maybeSingle();

    if (existingAccess) {
      return NextResponse.json({ error: 'You already own this StayKit' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: staykit.name,
              description: staykit.tagline || staykit.description || undefined,
              images: staykit.cover_image_url ? [staykit.cover_image_url] : undefined,
            },
            unit_amount: Math.round(staykit.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/my-staykit?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/staykits?canceled=true`,
      metadata: {
        user_id: userId,
        staykit_id: staykitId,
        staykit_code: staykit.code,
        staykit_name: staykit.name,
        product_type: 'staykit',
      },
      customer_email: undefined, // Stripe will prompt for email
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating StayKit checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
