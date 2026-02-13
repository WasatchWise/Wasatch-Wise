import { Metadata } from 'next';

const SITE_URL = 'https://www.wasatchwise.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface SEOOptions {
  title: string;
  description: string;
  ogImage?: string;
  noIndex?: boolean;
  canonical?: string;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: string;
}

export function generateMetadata(options: SEOOptions): Metadata {
  const {
    title,
    description,
    ogImage = DEFAULT_OG_IMAGE,
    noIndex,
    canonical,
    keywords = [],
    type = 'website',
    publishedTime,
  } = options;

  const fullTitle = `${title} | WasatchWise`;
  const defaultKeywords = [
    'AI governance',
    'K-12',
    'school district',
    'FERPA compliance',
    'student data privacy',
    'teacher AI training',
    'shadow AI',
    'education technology',
    'AI policy',
  ];
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: 'John Lyman', url: SITE_URL }],
    creator: 'WasatchWise',
    publisher: 'WasatchWise',
    openGraph: {
      title: fullTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type,
      siteName: 'WasatchWise',
      url: canonical || SITE_URL,
      ...(publishedTime && type === 'article' ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@wasatchwise',
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large' as const,
            'max-snippet': -1,
          },
        },
    alternates: {
      canonical: canonical || SITE_URL,
    },
    metadataBase: new URL(SITE_URL),
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WasatchWise',
    url: SITE_URL,
    logo: `${SITE_URL}/wasatchwiselogo.png`,
    description:
      'AI Governance and AI Literacy consulting for K-12 school districts. Policy, training, and compliance in 90 days.',
    founder: {
      '@type': 'Person',
      name: 'John Lyman',
      jobTitle: 'Founder & AI Governance Consultant',
    },
    areaServed: 'US',
    knowsAbout: [
      'AI Governance',
      'FERPA Compliance',
      'Student Data Privacy',
      'K-12 Education Technology',
      'Teacher AI Training',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'admin@wasatchwise.com',
      contactType: 'sales',
    },
  };
}

/**
 * Generate JSON-LD structured data for a service
 */
export function getServiceSchema(service: {
  name: string;
  description: string;
  price: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'WasatchWise',
      url: SITE_URL,
    },
    areaServed: 'US',
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'USD',
    },
    url: service.url,
  };
}

/**
 * Generate JSON-LD FAQ schema for rich snippets
 */
export function getFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

