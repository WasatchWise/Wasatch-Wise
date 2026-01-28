import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const {
      tripkitId,
      senderEmail,
      senderName,
      recipientEmail,
      recipientName,
      giftMessage,
      deliveryDate // ISO string, null = send immediately
    } = await request.json();

    if (process.env.NODE_ENV !== 'production') {
      console.log('[Gift Checkout] Processing gift:', {
        tripkitId,
        senderEmail,
        recipientEmail: recipientEmail?.substring(0, 5) + '...',
        deliveryDate
      });
    }

    if (!tripkitId || !senderEmail || !recipientEmail || !recipientName) {
      return NextResponse.json({
        error: 'Missing required fields: tripkitId, senderEmail, recipientEmail, recipientName'
      }, { status: 400 });
    }

    // Validate scheduled delivery date is not in the past
    if (deliveryDate && deliveryDate !== 'immediate') {
      const scheduledDate = new Date(deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json({
          error: 'Invalid delivery date format'
        }, { status: 400 });
      }

      if (scheduledDate < today) {
        return NextResponse.json({
          error: 'Scheduled delivery date cannot be in the past'
        }, { status: 400 });
      }
    }

    // Fetch TripKit details
    const { data: tripkit, error } = await supabase
      .from('tripkits')
      .select('*')
      .eq('id', tripkitId)
      .single();

    if (error || !tripkit) {
      return NextResponse.json({ error: 'TripKit not found' }, { status: 404 });
    }

    if (!tripkit.price || tripkit.price <= 0) {
      return NextResponse.json({ error: 'Cannot gift a free TripKit' }, { status: 400 });
    }

    // Create Stripe checkout session for gift
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `🎁 Gift: ${tripkit.name}`,
              description: `Gift for ${recipientName}${giftMessage ? ' - "' + giftMessage.substring(0, 50) + '..."' : ''}`,
              images: tripkit.cover_image_url ? [tripkit.cover_image_url] : undefined,
            },
            unit_amount: Math.round(tripkit.price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/gift/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/tripkits/${tripkit.slug}?canceled=true`,
      customer_email: senderEmail,
      metadata: {
        is_gift: 'true',
        tripkit_id: tripkitId,
        tripkit_code: tripkit.code,
        tripkit_name: tripkit.name,
        sender_email: senderEmail,
        sender_name: senderName || '',
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        gift_message: giftMessage || '',
        delivery_date: deliveryDate || 'immediate',
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[Gift Checkout] Session created:', { sessionId: session.id });
    }
    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('[Gift Checkout] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create gift checkout' },
      { status: 500 }
    );
  }
}
