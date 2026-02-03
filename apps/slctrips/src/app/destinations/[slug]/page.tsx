import { createSupabaseServerClient } from '@/lib/supabaseServerComponent';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatDanPacks from '@/components/WhatDanPacks';
import ViatorTours from '@/components/ViatorTours';
import BookingAccommodations from '@/components/BookingAccommodations';
import BookingFlights from '@/components/BookingFlights';
import BookingCarRentals from '@/components/BookingCarRentals';
import PhotoCarousel from '@/components/PhotoCarousel';
import GuardianIntroduction from '@/components/GuardianIntroduction';
import SchemaMarkup, { generateTouristAttractionSchema, generateBreadcrumbSchema } from '@/components/SchemaMarkup';
import Link from 'next/link';
import Image from 'next/image';
import DestinationCard from '@/components/DestinationCard';
import DestinationMediaSection from '@/components/DestinationMediaSection';
import WatershedBadge from '@/components/WatershedBadge';
import { Destination } from '@/lib/types';
import { sanitizeDestination } from '@/lib/sanitizeDestination';
import { normalizeImageSrc } from '@/lib/normalizeImageSrc';
import type { 
  PhotoGalleryItem, 
  PhotoGallery, 
  NearbyRecommendation, 
  ContactInfo 
} from '@/types/database.types';

// Type definitions for media content
interface VideoItem {
  url: string;
  title?: string;
  channel?: string;
}

interface PodcastItem {
  url?: string;
  title: string;
  host?: string;
  duration?: string;
  embedUrl?: string;
  thumbnail?: string;
}

// Helper to gate console.error for production
const logError = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(...args);
  }
};

type Params = {
  params: { slug: string };
  searchParams: { from?: string };
};

// Local Destination interface removed in favor of shared type from '@/lib/types'

interface Guardian {
  id: string;
  display_name: string;
  codename: string;
  county: string;
  animal_type: string;
  backstory: string | null;
  personality: string | null;
  image_url: string | null;
  image_url_transparent: string | null;
}

function getSubcategoryIcon(subcategory: string | null | undefined): string {
  const safeSubcategory = subcategory || '';
  const icons: Record<string, string> = {
    'Brewery': '🍺',
    'Coffee': '☕',
    'Restaurant': '🍽️',
    'Film Locations': '🎬',
    'Scenic Drive': '🚗',
    'Haunted Location': '👻',
    'Hiking': '🥾',
    'Skiing': '⛷️',
    'Swimming': '🏊',
    'National Park': '🏞️',
    'Museum': '🏛️',
    'General': '📍'
  };
  return icons[safeSubcategory] || '📍';
}

// Helper function to check if a value has actual content (not just an empty array or empty string)
function hasContent(value: unknown): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

// Helper function to safely parse JSON string fields into arrays - ALWAYS returns an array
// NEVER accesses .length on potentially undefined values
function parseJsonArray<T = unknown>(value: string | null | T[] | undefined): T[] {
  try {
    // Handle all falsy values first
    if (value === null || value === undefined || value === '') return [];

    // Handle arrays
    if (Array.isArray(value)) {
      // Safe to filter - value is confirmed to be an array
      try {
        return value.filter(item => item !== null && item !== undefined && typeof item === 'object');
      } catch {
        return [];
      }
    }

    // Handle strings
    if (typeof value === 'string') {
      try {
        const trimmed = value.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '') return [];

        const parsed = JSON.parse(trimmed);
        // Check if parsed result is an array before accessing
        if (Array.isArray(parsed)) {
          try {
            return parsed.filter(item => item !== null && item !== undefined && typeof item === 'object');
          } catch {
            return [];
          }
        }
        return [];
      } catch {
        return [];
      }
    }

    // For any other type, return empty array
    return [];
  } catch {
    // Ultimate fallback
    return [];
  }
}

// Helper function that ALWAYS returns a safe array - no exceptions
function ensureArray<T>(value: T[] | null | undefined | unknown): T[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is T => item !== null && item !== undefined);
  }
  return [];
}

// Type guard for PhotoGalleryItem
function isPhotoGalleryItem(item: unknown): item is PhotoGalleryItem {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return typeof obj.url === 'string';
}

// Type guard for NearbyRecommendation
function isNearbyRecommendation(item: unknown): item is NearbyRecommendation {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return typeof obj.name === 'string';
}

// Type guard for VideoItem
function isVideoItem(item: unknown): item is VideoItem {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return typeof obj.url === 'string';
}

// Type guard for PodcastItem
function isPodcastItem(item: unknown): item is PodcastItem {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return typeof obj.title === 'string' || typeof obj.url === 'string';
}

function getCategoryLabel(category: string | null | undefined): { label: string; emoji: string } {
  const safeCategory = category || '';
  const labels: Record<string, { label: string; emoji: string }> = {
    '30min': { label: '30 minutes', emoji: '⚡' },
    '90min': { label: '90 minutes', emoji: '🚗' },
    '3h': { label: '3 hours', emoji: '🏔️' },
    '5h': { label: '5 hours', emoji: '🌄' },
    '8h': { label: '8 hours', emoji: '🗺️' },
    '12h': { label: '12+ hours', emoji: '🚙' }
  };
  return labels[safeCategory] || { label: safeCategory || 'Destination', emoji: '📍' };
}

function getGuardianImagePath(county: string): string {
  // Convert county name to match image filename format (e.g., "Salt Lake County" -> "SALT-LAKE")
  const countyName = county.replace(' County', '').toUpperCase().replace(/\s+/g, '-');
  return `/images/Guardians - Optimized/transparent/hero/${countyName}.webp`;
}

function getDanAvatar(category: string): string {
  // Rotate Dan's avatar based on travel time category
  const avatarMap: Record<string, string> = {
    '30min': '/images/Favicons-Optimized/pwa/favicon_2-192x192.png',    // Orange - Quick trips
    '90min': '/images/Favicons-Optimized/pwa/favicon_3-192x192.png',    // Black - Medium trips
    '3h': '/images/Favicons-Optimized/pwa/favicon_4-192x192.png',       // White - Long trips
    '5h': '/images/Favicons-Optimized/pwa/favicon_2-192x192.png',       // Orange
    '8h': '/images/Favicons-Optimized/pwa/favicon_3-192x192.png',       // Black
    '12h': '/images/Favicons-Optimized/pwa/favicon_4-192x192.png'       // White
  };
  return avatarMap[category] || '/images/Favicons-Optimized/pwa/favicon_2-192x192.png';
}

