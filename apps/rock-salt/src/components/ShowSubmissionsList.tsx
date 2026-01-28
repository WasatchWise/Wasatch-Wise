'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { respondToShow } from '@/app/actions/respondToShow'
import { getOrCreateConversation } from '@/app/actions/messages'
import Button from './Button'

interface ShowSubmission {
  id: string
  band_id?: string
  venue_id?: string
  proposed_date: string | null
  proposed_time: string | null
  message: string | null
  status: string
  venue_response: string | null
  counter_date: string | null
  counter_time: string | null
  created_at: string
  bands: {
    id: string
    name: string
    slug: string
  }
}

interface ShowSubmissionsListProps {
  submissions: ShowSubmission[]
  type: 'band' | 'venue'
}

export default function ShowSubmissionsList({ submissions, type }: ShowSubmissionsListProps) {
  const router = useRouter()
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseStatus, setResponseStatus] = useState<'accepted' | 'declined' | 'counter_offer' | null>(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [counterDate, setCounterDate] = useState('')
  const [counterTime, setCounterTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startingConversation, setStartingConversation] = useState<string | null>(null)

  const handleRespond = async (submissionId: string) => {
    if (!responseStatus) return

    setLoading(true)
    setError(null)

    const result = await respondToShow(
      submissionId,
      responseStatus,
      responseMessage || undefined,
      counterDate || undefined,
      counterTime || undefined
    )

    if (result.success) {
      setRespondingTo(null)
      setResponseStatus(null)
      setResponseMessage('')
      setCounterDate('')
      setCounterTime('')
      window.location.reload()
    } else {
      setError(result.error || 'Failed to respond')
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
      case 'declined':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
      case 'counter_offer':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {type === 'band' 
          ? "No show submissions yet. Submit a show request to a venue to get started!"
          : "No show submissions yet. Bands will be able to submit show requests to your venue here."}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {type === 'band' ? 'To: ' : 'From: '}
                <a
                  href={type === 'band' ? `/venues/${submission.bands.slug}` : `/bands/${submission.bands.slug}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {submission.bands.name}
                </a>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Submitted {new Date(submission.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
              {submission.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {submission.proposed_date && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Proposed Date:</strong>{' '}
                {new Date(submission.proposed_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
                {submission.proposed_time && ` at ${submission.proposed_time}`}
              </p>
            </div>
          )}

          {submission.message && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {submission.message}
              </p>
            </div>
          )}

          {submission.status === 'counter_offer' && submission.counter_date && (
            <div className="mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Counter Offer:</strong>{' '}
                {new Date(submission.counter_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
                {submission.counter_time && ` at ${submission.counter_time}`}
              </p>
            </div>
          )}

          {submission.venue_response && (
            <div className="mb-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Venue Response:</strong> {submission.venue_response}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            {type === 'venue' && submission.status === 'pending' && (
              <>
                {respondingTo === submission.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Response
                    </label>
                    <select
                      value={responseStatus || ''}
                      onChange={(e) => setResponseStatus(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select response...</option>
                      <option value="accepted">Accept</option>
                      <option value="declined">Decline</option>
                      <option value="counter_offer">Counter Offer</option>
                    </select>
                  </div>

                  {responseStatus && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Message (optional)
                        </label>
                        <textarea
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Add a message to the band..."
                        />
                      </div>

                      {responseStatus === 'counter_offer' && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Counter Date
                            </label>
                            <input
                              type="date"
                              value={counterDate}
                              onChange={(e) => setCounterDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Counter Time
                            </label>
                            <input
                              type="time"
                              value={counterTime}
                              onChange={(e) => setCounterTime(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRespond(submission.id)}
                          disabled={loading || !responseStatus || (responseStatus === 'counter_offer' && !counterDate)}
                          className="px-4"
                        >
                          {loading ? 'Sending...' : 'Send Response'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => {
                            setRespondingTo(null)
                            setResponseStatus(null)
                            setResponseMessage('')
                            setCounterDate('')
                            setCounterTime('')
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
                ) : (
                  <Button
                    onClick={() => setRespondingTo(submission.id)}
                    className="px-4"
                  >
                    Respond
                  </Button>
                )}
              </>
            )}
            
            {/* Message Button - available for both sides */}
            {submission.band_id && submission.venue_id && (
              <Button
                onClick={async () => {
                  if (!submission.band_id || !submission.venue_id) return
                  
                  setStartingConversation(submission.id)
                  const result = await getOrCreateConversation(submission.band_id, submission.venue_id)
                  
                  if (result.success && result.conversationId) {
                    router.push(`/dashboard/messages/${result.conversationId}`)
                  } else {
                    setError(result.error || 'Failed to start conversation')
                    setStartingConversation(null)
                  }
                }}
                disabled={startingConversation === submission.id}
                className="px-4"
                variant="outline"
              >
                {startingConversation === submission.id ? 'Opening...' : (
                  <>
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

