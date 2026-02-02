import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Validate environment variables at startup
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not configured');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not configured');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  logger.info('Stripe checkout request received');

  // Validate environment variables are present
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Stripe Checkout] Missing STRIPE_SECRET_KEY');
    return NextResponse.json({ error: 'Server configuration error: Missing Stripe key' }, { status: 500 });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Stripe Checkout] Missing Supabase configuration');
    return NextResponse.json({ error: 'Server configuration error: Missing database config' }, { status: 500 });
  }

  let body: { tripkitId?: string };
  try {
    body = await request.json();
  } catch {
    logger.warn('[Stripe Checkout] 400: invalid_request_body');
    console.warn('[Stripe Checkout] 400: invalid_request_body'); // Vercel logs (logger is dev-only for warn)
    return NextResponse.json({ error: 'Invalid request body', code: 'invalid_body' }, { status: 400 });
  }

  const { tripkitId } = body;

  try {
    // Resolve authenticated user from cookies (do NOT trust client-provided user ids)
    const cookieStore = cookies();
    const supabaseSSR = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user } } = await supabaseSSR.auth.getUser();
    const userId = user?.id;

    logger.info('Processing Stripe checkout', { tripkitId, userId: userId ? userId.substring(0, 8) + '...' : undefined });

    if (!userId) {
      logger.warn('[Stripe Checkout] 401: user_not_authenticated', { tripkitId });
      console.warn('[Stripe Checkout] 401: user_not_authenticated', tripkitId);
      return NextResponse.json({ error: 'User not authenticated', code: 'auth_required' }, { status: 401 });
    }

    if (!tripkitId) {
      logger.warn('[Stripe Checkout] 400: tripkit_id_required');
      console.warn('[Stripe Checkout] 400: tripkit_id_required');
      return NextResponse.json({ error: 'TripKit ID required', code: 'tripkit_id_required' }, { status: 400 });
    }

    // Fetch TripKit details
    logger.info('Fetching TripKit', { tripkitId });
    const { data: tripkit, error } = await supabase
      .from('tripkits')
      .select('*')
      .eq('id', tripkitId)
      .single();

    if (error || !tripkit) {
      console.error('[Stripe Checkout] TripKit not found:', { tripkitId, error });
      return NextResponse.json({ error: 'TripKit not found' }, { status: 404 });
    }
    logger.info('Found TripKit', { name: tripkit.name, price: tripkit.price, code: tripkit.code });

    // Check if user already has access
    logger.info('Checking existing TripKit access');
    const { data: existingAccess } = await supabase
      .from('customer_product_access')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', tripkitId)
      .eq('product_type', 'tripkit')
      .maybeSingle();

    if (existingAccess) {
      logger.info('[Stripe Checkout] 400: already_owned', { tripkitId, userId: userId.substring(0, 8) });
      console.warn('[Stripe Checkout] 400: already_owned', tripkitId);
      return NextResponse.json({ error: 'You already own this TripKit', code: 'already_owned' }, { status: 400 });
    }

    // Validate required data before calling Stripe
    if (!tripkit.price || isNaN(tripkit.price) || tripkit.price <= 0) {
      logger.warn('[Stripe Checkout] 400: invalid_price', { tripkitId, price: tripkit.price });
      console.warn('[Stripe Checkout] 400: invalid_price', tripkitId, tripkit.price);
      return NextResponse.json({ error: 'Invalid TripKit price', code: 'invalid_price' }, { status: 400 });
    }

    if (!tripkit.name) {
      logger.warn('[Stripe Checkout] 400: invalid_name', { tripkitId });
      console.warn('[Stripe Checkout] 400: invalid_name', tripkitId);
      return NextResponse.json({ error: 'Invalid TripKit name', code: 'invalid_name' }, { status: 400 });
    }

    // Get site URL with fallback
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      logger.error('NEXT_PUBLIC_SITE_URL not configured, using fallback', { fallback: siteUrl });
    }

    // Validate slug exists
    if (!tripkit.slug) {
      logger.error('TripKit missing slug', { tripkitId, name: tripkit.name, code: tripkit.code });
      return NextResponse.json({ error: 'TripKit configuration error: missing slug' }, { status: 500 });
    }

    // Construct URLs
    const successUrl = `${siteUrl}/account/my-tripkits?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/tripkits/${tripkit.slug}?canceled=true`;

    // Ensure image URL is absolute
    let imageUrl = tripkit.cover_image_url;
    if (imageUrl && imageUrl.startsWith('/')) {
      imageUrl = `${siteUrl}${imageUrl}`;
    }

    // Log URLs for debugging
    logger.info('Stripe checkout URLs', {
      siteUrl,
      successUrl,
      cancelUrl,
      slug: tripkit.slug,
      imageUrl
    });

    // Create Stripe checkout session
    logger.info('Creating Stripe checkout session');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tripkit.name,
              description: tripkit.tagline || tripkit.description || undefined,
              images: imageUrl ? [imageUrl] : undefined,
            },
            unit_amount: Math.round(tripkit.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        tripkit_id: tripkitId,
        tripkit_code: tripkit.code,
      },
      customer_email: undefined, // Stripe will prompt for email
    });

    logger.info('Stripe session created', { sessionId: session.id });
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorType = (error && typeof error === 'object' && 'type' in error) ? (error as any).type : undefined;
    logger.error('Stripe checkout error', {
      error: errorMessage,
      type: errorType,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'undefined'
    });
    // Server/Stripe/DB errors → 500 so client can show "try again" not "bad request"
    return NextResponse.json({
      error: 'Checkout failed. Please try again or contact support.'
    }, { status: 500 });
  }
}
