'use client';

import Script from 'next/script';

const FALLBACK_MEASUREMENT_ID = 'G-RN4R6STPML';

/**
 * Google Analytics 4 (gtag.js) — Ask Before You App data stream.
 * Uses NEXT_PUBLIC_GA_MEASUREMENT_ID from Vercel when set (required for production).
 */
export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const measurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || FALLBACK_MEASUREMENT_ID;
  const debug = process.env.NEXT_PUBLIC_GA_DEBUG === 'true';

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
            gtag('js', new Date());
            gtag('config', '${measurementId}', ${debug ? '{ debug_mode: true }' : '{}'});
          `,
        }}
      />
    </>
  );
}
