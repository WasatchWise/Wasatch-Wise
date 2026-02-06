import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as Sentry from '@sentry/nextjs';
import { STRIPE_CONFIG } from '@/lib/stripe-config';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
import sgMail from '@sendgrid/mail';
import { logger } from '@/lib/logger';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const stripe = STRIPE_CONFIG.secretKey
  ? new Stripe(STRIPE_CONFIG.secretKey, {
    apiVersion: STRIPE_CONFIG.apiVersion,
  })
  : null;

/**
 * Stripe Webhook Handler
 *
 * Handles payment confirmation and updates database
 * IMPORTANT: This endpoint must be configured in Stripe Dashboard
 */
export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    console.error('Stripe is not configured');
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  // Check if webhook secret is configured
  if (!STRIPE_CONFIG.webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        logger.info('Unhandled Stripe event type', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook handler error:', error);
    Sentry.captureException(error, {
      extra: { eventType: event.type, eventId: event.id },
      tags: { component: 'stripe-webhook-fulfillment' },
    });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get user_id from email
 */
async function getUserIdFromEmail(email: string): Promise<string | null> {
  try {
    // Look up user in profiles table
    // Note: profiles should have FK to auth.users, so if id exists here it's valid
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !data?.id) {
      logger.info('No user found for email', { email });
      return null;
    }

    return data.id as string;
  } catch (error) {
    console.error('Error looking up user by email:', error);
    return null;
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout session', { sessionId: session.id });

  const metadata = session.metadata;
  const customerEmail = session.customer_details?.email;
  const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

  // Check if this is a Welcome Wagon purchase
  if (metadata?.product_type === 'welcome-wagon') {
    await handleWelcomeWagonPurchase(session, customerEmail, amountPaid);
    return;
  }

  // Check if this is a StayKit purchase
  if (metadata?.product_type === 'staykit' && metadata?.staykit_id && metadata?.user_id) {
    await handleStayKitPurchase(session, metadata.user_id, metadata.staykit_id, amountPaid, customerEmail);
    return;
  }

  // Otherwise, handle as TripKit purchase
  if (!metadata || !metadata.tripkit_id) {
    logger.warn('Missing tripkit_id in session metadata', { sessionId: session.id, metadata: metadata ?? {} });
    return;
  }

  const tripkitId = metadata.tripkit_id;
  const isFounderPrice = metadata.is_founder_price === 'true';

  try {
    // Fetch current TripKit data
    const { data: currentTripkit, error: fetchError } = await supabase
      .from('tripkits')
      .select('download_count, founder_sold')
      .eq('id', tripkitId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch TripKit:', fetchError);
    } else if (currentTripkit) {
      // Update TripKit analytics with incremented values
      const updates: any = {
        download_count: currentTripkit.download_count + 1,
      };

      if (isFounderPrice) {
        updates.founder_sold = currentTripkit.founder_sold + 1;
      }

      const { error: updateError } = await supabase
        .from('tripkits')
        .update(updates)
        .eq('id', tripkitId);

      if (updateError) {
        console.error('Failed to update TripKit stats:', updateError);
      }
    }

    // Extract attribution data from metadata
    const attribution = {
      utm_source: metadata.utm_source || null,
      utm_medium: metadata.utm_medium || null,
      utm_campaign: metadata.utm_campaign || null,
      referrer: metadata.referrer || null,
      landing_page: metadata.landing_page || null,
    };

    // Record the purchase in the database
    // Note: purchases table uses user_id, not customer_email
    // Resolve user_id early so we can use it for the purchase record
    let userId: string | null | undefined = metadata.user_id;
    if (!userId && customerEmail) {
      userId = await getUserIdFromEmail(customerEmail);
    }

    let purchaseRecord: { id: string } | null = null;
    let purchaseError: Error | null = null;

    // Only insert into purchases if we have a user_id (table requires it)
    if (userId) {
      const result = await supabase
        .from('purchases')
        .insert({
          tripkit_id: tripkitId,
          user_id: userId,
          amount_paid: amountPaid,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'completed',
          purchased_at: new Date().toISOString(),
          // Attribution tracking
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
          utm_campaign: attribution.utm_campaign,
          referrer: attribution.referrer,
          landing_page: attribution.landing_page,
          // Store extra data in metadata
          metadata: {
            customer_email: customerEmail,
            is_founder_price: isFounderPrice,
          },
        })
        .select()
        .single();

      purchaseRecord = result.data;
      purchaseError = result.error as Error | null;
    } else {
      logger.info('Skipping purchases table insert - no user_id available', { email: customerEmail });
    }

    if (purchaseError) {
      console.error('Failed to record purchase:', purchaseError);
      // Continue even if purchase recording fails - payment went through
    } else if (purchaseRecord) {
      logger.info('Purchase recorded successfully', { purchaseId: purchaseRecord.id });
    }

    // Generate unique access code for this purchase
    let accessCode = '';
    if (customerEmail) {
      const { data: generatedCode, error: generateError } = await supabase
        .rpc('generate_tripkit_access_code');

      if (generateError || !generatedCode) {
        console.error('Failed to generate access code:', generateError);
        // Fallback: generate locally
        accessCode = `TK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      } else {
        accessCode = generatedCode;
      }

      // Store access code in database
      const { error: accessCodeError } = await supabase
        .from('tripkit_access_codes')
        .insert({
          access_code: accessCode,
          tripkit_id: tripkitId,
          customer_email: customerEmail,
          customer_name: session.customer_details?.name || null,
          purchase_id: purchaseRecord?.id,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          amount_paid: amountPaid,
          generated_by: 'stripe-webhook',
          is_active: true,
          // Attribution tracking
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
          utm_campaign: attribution.utm_campaign,
          referrer: attribution.referrer,
          landing_page: attribution.landing_page,
        })
        .select()
        .single();

      if (accessCodeError) {
        console.error('Failed to store access code:', accessCodeError);
      } else {
        logger.info('Access code generated', { accessCode });
      }

      // Grant access in customer_product_access table
      // userId was already resolved earlier in the function
      if (userId) {
        const { error: accessRecordError } = await supabase
          .from('customer_product_access')
          .insert({
            user_id: userId,
            product_id: tripkitId,
            product_type: 'tripkit',
            access_type: 'purchased',
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount_paid: Math.round(amountPaid * 100), // Convert to cents
            access_granted_at: new Date().toISOString(),
          });

        if (accessRecordError) {
          console.error('Failed to create customer_product_access record:', accessRecordError);
        } else {
          logger.info('Customer access granted', { userId, tripkitId });
        }
      } else {
        logger.warn('Could not grant access - user not found', { email: customerEmail, metadataUserId: metadata.user_id });
      }
    }

    // Send confirmation email to customer with access code
    const accessUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/tk/${accessCode}`;

    if (customerEmail && process.env.SENDGRID_API_KEY) {
      try {
        const emailHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #1e40af; margin-bottom: 20px;">🎉 Thanks for your purchase!</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Your payment has been processed successfully. You now have access to:
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 24px;">${metadata.tripkit_name}</h2>
              <p style="color: #e5e7eb; margin: 10px 0 0 0;">Paid: $${amountPaid.toFixed(2)}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${accessUrl}" 
                 style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
                🚀 Access Your TripKit
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px;">
                <strong>📌 Save Your Access Code:</strong><br/>
                <code style="background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-family: monospace; display: inline-block; margin-top: 8px;">${accessCode}</code>
              </p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
                SLCTrips • From Salt Lake, to Everywhere<br/>
                <a href="mailto:Dan@slctrips.com" style="color: #6b7280;">Dan@slctrips.com</a>
              </p>
            </div>
          </div>
        `;

        await sgMail.send({
          to: customerEmail,
          from: 'SLCTrips <dan@slctrips.com>',
          subject: `🎉 Your ${metadata.tripkit_name} is ready!`,
          html: emailHtml,
        });

        logger.info('Purchase confirmation email sent', { email: customerEmail });
      } catch (error) {
        console.error('❌ Error sending purchase confirmation email:', error);
      }
    } else {
      logger.info('Email pending - confirmation needed', {
        email: customerEmail,
        tripkit_code: metadata.tripkit_code,
        tripkit_name: metadata.tripkit_name,
        amount_paid: amountPaid,
        access_code: accessCode,
      });
    }

    // Add to email marketing list if they opted in
    if (metadata.email_opt_in === 'true' && customerEmail) {
      const { error: emailError } = await supabase
        .from('email_captures')
        .insert({
          email: customerEmail,
          source: 'tripkit-purchase',
          visitor_type: 'customer',
          preferences: ['tripkits'],
          created_at: new Date().toISOString(),
        });

      if (emailError) {
        console.warn('Could not add to email list:', emailError);
      }
    }

  } catch (error) {
    console.error('Error processing checkout completion:', error);
    throw error;
  }
}

/**
 * Handle StayKit purchase: grant access and send confirmation email.
 */
async function handleStayKitPurchase(
  session: Stripe.Checkout.Session,
  userId: string,
  staykitId: string,
  amountPaid: number,
  customerEmail: string | null | undefined
) {
  const metadata = session.metadata ?? {};
  logger.info('Processing StayKit purchase', { sessionId: session.id, staykitId, userId });

  try {
    const { error: accessError } = await supabase
      .from('customer_product_access')
      .insert({
        user_id: userId,
        product_id: staykitId,
        product_type: 'staykit',
        access_type: 'purchased',
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        amount_paid: Math.round(amountPaid * 100),
        access_granted_at: new Date().toISOString(),
      });

    if (accessError) {
      console.error('Failed to grant StayKit access:', accessError);
      throw accessError;
    }
    logger.info('StayKit access granted', { userId, staykitId });

    const productName = metadata.staykit_name ?? 'StayKit';
    if (customerEmail && process.env.SENDGRID_API_KEY) {
      try {
        const accessUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com'}/my-staykit`;
        const emailHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #059669; margin-bottom: 20px;">🎉 Your StayKit is ready!</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Your payment has been processed. You now have access to:
            </p>
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 24px;">${productName}</h2>
              <p style="color: #ccfbf1; margin: 10px 0 0 0;">Paid: $${amountPaid.toFixed(2)}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${accessUrl}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
                🚀 Open My StayKit
              </a>
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px;">SLCTrips • From Salt Lake, to Everywhere<br/>
              <a href="mailto:Dan@slctrips.com" style="color: #6b7280;">Dan@slctrips.com</a></p>
            </div>
          </div>
        `;
        await sgMail.send({
          to: customerEmail,
          from: 'SLCTrips <dan@slctrips.com>',
          subject: `🎉 Your ${productName} is ready!`,
          html: emailHtml,
        });
        logger.info('StayKit confirmation email sent', { email: customerEmail });
      } catch (error) {
        console.error('Error sending StayKit confirmation email:', error);
      }
    }
  } catch (error) {
    console.error('Error processing StayKit purchase:', error);
    throw error;
  }
}

/**
 * Handle Welcome Wagon purchase
 */
async function handleWelcomeWagonPurchase(
  session: Stripe.Checkout.Session,
  customerEmail: string | null | undefined,
  amountPaid: number
) {
  logger.info('Processing Welcome Wagon purchase', { sessionId: session.id });

  const metadata = session.metadata;

  try {
    // Extract attribution data from metadata
    const attribution = {
      utm_source: metadata?.utm_source || null,
      utm_medium: metadata?.utm_medium || null,
      utm_campaign: metadata?.utm_campaign || null,
      referrer: metadata?.referrer || null,
      landing_page: metadata?.landing_page || null,
    };

    // Note: The 'purchases' table is TripKit-specific (requires tripkit_id).
    // For Welcome Wagon, we only use customer_product_access for entitlements.
    // Log the purchase for analytics but don't insert into purchases table.
    logger.info('Welcome Wagon purchase completed', {
      sessionId: session.id,
      amount: amountPaid,
      email: customerEmail,
    });

    // Grant access to Welcome Wagon content
    if (customerEmail) {
      const userId = await getUserIdFromEmail(customerEmail);
      if (userId) {
        const { error: accessError } = await supabase
          .from('customer_product_access')
          .insert({
            user_id: userId,
            product_type: 'welcome-wagon',
            product_id: metadata?.product_id || 'welcome-wagon-90-day',
            access_type: 'purchased',
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount_paid: Math.round(amountPaid * 100), // Convert to cents
            access_granted_at: new Date().toISOString(),
          })
          .select();

        if (accessError) {
          console.warn('Could not grant Welcome Wagon access:', accessError);
        } else {
          logger.info('Welcome Wagon access granted', { userId });
        }
      } else {
        logger.warn('Could not grant Welcome Wagon access - user not found for email', { email: customerEmail });
      }
    }

    // Send confirmation email to customer
    if (customerEmail && process.env.SENDGRID_API_KEY) {
      try {
        const productName = metadata?.product_name || 'Welcome Wagon 90-Day Guide';
        const emailHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #1e40af; margin-bottom: 20px;">🎉 Welcome to Utah!</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Your relocation guide is ready! Your ${productName} has been purchased.
            </p>
            
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 24px;">${productName}</h2>
              <p style="color: #fee2e2; margin: 10px 0 0 0;">Paid: $${amountPaid.toFixed(2)}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com'}/welcome-wagon/access" 
                 style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
                🚀 Access Your Guide
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
                SLCTrips • From Salt Lake, to Everywhere<br/>
                <a href="mailto:Dan@slctrips.com" style="color: #6b7280;">Dan@slctrips.com</a>
              </p>
            </div>
          </div>
        `;

        await sgMail.send({
          to: customerEmail,
          from: 'SLCTrips <dan@slctrips.com>',
          subject: `🎉 Your ${productName} is ready!`,
          html: emailHtml,
        });

        logger.info('Welcome Wagon confirmation email sent', { email: customerEmail });
      } catch (error) {
        console.error('❌ Error sending Welcome Wagon confirmation email:', error);
      }
    } else {
      logger.info('Email pending - Welcome Wagon confirmation needed', {
        email: customerEmail,
        product_name: metadata?.product_name || 'Welcome Wagon 90-Day Guide',
        amount_paid: amountPaid,
      });
    }

    // Add to email marketing list for Welcome Wagon updates
    if (customerEmail) {
      const { error: emailError } = await supabase
        .from('email_captures')
        .insert({
          email: customerEmail,
          source: 'welcome-wagon-purchase',
          visitor_type: 'relocating',
          preferences: ['staykit', 'tripkits'],
          created_at: new Date().toISOString(),
        });

      if (emailError) {
        console.warn('Could not add to email list:', emailError);
      }
    }
  } catch (error) {
    console.error('Error processing Welcome Wagon purchase:', error);
    throw error;
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info('Payment succeeded', { paymentIntentId: paymentIntent.id });
  // Additional payment success logic if needed
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed:', paymentIntent.id);

  const metadata = paymentIntent.metadata;
  const customerEmail = metadata?.customer_email;

  // Log the failed payment for analytics
  // Note: purchases table schema doesn't support failure tracking (no failure_reason column)
  // Just log to console/monitoring instead
  logger.warn('Payment failed', {
    paymentIntentId: paymentIntent.id,
    tripkitId: metadata?.tripkit_id,
    email: customerEmail,
    amount: paymentIntent.amount / 100,
    error: paymentIntent.last_payment_error?.message || 'Unknown error',
  });

  // TODO: Send payment failure notification email when SendGrid is configured
  logger.info('Email pending - payment failure notification needed', { email: customerEmail });
}
