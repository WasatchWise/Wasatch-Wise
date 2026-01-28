interface SchemaMarkupProps {
  schema: object;
  id?: string;
}

/**
 * Schema.org JSON-LD Component
 * 
 * Adds structured data to pages for better SEO and rich snippets in search results.
 * Supports all Schema.org types (Organization, TouristAttraction, Product, etc.)
 * 
 * Can be placed in <head> or <body> - both are valid for JSON-LD.
 */
export default function SchemaMarkup({ schema, id }: SchemaMarkupProps) {
  const scriptId = id || `schema-markup-${Math.random().toString(36).slice(2, 11)}`;

  return (
    <script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
}

/**
 * Generate Organization schema for homepage
 */
export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SLCTrips',
    alternateName: 'Salt Lake City Trips',
    url: baseUrl,
    logo: `${baseUrl}/images/Site_logo.png`,
    description: 'Discover amazing destinations from Salt Lake City International Airport. 1 Airport, 1000+ Destinations.',
    foundingDate: '2020',
    founder: {
      '@type': 'Person',
      name: 'Dan',
      jobTitle: 'Wasatch Sasquatch',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'Dan@slctrips.com',
      contactType: 'Customer Service',
      areaServed: 'US',
      availableLanguage: ['en'],
    },
    sameAs: [
      // Add social media URLs when available
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Salt Lake City',
      addressRegion: 'UT',
      addressCountry: 'US',
    },
  };
}

/**
 * Generate TouristAttraction schema for destination pages
 */
export function generateTouristAttractionSchema(destination: {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  latitude: number;
  longitude: number;
  county: string;
  region: string;
  state_code: string;
  category: string;
  subcategory: string;
  contact_info?: any;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';
  const url = `${baseUrl}/destinations/${destination.slug}`;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: destination.name,
    description: destination.description || `Visit ${destination.name} in ${destination.county}, ${destination.state_code}`,
    url,
    image: destination.image_url ? [destination.image_url] : undefined,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: destination.county,
      addressRegion: destination.state_code,
      addressCountry: 'US',
    },
    containedInPlace: {
      '@type': 'Place',
      name: destination.region,
      address: {
        '@type': 'PostalAddress',
        addressRegion: destination.state_code,
        addressCountry: 'US',
      },
    },
  };

  // Add contact information if available
  if (destination.contact_info) {
    if (destination.contact_info.phone) {
      schema.telephone = destination.contact_info.phone;
    }
    if (destination.contact_info.website) {
      schema.sameAs = [destination.contact_info.website];
    }
    if (destination.contact_info.email) {
      schema.email = destination.contact_info.email;
    }
  }

  // Add category/subcategory as keywords
  schema.keywords = [
    destination.subcategory,
    destination.category,
    destination.county,
    destination.region,
    'Utah travel',
    'Salt Lake City',
  ].filter(Boolean).join(', ');

  // Remove undefined fields
  Object.keys(schema).forEach(key => {
    if (schema[key] === undefined) {
      delete schema[key];
    }
  });

  return schema;
}

/**
 * Generate Product schema for TripKit pages
 */
export function generateProductSchema(tripkit: {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price: number;
  currency?: string;
  code: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';
  const url = `${baseUrl}/tripkits/${tripkit.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tripkit.name,
    description: tripkit.description || `Digital guidebook: ${tripkit.name}`,
    image: tripkit.image_url ? [tripkit.image_url] : undefined,
    url,
    sku: tripkit.code,
    offers: {
      '@type': 'Offer',
      price: tripkit.price,
      priceCurrency: tripkit.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url,
      seller: {
        '@type': 'Organization',
        name: 'SLCTrips',
      },
    },
    brand: {
      '@type': 'Brand',
      name: 'SLCTrips',
    },
    category: 'Digital Guidebook',
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}


/**
 * Generate LearningResource schema for educational TripKits
 */
export function generateLearningResourceSchema(tripkit: {
  name: string;
  slug: string;
  description: string | null;
  learning_objectives: string[] | null;
  curriculum_alignment: { subject: string; grade_level: string; standard: string } | null;
  author?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';
  const url = `${baseUrl}/tripkits/${tripkit.slug}`;

  if (!tripkit.learning_objectives || tripkit.learning_objectives.length === 0) {
    return null;
  }

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': ['LearningResource', 'CreativeWork'],
    name: tripkit.name,
    description: tripkit.description || `Educational resource: ${tripkit.name}`,
    url,
    learningResourceType: 'Lesson Plan',
    educationalLevel: tripkit.curriculum_alignment?.grade_level || 'All Ages',
    teaches: tripkit.learning_objectives.join('. '),
    author: {
      '@type': 'Organization',
      name: tripkit.author || 'SLCTrips',
    },
    inLanguage: 'en-US',
    isAccessibleForFree: true, // Or false based on tier, but keeping simple for now
  };

  if (tripkit.curriculum_alignment) {
    schema.educationalAlignment = {
      '@type': 'AlignmentObject',
      alignmentType: 'educationalSubject',
      educationalFramework: 'Utah Core Standards',
      targetName: tripkit.curriculum_alignment.standard,
      targetUrl: 'https://www.schools.utah.gov/curr/standards', // Generic fallback
      targetDescription: tripkit.curriculum_alignment.subject,
    };
  }

  return schema;
}

/**
 * Learning Objective type for TripKit educational content
 */
export interface LearningObjective {
  id: string;
  objective: string;
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  category: 'geography' | 'culture' | 'history' | 'safety' | 'planning' | 'local-knowledge';
}

/**
 * Generate TripKit schema (combined Product + LearningResource)
 */
export function generateTripKitSchema(tripkit: {
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  price: number;
  code: string;
  destination_count?: number;
  estimated_time?: string | null;
  learning_objectives?: LearningObjective[] | null;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';
  const url = `${baseUrl}/tripkits/${tripkit.slug}`;

  // Base Product schema
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'LearningResource'],
    name: tripkit.name,
    description: tripkit.description || `Digital guidebook: ${tripkit.name}`,
    image: tripkit.cover_image_url ? [tripkit.cover_image_url] : undefined,
    url,
    sku: tripkit.code,
    offers: {
      '@type': 'Offer',
      price: tripkit.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url,
      seller: {
        '@type': 'Organization',
        name: 'SLCTrips',
      },
    },
    brand: {
      '@type': 'Brand',
      name: 'SLCTrips',
    },
    category: 'Digital Guidebook',
  };

  // Add learning objectives if present
  if (tripkit.learning_objectives && tripkit.learning_objectives.length > 0) {
    schema.teaches = tripkit.learning_objectives.map(obj => obj.objective).join('. ');
    schema.learningResourceType = 'Lesson Plan';
    schema.educationalLevel = 'All Ages';
    schema.inLanguage = 'en-US';
  }

  // Add destination count info
  if (tripkit.destination_count && tripkit.destination_count > 0) {
    schema.numberOfItems = tripkit.destination_count;
  }

  // Add estimated time
  if (tripkit.estimated_time) {
    schema.timeRequired = tripkit.estimated_time;
  }

  return schema;
}
