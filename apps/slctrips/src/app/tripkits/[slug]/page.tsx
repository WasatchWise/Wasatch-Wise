import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
import { TripKit } from '@/types/database.types';
import { Destination } from '@/lib/types';
import DestinationCard from '@/components/DestinationCard';
import SafeImage from '@/components/SafeImage';
import GuardianIntroduction from '@/components/GuardianIntroduction';
import ReserveNowButton from '@/components/ReserveNowButton';
import TripKitPurchaseButton from '@/components/TripKitPurchaseButton';
import GiftPurchaseButton from '@/components/GiftPurchaseButton';
import SchemaMarkup, { generateTripKitSchema, generateBreadcrumbSchema } from '@/components/SchemaMarkup';
import InstructionalDesign from '@/components/InstructionalDesign';
import { getLearningObjectives } from '@/data/tripkit-learning-objectives';
import { normalizeImageSrc } from '@/lib/normalizeImageSrc';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function getGuardianImagePath(county: string | null): string {
  if (!county?.trim()) return '/images/default-guardian.webp';
  const base = county.replace(/\s*County$/i, '').trim().toUpperCase().replace(/\s+/g, ' ');
  return `/images/guardians/${base}.png`;
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: tripkit } = await supabase
    .from('tripkits')
    .select('name, slug, description, tagline, cover_image_url, price, code')
    .eq('slug', params.slug)
    .single();

  if (!tripkit) {
    return {
      title: 'TripKit Not Found | SLCTrips',
      description: 'The TripKit you are looking for could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';
  const title = `${tripkit.name} | SLCTrips TripKits`;
  const description = tripkit.description || tripkit.tagline || `Digital guidebook: ${tripkit.name}`;

  return {
    title,
    description,
    openGraph: {
      title: `${tripkit.name} | SLCTrips`,
      description,
      type: 'website',
      locale: 'en_US',
      url: `${baseUrl}/tripkits/${tripkit.slug}`,
      siteName: 'SLCTrips',
      images: tripkit.cover_image_url ? [
        {
          url: tripkit.cover_image_url,
          width: 1200,
          height: 630,
          alt: tripkit.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tripkit.name} | SLCTrips`,
      description,
      images: tripkit.cover_image_url ? [tripkit.cover_image_url] : [],
    },
    alternates: {
      canonical: `${baseUrl}/tripkits/${tripkit.slug}`,
    },
  };
}

export default async function TripKitDetailPage({ params }: { params: { slug: string } }) {
  // Fetch TripKit
  const { data: tripkit } = await supabase
    .from('tripkits')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!tripkit || (tripkit.status !== 'active' && tripkit.status !== 'freemium')) {
    notFound();
  }

  const tk = tripkit as TripKit;

  // Fetch destinations in this TripKit
  const { data: tripkitDestinations } = await supabase
    .from('tripkit_destinations')
    .select('destination_id')
    .eq('tripkit_id', tk.id);

  const destinationIds = (tripkitDestinations ?? []).map(td => td.destination_id);

  let destinations: Destination[] = [];
  if (destinationIds.length > 0) {
    const { data } = await supabase
      .from('public_destinations')
      .select('*')
      .in('id', destinationIds);

    // CRITICAL: Sanitize destinations before passing to components
    const { sanitizeDestinations } = await import('@/lib/sanitizeDestination');
    destinations = sanitizeDestinations((data as Destination[] | null) ?? []);
  }

  // Sample destination for "full write-up" (first with content; show full value before purchase)
  const sampleDestination = destinations.length > 0 ? destinations[0] : null;

  type GuardianIntroRow = { id: string; display_name: string; county: string; animal_type: string; backstory: string | null; personality: string | null };
  let sampleGuardian: GuardianIntroRow | null = null;
  if (sampleDestination?.county) {
    const { data: g } = await supabase
      .from('guardians')
      .select('id, display_name, county, animal_type, backstory, personality')
      .ilike('county', sampleDestination.county)
      .maybeSingle();
    sampleGuardian = g as GuardianIntroRow | null;
  }

  // Fetch deep dive stories for this TripKit (support both TK-XXX and TKE-XXX formats)
  const tkeCode = tk.code.replace('TK-', 'TKE-');
  const { data: stories } = await supabase
    .from('deep_dive_stories')
    .select('id, slug, title, subtitle, summary, reading_time_minutes, featured_image_url')
    .or(`tripkit_id.eq.${tk.code},tripkit_id.eq.${tkeCode}`)
    .order('published_at', { ascending: false })
    .limit(5);

  // Get learning objectives for this TripKit
  const learningObjectives = getLearningObjectives(tk.code);

  // Generate Schema.org structured data for SEO (LearningResource + Product)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slctrips.com';
  const tripkitSchema = generateTripKitSchema({
    name: tk.name,
    slug: tk.slug,
    description: tk.description || tk.tagline || `Digital guidebook: ${tk.name}`,
    cover_image_url: tk.cover_image_url,
    price: tk.price || 0,
    code: tk.code,
    destination_count: tk.destination_count || 0,
    estimated_time: tk.estimated_time,
    learning_objectives: learningObjectives.length > 0 ? learningObjectives : null,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'TripKits', url: `${baseUrl}/tripkits` },
    { name: tk.name, url: `${baseUrl}/tripkits/${tk.slug}` },
  ]);

  return (
    <>
      {/* Schema.org Structured Data (LearningResource + Product) */}
      <SchemaMarkup schema={tripkitSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <section className="relative mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {tk.cover_image_url && (
                <div className="w-full h-96 rounded-xl overflow-hidden">
                  <SafeImage
                    src={tk.cover_image_url}
                    alt={tk.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded">
                    {tk.code}
                  </span>
                  {tk.tier && tk.tier !== 'free' && (
                    <span className="text-xs uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                      {tk.tier}
                    </span>
                  )}
                  {tk.code === 'TK-045' && (
                    <span className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full font-semibold animate-pulse">
                      🚀 Growing to 250 • 25 Live • New Weekly
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">{tk.name}</h1>

                {tk.tagline && (
                  <p className="text-2xl text-gray-600 italic">
                    {tk.tagline}
                  </p>
                )}

                {tk.description && (
                  <p className="text-lg text-gray-700">
                    {tk.description}
                  </p>
                )}

                {tk.value_proposition && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-700">{tk.value_proposition}</p>
                  </div>
                )}

                {tk.code === 'TK-045' && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Our Journey to 250</h3>
                    <div className="w-full bg-gray-200 rounded-full h-6 mb-4 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-6 rounded-full flex items-center justify-start px-3 transition-all duration-500" style={{ width: '10%' }}>
                        <span className="text-xs text-white font-bold whitespace-nowrap">25/250</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      We're launching with <strong className="text-blue-700">25 hand-verified destinations</strong> -
                      the absolute best budget experiences in Utah. New destinations added
                      <strong className="text-purple-700"> every week</strong> as we build to 250.
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">What you get:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>25 destinations available now</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Automatic access to all future destinations (no extra charge)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>4-5 new verified adventures added weekly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Founder pricing locked forever</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      Purchase now to lock in early pricing and watch your collection grow to 250 by Spring 2026.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {tk.destination_count > 0 && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">
                        {tk.destination_count} destination{tk.destination_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {tk.estimated_time && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{tk.estimated_time}</span>
                    </div>
                  )}
                  {tk.states_covered && tk.states_covered.length > 0 && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span>{tk.states_covered.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {tk.features && tk.features.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-bold text-lg mb-3 text-gray-900">What&apos;s Included:</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {tk.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What You'll Learn - Instructional Design */}
                <InstructionalDesign
                  tripkitName={tk.name}
                  destinationCount={tk.destination_count || 0}
                  estimatedTime={tk.estimated_time}
                  learningObjectives={learningObjectives.length > 0 ? learningObjectives : null}
                />
              </div>
            </div>

            {/* Right Column - Reservation Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                {(tk.price === 0 || tk.status === 'freemium') ? (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        FREE FOREVER
                      </div>
                      <p className="text-gray-700 font-semibold mb-1">Lifetime Access</p>
                      <p className="text-sm text-gray-500">No signup required</p>
                    </div>

                    {tk.code === 'TK-000' && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                        <div className="text-xs font-semibold text-blue-900 mb-1">LIVING DOCUMENT</div>
                        <div className="text-xs text-gray-700">This TripKit grows over time with new destinations and content</div>
                      </div>
                    )}

                    <Link
                      href={`/tripkits/${tk.slug}/view`}
                      className="block w-full bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-800 transition-all hover:-translate-y-1 shadow-lg text-center"
                    >
                      🚀 Start Exploring Now
                    </Link>

                    <div className="text-center text-sm text-gray-500 space-y-1">
                      <p>✓ {tk.destination_count} destinations</p>
                      <p>✓ No expiration date</p>
                      <p>✓ Track your progress</p>
                      {tk.code === 'TK-000' && <p>✓ Continuous updates</p>}
                    </div>

                    {tk.code === 'TK-000' && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Privacy-first • We never sell your data</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        ${tk.price.toFixed(2)}
                      </div>
                      <p className="text-gray-600 font-semibold">One-time purchase • Lifetime access</p>
                    </div>

                    <TripKitPurchaseButton
                      tripkitId={tk.id}
                      tripkitName={tk.name}
                      tripkitCode={tk.code}
                      price={tk.price}
                      slug={tk.slug}
                      isFree={false}
                      className="w-full"
                    />

                    <GiftPurchaseButton
                      tripkitId={tk.id}
                      tripkitName={tk.name}
                      tripkitCode={tk.code}
                      price={tk.price}
                      slug={tk.slug}
                      className="w-full"
                    />

                    <div className="text-center text-sm text-gray-500 space-y-1">
                      <p>✓ {tk.destination_count} destinations</p>
                      <p>✓ After purchase you&apos;ll get instant access via email with your unique code</p>
                      <p>✓ Lifetime updates included</p>
                      <p>✓ Secure payment via Stripe</p>
                    </div>

                    {/* Backup: Reserve button for not-ready TripKits */}
                    {/* <ReserveNowButton
                      item={{ id: tk.id, name: tk.name, price: tk.price }}
                      itemType="tripkit"
                    /> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* What is a TripKit? Section - Only for TK-000 */}
        {tk.code === 'TK-000' && (
          <section className="mb-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
              What is a TripKit?
            </h2>
            <div className="max-w-3xl mx-auto text-center mb-8">
              <p className="text-lg text-gray-700 mb-4">
                A TripKit is your complete adventure guide—combining destinations, stories,
                insider tips, and curated experiences into one beautifully organized package.
              </p>
              <p className="text-gray-600">
                Think of it as a living guidebook that grows over time, designed to help you
                explore with purpose and discover the stories that make each place special.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-bold mb-2 text-gray-900">Curated Content</h3>
                <p className="text-sm text-gray-600">Hand-selected destinations and verified stories</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="font-bold mb-2 text-gray-900">Living Document</h3>
                <p className="text-sm text-gray-600">Grows over time with new content and updates</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold mb-2 text-gray-900">Purpose-Built</h3>
                <p className="text-sm text-gray-600">Each kit has a theme, story, or learning goal</p>
              </div>
            </div>

            <div className="text-center border-t border-blue-200 pt-6">
              <p className="text-sm text-gray-600 mb-3">
                <strong className="text-blue-900">TK-000 is your FREE introduction</strong> to how TripKits work—
                a <strong className="text-orange-600">$50 value</strong> showing you the quality and depth you can expect.
              </p>
              <Link
                href="/tripkits"
                className="inline-block text-blue-600 hover:text-blue-800 font-semibold bg-white px-6 py-3 rounded-lg border-2 border-blue-300 hover:border-blue-500 transition-all"
              >
                Explore Our Other TripKits →
              </Link>
            </div>
          </section>
        )}

        {/* Deep Dive Stories Section */}
        {stories && stories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Deep Dive Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stories.map(story => (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  {story.featured_image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-gray-200">
                      <SafeImage
                        src={story.featured_image_url}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                      {story.title}
                    </h3>
                    {story.subtitle && (
                      <p className="text-gray-600 mb-3 text-sm italic">
                        {story.subtitle}
                      </p>
                    )}
                    {story.summary && (
                      <p className="text-gray-700 line-clamp-2 mb-3">
                        {story.summary}
                      </p>
                    )}
                    {story.reading_time_minutes && (
                      <div className="text-sm text-gray-500">
                        {story.reading_time_minutes} min read
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Sample from this TripKit — ONE full destination write-up so visitors see value before purchase */}
        {sampleDestination && (
          <section className="mb-12">
            <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 overflow-hidden">
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Sample from this TripKit</h2>
                <p className="text-gray-600 text-sm">
                  This is what every destination in this TripKit looks like. Purchase to unlock all {tk.destination_count} destinations.
                </p>
              </div>
              {/* Hero */}
              <div className="relative h-[40vh] min-h-[240px] w-full overflow-hidden bg-gray-200">
                {(() => {
                  const raw = normalizeImageSrc(sampleDestination.image_url);
                  const heroSrc = raw?.includes('maps.googleapis.com') ? `/api/image-proxy?url=${encodeURIComponent(raw)}` : raw;
                  if (!heroSrc) return null;
                  return (
                    <>
                      <Image src={heroSrc} alt={sampleDestination.name} fill className="object-cover" sizes="100vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    </>
                  );
                })()}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full mb-2">
                    {sampleDestination.subcategory || 'Destination'}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{sampleDestination.name}</h3>
                  {((sampleDestination.drive_minutes === 0 || sampleDestination.distance_miles === 0) || (sampleDestination.drive_minutes != null && sampleDestination.drive_minutes > 0) || (sampleDestination.distance_miles != null && sampleDestination.distance_miles > 0)) && (
                    <p className="text-white/90 mt-1">
                      {sampleDestination.drive_minutes === 0 || sampleDestination.distance_miles === 0
                        ? 'At SLC Airport'
                        : (() => {
                            const parts: string[] = [];
                            if (sampleDestination.drive_minutes != null && sampleDestination.drive_minutes > 0) parts.push(`${Math.floor(sampleDestination.drive_minutes / 60)}h ${sampleDestination.drive_minutes % 60}m from SLC`);
                            if (sampleDestination.distance_miles != null && sampleDestination.distance_miles > 0) parts.push(`${Math.round(sampleDestination.distance_miles)} mi`);
                            return parts.join(' • ');
                          })()}
                    </p>
                  )}
                </div>
              </div>
              {/* Body: description, Tips from Dan, Guardian */}
              <div className="p-6 bg-white">
                {(sampleDestination.description || sampleDestination.ai_summary) && (
                  <div className="prose prose-gray max-w-none mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {sampleDestination.description || sampleDestination.ai_summary}
                    </p>
                  </div>
                )}
                {sampleDestination.ai_tips && (() => {
                  let tips: string[] = [];
                  try {
                    if (typeof sampleDestination.ai_tips === 'string') {
                      const parsed = JSON.parse(sampleDestination.ai_tips);
                      tips = Array.isArray(parsed) ? parsed : [parsed];
                    } else if (Array.isArray(sampleDestination.ai_tips)) {
                      tips = sampleDestination.ai_tips;
                    } else {
                      tips = [String(sampleDestination.ai_tips)];
                    }
                  } catch {
                    tips = [String(sampleDestination.ai_tips)];
                  }
                  const safeTips = tips.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);
                  if (safeTips.length === 0) return null;
                  return (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">💡 Tips from Dan</h4>
                      <ul className="space-y-1">
                        {safeTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <span className="text-yellow-600 font-bold mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
                {sampleGuardian != null && (() => {
                  const g: GuardianIntroRow = sampleGuardian;
                  return (
                    <div className="mt-6">
                      <GuardianIntroduction
                        guardian={{
                          display_name: g.display_name,
                          county: g.county,
                          animal_type: g.animal_type,
                          backstory: g.backstory,
                          personality: g.personality
                        }}
                        destination={{
                          name: sampleDestination.name,
                          subcategory: sampleDestination.subcategory || '',
                          description: sampleDestination.description || sampleDestination.ai_summary || null
                        }}
                        guardianImagePath={getGuardianImagePath(sampleDestination.county)}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>
        )}

        {/* More destinations — preview cards (excluding the sample) */}
        {destinations.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-2 text-gray-900">
              {sampleDestination ? 'More destinations in this TripKit' : 'Sample Destinations'}
            </h2>
            <p className="text-gray-600 mb-6">
              {sampleDestination
                ? `Purchase to unlock all ${tk.destination_count} destinations with full write-ups, Tips from Dan, and more.`
                : `A preview of what's included. Purchase to unlock all ${tk.destination_count} destinations.`}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(sampleDestination ? destinations.filter(d => d.id !== sampleDestination.id).slice(0, 3) : destinations.slice(0, 3)).map(d => (
                <DestinationCard key={d.id} d={d} />
              ))}
            </div>
            {destinations.length > (sampleDestination ? 4 : 3) && (
              <div className="mt-8 text-center">
                <div className="inline-block bg-gray-100 rounded-lg px-8 py-6">
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    + {destinations.length - (sampleDestination ? 4 : 3)} more destinations in this TripKit
                  </p>
                  <p className="text-sm text-gray-500">
                    Purchase this TripKit to unlock the complete collection
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {destinations.length === 0 && (
          <section className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Destinations for this TripKit are being curated. Check back soon!
            </p>
          </section>
        )}

        {/* Back to TripKits */}
        <div className="mt-12 text-center">
          <Link href="/tripkits" className="text-blue-600 hover:underline">
            ← Back to all TripKits
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
