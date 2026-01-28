'use client';

/**
 * Booking.com Car Rentals Component
 *
 * Promotes car rental search and booking through Booking.com affiliate program.
 * Displays on destination pages for road trips, scenic drives, and destinations requiring transportation.
 */

interface BookingCarRentalsProps {
    destination: {
        name: string;
        category: string;
        subcategory: string;
        city?: string;
        state?: string;
    };
}

/**
 * Build Booking.com Car Rentals affiliate URL via AWIN
 * Per Awin guidelines: clean destination URL, no tracking params
 */
function buildCarRentalsAffiliateUrl(location: string): string {
    const awinMerchantId = '6776';
    const awinAffiliateId = process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID || '2060961';

    // Clean destination URL (no tracking params - AWIN adds them)
    const destinationUrl = `https://www.booking.com/cars/index.en-us.html?location=${encodeURIComponent(location)}`;

    // AWIN tracking link format
    const params = new URLSearchParams({
        awinmid: awinMerchantId,
        awinaffid: awinAffiliateId,
        campaign: 'slctrips-cars',
        ued: destinationUrl,
    });

    return `https://www.awin1.com/cread.php?${params.toString()}`;
}

/**
 * Determine if destination should show car rental recommendations
 */
function shouldShowCarRentals(destination: BookingCarRentalsProps['destination']): boolean {
    const subcategory = destination.subcategory?.toLowerCase() || '';
    const category = destination.category?.toLowerCase() || '';

    // Show for road trips, scenic drives, national parks, and outdoor destinations
    return (
        subcategory.includes('road trip') ||
        subcategory.includes('scenic') ||
        subcategory.includes('drive') ||
        subcategory.includes('national park') ||
        subcategory.includes('state park') ||
        category.includes('outdoor') ||
        category.includes('nature')
    );
}

export default function BookingCarRentals({ destination }: BookingCarRentalsProps) {
    // Only show for relevant destination types
    if (!shouldShowCarRentals(destination)) {
        return null;
    }

    const searchLocation = destination.city || destination.name;
    const carRentalsUrl = buildCarRentalsAffiliateUrl(searchLocation);

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">🚗</div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Rent a Car</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Explore {destination.name} at your own pace
                    </p>
                </div>
            </div>

            {/* Car Rental CTA */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🗺️</span>
                            <h3 className="font-semibold text-gray-900">
                                Car Rentals in {searchLocation}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Compare prices from top rental companies and find the perfect vehicle for your adventure
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                Free Cancellation
                            </span>
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                No Hidden Fees
                            </span>
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                Instant Confirmation
                            </span>
                        </div>
                    </div>

                    {/* Search Button */}
                    <a
                        href={carRentalsUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
                        onClick={() => {
                            // Track car rental search click
                            if (typeof window !== 'undefined' && window.gtag) {
                                window.gtag('event', 'booking_car_rentals_click', {
                                    event_category: 'Car Rentals',
                                    event_label: destination.name,
                                    destination: destination.name,
                                    location: searchLocation,
                                });
                            }
                        }}
                    >
                        <span>Find Rentals</span>
                        <span className="text-lg">→</span>
                    </a>
                </div>
            </div>

            {/* Why rent a car callout */}
            <div className="mt-4 p-3 bg-white/50 rounded-lg border border-emerald-100">
                <p className="text-sm text-gray-700">
                    <span className="font-semibold">💡 Pro Tip:</span> Having your own vehicle gives you the freedom to explore hidden gems and scenic viewpoints at your own pace.
                </p>
            </div>

            {/* Footer note */}
            <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                Car rental bookings help support local content. Prices and availability subject to change.
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
