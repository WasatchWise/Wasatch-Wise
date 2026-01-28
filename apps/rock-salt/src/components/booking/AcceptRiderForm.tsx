'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AcceptRiderFormProps {
  riderId: string
  bandName: string
  venues: Array<{ id: string; name: string }>
}

export default function AcceptRiderForm({
  riderId,
  bandName,
  venues,
}: AcceptRiderFormProps) {
  const router = useRouter()
  const [selectedVenue, setSelectedVenue] = useState(venues[0]?.id || '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedVenue) {
      setError('Please select a venue')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/spider-rider/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spiderRiderId: riderId,
          venueId: selectedVenue,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to accept Spider Rider')
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      console.error('Error accepting rider:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎉</span>
          <h3 className="font-bold text-green-800 dark:text-green-200">
            Accepted!
          </h3>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mb-4">
          You've accepted {bandName}'s Spider Rider. They're now pre-approved for your venue.
        </p>
        <button
          onClick={() => router.push('/dashboard/bookings')}
          className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          View Bookings
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
        Accept Spider Rider
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Pre-approve {bandName} to play at your venue under these terms.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Venue Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Venue
          </label>
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any modifications or notes for the band..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Accepting...' : 'Accept Terms'}
        </button>
      </form>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        By accepting, you agree to the financial and technical terms above. You can request specific booking dates after acceptance.
      </p>
    </div>
  )
}
