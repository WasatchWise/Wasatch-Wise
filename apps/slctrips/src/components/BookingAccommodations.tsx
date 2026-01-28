'use client';

/**
 * Booking.com Accommodations Component
 *
 * Context-aware accommodation recommendations near destinations.
 * Prioritizes unique stays, local properties, and budget-friendly options.
 */

interface BookingAccommodationsProps {
  destination: {
    name: string;
    category: string;
    subcategory: string;
    latitude?: number;
    longitude?: number;
    state?: string;
    city?: string;
    county?: string;
    hotel_recommendations?: AccommodationItem[];
  };
}

interface AccommodationItem {
  name: string;
  description: string;
  type: 'hotel' | 'cabin' | 'resort' | 'campground' | 'unique';
  priceRange: string;
  location: string;
  bookingUrl: string;
  highlights: string[];
  recommended: boolean;
}

/**
 * Get context-aware accommodation recommendations
 */
function getAccommodationRecommendations(destination: BookingAccommodationsProps['destination']): AccommodationItem[] {
  // 1. Check for curated recommendations from database
  if (destination.hotel_recommendations && Array.isArray(destination.hotel_recommendations) && destination.hotel_recommendations.length > 0) {
    return destination.hotel_recommendations;
  }

  const subcategory = (destination.subcategory || '').toLowerCase();
  const name = (destination.name || '').toLowerCase();
  const state = (destination.state || 'Utah').toLowerCase();
  const city = (destination.city || '').toLowerCase();
  const recommendations: AccommodationItem[] = [];

  // Build search location - ALWAYS include state/country to avoid ambiguous matches
  // This prevents Booking.com from defaulting to wrong countries (e.g., India)
  const buildSafeSearchLocation = (location: string, alwaysIncludeState = true): string => {
    // If location already includes state/country, return as-is
    if (location.includes(',') && (location.includes('USA') || location.includes('Utah'))) {
      return location;
    }
    // Always append state and country for safety
    const stateStr = destination.state || 'Utah';
    if (alwaysIncludeState) {
      return `${location}, ${stateStr}, USA`;
    }
    return location;
  };
  
  const searchLocation = buildSafeSearchLocation(city || destination.name);

  // National Parks - Unique stays near parks
  if (subcategory.includes('national park')) {

    // Zion National Park
    if (name.includes('zion')) {
      recommendations.push(
        {
          name: 'Cable Mountain Lodge',
          description: 'Walking distance to park entrance, stunning views of Zion Canyon',
          type: 'hotel',
          priceRange: '$$-$$$',
          location: 'Springdale, UT (near Zion entrance)',
          bookingUrl: 'https://www.booking.com/searchresults.html?ss=Springdale%2C+Utah',
          highlights: ['Park views', 'Walking distance', 'Local dining nearby'],
          recommended: true
        },
        {
          name: 'Under Canvas Zion',
          description: 'Luxury glamping with safari-style tents and amazing stargazing',
          type: 'unique',
          priceRange: '$$$',
          location: 'Virgin, UT (15 min to Zion)',
          bookingUrl: 'https://www.booking.com/searchresults.html?ss=Virgin%2C+Utah',
          highlights: ['Glamping', 'Stargazing', 'Unique experience'],
          recommended: true
        }
      );
    }

    // Bryce Canyon
    if (name.includes('bryce')) {
      recommendations.push(
        {
          name: 'Bryce Canyon Lodge',
          description: 'Historic lodge inside the park with rustic cabins',
          type: 'hotel',
          priceRange: '$$',
          location: 'Inside Bryce Canyon National Park',
          bookingUrl: 'https://www.booking.com/searchresults.html?ss=Bryce+Canyon+City%2C+Utah',
          highlights: ['Inside park', 'Historic', 'Cabins available'],
          recommended: true
        }
      );
    }

    // Arches / Moab
    if (name.includes('arches') || name.includes('moab')) {
      recommendations.push(
        {
          name: 'Moab Adventure Lodges',
          description: 'Outdoor-focused accommodations perfect for adventure seekers',
          type: 'hotel',
          priceRange: '$-$$',
          location: 'Moab, UT',
          bookingUrl: 'https://www.booking.com/searchresults.html?ss=Moab%2C+Utah',
          highlights: ['Adventure hub', 'Bike-friendly', 'Local vibe'],
          recommended: true
        }
      );
    }

    // Yellowstone
    if (name.includes('yellowstone')) {
      recommendations.push(
        {
          name: 'Old Faithful Inn',
          description: 'Iconic historic lodge with geyser views',
          type: 'hotel',
          priceRange: '$$-$$$',
          location: 'Inside Yellowstone National Park',
          bookingUrl: 'https://www.booking.com/searchresults.html?ss=West+Yellowstone%2C+Montana',
          highlights: ['Geyser views', 'Historic', 'Inside park'],
          recommended: true
        }
      );
    }

    // Grand Teton
    if (name.includes('grand teton')) {
      recommendations.push(
        {
          name: 'Jackson Lake Lodge',
          description: 'Stunning Teton views from every room',
          type: 'resort',
          priceRange: '$$$',
          location: 'Inside Grand Teton National Park',
          bookingUrl: 'https://www.booking.com/searchresults.html?ss=Jackson%2C+Wyoming',
          highlights: ['Mountain views', 'Inside park', 'Fine dining'],
          recommended: true
        }
      );
    }
  }

  // Ski Resorts - Slope-side accommodations
  if (subcategory.includes('ski') || subcategory.includes('snowboard')) {
    recommendations.push(
      {
        name: 'Ski-In/Ski-Out Lodges',
        description: 'Walk directly to the lifts from your room',
        type: 'resort',
        priceRange: '$$$',
        location: `Near ${destination.name}`,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(buildSafeSearchLocation(destination.name))}`,
        highlights: ['Ski-in/ski-out', 'Slope-side', 'Equipment storage'],
        recommended: true
      },
      {
        name: 'Budget-Friendly Options',
        description: 'Affordable stays with shuttle service to slopes',
        type: 'hotel',
        priceRange: '$-$$',
        location: `${city || 'Nearby'}`,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchLocation)}`,
        highlights: ['Shuttle service', 'Breakfast included', 'Budget-friendly'],
        recommended: false
      }
    );
  }

  // Hiking Destinations - Base camps and trailhead proximity
  if (subcategory.includes('hiking') || subcategory.includes('trail')) {
    recommendations.push(
      {
        name: 'Trailhead Accommodations',
        description: 'Stay close to the trail for early morning starts',
        type: 'hotel',
        priceRange: '$-$$',
        location: `Near ${destination.name}`,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchLocation)}`, // searchLocation already includes state/country
        highlights: ['Close to trails', 'Early checkout', 'Parking'],
        recommended: true
      }
    );
  }

  // Hot Springs - Spa resorts and wellness stays
  if (subcategory.includes('hot spring')) {
    recommendations.push(
      {
        name: 'Hot Springs Resort',
        description: 'On-site natural hot springs and spa treatments',
        type: 'resort',
        priceRange: '$$-$$$',
        location: `Near ${destination.name}`,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(buildSafeSearchLocation(searchLocation.replace(', Utah, USA', '').trim() + ' hot springs'))}`,
        highlights: ['On-site hot springs', 'Spa services', 'Wellness focus'],
        recommended: true
      }
    );
  }

  // Breweries / Urban destinations - Downtown stays
  if (subcategory.includes('brewery') || subcategory.includes('restaurant') || subcategory.includes('coffee')) {
    recommendations.push(
      {
        name: 'Downtown Walkable Hotels',
        description: 'Walk to breweries, restaurants, and nightlife',
        type: 'hotel',
        priceRange: '$$',
        location: `${city || 'Downtown'}, ${state.toUpperCase()}`,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(buildSafeSearchLocation(city || searchLocation.replace(', Utah, USA', '').trim()))}`,
        highlights: ['Walkable', 'Nightlife access', 'No driving needed'],
        recommended: true
      }
    );
  }

  // Camping-friendly destinations
  if (subcategory.includes('camping') || name.includes('campground')) {
    recommendations.push(
      {
        name: 'RV Parks & Campgrounds',
        description: 'Full hookups, tent sites, and cabin options',
        type: 'campground',
        priceRange: '$',
        location: `Near ${destination.name}`,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(buildSafeSearchLocation(searchLocation.replace(', Utah, USA', '').trim() + ' camping'))}`,
        highlights: ['RV hookups', 'Tent sites', 'Cabins'],
        recommended: true
      }
    );
  }

  // Scenic/Photography destinations - Unique stays
  if (subcategory.includes('scenic') || subcategory.includes('viewpoint')) {
    recommendations.push(
      {
        name: 'Unique Stays with Views',
        description: 'Airstreams, yurts, and cabins with stunning vistas',
        type: 'unique',
        priceRange: '$$',
        location: `Near ${destination.name}`,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchLocation)}`,
        highlights: ['Unique properties', 'Scenic views', 'Instagram-worthy'],
        recommended: true
      }
    );
  }

  // If no specific recommendations, add generic search
  // Use city or county instead of destination name for better Booking.com results
  if (recommendations.length === 0) {
    let bookingSearchLocation = '';

    // 1. Try City (ALWAYS include state and USA to avoid ambiguous matches)
    if (destination.city) {
      const stateStr = destination.state || 'Utah';
      bookingSearchLocation = `${destination.city}, ${stateStr}, USA`;
    }
    // 2. Try County (ALWAYS include state and USA)
    else if (destination.county) {
      const stateStr = destination.state || 'Utah';
      bookingSearchLocation = `${destination.county}, ${stateStr}, USA`;
    }
    // 3. Try parsing common cities from name (fallback for missing data)
    else {
      const commonCities = ['Park City', 'Salt Lake City', 'Moab', 'St. George', 'Kanab', 'Springdale', 'Provo', 'Ogden', 'Logan'];
      const foundCity = commonCities.find(c => name.includes(c.toLowerCase()));

      if (foundCity) {
        const stateStr = destination.state || 'Utah';
        bookingSearchLocation = `${foundCity}, ${stateStr}, USA`;
      } else {
        // 4. Last resort: Use name if it looks like a location, otherwise just State
        // CRITICAL: Always include state and USA to prevent ambiguous matches (e.g., India)
        // Avoid using long event names which break Booking.com
        const stateStr = destination.state || 'Utah';
        if (destination.name && destination.name.length < 30 && !name.includes('festival') && !name.includes('classic') && !name.includes('marathon')) {
          bookingSearchLocation = `${destination.name}, ${stateStr}, USA`;
        } else {
          bookingSearchLocation = `${stateStr}, USA`;
        }
      }
    }

    recommendations.push(
      {
        name: `Hotels near ${destination.name}`,
        description: 'Browse all accommodation options in the area',
        type: 'hotel',
        priceRange: '$-$$$',
        location: bookingSearchLocation,
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(bookingSearchLocation)}`,
        highlights: ['All options', 'Best prices', 'Flexible'],
        recommended: false
      }
    );
  }

  return recommendations.slice(0, 2);
}

