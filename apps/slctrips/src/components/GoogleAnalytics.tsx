'use client';

import Script from 'next/script';
import { useState, useEffect } from 'react';

/**
 * Google Analytics Component (Consent-Gated)
 *
 * Only loads GA4 when user has granted analytics consent via cookie banner.
 * Uses Google Consent Mode v2 for GDPR/CCPA compliance.
 *
 * Setup:
 * 1. Get GA4 Measurement ID from https://analytics.google.com
 * 2. Add to .env.local: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * 3. Add to Vercel environment variables
 * 4. Wait 24 hours for data to show up
 */

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [hasConsent, setHasConsent] = useState(false);

  // Check and listen for consent changes
  useEffect(() => {
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem('cookieConsent');
        if (consent) {
          const prefs = JSON.parse(consent);
          setHasConsent(prefs.analytics === true);
        } else {
          setHasConsent(false);
        }
      } catch {
        setHasConsent(false);
      }
    };

    // Initial check
    checkConsent();

    // Listen for consent changes (custom event from CookieConsent)
    const handleConsentChange = () => checkConsent();
    window.addEventListener('cookieConsentUpdated', handleConsentChange);

    // Also check on storage changes (for cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'cookieConsent') checkConsent();
    });

    return () => {
      window.removeEventListener('cookieConsentUpdated', handleConsentChange);
    };
  }, []);

  // Don't load in development
  if (process.env.NODE_ENV !== 'production' || !measurementId) {
    return null;
  }

  // Validate GA Measurement ID format (must be G-XXXXXXXXXX)
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
    console.error('Invalid GA Measurement ID format:', measurementId);
    return null;
  }

  // Only render GA scripts when user has granted consent
  if (!hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Set default consent state (denied until user accepts)
            gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            });

            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

/**
 * Track Custom Events
 *
 * Usage:
 *   trackEvent('purchase', { value: 29.99, currency: 'USD', items: ['TK-001'] })
 *   trackEvent('destination_view', { destination: 'park-city', language: 'en' })
 *   trackEvent('audio_play', { destination: 'zion', language: 'es' })
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
}
