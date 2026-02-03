'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CompatibilityBadge } from './CompatibilityBadge'
import type { CompatibilityStatus } from '@/lib/compatibility'

interface CompatibleVenue {
  venueId: string
  venueName: string
  venueSlug: string | null
  compatibility: {
    overallScore: number
    status: CompatibilityStatus
    dealBreakers: string[]
  }
}

interface CompatibleVenuesSectionProps {
  riderId: string
}

export function CompatibleVenuesSection({ riderId }: CompatibleVenuesSectionProps) {
  const [venues, setVenues] = useState<CompatibleVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/compatibility/rider/${riderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load compatible venues')
        return res.json()
      })
      .then((data) => {
        setVenues(data.compatibleVenues || [])
      })
      .catch((err) => {
        setError(err.message)
        setVenues([])
      })
      .finally(() => setLoading(false))
  }, [riderId])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
        {error}
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No venues in the network yet. Venues can add stage and capacity info to see compatibility.
      </p>
    )
  }

  const topVenues = venues.slice(0, 6)
  const compatibleCount = venues.filter(
    (v) => v.compatibility.status !== 'incompatible'
  ).length

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {compatibleCount} venue{compatibleCount !== 1 ? 's' : ''} compatible with your rider (of {venues.length} total)
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topVenues.map((v) => (
          <Link
            key={v.venueId}
            href={v.venueSlug ? `/venues/${v.venueSlug}` : `/dashboard/venues/${v.venueId}`}
            className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {v.venueName}
              </span>
              <CompatibilityBadge
                score={v.compatibility.overallScore}
                status={v.compatibility.status}
                size="sm"
              />
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400">
              View venue →
            </span>
          </Link>
        ))}
      </div>
      {venues.length > 6 && (
        <Link
          href={`/book/spider-riders`}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Browse all Spider Riders to find venues →
        </Link>
      )}
    </div>
  )
}
