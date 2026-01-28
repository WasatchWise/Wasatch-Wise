import { notFound } from 'next/navigation'
import { getVenueBySlug, getVenueEvents, getAllVenueSlugs } from '@/lib/supabase/queries'
import { getVenueDetails, getVenueTypeDescription, getGoogleMapsUrl, getDirectionsUrl } from '@/lib/apis/google-places'
import Container from '@/components/Container'
import Button from '@/components/Button'
import ClaimVenueButton from '@/components/ClaimVenueButton'
import SubmitShowToVenueButton from '@/components/SubmitShowToVenueButton'
import StartConversationButton from '@/components/StartConversationButton'
import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic' // Required for async params in Next.js 16

// Extended venue type to handle fields that may exist in DB but not in generated types
interface ExtendedVenue {
  id: string
  name: string
  slug: string
  address?: string | null
  city?: string | null
  state?: string | null
  website?: string | null
  capacity?: number | null
  // Fields that may exist but aren't in generated types
  image_url?: string | null
  notes?: string | null
  venue_type?: string | null
  featured?: boolean | null
  phone?: string | null
  claimed_by?: string | null
  venue_photos?: Array<{ id: string; url: string; caption?: string; is_primary?: boolean; photo_order?: number }> | null
}

type Props = {
  params: Promise<{ slug: string }>
}

// Removed generateStaticParams to allow fully dynamic rendering

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const venueData = await getVenueBySlug(slug)

  if (!venueData) {
    return {
      title: 'Venue Not Found'
    }
  }

  // Cast to extended type to access optional fields
  const venue = venueData as unknown as ExtendedVenue

  return {
    title: `${venue.name} | Salt Lake City Music Venue | The Rock Salt`,
    description: venue.notes || `${venue.name} - ${venue.city || 'Salt Lake City'} music venue. Find upcoming shows, venue info, and more on The Rock Salt.`,
  }
}

// Utah venue descriptions for places we know well
const VENUE_DESCRIPTIONS: Record<string, { vibe: string; expect: string; bestFor: string }> = {
  'urban-lounge': {
    vibe: 'Intimate standing-room club with close sightlines.',
    expect: 'Standing room, bar service, 500-cap room.',
    bestFor: 'Indie rock, punk, electronic, hip-hop.'
  },
  'kilby-court': {
    vibe: 'DIY backyard garage room.',
    expect: 'All-ages shows, local bands, occasional surprise guests.',
    bestFor: 'Local bands, all-ages crowds, intimate performances.'
  },
  'the-depot': {
    vibe: 'Mid-size room in a converted train station.',
    expect: 'GA floor with balcony seating, full bars, proper sound system.',
    bestFor: 'National touring acts, sold-out shows.'
  },
  'the-state-room': {
    vibe: 'Seated listening room with dinner service.',
    expect: 'Reserved seating, full menu, premium acoustics.',
    bestFor: 'Singer-songwriters, acoustic sets, jazz, blues, folk.'
  },
  'soundwell': {
    vibe: 'Warehouse-style room on the west side.',
    expect: 'Open floor plan, bar service, DJ nights and live bands.',
    bestFor: 'Electronic, indie, hip-hop, events.'
  },
  'metro-music-hall': {
    vibe: 'Mid-size room with balcony sightlines.',
    expect: 'Standing room, good sightlines, attached to The Depot.',
    bestFor: 'Growing touring acts, local headliners.'
  },
  'piper-down': {
    vibe: 'Irish pub with basement stage.',
    expect: 'Late nights, bar service, rock shows.',
    bestFor: 'Punk, metal, rock, no-frills shows.'
  },
  'ice-haus': {
    vibe: 'West side DIY space.',
    expect: 'All-ages, volunteer-run, underground.',
    bestFor: 'Punk, hardcore, experimental, local scenes.'
  },
  'barbary-coast': {
    vibe: 'Neighborhood bar with a stage.',
    expect: 'Bar atmosphere, drink service, rock shows.',
    bestFor: 'Rock, punk, metal, local bands.'
  },
  'aces-high-saloon': {
    vibe: 'Bar format with live PA.',
    expect: 'Pool tables, drink service, loud rock.',
    bestFor: 'Metal, rock, punk, outlaw country.'
  },
  'velour': {
    vibe: 'Provo all-ages room.',
    expect: 'All-ages, no alcohol.',
    bestFor: 'Indie, rock, folk, local music, all-ages crowds.'
  },
  'the-complex': {
    vibe: 'Warehouse complex with multiple rooms.',
    expect: 'Large-scale production, EDM shows, big events.',
    bestFor: 'EDM, large touring acts, festivals.'
  },
  'red-butte-garden': {
    vibe: 'Outdoor amphitheater in the foothills.',
    expect: 'Lawn seating, gorgeous views, summer concerts.',
    bestFor: 'Summer concerts, big folk/rock acts, sunset shows.'
  },
  'vivint-arena': {
    vibe: 'Arena room.',
    expect: 'Stadium seating, major production, expensive beer.',
    bestFor: 'Arena tours, major headliners, sports.'
  },
  'egyptian-theatre': {
    vibe: 'Historic Park City theater.',
    expect: 'Seated shows, film screenings, intimate theater experience.',
    bestFor: 'Film, smaller concerts, special events.'
  },
  'hog-wallow': {
    vibe: 'Brighton base area bar with live music.',
    expect: 'Apres-ski crowds, mountain air.',
    bestFor: 'Rock, country, apres-ski entertainment.'
  },
  'avalon-theatre': {
    vibe: 'Historic 1946 theater.',
    expect: 'Intimate seated venue, rich history, 200-cap room with theater acoustics.',
    bestFor: 'All-ages shows, theater performances, intimate concerts, community events.'
  }
}

