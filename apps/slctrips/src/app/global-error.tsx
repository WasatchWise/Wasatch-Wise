'use client';

// Global error boundary for capturing React rendering errors
// This ensures all client-side React errors are sent to Sentry
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-render-errors-in-app-router

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string } | null;
  reset: () => void;
}) {
  useEffect(() => {
    // Capture the error in Sentry, but only if error exists
    if (error) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-300 mb-6">
              We&apos;ve been notified and are looking into it. Please try again.
            </p>

            {process.env.NODE_ENV === 'development' && error?.message && (
              <div className="bg-gray-900 rounded p-4 mb-6 text-left">
                <p className="text-xs text-gray-400 font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>

{/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Using <a> intentionally in error boundary where router may be broken */}
              <a
                href="/"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go Home
              </a>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              If this problem persists, please{' '}
              <a href="/legal/contact" className="text-blue-400 hover:text-blue-300 underline">
                contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
