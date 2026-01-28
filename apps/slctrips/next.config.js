// Try to load Sentry, but make it optional
let withSentryConfig;
try {
  withSentryConfig = require("@sentry/nextjs").withSentryConfig;
} catch (e) {
  // Sentry not available, use identity function
  withSentryConfig = (config) => config;
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Mark @google-cloud/aiplatform as external for server-side
    // This prevents webpack from trying to bundle it, allowing optional installation
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@google-cloud/aiplatform': 'commonjs @google-cloud/aiplatform',
      });
    } else {
      // For client-side, mark as false so it's not bundled
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@google-cloud/aiplatform': false,
      };
    }
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24h
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'kvhdsupabaseprod.storage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' }
    ]
  },
  async headers() {
    // Security headers for all routes
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin-allow-popups',
      },
      {
        key: 'Cross-Origin-Embedder-Policy',
        value: 'unsafe-none',
      },
      {
        key: 'Require-Trusted-Types-For',
        value: "'script'",
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.googletagmanager.com https://www.google-analytics.com https://*.sentry.io https://*.ingest.sentry.io https://vitals.vercel-insights.com https://js.stripe.com https://www.awin1.com https://www.tiktok.com https://*.tiktokcdn-us.com https://*.tiktok.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tiktokcdn-us.com https://*.tiktok.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https://*.supabase.co https://*.storage.googleapis.com https://storage.googleapis.com https://kvhdsupabaseprod.storage.googleapis.com https://images.unsplash.com https://maps.googleapis.com https://*.googleapis.com https://i.ytimg.com https://*.tiktok.com https://*.tiktokcdn-us.com",
          "media-src 'self' https://*.supabase.co blob: data: https://*.tiktok.com https://*.tiktokcdn-us.com",
          "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.sentry.io https://www.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://www.youtube.com https://api.openweathermap.org https://www.tiktok.com https://*.tiktok.com https://*.tiktokcdn-us.com",
          "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://www.tiktok.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self' https://checkout.stripe.com",
        ].join('; '),
      },
    ];

    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          ...securityHeaders,
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/tripkits/TK-000',
        destination: '/tripkits/meet-the-mt-olympians',
        permanent: true,
      },
      {
        source: '/tripkits/TK-000/view',
        destination: '/tripkits/meet-the-mt-olympians/view',
        permanent: true,
      },
      // Redirect old utah-complete slug to correct ski-utah-complete
      {
        source: '/tripkits/utah-complete',
        destination: '/tripkits/ski-utah-complete',
        permanent: true,
      },
      {
        source: '/tripkits/utah-complete/view',
        destination: '/tripkits/ski-utah-complete/view',
        permanent: true,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Upload source maps for better error debugging
    // Only uploads if SENTRY_AUTH_TOKEN is set
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Webpack plugin options
    // Note: autoInstrumentServerFunctions is now enabled by default in newer Sentry versions
    // The deprecation warning was about moving it to webpack config, but it's no longer needed
    // as server function instrumentation is automatic
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false, // Set to false unless you need IE11 support

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles (security)
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Automatically instrument Next.js API routes
    automaticVercelMonitors: true,
  }
));


