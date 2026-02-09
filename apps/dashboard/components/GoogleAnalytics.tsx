'use client';

import Script from 'next/script';

const MEASUREMENT_IDS: Record<string, string> = {
  'wasatchwise.com': 'G-Z6E4LRL4Q8',
  'www.wasatchwise.com': 'G-Z6E4LRL4Q8',
  'adultaiacademy.com': 'G-0RR6MHGHFQ',
  'www.adultaiacademy.com': 'G-0RR6MHGHFQ',
};

const DEFAULT_MEASUREMENT_ID = 'G-Z6E4LRL4Q8';

/**
 * Google Analytics 4 (gtag.js) — WasatchWise GA property (wasatch-wise-hq).
 * Dynamically selects measurement ID based on hostname so the dashboard app
 * reports to the correct GA4 data stream for both wasatchwise.com and adultaiacademy.com.
 */
export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <Script
      id="google-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var ids = ${JSON.stringify(MEASUREMENT_IDS)};
            var id = ids[window.location.hostname] || '${DEFAULT_MEASUREMENT_ID}';
            var s = document.createElement('script');
            s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
            s.async = true;
            document.head.appendChild(s);
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', id);
          })();
        `,
      }}
    />
  );
}
