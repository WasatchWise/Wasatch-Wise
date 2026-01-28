import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

/**
 * Dynamic sitemap generation for SLCTrips
 * Automatically includes all destinations, tripkits, and static pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tripkits`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guardians`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/best-of`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/welcome-wagon`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/welcome-wagon/week-one-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/educators`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // Fetch all destinations
    const { data: destinations } = await supabase
      .from('public_destinations')
      .select('slug, updated_at, featured, trending')
      .order('name');

    const destinationUrls: MetadataRoute.Sitemap = destinations?.map((d) => ({
      url: `${baseUrl}/destinations/${d.slug}`,
      lastModified: d.updated_at ? new Date(d.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: d.featured || d.trending ? 0.9 : 0.8,
    })) || [];

    // Fetch all tripkits
    const { data: tripkits } = await supabase
      .from('tripkits')
      .select('slug, updated_at, status')
      .eq('status', 'active')
      .order('name');

    const tripkitUrls: MetadataRoute.Sitemap = tripkits?.map((t) => ({
      url: `${baseUrl}/tripkits/${t.slug}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })) || [];

    // Fetch all guardians (by county)
    const { data: guardians } = await supabase
      .from('guardians')
      .select('county, updated_at')
      .order('county');

    const guardianUrls: MetadataRoute.Sitemap = guardians?.map((g) => {
      const countySlug = g.county.toLowerCase().replace(/\s+/g, '-');
      return {
        url: `${baseUrl}/guardians/${countySlug}`,
        lastModified: g.updated_at ? new Date(g.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    }) || [];

    // Fetch all published events
    const { data: events } = await supabase
      .from('events')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('start_at');

    const eventUrls: MetadataRoute.Sitemap = events?.map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: event.updated_at ? new Date(event.updated_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })) || [];

    // Combine all URLs
    return [
      ...staticPages,
      ...destinationUrls,
      ...tripkitUrls,
      ...guardianUrls,
      ...eventUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if database fetch fails
    return staticPages;
  }
}
