import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { TripKit } from '@/types/database.types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'TripKits - Curated Adventure Packages | SLCTrips',
  description: 'Explore our collection of curated adventure packages for Utah and the Mountain West. Each TripKit includes destinations, insider tips, and everything you need for an unforgettable journey.',
  openGraph: {
    title: 'TripKits - Curated Adventure Packages | SLCTrips',
    description: 'Explore our collection of curated adventure packages for Utah and the Mountain West. Each TripKit includes destinations, insider tips, and everything you need for an unforgettable journey.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.slctrips.com/tripkits',
    siteName: 'SLCTrips',
    images: [
      {
        url: 'https://www.slctrips.com/images/og-tripkits.png',
        width: 1200,
        height: 630,
        alt: 'SLCTrips TripKits - Curated Adventure Packages',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripKits - Curated Adventure Packages | SLCTrips',
    description: 'Explore our collection of curated adventure packages for Utah and the Mountain West.',
  },
  alternates: {
    canonical: 'https://www.slctrips.com/tripkits',
  },
};

export default async function TripKitsPage() {
  const { data } = await supabase
    .from('tripkits')
    .select('*')
    .in('status', ['active', 'freemium'])
    .order('code', { ascending: true });

  const tripkits = (data as TripKit[] | null) ?? [];

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">
        <section className="text-center space-y-4 py-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">
            TripKits by SLCTrips
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Curated adventure packages for exploring Utah and the Mountain West.
            Each TripKit includes destinations, insider tips, and everything you need for an unforgettable journey.
          </p>
        </section>

        <section className="mt-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tripkits.map((tk) => (
              <Link
                key={tk.id}
                href={`/tripkits/${tk.slug}`}
                data-testid="tripkit-card"
                className="group flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden h-full"
              >
                {tk.cover_image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-gray-200 flex-shrink-0 relative">
                    <Image
                      src={tk.cover_image_url}
                      alt={tk.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-gray-700">{tk.code}</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {tk.price === 0 ? (tk.code === 'TK-000' ? 'FREE FOREVER' : 'FREE') : `$${tk.price.toFixed(2)}`}
                      </div>
                      {tk.code === 'TK-000' && tk.price === 0 && (
                        <div className="text-xs text-gray-700">Email required</div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tk.name}
                  </h2>

                  {tk.tagline && (
                    <p className="text-gray-600 mb-3 text-sm italic">
                      {tk.tagline}
                    </p>
                  )}

                  {tk.code === 'TK-000' && (
                    <div className="bg-blue-50 border border-blue-100 rounded px-2 py-1 mb-2 inline-block">
                      <span className="text-xs font-semibold text-blue-900">For Educators</span>
                    </div>
                  )}

                  {tk.description && (
                    <p className="text-gray-700 line-clamp-3 mb-4 flex-grow">
                      {tk.description}
                    </p>
                  )}

                  <div className="space-y-1 mt-auto pt-2 border-t border-gray-100">
                    {tk.destination_count && tk.destination_count > 0 && (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {tk.destination_count} destination{tk.destination_count !== 1 ? 's' : ''}
                      </div>
                    )}
                    {tk.code === 'TK-000' && (
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Living document • Grows over time
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {tripkits.length === 0 && (
            <div className="text-center py-12 text-gray-700">
              <p className="text-xl">No TripKits available yet. Check back soon!</p>
            </div>
          )}
        </section>

        <section className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">What is a TripKit?</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            A TripKit is your complete guide to a themed adventure. Each kit includes carefully selected
            destinations, insider tips, recommended routes, and everything you need to make the most of your journey.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
