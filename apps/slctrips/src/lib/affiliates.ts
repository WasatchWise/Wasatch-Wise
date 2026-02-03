/**
 * Affiliate Link Manager
 *
 * Centralized system for managing affiliate links and tracking.
 * Update affiliate IDs here when partnerships are established.
 */

export interface AffiliateConfig {
  yelp?: {
    enabled: boolean;
    partnerId?: string;
  };
  awin?: {
    enabled: boolean;
    publisherId?: string; // AWIN Publisher ID
    merchantId?: string; // AWIN Merchant ID for tracking
  };
  booking?: {
    enabled: boolean;
    aid?: string; // Affiliate ID
    awinMerchantId?: string; // Booking.com via AWIN
  };
  viator?: {
    enabled: boolean;
    partnerId?: string;
  };
  getyourguide?: {
    enabled: boolean;
    partnerId?: string;
  };
  amazon?: {
    enabled: boolean;
    /** Official Associate tracking ID (e.g. wasatchwise20-20). Used when no building_id. */
    affiliateTag?: string;
    /** Building-specific tracking IDs for city_metrics attribution. Create in Associates Central → Tools → Tracking ID Manager. */
    buildingTags?: Record<string, string>;
  };
  sitpack?: {
    enabled: boolean;
    merchantId?: string; // AWIN merchant ID for Sitpack
  };
  flextail?: {
    enabled: boolean;
    merchantId?: string; // AWIN merchant ID for FLEXTAIL
  };
  vsgo?: {
    enabled: boolean;
    merchantId?: string; // AWIN merchant ID for VSGO
  };
  gowithguide?: {
    enabled: boolean;
    merchantId?: string; // AWIN merchant ID for GoWithGuide US
  };
}

// Affiliate configuration - update these when you get affiliate IDs
const AFFILIATE_CONFIG: AffiliateConfig = {
  yelp: {
    enabled: true, // No affiliate program, but track clicks
  },
  awin: {
    enabled: true, // AWIN is configured!
    publisherId: process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID || '2060961', // AWIN Publisher ID
    merchantId: '6776', // Booking.com AWIN merchant ID (updated from approval email)
  },
  booking: {
    enabled: true, // Can use via AWIN
    awinMerchantId: '6776', // Booking.com AWIN merchant ID (updated from approval email)
  },
  viator: {
    enabled: true, // Viator API configured
    partnerId: process.env.VIATOR_API_KEY,
  },
  getyourguide: {
    enabled: false,
    // partnerId: 'YOUR_GYG_PARTNER_ID',
  },
  amazon: {
    enabled: true,
    affiliateTag: process.env.AMAZON_AFFILIATE_TAG || 'wasatchwise20-20',
    buildingTags: {
      B002: 'wasatchwise20-slc20', // SLC Trips
      B003: 'wasatchwise20-rck20', // Rock Salt
      B004: 'wasatchwise20-acd20', // Adult AI Academy
      B009: 'wasatchwise20-piq20', // Pipeline IQ
      B011: 'wasatchwise20-fnm20', // Fanon Movies
    },
  },
  sitpack: {
    enabled: true,
    merchantId: process.env.AWIN_SITPACK_MERCHANT_ID, // Will be set when merchant ID is available
  },
  flextail: {
    enabled: true,
    merchantId: process.env.AWIN_FLEXTAIL_MERCHANT_ID, // Will be set when merchant ID is available
  },
  vsgo: {
    enabled: true,
    merchantId: process.env.AWIN_VSGO_MERCHANT_ID, // Will be set when merchant ID is available
  },
  gowithguide: {
    enabled: true,
    merchantId: process.env.AWIN_GOWITHGUIDE_MERCHANT_ID, // Will be set when merchant ID is available
  },
};

/**
 * Generate a Yelp link with optional tracking
 */
export function getYelpLink(yelpUrl: string): string {
  if (!yelpUrl) return '';

  // If Yelp affiliate program exists in future, add params here
  // For now, just return the URL with UTM tracking
  const url = new URL(yelpUrl);
  url.searchParams.set('utm_source', 'slctrips');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', 'dans_score');

  return url.toString();
}

/**
 * Generate a website link with UTM tracking
 */
