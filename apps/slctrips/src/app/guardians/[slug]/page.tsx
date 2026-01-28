import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DestinationCard from '@/components/DestinationCard';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import GuardianProgressTracker from '@/components/GuardianProgressTracker';

type Params = { params: { slug: string } };

interface Guardian {
  id: string;
  codename: string;
  display_name: string;
  county: string | null;
  animal_type: string | null;
  archetype: string | null;
  element: string;
  motto: string;
  bio: string;
  abilities: string | null;
  personality: string | null;
  backstory: string | null;
  colorway: string | null;
  image_url: string | null;
  avatar_url: string | null;
  image_url_transparent: string | null;
  voice_formality: number | null;
  voice_humor: number | null;
  voice_mysticism: number | null;
  voice_brevity: number | null;
  themes: string[] | null;
}

interface Destination {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  description: string | null;
  image_url: string | null;
  featured: boolean;
  trending: boolean;
  ai_summary: string | null;
  popularity_score: number | null;
  county: string | null;
  region: string | null;
  pet_allowed: boolean | null;
  is_family_friendly: boolean | null;
  latitude: number | null;
  longitude: number | null;
  state_code: string | null;
  contact_info: any | null;
  photo_gallery: any | null;
  video_url: string | null;
  accessibility_rating: number | null;
  place_id: string;
  hotel_recommendations: any[];
  tour_recommendations: any[];
  ai_tips: string | null;
  ai_story: string | null;
}

