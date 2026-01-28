'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Destination } from '@/lib/types';
import { normalizeImageSrc } from '@/lib/normalizeImageSrc';

interface DestinationNavigationControlsProps {
  destinations: Destination[];
  currentDestinationSlug: string;
  tripkitSlug: string;
  tripkitCode?: string;
}

export default function DestinationNavigationControls({
  destinations,
  currentDestinationSlug,
  tripkitSlug,
  tripkitCode,
}: DestinationNavigationControlsProps) {
  const [showAllDestinations, setShowAllDestinations] = useState(false);

  // Find current destination index
  const currentIndex = destinations.findIndex(d => d.slug === currentDestinationSlug);
  const prevDestination = currentIndex > 0 ? destinations[currentIndex - 1] : null;
  const nextDestination = currentIndex < destinations.length - 1 ? destinations[currentIndex + 1] : null;

  if (destinations.length === 0 || currentIndex === -1) {
    return null;
  }

  return (
    <>
      {/* Fixed Bottom Navigation Bar (Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            {prevDestination ? (
              <Link
                href={`/destinations/${prevDestination.slug}?from=${tripkitSlug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors group"
              >
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Previous
                </span>
              </Link>
            ) : (
              // Spacer for alignment when there's no previous destination
              <div className="w-20"></div>
            )}

            {/* Progress & Dropdown Toggle */}
            <button
              onClick={() => setShowAllDestinations(!showAllDestinations)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span className="text-sm font-bold text-blue-900">
                {currentIndex + 1} / {destinations.length}
              </span>
              <span className="hidden md:inline text-sm text-blue-700">
                destinations
              </span>
              <svg
                className={`w-4 h-4 text-blue-600 transition-transform ${showAllDestinations ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Next Button */}
            {nextDestination ? (
              <Link
                href={`/destinations/${nextDestination.slug}?from=${tripkitSlug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors group"
              >
                <span className="hidden sm:inline text-sm font-medium">
                  Next
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <Link
                href={`/tripkits/${tripkitSlug}/view`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors text-sm font-medium"
              >
                <span className="hidden sm:inline">Complete</span>
                <span className="sm:hidden">✓</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Destination List Dropdown (slides up from bottom) */}
      {showAllDestinations && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowAllDestinations(false)}
          ></div>

          {/* Dropdown Panel */}
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  All Destinations {tripkitCode && `in ${tripkitCode}`}
                </h3>
                <button
                  onClick={() => setShowAllDestinations(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {destinations.map((dest, idx) => {
                  const isCurrent = dest.slug === currentDestinationSlug;
                  return (
                    <Link
                      key={dest.id}
                      href={`/destinations/${dest.slug}?from=${tripkitSlug}`}
                      className={`block p-4 rounded-lg border-2 transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setShowAllDestinations(false)}
                    >
                      <div className="flex items-start gap-3">
                        {dest.image_url && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                            <Image
                              src={normalizeImageSrc(dest.image_url) || '/images/Site_logo.png'}
                              alt={dest.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">
                              #{idx + 1}
                            </span>
                            {isCurrent && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                Current
                              </span>
                            )}
                          </div>
                          <h4 className={`text-sm font-bold ${isCurrent ? 'text-blue-900' : 'text-gray-900'} line-clamp-2`}>
                            {dest.name}
                          </h4>
                          {dest.subcategory && (
                            <p className="text-xs text-gray-500 mt-1">{dest.subcategory}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <Link
                  href={`/tripkits/${tripkitSlug}/view`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                  onClick={() => setShowAllDestinations(false)}
                >
                  ← Back to TripKit Home
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer to prevent content from being hidden under fixed bottom bar */}
      <div className="h-20"></div>
    </>
  );
}
