'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

/** Display order for the homepage carousel: thematic (spooky) first, then ski, movies, seasonal, free. */
const FEATURED_TRIPKIT_CODES = [
  'TK-015', // Morbid Misdeeds
  'TK-014', // Haunted Highway
  'TK-013', // Unexplained Utah
  'TK-002', // Ski Utah Complete
  'TK-038', // Movie Madness
  'TK-VAL', // Valentine's Compendium
  'TK-000', // Meet the Guardians (free)
  'TK-005', // Secret Springs
] as const;

interface TripKitCard {
  id: string;
  name: string;
  slug: string;
  code: string;
  cover_image_url: string | null;
  price: number;
  tagline: string | null;
  destination_count: number | null;
}

export default function FeaturedTripKitsCarousel() {
  const [tripkits, setTripkits] = useState<TripKitCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tripkits')
        .select('id, name, slug, code, cover_image_url, price, tagline, destination_count')
        .in('code', [...FEATURED_TRIPKIT_CODES])
        .in('status', ['active', 'freemium']);

      if (!data?.length) {
        setTripkits([]);
        setLoading(false);
        return;
      }

      const order = FEATURED_TRIPKIT_CODES as unknown as string[];
      const sorted = [...data].sort(
        (a, b) => order.indexOf(a.code) - order.indexOf(b.code)
      ) as TripKitCard[];
      setTripkits(sorted);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Curated TripKits
          </h2>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[280px] rounded-xl bg-gray-800/60 animate-pulse overflow-hidden"
              >
                <div className="aspect-video bg-gray-700" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-20 bg-gray-700 rounded" />
                  <div className="h-4 w-24 bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tripkits.length === 0) return null;

  return (
    <section className="py-12 bg-gray-900/50" aria-label="Featured TripKits">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center text-white">
          Curated TripKits
        </h2>
        <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Thematic guides: spooky, skiing, film locations, romance, and more.
        </p>

        <div className="relative">
          <div
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {tripkits.map((tk) => (
              <Link
                key={tk.id}
                href={`/tripkits/${tk.slug}`}
                className="group flex-shrink-0 w-[280px] snap-center rounded-xl bg-gray-800 border border-gray-700 overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
              >
                <div className="aspect-video w-full overflow-hidden bg-gray-700 relative">
                  {tk.cover_image_url ? (
                    <Image
                      src={tk.cover_image_url}
                      alt={tk.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="280px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-4xl">
                      🗺️
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{tk.code}</span>
                    <span className="text-sm font-bold text-green-400">
                      {tk.price === 0
                        ? tk.code === 'TK-000'
                          ? 'FREE'
                          : 'FREE'
                        : `$${tk.price.toFixed(2)}`}
                    </span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {tk.name}
                  </h3>
                  {tk.tagline && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {tk.tagline}
                    </p>
                  )}
                  {tk.destination_count != null && tk.destination_count > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {tk.destination_count} destination{tk.destination_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/tripkits"
            className="inline-block text-blue-400 font-semibold hover:text-blue-300 transition-colors"
          >
            View all TripKits →
          </Link>
        </div>
      </div>
    </section>
  );
}
