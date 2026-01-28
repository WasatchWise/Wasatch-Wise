'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TripKit } from '@/types/database.types';

interface TripKitNavigationBarProps {
  tripkit: TripKit;
  currentPage?: 'overview' | 'destination';
  currentDestinationName?: string;
  showMyTripKitsLink?: boolean;
}

export default function TripKitNavigationBar({
  tripkit,
  currentPage = 'overview',
  currentDestinationName,
  showMyTripKitsLink = true,
}: TripKitNavigationBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between py-3">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm overflow-x-auto">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 whitespace-nowrap"
            >
              Home
            </Link>

            {showMyTripKitsLink && (
              <>
                <span className="text-gray-400">/</span>
                <Link
                  href="/account/my-tripkits"
                  className="text-gray-500 hover:text-gray-700 whitespace-nowrap"
                >
                  My TripKits
                </Link>
              </>
            )}

            <span className="text-gray-400">/</span>
            <Link
              href={`/tripkits/${tripkit.slug}/view`}
              className={`whitespace-nowrap font-medium ${
                currentPage === 'overview'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {tripkit.name}
            </Link>

            {currentDestinationName && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium truncate max-w-[200px]">
                  {currentDestinationName}
                </span>
              </>
            )}
          </div>

          {/* Right: TripKit Code & Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="hidden sm:inline-block text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {tripkit.code}
            </span>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isExpanded ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* TripKit Info Bar (Desktop) - Always Visible */}
        <div className="hidden lg:flex items-center gap-4 pb-3 border-t border-gray-100 pt-3">
          {/* TripKit Icon/Thumbnail */}
          {tripkit.cover_image_url && (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
              <Image
                src={tripkit.cover_image_url}
                alt={tripkit.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          )}

          {/* TripKit Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-bold text-gray-900 truncate">
                {tripkit.name}
              </h2>
              {tripkit.tier && tripkit.tier !== 'free' && (
                <span className="text-xs uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                  {tripkit.tier}
                </span>
              )}
            </div>
            {tripkit.tagline && (
              <p className="text-xs text-gray-600 truncate">{tripkit.tagline}</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/tripkits/${tripkit.slug}/view`}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap"
            >
              TripKit Home
            </Link>
            {tripkit.destination_count > 0 && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {tripkit.destination_count} location{tripkit.destination_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Expanded Menu */}
        {isExpanded && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-3">
            <div className="flex items-start gap-3">
              {tripkit.cover_image_url && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  <Image
                    src={tripkit.cover_image_url}
                    alt={tripkit.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  {tripkit.name}
                </h2>
                {tripkit.tagline && (
                  <p className="text-sm text-gray-600 line-clamp-2">{tripkit.tagline}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link
                href={`/tripkits/${tripkit.slug}/view`}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                View TripKit Home
              </Link>
              {showMyTripKitsLink && (
                <Link
                  href="/account/my-tripkits"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  ← Back to My TripKits
                </Link>
              )}
              {tripkit.destination_count > 0 && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  {tripkit.destination_count} destination{tripkit.destination_count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
