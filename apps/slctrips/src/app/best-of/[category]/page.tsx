'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllRecords } from '@/lib/supabasePagination';
import { sanitizeDestinations } from '@/lib/sanitizeDestination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DansScore from '@/components/DansScore';
import { getYelpLink, getWebsiteLink, trackAffiliateClick } from '@/lib/affiliates';
import SafeImage from '@/components/SafeImage';

interface Destination {
  id: string;
  name: string;
  slug: string;
  subcategory: string;
  category: string;
  drive_minutes: number | null;
  distance_miles: number | null;
  popularity_score: number;
  image_url: string | null;
  description: string | null;
  contact_info: any;
  is_featured: boolean;
  is_family_friendly: boolean;
  pet_allowed: boolean;
}

const categoryEmojiMap: Record<string, string> = {
  'hiking': '🥾', 'skiing': '⛷️', 'national-park': '🏞️',
  'rock-climbing': '🧗', 'brewery': '🍺', 'coffee': '☕',
  'swimming': '🏊', 'camping': '⛺', 'mountain-biking': '🚵',
  'scenic-drive': '🚗', 'restaurant': '🍽️', 'hot-spring': '♨️',
  'lake': '🏊', 'waterfall': '💧', 'ghost-town': '👻',
  'state-park': '🏕️', 'museum': '🏛️', 'golf': '⛳',
  'distillery': '🥃', 'winery': '🍷'
};

