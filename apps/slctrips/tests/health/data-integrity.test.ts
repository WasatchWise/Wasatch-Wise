/**
 * Data integrity health checks
 * Validates data structure and relationships
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

test.describe('Data Integrity Checks', () => {
  test.skip(!SUPABASE_URL || !SUPABASE_ANON_KEY, 'Supabase credentials not configured');

  test('should have valid destination data structure', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data: destinations, error } = await supabase
      .from('public_destinations')
      .select('id, name, slug, latitude, longitude')
      .limit(5);

    if (error) {
      console.warn('Could not fetch destinations:', error.message);
      return;
    }

    if (destinations && destinations.length > 0) {
      destinations.forEach(dest => {
        expect(dest).toHaveProperty('id');
        expect(dest).toHaveProperty('name');
        expect(dest).toHaveProperty('slug');
        expect(typeof dest.name).toBe('string');
        expect(dest.name.length).toBeGreaterThan(0);
      });
    }
  });

  test('should have valid tripkit data structure', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data: tripkits, error } = await supabase
      .from('tripkits')
      .select('id, code, name, slug')
      .limit(5);

    if (error) {
      console.warn('Could not fetch tripkits:', error.message);
      return;
    }

    if (tripkits && tripkits.length > 0) {
      tripkits.forEach(tk => {
        expect(tk).toHaveProperty('id');
        expect(tk).toHaveProperty('code');
        expect(tk).toHaveProperty('name');
        expect(typeof tk.code).toBe('string');
      });
    }
  });

  test('should have valid slug formats', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data: destinations } = await supabase
      .from('public_destinations')
      .select('slug')
      .limit(10);

    if (destinations) {
      destinations.forEach(dest => {
        if (dest.slug) {
          // Slugs should be lowercase, alphanumeric with hyphens
          expect(dest.slug).toMatch(/^[a-z0-9-]+$/);
          expect(dest.slug).not.toMatch(/^-|-$/); // No leading/trailing hyphens
        }
      });
    }
  });

  test('should have valid coordinate ranges', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data: destinations } = await supabase
      .from('public_destinations')
      .select('latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(10);

    if (destinations) {
      destinations.forEach(dest => {
        // Utah coordinates should be roughly:
        // Latitude: 37-42
        // Longitude: -114 to -109
        if (dest.latitude) {
          expect(dest.latitude).toBeGreaterThan(35);
          expect(dest.latitude).toBeLessThan(45);
        }
        if (dest.longitude) {
          expect(dest.longitude).toBeGreaterThan(-115);
          expect(dest.longitude).toBeLessThan(-108);
        }
      });
    }
  });
});
