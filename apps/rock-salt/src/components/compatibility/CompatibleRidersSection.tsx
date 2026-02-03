'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CompatibilityBadge } from './CompatibilityBadge'
import type { CompatibilityStatus } from '@/lib/compatibility'

interface CompatibleRider {
  riderId: string
  riderCode: string | null
  bandName: string | null
  bandSlug: string | null
  compatibility: {
    overallScore: number
    status: CompatibilityStatus
    dealBreakers: string[]
  }
}

interface CompatibleRidersSectionProps {
  venueId: string
}

export function CompatibleRidersSection({ venueId }: CompatibleRidersSectionProps) {
  const [riders, setRiders] = useState<CompatibleRider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/compatibility/venue/${venueId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load compatible riders')
        return res.json()
      })
      .then((data) => {
        setRiders(data.compatibleRiders || [])
      })
      .catch((err) => {
        setError(err.message)
        setRiders([])
      })
      .finally(() => setLoading(false))
  }, [venueId])

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

  if (riders.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No Spider Riders published yet. Bands can publish touring terms for you to accept.
      </p>
    )
  }

  const topRiders = riders.slice(0, 6)
  const compatibleCount = riders.filter(
    (r) => r.compatibility.status !== 'incompatible'
  ).length

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {compatibleCount} Spider Rider{compatibleCount !== 1 ? 's' : ''} compatible with your venue (of {riders.length} total)
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topRiders.map((r) => (
          <Link
            key={r.riderId}
            href={`/book/spider-riders/${r.riderId}`}
            className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {r.bandName || 'Unknown Band'}
              </span>
              <CompatibilityBadge
                score={r.compatibility.overallScore}
                status={r.compatibility.status}
                size="sm"
              />
            </div>
            {r.riderCode && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono block mb-1">
                {r.riderCode}
              </span>
            )}
            <span className="text-xs text-amber-600 dark:text-amber-400">
              View rider & accept →
            </span>
          </Link>
        ))}
      </div>
      {riders.length > 6 && (
        <Link
          href="/book/spider-riders"
          className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
        >
          Browse all Spider Riders →
        </Link>
      )}
    </div>
  )
}
