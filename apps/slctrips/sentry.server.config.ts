// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Prevent re-initialization during hot reloads in development
if (!Sentry.getClient()) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Send user IP and request headers for better debugging context
    sendDefaultPii: true,

    // Capture console.error() calls and send to Sentry
    enableLogs: true,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions
    // In production with high traffic, consider lowering to 0.1 (10%)
    tracesSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Environment
    environment: process.env.NODE_ENV,

    // Filter out unnecessary errors
    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }

      // Add additional context for API errors
      if (event.request) {
        // Capture important request details
        event.contexts = event.contexts || {};
        event.contexts.request_details = {
          method: event.request.method,
          url: event.request.url,
          query_string: event.request.query_string,
        };
      }

      return event;
    },

    // Ignore transient errors
    ignoreErrors: [
      // Database connection timeouts (transient)
      'ETIMEDOUT',
      'ECONNREFUSED',

      // Stripe webhook signature validation (user error, not our bug)
      'No signatures found matching the expected signature',

      // Bot requests to page routes with invalid methods (now blocked by middleware)
      "Cannot read properties of null (reading 'digest')",
    ],
  });
}
