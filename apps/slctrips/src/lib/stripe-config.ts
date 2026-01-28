/**
 * Stripe Configuration and Helpers
 *
 * Best Practice: Database-driven pricing
 * All products are stored in Supabase `tripkits` table
 * This file provides configuration and utility functions
 */

import { TripKit } from '@/types/database.types';

// Stripe API configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  apiVersion: '2025-10-29.clover' as const,
};

/**
 * Get the active price for a TripKit based on flash sale status
 * @param tripkit - TripKit from database
 * @returns Price in cents
 */
export function getActivePrice(tripkit: TripKit): number {
  // Check if in flash sale and founder spots available
  if (tripkit.is_in_flash_sale) {
    const hasFounderSpotsLeft = tripkit.founder_limit
      ? tripkit.founder_sold < tripkit.founder_limit
      : true;

    if (hasFounderSpotsLeft) {
      return Math.round(tripkit.founder_price * 100); // Convert to cents
    }
  }

  // Return regular price
  return Math.round(tripkit.price * 100); // Convert to cents
}

/**
 * Calculate savings for display
 * @param tripkit - TripKit from database
 * @returns Object with savings amount and percentage
 */
export function calculateSavings(tripkit: TripKit) {
  if (!tripkit.is_in_flash_sale || !tripkit.regular_price) {
    return { amount: 0, percentage: 0 };
  }

  const activePrice = tripkit.founder_price || tripkit.price;
  const savings = tripkit.regular_price - activePrice;
  const percentage = Math.round((savings / tripkit.regular_price) * 100);

  return {
    amount: savings,
    percentage,
  };
}

/**
 * Format price for display
 * @param priceInDollars - Price in dollars
 * @returns Formatted price string
 */
export function formatPrice(priceInDollars: number): string {
  return `$${priceInDollars.toFixed(2)}`;
}

/**
 * Format price from cents for display
 * @param priceInCents - Price in cents
 * @returns Formatted price string
 */
export function formatPriceFromCents(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Check if founder pricing is available
 * @param tripkit - TripKit from database
 * @returns Boolean indicating if founder pricing is active
 */
export function isFounderPricingAvailable(tripkit: TripKit): boolean {
  if (!tripkit.is_in_flash_sale) return false;

  if (tripkit.founder_limit) {
    return tripkit.founder_sold < tripkit.founder_limit;
  }

  return true;
}

/**
 * Get remaining founder spots
 * @param tripkit - TripKit from database
 * @returns Number of remaining spots or null if unlimited
 */
export function getRemainingFounderSpots(tripkit: TripKit): number | null {
  if (!tripkit.founder_limit) return null;
  return Math.max(0, tripkit.founder_limit - tripkit.founder_sold);
}

/**
 * Validate Stripe configuration
 * Logs warnings instead of throwing errors to allow builds without keys
 */
export function validateStripeConfig(): void {
  if (!STRIPE_CONFIG.secretKey) {
    console.warn('STRIPE_SECRET_KEY is not set - Stripe payments will not work');
  }
  if (!STRIPE_CONFIG.publishableKey) {
    console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  }
  if (!STRIPE_CONFIG.webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET is not set - Stripe webhooks will not work');
  }
}
