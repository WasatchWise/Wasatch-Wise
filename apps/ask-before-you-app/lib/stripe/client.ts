import Stripe from 'stripe';
import { getServerEnv } from '@/lib/env';

const API_VERSION = '2024-11-20.acacia' as Stripe.LatestApiVersion;

function createStripeClient(): Stripe | null {
  const env = getServerEnv();
  if (!env.STRIPE_SECRET_KEY) return null;
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: API_VERSION });
}

/** Lazy-init Stripe client; null if STRIPE_SECRET_KEY not set (e.g. dev without payments). */
export const stripe = createStripeClient();

/** Use in payment routes (checkout, webhook). Throws with clear message if Stripe is not configured. */
export function getStripe(): Stripe {
  const env = getServerEnv();
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY to enable payments.');
  }
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: API_VERSION });
}

/** Publishable key for client-side Stripe.js; set STRIPE_PUBLISHABLE_KEY_TOKEN or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. */
export const STRIPE_PUBLISHABLE_KEY =
  typeof process !== 'undefined'
    ? process.env.STRIPE_PUBLISHABLE_KEY_TOKEN ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null
    : null;
