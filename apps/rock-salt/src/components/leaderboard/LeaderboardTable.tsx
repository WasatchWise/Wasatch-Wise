'use client'

import Link from 'next/link'
import BoostButton from './BoostButton'

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

interface LeaderboardTableProps {
  bands: LeaderboardBand[]
  currentUserId?: string
  ownedBandIds?: string[]
  isLoggedIn?: boolean
}

export default function LeaderboardTable({
  bands,
  currentUserId,
  ownedBandIds = [],
  isLoggedIn = false,
}: LeaderboardTableProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return null
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-400 w-16">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
              Band
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">
              Location
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400 w-24">
              Boost
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {bands.map((band) => {
            const isOwner = ownedBandIds.includes(band.id)
            const rankIcon = getRankIcon(band.rank)

            return (
              <tr
                key={band.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {/* Rank */}
                <td className="px-4 py-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankStyle(
                      band.rank
                    )}`}
                  >
                    {rankIcon || band.rank}
                  </div>
                </td>

                {/* Band Info */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {/* Image */}
                    <Link href={`/bands/${band.slug}`} className="shrink-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                        {band.imageUrl ? (
                          <img
                            src={band.imageUrl}
                            alt={band.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {band.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Name & Genres */}
                    <div className="min-w-0">
                      <Link
                        href={`/bands/${band.slug}`}
                        className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 block truncate"
                      >
                        {band.name}
                        {isOwner && (
                          <span className="ml-2 text-xs text-indigo-500">(You)</span>
                        )}
                      </Link>
                      {band.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {band.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre.slug}
                              className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-4 py-4 hidden md:table-cell">
                  {band.city || band.state ? (
                    <span className="text-gray-600 dark:text-gray-400">
                      {band.city}
                      {band.city && band.state ? ', ' : ''}
                      {band.state}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                {/* Boost */}
                <td className="px-4 py-4 text-center">
                  <BoostButton
                    bandId={band.id}
                    bandName={band.name}
                    currentBoostScore={band.boostScore}
                    isOwner={isOwner}
                    isLoggedIn={isLoggedIn}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {bands.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No bands found matching your criteria.
        </div>
      )}
    </div>
  )
}
