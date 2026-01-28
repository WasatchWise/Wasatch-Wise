'use client';

import { Destination } from '@/lib/types';

interface WatershedBadgeProps {
  destination: Destination;
  variant?: 'card' | 'detail';
}

/**
 * WatershedBadge Component
 * 
 * Shows critical watershed protection and dog policy information
 * for destinations in Utah's mountain watershed areas.
 * 
 * Important for protecting Salt Lake City's drinking water supply.
 */
export default function WatershedBadge({ destination, variant = 'card' }: WatershedBadgeProps) {
  // Determine if this destination is in a mountain/watershed area
  const isMountainDestination = isInMountainArea(destination);
  
  // Check if in Salt Lake City watershed (critical protection area)
  const isWatershedProtected = isInWatershedProtectedArea(destination);
  
  // Determine dog policy (may differ in watershed areas)
  const dogPolicy = getDogPolicy(destination, isWatershedProtected);
  
  // Don't show badge if not in mountain area
  if (!isMountainDestination) return null;
  
  // Card variant - compact badge
  if (variant === 'card') {
    return (
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isWatershedProtected && (
          <span 
            className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg border border-blue-400"
            title="Watershed Protection Area - Help protect our drinking water"
          >
            💧 Watershed
          </span>
        )}
        {dogPolicy === 'prohibited' && (
          <span 
            className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg"
            title="Dogs are not allowed in this watershed protection area"
          >
            🚫 No Dogs
          </span>
        )}
        {dogPolicy === 'restricted' && (
          <span 
            className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded-full shadow-lg"
            title="Dogs allowed on leash only - please follow all regulations"
          >
            🐕 Leash Required
          </span>
        )}
      </div>
    );
  }
  
  // Detail variant - expanded info box
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-3xl">💧</div>
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <span>Watershed Protection Area</span>
            {isWatershedProtected && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">CRITICAL</span>
            )}
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            This destination is in Utah's protected watershed area. These mountains provide 
            drinking water for millions of Utahns. Please help us protect this vital resource.
          </p>
          
          {/* Dog Policy */}
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐕</span>
              <span className="font-semibold text-gray-900">Dog Policy:</span>
              {dogPolicy === 'prohibited' && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                  NO DOGS ALLOWED
                </span>
              )}
              {dogPolicy === 'restricted' && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                  LEASH REQUIRED
                </span>
              )}
              {dogPolicy === 'allowed' && destination.pet_allowed && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                  ALLOWED ON LEASH
                </span>
              )}
            </div>
            
            {dogPolicy === 'prohibited' && (
              <p className="text-sm text-gray-700">
                Dogs are <strong>prohibited</strong> in this watershed area to protect drinking water quality. 
                This includes all trails and areas. Thank you for helping protect our water supply.
              </p>
            )}
            
            {dogPolicy === 'restricted' && (
              <p className="text-sm text-gray-700">
                Dogs must be kept on a <strong>6-foot leash at all times</strong>. Please pack out all waste 
                and stay on designated trails. Water sources must remain clean.
              </p>
            )}
            
            {dogPolicy === 'allowed' && destination.pet_allowed && (
              <p className="text-sm text-gray-700">
                Dogs are welcome on leash. Please practice Leave No Trace principles and pack out all waste.
              </p>
            )}
          </div>
          
          {/* Watershed Protection Guidelines */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700 font-semibold mb-1">Watershed Protection Guidelines:</p>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Stay on designated trails</li>
              <li>Pack out ALL waste (including pet waste)</li>
              <li>Do not disturb water sources</li>
              <li>Follow all posted regulations</li>
              <li>Respect wildlife and vegetation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Determine if destination is in a mountain/watershed area
 * Uses heuristics based on location, category, and subcategory
 */
function isInMountainArea(destination: Destination): boolean {
  // Check subcategory - mountain activities
  const mountainActivities = [
    'Hiking', 'Skiing', 'Snowshoeing', 'Backcountry Skiing',
    'Mountain Biking', 'Rock Climbing', 'Alpine', 'Summit'
  ];
  
  if (mountainActivities.some(activity => 
    destination.subcategory?.toLowerCase().includes(activity.toLowerCase())
  )) {
    return true;
  }
  
  // Check county - Wasatch Front counties often have watershed areas
  const watershedCounties = [
    'Salt Lake', 'Summit', 'Wasatch', 'Utah', 'Davis', 'Weber',
    'Cache', 'Morgan', 'Tooele'
  ];
  
  if (destination.county && watershedCounties.some(county => 
    destination.county?.toLowerCase().includes(county.toLowerCase())
  )) {
    return true;
  }
  
  // Check drive time - longer drives often go into mountains
  if (destination.drive_minutes && destination.drive_minutes > 60) {
    // 3h+ drives often include mountain areas
    if (destination.category === '3h' || destination.category === '5h' || 
        destination.category === '8h' || destination.category === '12h') {
      return true;
    }
  }
  
  // Check elevation via region or name keywords
  const mountainKeywords = ['mountain', 'peak', 'summit', 'canyon', 'basin', 
                            'ridge', 'pass', 'crest', 'cirque', 'couloir'];
  
  const nameLower = destination.name?.toLowerCase() || '';
  if (mountainKeywords.some(keyword => nameLower.includes(keyword))) {
    return true;
  }
  
  return false;
}

/**
 * Determine if destination is in critical watershed protection area
 * Salt Lake City watershed areas have stricter regulations
 */
function isInWatershedProtectedArea(destination: Destination): boolean {
  // Salt Lake City watershed areas (Big and Little Cottonwood Canyons, etc.)
  const criticalWatershedKeywords = [
    'cottonwood', 'millcreek', 'city creek', 'emigration', 'parleys',
    'wasatch', 'alta', 'snowbird', 'brighton', 'solitude',
    'mount olympus', 'twin peaks', 'broads fork', 'little cottonwood',
    'big cottonwood', 'neffs canyon', 'lambs canyon'
  ];
  
  const searchableText = [
    destination.name,
    destination.county,
    destination.city,
    destination.address_full,
    destination.subcategory
  ].filter(Boolean).join(' ').toLowerCase();
  
  return criticalWatershedKeywords.some(keyword => 
    searchableText.includes(keyword)
  );
}

/**
 * Determine dog policy based on destination and watershed status
 */
function getDogPolicy(destination: Destination, isWatershedProtected: boolean): 'prohibited' | 'restricted' | 'allowed' {
  // Critical watershed areas often prohibit dogs entirely
  if (isWatershedProtected) {
    // Some areas like Big/Little Cottonwood Canyons prohibit dogs
    const prohibitedKeywords = ['cottonwood', 'alta', 'snowbird'];
    const searchableText = [
      destination.name,
      destination.address_full,
      destination.subcategory
    ].filter(Boolean).join(' ').toLowerCase();
    
    if (prohibitedKeywords.some(keyword => searchableText.includes(keyword))) {
      return 'prohibited';
    }
    
    // Most watershed areas require leashes
    return 'restricted';
  }
  
  // Outside critical watershed, check pet_allowed flag
  if (destination.pet_allowed === false) {
    return 'prohibited';
  }
  
  // Default for mountain areas: allowed but should be leashed
  return 'allowed';
}

