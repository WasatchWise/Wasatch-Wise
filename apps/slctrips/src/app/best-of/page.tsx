'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { sanitizeDestinations } from '@/lib/sanitizeDestination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DansScore from '@/components/DansScore';
import SafeImage from '@/components/SafeImage';

interface TopDestination {
  id: string;
  name: string;
  slug: string;
  subcategory: string;
  category: string;
  popularity_score: number;
  image_url: string | null;
  contact_info: any;
  is_featured: boolean;
}

interface CategoryRanking {
  category: string;
  emoji: string;
  count: number;
  topDestination: TopDestination | null;
  avgScore: number;
}

export default function BestOfPage() {
  const [categories, setCategories] = useState<CategoryRanking[]>([]);
  const [topOverall, setTopOverall] = useState<TopDestination[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBestOf = useCallback(async () => {
    try {
      // Get top 10 overall destinations
      const { data: overall, error: overallError } = await supabase
        .from('public_destinations')
        .select('*')
        .not('popularity_score', 'is', null)
        .gt('popularity_score', 0)
        .order('popularity_score', { ascending: false })
        .limit(10);

      if (!overallError && overall) {
        // CRITICAL: Sanitize destinations before using them
        setTopOverall(sanitizeDestinations(overall));
      }

      // Get category statistics
      const { data: allScored, error: scoredError } = await supabase
        .from('public_destinations')
        .select('subcategory, popularity_score, name, slug, category, image_url, contact_info, is_featured, id')
        .not('popularity_score', 'is', null)
        .gt('popularity_score', 0);

      if (!scoredError && allScored) {
        // Group by subcategory
        const categoryMap = new Map<string, TopDestination[]>();

        // CRITICAL: Sanitize destinations before processing
        const sanitizedScored = sanitizeDestinations(allScored);
        
        sanitizedScored.forEach((dest: TopDestination) => {
          const subcat = dest.subcategory || 'Other';
          if (!categoryMap.has(subcat)) {
            categoryMap.set(subcat, []);
          }
          categoryMap.get(subcat)!.push(dest);
        });

        // Calculate stats for each category
        const categoryStats: CategoryRanking[] = [];
        categoryMap.forEach((destinations, category) => {
          const sorted = destinations.sort((a, b) => b.popularity_score - a.popularity_score);
          const avgScore = Math.round(
            destinations.reduce((sum, d) => sum + d.popularity_score, 0) / destinations.length
          );

          categoryStats.push({
            category,
            emoji: getCategoryEmoji(category),
            count: destinations.length,
            topDestination: sorted[0],
            avgScore
          });
        });

        // Sort by average score
        categoryStats.sort((a, b) => b.avgScore - a.avgScore);
        setCategories(categoryStats);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading Best Of data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBestOf();
  }, [loadBestOf]);

  function getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'Hiking': '🥾', 'Skiing': '⛷️', 'National Park': '🏞️',
      'Rock Climbing': '🧗', 'Brewery': '🍺', 'Coffee': '☕',
      'Swimming': '🏊', 'Camping': '⛺', 'Mountain Biking': '🚵',
      'Scenic Drive': '🚗', 'Restaurant': '🍽️', 'Hot Spring': '♨️',
      'Lake': '🏊', 'Waterfall': '💧', 'Ghost Town': '👻',
      'State Park': '🏕️', 'Museum': '🏛️', 'Golf': '⛳'
    };
    return emojiMap[category] || '📍';
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {/* Hero Section */}
        <section className="relative py-20 text-center overflow-hidden border-b border-gray-800">
          <div className="absolute inset-0 bg-gradient-radial from-yellow-600/20 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="inline-flex items-center gap-3 mb-6 bg-yellow-500/20 border border-yellow-500 px-6 py-3 rounded-full">
              <span className="text-4xl">🏆</span>
              <span className="text-yellow-400 font-bold text-lg">Dan&apos;s Best Of Lists</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Utah&apos;s Top-Rated Destinations
            </h1>
            <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Ranked by Dan&apos;s Score—a composite quality rating powered by Google and Yelp reviews
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Every destination is scored 0-100 based on ratings, review volume, and real visitor experiences
            </p>
          </div>
        </section>

        {/* Top 10 Overall */}
        <section className="py-16 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">🌟 Top 10 Destinations in Utah</h2>
              <p className="text-gray-400 text-lg">The highest-rated adventures across all categories</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto space-y-4">
                {topOverall.map((dest, index) => (
                  <Link
                    key={dest.id}
                    href={`/destinations/${dest.slug}`}
                    className="group flex items-center gap-4 bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-yellow-500 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-gray-900 font-bold text-2xl">
                      #{index + 1}
                    </div>

                    {dest.image_url && (
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-700">
                        <SafeImage
                          src={dest.image_url}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                        {getCategoryEmoji(dest.subcategory)} {dest.name}
                      </h3>
                      <p className="text-gray-400 mb-2">{dest.subcategory || 'Destination'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {dest.contact_info?.google_rating && (
                          <span>⭐ {dest.contact_info.google_rating}/5.0</span>
                        )}
                        {dest.contact_info?.google_reviews && (
                          <span>📝 {dest.contact_info.google_reviews.toLocaleString()} reviews</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <DansScore score={dest.popularity_score} size="lg" showLabel={true} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Category Rankings */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">📊 Browse by Category</h2>
              <p className="text-gray-400 text-lg">Explore top-rated destinations in each category</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {categories.map((cat) => (
                  <Link
                    key={cat.category}
                    href={`/best-of/${(cat.category || '').toLowerCase().replace(/\s+/g, '-')}`}
                    className="group bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 hover:-translate-y-2 transition-all duration-300"
                  >
                    {cat.topDestination?.image_url && (
                      <div className="aspect-video w-full overflow-hidden bg-gray-700">
                        <SafeImage
                          src={cat.topDestination.image_url}
                          alt={cat.topDestination.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">
                          {cat.emoji} {cat.category}
                        </h3>
                        <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                          {cat.count} rated
                        </span>
                      </div>

                      {cat.topDestination && (
                        <div className="mb-4 pb-4 border-b border-gray-700">
                          <p className="text-sm text-gray-500 mb-1">Top Pick:</p>
                          <p className="font-semibold text-white">{cat.topDestination.name}</p>
                          <div className="mt-2">
                            <DansScore
                              score={cat.topDestination.popularity_score}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Avg Score: {cat.avgScore}/100</span>
                        <span className="text-blue-400 group-hover:text-blue-300">View Rankings →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-t border-gray-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">Want to explore by drive time?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Find adventures organized by how far you want to drive from SLC Airport
            </p>
            <Link
              href="/destinations"
              className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all hover:-translate-y-1 shadow-lg"
            >
              Browse All Destinations →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
