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
 * Prefers NEXT_PUBLIC_GA_MEASUREMENT_ID from Vercel when set; otherwise selects
 * measurement ID by hostname (wasatchwise.com vs adultaiacademy.com).
 */
export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const envId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const debug = process.env.NEXT_PUBLIC_GA_DEBUG === 'true';

  return (
    <Script
      id="google-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var envId = ${JSON.stringify(envId || '')};
            var ids = ${JSON.stringify(MEASUREMENT_IDS)};
            var id = envId || ids[window.location.hostname] || '${DEFAULT_MEASUREMENT_ID}';
            var debug = ${JSON.stringify(debug)};
            var s = document.createElement('script');
            s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
            s.async = true;
            document.head.appendChild(s);
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', id, debug ? { debug_mode: true } : {});
          })();
        `,
      }}
    />
  );
}
