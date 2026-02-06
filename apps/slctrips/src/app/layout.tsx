import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'react-hot-toast';
import CookieConsent from '@/components/CookieConsent';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import AttributionCapture from '@/components/AttributionCapture';
import AWINMasterTag from '@/components/AWINMasterTag';
import SchemaMarkup, { generateOrganizationSchema } from '@/components/SchemaMarkup';
import Providers from '@/components/Providers';
import WebVitalsClient from '@/components/WebVitalsClient';
import GlobalDanConcierge from '@/components/GlobalDanConcierge';

export const metadata: Metadata = {
  title: 'SLCTrips - From Salt Lake, to Everywhere',
  description: 'Discover amazing destinations from Salt Lake City International Airport. 1 Airport, 1000+ Destinations.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SLCTrips',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'SLCTrips - From Salt Lake, to Everywhere',
    description: 'Discover amazing destinations from Salt Lake City International Airport. 1 Airport, 1000+ Destinations.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.slctrips.com',
    siteName: 'SLCTrips',
    images: [
      {
        url: 'https://www.slctrips.com/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SLCTrips - From Salt Lake, to Everywhere',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SLCTrips - From Salt Lake, to Everywhere',
    description: 'Discover amazing destinations from Salt Lake City International Airport. 1 Airport, 1000+ Destinations.',
  },
};

export const viewport: Viewport = {
  themeColor: '#FBBF24',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Generate Organization schema for homepage/global SEO
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SLCTrips" />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Font display optimization */}
        <style dangerouslySetInnerHTML={{__html: `
          @font-face {
            font-family: 'Inter';
            font-display: swap;
          }
        `}} />
        {/* Preload critical resources */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Schema.org Organization Schema */}
        <SchemaMarkup schema={organizationSchema} />
        {/* AWIN Publisher Master Tag */}
        <AWINMasterTag />
      </head>
      <body>
        <Providers>
          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white"
            tabIndex={0}
          >
            Skip to main content
          </a>
          <Toaster />
          <GoogleAnalytics />
          <AttributionCapture />
          <WebVitalsClient />
          {children}
          <GlobalDanConcierge />
          <CookieConsent />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}


