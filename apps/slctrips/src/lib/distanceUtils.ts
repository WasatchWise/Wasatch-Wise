/**
 * Distance calculation utilities
 * Used for sorting destinations by proximity to user location or SLC Airport
 */

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * SLC Airport coordinates (default reference point)
 */
export const SLC_AIRPORT_COORDS = {
  lat: 40.7899,
  lng: -111.9791
};

/**
 * Sort destinations by distance from a reference point
 * Adds a `distance` property to each destination
 */
export function sortByDistance<T extends { latitude: number | null; longitude: number | null }>(
  destinations: T[],
  referenceLat: number,
  referenceLng: number
): Array<T & { distance?: number }> {
  type WithDistance = T & { distance?: number };

  const withDistances: WithDistance[] = destinations.map((dest) => {
    if (dest.latitude != null && dest.longitude != null) {
      return {
        ...dest,
        distance: calculateDistance(referenceLat, referenceLng, dest.latitude, dest.longitude),
      };
    }
    return { ...dest };
  });

  return withDistances.sort((a, b) => {
    // Handle missing coordinates - put them at the end
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance - b.distance;
  });
}