export default function CategoryRankingPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState({
    total: 0,
    avgScore: 0,
    topScore: 0,
    avgDistance: 0
  });

  const loadCategoryRankings = useCallback(async () => {
    if (!categorySlug) return;
    try {
      // Convert slug back to category name
      const categoryName = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Fetch all destinations in this category with scores (handles pagination)
      const data = await fetchAllRecords<Destination>(
        supabase,
        'public_destinations',
        '*',
        (query) => query
          .ilike('subcategory', categoryName)
          .not('popularity_score', 'is', null)
          .gt('popularity_score', 0)
          .order('popularity_score', { ascending: false })
      );

      if (data && data.length > 0) {
        // CRITICAL: Sanitize destinations before using them
        const sanitized = sanitizeDestinations(data);
        setDestinations(sanitized);

        // Calculate stats
        const total = sanitized.length;
        const avgScore = Math.round(
          sanitized.reduce((sum, d) => sum + d.popularity_score, 0) / total
        );
        const topScore = sanitized[0].popularity_score;
        const destinationsWithDistance = sanitized.filter(d => d.distance_miles);
        const avgDistance = destinationsWithDistance.length > 0
          ? Math.round(
              destinationsWithDistance.reduce((sum, d) => sum + (d.distance_miles || 0), 0) /
              destinationsWithDistance.length
            )
          : 0;

        setCategoryStats({ total, avgScore, topScore, avgDistance });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading category rankings:', err);
      setLoading(false);
      setDestinations([]);
    }
  }, [categorySlug]);

  useEffect(() => {
    if (categorySlug) {
      loadCategoryRankings();
    }
  }, [categorySlug, loadCategoryRankings]);

  const categoryEmoji = categoryEmojiMap[categorySlug] || '📍';
  const categoryName = categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {/* Category Hero */}
        <section className="relative py-16 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <Link
              href="/best-of"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
            >
              ← Back to Best Of
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl">{categoryEmoji}</span>
              <div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Best {categoryName}
                </h1>
                <p className="text-xl text-gray-300">Ranked by Dan&apos;s Score</p>
              </div>
            </div>

            {!loading && destinations.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Rated</p>
                  <p className="text-2xl font-bold text-blue-400">{categoryStats.total}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Avg Score</p>
                  <p className="text-2xl font-bold text-yellow-400">{categoryStats.avgScore}/100</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Top Score</p>
                  <p className="text-2xl font-bold text-green-400">{categoryStats.topScore}/100</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Avg Distance</p>
                  <p className="text-2xl font-bold text-purple-400">{categoryStats.avgDistance} mi</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Rankings List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            ) : destinations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-xl mb-4">No rated destinations found in this category yet.</p>
                <Link
                  href="/best-of"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ← Back to Best Of
                </Link>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto space-y-4">
                {destinations.map((dest, index) => {
                  const hasYelp = dest.contact_info?.yelp_url;
                  const hasWebsite = dest.contact_info?.website;
                  const hasPhone = dest.contact_info?.phone;

                  return (
                    <div
                      key={dest.id}
                      className="group bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Rank Badge & Image */}
                        <div className="flex lg:flex-col items-center lg:items-start gap-4 p-6 lg:w-48">
                          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-gray-900 font-bold text-2xl">
                            #{index + 1}
                          </div>

                          {dest.image_url && (
                            <div className="w-24 h-24 lg:w-full lg:h-32 rounded-lg overflow-hidden bg-gray-700">
                              <SafeImage
                                src={dest.image_url}
                                alt={dest.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 lg:py-6 lg:px-0">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <Link
                                href={`/destinations/${dest.slug}`}
                                className="text-2xl font-bold mb-2 hover:text-yellow-400 transition-colors inline-block"
                              >
                                {dest.name}
                              </Link>

                              {dest.description && (
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                  {dest.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                                {dest.distance_miles && (
                                  <span>📍 {dest.distance_miles} mi from SLC</span>
                                )}
                                {dest.drive_minutes && (
                                  <span>🚗 {Math.round(dest.drive_minutes)} min drive</span>
                                )}
                              </div>

                              {/* Review Stats */}
                              <div className="flex flex-wrap gap-4 text-sm mb-3">
                                {dest.contact_info?.google_rating && (
                                  <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded">
                                    <span>Google:</span>
                                    <span className="font-semibold">{dest.contact_info.google_rating}/5.0</span>
                                    {dest.contact_info.google_reviews && (
                                      <span className="text-gray-500">({dest.contact_info.google_reviews.toLocaleString()})</span>
                                    )}
                                  </div>
                                )}
                                {dest.contact_info?.yelp_rating && (
                                  <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-1 rounded">
                                    <span>Yelp:</span>
                                    <span className="font-semibold">{dest.contact_info.yelp_rating}/5.0</span>
                                    {dest.contact_info.yelp_reviews && (
                                      <span className="text-gray-500">({dest.contact_info.yelp_reviews.toLocaleString()})</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2">
                                {dest.is_featured && (
                                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                                    ⭐ Featured
                                  </span>
                                )}
                                {dest.is_family_friendly && (
                                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                    👨‍👩‍👧‍👦 Family Friendly
                                  </span>
                                )}
                                {dest.pet_allowed && (
                                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                    🐕 Pet Friendly
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Score & Actions */}
                            <div className="flex lg:flex-col items-start gap-3">
                              <DansScore
                                score={dest.popularity_score}
                                size="lg"
                                showLabel={true}
                              />

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2 w-full lg:w-auto">
                                <Link
                                  href={`/destinations/${dest.slug}`}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-semibold transition-colors text-center whitespace-nowrap"
                                >
                                  View Details →
                                </Link>

                                {hasWebsite && (
                                  <a
                                    href={getWebsiteLink(dest.contact_info.website, dest.name)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackAffiliateClick('website', dest.id, dest.name)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-semibold transition-colors text-center whitespace-nowrap"
                                  >
                                    🌐 Visit Website
                                  </a>
                                )}

                                {hasYelp && (
                                  <a
                                    href={getYelpLink(dest.contact_info.yelp_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackAffiliateClick('yelp', dest.id, dest.name)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-semibold transition-colors text-center whitespace-nowrap"
                                  >
                                    📱 View on Yelp
                                  </a>
                                )}

                                {hasPhone && (
                                  <a
                                    href={`tel:${dest.contact_info.phone}`}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm font-semibold transition-colors text-center whitespace-nowrap"
                                  >
                                    📞 Call Now
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 bg-gray-800/50 border-t border-gray-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Explore More Categories</h2>
            <Link
              href="/best-of"
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all hover:-translate-y-1"
            >
              ← Back to All Best Of Lists
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
