'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Destination } from '@/lib/types';
import WatershedBadge from '@/components/WatershedBadge';
import { normalizeImageSrc } from '@/lib/normalizeImageSrc';

function getSubcategoryIcon(subcategory: string): string {
  const icons: Record<string, string> = {
    'Brewery': '🍺', 'Coffee': '☕', 'Restaurant': '🍽️', 'Film Locations': '🎬',
    'Scenic Drive': '🚗', 'Haunted Location': '👻', 'Hiking': '🥾', 'Skiing': '⛷️',
    'Swimming': '🏊', 'National Park': '🏞️', 'Museum': '🏛️', 'Rock Climbing': '🧗',
    'Camping': '⛺', 'Mountain Biking': '🚵', 'Hot Spring': '♨️', 'Lake': '🏊',
    'Waterfall': '💧', 'Ghost Town': '👻', 'State Park': '🏕️', 'Golf': '⛳'
  };
  return icons[subcategory] || '📍';
}

export default function DestinationCard({ d }: { d: Destination }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = normalizeImageSrc(d.image_url || d.photo_url);
  const subcategoryIcon = getSubcategoryIcon(d.subcategory);

  return (
    <Link href={`/destinations/${d.slug}`} data-testid="destination-card" className="group block rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Image with overlays */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <>
            <span
              className="absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-300"
              style={{ opacity: imageLoaded ? 0 : 1 }}
              aria-hidden
            />
            <Image
              src={imageUrl}
              alt={d.name}
              fill
              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
            No photo
          </div>
        )}

        {/* Watershed/Dog Policy Badge (mountain destinations) */}
        <WatershedBadge destination={d} variant="card" />

        {/* Top badges - moved to right if watershed badge present */}
        <div className="absolute top-2 right-2 flex flex-wrap gap-1" role="list" aria-label="Destination badges">
          {d.featured && (
            <span className="px-2 py-1 bg-yellow-500 text-gray-900 text-xs font-bold rounded-full shadow-md" role="listitem" aria-label="Featured destination">
              <span aria-hidden="true">⭐</span> Featured
            </span>
          )}
          {d.trending && (
            <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded-full shadow-md" role="listitem" aria-label="Trending destination">
              <span aria-hidden="true">🔥</span> Trending
            </span>
          )}
        </div>

        {/* Drive time badge - bottom right; never show "0h 0m" — use "At SLC Airport" when 0 */}
        {((d.drive_minutes === 0 || d.distance_miles === 0) || (d.drive_minutes != null && d.drive_minutes > 0)) && (
          <div 
            className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded backdrop-blur-sm"
            aria-label={
              (d.drive_minutes === 0 || d.distance_miles === 0)
                ? 'At Salt Lake City Airport'
                : `${Math.floor(d.drive_minutes! / 60)} hours ${d.drive_minutes! % 60} minutes drive from Salt Lake City Airport`
            }
          >
            <span aria-hidden="true">🚗</span>{' '}
            {(d.drive_minutes === 0 || d.distance_miles === 0) ? 'At SLC Airport' : `${Math.floor(d.drive_minutes! / 60)}h ${d.drive_minutes! % 60}m`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 line-clamp-2">
            {d.name}
          </h3>
        </div>

        {/* Subcategory */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <span aria-hidden="true">{subcategoryIcon}</span>
          <span>{d.subcategory}</span>
        </div>

        {/* Amenity icons - compact row */}
        <div className="flex flex-wrap gap-1 mb-2" role="list" aria-label="Amenities">
          {d.is_family_friendly && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full" title="Family Friendly" role="listitem" aria-label="Family Friendly">
              <span aria-hidden="true">👨‍👩‍👧‍👦</span>
            </span>
          )}
          {d.pet_allowed && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full" title="Pet Friendly" role="listitem" aria-label="Pet Friendly">
              <span aria-hidden="true">🐕</span>
            </span>
          )}
          {d.is_parking_free && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full" title="Free Parking" role="listitem" aria-label="Free Parking">
              <span aria-hidden="true">🅿️</span>
            </span>
          )}
          {d.has_restrooms && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full" title="Restrooms" role="listitem" aria-label="Restrooms">
              <span aria-hidden="true">🚻</span>
            </span>
          )}
        </div>

        {/* Distance — never show "0 miles"; use "At SLC Airport" when 0 */}
        {((d.distance_miles === 0 || d.drive_minutes === 0) || (d.distance_miles != null && d.distance_miles > 0)) && (
          <p className="text-xs text-gray-700">
            <span aria-hidden="true">📍</span> <span className="sr-only">Distance: </span>
            {d.distance_miles === 0 || d.drive_minutes === 0 ? 'At SLC Airport' : `${Math.round(d.distance_miles!)} miles from SLC`}
          </p>
        )}
      </div>
    </Link>
  );
}


