'use client';

/**
 * Booking.com Flights Component
 *
 * Promotes flight search and booking through Booking.com affiliate program.
 * Displays on destination pages with nearby airports.
 */

interface BookingFlightsProps {
    destination: {
        name: string;
        airportCode?: string;
        city?: string;
        state?: string;
    };
}

/**
 * Build Booking.com Flights affiliate URL via AWIN
 * Per Awin guidelines: clean destination URL, no tracking params
 */
function buildFlightsAffiliateUrl(airportCode?: string): string {
    const awinMerchantId = '6776';
    const awinAffiliateId = process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID || '2060961';

    // Clean destination URL (no tracking params - AWIN adds them)
    let flightsUrl = 'https://www.booking.com/flights/index.en-us.html';

    // Add search parameters if airport code is provided
    if (airportCode) {
        flightsUrl = `${flightsUrl}?from=SLC&to=${encodeURIComponent(airportCode)}`;
    }

    // AWIN tracking link format
    const params = new URLSearchParams({
        awinmid: awinMerchantId,
        awinaffid: awinAffiliateId,
        campaign: 'slctrips-flights',
        ued: flightsUrl,
    });

    return `https://www.awin1.com/cread.php?${params.toString()}`;
}

export default function BookingFlights({ destination }: BookingFlightsProps) {
    // Only show if destination has an airport code or is a major city
    if (!destination.airportCode && !destination.city) {
        return null;
    }

    const flightsUrl = buildFlightsAffiliateUrl(destination.airportCode);

    return (
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">✈️</div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Book Your Flight</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Find the best deals on flights to {destination.name}
                    </p>
                </div>
            </div>

            {/* Flight Search CTA */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🛫</span>
                            <h3 className="font-semibold text-gray-900">
                                Salt Lake City → {destination.city || destination.name}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Compare prices from hundreds of airlines and travel sites
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded-full">
                                Best Price Guarantee
                            </span>
                            <span className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded-full">
                                Free Cancellation
                            </span>
                            <span className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded-full">
                                24/7 Support
                            </span>
                        </div>
                    </div>

                    {/* Search Button */}
                    <a
                        href={flightsUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
                        onClick={() => {
                            // Track flight search click
                            if (typeof window !== 'undefined' && window.gtag) {
                                window.gtag('event', 'booking_flights_click', {
                                    event_category: 'Flights',
                                    event_label: destination.name,
                                    destination: destination.name,
                                    airport_code: destination.airportCode,
                                });
                            }
                        }}
                    >
                        <span>Search Flights</span>
                        <span className="text-lg">→</span>
                    </a>
                </div>
            </div>

            {/* Footer note */}
            <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                Flight bookings help support local content. Prices and availability subject to change.
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
