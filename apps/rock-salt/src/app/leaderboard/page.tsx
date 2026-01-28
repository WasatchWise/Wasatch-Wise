import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'
import Link from 'next/link'

export const metadata = {
  title: 'Band Leaderboard | The Rock Salt',
  description: 'See the top bands in Salt Lake City. Boost your favorites to help them climb!',
}

interface LeaderboardBand {
  rank: number
  id: string
  name: string
  slug: string
  bio: string | null
  city: string | null
  state: string | null
  imageUrl: string | null
  saltRocksBalance: number
  boostScore: number
  activeBoosts: number
  genres: Array<{ name: string; slug: string }>
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; state?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's owned bands
  let ownedBandIds: string[] = []
  if (user) {
    const { data: ownedBands } = await supabase
      .from('bands')
      .select('id')
      .eq('claimed_by', user.id)

    ownedBandIds = ownedBands?.map(b => b.id) || []
  }

  // Fetch leaderboard data
  let query = supabase
    .from('bands')
    .select(`
      id,
      name,
      slug,
      bio,
      origin_city,
      state,
      image_url,
      salt_rocks_balance,
      boost_score,
      band_genres(
        genre:genres(name, slug)
      )
    `)
    .order('boost_score', { ascending: false, nullsFirst: false })
    .order('salt_rocks_balance', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true })
    .limit(50)

  if (params.state) {
    query = query.eq('state', params.state)
  }

  const { data: bands } = await query

  // Format for component
  const leaderboard: LeaderboardBand[] = (bands || []).map((band, index) => ({
    rank: index + 1,
    id: band.id,
    name: band.name,
    slug: band.slug,
    bio: band.bio,
    city: band.origin_city,
    state: band.state,
    imageUrl: band.image_url,
    saltRocksBalance: band.salt_rocks_balance || 0,
    boostScore: band.boost_score || 0,
    activeBoosts: 0,
    genres: band.band_genres
      ?.map((bg: { genre: { name: string; slug: string } | null }) => bg.genre)
      .filter(Boolean) || [],
  }))

  // Get unique states for filter
  const { data: states } = await supabase
    .from('bands')
    .select('state')
    .not('state', 'is', null)
  const uniqueStates = [...new Set(states?.map(s => s.state).filter(Boolean))]

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Band Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The hottest bands in the scene. Boost your favorites with Salt Rocks to help them climb!
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              How Boosting Works
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Spend 10 Salt Rocks to boost a band. Boosts last 7 days and help bands climb the leaderboard.
              You can boost any band once per day. <Link href="/dashboard/wallet" className="underline font-medium">Get Salt Rocks →</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-8">
        <form className="flex flex-wrap gap-4" method="GET">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State
            </label>
            <select
              name="state"
              defaultValue={params.state || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state || ''}>
                  {state}
                </option>
              ))}
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
              href="/leaderboard"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardTable
            bands={leaderboard}
            currentUserId={user?.id}
            ownedBandIds={ownedBandIds}
            isLoggedIn={!!user}
          />
        </Suspense>
      </div>

      {/* Bottom CTA */}
      {!user && (
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to boost your favorite bands and support the local scene!
          </p>
          <Link
            href="/auth/signin?redirect=/leaderboard"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In to Boost
          </Link>
        </div>
      )}
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
          <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      ))}
    </div>
  )
}
