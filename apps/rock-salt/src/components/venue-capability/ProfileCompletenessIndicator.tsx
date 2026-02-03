'use client'

import Link from 'next/link'
import {
  calculateVenueProfileCompleteness,
  getCompletenessStatus,
  type VenueForCompleteness,
} from '@/lib/venue/profile-completeness'

interface ProfileCompletenessIndicatorProps {
  venue: VenueForCompleteness
  showDetails?: boolean
  showEditButton?: boolean
}

const COLOR_CLASSES = {
  red: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    progress: 'bg-red-600',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    progress: 'bg-yellow-600',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    progress: 'bg-blue-600',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    progress: 'bg-green-600',
  },
} as const

export default function ProfileCompletenessIndicator({
  venue,
  showDetails = false,
  showEditButton = true,
}: ProfileCompletenessIndicatorProps) {
  const { percentage, filledFields, totalFields, missingFields } =
    calculateVenueProfileCompleteness(venue)
  const { color, message } = getCompletenessStatus(percentage)
  const colors = COLOR_CLASSES[color]

  return (
    <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Profile Completeness
          </h3>
          <p className={`text-sm ${colors.text}`}>{message}</p>
        </div>
        <div className={`text-2xl font-bold ${colors.text}`}>{percentage}%</div>
      </div>

      <div className="mb-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${colors.progress}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {filledFields} of {totalFields} fields completed
        </p>
      </div>

      {showDetails && missingFields.length > 0 && (
        <details className="mb-3">
          <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:underline">
            Missing fields ({missingFields.length})
          </summary>
          <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1 pl-4">
            {missingFields.slice(0, 5).map((field, i) => (
              <li key={i}>• {field}</li>
            ))}
            {missingFields.length > 5 && (
              <li className="italic">
                • ... and {missingFields.length - 5} more
              </li>
            )}
          </ul>
        </details>
      )}

      {showEditButton && percentage < 100 && venue.id && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Complete your profile to improve compatibility matching
          </p>
          <Link
            href={`/dashboard/venues/${venue.id}?tab=capabilities`}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${colors.text} hover:opacity-80 transition-opacity`}
          >
            {percentage === 0 ? 'Start Profile' : 'Complete Profile'} →
          </Link>
        </div>
      )}
    </div>
  )
}
