'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import { supabase } from '@/lib/supabaseClient';

interface GiftData {
  tripkit: {
    id: string;
    name: string;
    tagline: string | null;
    description: string | null;
    cover_image_url: string | null;
    destination_count: number;
  };
  senderName: string;
  giftMessage: string;
  accessCode: string;
}

export default function GiftRevealPage() {
  const params = useParams();
  const code = params.code as string;
  const [giftData, setGiftData] = useState<GiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const fetchGiftData = useCallback(async () => {
    if (!code) return;
    try {
      // Fetch the access code with gift info
      const { data: accessCodeData, error: accessError } = await supabase
        .from('tripkit_access_codes')
        .select(`
          access_code,
          gift_sender_name,
          gift_message,
          is_gift,
          tripkit_id,
          tripkits (
            id,
            name,
            tagline,
            description,
            cover_image_url,
            destination_count
          )
        `)
        .eq('access_code', code)
        .eq('is_active', true)
        .single();

      if (accessError || !accessCodeData) {
        setError('Gift not found or has expired.');
        setLoading(false);
        return;
      }

      if (!accessCodeData.is_gift) {
        // Not a gift, redirect to normal TripKit view
        window.location.href = `/tk/${code}`;
        return;
      }

      const tripkit = accessCodeData.tripkits as any;
      setGiftData({
        tripkit: {
          id: tripkit.id,
          name: tripkit.name,
          tagline: tripkit.tagline,
          description: tripkit.description,
          cover_image_url: tripkit.cover_image_url,
          destination_count: tripkit.destination_count,
        },
        senderName: accessCodeData.gift_sender_name || 'Someone special',
        giftMessage: accessCodeData.gift_message || '',
        accessCode: code,
      });
    } catch (err) {
      console.error('Error fetching gift:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (code) {
      fetchGiftData();
    }
  }, [code, fetchGiftData]);

  const handleOpenGift = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsRevealed(true);
    }, 1500);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-pink-600"></div>
            <p className="mt-4 text-gray-600">Loading your gift...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !giftData) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-6">😢</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Gift Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'This gift link may have expired or is invalid.'}</p>
            <Link
              href="/tripkits"
              className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse TripKits
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Gift Box Animation (before reveal)
  if (!isRevealed) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center py-16">
          <div className="text-center max-w-lg mx-auto px-4">
            {/* Sender Message */}
            <p className="text-xl text-purple-700 mb-4 animate-fade-in">
              {giftData.senderName} sent you a gift!
            </p>

            {/* Gift Box */}
            <div
              className={`relative mx-auto mb-8 cursor-pointer transition-all duration-500 ${
                isOpening ? 'scale-110 animate-pulse' : 'hover:scale-105'
              }`}
              onClick={!isOpening ? handleOpenGift : undefined}
            >
              <div className={`w-48 h-48 mx-auto relative ${isOpening ? 'animate-bounce' : ''}`}>
                {/* Gift Box Body */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg shadow-2xl">
                  {/* Ribbon Horizontal */}
                  <div className="absolute top-1/2 left-0 right-0 h-6 bg-yellow-400 -translate-y-1/2"></div>
                  {/* Ribbon Vertical */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-6 bg-yellow-400 -translate-x-1/2"></div>
                  {/* Bow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="relative">
                      <div className="w-16 h-8 bg-yellow-400 rounded-full transform -rotate-45 absolute -left-4"></div>
                      <div className="w-16 h-8 bg-yellow-400 rounded-full transform rotate-45 absolute -right-4"></div>
                      <div className="w-8 h-8 bg-yellow-500 rounded-full relative z-10 mx-auto"></div>
                    </div>
                  </div>
                </div>
                {/* Sparkles */}
                {!isOpening && (
                  <>
                    <div className="absolute -top-4 -right-4 text-2xl animate-pulse">✨</div>
                    <div className="absolute -bottom-2 -left-4 text-2xl animate-pulse delay-150">✨</div>
                    <div className="absolute top-0 -left-6 text-xl animate-pulse delay-300">⭐</div>
                  </>
                )}
              </div>
            </div>

            {/* Open Button */}
            {!isOpening && (
              <button
                onClick={handleOpenGift}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xl rounded-full shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                <span>🎁</span>
                <span>Open Your Gift</span>
              </button>
            )}

            {isOpening && (
              <p className="text-lg text-purple-600 animate-pulse">Opening...</p>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Gift Revealed
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* Celebration Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              You received a TripKit!
            </h1>
            <p className="text-xl text-purple-600">
              From: {giftData.senderName}
            </p>
          </div>

          {/* Gift Message Card */}
          {giftData.giftMessage && (
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-1 mb-8 shadow-lg animate-fade-in">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">💌</span>
                  <div>
                    <p className="text-lg text-gray-700 italic">"{giftData.giftMessage}"</p>
                    <p className="text-purple-600 font-semibold mt-2">— {giftData.senderName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TripKit Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 animate-fade-in">
            {giftData.tripkit.cover_image_url && (
              <div className="aspect-video w-full overflow-hidden">
                <SafeImage
                  src={giftData.tripkit.cover_image_url}
                  alt={giftData.tripkit.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {giftData.tripkit.name}
              </h2>

              {giftData.tripkit.tagline && (
                <p className="text-lg text-purple-600 italic mb-4">
                  {giftData.tripkit.tagline}
                </p>
              )}

              {giftData.tripkit.description && (
                <p className="text-gray-600 mb-6">
                  {giftData.tripkit.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-gray-500 mb-8">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{giftData.tripkit.destination_count} destinations included</span>
              </div>

              <Link
                href={`/tk/${giftData.accessCode}`}
                className="block w-full text-center py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                🚀 Start Exploring Your TripKit
              </Link>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-gray-500 text-sm">
            This TripKit is now yours forever. Bookmark this page or access it anytime from your email.
          </p>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}
