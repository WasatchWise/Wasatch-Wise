import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { grantTripKitAccess } from '@/lib/auth';
import { grantStayKitAccess } from '@/lib/staykit';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  logger.info('Received Stripe webhook event', { type: event.type });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info('Payment succeeded', { paymentIntentId: paymentIntent.id });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.error('Payment failed', {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
        });
        Sentry.captureMessage('Stripe payment failed', {
          level: 'warning',
          extra: {
            paymentIntentId: paymentIntent.id,
            error: paymentIntent.last_payment_error?.message,
            code: paymentIntent.last_payment_error?.code,
          },
        });
        break;
      }

      case 'charge.failed': {
        const charge = event.data.object as Stripe.Charge;
        logger.error('Charge failed', {
          chargeId: charge.id,
          failureMessage: charge.failure_message,
          failureCode: charge.failure_code,
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        logger.info('Charge refunded', {
          chargeId: charge.id,
          amount: charge.amount_refunded,
          currency: charge.currency,
        });
        // Future: Revoke access if needed
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info('Subscription event', { type: event.type, subscriptionId: subscription.id });
        // Future: Handle subscription-based TripKits
        break;
      }

      default:
        logger.info('Unhandled Stripe event type', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    // Log to Sentry with full context
    Sentry.captureException(error, {
      extra: {
        eventType: event.type,
        eventId: event.id,
        timestamp: new Date().toISOString(),
      },
      tags: {
        component: 'stripe-webhook',
        eventType: event.type,
      },
    });

    logger.error('Webhook processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      eventType: event.type,
      eventId: event.id,
    });

    // Return 500 to trigger Stripe retry (Stripe will retry for up to 3 days)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout session', { sessionId: session.id });

  // Extract metadata
  const userId = session.metadata?.user_id;
  const tripkitId = session.metadata?.tripkit_id;
  const staykitId = session.metadata?.staykit_id;
  const productType = session.metadata?.product_type;

  // Verify payment was successful
  if (session.payment_status !== 'paid') {
    logger.warn('Payment not completed', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });
    // Don't throw - this is expected for some flows (e.g., async payment methods)
    return;
  }

  try {
    // Handle StayKit purchase
    if (productType === 'staykit' && staykitId && userId) {
      await grantStayKitAccess(userId, staykitId, 'purchased');

      logger.info('StayKit access granted', {
        userId,
        staykitId,
        sessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
      });
      return;
    }

    // Handle TripKit purchase (legacy)
    if (tripkitId && userId) {
      await grantTripKitAccess(userId, tripkitId, 'purchased');

      logger.info('TripKit access granted', {
        userId,
        tripkitId,
        sessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
      });
      return;
    }

    // Log missing metadata - this indicates a checkout flow issue
    logger.error('Missing metadata in checkout session', {
      sessionId: session.id,
      userId,
      tripkitId,
      staykitId,
      productType,
    });
    Sentry.captureMessage('Checkout session missing required metadata', {
      level: 'error',
      extra: { sessionId: session.id, userId, tripkitId, staykitId, productType },
    });

    // Optional: Send confirmation email
    // await sendPurchaseConfirmationEmail(userId, tripkitId);

  } catch (error: unknown) {
    console.error('Error granting product access:', error);
    throw error;
  }
}
