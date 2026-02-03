'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { CompatibilityStatus } from '@/lib/compatibility'

interface Venue {
  id: string
  name: string
}

interface CompatibilityFiltersProps {
  venues: Venue[]
  activeVenueId?: string | null
  selectedStatus?: CompatibilityStatus | null
}

const STATUS_OPTIONS: {
  value: CompatibilityStatus | ''
  label: string
  color: string
}[] = [
  { value: '', label: 'All Riders', color: 'text-gray-600 dark:text-gray-400' },
  { value: 'excellent', label: '✅ Excellent Match', color: 'text-green-600 dark:text-green-400' },
  { value: 'good', label: '👍 Good Match', color: 'text-blue-600 dark:text-blue-400' },
  { value: 'partial', label: '⚠️ Partial Match', color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'incompatible', label: '❌ Incompatible', color: 'text-red-600 dark:text-red-400' },
]

export function CompatibilityFilters({
  venues,
  activeVenueId,
  selectedStatus,
}: CompatibilityFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/book/spider-riders?${params.toString()}`)
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Venue Selector (if multiple venues) */}
        {venues.length > 1 ? (
          <div>
            <label
              htmlFor="venue-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Check compatibility for:
            </label>
            <select
              id="venue-filter"
              value={activeVenueId || ''}
              onChange={(e) => updateFilters('venueId', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          venues.length === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Showing compatibility for:
              </label>
              <div className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                {venues[0].name}
              </div>
            </div>
          )
        )}

        {/* Compatibility Status Filter */}
        <div>
          <label
            htmlFor="compatibility-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Filter by compatibility:
          </label>
          <select
            id="compatibility-filter"
            value={selectedStatus || ''}
            onChange={(e) =>
              updateFilters(
                'compatibility',
                (e.target.value || null) as CompatibilityStatus | null
              )
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Display */}
      {selectedStatus && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Active filter:
          </span>
          <button
            type="button"
            onClick={() => updateFilters('compatibility', null)}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
          >
            {STATUS_OPTIONS.find((opt) => opt.value === selectedStatus)?.label}
            <span className="ml-1">×</span>
          </button>
        </div>
      )}
    </div>
  )
}
