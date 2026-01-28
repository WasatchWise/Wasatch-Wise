'use client'

import { useState } from 'react'
import { addBandAvailability, deleteBandAvailability } from '@/app/actions/availability'
import Button from './Button'

interface Availability {
  id: string
  start_date: string
  end_date: string
  notes: string | null
  min_guarantee: number | null
  door_deal_ok: boolean
  willing_to_travel: boolean
  max_travel_miles: number | null
  preferred_venue_types: string[] | null
  is_booked: boolean
}

interface BandAvailabilityManagerProps {
  bandId: string
  bandName: string
  availability: Availability[]
}

const VENUE_TYPES = [
  { value: 'club', label: 'Club' },
  { value: 'bar', label: 'Bar' },
  { value: 'theater', label: 'Theater' },
  { value: 'arena', label: 'Arena' },
  { value: 'festival', label: 'Festival' },
  { value: 'house_show', label: 'House Show' },
]

export default function BandAvailabilityManager({ bandId, bandName, availability }: BandAvailabilityManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [minGuarantee, setMinGuarantee] = useState('')
  const [doorDealOk, setDoorDealOk] = useState(true)
  const [willingToTravel, setWillingToTravel] = useState(true)
  const [maxTravelMiles, setMaxTravelMiles] = useState('')
  const [preferredVenueTypes, setPreferredVenueTypes] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('bandId', bandId)
    formData.append('startDate', startDate)
    formData.append('endDate', endDate || startDate)
    formData.append('notes', notes)
    formData.append('minGuarantee', minGuarantee)
    formData.append('doorDealOk', doorDealOk.toString())
    formData.append('willingToTravel', willingToTravel.toString())
    formData.append('maxTravelMiles', maxTravelMiles)
    preferredVenueTypes.forEach(type => formData.append('preferredVenueTypes', type))

    const result = await addBandAvailability(formData)

    if (result.success) {
      setShowForm(false)
      setStartDate('')
      setEndDate('')
      setNotes('')
      setMinGuarantee('')
      setDoorDealOk(true)
      setWillingToTravel(true)
      setMaxTravelMiles('')
      setPreferredVenueTypes([])
      window.location.reload()
    } else {
      setError(result.error || 'Failed to add availability')
    }

    setLoading(false)
  }

  const handleDelete = async (availabilityId: string) => {
    setDeleting(availabilityId)
    const result = await deleteBandAvailability(availabilityId)
    if (!result.success) {
      setError(result.error || 'Failed to delete')
    } else {
      window.location.reload()
    }
    setDeleting(null)
  }

  const toggleVenueType = (type: string) => {
    setPreferredVenueTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Available Dates
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Add Availability
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for single day</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional info about this availability..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Guarantee ($)
              </label>
              <input
                type="number"
                value={minGuarantee}
                onChange={(e) => setMinGuarantee(e.target.value)}
                min="0"
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={doorDealOk}
                  onChange={(e) => setDoorDealOk(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Door deals OK</span>
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={willingToTravel}
                onChange={(e) => setWillingToTravel(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Willing to travel</span>
            </div>
            {willingToTravel && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Travel (miles)
                </label>
                <input
                  type="number"
                  value={maxTravelMiles}
                  onChange={(e) => setMaxTravelMiles(e.target.value)}
                  min="0"
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Venue Types
            </label>
            <div className="flex flex-wrap gap-2">
              {VENUE_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleVenueType(type.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    preferredVenueTypes.includes(type.value)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading || !startDate}>
              {loading ? 'Adding...' : 'Add Availability'}
            </Button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {availability.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No availability set. Add dates when you're free to play!</p>
          <p className="text-sm mt-1">Venues looking for bands will be able to find you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {availability.map((avail) => (
            <div
              key={avail.id}
              className={`flex items-start justify-between gap-4 p-4 rounded-lg border ${
                avail.is_booked
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {new Date(avail.start_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                  {avail.end_date !== avail.start_date && (
                    <> - {new Date(avail.end_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}</>
                  )}
                </div>
                {avail.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{avail.notes}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  {avail.min_guarantee && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                      ${avail.min_guarantee}+ guarantee
                    </span>
                  )}
                  {avail.door_deal_ok && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                      Door deals OK
                    </span>
                  )}
                  {avail.willing_to_travel && (
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
                      Will travel{avail.max_travel_miles ? ` (${avail.max_travel_miles}mi)` : ''}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(avail.id)}
                disabled={deleting === avail.id}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
              >
                {deleting === avail.id ? 'Deleting...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