/**
 * Build Booking.com affiliate URL via AWIN
 * Per Awin guidelines: use awin1.com/cread.php with ued= for destination
 */
function buildBookingAffiliateUrl(baseUrl: string): string {
  const awinMerchantId = '6776';
  const awinAffiliateId = process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID || '2060961';

  // Strip any existing tracking params from destination URL
  if (!baseUrl) return '';
  let cleanUrl = baseUrl;
  if (baseUrl.includes('?')) {
    const [base, query] = baseUrl.split('?');
    const params = new URLSearchParams(query);
    // Keep only search params, remove tracking params
    ['aid', 'label', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(p => params.delete(p));
    const cleanQuery = params.toString();
    cleanUrl = cleanQuery ? `${base}?${cleanQuery}` : base;
  }

  // Build AWIN tracking link
  const awinParams = new URLSearchParams({
    awinmid: awinMerchantId,
    awinaffid: awinAffiliateId,
    campaign: 'slctrips-accommodations',
    ued: cleanUrl,
  });

  return `https://www.awin1.com/cread.php?${awinParams.toString()}`;
}

export default function BookingAccommodations({ destination }: BookingAccommodationsProps) {
  const accommodations = getAccommodationRecommendations(destination);

  if (accommodations.length === 0) {
    return null;
  }

  // Get icon for accommodation type
  const getTypeIcon = (type: AccommodationItem['type']) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'cabin': return '🏡';
      case 'resort': return '🏔️';
      case 'campground': return '⛺';
      case 'unique': return '✨';
      default: return '🏨';
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">🏨</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Where to Stay</h2>
          <p className="text-sm text-gray-600 mt-1">
            Handpicked accommodations near this destination
          </p>
        </div>
      </div>

      {/* Accommodation Items */}
      <div className="space-y-3">
        {accommodations.map((accommodation, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getTypeIcon(accommodation.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{accommodation.name}</h3>
                      {accommodation.recommended && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>📍 {accommodation.location}</span>
                      <span>💰 {accommodation.priceRange}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">{accommodation.description}</p>

                {/* Highlights */}
                {accommodation.highlights && Array.isArray(accommodation.highlights) && accommodation.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {accommodation.highlights.map((highlight, hIdx) => (
                      <span
                        key={hIdx}
                        className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Book Button */}
              <div className="flex flex-col gap-1 items-end">
                <a
                  href={buildBookingAffiliateUrl(
                    accommodation.bookingUrl ||
                    (() => {
                      // Build safe search location if bookingUrl not provided
                      const location = destination.city || accommodation.location || destination.name;
                      const stateStr = destination.state || 'Utah';
                      const safeLocation = location.includes(',') && (location.includes('USA') || location.includes('Utah'))
                        ? location
                        : `${location}, ${stateStr}, USA`;
                      return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(safeLocation)}`;
                    })()
                  )}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium hover:underline whitespace-nowrap"
                  onClick={() => {
                    // Track Booking.com click
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'booking_accommodation_click', {
                        event_category: 'Accommodations',
                        event_label: accommodation.name,
                        destination: destination.name,
                        accommodation_type: accommodation.type
                      });
                    }
                  }}
                >
                  <span>View on Booking.com</span>
                  <span className="text-xs">→</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
        Accommodation bookings help support local content. Prices and availability subject to change.
      </p>
    </div>
  );
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
