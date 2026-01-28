/**
 * Attribution Tracking Utility
 *
 * Captures marketing attribution data (UTM params, referrer, landing page)
 * on first page load and persists it in localStorage.
 *
 * This ensures we know where customers came from when they purchase.
 *
 * Usage:
 * 1. Call captureAttribution() on app initialization (layout or page load)
 * 2. Call getAttribution() when creating checkout session
 *
 * Example URLs:
 * - https://slctrips.com?utm_source=tiktok&utm_medium=video&utm_campaign=halloween2025
 * - https://slctrips.com/tripkits/escalante (from Reddit post)
 */

export interface AttributionData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_page: string | null;
  captured_at: string; // ISO timestamp
}

const STORAGE_KEY = 'slctrips_attribution';
const ATTRIBUTION_EXPIRY_DAYS = 30; // Attribution window

/**
 * Capture attribution data from current page load
 * Call this ONCE on initial page load (in layout or landing page)
 */
export function captureAttribution(): AttributionData | null {
  // Only run in browser
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if we already have attribution data
  const existing = getAttribution();
  if (existing && !isAttributionExpired(existing)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Attribution] Already captured:', existing);
    }
    return existing;
  }

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);

  const attribution: AttributionData = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    referrer: document.referrer || null,
    landing_page: window.location.href,
    captured_at: new Date().toISOString(),
  };

  // Only save if we have at least one tracking parameter or referrer
  if (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign || attribution.referrer) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
      if (process.env.NODE_ENV === 'development') {
        console.log('[Attribution] Captured:', attribution);
      }
      return attribution;
    } catch (error) {
      console.error('[Attribution] Failed to save:', error);
    }
  } else {
    // No attribution data, but save landing page for direct traffic
    attribution.utm_source = 'direct';
    attribution.utm_medium = 'none';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
      if (process.env.NODE_ENV === 'development') {
        console.log('[Attribution] Direct traffic captured:', attribution);
      }
      return attribution;
    } catch (error) {
      console.error('[Attribution] Failed to save:', error);
    }
  }

  return attribution;
}

/**
 * Get stored attribution data
 * Call this when user clicks "Buy Now" to include in checkout
 */
export function getAttribution(): AttributionData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const attribution: AttributionData = JSON.parse(stored);

    // Check if expired
    if (isAttributionExpired(attribution)) {
      clearAttribution();
      return null;
    }

    return attribution;
  } catch (error) {
    console.error('[Attribution] Failed to retrieve:', error);
    return null;
  }
}

/**
 * Check if attribution data has expired
 */
function isAttributionExpired(attribution: AttributionData): boolean {
  const capturedAt = new Date(attribution.captured_at);
  const expiryDate = new Date(capturedAt);
  expiryDate.setDate(expiryDate.getDate() + ATTRIBUTION_EXPIRY_DAYS);

  return new Date() > expiryDate;
}

/**
 * Clear attribution data (useful for testing or privacy)
 */
export function clearAttribution(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Attribution] Cleared');
    }
  } catch (error) {
    console.error('[Attribution] Failed to clear:', error);
  }
}

/**
 * Get attribution as flat object for Stripe metadata
 * (Stripe metadata only supports string values, no nested objects)
 */
export function getAttributionForStripe(): Record<string, string> {
  const attribution = getAttribution();

  if (!attribution) {
    return {
      utm_source: 'unknown',
      utm_medium: 'unknown',
      utm_campaign: '',
      referrer: '',
      landing_page: '',
    };
  }

  return {
    utm_source: attribution.utm_source || 'unknown',
    utm_medium: attribution.utm_medium || 'unknown',
    utm_campaign: attribution.utm_campaign || '',
    referrer: attribution.referrer || '',
    landing_page: attribution.landing_page || '',
  };
}

/**
 * Debug helper: Log current attribution
 * Only runs in development
 */
export function debugAttribution(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (typeof window === 'undefined') {
    console.log('[Attribution] Not in browser');
    return;
  }

  const attribution = getAttribution();
  console.log('[Attribution] Current data:', attribution);

  if (attribution && isAttributionExpired(attribution)) {
    console.log('[Attribution] ⚠️ Data is EXPIRED');
  }
}
