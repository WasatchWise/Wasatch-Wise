'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import SubmitShowForm from './SubmitShowForm'
import Button from './Button'

interface SubmitShowToVenueButtonProps {
  venueId: string
  venueName: string
}

export default function SubmitShowToVenueButton({ venueId, venueName }: SubmitShowToVenueButtonProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [userBands, setUserBands] = useState<Array<{ id: string; name: string }>>([])
  const [selectedBandId, setSelectedBandId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserBands() {
      if (!user) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: bands } = await supabase
        .from('bands')
        .select('id, name')
        .eq('claimed_by', user.id)
        .order('name', { ascending: true })

      setUserBands(bands || [])
      setLoading(false)
    }

    fetchUserBands()
  }, [user])

  if (authLoading || loading) {
    return null
  }

  if (!user) {
    return (
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-3">
          Sign in and claim your band to submit show requests to venues.
        </p>
        <Button onClick={() => router.push('/auth/signin')} className="w-full sm:w-auto">
          Sign In
        </Button>
      </div>
    )
  }

  if (userBands.length === 0) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
          You need to claim a band page first to submit show requests.
        </p>
        <Button onClick={() => router.push('/bands')} className="w-full sm:w-auto">
          Browse Bands
        </Button>
      </div>
    )
  }

  if (showForm && selectedBandId) {
    const selectedBand = userBands.find(b => b.id === selectedBandId)
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Submit Show Request
          </h3>
          <button
            onClick={() => {
              setShowForm(false)
              setSelectedBandId('')
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SubmitShowForm
          bandId={selectedBandId}
          bandName={selectedBand?.name || ''}
          venueId={venueId}
          venueName={venueName}
          onSuccess={() => {
            setShowForm(false)
            setSelectedBandId('')
            router.refresh()
          }}
        />
      </div>
    )
  }

  if (userBands.length === 1) {
    return (
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Want to play at {venueName}?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Submit a show request to this venue. They'll be notified and can respond.
        </p>
        <Button
          onClick={() => {
            setSelectedBandId(userBands[0].id)
            setShowForm(true)
          }}
          className="w-full sm:w-auto"
        >
          Submit Show Request
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Want to play at {venueName}?
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Submit a show request to this venue. They'll be notified and can respond.
      </p>
      <div className="space-y-2 mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Band:
        </label>
        <select
          value={selectedBandId}
          onChange={(e) => setSelectedBandId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">Choose a band...</option>
          {userBands.map(band => (
            <option key={band.id} value={band.id}>
              {band.name}
            </option>
          ))}
        </select>
      </div>
      <Button
        onClick={() => setShowForm(true)}
        disabled={!selectedBandId}
        className="w-full sm:w-auto"
      >
        Submit Show Request
      </Button>
    </div>
  )
}

