import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_CONFIG, getActivePrice, validateStripeConfig } from '@/lib/stripe-config';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
import { TripKit } from '@/types/database.types';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { AttributionData } from '@/lib/attribution';

// Validate configuration on module load
validateStripeConfig();

// Initialize Stripe only if secret key is available
const stripe = STRIPE_CONFIG.secretKey
  ? new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: STRIPE_CONFIG.apiVersion,
    })
  : null;

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please contact support.' },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { tripkitId, productType, productId, successUrl, cancelUrl, attribution } = body as {
    tripkitId?: string;
    productType?: string;
    productId?: string;
    successUrl?: string;
    cancelUrl?: string;
    attribution?: AttributionData | Record<string, string | null>;
  };

  try {
    // Handle Welcome Wagon checkout
    if (productType === 'welcome-wagon') {
      return await handleWelcomeWagonCheckout(request, productId, successUrl, cancelUrl, attribution);
    }

    // Handle TripKit checkout (existing flow)
    if (!tripkitId) {
      return NextResponse.json(
        { error: 'TripKit ID is required' },
        { status: 400 }
      );
    }

    // Resolve authenticated user from cookies (best-effort).
    // This ensures webhook can grant `customer_product_access` for logged-in purchases.
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
    const resolvedUserId = user?.id;

    // Fetch TripKit from database (source of truth)
    const { data: tripkit, error: fetchError } = await supabase
      .from('tripkits')
      .select('*')
      .eq('id', tripkitId)
      .single();

    if (fetchError || !tripkit) {
      console.error('TripKit fetch error:', fetchError);
      return NextResponse.json(
        { error: 'TripKit not found' },
        { status: 404 }
      );
    }

    const tripkitData = tripkit as TripKit;

    // Check if TripKit is available for purchase
    if (tripkitData.status !== 'active' && tripkitData.status !== 'freemium') {
      return NextResponse.json(
        { error: 'This TripKit is not available for purchase' },
        { status: 400 }
      );
    }

    // Handle free TripKits
    if (tripkitData.price === 0) {
      return NextResponse.json(
        { error: 'This TripKit is free. No payment required.' },
        { status: 400 }
      );
    }

    // Get active price (handles founder pricing logic)
    const priceInCents = getActivePrice(tripkitData);

    // Determine success and cancel URLs
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com';
    const finalSuccessUrl = successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/tripkits/${tripkitData.slug}`;

    // Prepare product image
    const productImage = tripkitData.cover_image_url || `${baseUrl}/images/Site_logo.png`;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tripkitData.name,
              description: tripkitData.tagline || tripkitData.description,
              images: [productImage],
              metadata: {
                tripkit_id: tripkitData.id,
                tripkit_code: tripkitData.code,
              },
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        building_id: 'B002',
        ...(resolvedUserId ? { user_id: resolvedUserId } : {}),
        tripkit_id: tripkitData.id,
        tripkit_slug: tripkitData.slug,
        tripkit_name: tripkitData.name,
        tripkit_code: tripkitData.code,
        price_paid_cents: priceInCents.toString(),
        is_founder_price: tripkitData.is_in_flash_sale ? 'true' : 'false',
        // Attribution tracking
        utm_source: attribution?.utm_source || 'unknown',
        utm_medium: attribution?.utm_medium || 'unknown',
        utm_campaign: attribution?.utm_campaign || '',
        referrer: attribution?.referrer || '',
        landing_page: attribution?.landing_page || '',
      },
      payment_intent_data: {
        metadata: { building_id: 'B002' },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_email: undefined, // Let Stripe collect email
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`Checkout session created for TripKit ${tripkitData.code}: ${session.id}`);
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      tripkit: {
        name: tripkitData.name,
        slug: tripkitData.slug,
        price: priceInCents / 100,
      },
    });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle Welcome Wagon checkout
 */
async function handleWelcomeWagonCheckout(
  request: NextRequest,
  productId: string | undefined,
  successUrl: string | undefined,
  cancelUrl: string | undefined,
  attribution?: AttributionData | Record<string, string | null> | null
): Promise<NextResponse> {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please contact support.' },
      { status: 503 }
    );
  }

  // Welcome Wagon product configuration
  const welcomeWagonProducts: Record<string, { name: string; description: string; price: number; image?: string }> = {
    'welcome-wagon-90-day': {
      name: '90-Day Welcome Wagon',
      description: 'Your complete roadmap from newcomer to local - 90-day relocation timeline, neighborhood guides, Utah culture deep dive, and more.',
      price: 49.00, // $49 in dollars
      image: '/images/WelcomeWagonBadge.png',
    },
    'welcome-wagon-corporate': {
      name: 'Welcome Wagon Corporate Edition',
      description: 'Perfect for companies relocating employees to Utah. Bulk access, HR dashboard, custom branding, and priority support.',
      price: 299.00, // $299 in dollars
      image: '/images/WelcomeWagonBadge.png',
    },
  };

  const productIdToUse = productId || 'welcome-wagon-90-day';
  const product = welcomeWagonProducts[productIdToUse];

  if (!product) {
    return NextResponse.json(
      { error: 'Invalid Welcome Wagon product' },
      { status: 400 }
    );
  }

  const priceInCents = Math.round(product.price * 100);
  const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';
  const finalSuccessUrl = successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const finalCancelUrl = cancelUrl || `${baseUrl}/welcome-wagon`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image ? [`${baseUrl}${product.image}`] : [`${baseUrl}/images/Site_logo.png`],
              metadata: {
                product_type: 'welcome-wagon',
                product_id: productIdToUse,
              },
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        building_id: 'B002',
        product_type: 'welcome-wagon',
        product_id: productIdToUse,
        product_name: product.name,
        price_paid_cents: priceInCents.toString(),
        utm_source: (attribution?.utm_source as string) || 'unknown',
        utm_medium: (attribution?.utm_medium as string) || 'unknown',
        utm_campaign: (attribution?.utm_campaign as string) || '',
        referrer: (attribution?.referrer as string) || '',
        landing_page: (attribution?.landing_page as string) || '',
      },
      payment_intent_data: {
        metadata: { building_id: 'B002' },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_email: undefined,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      product: {
        name: product.name,
        price: product.price,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Stripe checkout failed';
    console.error('[Checkout] Welcome Wagon Stripe error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
