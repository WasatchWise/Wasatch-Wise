'use client';

import { useState } from 'react';

interface HotelRecommendation {
  name: string;
  type?: string;
  price?: string;
  booking?: string;
  url?: string;
}

interface TourRecommendation {
  name: string;
  provider?: string;
  price?: string;
  viator?: string;
  gyg?: string;
  url?: string;
}

interface EnhanceYourVisitProps {
  destinationName: string;
  hotelRecommendations?: HotelRecommendation[] | null;
  tourRecommendations?: TourRecommendation[] | null;
  nearbyFood?: string[] | null;
  nearbyLodging?: string[] | null;
  className?: string;
}

/**
 * EnhanceYourVisit Component
 *
 * Subtle affiliate recommendations that feel like helpful suggestions,
 * not sales pitches. Only shows when there's relevant data.
 *
 * Philosophy: "While you're here, you might want to know about..."
 */
export default function EnhanceYourVisit({
  destinationName,
  hotelRecommendations,
  tourRecommendations,
  nearbyFood,
  nearbyLodging,
  className = '',
}: EnhanceYourVisitProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out placeholder/template data
  const validHotels = hotelRecommendations?.filter(h =>
    h.name && h.name !== 'Courtyard by Marriott' && h.url
  ) || [];

  const validTours = tourRecommendations?.filter(t =>
    t.name &&
    !t.name.includes('Guided Summit Hike - Private') &&
    (t.url || t.viator || t.gyg)
  ) || [];

  // Don't render if no valid recommendations
  const hasContent = validHotels.length > 0 || validTours.length > 0;
  if (!hasContent) return null;

  // Build affiliate URLs
  const getViatorUrl = (id: string) =>
    `https://www.viator.com/tours/${id}?pid=P00150628&mcid=42383&medium=link`;

  const getGetYourGuideUrl = (id: string) =>
    `https://www.getyourguide.com/${id}?partner_id=SLCTRIPS`;

  return (
    <div className={`mt-3 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>While you&apos;re here...</span>
      </button>

      {isExpanded && (
        <div className="mt-3 pl-6 space-y-3 text-sm">
          {/* Tours */}
          {validTours.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">
                Consider a guided experience:
              </p>
              <div className="space-y-2">
                {validTours.slice(0, 2).map((tour, idx) => {
                  const url = tour.url ||
                    (tour.viator ? getViatorUrl(tour.viator) : null) ||
                    (tour.gyg ? getGetYourGuideUrl(tour.gyg) : null);

                  return (
                    <a
                      key={idx}
                      href={url || '#'}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <span className="text-amber-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-700 group-hover:text-gray-900">{tour.name}</span>
                        {tour.price && (
                          <span className="text-gray-400 ml-2">from {tour.price}</span>
                        )}
                      </div>
                      <svg className="w-3 h-3 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hotels */}
          {validHotels.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">
                Nearby places to stay:
              </p>
              <div className="space-y-2">
                {validHotels.slice(0, 2).map((hotel, idx) => (
                  <a
                    key={idx}
                    href={hotel.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <span className="text-blue-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-700 group-hover:text-gray-900">{hotel.name}</span>
                      {hotel.price && (
                        <span className="text-gray-400 ml-2">{hotel.price}</span>
                      )}
                    </div>
                    <svg className="w-3 h-3 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Disclosure */}
          <p className="text-xs text-gray-400 italic">
            Booking through these links helps support SLCTrips at no extra cost to you.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline version for destination cards
 */
export function EnhanceYourVisitInline({
  tourRecommendations,
}: {
  tourRecommendations?: TourRecommendation[] | null;
}) {
  const validTours = tourRecommendations?.filter(t =>
    t.name &&
    !t.name.includes('Guided Summit Hike - Private') &&
    (t.url || t.viator || t.gyg)
  ) || [];

  if (validTours.length === 0) return null;

  const tour = validTours[0];
  const url = tour.url ||
    (tour.viator ? `https://www.viator.com/tours/${tour.viator}?pid=P00150628&mcid=42383` : null) ||
    (tour.gyg ? `https://www.getyourguide.com/${tour.gyg}?partner_id=SLCTRIPS` : null);

  return (
    <a
      href={url || '#'}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700"
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4z" clipRule="evenodd" />
      </svg>
      <span>Book a tour</span>
    </a>
  );
}