function getGuardianImagePath(county: string | null, codename: string, type: 'card' | 'hero' = 'hero'): string {
  if (!county) return '/images/default-guardian.webp';
  // Use the Guardians - Transparent directory with county name
  return `/images/Guardians - Transparent/${county.toUpperCase()}.png`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = params.slug;

  // Convert slug to county name
  const slugToCountyName = slug.replace(/-/g, ' ');
  const countyNameWithSuffix = slugToCountyName.toLowerCase().endsWith(' county')
    ? slugToCountyName
    : `${slugToCountyName} County`;

  // Fetch guardian data
  const { data: guardianData } = await supabase
    .from('guardians')
    .select('*')
    .ilike('county', countyNameWithSuffix)
    .maybeSingle();

  const guardian = guardianData as Guardian | null;

  if (!guardian) {
    return {
      title: 'Guardian Not Found | SLCTrips',
      description: 'The guardian you are looking for could not be found.',
    };
  }

  // Get destination count for this county
  const { count } = await supabase
    .from('public_destinations')
    .select('*', { count: 'exact', head: true })
    .eq('county', guardian.county);

  const destinationCount = count || 0;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com';
  const url = `${baseUrl}/guardians/${slug}`;

  const title = `${guardian.display_name} - Guardian of ${guardian.county} | SLCTrips`;
  const description = guardian.bio?.substring(0, 160) ||
    `Meet ${guardian.display_name}, the ${guardian.animal_type} guardian of ${guardian.county}, Utah. Discover ${destinationCount} destinations in this mystical land.`;

  return {
    title,
    description,
    openGraph: {
      title: `${guardian.display_name} | SLCTrips Mt. Olympians`,
      description,
      images: guardian.image_url ? [
        {
          url: guardian.image_url,
          width: 1200,
          height: 630,
          alt: guardian.display_name,
        }
      ] : [],
      type: 'website',
      locale: 'en_US',
      url,
      siteName: 'SLCTrips',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${guardian.display_name} | SLCTrips`,
      description,
      images: guardian.image_url ? [guardian.image_url] : [],
    },
    alternates: {
      canonical: url,
    },
    keywords: [
      guardian.display_name,
      guardian.codename,
      guardian.county || '',
      'Utah guardian',
      'Mt. Olympian',
      guardian.animal_type || '',
      guardian.archetype || '',
      'Utah destinations',
      'Utah travel',
      'Salt Lake City trips',
    ].filter(Boolean),
  };
}

export default async function GuardianDetail({ params }: Params) {
  const slug = params.slug;

  // Convert slug to county name (e.g., "tooele-county" or "tooele" → "Tooele County")
  // Try both with and without " County" suffix
  const slugToCountyName = slug.replace(/-/g, ' ');
  const countyNameWithSuffix = slugToCountyName.toLowerCase().endsWith(' county')
    ? slugToCountyName
    : `${slugToCountyName} County`;

  // Try to find guardian by county slug
  const { data: guardianData } = await supabase
    .from('guardians')
    .select('*')
    .ilike('county', countyNameWithSuffix)
    .maybeSingle();

  const guardian = guardianData as Guardian | null;

  if (!guardian) {
    notFound();
  }

  // Get all destinations for this county
  const { data: destinationsData } = await supabase
    .from('public_destinations')
    .select('*')
    .eq('county', guardian.county)
    .order('name');

  // CRITICAL: Sanitize destinations before using them
  const { sanitizeDestinations } = await import('@/lib/sanitizeDestination');
  const destinations = sanitizeDestinations((destinationsData as Destination[]) || []);

  // Get county profile for this county
  const { data: countyProfileData } = await supabase
    .from('county_profiles')
    .select('*')
    .eq('county_name', guardian.county)
    .maybeSingle();

  const countyProfile = countyProfileData as any;

  // Get unique categories and subcategories for this county
  const categories = Array.from(new Set(destinations.map(d => d.category).filter(Boolean)));
  const subcategories = Array.from(new Set(destinations.map(d => d.subcategory).filter(Boolean)));

  const heroImage = getGuardianImagePath(guardian.county, guardian.codename, 'hero');

  return (
    <>
      <Header />
      <GuardianProgressTracker guardianId={guardian.id} county={guardian.county} />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <SafeImage
              src={heroImage}
              alt={guardian.display_name}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
          </div>

          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-16">
              <div className="max-w-4xl">
                <div className="mb-4 flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-full">
                    {guardian.element}
                  </span>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                    {destinations.length} Destinations
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-white drop-shadow-2xl">
                  {guardian.display_name}
                </h1>

                {guardian.county && (
                  <p className="text-2xl md:text-3xl text-white/90 font-semibold mb-6 drop-shadow-lg">
                    Guardian of {guardian.county}
                  </p>
                )}

                {guardian.animal_type && guardian.archetype && (
                  <p className="text-xl text-blue-300 font-semibold mb-4">
                    {guardian.animal_type} • {guardian.archetype}
                  </p>
                )}

                {guardian.motto && (
                  <p className="text-xl md:text-2xl italic text-yellow-300 font-medium mb-6 border-l-4 border-yellow-400 pl-6 drop-shadow-lg">
                    "{guardian.motto}"
                  </p>
                )}

                {guardian.bio && (
                  <p className="text-lg text-white/95 leading-relaxed max-w-3xl drop-shadow-md">
                    {guardian.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Guardian Dossier Section */}
        {(guardian.animal_type || guardian.archetype || guardian.abilities || guardian.personality || guardian.backstory) && (
        <section className="py-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Guardian Dossier
                </h2>
                <p className="text-xl text-purple-200">
                  Official Record • TK-000: Meet the Mt. Olympians
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Classification */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
                    <span className="text-3xl">📋</span>
                    Classification
                  </h3>
                  <div className="space-y-4">
                    {guardian.animal_type && (
                      <div>
                        <div className="text-sm text-purple-300 font-semibold mb-1">Form</div>
                        <div className="text-lg text-white">{guardian.animal_type}</div>
                      </div>
                    )}
                    {guardian.archetype && (
                      <div>
                        <div className="text-sm text-purple-300 font-semibold mb-1">Archetype</div>
                        <div className="text-lg text-white">{guardian.archetype}</div>
                      </div>
                    )}
                    {guardian.element && (
                      <div>
                        <div className="text-sm text-purple-300 font-semibold mb-1">Element</div>
                        <div className="text-lg text-white">{guardian.element}</div>
                      </div>
                    )}
                    {guardian.codename && (
                      <div>
                        <div className="text-sm text-purple-300 font-semibold mb-1">Codename</div>
                        <div className="text-lg text-white">{guardian.codename}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Abilities */}
                {guardian.abilities && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                      <span className="text-3xl">⚡</span>
                      Abilities
                    </h3>
                    <p className="text-white text-lg leading-relaxed">
                      {guardian.abilities}
                    </p>
                  </div>
                )}

                {/* Personality */}
                {guardian.personality && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
                      <span className="text-3xl">🎭</span>
                      Personality
                    </h3>
                    <p className="text-white text-lg leading-relaxed">
                      {guardian.personality}
                    </p>
                  </div>
                )}

                {/* Backstory */}
                {guardian.backstory && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-orange-400 mb-6 flex items-center gap-3">
                      <span className="text-3xl">📜</span>
                      Backstory
                    </h3>
                    <p className="text-white text-lg leading-relaxed">
                      {guardian.backstory}
                    </p>
                  </div>
                )}
              </div>

              {/* County Context Banner */}
              <div className="mt-12 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Guardian of {guardian.county} County
                </h3>
                <p className="text-purple-100 text-lg">
                  Protector of the land, embodiment of the spirit, keeper of the stories
                </p>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* County Profile Section - Rich Wikipedia-style Info */}
        {countyProfile && (
          <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                    About {countyProfile.county_name}
                  </h2>
                  <p className="text-xl text-gray-600">
                    Your guide to understanding this unique region of Utah
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {countyProfile.county_seat && (
                    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow">
                      <div className="text-4xl mb-3">🏛️</div>
                      <div className="text-sm text-gray-600 mb-1">County Seat</div>
                      <div className="text-xl font-bold text-blue-600">{countyProfile.county_seat}</div>
                    </div>
                  )}
                  {countyProfile.population && (
                    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow">
                      <div className="text-4xl mb-3">👥</div>
                      <div className="text-sm text-gray-600 mb-1">Population ({countyProfile.population_year})</div>
                      <div className="text-xl font-bold text-green-600">{countyProfile.population.toLocaleString()}</div>
                    </div>
                  )}
                  {countyProfile.area_sq_miles && (
                    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-shadow">
                      <div className="text-4xl mb-3">📏</div>
                      <div className="text-sm text-gray-600 mb-1">Area</div>
                      <div className="text-xl font-bold text-purple-600">{parseFloat(countyProfile.area_sq_miles).toLocaleString()} sq mi</div>
                    </div>
                  )}
                  {countyProfile.elevation_range && (
                    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200 hover:shadow-xl transition-shadow">
                      <div className="text-4xl mb-3">⛰️</div>
                      <div className="text-sm text-gray-600 mb-1">Elevation</div>
                      <div className="text-lg font-bold text-orange-600">{countyProfile.elevation_range}</div>
                    </div>
                  )}
                </div>

                {/* Origin & Founding */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {countyProfile.named_for && (
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                      <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
                        <span className="text-3xl">📜</span>
                        Origin of Name
                      </h3>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {countyProfile.named_for}
                      </p>
                    </div>
                  )}
                  {countyProfile.founded_date && (
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                      <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
                        <span className="text-3xl">📅</span>
                        Founded
                      </h3>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {countyProfile.founded_date}
                      </p>
                      {countyProfile.special_notes && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800 font-medium">
                            {countyProfile.special_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* County History */}
                {countyProfile.history && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8 shadow-lg border-2 border-amber-200 mb-12">
                    <h3 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                      <span className="text-4xl">📖</span>
                      County History
                    </h3>
                    <p className="text-lg text-gray-800 leading-relaxed">
                      {countyProfile.history}
                    </p>
                  </div>
                )}

                {/* Special Badges */}
                <div className="flex flex-wrap justify-center gap-4">
                  {countyProfile.is_largest_by_area && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-6 py-3 shadow-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">🏆</span>
                      Largest County by Area
                    </div>
                  )}
                  {countyProfile.is_smallest_by_area && (
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-6 py-3 shadow-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      Smallest County by Land Area
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Destinations Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Explore {guardian.county ? `${guardian.county} County` : 'This Mystical Land'}
              </h2>
              <p className="text-xl text-gray-600">
                Discover {destinations.length} amazing destination{destinations.length !== 1 ? 's' : ''} in this mystical land
              </p>

              {/* Quick Stats */}
              <div className="mt-8 flex flex-wrap justify-center gap-6">
                {categories.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md px-6 py-4">
                    <div className="text-3xl font-bold text-blue-600">{categories.length}</div>
                    <div className="text-sm text-gray-600">Drive Times</div>
                  </div>
                )}
                {subcategories.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md px-6 py-4">
                    <div className="text-3xl font-bold text-purple-600">{subcategories.length}</div>
                    <div className="text-sm text-gray-600">Activity Types</div>
                  </div>
                )}
                {destinations.filter(d => d.featured).length > 0 && (
                  <div className="bg-white rounded-lg shadow-md px-6 py-4">
                    <div className="text-3xl font-bold text-yellow-600">
                      {destinations.filter(d => d.featured).length}
                    </div>
                    <div className="text-sm text-gray-600">Featured</div>
                  </div>
                )}
              </div>
            </div>

            {destinations.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {destinations.map(destination => (
                  <DestinationCard key={destination.id} d={destination as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <p className="text-gray-600 text-lg mb-4">
                  No destinations found for {guardian.county ? `${guardian.county} County` : 'this region'} yet.
                </p>
                <p className="text-gray-500">
                  Check back soon as we continue to explore this mystical land!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Voice Characteristics (if available) */}
        {(guardian.voice_formality || guardian.voice_humor || guardian.voice_mysticism || guardian.voice_brevity) && (
          <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-bold mb-8 text-center text-gray-900">
                {guardian.codename}'s Voice
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {guardian.voice_formality !== null && (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600">{guardian.voice_formality}/10</div>
                    <div className="text-sm text-gray-600 mt-2">Formality</div>
                  </div>
                )}
                {guardian.voice_humor !== null && (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-pink-600">{guardian.voice_humor}/10</div>
                    <div className="text-sm text-gray-600 mt-2">Humor</div>
                  </div>
                )}
                {guardian.voice_mysticism !== null && (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600">{guardian.voice_mysticism}/10</div>
                    <div className="text-sm text-gray-600 mt-2">Mysticism</div>
                  </div>
                )}
                {guardian.voice_brevity !== null && (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{guardian.voice_brevity}/10</div>
                    <div className="text-sm text-gray-600 mt-2">Brevity</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Back to Mt. Olympians */}
        <section className="py-12 text-center">
          <Link
            href="/guardians"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            ← Explore Other Mt. Olympians
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
