import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { calculateCompatibility } from '@/lib/compatibility'
import { CompatibilityFilters, CompatibilityBadge } from '@/components/compatibility'
import type { CompatibilityStatus } from '@/lib/compatibility'

export const metadata = {
  title: 'Browse Spider Riders | The Rock Salt',
  description: 'Browse bands with published touring terms and book them for your venue',
}

interface SpiderRiderWithBand {
  id: string
  version: string
  rider_code?: string | null
  guarantee_min: number
  guarantee_max: number | null
  door_split_percentage: number | null
  min_stage_width_feet?: number | null
  min_stage_depth_feet?: number | null
  min_input_channels?: number | null
  requires_house_drums?: boolean | null
  age_restriction: string | null
  published_at: string
  acceptance_count: number
  band: {
    id: string
    name: string
    slug: string
    bio: string | null
    origin_city: string | null
    state: string | null
    image_url: string | null
    band_genres: Array<{ genre: { name: string; slug: string } | null }>
  }
}

export default async function SpiderRidersBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    minFee?: string
    maxFee?: string
    genre?: string
    age?: string
    compatibility?: CompatibilityStatus
    venueId?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Get current user and their venues
  const { data: { user } } = await supabase.auth.getUser()
  let userVenues: Array<{ id: string; name: string }> = []
  if (user) {
    const { data: venues } = await supabase
      .from('venues')
      .select('id, name, capacity, stage_width_feet, stage_depth_feet, input_channels, has_house_drums, has_backline')
      .eq('claimed_by', user.id)
    userVenues = (venues || []).map((v) => ({ id: v.id, name: v.name }))
  }

  const activeVenueId =
    params.venueId && userVenues.some((v) => v.id === params.venueId)
      ? params.venueId
      : userVenues[0]?.id
  const activeVenue = userVenues.find((v) => v.id === activeVenueId)
  const fullVenue = activeVenueId
    ? (
        await supabase
          .from('venues')
          .select('id, name, slug, capacity, stage_width_feet, stage_depth_feet, input_channels, has_house_drums, has_backline, typical_guarantee_max, typical_guarantee_min, age_restrictions')
          .eq('id', activeVenueId)
          .single()
      ).data
    : null

  // Build query for published spider riders (include fields needed for compatibility)
  let query = supabase
    .from('spider_riders')
    .select(`
      id,
      version,
      rider_code,
      guarantee_min,
      guarantee_max,
      door_split_percentage,
      min_stage_width_feet,
      min_stage_depth_feet,
      min_input_channels,
      requires_house_drums,
      age_restriction,
      published_at,
      acceptance_count,
      band:bands(
        id,
        name,
        slug,
        bio,
        origin_city,
        state,
        image_url,
        band_genres(
          genre:genres(name, slug)
        )
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Apply existing filters
  if (params.minFee) {
    query = query.gte('guarantee_min', Number(params.minFee) * 100)
  }
  if (params.maxFee) {
    query = query.lte('guarantee_min', Number(params.maxFee) * 100)
  }
  if (params.age) {
    query = query.eq('age_restriction', params.age)
  }

  const { data: riders, error } = await query

  if (error) {
    console.error('Error fetching spider riders:', error)
  }

  // Calculate compatibility for each rider (when venue owner viewing)
  const ridersWithCompatibility = (riders || []).map((rider) => {
    let compatibility = null
    if (fullVenue) {
      compatibility = calculateCompatibility(
        {
          id: rider.id,
          guarantee_min: rider.guarantee_min,
          guarantee_max: rider.guarantee_max,
          min_stage_width_feet: rider.min_stage_width_feet,
          min_stage_depth_feet: rider.min_stage_depth_feet,
          min_input_channels: rider.min_input_channels,
          requires_house_drums: rider.requires_house_drums,
          age_restriction: rider.age_restriction,
        },
        {
          id: fullVenue.id,
          name: fullVenue.name,
          slug: fullVenue.slug,
          capacity: fullVenue.capacity,
          stage_width_feet: fullVenue.stage_width_feet,
          stage_depth_feet: fullVenue.stage_depth_feet,
          input_channels: fullVenue.input_channels,
          has_house_drums: fullVenue.has_house_drums,
          has_backline: fullVenue.has_backline,
          typical_guarantee_max: fullVenue.typical_guarantee_max ?? undefined,
          typical_guarantee_min: fullVenue.typical_guarantee_min ?? undefined,
          age_restrictions: fullVenue.age_restrictions ?? undefined,
        }
      )
    }
    return { ...rider, compatibility }
  })

  // Filter by compatibility status if specified
  const filteredRiders = params.compatibility
    ? ridersWithCompatibility.filter(
        (r) => r.compatibility?.status === params.compatibility
      )
    : ridersWithCompatibility

  const showCompatibility = userVenues.length > 0 && !!fullVenue

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Link href="/book" className="hover:text-indigo-600">Book Shows</Link>
          <span>/</span>
          <span>Spider Riders</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Browse Spider Riders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find bands with pre-published touring terms. Accept their Spider Rider to instantly pre-approve them for your venue.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-8">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
          What is a Spider Rider?
        </h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          A Spider Rider is a band's published touring terms - their guarantee, technical requirements, and hospitality needs.
          When you accept a Spider Rider, you pre-approve the band's terms and can request specific booking dates.
        </p>
      </div>

      {/* Compatibility Filters (venue owners only) */}
      {showCompatibility && (
        <CompatibilityFilters
          venues={userVenues}
          activeVenueId={activeVenueId}
          selectedStatus={params.compatibility ?? null}
        />
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-8">
        <form className="flex flex-wrap gap-4" method="GET">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Guarantee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                name="minFee"
                defaultValue={params.minFee}
                placeholder="100"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Guarantee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                name="maxFee"
                defaultValue={params.maxFee}
                placeholder="5000"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Age Restriction
            </label>
            <select
              name="age"
              defaultValue={params.age || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Any</option>
              <option value="all_ages">All Ages</option>
              <option value="18+">18+</option>
              <option value="21+">21+</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Filter
            </button>
            <Link
              href="/book/spider-riders"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Rider Count */}
      {showCompatibility && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredRiders.length} of {ridersWithCompatibility.length} riders
          {params.compatibility && (
            <>
              {' '}
              with <strong className="capitalize">{params.compatibility}</strong>{' '}
              compatibility
            </>
          )}
        </div>
      )}

      {/* Results */}
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRiders.length > 0 ? (
            filteredRiders.map((rider) => (
              <SpiderRiderCard
                key={rider.id}
                rider={rider as SpiderRiderWithBand}
                compatibility={rider.compatibility}
                showCompatibility={showCompatibility}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {params.compatibility
                  ? `No ${params.compatibility} riders found. Try adjusting your filters.`
                  : 'No Spider Riders found matching your criteria.'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your filters or check back later.
              </p>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  )
}

function SpiderRiderCard({
  rider,
  compatibility,
  showCompatibility = false,
}: {
  rider: SpiderRiderWithBand
  compatibility?: { overallScore: number; status: string; dealBreakers: string[] } | null
  showCompatibility?: boolean
}) {
  const band = rider.band
  const genres = band?.band_genres
    ?.map(bg => bg.genre?.name)
    .filter(Boolean)
    .slice(0, 3)

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  return (
    <Link
      href={`/book/spider-riders/${rider.id}`}
      className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Band Image */}
      <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 relative">
        {band?.image_url && (
          <img
            src={band.image_url}
            alt={band.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white truncate">
            {band?.name || 'Unknown Band'}
          </h3>
          {band?.origin_city && (
            <p className="text-sm text-white/80">
              {band.origin_city}{band.state ? `, ${band.state}` : ''}
            </p>
          )}
        </div>
        {/* Compatibility Badge (venue owners) */}
        {showCompatibility && compatibility && (
          <div className="absolute top-3 right-3">
            <CompatibilityBadge
              score={compatibility.overallScore}
              status={compatibility.status as 'excellent' | 'good' | 'partial' | 'incompatible'}
              size="sm"
            />
          </div>
        )}
        {/* Spider Rider Badge (when no compatibility shown) */}
        {(!showCompatibility || !compatibility) && (
          <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Spider Rider
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        {/* Genres */}
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {genres.map((genre, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Guarantee Range */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Guarantee</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatCurrency(rider.guarantee_min)}
            {rider.guarantee_max && rider.guarantee_max !== rider.guarantee_min && (
              <> - {formatCurrency(rider.guarantee_max)}</>
            )}
          </span>
        </div>

        {/* Door Split */}
        {rider.door_split_percentage && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Door Split</span>
            <span className="text-gray-900 dark:text-white">
              {rider.door_split_percentage}% to band
            </span>
          </div>
        )}

        {/* Age Restriction */}
        {rider.age_restriction && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Age</span>
            <span className="text-gray-900 dark:text-white capitalize">
              {rider.age_restriction.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Acceptance Count */}
        {rider.acceptance_count > 0 && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Pre-approved by</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              {rider.acceptance_count} venue{rider.acceptance_count !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Deal-Breakers Warning (if incompatible) */}
        {showCompatibility && compatibility?.dealBreakers && compatibility.dealBreakers.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
            <strong>⚠️ {compatibility.dealBreakers.length} deal-breaker(s)</strong>
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
            View Full Terms & Accept
          </span>
        </div>
      </div>
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
