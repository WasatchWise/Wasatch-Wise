import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Browse Spider Riders | The Rock Salt',
  description: 'Browse bands with published touring terms and book them for your venue',
}

interface SpiderRiderWithBand {
  id: string
  version: string
  guarantee_min: number
  guarantee_max: number | null
  door_split_percentage: number | null
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
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query for published spider riders
  let query = supabase
    .from('spider_riders')
    .select(`
      id,
      version,
      guarantee_min,
      guarantee_max,
      door_split_percentage,
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

  // Apply filters
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

      {/* Results */}
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {riders && riders.length > 0 ? (
            riders.map((rider) => (
              <SpiderRiderCard key={rider.id} rider={rider as SpiderRiderWithBand} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No Spider Riders found matching your criteria.
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

function SpiderRiderCard({ rider }: { rider: SpiderRiderWithBand }) {
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
        {/* Spider Rider Badge */}
        <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
          Spider Rider
        </div>
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