function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  // Extract YouTube video ID from various URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/, // Additional pattern for query params
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID (11 characters)
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Generate dynamic metadata for destination pages
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  try {
    // Wrap in try-catch to handle any async context issues with cookies()
    let supabase;
    try {
      supabase = createSupabaseServerClient();
    } catch (supabaseErr) {
      logError('Error creating Supabase client in generateMetadata:', supabaseErr);
      // Return default metadata if we can't create the client
      return {
        title: 'Destination | SLCTrips',
        description: 'Discover amazing destinations from Salt Lake City International Airport.',
      };
    }

    const { data: destination, error } = await supabase
      .from('public_destinations')
      .select('*')
      .eq('slug', params.slug)
      .maybeSingle();

    if (error) {
      logError('Supabase error in generateMetadata:', error);
      return {
        title: 'Destination | SLCTrips',
        description: 'Discover amazing destinations from Salt Lake City International Airport.',
      };
    }

    if (!destination) {
      return {
        title: 'Destination Not Found | SLCTrips',
        description: 'The destination you are looking for could not be found.',
      };
    }

    const categoryInfo = getCategoryLabel(destination.category || null);
    const subcategoryIcon = getSubcategoryIcon(destination.subcategory || null);

    // Generate title
    const safeName = destination.name || 'Destination';
    const title = `${safeName} - ${categoryInfo.label} from SLC | SLCTrips`;

    // Generate description
    const description = destination.description
      ? destination.description.substring(0, 160)
      : `Discover ${safeName} in ${destination.county || 'Utah'}, ${destination.state_code || 'UT'}. ${categoryInfo.label} drive from Salt Lake City International Airport. ${subcategoryIcon} ${destination.subcategory || 'destination'}.`;

    // Base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com';
    const url = `${baseUrl}/destinations/${params.slug}`;

    return {
      title,
      description,
      openGraph: {
        title: `${safeName} | SLCTrips`,
        description,
        images: destination.image_url ? [
          {
            url: destination.image_url,
            width: 1200,
            height: 630,
            alt: destination.name,
          }
        ] : [],
        type: 'website',
        locale: 'en_US',
        url,
        siteName: 'SLCTrips',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${destination.name} | SLCTrips`,
        description,
        images: destination.image_url ? [destination.image_url] : [],
        creator: '@SLCTrips',
      },
      alternates: {
        canonical: url,
      },
      keywords: [
        destination.name,
        destination.subcategory,
        destination.county,
        destination.region,
        destination.state_code,
        'Salt Lake City',
        'Utah travel',
        'road trip',
        categoryInfo.label,
      ].filter(Boolean),
    };
  } catch (error) {
    logError('Error generating metadata:', error);
    return {
      title: 'Destination | SLCTrips',
      description: 'Discover amazing destinations from Salt Lake City International Airport.',
    };
  }
}

export default async function DestinationDetail({ params, searchParams }: Params) {
  // Wrap everything in error handling to prevent 500 errors
  try {

    let d: Destination | null = null;
    let guardian: Guardian | null = null;
    let fetchError = false;

    // Create Supabase client for all queries
    const supabase = createSupabaseServerClient();

    // Fetch destination data with error handling
    try {
      const { data, error } = await supabase
        .from('public_destinations')
        .select('*')
        .eq('slug', params.slug)
        .maybeSingle();

      if (error) {
        logError('Supabase error fetching destination:', error);
        logError('Error details:', JSON.stringify(error, null, 2));
        logError('Slug:', params.slug);
        fetchError = true;
      } else {
        d = data as Destination | null;

        // CRITICAL: Sanitize immediately after fetching to prevent any React serialization errors
        // Create a completely new sanitized object - never use the original `d` after this point
        if (d) {
          const sanitizedDest = sanitizeDestination(d) as Destination;
          // Replace d with sanitized version immediately
          d = sanitizedDest;
        }
      }
    } catch (err) {
      logError('Exception fetching destination:', err);
      logError('Exception details:', err instanceof Error ? err.message : String(err));
      logError('Exception stack:', err instanceof Error ? err.stack : 'No stack trace');
      fetchError = true;
    }

    // Fetch Guardian for this county (non-critical, don't fail page if this errors)
    if (d?.county && !fetchError) {
      try {
        const { data: guardianData, error } = await supabase
          .from('guardians')
          .select('*')
          .eq('county', d.county)
          .maybeSingle();

        if (error) {
          logError('Supabase error fetching guardian:', error);
        } else {
          guardian = guardianData as Guardian | null;
        }
      } catch (err) {
        logError('Exception fetching guardian:', err);
      }
    }

    // Fetch related destinations in the same county (for "Explore {County}" section)
    let relatedDestinations: Destination[] = [];
    if (d?.county && !fetchError) {
      try {
        const { data: relatedData, error: relatedError } = await supabase
          .from('public_destinations')
          .select('*')
          .eq('county', d.county)
          .neq('id', d.id) // Exclude current destination
          .order('popularity_score', { ascending: false })
          .limit(12); // Limit to 12 items

        if (!relatedError && relatedData && Array.isArray(relatedData)) {
          // Filter valid destinations and sanitize each one to prevent React serialization errors
          // CRITICAL: Triple-check it's an array before mapping
          try {
            if (Array.isArray(relatedData) && relatedData.length > 0) {
              relatedDestinations = (relatedData as Destination[])
                .filter(dest => dest && dest.id && dest.slug)
                .map(dest => {
                  try {
                    return sanitizeDestination(dest) as Destination;
                  } catch (e) {
                    logError('[DESTINATION_PAGE] Error sanitizing related destination:', e);
                    return null;
                  }
                })
                .filter((d): d is Destination => d !== null);
            } else {
              relatedDestinations = [];
            }
          } catch (mapErr) {
            logError('[DESTINATION_PAGE] Error mapping related destinations:', mapErr);
            relatedDestinations = [];
          }
        } else {
          relatedDestinations = [];
        }
      } catch (err) {
        logError('Error fetching related destinations:', err);
      }
    }

    // Ensure relatedDestinations is always an array - FINAL CHECK
    if (!Array.isArray(relatedDestinations)) {
      relatedDestinations = [];
    } else {
      // Filter out any invalid entries to prevent rendering errors
      relatedDestinations = relatedDestinations.filter((dest): dest is Destination => {
        return dest !== null && dest !== undefined && typeof dest === 'object' && 'id' in dest && 'slug' in dest && typeof dest.id === 'string' && typeof dest.slug === 'string';
      });
    }

    // No additional normalization needed - sanitization happens once after fetch

    // Check if viewing from TK-000 (free educational context - no affiliate content)
    const isFromTK000 = searchParams.from === 'tk-000';

    // Show error page if fetch failed or destination not found
    if (fetchError || !d) {
      return (
        <>
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold mb-4 text-white">
                {fetchError ? 'Unable to Load Destination' : 'Destination Not Found'}
              </h1>
              <p className="text-gray-300 mb-8">
                {fetchError
                  ? 'We\'re having trouble connecting to our database. Please try again in a moment.'
                  : 'We couldn\'t find that destination.'}
              </p>
              <Link href="/destinations" className="text-blue-400 hover:text-blue-300 underline">
                ← Back to all destinations
              </Link>
            </div>
          </main>
          <Footer />
        </>
      );
    }

    // Ensure all critical fields exist before rendering
    if (!d || !d.id || !d.slug || !d.name) {
      return (
        <>
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold mb-4 text-white">Invalid Destination Data</h1>
              <p className="text-gray-300 mb-8">The destination data is incomplete or invalid.</p>
              <Link href="/destinations" className="text-blue-400 hover:text-blue-300 underline">
                ← Back to all destinations
              </Link>
            </div>
          </main>
          <Footer />
        </>
      );
    }

    // CRITICAL FINAL SAFETY CHECK: Re-sanitize one more time right before rendering to catch anything
    // This is a defensive measure in case React serialization happens before our initial sanitization
    // This MUST happen before ANY property access to prevent hydration errors
    if (d) {
      d = sanitizeDestination(d) as Destination;

      // CRITICAL: Ensure ALL array properties are definitely arrays before rendering
      // React will serialize these, and undefined arrays cause .length errors
      const arrayProps: (keyof Destination)[] = [
        'nearby_food', 'nearby_lodging', 'nearby_attractions',
        'ai_tips', 'hotel_recommendations', 'tour_recommendations'
      ];
      arrayProps.forEach(prop => {
        if (d && !Array.isArray(d[prop])) {
          (d as unknown as Record<string, unknown>)[prop] = [];
        }
        // CRITICAL: Also check if the property exists and is not undefined/null
        if (d && (d[prop] === undefined || d[prop] === null)) {
          (d as unknown as Record<string, unknown>)[prop] = [];
        }
      });

      // CRITICAL: Also check nested array properties in nearby places
      ['nearby_food', 'nearby_lodging', 'nearby_attractions'].forEach(prop => {
        if (d && Array.isArray(d[prop as keyof Destination])) {
          const arr = d[prop as keyof Destination] as NearbyRecommendation[] | undefined;
          // Ensure each item in the array has its nested arrays initialized
          if (Array.isArray(arr)) {
            arr.forEach((item: NearbyRecommendation) => {
              if (item && typeof item === 'object') {
                if (!Array.isArray(item.types)) {
                  item.types = [];
                }
                // Handle other nested properties if they exist (defensive for unknown data shapes)
                const itemRecord = item as unknown as Record<string, unknown>;
                ['photos', 'images', 'tags', 'categories', 'features'].forEach(nestedProp => {
                  if (itemRecord[nestedProp] === undefined || itemRecord[nestedProp] === null || !Array.isArray(itemRecord[nestedProp])) {
                    itemRecord[nestedProp] = [];
                  }
                });
              }
            });
          }
        }
      });
    } else {
      // If d is somehow undefined/null at this point, return error page
      return (
        <>
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold mb-4 text-white">Destination Not Found</h1>
              <p className="text-gray-300 mb-8">The destination data could not be loaded.</p>
              <Link href="/destinations" className="text-blue-400 hover:text-blue-300 underline">
                ← Back to all destinations
              </Link>
            </div>
          </main>
          <Footer />
        </>
      );
    }

    const categoryInfo = getCategoryLabel(d.category || '');
    const subcategoryIcon = getSubcategoryIcon(d.subcategory || '');
    const contactInfo = d.contact_info || {};
    // CRITICAL: Safely extract hours array - handle undefined, null, or non-array values
    // This must be bulletproof to prevent hydration errors
    const hours = (() => {
      try {
        if (!contactInfo || typeof contactInfo !== 'object') return [];
        if (!contactInfo.hours) return [];
        if (!Array.isArray(contactInfo.hours)) return [];
        if (Array.isArray(contactInfo.hours)) {
          return contactInfo.hours.filter((h: unknown): h is string => typeof h === 'string' && h.trim().length > 0);
        }
        return [];
      } catch {
        return [];
      }
    })();
    const phone = contactInfo?.phone;
    const website = contactInfo?.website;

    // Ensure categoryInfo exists and has required properties
    if (!categoryInfo || !categoryInfo.label) {
      return (
        <>
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold mb-4 text-white">Invalid Category Information</h1>
              <p className="text-gray-300 mb-8">Unable to determine destination category.</p>
              <Link href="/destinations" className="text-blue-400 hover:text-blue-300 underline">
                ← Back to all destinations
              </Link>
            </div>
          </main>
          <Footer />
        </>
      );
    }

    // Generate Schema.org structured data for SEO
    const touristAttractionSchema = generateTouristAttractionSchema({
      name: d.name,
      slug: d.slug,
      description: d.description || `${d.subcategory} in ${d.county}, ${d.state_code}`,
      image_url: d.image_url || '',
      latitude: d.latitude || 0,
      longitude: d.longitude || 0,
      county: d.county || '',
      region: d.region || '',
      state_code: d.state_code || '',
      category: d.category,
      subcategory: d.subcategory,
      contact_info: contactInfo,
    });

    // Add additional fields if available
    if (d.accessibility_rating) {
      touristAttractionSchema.accessibilityFeature = `Accessibility rating: ${d.accessibility_rating}/5`;
    }
    if (d.is_family_friendly) {
      touristAttractionSchema.isAccessibleForFree = true;
    }
    if (d.popularity_score) {
      touristAttractionSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Math.min(5, d.popularity_score / 20),
        bestRating: '5',
        worstRating: '1',
      };
    }

    // Generate breadcrumb schema
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: baseUrl },
      { name: 'Destinations', url: `${baseUrl}/destinations` },
      { name: d.name, url: `${baseUrl}/destinations/${d.slug}` },
    ]);

    return (
      <>
        {/* Schema.org Structured Data */}
        <SchemaMarkup schema={touristAttractionSchema} />
        <SchemaMarkup schema={breadcrumbSchema} />

        <Header />
        <main id="main-content" className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <section className="relative h-[60vh] overflow-hidden">
            {(() => {
              const heroSrc = normalizeImageSrc(d.image_url);
              if (!heroSrc) return null;
              return (
                <>
                  <Image
                    src={heroSrc}
                    alt={d.name}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                </>
              );
            })()}

            {/* Guardian Badge */}
            {guardian && guardian.county && (
              <Link
                href={`/guardians/${(guardian.county || '').toLowerCase().replace(/\s+/g, '-')}`}
                className="absolute top-6 left-6 group cursor-pointer"
                title={`${guardian.display_name} - Guardian of ${guardian.county}`}
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20">
                  <Image
                    src={getGuardianImagePath(d.county || '')}
                    alt={`${guardian.display_name} - Guardian of ${guardian.county}`}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    sizes="(max-width: 768px) 64px, 80px"
                  />
                </div>
              </Link>
            )}

            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 pb-12">
                <div className="flex flex-wrap gap-2 mb-4">
                  {d.featured && (
                    <span className="px-3 py-1 bg-yellow-500 text-gray-900 text-sm font-semibold rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                  {d.trending && (
                    <span className="px-3 py-1 bg-orange-600 text-white text-sm font-semibold rounded-full">
                      🔥 Trending
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                    {subcategoryIcon} {d.subcategory}
                  </span>
                  <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
                    {categoryInfo.emoji} {categoryInfo.label} from SLC
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">{d.name}</h1>
                <p className="text-xl text-gray-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {d.county} • {d.region} • {d.state_code}
                </p>
              </div>
            </div>
          </section>

          {/* Quick Info - Above Fold */}
          <section className="bg-white border-b border-gray-200 shadow-sm -mt-px">
            <div className="container mx-auto px-4 py-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Drive Time — never show "0h 0m" or "0 miles"; use "At SLC Airport" when 0 */}
                  <div>
                    <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Drive Time from SLC</div>
                    {(d.drive_minutes === 0 || d.distance_miles === 0) ? (
                      <div className="text-2xl font-bold text-blue-600">At SLC Airport</div>
                    ) : d.drive_minutes != null && d.drive_minutes > 0 ? (
                      <>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.floor(d.drive_minutes / 60)}h {d.drive_minutes % 60}m
                        </div>
                        {d.distance_miles != null && d.distance_miles > 0 && (
                          <div className="text-sm text-gray-600 mt-1">{Math.round(d.distance_miles)} miles</div>
                        )}
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-blue-600">
                        {categoryInfo.emoji} {categoryInfo.label}
                      </div>
                    )}
                  </div>

                  {/* Hours */}
                  {(() => {
                    try {
                      const safeHours = (() => {
                        if (!hours) return [];
                        if (!Array.isArray(hours)) return [];
                        return hours.filter((h): h is string => typeof h === 'string' && h.trim().length > 0);
                      })();

                      if (!safeHours || safeHours.length === 0) {
                        return null; // Hide Hours row when no data
                      }

                      const hoursToDisplay = safeHours.slice(0, 2); // Show first 2 hours lines
                      const validHours = hoursToDisplay.filter((h): h is string => typeof h === 'string' && h.trim().length > 0);

                      if (validHours.length === 0) return null;

                      return (
                        <div>
                          <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Hours</div>
                          <div className="text-sm space-y-0.5">
                            {validHours.map((hour: string, idx: number) => {
                              if (!hour || typeof hour !== 'string') return null;
                              return (
                                <div key={`hour-above-fold-${idx}`} className="text-gray-900 font-medium">{hour}</div>
                              );
                            })}
                            {safeHours.length > 2 && (
                              <div className="text-xs text-gray-500 mt-1">+{safeHours.length - 2} more days</div>
                            )}
                          </div>
                        </div>
                      );
                    } catch (err) {
                      console.error('[DESTINATION_PAGE] Error rendering hours in Quick Info:', err);
                      return null;
                    }
                  })()}

                  {/* Contact */}
                  {(phone || website) && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Contact</div>
                      <div className="space-y-1">
                        {phone && (
                          <div>
                            <a href={`tel:${phone}`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                              📞 {phone}
                            </a>
                          </div>
                        )}
                        {website && (
                          <div>
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm break-all"
                            >
                              🌐 Website →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Get Directions - Prominent CTA */}
                  <div className="flex items-end">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${d.latitude},${d.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      🗺️ Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Photo Gallery */}
                  {(() => {
                    try {
                      // Final normalization right before rendering - ensure it's always safe
                      let safePhotoGallery: PhotoGalleryItem[] = [];
                      if (d?.photo_gallery) {
                        const photoGallery = d.photo_gallery;
                        // Handle PhotoGallery type (has photos array)
                        if (photoGallery && typeof photoGallery === 'object' && 'photos' in photoGallery) {
                          const gallery = photoGallery as PhotoGallery;
                          if (Array.isArray(gallery.photos)) {
                            safePhotoGallery = gallery.photos.filter(isPhotoGalleryItem);
                          }
                        }
                        // Handle array of PhotoGalleryItem directly
                        else if (Array.isArray(photoGallery)) {
                          try {
                            safePhotoGallery = photoGallery
                              .map((item: unknown) => {
                                try {
                                  if (!item) return null;
                                  // If item is a JSON string, parse it
                                  if (typeof item === 'string') {
                                    try {
                                      const parsed = JSON.parse(item);
                                      if (typeof parsed === 'object' && parsed !== null) {
                                        return parsed;
                                      }
                                      return { url: item, alt: '', source: 'unknown' };
                                    } catch {
                                      return { url: item, alt: '', source: 'unknown' };
                                    }
                                  }
                                  // If already an object, ensure it has required properties
                                  if (typeof item === 'object') {
                                    return item;
                                  }
                                  return null;
                                } catch {
                                  return null;
                                }
                              })
                              .filter(isPhotoGalleryItem);
                          } catch (mapErr) {
                            logError('[DESTINATION_PAGE] Error mapping photo gallery:', mapErr);
                            safePhotoGallery = [];
                          }
                        } else {
                          safePhotoGallery = [];
                        }
                      }

                      // CRITICAL: Final validation - ensure safePhotoGallery is absolutely safe before passing to component
                      if (safePhotoGallery && Array.isArray(safePhotoGallery) && safePhotoGallery.length > 0) {
                        // Double-check each photo is valid using type guard
                        const validPhotos = safePhotoGallery.filter(isPhotoGalleryItem);

                        if (validPhotos && Array.isArray(validPhotos) && validPhotos.length > 0) {
                          return (
                            <PhotoCarousel
                              photos={validPhotos}
                              destinationName={d.name || 'Destination'}
                            />
                          );
                        }
                      }
                      return null;
                    } catch (err) {
                      logError('[DESTINATION_PAGE] Error rendering photo gallery:', err);
                      return null;
                    }
                  })()}

                  {/* Media Section - Videos & Podcasts */}
                  {(() => {
                    // Parse videos from video_url (single or multiple)
                    const videos: VideoItem[] = [];

                    // First, try to parse video_urls if it exists (might be JSON string or array)
                    let videoUrlsArray: unknown[] = [];
                    if (d?.video_urls) {
                      if (Array.isArray(d.video_urls)) {
                        videoUrlsArray = d.video_urls;
                      } else if (typeof d.video_urls === 'string') {
                        try {
                          const parsed = JSON.parse(d.video_urls);
                          videoUrlsArray = Array.isArray(parsed) ? parsed : [];
                        } catch {
                          videoUrlsArray = [];
                        }
                      }
                    }

                    // Handle video_urls array first (takes priority)
                    if (videoUrlsArray && Array.isArray(videoUrlsArray) && videoUrlsArray.length > 0) {
                      videoUrlsArray.forEach((video: unknown) => {
                        if (!video) return;
                        if (typeof video === 'string') {
                          videos.push({ url: video });
                        } else if (isVideoItem(video)) {
                          videos.push(video);
                        }
                      });
                    }
                    // Handle single video_url string (if no video_urls)
                    else if (d?.video_url && typeof d.video_url === 'string') {
                      // Try parsing as JSON array first
                      try {
                        const parsed = JSON.parse(d.video_url) as unknown;
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          parsed.forEach((video: unknown) => {
                            if (!video) return;
                            if (typeof video === 'string') {
                              videos.push({ url: video });
                            } else if (isVideoItem(video)) {
                              videos.push(video);
                            }
                          });
                        } else {
                          // Single video URL
                          videos.push({ url: d.video_url });
                        }
                      } catch {
                        // If parsing fails, treat as single URL
                        videos.push({ url: d.video_url });
                      }
                    }

                    // Parse podcasts
                    const podcasts: PodcastItem[] = [];

                    // Handle podcast_url or podcast_urls
                    if (d?.podcast_url) {
                      let podcastArray: unknown[] = [];

                      // Check if it's already an array
                      if (Array.isArray(d.podcast_url)) {
                        podcastArray = d.podcast_url;
                      }
                      // Check if it's a JSON string
                      else if (typeof d.podcast_url === 'string') {
                        try {
                          const parsed = JSON.parse(d.podcast_url) as unknown;
                          podcastArray = Array.isArray(parsed) ? parsed : [parsed];
                        } catch {
                          // If parsing fails, treat as single URL string
                          podcastArray = [d.podcast_url];
                        }
                      }

                      // Process the podcast array
                      if (podcastArray && Array.isArray(podcastArray) && podcastArray.length > 0) {
                        podcastArray.forEach((podcast: unknown) => {
                          if (!podcast) return;
                          if (typeof podcast === 'string') {
                            podcasts.push({ url: podcast, title: `${d.name} Podcast` });
                          } else if (isPodcastItem(podcast)) {
                            podcasts.push(podcast);
                          }
                        });
                      }
                    }

                    // Only render if we have videos or podcasts
                    // Ensure arrays are always arrays before passing to component
                    const safeVideos = videos.filter((v): v is VideoItem => v !== null && v !== undefined && typeof v === 'object' && 'url' in v);
                    const safePodcasts = podcasts.filter((p): p is PodcastItem => p !== null && p !== undefined && (p.url !== undefined || p.title !== undefined));

                    // CRITICAL: Final validation before passing to component
                    if ((safeVideos && Array.isArray(safeVideos) && safeVideos.length > 0) ||
                      (safePodcasts && Array.isArray(safePodcasts) && safePodcasts.length > 0)) {
                      return (
                        <DestinationMediaSection
                          videos={safeVideos && Array.isArray(safeVideos) ? safeVideos : []}
                          podcasts={safePodcasts && Array.isArray(safePodcasts) ? safePodcasts : []}
                          destinationName={d.name || 'Destination'}
                        />
                      );
                    }
                    return null;
                  })()}

                  {/* Guardian Introduction - Active Narration */}
                  {guardian && (
                    <GuardianIntroduction
                      guardian={guardian}
                      destination={{
                        name: d.name,
                        subcategory: d.subcategory,
                        description: d.description
                      }}
                      guardianImagePath={getGuardianImagePath(d.county || '')}
                    />
                  )}

                  {/* Dan's Tips */}
                  {d.ai_tips && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-md">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                          <Image
                            src={getDanAvatar(d.category)}
                            alt="Dan - Your Road Warrior Guide"
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900">💡 Tips from Dan</h2>
                          <p className="text-sm text-yellow-700 font-semibold">Your Road Warrior Guide</p>
                        </div>
                      </div>
                      {(() => {
                        // Parse ai_tips if it's a JSON string - defensive handling
                        if (!d?.ai_tips) return null;

                        let tips: string[] = [];
                        try {
                          if (typeof d.ai_tips === 'string') {
                            const parsed = JSON.parse(d.ai_tips);
                            tips = Array.isArray(parsed) ? parsed : [parsed];
                          } else if (Array.isArray(d.ai_tips)) {
                            tips = d.ai_tips;
                          } else {
                            tips = [String(d.ai_tips)];
                          }
                        } catch {
                          // If parsing fails, treat as a single tip or empty array
                          if (Array.isArray(d.ai_tips)) {
                            tips = d.ai_tips;
                          } else if (d.ai_tips) {
                            tips = [String(d.ai_tips)];
                          }
                        }

                        // Final safety check - ensure tips is always a valid array
                        const safeTips = (() => {
                          if (!Array.isArray(tips)) return [];
                          if (!tips) return [];
                          return tips.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);
                        })();

                        if (safeTips.length === 0) {
                          return <p className="text-gray-700 leading-relaxed">{String(d.ai_tips)}</p>;
                        }

                        // CRITICAL: Final check before mapping - ensure safeTips is definitely an array
                        // This prevents hydration errors where React might see undefined during reconciliation
                        if (!safeTips || !Array.isArray(safeTips)) {
                          return <p className="text-gray-700 leading-relaxed">{String(d.ai_tips || '')}</p>;
                        }

                        // Store length in constant to prevent hydration issues
                        const tipsCount = safeTips.length;
                        if (tipsCount === 0) {
                          return <p className="text-gray-700 leading-relaxed">{String(d.ai_tips || '')}</p>;
                        }

                        // CRITICAL: Final safety check - ensure safeTips is a valid array with valid items
                        // Filter out any undefined/null items before mapping to prevent errors
                        const validTips = safeTips.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);

                        if (validTips.length === 0) {
                          return <p className="text-gray-700 leading-relaxed">{String(d.ai_tips || '')}</p>;
                        }

                        return (
                          <ul className="space-y-2">
                            {validTips.map((tip: string, index: number) => {
                              // Double-check tip is valid (defensive)
                              if (!tip || typeof tip !== 'string') return null;
                              return (
                                <li key={`tip-${index}`} className="flex items-start gap-2 text-gray-700">
                                  <span className="text-yellow-600 font-bold mt-0.5">•</span>
                                  <span className="flex-1">{tip}</span>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      })()}
                    </div>
                  )}

                  {/* WhatDanPacks - Context-aware recommendations (not shown for TK-000 free educational content) */}
                  {!isFromTK000 && (
                    <WhatDanPacks destination={{
                      name: d.name || '',
                      category: d.category || '',
                      subcategory: d.subcategory || '',
                      latitude: d.latitude || 0,
                      longitude: d.longitude || 0,
                      is_family_friendly: d.is_family_friendly || false,
                      activities: d.activities || ''
                    }} />
                  )}

                  {/* Viator Tours & Activities (not shown for TK-000 free educational content) */}
                  {!isFromTK000 && (
                    <ViatorTours destination={{
                      name: d.name || '',
                      category: d.category || '',
                      subcategory: d.subcategory || '',
                      latitude: d.latitude || 0,
                      longitude: d.longitude || 0,
                      state: d.state_code || ''
                    }} />
                  )}

                  {/* Booking.com Accommodations (not shown for TK-000 free educational content) */}
                  {!isFromTK000 && (
                    <BookingAccommodations destination={{
                      name: d.name || '',
                      category: d.category || '',
                      subcategory: d.subcategory || '',
                      latitude: d.latitude || 0,
                      longitude: d.longitude || 0,
                      state: d.state_code || '',
                      city: d.city || '',
                      county: d.county || '',
                      hotel_recommendations: Array.isArray(d.hotel_recommendations) ? d.hotel_recommendations : undefined
                    }} />
                  )}

                  {/* Booking.com Flights (not shown for TK-000 free educational content) */}
                  {!isFromTK000 && (
                    <BookingFlights destination={{
                      name: d.name || '',
                      city: d.city ?? undefined,
                      state: d.state_code || ''
                    }} />
                  )}

                  {/* Booking.com Car Rentals (not shown for TK-000 free educational content) */}
                  {!isFromTK000 && (
                    <BookingCarRentals destination={{
                      name: d.name || '',
                      category: d.category || '',
                      subcategory: d.subcategory || '',
                      city: d.city ?? undefined,
                      state: d.state_code || ''
                    }} />
                  )}

                  {/* Seasonal Strategy Cards */}
                  {(d.is_season_spring || d.is_season_summer || d.is_season_fall || d.is_season_winter) && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900">📅 Best Time to Visit</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-lg border-2 text-center transition-all ${d.is_season_spring ? 'bg-green-50 border-green-300 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                          <div className="text-3xl mb-2">🌸</div>
                          <div className="font-semibold text-gray-900">Spring</div>
                          <div className="text-xs text-gray-600 mt-1">Mar - May</div>
                          {d.is_season_spring && <div className="text-green-600 text-sm mt-2 font-semibold">✓ Great time</div>}
                        </div>
                        <div className={`p-4 rounded-lg border-2 text-center transition-all ${d.is_season_summer ? 'bg-yellow-50 border-yellow-300 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                          <div className="text-3xl mb-2">☀️</div>
                          <div className="font-semibold text-gray-900">Summer</div>
                          <div className="text-xs text-gray-600 mt-1">Jun - Aug</div>
                          {d.is_season_summer && <div className="text-yellow-600 text-sm mt-2 font-semibold">✓ Great time</div>}
                        </div>
                        <div className={`p-4 rounded-lg border-2 text-center transition-all ${d.is_season_fall ? 'bg-orange-50 border-orange-300 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                          <div className="text-3xl mb-2">🍂</div>
                          <div className="font-semibold text-gray-900">Fall</div>
                          <div className="text-xs text-gray-600 mt-1">Sep - Nov</div>
                          {d.is_season_fall && <div className="text-orange-600 text-sm mt-2 font-semibold">✓ Great time</div>}
                        </div>
                        <div className={`p-4 rounded-lg border-2 text-center transition-all ${d.is_season_winter ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-40'}`}>
                          <div className="text-3xl mb-2">❄️</div>
                          <div className="font-semibold text-gray-900">Winter</div>
                          <div className="text-xs text-gray-600 mt-1">Dec - Feb</div>
                          {d.is_season_winter && <div className="text-blue-600 text-sm mt-2 font-semibold">✓ Great time</div>}
                        </div>
                      </div>
                      {d.is_season_all && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg text-center">
                          <span className="font-semibold text-gray-900">🌟 Year-Round Destination</span>
                          <span className="text-gray-700 text-sm ml-2">- Great to visit any time!</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nearby Recommendations */}
                  {(() => {
                    try {
                        // Parse JSON string fields into arrays - ensure they're always arrays
                      let nearbyFood: NearbyRecommendation[] = [];
                      let nearbyLodging: NearbyRecommendation[] = [];
                      let nearbyAttractions: NearbyRecommendation[] = [];

                      try {
                        const parsedFood = parseJsonArray<NearbyRecommendation>(d?.nearby_food);
                        nearbyFood = Array.isArray(parsedFood) ? parsedFood.filter(isNearbyRecommendation) : [];
                      } catch (err) {
                        logError('[DESTINATION_PAGE] Error parsing nearby_food:', err);
                        nearbyFood = [];
                      }

                      try {
                        const parsedLodging = parseJsonArray<NearbyRecommendation>(d?.nearby_lodging);
                        nearbyLodging = Array.isArray(parsedLodging) ? parsedLodging.filter(isNearbyRecommendation) : [];
                      } catch (err) {
                        logError('[DESTINATION_PAGE] Error parsing nearby_lodging:', err);
                        nearbyLodging = [];
                      }

                      try {
                        const parsedAttractions = parseJsonArray<NearbyRecommendation>(d?.nearby_attractions);
                        nearbyAttractions = Array.isArray(parsedAttractions) ? parsedAttractions.filter(isNearbyRecommendation) : [];
                      } catch (err) {
                        logError('[DESTINATION_PAGE] Error parsing nearby_attractions:', err);
                        nearbyAttractions = [];
                      }

                      // CRITICAL: Sanitize each place item to ensure ALL nested array properties are initialized
                      // This prevents React hydration from accessing .length on undefined
                      const sanitizePlaceItem = (item: unknown): NearbyRecommendation | null => {
                        try {
                          if (!isNearbyRecommendation(item)) return null;
                          const safeItem: NearbyRecommendation = { ...item };
                          // Ensure ALL potential array properties are initialized as arrays
                          const arrayProps: (keyof NearbyRecommendation)[] = ['types'];
                          arrayProps.forEach(prop => {
                            if (safeItem[prop] === undefined || safeItem[prop] === null) {
                              (safeItem as unknown as Record<string, unknown>)[prop] = [];
                            } else if (!Array.isArray(safeItem[prop])) {
                              (safeItem as unknown as Record<string, unknown>)[prop] = [];
                            }
                          });
                          // Ensure required properties exist
                          if (!safeItem.name || typeof safeItem.name !== 'string') {
                            safeItem.name = 'Unknown';
                          }
                          return safeItem;
                        } catch {
                          return null;
                        }
                      };

                      // Ensure all are arrays and sanitize each item before rendering
                      // CRITICAL: Triple-check each is an array before mapping - prevent undefined.map() errors
                      const safeNearbyFood: NearbyRecommendation[] = (() => {
                        try {
                          const food = nearbyFood;
                          if (!food || food === undefined || food === null || !Array.isArray(food)) {
                            return [];
                          }
                          return food
                            .map((item: unknown) => sanitizePlaceItem(item))
                            .filter((item): item is NearbyRecommendation => item !== null);
                        } catch (err) {
                          logError('[DESTINATION_PAGE] Error processing nearbyFood:', err);
                          return [];
                        }
                      })();
                      const safeNearbyLodging: NearbyRecommendation[] = (() => {
                        try {
                          const lodging = nearbyLodging;
                          if (!lodging || lodging === undefined || lodging === null || !Array.isArray(lodging)) {
                            return [];
                          }
                          return lodging
                            .map((item: unknown) => sanitizePlaceItem(item))
                            .filter((item): item is NearbyRecommendation => item !== null);
                        } catch (err) {
                          logError('[DESTINATION_PAGE] Error processing nearbyLodging:', err);
                          return [];
                        }
                      })();
                      const safeNearbyAttractions: NearbyRecommendation[] = (() => {
                        try {
                          const attractions = nearbyAttractions;
                          if (!attractions || attractions === undefined || attractions === null || !Array.isArray(attractions)) {
                            return [];
                          }
                          return attractions
                            .map((item: unknown) => sanitizePlaceItem(item))
                            .filter((item): item is NearbyRecommendation => item !== null);
                        } catch (err) {
                          logError('[DESTINATION_PAGE] Error processing nearbyAttractions:', err);
                          return [];
                        }
                      })();

                      // Only render if at least one has content - ensure arrays exist before checking length
                      const hasFood = Array.isArray(safeNearbyFood) && safeNearbyFood.length > 0;
                      const hasLodging = Array.isArray(safeNearbyLodging) && safeNearbyLodging.length > 0;
                      const hasAttractions = Array.isArray(safeNearbyAttractions) && safeNearbyAttractions.length > 0;

                      if (!hasFood && !hasLodging && !hasAttractions) {
                        return null;
                      }

                      return (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                          <h2 className="text-2xl font-bold mb-4 text-gray-900">📍 Nearby</h2>
                          {safeNearbyFood && Array.isArray(safeNearbyFood) && safeNearbyFood.length > 0 && (
                            <div className="mb-6">
                              <h3 className="font-semibold text-gray-900 mb-3">🍽️ Food & Dining</h3>
                              <div className="space-y-3">
                                {(() => {
                                  try {
                                    const foodArray = Array.isArray(safeNearbyFood) ? safeNearbyFood : [];
                                    if (!foodArray || foodArray.length === 0) return null;
                                    const validFood = foodArray
                                      .filter(isNearbyRecommendation)
                                      .slice(0, 5);
                                    // CRITICAL: Double-check array before accessing length or mapping
                                    if (!validFood || !Array.isArray(validFood) || validFood.length === 0) return null;
                                    return validFood.map((place: NearbyRecommendation, idx: number) => {
                                      if (!place) return null;
                                      return (
                                        <a
                                          key={idx}
                                          href={`https://www.google.com/search?q=${encodeURIComponent((place?.name || '') + ' ' + (place?.address || d?.county + ' Utah' || ''))}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-sm transition-all group"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate group-hover:text-blue-700">{place?.name || 'Unknown'}</div>
                                            {place?.address && <div className="text-sm text-gray-600 truncate">{place.address}</div>}
                                            {place?.rating && (
                                              <div className="text-sm text-yellow-600 mt-1">
                                                ⭐ {place.rating} {place?.user_ratings_total ? `(${place.user_ratings_total} reviews)` : ''}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-gray-600 group-hover:text-blue-500">↗</div>
                                        </a>
                                      );
                                    });
                                  } catch (err) {
                                    logError('[DESTINATION_PAGE] Error rendering nearby food:', err);
                                    return null;
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                          {safeNearbyLodging && Array.isArray(safeNearbyLodging) && safeNearbyLodging.length > 0 && (
                            <div className="mb-6">
                              <h3 className="font-semibold text-gray-900 mb-3">🏨 Lodging</h3>
                              <div className="space-y-3">
                                {(() => {
                                  try {
                                    const lodgingArray = Array.isArray(safeNearbyLodging) ? safeNearbyLodging : [];
                                    if (!lodgingArray || lodgingArray.length === 0) return null;
                                    const validLodging = lodgingArray
                                      .filter(isNearbyRecommendation)
                                      .slice(0, 5);
                                    // CRITICAL: Double-check array before accessing length or mapping
                                    if (!validLodging || !Array.isArray(validLodging) || validLodging.length === 0) return null;
                                    return validLodging.map((place: NearbyRecommendation, idx: number) => {
                                      if (!place) return null;
                                      return (
                                        <a
                                          key={idx}
                                          href={`https://www.google.com/search?q=${encodeURIComponent((place?.name || '') + ' ' + (place?.address || d?.county + ' Utah' || ''))}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-sm transition-all group"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate group-hover:text-blue-700">{place?.name || 'Unknown'}</div>
                                            {place?.address && <div className="text-sm text-gray-600 truncate">{place.address}</div>}
                                            {place?.rating && (
                                              <div className="text-sm text-yellow-600 mt-1">
                                                ⭐ {place.rating} {place?.user_ratings_total ? `(${place.user_ratings_total} reviews)` : ''}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-gray-600 group-hover:text-blue-500">↗</div>
                                        </a>
                                      );
                                    });
                                  } catch (err) {
                                    logError('[DESTINATION_PAGE] Error rendering nearby lodging:', err);
                                    return null;
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                          {safeNearbyAttractions && Array.isArray(safeNearbyAttractions) && safeNearbyAttractions.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-3">🎯 Nearby Attractions</h3>
                              <div className="space-y-3">
                                {(() => {
                                  try {
                                    const attractionsArray = Array.isArray(safeNearbyAttractions) ? safeNearbyAttractions : [];
                                    if (!attractionsArray || attractionsArray.length === 0) return null;
                                    const validAttractions = attractionsArray
                                      .filter(isNearbyRecommendation)
                                      .slice(0, 5);
                                    // CRITICAL: Double-check array before accessing length or mapping
                                    if (!validAttractions || !Array.isArray(validAttractions) || validAttractions.length === 0) return null;
                                    return validAttractions.map((place: NearbyRecommendation, idx: number) => {
                                      if (!place) return null;
                                      return (
                                        <a
                                          key={idx}
                                          href={`https://www.google.com/search?q=${encodeURIComponent((place?.name || '') + ' ' + (place?.address || d?.county + ' Utah' || ''))}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-sm transition-all group"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 truncate group-hover:text-blue-700">{place?.name || 'Unknown'}</div>
                                            {place?.address && <div className="text-sm text-gray-600 truncate">{place.address}</div>}
                                            {place?.rating && (
                                              <div className="text-sm text-yellow-600 mt-1">
                                                ⭐ {place.rating} {place?.user_ratings_total ? `(${place.user_ratings_total} reviews)` : ''}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-gray-600 group-hover:text-blue-500">↗</div>
                                        </a>
                                      );
                                    });
                                  } catch (err) {
                                    logError('[DESTINATION_PAGE] Error rendering nearby attractions:', err);
                                    return null;
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } catch (err) {
                      logError('Error rendering nearby recommendations:', err);
                      return null;
                    }
                  })()}

                  {/* Activities */}
                  {hasContent(d?.activities) && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900">🎯 Activities</h2>
                      <p className="text-gray-700 leading-relaxed">{d?.activities || ''}</p>
                    </div>
                  )}

                  {/* Explore {County} Section - Related Destinations */}
                  {/* TEMPORARILY DISABLED - Fixing length error */}
                  {null}
                  {false && (() => {
                    try {

                      // CRITICAL: Ensure we always have a valid array, even if relatedDestinations is undefined
                      // This prevents hydration mismatches
                      let safeRelatedDestinations: any[] = [];

                      try {
                        if (relatedDestinations && Array.isArray(relatedDestinations) && relatedDestinations.length > 0) {
                          safeRelatedDestinations = relatedDestinations
                            .filter((dest: any) => {
                              try {
                                const isValid = dest && dest !== null && dest !== undefined && dest.id && dest.slug;
                                return isValid;
                              } catch (err) {
                                logError('[DESTINATION_PAGE] Error filtering destination:', err);
                                return false;
                              }
                            })
                            .slice(0, 12); // Limit to 12 items
                        }
                      } catch (err) {
                        logError('[DESTINATION_PAGE] Error processing related destinations:', err);
                        safeRelatedDestinations = []; // Ensure it's always an array
                      }

                      // Final guarantee: ensure safeRelatedDestinations is always a valid array
                      if (!Array.isArray(safeRelatedDestinations)) {
                        logError('[DESTINATION_PAGE] safeRelatedDestinations is not an array after processing, forcing to empty array');
                        safeRelatedDestinations = [];
                      }

                      // Final guarantee: ensure safeRelatedDestinations is always a valid array
                      if (!Array.isArray(safeRelatedDestinations)) {
                        console.error('[DESTINATION_PAGE] safeRelatedDestinations is not an array after all processing');
                        return null;
                      }

                      // Store length in constant before any further operations
                      const safeRelatedCount = safeRelatedDestinations.length; // Safe to access length now

                      if (safeRelatedCount === 0) {
                        return null;
                      }

                      return (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                          <h2 className="text-2xl font-bold mb-6 text-gray-900">
                            Explore {d!.county}
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(() => {
                              try {
                                // CRITICAL: Ensure safeRelatedDestinations is a valid array before any operations
                                // This prevents hydration mismatches between server and client
                                if (!safeRelatedDestinations || !Array.isArray(safeRelatedDestinations)) {
                                  return null;
                                }

                                // Final safety check - ensure array exists before mapping
                                // Use a local constant to avoid closure issues during hydration
                                // CRITICAL: Ensure safeRelatedDestinations is an array before calling methods
                                if (!Array.isArray(safeRelatedDestinations)) {
                                  console.error('[DESTINATION_PAGE] safeRelatedDestinations is not an array before filter/slice');
                                  return null;
                                }

                                let finalSafeDestinations: any[] = [];
                                try {
                                  // CRITICAL: Store in local variable and triple-check before calling methods
                                  const destinations = safeRelatedDestinations;
                                  if (!destinations || destinations === undefined || destinations === null || !Array.isArray(destinations)) {
                                    console.error('[DESTINATION_PAGE] safeRelatedDestinations is not a valid array before filter');
                                    finalSafeDestinations = [];
                                  } else {
                                    finalSafeDestinations = destinations
                                      .filter((d: any) => {
                                        try {
                                          const isValid = d && d !== null && d !== undefined && d.id && d.slug;
                                          return isValid;
                                        } catch {
                                          return false;
                                        }
                                      })
                                      .slice(0, 12); // Limit to 12 items

                                    // Ensure filter().slice() returned a valid array
                                    if (!finalSafeDestinations || !Array.isArray(finalSafeDestinations)) {
                                      console.error('[DESTINATION_PAGE] finalSafeDestinations is not an array after filter/slice operation');
                                      finalSafeDestinations = [];
                                    }
                                  }
                                } catch (filterErr) {
                                  console.error('[DESTINATION_PAGE] Error during filter/slice operation:', filterErr);
                                  finalSafeDestinations = [];
                                }

                                // Store length in a constant IMMEDIATELY to prevent any undefined access
                                if (!Array.isArray(finalSafeDestinations)) {
                                  console.error('[DESTINATION_PAGE] finalSafeDestinations is still not an array after error handling');
                                  return null;
                                }

                                const destinationsCount = finalSafeDestinations.length;

                                if (destinationsCount === 0) {
                                  return null;
                                }

                                // CRITICAL: Create the array of React elements with extra safety
                                // Store the array reference in a variable before returning to ensure it's stable
                                // First, sanitize all destination objects to ensure no undefined array properties
                                // This prevents React from accessing .length on undefined during serialization

                                // FINAL CHECK: Ensure finalSafeDestinations is definitely an array before mapping
                                if (!finalSafeDestinations || !Array.isArray(finalSafeDestinations) || finalSafeDestinations.length === 0) {
                                  console.error('[DESTINATION_PAGE] finalSafeDestinations is invalid before sanitization map');
                                  return null;
                                }

                                // Use our comprehensive sanitizeDestination function to ensure ALL array properties are safe
                                // This is critical to prevent React from encountering undefined arrays during serialization
                                // CRITICAL: Double-check array exists and is valid before mapping
                                if (!finalSafeDestinations || !Array.isArray(finalSafeDestinations)) {
                                  console.error('[DESTINATION_PAGE] finalSafeDestinations is not a valid array before sanitization');
                                  return null;
                                }
                                const sanitizedDestinations = (() => {
                                  try {
                                    // CRITICAL: Sanitize each destination TWICE to ensure all nested properties are safe
                                    // First pass: basic sanitization
                                    const firstPass = finalSafeDestinations.map((dest: any, idx: number) => {
                                      try {
                                        if (!dest || typeof dest !== 'object') {
                                          return null;
                                        }
                                        const sanitized = sanitizeDestination(dest);
                                        // CRITICAL: Ensure ALL array properties are arrays after sanitization
                                        const arrayProps = ['photo_gallery', 'nearby_food', 'nearby_lodging', 'nearby_attractions', 'ai_tips', 'video_urls', 'podcast_urls', 'hotel_recommendations', 'tour_recommendations'];
                                        arrayProps.forEach(prop => {
                                          if (sanitized[prop] !== undefined && sanitized[prop] !== null && !Array.isArray(sanitized[prop])) {
                                            console.warn(`[DESTINATION_PAGE] Property ${prop} is not an array after sanitization, fixing`);
                                            sanitized[prop] = [];
                                          }
                                        });
                                        return sanitized;
                                      } catch (sanitizeErr) {
                                        console.error(`[DESTINATION_PAGE] Error sanitizing destination ${idx} (first pass):`, sanitizeErr);
                                        return null;
                                      }
                                    }).filter((d: any) => d !== null && d !== undefined);

                                    // Second pass: re-sanitize to catch any nested properties that might have been missed
                                    return firstPass.map((dest: any, idx: number) => {
                                      try {
                                        if (!dest || typeof dest !== 'object') {
                                          return null;
                                        }
                                        // Re-sanitize to ensure ALL nested array properties are initialized
                                        const reSanitized = sanitizeDestination(dest);
                                        // DOUBLE-CHECK: Ensure ALL array properties are arrays
                                        const arrayProps = ['photo_gallery', 'nearby_food', 'nearby_lodging', 'nearby_attractions', 'ai_tips', 'video_urls', 'podcast_urls', 'hotel_recommendations', 'tour_recommendations'];
                                        arrayProps.forEach(prop => {
                                          if (reSanitized[prop] === undefined || reSanitized[prop] === null || !Array.isArray(reSanitized[prop])) {
                                            console.warn(`[DESTINATION_PAGE] Property ${prop} still not an array after second sanitization, forcing to array`);
                                            reSanitized[prop] = [];
                                          }
                                        });
                                        return reSanitized;
                                      } catch (sanitizeErr) {
                                        console.error(`[DESTINATION_PAGE] Error sanitizing destination ${idx} (second pass):`, sanitizeErr);
                                        return null;
                                      }
                                    }).filter((d: any) => d !== null && d !== undefined);
                                  } catch (mapErr) {
                                    console.error('[DESTINATION_PAGE] Error in sanitizedDestinations map:', mapErr);
                                    console.error('[DESTINATION_PAGE] Map error stack:', mapErr instanceof Error ? (mapErr as Error).stack : 'No stack');
                                    return [];
                                  }
                                })();

                                // CRITICAL: Ensure sanitizedDestinations is always an array before using it
                                if (!sanitizedDestinations || !Array.isArray(sanitizedDestinations)) {
                                  console.error('[DESTINATION_PAGE] sanitizedDestinations is not an array after map operation');
                                  return null;
                                }

                                // Update count to use sanitized destinations
                                const sanitizedCount = sanitizedDestinations.length;
                                if (sanitizedCount === 0) {
                                  return null;
                                }

                                // CRITICAL: Final check before mapping destination cards
                                if (!sanitizedDestinations || !Array.isArray(sanitizedDestinations)) {
                                  console.error('[DESTINATION_PAGE] sanitizedDestinations is not a valid array before creating cards');
                                  return null;
                                }
                                if (sanitizedCount === 0) {
                                  return null;
                                }

                                const destinationCards = (() => {
                                  try {
                                    // Store reference to ensure it's stable
                                    const dests = sanitizedDestinations;
                                    if (!dests || !Array.isArray(dests) || dests.length === 0) {
                                      console.error('[DESTINATION_PAGE] Invalid dests array in destinationCards');
                                      return [];
                                    }

                                    return dests.map((dest: any, index: number) => {
                                      try {
                                        // Validate dest exists and has required properties
                                        if (!dest || dest === null || dest === undefined || typeof dest !== 'object') {
                                          return null;
                                        }

                                        // Extract properties directly - avoid sanitizeDestination call to prevent any serialization issues
                                        const id = dest.id;
                                        const slug = dest.slug;
                                        if (!id || !slug) {
                                          return null;
                                        }

                                        // CRITICAL: Create a completely fresh object with ONLY primitive values
                                        // Use JSON serialization trick to ensure no hidden properties or references remain
                                        // This prevents React from trying to serialize undefined array properties during hydration
                                        const minimalSafeDest: Destination = JSON.parse(JSON.stringify({
                                          id: String(id),
                                          slug: String(slug),
                                          name: String(dest.name || ''),
                                          place_id: String(dest.place_id || ''),
                                          image_url: String(dest.image_url || dest.photo_url || ''),
                                          photo_url: String(dest.photo_url || ''),
                                          subcategory: String(dest.subcategory || ''),
                                          category: String(dest.category || ''),
                                          drive_minutes: typeof dest.drive_minutes === 'number' ? dest.drive_minutes : null,
                                          distance_miles: typeof dest.distance_miles === 'number' ? dest.distance_miles : null,
                                          featured: Boolean(dest.featured),
                                          trending: Boolean(dest.trending),
                                          is_family_friendly: Boolean(dest.is_family_friendly) || false,
                                          pet_allowed: Boolean(dest.pet_allowed) || false,
                                          is_parking_free: Boolean(dest.is_parking_free) || false,
                                          has_restrooms: Boolean(dest.has_restrooms) || false,
                                          has_visitor_center: Boolean(dest.has_visitor_center) || false,
                                          has_playground: Boolean(dest.has_playground) || false,
                                          // Seasonal availability
                                          is_season_spring: Boolean(dest.is_season_spring) || false,
                                          is_season_summer: Boolean(dest.is_season_summer) || false,
                                          is_season_fall: Boolean(dest.is_season_fall) || false,
                                          is_season_winter: Boolean(dest.is_season_winter) || false,
                                          is_season_all: Boolean(dest.is_season_all) || false,
                                          // Required Destination fields (set to null/empty string as appropriate)
                                          latitude: typeof dest.latitude === 'number' ? dest.latitude : null,
                                          longitude: typeof dest.longitude === 'number' ? dest.longitude : null,
                                          county: null,
                                          region: null,
                                          state_code: null,
                                          city: null,
                                          address_full: null,
                                          what3words: null,
                                          description: null,
                                          video_url: null,
                                          photo_gallery: null, // Set to null, not array
                                          nearby_food: null, // Set to null, not array or string
                                          nearby_lodging: null,
                                          nearby_attractions: null,
                                          activities: null,
                                          historical_timeline: null,
                                          contact_info: null,
                                          popularity_score: null,
                                          accessibility_rating: null,
                                          sustainability_rating: null,
                                          data_quality_score: null,
                                          ai_summary: null,
                                          ai_tips: null,
                                          ai_story: null,
                                          // DO NOT include optional array properties (hotel_recommendations, tour_recommendations)
                                          // These are not used by DestinationCard and cause serialization issues
                                        }));


                                        return <DestinationCard key={`${minimalSafeDest.id}-${index}`} d={minimalSafeDest} />;
                                      } catch (err) {
                                        console.error(`[DESTINATION_PAGE] Error rendering destination ${index}:`, err);
                                        return null;
                                      }
                                    });
                                  } catch (mapErr) {
                                    console.error('[DESTINATION_PAGE] Error in destinationCards map:', mapErr);
                                    return [];
                                  }
                                })();

                                // CRITICAL: Ensure destinationCards is always a valid array before any operations
                                if (!destinationCards || !Array.isArray(destinationCards)) {
                                  console.error('[DESTINATION_PAGE] destinationCards is not an array after map operation');
                                  return null;
                                }

                                // Filter out any null/undefined values using a simple loop to avoid .filter() issues
                                const validCards: any[] = [];
                                try {
                                  if (Array.isArray(destinationCards) && destinationCards.length > 0) {
                                    for (let i = 0; i < destinationCards.length; i++) {
                                      const card = destinationCards[i];
                                      if (card !== null && card !== undefined) {
                                        validCards.push(card);
                                      }
                                    }
                                  }
                                } catch (filterErr) {
                                  console.error('[DESTINATION_PAGE] Error filtering destination cards:', filterErr);
                                  return null;
                                }

                                if (!validCards || validCards.length === 0) {
                                  return null;
                                }

                                // Store length in constant to prevent any access issues
                                const validCardsCount = validCards.length;

                                // CRITICAL: Wrap in Fragment to ensure React hydration works correctly
                                // React requires a single root element/fragment, not a raw array
                                return <>{validCards}</>;
                              } catch (err) {
                                console.error('[DESTINATION_PAGE] Error in related destinations rendering:', err);
                                return null;
                              }
                            })()}
                          </div>
                          <div className="mt-6 text-center">
                            <Link
                              href={`/destinations?q=${encodeURIComponent(d!.county || '')}`}
                              className="inline-block px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              View All in {d!.county} →
                            </Link>
                          </div>
                        </div>
                      );
                    } catch (err) {
                      console.error('Error rendering related destinations:', err);
                      return null;
                    }
                  })()}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Info Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md sticky top-4">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Quick Info</h3>

                    {/* Drive Time — never show "0h 0m" or "0 miles"; use "At SLC Airport" when 0 */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Drive Time from SLC</div>
                      {(d.drive_minutes === 0 || d.distance_miles === 0) ? (
                        <div className="text-2xl font-bold text-blue-600">At SLC Airport</div>
                      ) : d.drive_minutes != null && d.drive_minutes > 0 ? (
                        <>
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.floor(d.drive_minutes / 60)}h {d.drive_minutes % 60}m
                          </div>
                          {d.distance_miles != null && d.distance_miles > 0 && (
                            <div className="text-sm text-gray-700 mt-1">{Math.round(d.distance_miles)} miles</div>
                          )}
                        </>
                      ) : (
                        <div className="text-2xl font-bold text-blue-600">
                          {categoryInfo.emoji} {categoryInfo.label}
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Location</div>
                      <div className="font-semibold text-gray-900">{d.county}</div>
                      <div className="text-sm text-gray-600">{d.region}, {d.state_code}</div>
                    </div>

                    {/* Contact Info */}
                    {(phone || website) && (
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Contact</div>
                        {phone && (
                          <div className="mb-2">
                            <a href={`tel:${phone}`} className="text-blue-600 hover:text-blue-700 underline">
                              📞 {phone}
                            </a>
                          </div>
                        )}
                        {website && (
                          <div>
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 break-all"
                            >
                              🌐 Website →
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hours */}
                    {(() => {
                      try {
                        // Final safety check for hours array
                        const safeHours = (() => {
                          if (!hours) return [];
                          if (!Array.isArray(hours)) return [];
                          return hours.filter((h): h is string => typeof h === 'string' && h.trim().length > 0);
                        })();

                        if (!safeHours || safeHours.length === 0) return null;

                        // CRITICAL: Final check before slicing and mapping
                        if (!safeHours || !Array.isArray(safeHours) || safeHours.length === 0) return null;

                        // Store slice result in constant to prevent hydration issues
                        const hoursToDisplay = safeHours.slice(0, 7);

                        // CRITICAL: Ensure hoursToDisplay is valid before accessing length or mapping
                        if (!hoursToDisplay || !Array.isArray(hoursToDisplay)) return null;
                        const hoursCount = hoursToDisplay.length;
                        if (hoursCount === 0) return null;

                        // CRITICAL: Final safety check - filter out invalid items before mapping
                        const validHours = Array.isArray(hoursToDisplay)
                          ? hoursToDisplay.filter((h): h is string => typeof h === 'string' && h.trim().length > 0)
                          : [];

                        if (validHours.length === 0) return null;

                        return (
                          <div className="mb-4 pb-4 border-b border-gray-200">
                            <div className="text-sm text-gray-600 mb-2">Hours</div>
                            <div className="text-sm space-y-1">
                              {validHours.map((hour: string, idx: number) => {
                                // Double-check hour is valid (defensive)
                                if (!hour || typeof hour !== 'string') return null;
                                return (
                                  <div key={`hour-${idx}`} className="text-gray-700">{hour}</div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      } catch (err) {
                        console.error('[DESTINATION_PAGE] Error rendering hours:', err);
                        return null;
                      }
                    })()}

                    {/* Watershed Protection Badge (mountain destinations) */}
                    <WatershedBadge destination={d} variant="detail" />

                    {/* Amenities */}
                    {(d.is_parking_free || d.has_restrooms || d.has_visitor_center || d.has_playground || d.pet_allowed || d.is_family_friendly) && (
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Amenities</div>
                        <div className="flex flex-wrap gap-2">
                          {d.is_parking_free && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              🅿️ Free Parking
                            </span>
                          )}
                          {d.has_restrooms && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              🚻 Restrooms
                            </span>
                          )}
                          {d.has_visitor_center && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              ℹ️ Visitor Center
                            </span>
                          )}
                          {d.has_playground && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              🎪 Playground
                            </span>
                          )}
                          {d.pet_allowed && (
                            <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                              🐕 Pet Friendly
                            </span>
                          )}
                          {d.is_family_friendly && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              👨‍👩‍👧‍👦 Family Friendly
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Best Seasons */}
                    {(d.is_season_spring || d.is_season_summer || d.is_season_fall || d.is_season_winter || d.is_season_all) && (
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Best Seasons</div>
                        <div className="flex flex-wrap gap-2">
                          {d.is_season_all && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-semibold">
                              ✨ Year-Round
                            </span>
                          )}
                          {!d.is_season_all && (
                            <>
                              {d.is_season_spring && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">🌸 Spring</span>}
                              {d.is_season_summer && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">☀️ Summer</span>}
                              {d.is_season_fall && <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">🍂 Fall</span>}
                              {d.is_season_winter && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">❄️ Winter</span>}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ratings */}
                    {(d.popularity_score || d.accessibility_rating) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {d.popularity_score && (
                          <div className="mb-2">
                            <div className="text-sm text-gray-600">Popularity</div>
                            <div className="text-yellow-500 font-semibold">
                              {'⭐'.repeat(Math.min(5, Math.floor(d.popularity_score / 20)))}
                            </div>
                          </div>
                        )}
                        {d.accessibility_rating && (
                          <div>
                            <div className="text-sm text-gray-600">Accessibility</div>
                            <div className="text-blue-600 font-semibold">
                              {d.accessibility_rating}/5
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Get Directions */}
                    <div className="mt-6">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${d.latitude},${d.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        🗺️ Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main >
        <Footer />
      </>
    );
  } catch (error) {
    // Catch any server-side errors that could cause 500
    console.error('Fatal error rendering destination page:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');

    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4 text-white">Something Went Wrong</h1>
            <p className="text-gray-400 mb-8">
              We encountered an unexpected error while loading this page. This has been logged and we'll look into it.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/destinations" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Browse Destinations
              </Link>
              <Link href="/" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                Go Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
}
