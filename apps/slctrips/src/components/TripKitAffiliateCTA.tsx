'use client';

import { getBookingLink, getViatorLink } from '@/lib/affiliates';

interface TripKitAffiliateCTAProps {
  destinationName: string;
  lat?: number | null;
  lon?: number | null;
  state?: string | null;
  className?: string;
}

/**
 * Simple affiliate CTAs for TripKit destination cards.
 * Uses getBookingLink and getViatorLink for proper AWIN/Viator tracking.
 */
export default function TripKitAffiliateCTA({
  destinationName,
  lat,
  lon,
  state,
  className = '',
}: TripKitAffiliateCTAProps) {
  const bookingUrl = getBookingLink(destinationName, lat ?? undefined, lon ?? undefined, state ?? undefined);
  const viatorUrl = getViatorLink(destinationName);

  if (!bookingUrl && !viatorUrl) return null;

  return (
    <div className={`flex flex-wrap gap-2 mt-3 ${className}`}>
      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>🛏️</span>
          <span>Book Your Stay</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
      {viatorUrl && (
        <a
          href={viatorUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          <span>🎫</span>
          <span>Find Tours & Activities</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}
