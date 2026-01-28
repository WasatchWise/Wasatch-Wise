'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CheckoutCancel() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500 mb-6">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Checkout Cancelled
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              No worries! Your payment was not processed.
            </p>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">What Would You Like To Do?</h2>
            <div className="text-left space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤔</span>
                <div>
                  <h3 className="font-semibold text-white">Changed Your Mind?</h3>
                  <p className="text-gray-400">
                    Feel free to browse our other TripKits or explore free destinations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-semibold text-white">Have Questions?</h3>
                  <p className="text-gray-400">
                    Contact us at{' '}
                    <a
                      href="mailto:Dan@slctrips.com"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Dan@slctrips.com
                    </a>
                    {' '}— we&apos;re happy to help!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <h3 className="font-semibold text-white">Founder Pricing Still Available</h3>
                  <p className="text-gray-400">
                    Don&apos;t miss out on limited-time founder pricing on select TripKits!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tripkits"
              className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Browse TripKits
            </Link>
            <Link
              href="/destinations"
              className="inline-block bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 px-8 py-4 rounded-lg font-semibold hover:border-blue-500 transition-all"
            >
              Explore Free Destinations
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
