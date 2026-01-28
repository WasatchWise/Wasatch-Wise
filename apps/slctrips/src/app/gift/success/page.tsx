'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GiftDetails {
  tripkitName: string;
  recipientName: string;
  recipientEmail: string;
  deliveryDate: string;
  giftMessage: string;
}

function GiftSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [giftDetails, setGiftDetails] = useState<GiftDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGiftDetails = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/purchases/gift-details?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setGiftDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch gift details:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchGiftDetails();
    } else {
      setLoading(false);
    }
  }, [sessionId, fetchGiftDetails]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-pink-600"></div>
            <p className="mt-4 text-gray-600">Loading gift details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16">
        <div className="max-w-2xl mx-auto px-4">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-6 shadow-lg animate-bounce">
              <span className="text-5xl">🎁</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Gift Purchase Complete!
            </h1>
            <p className="text-xl text-gray-600">
              Your gift is on its way to making someone's day special.
            </p>
          </div>

          {/* Gift Details Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-6 text-white">
              <h2 className="text-2xl font-bold text-white">
                {giftDetails?.tripkitName || 'TripKit Gift'}
              </h2>
              <p className="text-pink-100 mt-1">
                A gift for {giftDetails?.recipientName || 'your recipient'}
              </p>
            </div>

            <div className="p-8 space-y-6">
              {giftDetails && (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Recipient</p>
                      <p className="text-gray-600">{giftDetails.recipientName}</p>
                      <p className="text-gray-500 text-sm">{giftDetails.recipientEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📅</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Delivery</p>
                      <p className="text-gray-600">
                        {giftDetails.deliveryDate === 'immediate'
                          ? 'Sent immediately - they should receive it now!'
                          : `Scheduled for ${new Date(giftDetails.deliveryDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}`
                        }
                      </p>
                    </div>
                  </div>

                  {giftDetails.giftMessage && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">💬</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Your Message</p>
                        <p className="text-gray-600 italic">"{giftDetails.giftMessage}"</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!giftDetails && (
                <div className="text-center py-4">
                  <p className="text-gray-600">
                    Your gift has been sent! The recipient will receive an email with their TripKit.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">What happens next?</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>You'll receive a confirmation email with the gift details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>
                  {giftDetails?.deliveryDate === 'immediate'
                    ? 'The recipient has been notified via email'
                    : 'The recipient will be notified on the scheduled date'
                  }
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>They can access their TripKit instantly with their unique link</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tripkits"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
            >
              Browse More TripKits
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading gift details...</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function GiftSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GiftSuccessContent />
    </Suspense>
  );
}
