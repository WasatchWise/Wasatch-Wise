'use client';

import { useState } from 'react';
import ShareButton from './ShareButton';

interface ShareableItineraryProps {
  tripkitName: string;
  destinations: Array<{
    id: string;
    name: string;
    slug: string;
    drive_time_from_slc?: number | null;
  }>;
  visitedIds: Set<string>;
  wishlistIds: Set<string>;
}

export default function ShareableItinerary({
  tripkitName,
  destinations,
  visitedIds,
  wishlistIds
}: ShareableItineraryProps) {
  const [showItinerary, setShowItinerary] = useState(false);

  const visitedDestinations = destinations.filter(d => visitedIds.has(d.id));
  const wishlistDestinations = destinations.filter(d => wishlistIds.has(d.id));

  const generateItineraryText = () => {
    let text = `My ${tripkitName} Itinerary\n\n`;
    
    if (visitedDestinations.length > 0) {
      text += `✅ Visited (${visitedDestinations.length}):\n`;
      visitedDestinations.forEach((d, i) => {
        const driveTime = d.drive_time_from_slc 
          ? `${Math.floor(d.drive_time_from_slc / 60)}h ${d.drive_time_from_slc % 60}m from SLC`
          : '';
        text += `${i + 1}. ${d.name}${driveTime ? ` (${driveTime})` : ''}\n`;
      });
      text += '\n';
    }

    if (wishlistDestinations.length > 0) {
      text += `⭐ Wishlist (${wishlistDestinations.length}):\n`;
      wishlistDestinations.forEach((d, i) => {
        const driveTime = d.drive_time_from_slc 
          ? `${Math.floor(d.drive_time_from_slc / 60)}h ${d.drive_time_from_slc % 60}m from SLC`
          : '';
        text += `${i + 1}. ${d.name}${driveTime ? ` (${driveTime})` : ''}\n`;
      });
      text += '\n';
    }

    text += `\nView full TripKit: ${typeof window !== 'undefined' ? window.location.href : ''}`;
    return text;
  };

  const copyItinerary = async () => {
    try {
      const text = generateItineraryText();
      await navigator.clipboard.writeText(text);
      alert('Itinerary copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy itinerary:', err);
    }
  };

  const shareItinerary = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${tripkitName} Itinerary`,
          text: generateItineraryText(),
          url: typeof window !== 'undefined' ? window.location.href : ''
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      copyItinerary();
    }
  };

  if (visitedDestinations.length === 0 && wishlistDestinations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="text-2xl animate-float">📋</span>
            My Itinerary
          </h3>
          <p className="text-sm text-gray-600">
            {visitedDestinations.length > 0 && `${visitedDestinations.length} visited`}
            {visitedDestinations.length > 0 && wishlistDestinations.length > 0 && ' • '}
            {wishlistDestinations.length > 0 && `${wishlistDestinations.length} on wishlist`}
          </p>
        </div>
        <button
          onClick={() => setShowItinerary(!showItinerary)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium hover:scale-105 active:scale-95"
        >
          {showItinerary ? 'Hide' : 'Show'}
        </button>
      </div>

      {showItinerary && (
        <div className="space-y-4 animate-slideUp">
          {visitedDestinations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                ✅ Visited ({visitedDestinations.length})
              </h4>
              <ul className="space-y-1">
                {visitedDestinations.map((d) => (
                  <li key={d.id} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {d.name}
                    {d.drive_time_from_slc && (
                      <span className="text-xs text-gray-500">
                        ({Math.floor(d.drive_time_from_slc / 60)}h {d.drive_time_from_slc % 60}m)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {wishlistDestinations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                ⭐ Wishlist ({wishlistDestinations.length})
              </h4>
              <ul className="space-y-1">
                {wishlistDestinations.map((d) => (
                  <li key={d.id} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-blue-600">★</span>
                    {d.name}
                    {d.drive_time_from_slc && (
                      <span className="text-xs text-gray-500">
                        ({Math.floor(d.drive_time_from_slc / 60)}h {d.drive_time_from_slc % 60}m)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={shareItinerary}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Itinerary
            </button>
            <button
              onClick={copyItinerary}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
