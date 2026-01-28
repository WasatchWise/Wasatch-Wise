'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string } | null;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    if (error) {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">Something Went Wrong</h1>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            We encountered an unexpected error while loading this page.
            This has been logged and we&apos;ll look into it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/destinations"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Browse Destinations
            </Link>
          </div>

          {error?.digest && (
            <p className="text-gray-500 text-sm mt-8">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
