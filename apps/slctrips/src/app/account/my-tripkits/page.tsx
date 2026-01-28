'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTripKits } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';

export const dynamic = 'force-dynamic';

interface TripKitAccess {
  id: string;
  access_type: 'purchased' | 'redeemed' | 'complimentary';
  access_granted_at: string;
  tripkit: {
    id: string;
    code: string;
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    cover_image_url: string | null;
    destination_count: number;
    price: number;
    tier: string | null;
    estimated_time: string | null;
  };
}

export default function MyTripKitsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tripkits, setTripkits] = useState<TripKitAccess[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTripKits = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getUserTripKits(user.id);
      // Filter out items where tripkit data is missing (e.g. deleted tripkits)
      const validData = (data as TripKitAccess[]).filter(item => item && item.tripkit);
      setTripkits(validData);
    } catch (error) {
      console.error('Error loading TripKits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTripKits();
    }
  }, [user, loadTripKits]);

  const getAccessBadge = (accessType: string) => {
    const badges = {
      purchased: { text: 'Purchased', color: 'bg-green-100 text-green-800' },
      redeemed: { text: 'Redeemed', color: 'bg-blue-100 text-blue-800' },
      complimentary: { text: 'Complimentary', color: 'bg-purple-100 text-purple-800' },
    };
    return badges[accessType as keyof typeof badges] || badges.purchased;
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading your TripKits...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My TripKits</h1>
            <p className="text-gray-600">Your collection of adventure guides</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/tripkits"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Browse TripKits</h3>
                  <p className="text-sm text-gray-600">Discover new adventures</p>
                </div>
              </div>
            </Link>

            <Link
              href="/redeem"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Redeem Code</h3>
                  <p className="text-sm text-gray-600">Have an access code?</p>
                </div>
              </div>
            </Link>

            <Link
              href="/account/settings"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Account Settings</h3>
                  <p className="text-sm text-gray-600">Manage your profile</p>
                </div>
              </div>
            </Link>
          </div>

          {/* TripKits Grid */}
          {tripkits.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">No TripKits Yet</h2>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t added any TripKits to your collection yet. Start exploring!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/tripkits"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Browse TripKits
                  </Link>
                  <Link
                    href="/redeem"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Redeem Code
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600">
                You have {tripkits.length} TripKit{tripkits.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tripkits.map((item) => {
                  const badge = getAccessBadge(item.access_type);
                  return (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                      {item.tripkit.cover_image_url && (
                        <div className="aspect-video w-full overflow-hidden bg-gray-200">
                          <SafeImage
                            src={item.tripkit.cover_image_url}
                            alt={item.tripkit.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-mono text-gray-500">{item.tripkit.code}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.color}`}>
                            {badge.text}
                          </span>
                        </div>

                        <h2 className="text-xl font-bold mb-2 text-gray-900">
                          {item.tripkit.name}
                        </h2>

                        {item.tripkit.tagline && (
                          <p className="text-gray-600 text-sm italic mb-3">
                            {item.tripkit.tagline}
                          </p>
                        )}

                        {item.tripkit.destination_count > 0 && (
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {item.tripkit.destination_count} destination{item.tripkit.destination_count !== 1 ? 's' : ''}
                          </div>
                        )}

                        <Link
                          href={`/tripkits/${item.tripkit.slug}/view`}
                          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                        >
                          View TripKit
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
