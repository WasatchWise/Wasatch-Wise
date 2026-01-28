import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_CONFIG } from '@/lib/stripe-config';

const stripe = STRIPE_CONFIG.secretKey
  ? new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: STRIPE_CONFIG.apiVersion,
    })
  : null;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata || session.metadata.is_gift !== 'true') {
      return NextResponse.json(
        { error: 'Not a gift purchase' },
        { status: 400 }
      );
    }

    // Return gift details from session metadata
    return NextResponse.json({
      tripkitName: session.metadata.tripkit_name || 'TripKit',
      recipientName: session.metadata.recipient_name || 'Recipient',
      recipientEmail: session.metadata.recipient_email || '',
      deliveryDate: session.metadata.delivery_date || 'immediate',
      giftMessage: session.metadata.gift_message || '',
    });

  } catch (error: unknown) {
    console.error('Error fetching gift details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch gift details';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
