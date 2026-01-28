'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import type { TripKit } from '@/types/database.types';

export const dynamic = 'force-dynamic';

interface PurchasedTripKit extends TripKit {
  purchased_at: string;
}

export default function MyTripKitsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tripkits, setTripkits] = useState<PurchasedTripKit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTripKits = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's purchased TripKits from customer_product_access
      const { data: accessData, error: accessError } = await supabase
        .from('customer_product_access')
        .select('product_id, created_at')
        .eq('user_id', user.id)
        .eq('product_type', 'tripkit')
        .order('created_at', { ascending: false });

      // Also check for access code-based TripKits (for TK-000 and other free TripKits)
      // This ensures users can see TripKits they got via email gate
      const { data: accessCodeData } = await supabase
        .from('tripkit_access_codes')
        .select('tripkit_id, activated_at')
        .eq('customer_email', user.email?.toLowerCase() || '')
        .eq('is_active', true);

      // Combine both sources of access
      const allTripKitIds = new Set<string>();
      
      if (accessData) {
        accessData.forEach(a => allTripKitIds.add(a.product_id));
      }
      
      if (accessCodeData) {
        accessCodeData.forEach(a => allTripKitIds.add(a.tripkit_id));
      }

      const tripkitIds = Array.from(allTripKitIds);

      if (accessError) {
        console.error('Error loading customer_product_access:', accessError);
      }

      if (tripkitIds.length === 0) {
        setTripkits([]);
        return;
      }

      const { data: tripkitData, error: tripkitError } = await supabase
        .from('tripkits')
        .select('*')
        .in('id', tripkitIds);

      if (tripkitError) throw tripkitError;

      // Combine with purchase info and filter out any invalid/missing tripkits
      const combinedData = (tripkitData || [])
        .filter(tk => tk && tk.id && tk.slug && tk.name) // Filter out invalid tripkit data
        .map(tk => {
          // Check both customer_product_access and access codes for purchase date
          const access = accessData?.find(a => a.product_id === tk.id);
          const accessCode = accessCodeData?.find(a => a.tripkit_id === tk.id);
          const purchaseDate = access?.created_at || accessCode?.activated_at || '';
          
          return {
            ...tk,
            purchased_at: purchaseDate
          };
        });

      setTripkits(combinedData as PurchasedTripKit[]);
    } catch (error) {
      console.error('Error loading TripKits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTripKits();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, loadTripKits]);

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

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                Please sign in to view your TripKit library.
              </p>
              <Link
                href="/auth/signin?redirect=/my-tripkits"
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My TripKits</h1>
            <p className="text-gray-600">Your adventure library</p>
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
              href="/destinations"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">All Destinations</h3>
                  <p className="text-sm text-gray-600">Explore the full map</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">No TripKits Yet</h2>
                <p className="text-gray-600 mb-6">
                  Your adventure library is empty. Start exploring TripKits to build your collection!
                </p>
                <Link
                  href="/tripkits"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Browse TripKits
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600">
                You own {tripkits.length} TripKit{tripkits.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tripkits.map((tripkit) => (
                  <div key={tripkit.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                    {tripkit.cover_image_url && (
                      <div className="aspect-video w-full overflow-hidden bg-gray-200">
                        <SafeImage
                          src={tripkit.cover_image_url}
                          alt={tripkit.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-mono text-gray-500">{tripkit.code}</span>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Owned
                        </span>
                      </div>

                      <h2 className="text-xl font-bold mb-2 text-gray-900">
                        {tripkit.name}
                      </h2>

                      {tripkit.tagline && (
                        <p className="text-gray-600 text-sm italic mb-3">
                          {tripkit.tagline}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        {tripkit.destination_count && tripkit.destination_count > 0 && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {tripkit.destination_count} destinations
                          </div>
                        )}
                      </div>

                      {/* Purchase Date */}
                      {tripkit.purchased_at && (
                        <div className="text-xs text-gray-500 mb-4">
                          Purchased: {new Date(tripkit.purchased_at).toLocaleDateString()}
                        </div>
                      )}

                      <Link
                        href={`/tripkits/${tripkit.slug}/view`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                      >
                        View TripKit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
