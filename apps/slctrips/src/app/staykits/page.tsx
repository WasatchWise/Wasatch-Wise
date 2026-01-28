'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllStayKits } from '@/lib/staykit';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import type { StayKit } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export default function StayKitsCatalogPage() {
  const { user } = useAuth();
  const [staykits, setStaykits] = useState<StayKit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStayKits();
  }, []);

  const loadStayKits = async () => {
    setLoading(true);
    try {
      const data = await getAllStayKits();
      setStaykits(data);
    } catch (error) {
      console.error('Error loading StayKits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (staykit: StayKit) => {
    if (!user) {
      // Redirect to sign in
      window.location.href = `/auth/signin?redirect=/staykits`;
      return;
    }

    // Call Stripe checkout API (to be implemented)
    try {
      const response = await fetch('/api/staykit/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staykitId: staykit.id,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">StayKits</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Your 90-day local immersion guides. Transform from visitor to insider with curated daily tasks, insider tips, and neighborhood connections.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Value Proposition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Structured Journey</h3>
              <p className="text-gray-600">
                90 days of curated tasks designed to gradually deepen your local knowledge and connections.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Insider Tips</h3>
              <p className="text-gray-600">
                Expert recommendations for restaurants, hidden gems, and local secrets you won't find in guidebooks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Complete tasks at your pace with visual progress tracking and milestone celebrations.
              </p>
            </div>
          </div>

          {/* StayKits Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading StayKits...</p>
            </div>
          ) : staykits.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
              <p className="text-gray-600">
                We're working on creating amazing StayKits for you. Check back soon!
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Available StayKits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {staykits.map((staykit) => (
                  <div
                    key={staykit.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                  >
                    {staykit.cover_image_url && (
                      <div className="aspect-video w-full overflow-hidden bg-gray-200">
                        <SafeImage
                          src={staykit.cover_image_url}
                          alt={staykit.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-mono text-gray-500">{staykit.code}</span>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                          {staykit.day_count} Days
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{staykit.name}</h3>

                      {staykit.tagline && (
                        <p className="text-gray-600 text-sm italic mb-4">{staykit.tagline}</p>
                      )}

                      {staykit.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {staykit.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center mb-6 py-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {staykit.task_count || '50+'}
                          </div>
                          <div className="text-xs text-gray-500">Tasks</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {staykit.tip_count || '200+'}
                          </div>
                          <div className="text-xs text-gray-500">Tips</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {staykit.destination_count || '10+'}
                          </div>
                          <div className="text-xs text-gray-500">Places</div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900">
                            ${staykit.price.toFixed(2)}
                          </span>
                          {staykit.regular_price && staykit.regular_price > staykit.price && (
                            <span className="text-lg text-gray-400 line-through">
                              ${staykit.regular_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {staykit.regular_price && staykit.regular_price > staykit.price && (
                          <div className="text-sm text-green-600 font-semibold">
                            Save $
                            {(staykit.regular_price - staykit.price).toFixed(2)} (
                            {Math.round(
                              ((staykit.regular_price - staykit.price) / staykit.regular_price) *
                                100
                            )}
                            % off)
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handlePurchase(staykit)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        Purchase StayKit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What's included in a StayKit?
                </h3>
                <p className="text-gray-600">
                  Each StayKit includes 90 days of structured tasks, insider tips for local restaurants
                  and hidden gems, destination guides, and progress tracking. You'll have access to
                  curated recommendations that help you discover your new home like a local.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How does progress tracking work?
                </h3>
                <p className="text-gray-600">
                  Mark tasks as complete as you go, and watch your progress grow. Each milestone day
                  builds on the previous one, gradually deepening your knowledge. You can complete tasks
                  at your own pace—there's no rush.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do StayKits expire?
                </h3>
                <p className="text-gray-600">
                  No! Once you purchase a StayKit, you have lifetime access. Take your time exploring
                  at whatever pace feels right for you.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I access StayKits on mobile?
                </h3>
                <p className="text-gray-600">
                  Yes! The StayKit dashboard is fully responsive and works beautifully on phones,
                  tablets, and desktop computers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
