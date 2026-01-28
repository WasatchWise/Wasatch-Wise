import { createClient } from '@/lib/supabase/server'
import Container from '@/components/Container'
import Link from 'next/link'
import { getOpenVenueSlots, getAvailableBands, getOpenOpportunities } from '@/app/actions/availability'

export const dynamic = 'force-dynamic'

export default async function BookPage() {
  const supabase = await createClient()

  // Get current user's bands/venues for context
  const { data: { user } } = await supabase.auth.getUser()

  let userBands: any[] = []
  let userVenues: any[] = []

  if (user) {
    const [bandsResult, venuesResult] = await Promise.all([
      supabase.from('bands').select('id, name, slug').eq('claimed_by', user.id),
      supabase.from('venues').select('id, name, slug').eq('claimed_by', user.id)
    ])
    userBands = bandsResult.data || []
    userVenues = venuesResult.data || []
  }

  // Get available data
  const [slotsResult, bandsResult, opportunitiesResult] = await Promise.all([
    getOpenVenueSlots(),
    getAvailableBands(),
    getOpenOpportunities()
  ])

  const openSlots = slotsResult.slots || []
  const availableBands = bandsResult.availability || []
  const opportunities = opportunitiesResult.opportunities || []

  // Split opportunities by type
  const venueOpportunities = opportunities.filter(o => o.posted_by_type === 'venue')
  const bandOpportunities = opportunities.filter(o => o.posted_by_type === 'band')

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-zinc-100 mb-2">
          Booking Board
        </h1>
        <p className="text-zinc-400">
          Open slots, available bands, and posted opportunities.
        </p>
      </div>

      {/* User Context */}
      {user && (userBands.length > 0 || userVenues.length > 0) && (
        <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-md p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {userBands.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Your bands:</span>
                {userBands.map(band => (
                  <Link
                    key={band.id}
                    href={`/dashboard/bands/${band.id}`}
                    className="px-3 py-1 border border-zinc-800 text-zinc-200 text-sm rounded-md hover:border-amber-500"
                  >
                    {band.name}
                  </Link>
                ))}
              </div>
            )}
            {userVenues.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Your venues:</span>
                {userVenues.map(venue => (
                  <Link
                    key={venue.id}
                    href={`/dashboard/venues/${venue.id}`}
                    className="px-3 py-1 border border-zinc-800 text-zinc-200 text-sm rounded-md hover:border-amber-500"
                  >
                    {venue.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-2">
            Manage your availability and open slots from your dashboard.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-6 text-center">
          <div className="text-3xl font-semibold text-zinc-100 mb-2">
            {openSlots.length}
          </div>
          <div className="text-zinc-400">Open venue slots</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-6 text-center">
          <div className="text-3xl font-semibold text-zinc-100 mb-2">
            {availableBands.length}
          </div>
          <div className="text-zinc-400">Available bands</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-6 text-center">
          <div className="text-3xl font-semibold text-zinc-100 mb-2">
            {opportunities.length}
          </div>
          <div className="text-zinc-400">Open opportunities</div>
        </div>
      </div>

      {/* Open Venue Slots */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-zinc-100 mb-6">
          Venues looking for bands
        </h2>

        {openSlots.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-md p-8 text-center">
            <p className="text-zinc-400">No open venue slots right now.</p>
            {userVenues.length > 0 && (
              <Link
                href={`/dashboard/venues/${userVenues[0].id}`}
                className="inline-block mt-4 text-amber-200 hover:underline"
              >
                Add open dates
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openSlots.slice(0, 6).map((slot: any) => (
              <div
                key={slot.id}
                className="bg-zinc-950 rounded-md border border-zinc-800 overflow-hidden hover:border-amber-500 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link
                        href={`/venues/${slot.venues.slug}`}
                        className="font-semibold text-lg text-zinc-100 hover:text-amber-200"
                      >
                        {slot.venues.name}
                      </Link>
                      <p className="text-sm text-zinc-400">
                        {slot.venues.city}, {slot.venues.state}
                      </p>
                    </div>
                    {slot.venues.capacity && (
                      <span className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md text-zinc-300">
                        {slot.venues.capacity} cap
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="text-xl font-semibold text-amber-200">
                      {new Date(slot.slot_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    {slot.title && (
                      <p className="text-zinc-300">{slot.title}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                      {slot.compensation_type === 'guarantee' && slot.guarantee_amount
                        ? `$${slot.guarantee_amount}`
                        : slot.compensation_type === 'door_split' && slot.door_split_percentage
                        ? `${slot.door_split_percentage}% door`
                        : slot.compensation_type === 'tips_only'
                        ? 'Tips'
                        : 'Negotiable'}
                    </span>
                    {slot.set_time && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                        {slot.set_time}
                      </span>
                    )}
                    {slot.age_restriction && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                        {slot.age_restriction}
                      </span>
                    )}
                  </div>

                  {slot.preferred_genres && slot.preferred_genres.length > 0 && (
                    <div className="text-xs text-zinc-500 mb-4">
                      Looking for: {slot.preferred_genres.join(', ')}
                    </div>
                  )}

                  <Link
                    href={`/venues/${slot.venues.slug}`}
                    className="block w-full text-center px-4 py-2 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
                  >
                    View venue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Bands */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-zinc-100 mb-6">
          Bands available to play
        </h2>

        {availableBands.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-md p-8 text-center">
            <p className="text-zinc-400">No bands have posted availability yet.</p>
            {userBands.length > 0 && (
              <Link
                href={`/dashboard/bands/${userBands[0].id}`}
                className="inline-block mt-4 text-amber-200 hover:underline"
              >
                Add available dates
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBands.slice(0, 6).map((avail: any) => (
              <div
                key={avail.id}
                className="bg-zinc-950 rounded-md border border-zinc-800 overflow-hidden hover:border-amber-500 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-3">
                    {avail.bands.image_url && (
                      <img
                        src={avail.bands.image_url}
                        alt={avail.bands.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <Link
                        href={`/bands/${avail.bands.slug}`}
                        className="font-semibold text-lg text-zinc-100 hover:text-amber-200"
                      >
                        {avail.bands.name}
                      </Link>
                      {avail.bands.origin_city && (
                        <p className="text-sm text-zinc-400">
                          {avail.bands.origin_city}, {avail.bands.state}
                        </p>
                      )}
                      {avail.bands.band_genres && avail.bands.band_genres.length > 0 && (
                        <p className="text-xs text-zinc-500">
                          {avail.bands.band_genres.slice(0, 3).map((g: any) => g.genre?.name).filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xl font-semibold text-amber-200">
                      {new Date(avail.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                      {avail.end_date !== avail.start_date && (
                        <> - {new Date(avail.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}</>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {avail.min_guarantee && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                        ${avail.min_guarantee}+ min
                      </span>
                    )}
                    {avail.door_deal_ok && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                        Door deals ok
                      </span>
                    )}
                    {avail.willing_to_travel && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                        Will travel
                      </span>
                    )}
                  </div>

                  {avail.notes && (
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                      {avail.notes}
                    </p>
                  )}

                  <Link
                    href={`/bands/${avail.bands.slug}`}
                    className="block w-full text-center px-4 py-2 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
                  >
                    View band
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Opportunities / RFPs */}
      {opportunities.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-6">
            Open opportunities
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {opportunities.slice(0, 4).map((opp: any) => {
              const isVenuePosted = opp.posted_by_type === 'venue'
              const poster = isVenuePosted ? opp.venues : opp.bands

              return (
                <div
                  key={opp.id}
                  className="bg-zinc-950 rounded-md border border-zinc-800 p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-md border border-zinc-800 flex items-center justify-center">
                      <span className="text-lg font-semibold text-zinc-200">
                        {poster?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-100">
                        {opp.title}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Posted by {poster?.name || 'Unknown'} ({isVenuePosted ? 'venue' : 'band'})
                      </p>
                    </div>
                  </div>

                  {opp.description && (
                    <p className="text-zinc-400 mb-4 line-clamp-2">
                      {opp.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {opp.specific_date && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                        {new Date(opp.specific_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                    {opp.date_flexible && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                        Dates flexible
                      </span>
                    )}
                    {opp.preferred_genres && opp.preferred_genres.length > 0 && (
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                        {opp.preferred_genres.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/${isVenuePosted ? 'venues' : 'bands'}/${poster?.slug}`}
                    className="block w-full text-center px-4 py-2 rounded-md border border-zinc-800 text-zinc-200 hover:border-amber-500 transition-colors"
                  >
                    View listing
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Spider Network Protocol Section */}
      <div className="mt-16 border border-zinc-800 rounded-md p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-3 py-1 border border-zinc-800 text-zinc-400 text-[10px] font-semibold uppercase tracking-widest rounded mb-4">
              Spider Network Protocol
            </div>
            <h2 className="text-3xl font-semibold mb-4 text-zinc-100">Standard touring terms</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Bands use the Spider Network Protocol v2.1. Read terms or download a blank template.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                href="/spider-network/protocol"
                className="px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
              >
                Read terms
              </Link>
              <Link
                href="/spider-network/promo"
                className="px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
              >
                Build promo packet
              </Link>
              <a
                href="/api/protocol/download"
                download
                className="px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
              >
                Download template
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA for non-users */}
      {!user && (
        <div className="border border-zinc-800 rounded-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
            Claim a page
          </h2>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
            Post availability, list requirements, and connect with venues or bands.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/bands"
              className="px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
            >
              Claim band
            </Link>
            <Link
              href="/venues"
              className="px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
            >
              Claim venue
            </Link>
          </div>
        </div>
      )}
    </Container>
  )
}
