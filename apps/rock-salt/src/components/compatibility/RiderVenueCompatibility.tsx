'use client'

import { useEffect, useState } from 'react'
import { CompatibilityBreakdown } from './CompatibilityBreakdown'
import type { CompatibilityResult } from '@/lib/compatibility'

interface RiderVenueCompatibilityProps {
  riderId: string
  venues: Array<{ id: string; name: string }>
}

export function RiderVenueCompatibility({ riderId, venues }: RiderVenueCompatibilityProps) {
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(
    venues[0]?.id ?? null
  )
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedVenueId) {
      setResult(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(
      `/api/compatibility/pair?riderId=${encodeURIComponent(riderId)}&venueId=${encodeURIComponent(selectedVenueId)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load compatibility')
        return res.json()
      })
      .then((data) => {
        setResult(data.compatibility)
      })
      .catch((err) => {
        setError(err.message)
        setResult(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [riderId, selectedVenueId])

  if (venues.length === 0) return null

  return (
    <div className="space-y-4">
      {venues.length > 1 && (
        <div>
          <label
            htmlFor="venue-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Compatibility with venue
          </label>
          <select
            id="venue-select"
            value={selectedVenueId ?? ''}
            onChange={(e) => setSelectedVenueId(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <div className="animate-pulse space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && result && (
        <CompatibilityBreakdown
          result={result}
          title={`Compatibility with ${venues.find((v) => v.id === selectedVenueId)?.name ?? 'your venue'}`}
        />
      )}
    </div>
  )
}
