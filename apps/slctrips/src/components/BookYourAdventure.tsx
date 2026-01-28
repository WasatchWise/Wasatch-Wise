'use client';

import { ArrowUpRight } from 'lucide-react';

/**
 * Book Your Adventure - Homepage Affiliate Section
 *
 * Strategic positioning: SLC International Airport is #1 for rental car travelers.
 * This component monetizes that insight with Booking.com affiliate links.
 *
 * Updated Dec 2025: Uses correct AWIN tracking format per affiliate guidelines.
 */

interface BookYourAdventureProps {
  variant?: 'hero' | 'section' | 'compact';
}

/**
 * Build AWIN tracking link for Booking.com
 * Per Awin guidelines: use awin1.com/cread.php with ued= for destination
 */
function buildAwinTrackingLink(destinationUrl: string, campaign: string): string {
  const publisherId = process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID || '2060961';
  const merchantId = '6776'; // Booking.com AWIN merchant ID

  const params = new URLSearchParams({
    awinmid: merchantId,
    awinaffid: publisherId,
    campaign: campaign,
    ued: destinationUrl,
  });

  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

// Build Booking.com affiliate URLs with proper AWIN tracking
function buildAffiliateUrl(type: 'cars' | 'hotels', location: string = 'Salt Lake City'): string {
  if (type === 'cars') {
    // Car rentals URL - SLC Airport focus (clean URL, no tracking params)
    const destinationUrl = 'https://www.booking.com/cars/index.en-us.html?location=Salt+Lake+City+International+Airport';
    return buildAwinTrackingLink(destinationUrl, 'slctrips-homepage-cars');
  }

  // Hotels URL (clean destination, AWIN adds tracking)
  const destinationUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location)}`;
  return buildAwinTrackingLink(destinationUrl, 'slctrips-homepage-hotels');
}

export default function BookYourAdventure({ variant = 'section' }: BookYourAdventureProps) {
  const carRentalsUrl = buildAffiliateUrl('cars');
  const hotelsUrl = buildAffiliateUrl('hotels', 'Salt Lake City, Utah');

  // Track affiliate clicks
  const trackClick = (type: 'cars' | 'hotels') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'booking_click', {
        event_category: 'Homepage Affiliate',
        event_label: type === 'cars' ? 'Car Rentals' : 'Hotels',
        location: 'homepage',
      });
    }
  };

  if (variant === 'compact') {
    // Minimal inline version for tight spaces
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 py-4">
        <span className="text-sm text-gray-400">Start your adventure:</span>
        <a
          href={carRentalsUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackClick('cars')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          aria-label="Rent a Car (opens in new tab)"
        >
          <span>🚗</span> Rent a Car
          <ArrowUpRight className="h-4 w-4 opacity-70" aria-hidden="true" />
        </a>
        <a
          href={hotelsUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackClick('hotels')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
          aria-label="Find Hotels (opens in new tab)"
        >
          <span>🏨</span> Find Hotels
          <ArrowUpRight className="h-4 w-4 opacity-70" aria-hidden="true" />
        </a>
      </div>
    );
  }

  // Full section variant (replaces Welcome Wagon)
  return (
    <section className="py-12 bg-gradient-to-r from-blue-900/40 to-emerald-900/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* SLC Airport Hub Positioning */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span>✈️</span>
              <span>#1 Airport for Rental Car Road Trips</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Land at SLC. Drive Anywhere.
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Salt Lake City International Airport is America's top hub for rental car travelers.
              Five national parks, world-class ski resorts, and endless adventure—all within a day's drive.
            </p>
          </div>

          {/* Booking Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Car Rentals Card */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-emerald-500 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🚗</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    Rent a Car at SLC Airport
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Compare prices from Enterprise, Budget, National & more. Free cancellation available.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      Airport Pickup
                    </span>
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      Free Cancellation
                    </span>
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      Best Price Guarantee
                    </span>
                  </div>
                  <a
                    href={carRentalsUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackClick('cars')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
                    aria-label="Search Car Rentals (opens in new tab)"
                  >
                    Search Car Rentals
                    <ArrowUpRight className="h-4 w-4 opacity-70" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            {/* Hotels Card */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-amber-500 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🏨</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    Book Your Stay
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    From downtown SLC to ski-in/ski-out resorts and Moab adventures. Handpicked for road trippers.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                      Downtown SLC
                    </span>
                    <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                      Ski Resorts
                    </span>
                    <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                      National Parks
                    </span>
                  </div>
                  <a
                    href={hotelsUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackClick('hotels')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
                    aria-label="Find Accommodations (opens in new tab)"
                  >
                    Find Accommodations
                    <ArrowUpRight className="h-4 w-4 opacity-70" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Drive Time Quick Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-3">Popular road trips from SLC Airport:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={buildAffiliateUrl('hotels', 'Park City, Utah')}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Park City (35 min) →
              </a>
              <a
                href={buildAffiliateUrl('hotels', 'Moab, Utah')}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Moab (4 hrs) →
              </a>
              <a
                href={buildAffiliateUrl('hotels', 'Zion National Park')}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Zion (5 hrs) →
              </a>
              <a
                href={buildAffiliateUrl('hotels', 'Jackson, Wyoming')}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Jackson Hole (5 hrs) →
              </a>
              <a
                href={buildAffiliateUrl('hotels', 'Yellowstone')}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Yellowstone (6 hrs) →
              </a>
            </div>
          </div>

          {/* Affiliate Disclosure */}
          <p className="text-xs text-gray-600 text-center mt-6">
            Bookings made through these links help support SLCTrips.com at no extra cost to you.
          </p>
        </div>
      </div>
    </section>
  );
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
