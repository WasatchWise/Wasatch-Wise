import { getPublicSpiderRiders } from '@/lib/supabase/spider-rider-queries'
import Container from '@/components/Container'
import Link from 'next/link'
import type { Metadata} from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Spider Riders | The Rock Salt',
  description: 'Booking protocol with guarantees, requirements, and availability.',
}

export default async function SpiderRidersPage() {
  const riders = await getPublicSpiderRiders(100)

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-4">
          Spider Riders
        </h1>
        <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
          Touring terms, guarantees, event types, and booking requirements.
        </p>
      </div>

      {/* Info Box */}
      <div className="border border-zinc-800 rounded-md p-8 mb-12">
        <h2 className="text-2xl font-semibold text-zinc-100 mb-2">For event organizers and venues</h2>
        <p className="text-zinc-400 mb-4">
          Bands publish terms publicly. If requirements match, submit a booking request.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
          <div>Paid shows only. No exposure deals.</div>
          <div>Standardized booking request.</div>
          <div>
            Protocol v2.1.{" "}
            <Link href="/spider-network/protocol" className="text-amber-200 hover:underline">
              Read terms
            </Link>
          </div>
        </div>
      </div>

      {/* Riders List */}
      {riders.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 rounded-md">
          <p className="text-xl text-zinc-400">
            No active Spider Riders yet.
          </p>
          <Link
            href="/dashboard/spider-rider"
            className="inline-block mt-6 px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
          >
            Create rider
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {riders.map((rider: any) => {
            const band = rider.band
            const minGuarantee = rider.guarantee_min ? rider.guarantee_min / 100 : null
            const maxGuarantee = rider.guarantee_max ? rider.guarantee_max / 100 : null

            return (
              <div
                key={rider.id}
                className="bg-zinc-950 border border-zinc-800 rounded-md p-6 hover:border-amber-500 transition-colors"
              >
                {/* Band Name & Tier Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link
                      href={`/bands/${band.slug}`}
                      className="text-2xl font-semibold text-zinc-100 hover:text-amber-200"
                    >
                      {band.name}
                    </Link>
                    {band.city && band.state && (
                      <p className="text-sm text-zinc-400">
                        {band.city}, {band.state}
                      </p>
                    )}
                  </div>

                  {band.tier === 'hof' && (
                    <span className="px-3 py-1 bg-zinc-900 text-amber-200 text-xs font-semibold uppercase rounded-md border border-amber-500">
                      HOF
                    </span>
                  )}
                  {band.tier === 'featured' && (
                    <span className="px-3 py-1 bg-zinc-900 text-zinc-200 text-xs font-semibold uppercase rounded-md border border-zinc-700">
                      Featured
                    </span>
                  )}
                </div>

                {/* Guarantee Range */}
                <div className="mb-4 p-4 bg-zinc-900 border border-zinc-800 rounded-md">
                  <div className="text-sm font-semibold text-zinc-300 mb-1">
                    Guarantee Range
                  </div>
                  <div className="text-3xl font-semibold text-zinc-100">
                    {minGuarantee && maxGuarantee
                      ? `$${minGuarantee.toLocaleString()} - $${maxGuarantee.toLocaleString()}`
                      : minGuarantee
                      ? `$${minGuarantee.toLocaleString()}+`
                      : 'Contact for rate'}
                  </div>
                </div>

                {/* Event Types */}
                {rider.available_for_event_types && rider.available_for_event_types.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-zinc-300 mb-2">
                      Available For:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rider.available_for_event_types.map((type: string) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-zinc-900 text-zinc-300 text-xs font-semibold rounded-md border border-zinc-800"
                        >
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genres */}
                {band.band_genres && band.band_genres.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-zinc-300 mb-2">
                      Genres:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {band.band_genres
                        .map((bg: any) => bg.genre?.name)
                        .filter(Boolean)
                        .map((genre: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-zinc-900 text-zinc-300 text-xs font-medium rounded-md border border-zinc-800"
                          >
                            {genre}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Capacity Range (for venue shows) */}
                {rider.min_venue_capacity && rider.max_venue_capacity && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-zinc-300 mb-1">
                      Venue Capacity:
                    </div>
                    <div className="text-zinc-100">
                      {rider.min_venue_capacity.toLocaleString()} - {rider.max_venue_capacity.toLocaleString()} people
                    </div>
                  </div>
                )}

                {/* Experience Highlights */}
                <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-400">
                  {rider.corporate_events_experience > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-zinc-100">
                        {rider.corporate_events_experience}
                      </span>
                      corporate events
                    </div>
                  )}
                  {rider.wedding_experience > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-zinc-100">
                        {rider.wedding_experience}
                      </span>
                      weddings
                    </div>
                  )}
                  {rider.owns_sound_system && (
                    <div className="flex items-center gap-1">
                      Owns sound
                    </div>
                  )}
                  {rider.has_mc_experience && (
                    <div className="flex items-center gap-1">
                      MC services
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/bands/${band.slug}`}
                  className="block w-full text-center px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
                >
                  View profile
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* CTA for bands */}
      <div className="mt-16 border border-zinc-800 rounded-md p-8 text-center">
        <h3 className="text-2xl font-semibold text-zinc-100 mb-2">
          Publish a rider
        </h3>
        <p className="text-zinc-400 mb-6">
          Post terms, requirements, and availability for verified booking.
        </p>
        <Link
          href="/dashboard/spider-rider"
          className="inline-block px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
        >
          Create rider
        </Link>
      </div>
    </Container>
  )
}
