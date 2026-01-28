'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitShow } from '@/app/actions/submitShow'
import Button from './Button'

interface SubmitShowFormProps {
  bandId: string
  bandName: string
  venueId: string
  venueName: string
  onSuccess?: () => void
}

export default function SubmitShowForm({ bandId, bandName, venueId, venueName, onSuccess }: SubmitShowFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proposedDate, setProposedDate] = useState('')
  const [proposedTime, setProposedTime] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('bandId', bandId)
    formData.append('venueId', venueId)
    formData.append('proposedDate', proposedDate)
    formData.append('proposedTime', proposedTime)
    formData.append('message', message)

    const result = await submitShow(formData)

    if (result.success) {
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } else {
      setError(result.error || 'Failed to submit show request')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          <strong>{bandName}</strong> → <strong>{venueName}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="proposedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proposed Date
          </label>
          <input
            id="proposedDate"
            type="date"
            value={proposedDate}
            onChange={(e) => setProposedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="proposedTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proposed Time (optional)
          </label>
          <input
            id="proposedTime"
            type="time"
            value={proposedTime}
            onChange={(e) => setProposedTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Message to Venue
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Tell the venue about your band, what kind of show you're looking for, expected draw, etc..."
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="px-6">
          {loading ? 'Submitting...' : 'Submit Show Request'}
        </Button>
        {onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

