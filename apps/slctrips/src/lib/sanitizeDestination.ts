/**
 * Shared destination sanitization utility
 * 
 * Ensures ALL destination data is safe for React components:
 * - String fields are always strings (never null/undefined)
 * - Array fields are always arrays (never null/undefined)
 * - Prevents toLowerCase(), .length, .map() errors
 * 
 * CRITICAL: Use this function whenever fetching destination data from Supabase
 */

export function sanitizeDestination(dest: any): any {
  try {
    if (!dest || typeof dest !== 'object') return dest;

    const sanitized = { ...dest };

    // CRITICAL: Sanitize string fields that are used with string methods
    // Convert null/undefined to empty string to prevent toLowerCase(), length, etc. errors
    const criticalStringFields = ['name', 'category', 'subcategory', 'slug', 'place_id'];
    criticalStringFields.forEach(field => {
      if (sanitized[field] === null || sanitized[field] === undefined) {
        sanitized[field] = '';
      } else {
        sanitized[field] = String(sanitized[field]);
      }
    });

    // List of all possible array properties - CRITICAL: must include ALL array properties from Destination type
    const arrayProperties = [
      'photo_gallery',
      'nearby_food',
      'nearby_lodging',
      'nearby_attractions',
      'ai_tips',
      'video_urls',
      'podcast_urls',
      'video_url',
      'podcast_url',
      'hotel_recommendations',
      'tour_recommendations',
      // Note: 'activities' and 'historical_timeline' are NOT in this list because
      // they can be strings and need to be handled separately
    ];

    // Sanitize all array properties - ensure they're always arrays, never undefined
    arrayProperties.forEach(prop => {
      const value = sanitized[prop];
      if (value === undefined || value === null) {
        sanitized[prop] = [];
      } else if (!Array.isArray(value)) {
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            sanitized[prop] = Array.isArray(parsed) ? parsed : [];
          } catch {
            sanitized[prop] = [];
          }
        } else {
          sanitized[prop] = [];
        }
      }
    });

    // CRITICAL: Handle 'activities' and 'historical_timeline' separately
    // These can be strings OR arrays - preserve string type if it's a string
    ['activities', 'historical_timeline'].forEach(prop => {
      const value = sanitized[prop];
      if (value === undefined || value === null) {
        sanitized[prop] = '';
      } else if (typeof value === 'string') {
        // Keep as string - don't convert to array
        sanitized[prop] = value;
      } else if (Array.isArray(value)) {
        // If it's an array, convert to comma-separated string for compatibility
        sanitized[prop] = value.filter(item => item !== null && item !== undefined).join(', ');
      } else {
        // For any other type, convert to string
        sanitized[prop] = String(value);
      }
    });

    // Sanitize contact_info.hours
    if (sanitized.contact_info && typeof sanitized.contact_info === 'object') {
      sanitized.contact_info = { ...sanitized.contact_info };
      if (!Array.isArray(sanitized.contact_info.hours)) {
        if (typeof sanitized.contact_info.hours === 'string') {
          try {
            const parsed = JSON.parse(sanitized.contact_info.hours);
            sanitized.contact_info.hours = Array.isArray(parsed) ? parsed : sanitized.contact_info.hours.split('\n').filter((l: string) => l.trim());
          } catch {
            sanitized.contact_info.hours = sanitized.contact_info.hours.split('\n').filter((l: string) => l.trim());
          }
        } else {
          sanitized.contact_info.hours = [];
        }
      }
    }

    // Special handling for photo_gallery - parse JSON strings within the array
    if (Array.isArray(sanitized.photo_gallery)) {
      try {
        sanitized.photo_gallery = sanitized.photo_gallery
          .map((item: any) => {
            try {
              if (!item) return null;
              // If item is a JSON string, parse it
              if (typeof item === 'string') {
                try {
                  const parsed = JSON.parse(item);
                  return typeof parsed === 'object' && parsed !== null ? parsed : { url: item, alt: '', source: 'unknown' };
                } catch {
                  return { url: item, alt: '', source: 'unknown' };
                }
              }
              return typeof item === 'object' && item !== null ? item : null;
            } catch {
              return null;
            }
          })
          .filter((item: any) => item !== null && item !== undefined);
      } catch {
        // If anything goes wrong, ensure photo_gallery is at least an empty array
        sanitized.photo_gallery = [];
      }
    }

    // Sanitize nested arrays in nearby places
    // CRITICAL: This must ensure ALL nested array properties are safe to prevent .length access errors
    ['nearby_food', 'nearby_lodging', 'nearby_attractions'].forEach(prop => {
      try {
        // Ensure the property itself is an array
        let arr = sanitized[prop];
        if (!Array.isArray(arr)) {
          // If it's a string, try to parse it (legacy support)
          if (typeof arr === 'string') {
            try {
              const p = JSON.parse(arr);
              arr = Array.isArray(p) ? p : [];
            } catch {
              arr = [];
            }
          } else {
            arr = [];
          }
          sanitized[prop] = arr;
        }

        // Map and sanitize items explicitly - SIMPLE AND SAFE
        sanitized[prop] = arr.map((item: any) => {
          // Filter out non-objects
          if (!item || typeof item !== 'object') return null;

          // Create a shallow copy to modify safely
          const safeItem = { ...item };

          // Explicitly handle "types" - common source of errors
          if (!Array.isArray(safeItem.types)) {
            safeItem.types = [];
          } else {
            safeItem.types = safeItem.types.filter((t: any) => t !== null && t !== undefined);
          }

          // Explicitly handle "photos" - common source of errors
          if (safeItem.photos !== undefined && safeItem.photos !== null) {
            if (!Array.isArray(safeItem.photos)) {
              safeItem.photos = [];
            } else {
              safeItem.photos = safeItem.photos.filter((p: any) => p !== null && p !== undefined);
            }
          } else {
            // Ensure it exists if it's expected? No, only sanitize if present to avoid bloating objects
          }

          // Explicitly handle "images"
          if (safeItem.images !== undefined && safeItem.images !== null) {
            if (!Array.isArray(safeItem.images)) {
              safeItem.images = [];
            } else {
              safeItem.images = safeItem.images.filter((img: any) => img !== null && img !== undefined);
            }
          }

          return safeItem;
        }).filter((item: any) => item !== null);
      } catch (outerErr) {
        console.error(`[SANITIZATION_ERROR] Failed to sanitize ${prop}:`, outerErr);
        // If anything fails, ensure property is an empty array
        sanitized[prop] = [];
      }
    });

    // CRITICAL: Final pass - ensure ANY property that is an array is safe
    // This catches any unknown array properties that might cause hydration errors
    // We only check top-level properties here to avoid dangerous recursion
    Object.keys(sanitized).forEach(key => {
      try {
        const value = sanitized[key];

        // If value is null or undefined and it's a known array property, initialize it
        if ((value === null || value === undefined) && arrayProperties.includes(key)) {
          sanitized[key] = [];
        }
        // If value is an array, ensure it's safe (filter out null/undefined items)
        else if (Array.isArray(value)) {
          sanitized[key] = value.filter((v: any) => v !== null && v !== undefined);
        }
      } catch (finalErr) {
        console.error(`[SANITIZATION_ERROR] Error in final pass for property ${key}:`, finalErr);
      }
    });

    // Removed recursive sanitization block as it was causing more issues than it solved
    // and adding unnecessary complexity. The explicit handling above is sufficient.

    return sanitized;
  } catch (error) {
    // CRITICAL: If sanitization fails for any reason, return a safe minimal object
    // This ensures React never encounters undefined arrays or null strings
    console.error('[SANITIZATION_ERROR] Failed to sanitize destination:', error);
    if (dest && typeof dest === 'object') {
      // Return a minimal safe version with all arrays and strings initialized
      return {
        ...dest,
        name: dest.name != null ? String(dest.name) : '',
        category: dest.category != null ? String(dest.category) : '',
        subcategory: dest.subcategory != null ? String(dest.subcategory) : '',
        slug: dest.slug != null ? String(dest.slug) : '',
        place_id: dest.place_id != null ? String(dest.place_id) : '',
        photo_gallery: Array.isArray(dest.photo_gallery) ? dest.photo_gallery : [],
        nearby_food: Array.isArray(dest.nearby_food) ? dest.nearby_food : [],
        nearby_lodging: Array.isArray(dest.nearby_lodging) ? dest.nearby_lodging : [],
        nearby_attractions: Array.isArray(dest.nearby_attractions) ? dest.nearby_attractions : [],
        ai_tips: Array.isArray(dest.ai_tips) ? dest.ai_tips : [],
        hotel_recommendations: Array.isArray(dest.hotel_recommendations) ? dest.hotel_recommendations : [],
        tour_recommendations: Array.isArray(dest.tour_recommendations) ? dest.tour_recommendations : [],
        contact_info: dest.contact_info && typeof dest.contact_info === 'object'
          ? { ...dest.contact_info, hours: Array.isArray(dest.contact_info.hours) ? dest.contact_info.hours : [] }
          : { hours: [] }
      };
    }
    return dest;
  }
}

/**
 * Sanitize an array of destinations
 */
export function sanitizeDestinations(destinations: any[]): any[] {
  if (!Array.isArray(destinations)) return [];
  return destinations.map(dest => sanitizeDestination(dest)).filter(dest => dest !== null && dest !== undefined);
}

