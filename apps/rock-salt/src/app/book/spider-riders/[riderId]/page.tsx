import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AcceptRiderForm from '@/components/booking/AcceptRiderForm'

export async function generateMetadata({ params }: { params: Promise<{ riderId: string }> }) {
  const { riderId } = await params
  const supabase = await createClient()

  const { data: rider } = await supabase
    .from('spider_riders')
    .select('band:bands(name)')
    .eq('id', riderId)
    .single()

  return {
    title: rider?.band?.name
      ? `${rider.band.name} Spider Rider | The Rock Salt`
      : 'Spider Rider | The Rock Salt',
    description: 'View touring terms and accept to book this band',
  }
}

export default async function SpiderRiderDetailPage({
  params,
}: {
  params: Promise<{ riderId: string }>
}) {
  const { riderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the spider rider with full details
  const { data: rider, error } = await supabase
    .from('spider_riders')
    .select(`
      *,
      band:bands(
        id,
        name,
        slug,
        bio,
        description,
        origin_city,
        state,
        image_url,
        spotify_url,
        bandcamp_url,
        website_url,
        band_genres(
          genre:genres(name, slug)
        )
      )
    `)
    .eq('id', riderId)
    .eq('status', 'published')
    .single()

  if (error || !rider) {
    notFound()
  }

  // Get user's venues for the acceptance form
  let userVenues: Array<{ id: string; name: string }> = []
  if (user) {
    const { data: venues } = await supabase
      .from('venues')
      .select('id, name')
      .eq('claimed_by', user.id)

    userVenues = venues || []
  }

  // Check if user has already accepted this rider
  let existingAcceptance = null
  if (user && userVenues.length > 0) {
    const { data: acceptance } = await supabase
      .from('spider_rider_acceptances')
      .select('*')
      .eq('spider_rider_id', riderId)
      .in('venue_id', userVenues.map(v => v.id))
      .eq('is_active', true)
      .single()

    existingAcceptance = acceptance
  }

  const band = rider.band
  const genres = band?.band_genres
    ?.map((bg: { genre: { name: string } | null }) => bg.genre?.name)
    .filter(Boolean)

  const formatCurrency = (cents: number | null) => {
    if (!cents) return 'Not specified'
    return `$${(cents / 100).toLocaleString()}`
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/book" className="hover:text-indigo-600">Book Shows</Link>
        <span>/</span>
        <Link href="/book/spider-riders" className="hover:text-indigo-600">Spider Riders</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{band?.name}</span>
      </div>

      {/* Band Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl overflow-hidden mb-8">
        <div className="relative h-48 md:h-64">
          {band?.image_url && (
            <img
              src={band.image_url}
              alt={band.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                Spider Rider
              </span>
              <span className="text-white/80 text-sm">
                {rider.version}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
              {band?.name}
            </h1>
            {band?.origin_city && (
              <p className="text-white/80">
                {band.origin_city}{band.state ? `, ${band.state}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Bio */}
          {band?.bio && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About</h2>
              <p className="text-gray-600 dark:text-gray-400">{band.bio}</p>
            </section>
          )}

          {/* Genres */}
          {genres && genres.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Financial Terms */}
          <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Financial Terms
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Guarantee Range</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(rider.guarantee_min)}
                  {rider.guarantee_max && rider.guarantee_max !== rider.guarantee_min && (
                    <> - {formatCurrency(rider.guarantee_max)}</>
                  )}
                </p>
              </div>
              {rider.door_split_percentage && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Door Split</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {rider.door_split_percentage}% to band
                  </p>
                </div>
              )}
              {rider.merch_split_to_venue_percentage && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Merch Commission</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {rider.merch_split_to_venue_percentage}% to venue
                  </p>
                </div>
              )}
            </div>
            {rider.notes_financial && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">{rider.notes_financial}</p>
              </div>
            )}
          </section>

          {/* Technical Requirements */}
          <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Technical Requirements
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {(rider.min_stage_width_feet || rider.min_stage_depth_feet) && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Minimum Stage Size</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {rider.min_stage_width_feet || '?'}' x {rider.min_stage_depth_feet || '?'}'
                  </p>
                </div>
              )}
              {rider.min_input_channels && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Input Channels</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {rider.min_input_channels} minimum
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">House Drums</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {rider.requires_house_drums ? 'Required' : 'Not required'}
                </p>
              </div>
            </div>
            {(rider.stage_plot_url || rider.input_list_url) && (
              <div className="mt-4 flex gap-4">
                {rider.stage_plot_url && (
                  <a
                    href={rider.stage_plot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                  >
                    View Stage Plot
                  </a>
                )}
                {rider.input_list_url && (
                  <a
                    href={rider.input_list_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                  >
                    View Input List
                  </a>
                )}
              </div>
            )}
            {rider.notes_technical && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">{rider.notes_technical}</p>
              </div>
            )}
          </section>

          {/* Hospitality */}
          <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Hospitality
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {rider.meal_buyout_amount && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Meal Buyout</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(rider.meal_buyout_amount)}/person
                  </p>
                </div>
              )}
              {rider.drink_tickets_count && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Drink Tickets</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {rider.drink_tickets_count}
                  </p>
                </div>
              )}
              {rider.guest_list_allocation && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Guest List</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {rider.guest_list_allocation} spots
                  </p>
                </div>
              )}
            </div>
            {rider.green_room_requirements && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Green Room</p>
                <p className="text-gray-600 dark:text-gray-400">{rider.green_room_requirements}</p>
              </div>
            )}
            {rider.notes_hospitality && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">{rider.notes_hospitality}</p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar - Accept Form */}
        <div className="md:col-span-1">
          <div className="sticky top-6">
            {existingAcceptance ? (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✓</span>
                  <h3 className="font-bold text-green-800 dark:text-green-200">
                    Already Accepted
                  </h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  You've already accepted this Spider Rider. The band is pre-approved for your venue.
                </p>
                <Link
                  href="/dashboard/bookings"
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Bookings
                </Link>
              </div>
            ) : user && userVenues.length > 0 ? (
              <AcceptRiderForm
                riderId={riderId}
                bandName={band?.name || 'Unknown Band'}
                venues={userVenues}
              />
            ) : user ? (
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2">
                  No Venues Claimed
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  You need to claim a venue before you can accept Spider Riders.
                </p>
                <Link
                  href="/venues"
                  className="block w-full text-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Find Your Venue
                </Link>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Sign In to Accept
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You need to sign in and claim a venue to accept this Spider Rider.
                </p>
                <Link
                  href={`/auth/signin?redirect=/book/spider-riders/${riderId}`}
                  className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Band Links */}
            {(band?.website_url || band?.spotify_url || band?.bandcamp_url) && (
              <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Links</h3>
                <div className="space-y-2">
                  {band.website_url && (
                    <a
                      href={band.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                    >
                      Website
                    </a>
                  )}
                  {band.spotify_url && (
                    <a
                      href={band.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                    >
                      Spotify
                    </a>
                  )}
                  {band.bandcamp_url && (
                    <a
                      href={band.bandcamp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                    >
                      Bandcamp
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* View Band Page */}
            <div className="mt-4">
              <Link
                href={`/bands/${band?.slug}`}
                className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Full Band Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
