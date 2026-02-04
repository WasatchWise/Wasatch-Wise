import { Metadata } from 'next';

export interface SEOOptions {
  title: string;
  description: string;
  ogImage?: string;
  noIndex?: boolean;
  canonical?: string;
}

export function generateMetadata(options: SEOOptions): Metadata {
  const { title, description, ogImage, noIndex, canonical } = options;

  return {
    title: `${title} | Ask Before You App`,
    description,
    openGraph: {
      title: `${title} | Ask Before You App`,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Ask Before You App`,
      description,
      images: ogImage ? [ogImage] : [],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
  };
}