export function getWebsiteLink(websiteUrl: string, destinationName: string): string {
  if (!websiteUrl) return '';

  try {
    const url = new URL(websiteUrl);
    url.searchParams.set('utm_source', 'slctrips');
    url.searchParams.set('utm_medium', 'referral');
    url.searchParams.set('utm_content', encodeURIComponent(destinationName));

    return url.toString();
  } catch {
    // If URL parsing fails, return original
    return websiteUrl;
  }
}

/**
 * Build AWIN tracking link for Booking.com
 * Per Awin guidelines: use awin1.com/cread.php with ued= for destination
 */
function buildAwinTrackingLink(destinationUrl: string, campaign: string = 'slctrips'): string {
  const awinConfig = AFFILIATE_CONFIG.awin;
  const publisherId = awinConfig?.publisherId || '2060961';
  const merchantId = awinConfig?.merchantId || '6776';

  const params = new URLSearchParams({
    awinmid: merchantId,
    awinaffid: publisherId,
    campaign: campaign,
    ued: destinationUrl,
  });

  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

/**
 * Generate a Booking.com affiliate link via AWIN
 * Uses proper AWIN tracking format per affiliate guidelines
 */
export function getBookingLink(placeName: string, lat?: number, lon?: number, state?: string): string | null {
  const bookingConfig = AFFILIATE_CONFIG.booking;
  const awinConfig = AFFILIATE_CONFIG.awin;

  if (!bookingConfig || !awinConfig || !bookingConfig.enabled || !awinConfig.enabled) return null;

  // CRITICAL: Always include state/country to avoid ambiguous matches
  // This prevents Booking.com from defaulting to wrong countries (e.g., India)
  let safePlaceName = placeName;
  if (safePlaceName && !safePlaceName.includes(',') && !safePlaceName.includes('USA')) {
    // If no location qualifier, add state and country
    const stateStr = state || 'Utah';
    safePlaceName = `${placeName}, ${stateStr}, USA`;
  }

  // Build clean destination URL (no tracking params - AWIN adds them)
  const destinationParams = new URLSearchParams({
    ss: safePlaceName,
  });

  if (lat && lon) {
    destinationParams.set('latitude', lat.toString());
    destinationParams.set('longitude', lon.toString());
  }

  const destinationUrl = `https://www.booking.com/searchresults.html?${destinationParams.toString()}`;
  return buildAwinTrackingLink(destinationUrl, 'slctrips-accommodations');
}

/**
 * Generate a Booking.com Flights affiliate link via AWIN
 * Uses proper AWIN tracking format per affiliate guidelines
 */
export function getBookingFlightsLink(origin?: string, destination?: string): string | null {
  const awinConfig = AFFILIATE_CONFIG.awin;
  if (!awinConfig || !awinConfig.enabled) return null;

  // Build clean destination URL (no tracking params - AWIN adds them)
  let destinationUrl = 'https://www.booking.com/flights/index.en-us.html';

  if (origin || destination) {
    const params = new URLSearchParams();
    if (origin) params.set('from', origin);
    if (destination) params.set('to', destination);
    destinationUrl = `https://www.booking.com/flights/index.en-us.html?${params.toString()}`;
  }

  return buildAwinTrackingLink(destinationUrl, 'slctrips-flights');
}

/**
 * Generate a Booking.com Car Rentals affiliate link via AWIN
 * Uses proper AWIN tracking format per affiliate guidelines
 */
export function getBookingCarRentalsLink(location?: string): string | null {
  const awinConfig = AFFILIATE_CONFIG.awin;
  if (!awinConfig || !awinConfig.enabled) return null;

  // Build clean destination URL (no tracking params - AWIN adds them)
  let destinationUrl = 'https://www.booking.com/cars/index.en-us.html';

  if (location) {
    const params = new URLSearchParams({ location });
    destinationUrl = `https://www.booking.com/cars/index.en-us.html?${params.toString()}`;
  }

  return buildAwinTrackingLink(destinationUrl, 'slctrips-cars');
}

/**
 * Generate deeplink to specific Booking.com hotel/property
 * Per AWIN guidelines: strip all tracking params, only keep base URL
 */
export function getBookingDeeplink(bookingUrl: string, campaign: string = 'slctrips-deeplink'): string | null {
  const awinConfig = AFFILIATE_CONFIG.awin;
  if (!awinConfig || !awinConfig.enabled) return null;

  // Strip tracking params per AWIN guidelines (keep only URL before ?)
  let cleanUrl = bookingUrl;
  if (bookingUrl.includes('?')) {
    cleanUrl = bookingUrl.split('?')[0];
  }

  return buildAwinTrackingLink(cleanUrl, campaign);
}

/**
 * Pre-built Utah destination deeplinks
 * Popular destinations with proper AWIN tracking
 */
export const UTAH_DESTINATION_LINKS = {
  // Ski Resorts
  parkCity: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Park+City%2C+Utah', 'slctrips-parkcity'),
  altaSownbird: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Alta%2C+Utah', 'slctrips-alta'),
  snowbasin: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Snowbasin%2C+Utah', 'slctrips-snowbasin'),
  brighton: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Brighton%2C+Utah', 'slctrips-brighton'),

  // National Parks
  zion: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Zion+National+Park', 'slctrips-zion'),
  bryce: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Bryce+Canyon', 'slctrips-bryce'),
  arches: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Arches+National+Park', 'slctrips-arches'),
  canyonlands: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Canyonlands+National+Park', 'slctrips-canyonlands'),
  capitolReef: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Capitol+Reef+National+Park', 'slctrips-capitolreef'),

  // Cities & Towns
  moab: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Moab%2C+Utah', 'slctrips-moab'),
  saltLakeCity: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Salt+Lake+City%2C+Utah', 'slctrips-slc'),
  stGeorge: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=St.+George%2C+Utah', 'slctrips-stgeorge'),
  ogden: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Ogden%2C+Utah', 'slctrips-ogden'),
  springdale: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Springdale%2C+Utah', 'slctrips-springdale'),

  // Nearby Destinations
  jacksonHole: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Jackson%2C+Wyoming', 'slctrips-jackson'),
  yellowstone: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Yellowstone+National+Park', 'slctrips-yellowstone'),
  grandTeton: () => buildAwinTrackingLink('https://www.booking.com/searchresults.html?ss=Grand+Teton+National+Park', 'slctrips-grandteton'),

  // Car Rentals
  slcAirportCars: () => buildAwinTrackingLink('https://www.booking.com/cars/index.en-us.html?location=Salt+Lake+City+International+Airport', 'slctrips-slc-cars'),
};

/**
 * Generate a Viator affiliate link
 * Use this for tours and activities
 */
export function getViatorLink(destinationName: string): string | null {
  const config = AFFILIATE_CONFIG.viator;
  if (!config || !config.enabled) return null;

  const baseUrl = 'https://www.viator.com/searchResults/all';
  const params = new URLSearchParams({
    text: destinationName,
    ...(config.partnerId && { pid: config.partnerId }),
    utm_source: 'slctrips',
    utm_medium: 'affiliate',
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Building ID type for Amazon attribution (WasatchVille BUILDING_REGISTRY).
 * Use when generating links from a specific building so revenue can be attributed in city_metrics.
 */
export type AmazonBuildingId = 'B002' | 'B003' | 'B004' | 'B009' | 'B011';

/**
 * Generate an Amazon affiliate link for gear/products.
 * @param searchTerm - Search query for Amazon
 * @param buildingId - Optional. When set, uses building-specific tracking ID for city_metrics attribution.
 */
export function getAmazonLink(searchTerm: string, buildingId?: AmazonBuildingId): string | null {
  const config = AFFILIATE_CONFIG.amazon;
  if (!config || !config.enabled) return null;

  const tag =
    buildingId && config.buildingTags?.[buildingId]
      ? config.buildingTags[buildingId]
      : config.affiliateTag || 'wasatchwise20-20';
  const params = new URLSearchParams({
    k: searchTerm,
    tag: tag,
    linkCode: 'll2',
    language: 'en_US',
  });

  return `https://www.amazon.com/s?${params.toString()}`;
}

/**
 * Generate a Sitpack affiliate link via AWIN
 * Perfect for camping, outdoor destinations, and travel gear
 */
export function getSitpackLink(productUrl?: string, campaign: string = 'slctrips-sitpack'): string | null {
  const config = AFFILIATE_CONFIG.sitpack;
  const awinConfig = AFFILIATE_CONFIG.awin;
  
  if (!config || !awinConfig || !config.enabled || !awinConfig.enabled) return null;
  
  const merchantId = config.merchantId;
  if (!merchantId) return null; // Merchant ID not yet configured
  
  const publisherId = awinConfig.publisherId || '2060961';
  
  // If product URL provided, create deep link; otherwise use homepage
  const destinationUrl = productUrl || 'https://www.sitpack.com';
  
  const params = new URLSearchParams({
    awinmid: merchantId,
    awinaffid: publisherId,
    campaign: campaign,
    ued: destinationUrl,
  });
  
  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

/**
 * Generate a FLEXTAIL affiliate link via AWIN
 * Outdoor equipment and gear
 */
export function getFlextailLink(productUrl?: string, campaign: string = 'slctrips-flextail'): string | null {
  const config = AFFILIATE_CONFIG.flextail;
  const awinConfig = AFFILIATE_CONFIG.awin;
  
  if (!config || !awinConfig || !config.enabled || !awinConfig.enabled) return null;
  
  const merchantId = config.merchantId;
  if (!merchantId) return null; // Merchant ID not yet configured
  
  const publisherId = awinConfig.publisherId || '2060961';
  
  const destinationUrl = productUrl || 'https://www.flextail.com';
  
  const params = new URLSearchParams({
    awinmid: merchantId,
    awinaffid: publisherId,
    campaign: campaign,
    ued: destinationUrl,
  });
  
  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

/**
 * Generate a VSGO affiliate link via AWIN
 * Photography gear and camera equipment
 */
export function getVsgoLink(productUrl?: string, campaign: string = 'slctrips-vsgo'): string | null {
  const config = AFFILIATE_CONFIG.vsgo;
  const awinConfig = AFFILIATE_CONFIG.awin;
  
  if (!config || !awinConfig || !config.enabled || !awinConfig.enabled) return null;
  
  const merchantId = config.merchantId;
  if (!merchantId) return null; // Merchant ID not yet configured
  
  const publisherId = awinConfig.publisherId || '2060961';
  
  const destinationUrl = productUrl || 'https://www.vsgo.com';
  
  const params = new URLSearchParams({
    awinmid: merchantId,
    awinaffid: publisherId,
    campaign: campaign,
    ued: destinationUrl,
  });
  
  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

/**
 * Generate a GoWithGuide US affiliate link via AWIN
 * Private customizable tours in 500+ cities
 */
export function getGoWithGuideLink(
  destinationName?: string,
  campaign: string = 'slctrips-gowithguide'
): string | null {
  const config = AFFILIATE_CONFIG.gowithguide;
  const awinConfig = AFFILIATE_CONFIG.awin;
  
  if (!config || !awinConfig || !config.enabled || !awinConfig.enabled) return null;
  
  const merchantId = config.merchantId;
  if (!merchantId) return null; // Merchant ID not yet configured
  
  const publisherId = awinConfig.publisherId || '2060961';
  
  // Build destination URL - GoWithGuide search or homepage
  let destinationUrl = 'https://www.gowithguide.com';
  if (destinationName) {
    destinationUrl = `https://www.gowithguide.com/search?q=${encodeURIComponent(destinationName)}`;
  }
  
  const params = new URLSearchParams({
    awinmid: merchantId,
    awinaffid: publisherId,
    campaign: campaign,
    ued: destinationUrl,
  });
  
  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

/**
 * Track affiliate click (for analytics)
 */
export function trackAffiliateClick(
  platform: 'yelp' | 'website' | 'booking' | 'booking_flights' | 'booking_cars' | 'viator' | 'awin' | 'amazon' | 'sitpack' | 'flextail' | 'vsgo' | 'gowithguide',
  destinationId: string,
  destinationName: string
) {
  // Log to console for now, integrate with analytics later
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'affiliate_click', {
      event_category: 'Affiliate',
      event_label: platform,
      destination_id: destinationId,
      destination_name: destinationName,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Affiliate click:', {
      platform,
      destinationId,
      destinationName,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Generate AWIN tracking pixel for conversion tracking
 * Call this on booking confirmation pages
 */
export function getAWINTrackingPixel(
  orderId: string,
  orderValue: number,
  currency: string = 'USD'
): string {
  const awinConfig = AFFILIATE_CONFIG.awin;
  if (!awinConfig || !awinConfig.enabled || !awinConfig.publisherId) return '';

  // AWIN MasterTag tracking pixel
  const params = new URLSearchParams({
    merchant: awinConfig.merchantId || '',
    amount: orderValue.toFixed(2),
    cr: currency,
    ref: orderId,
    parts: `DEFAULT:${orderValue.toFixed(2)}`,
    vc: '',
    ch: 'aw',
    testmode: '0',
  });

  return `https://www.awin1.com/sread.img?${params.toString()}`;
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
