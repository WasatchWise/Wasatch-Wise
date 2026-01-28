'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStayKits } from '@/lib/staykit';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import type { StayKitWithProgress } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export default function MyStayKitPage() {
  const { user, loading: authLoading } = useAuth();
  const [staykits, setStaykits] = useState<StayKitWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStayKits = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getUserStayKits(user.id);
      setStaykits(data);
    } catch (error) {
      console.error('Error loading StayKits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadStayKits();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, loadStayKits]);

  const getProgressColor = (percentage: number | null | undefined) => {
    if (!percentage) return 'bg-gray-200';
    if (percentage < 25) return 'bg-red-200';
    if (percentage < 50) return 'bg-yellow-200';
    if (percentage < 75) return 'bg-blue-200';
    if (percentage < 100) return 'bg-green-200';
    return 'bg-green-400';
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading your StayKits...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                Please sign in to view your StayKits.
              </p>
              <Link
                href="/auth/signin"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Sign In
              </Link>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My StayKits</h1>
            <p className="text-gray-600">Your local immersion guides</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/staykits"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Browse StayKits</h3>
                  <p className="text-sm text-gray-600">Discover new locations</p>
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

          {/* StayKits Grid */}
          {staykits.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">No StayKits Yet</h2>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t added any StayKits to your collection yet. Start your local immersion journey!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/staykits"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Browse StayKits
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
                You have {staykits.length} StayKit{staykits.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staykits.map((staykit) => {
                  const progress = staykit.progress;
                  const progressPercentage = progress?.progress_percentage || 0;
                  const progressColor = getProgressColor(progressPercentage);

                  return (
                    <div key={staykit.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
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
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {staykit.day_count} Days
                          </span>
                        </div>

                        <h2 className="text-xl font-bold mb-2 text-gray-900">
                          {staykit.name}
                        </h2>

                        {staykit.tagline && (
                          <p className="text-gray-600 text-sm italic mb-3">
                            {staykit.tagline}
                          </p>
                        )}

                        {/* Progress Bar */}
                        {progress && progress.started_at && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Progress</span>
                              <span className="font-semibold">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${progressColor} transition-all duration-500`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            {progress.current_day_number && (
                              <p className="text-xs text-gray-500 mt-1">
                                Day {progress.current_day_number} of {staykit.day_count}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          {staykit.task_count && staykit.task_count > 0 && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {staykit.task_count} tasks
                            </div>
                          )}
                          {staykit.destination_count && staykit.destination_count > 0 && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {staykit.destination_count} places
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/staykit/${staykit.slug}`}
                          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                        >
                          {progress?.started_at ? 'Continue StayKit' : 'Start StayKit'}
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
