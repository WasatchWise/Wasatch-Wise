'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { getOrCreateConversation } from '@/app/actions/messages'
import Button from './Button'

interface StartConversationButtonProps {
  targetType: 'band' | 'venue'
  targetId: string
  targetName: string
}

export default function StartConversationButton({ targetType, targetId, targetName }: StartConversationButtonProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myEntities, setMyEntities] = useState<Array<{ id: string; name: string; type: 'band' | 'venue' }>>([])
  const [selectedEntity, setSelectedEntity] = useState<string>('')

  useEffect(() => {
    async function fetchMyEntities() {
      if (!user) {
        setLoading(false)
        return
      }

      const supabase = createClient()

      // If target is a venue, get user's bands. If target is a band, get user's venues.
      if (targetType === 'venue') {
        const { data: bands } = await supabase
          .from('bands')
          .select('id, name')
          .eq('claimed_by', user.id)
          .order('name', { ascending: true })

        setMyEntities(bands?.map(b => ({ ...b, type: 'band' as const })) || [])
      } else {
        const { data: venues } = await supabase
          .from('venues')
          .select('id, name')
          .eq('claimed_by', user.id)
          .order('name', { ascending: true })

        setMyEntities(venues?.map(v => ({ ...v, type: 'venue' as const })) || [])
      }

      setLoading(false)
    }

    fetchMyEntities()
  }, [user, targetType])

  if (authLoading || loading) {
    return null
  }

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Sign in to message {targetName}
        </p>
        <Button onClick={() => router.push('/auth/signin')} className="w-full sm:w-auto">
          Sign In
        </Button>
      </div>
    )
  }

  if (myEntities.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {targetType === 'venue'
            ? 'Claim a band to message venues'
            : 'Claim a venue to message bands'}
        </p>
        <Button
          onClick={() => router.push(targetType === 'venue' ? '/bands' : '/venues')}
          className="w-full sm:w-auto"
        >
          Browse {targetType === 'venue' ? 'Bands' : 'Venues'}
        </Button>
      </div>
    )
  }

  const handleStartConversation = async () => {
    const entityId = selectedEntity || myEntities[0]?.id
    if (!entityId) return

    setStarting(true)
    setError(null)

    const bandId = targetType === 'venue' ? entityId : targetId
    const venueId = targetType === 'venue' ? targetId : entityId

    const result = await getOrCreateConversation(bandId, venueId)

    if (result.success && result.conversationId) {
      router.push(`/dashboard/messages/${result.conversationId}`)
    } else {
      setError(result.error || 'Failed to start conversation')
      setStarting(false)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        Message {targetName}
      </h3>

      {error && (
        <div className="mb-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {myEntities.length > 1 && (
        <div className="mb-3">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Message as:
          </label>
          <select
            value={selectedEntity || myEntities[0]?.id}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          >
            {myEntities.map(entity => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button
        onClick={handleStartConversation}
        disabled={starting}
        className="w-full"
      >
        {starting ? 'Starting...' : (
          <>
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Send Message
          </>
        )}
      </Button>
    </div>
  )
}
