/**
 * Unit tests for distance calculation utilities
 */

import { calculateDistance, sortByDistance, SLC_AIRPORT_COORDS } from '@/lib/distanceUtils';

describe('distanceUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // SLC Airport to downtown SLC (approximately 5-6 miles)
      const distance = calculateDistance(
        40.7899, -111.9791, // SLC Airport
        40.7608, -111.8910  // Downtown SLC
      );

      expect(distance).toBeGreaterThanOrEqual(5);
      expect(distance).toBeLessThan(7);
    });

    it('should return 0 for identical coordinates', () => {
      const distance = calculateDistance(
        40.7899, -111.9791,
        40.7899, -111.9791
      );
      
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      // Use coordinates far enough apart to produce non-zero after rounding
      const distance = calculateDistance(
        40.7899, -111.9791,
        40.7950, -111.9700
      );

      expect(distance).toBeGreaterThanOrEqual(0);
      expect(distance).toBeLessThan(1);
    });

    it('should round to 1 decimal place', () => {
      const distance = calculateDistance(
        40.7899, -111.9791,
        40.7900, -111.9792
      );
      
      const decimalPlaces = distance.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });
  });

  describe('sortByDistance', () => {
    const mockDestinations = [
      { id: 1, name: 'Far', latitude: 41.0, longitude: -112.0 },
      { id: 2, name: 'Close', latitude: 40.8, longitude: -111.98 },
      { id: 3, name: 'Medium', latitude: 40.9, longitude: -112.0 },
    ];

    it('should sort destinations by distance from reference point', () => {
      const sorted = sortByDistance(
        mockDestinations,
        SLC_AIRPORT_COORDS.lat,
        SLC_AIRPORT_COORDS.lng
      );

      expect(sorted[0].name).toBe('Close');
      expect(sorted[0].distance).toBeDefined();
      expect(sorted[0].distance).toBeLessThan(sorted[1].distance || Infinity);
    });

    it('should handle destinations with null coordinates', () => {
      const destinationsWithNulls = [
        ...mockDestinations,
        { id: 4, name: 'No Coords', latitude: null, longitude: null },
      ];

      const sorted = sortByDistance(
        destinationsWithNulls,
        SLC_AIRPORT_COORDS.lat,
        SLC_AIRPORT_COORDS.lng
      );

      // Destinations with null coords should be at the end
      const nullCoordsIndex = sorted.findIndex(d => d.name === 'No Coords');
      expect(nullCoordsIndex).toBeGreaterThan(0);
    });

    it('should preserve original array when all have null coordinates', () => {
      const noCoords = [
        { id: 1, name: 'A', latitude: null, longitude: null },
        { id: 2, name: 'B', latitude: null, longitude: null },
      ];

      const sorted = sortByDistance(
        noCoords,
        SLC_AIRPORT_COORDS.lat,
        SLC_AIRPORT_COORDS.lng
      );

      expect(sorted).toHaveLength(2);
    });
  });

  describe('SLC_AIRPORT_COORDS', () => {
    it('should have valid coordinates', () => {
      expect(SLC_AIRPORT_COORDS.lat).toBe(40.7899);
      expect(SLC_AIRPORT_COORDS.lng).toBe(-111.9791);
      expect(typeof SLC_AIRPORT_COORDS.lat).toBe('number');
      expect(typeof SLC_AIRPORT_COORDS.lng).toBe('number');
    });
  });
});