export default async function VenuePage({ params }: Props) {
  const { slug } = await params
  const venueData = await getVenueBySlug(slug)

  if (!venueData) {
    notFound()
  }

  // Cast to extended type to access fields that may exist but aren't in generated types
  const venue = venueData as unknown as ExtendedVenue

  const events = await getVenueEvents(venue.id)

  // Get Google Places data for images and additional info
  const googleDetails = await getVenueDetails(
    venue.name,
    venue.city || 'Salt Lake City',
    venue.state || 'UT'
  )

  // Separate upcoming and past events
  const now = new Date()
  const upcomingEvents = events.filter(e => e.start_time && new Date(e.start_time) >= now)
  const pastEvents = events.filter(e => e.start_time && new Date(e.start_time) < now)

  // Get venue-specific description if we have one
  const venueInfo = VENUE_DESCRIPTIONS[slug]
  const venueTypeLabel = venue.venue_type || getVenueTypeDescription(googleDetails.types)

  // Use Google photo if no database image
  const heroImage = venue.image_url || googleDetails.photoUrl

  return (
    <Container className="py-12">
      {/* Hero Section with Image */}
      <div className="mb-8">
        {heroImage ? (
          <div className="relative aspect-[21/9] bg-zinc-900 rounded-md overflow-hidden mb-6 border border-zinc-800">
            <img
              src={heroImage}
              alt={venue.name}
              className="w-full h-full object-cover grayscale hover:grayscale-0"
            />

            {/* Venue name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                {venue.featured && (
                  <span className="px-2 py-1 border border-amber-500 text-amber-200 rounded-md text-xs font-semibold uppercase" title="Featured Venue">
                    Featured
                  </span>
                )}
                <span className="px-3 py-1 bg-zinc-900/80 text-zinc-200 text-sm rounded-md border border-zinc-800">
                  {venueTypeLabel}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-semibold text-zinc-100">
                {venue.name}
              </h1>
              {venue.address && (
                <p className="text-zinc-300 mt-2 text-lg">
                  {venue.address}{venue.city && `, ${venue.city}`}
                </p>
              )}
            </div>
          </div>
        ) : (
          // No image fallback
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              {venue.featured && (
                <span className="px-2 py-1 border border-amber-500 text-amber-200 rounded-md text-xs font-semibold uppercase" title="Featured Venue">
                  Featured
                </span>
              )}
              <span className="px-3 py-1 bg-zinc-900 text-zinc-200 text-sm rounded-md border border-zinc-800">
                {venueTypeLabel}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100">
              {venue.name}
            </h1>
          </div>
        )}

        {/* Quick Info Bar */}
        <div className="flex flex-wrap gap-4 items-center text-sm">
          {venue.capacity && (
            <div className="flex items-center gap-2 text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Capacity: {venue.capacity.toLocaleString()}</span>
            </div>
          )}
          {googleDetails.rating && (
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-amber-200">Rating</span>
              <span>{googleDetails.rating.toFixed(1)} ({googleDetails.totalRatings?.toLocaleString()} reviews)</span>
            </div>
          )}
          {googleDetails.isOpenNow !== null && (
            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${googleDetails.isOpenNow ? 'border-emerald-700 text-emerald-200' : 'border-red-700 text-red-200'}`}>
              {googleDetails.isOpenNow ? 'Open Now' : 'Closed'}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* What to Expect */}
          {venueInfo && (
            <section className="bg-zinc-950 rounded-md p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold text-zinc-100 mb-4">
                What to Expect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-amber-200 mb-1">Format</h3>
                  <p className="text-zinc-400">{venueInfo.vibe}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-200 mb-1">Room notes</h3>
                  <p className="text-zinc-400">{venueInfo.expect}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-200 mb-1">Best for</h3>
                  <p className="text-zinc-400">{venueInfo.bestFor}</p>
                </div>
              </div>
            </section>
          )}

          {/* Tech Specs */}
          <section className="bg-zinc-950 rounded-md p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">
              Tech Specs
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-zinc-500 uppercase tracking-wide text-xs mb-1">PA system</dt>
                <dd className="text-zinc-300">Not on file</dd>
              </div>
              <div>
                <dt className="text-zinc-500 uppercase tracking-wide text-xs mb-1">Monitors</dt>
                <dd className="text-zinc-300">Not on file</dd>
              </div>
              <div>
                <dt className="text-zinc-500 uppercase tracking-wide text-xs mb-1">Backline</dt>
                <dd className="text-zinc-300">Not on file</dd>
              </div>
              <div>
                <dt className="text-zinc-500 uppercase tracking-wide text-xs mb-1">Stage dimensions</dt>
                <dd className="text-zinc-300">Not on file</dd>
              </div>
              <div>
                <dt className="text-zinc-500 uppercase tracking-wide text-xs mb-1">Power</dt>
                <dd className="text-zinc-300">Not on file</dd>
              </div>
              <div>
                <dt className="text-zinc-500 uppercase tracking-wide text-xs mb-1">House engineer</dt>
                <dd className="text-zinc-300">Not on file</dd>
              </div>
            </dl>
            <p className="text-xs text-zinc-500 mt-4">Additional data pending verification.</p>
          </section>

          {/* Description from DB */}
          {venue.notes && (
            <section>
              <h2 className="text-xl font-semibold text-zinc-100 mb-4">About</h2>
              <p className="text-zinc-400 whitespace-pre-line">{venue.notes}</p>
            </section>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-zinc-100">
                  Upcoming Shows ({upcomingEvents.length})
                </h2>
                <Link href="/events" className="text-amber-200 hover:underline text-sm">
                  Full gig guide
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map(event => (
                  <div
                    key={event.id}
                    className="bg-zinc-950 border border-zinc-800 rounded-md p-4 hover:border-amber-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {event.name || 'Untitled Event'}
                        </h3>
                        {event.start_time && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(event.start_time).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                        {event.event_bands && event.event_bands.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.event_bands
                              .map(eb => eb.band)
                              .filter(Boolean)
                              .slice(0, 3)
                              .map((band, idx) => (
                                <Link
                                  key={idx}
                                  href={`/bands/${band!.slug}`}
                                  className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900"
                                >
                                  {band!.name}
                                </Link>
                              ))}
                          </div>
                        )}
                      </div>
                      {event.ticket_price && (
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          ${event.ticket_price}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Recent Shows
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {pastEvents.slice(0, 6).map(event => (
                  <div
                    key={event.id}
                    className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {event.name || 'Untitled Event'}
                    </h3>
                    {event.start_time && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(event.start_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Contact & Location
            </h2>

            {/* Address */}
            {venue.address && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
                <p className="text-gray-900 dark:text-white">
                  {venue.address}
                </p>
                {(venue.city || venue.state) && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {[venue.city, venue.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Phone */}
            {venue.phone && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                <a href={`tel:${venue.phone}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  {venue.phone}
                </a>
              </div>
            )}

            {/* Hours */}
            {googleDetails.openingHours && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hours</p>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                  {googleDetails.openingHours.map((hours, idx) => (
                    <p key={idx}>{hours}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Visit Website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}

              {googleDetails.placeId && (
                <a
                  href={getGoogleMapsUrl(googleDetails.placeId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View on Google Maps
                </a>
              )}

              {googleDetails.lat && googleDetails.lng && (
                <a
                  href={getDirectionsUrl(googleDetails.lat, googleDetails.lng, venue.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Get Directions
                </a>
              )}
            </div>
          </div>

          {/* Additional Photos */}
          {googleDetails.additionalPhotos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                More Photos
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {googleDetails.additionalPhotos.slice(0, 4).map((photoUrl, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={photoUrl}
                      alt={`${venue.name} photo ${idx + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim Venue CTA */}
          <ClaimVenueButton
            venueId={venue.id}
            venueName={venue.name}
            isClaimed={!!venue.claimed_by}
          />

          {/* Submit Show Request (for bands) */}
          <SubmitShowToVenueButton
            venueId={venue.id}
            venueName={venue.name}
          />

          {/* Message Venue Button (for bands to message venues directly) */}
          {venue.claimed_by && (
            <StartConversationButton
              targetType="venue"
              targetId={venue.id}
              targetName={venue.name}
            />
          )}
        </div>
      </div>

      {/* Empty State */}
      {events.length === 0 && !venueInfo && !venue.notes && (
        <div className="text-center py-12 bg-zinc-950 border border-zinc-800 rounded-md">
          <svg className="w-12 h-12 mx-auto text-zinc-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            No events yet
          </h3>
          <p className="text-zinc-400 mb-4">
            Additional data pending verification.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 text-amber-200 hover:underline"
          >
            Submit a show listing
          </Link>
        </div>
      )}
    </Container>
  )
}
