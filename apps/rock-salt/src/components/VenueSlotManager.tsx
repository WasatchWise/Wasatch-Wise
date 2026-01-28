'use client'

import { useState } from 'react'
import { addVenueSlot, deleteVenueSlot } from '@/app/actions/availability'
import Button from './Button'

interface VenueSlot {
  id: string
  slot_date: string
  title: string | null
  description: string | null
  load_in_time: string | null
  set_time: string | null
  set_length_minutes: number | null
  compensation_type: string | null
  guarantee_amount: number | null
  door_split_percentage: number | null
  expected_draw: number | null
  backline_provided: boolean
  sound_engineer_provided: boolean
  age_restriction: string | null
  preferred_genres: string[] | null
  status: string
}

interface VenueSlotManagerProps {
  venueId: string
  venueName: string
  slots: VenueSlot[]
}

const GENRES = [
  'Rock', 'Punk', 'Metal', 'Indie', 'Folk', 'Country', 'Blues',
  'Jazz', 'Hip-Hop', 'Electronic', 'Pop', 'R&B', 'Soul', 'Funk', 'Reggae'
]

export default function VenueSlotManager({ venueId, venueName, slots }: VenueSlotManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [slotDate, setSlotDate] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loadInTime, setLoadInTime] = useState('')
  const [setTime, setSetTime] = useState('')
  const [setLengthMinutes, setSetLengthMinutes] = useState('')
  const [compensationType, setCompensationType] = useState('negotiable')
  const [guaranteeAmount, setGuaranteeAmount] = useState('')
  const [doorSplitPercentage, setDoorSplitPercentage] = useState('80')
  const [expectedDraw, setExpectedDraw] = useState('')
  const [backlineProvided, setBacklineProvided] = useState(false)
  const [soundEngineerProvided, setSoundEngineerProvided] = useState(true)
  const [ageRestriction, setAgeRestriction] = useState('21+')
  const [preferredGenres, setPreferredGenres] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('venueId', venueId)
    formData.append('slotDate', slotDate)
    formData.append('title', title)
    formData.append('description', description)
    formData.append('loadInTime', loadInTime)
    formData.append('setTime', setTime)
    formData.append('setLengthMinutes', setLengthMinutes)
    formData.append('compensationType', compensationType)
    formData.append('guaranteeAmount', guaranteeAmount)
    formData.append('doorSplitPercentage', doorSplitPercentage)
    formData.append('expectedDraw', expectedDraw)
    formData.append('backlineProvided', backlineProvided.toString())
    formData.append('soundEngineerProvided', soundEngineerProvided.toString())
    formData.append('ageRestriction', ageRestriction)
    preferredGenres.forEach(genre => formData.append('preferredGenres', genre))

    const result = await addVenueSlot(formData)

    if (result.success) {
      setShowForm(false)
      // Reset form
      setSlotDate('')
      setTitle('')
      setDescription('')
      setLoadInTime('')
      setSetTime('')
      setSetLengthMinutes('')
      setCompensationType('negotiable')
      setGuaranteeAmount('')
      setDoorSplitPercentage('80')
      setExpectedDraw('')
      setBacklineProvided(false)
      setSoundEngineerProvided(true)
      setAgeRestriction('21+')
      setPreferredGenres([])
      window.location.reload()
    } else {
      setError(result.error || 'Failed to add slot')
    }

    setLoading(false)
  }

  const handleDelete = async (slotId: string) => {
    setDeleting(slotId)
    const result = await deleteVenueSlot(slotId)
    if (!result.success) {
      setError(result.error || 'Failed to delete')
    } else {
      window.location.reload()
    }
    setDeleting(null)
  }

  const toggleGenre = (genre: string) => {
    setPreferredGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const getCompensationLabel = (slot: VenueSlot) => {
    switch (slot.compensation_type) {
      case 'guarantee':
        return slot.guarantee_amount ? `$${slot.guarantee_amount} guarantee` : 'Guarantee'
      case 'door_split':
        return slot.door_split_percentage ? `${slot.door_split_percentage}% door split` : 'Door split'
      case 'tips_only':
        return 'Tips only'
      default:
        return 'Negotiable'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Open Slots
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
          >
            + Add Open Slot
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
                Date *
              </label>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Friday Night Rock Show"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What kind of act are you looking for?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Load-in Time
              </label>
              <input
                type="time"
                value={loadInTime}
                onChange={(e) => setLoadInTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Set Time
              </label>
              <input
                type="time"
                value={setTime}
                onChange={(e) => setSetTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Set Length (min)
              </label>
              <input
                type="number"
                value={setLengthMinutes}
                onChange={(e) => setSetLengthMinutes(e.target.value)}
                placeholder="45"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Compensation Type
              </label>
              <select
                value={compensationType}
                onChange={(e) => setCompensationType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="negotiable">Negotiable</option>
                <option value="guarantee">Guarantee</option>
                <option value="door_split">Door Split</option>
                <option value="tips_only">Tips Only</option>
              </select>
            </div>
            {compensationType === 'guarantee' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Guarantee Amount ($)
                </label>
                <input
                  type="number"
                  value={guaranteeAmount}
                  onChange={(e) => setGuaranteeAmount(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            {compensationType === 'door_split' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Band's Split (%)
                </label>
                <input
                  type="number"
                  value={doorSplitPercentage}
                  onChange={(e) => setDoorSplitPercentage(e.target.value)}
                  min="0"
                  max="100"
                  placeholder="80"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Draw
              </label>
              <input
                type="number"
                value={expectedDraw}
                onChange={(e) => setExpectedDraw(e.target.value)}
                placeholder="How many people should band bring?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Age Restriction
              </label>
              <select
                value={ageRestriction}
                onChange={(e) => setAgeRestriction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all_ages">All Ages</option>
                <option value="18+">18+</option>
                <option value="21+">21+</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={backlineProvided}
                onChange={(e) => setBacklineProvided(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Backline provided</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={soundEngineerProvided}
                onChange={(e) => setSoundEngineerProvided(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Sound engineer provided</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    preferredGenres.includes(genre)
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading || !slotDate}>
              {loading ? 'Adding...' : 'Add Open Slot'}
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

      {slots.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No open slots. Add dates when you need a band!</p>
          <p className="text-sm mt-1">Bands looking for shows will be able to find you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {new Date(slot.slot_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                  {slot.title && <span className="font-normal text-gray-600 dark:text-gray-400"> - {slot.title}</span>}
                </div>
                {slot.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{slot.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                    {getCompensationLabel(slot)}
                  </span>
                  {slot.set_time && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                      {slot.set_time}
                      {slot.set_length_minutes && ` (${slot.set_length_minutes}min)`}
                    </span>
                  )}
                  {slot.age_restriction && (
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
                      {slot.age_restriction}
                    </span>
                  )}
                  {slot.backline_provided && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                      Backline
                    </span>
                  )}
                </div>
                {slot.preferred_genres && slot.preferred_genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {slot.preferred_genres.map(genre => (
                      <span key={genre} className="text-xs text-gray-500 dark:text-gray-400">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(slot.id)}
                disabled={deleting === slot.id}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
              >
                {deleting === slot.id ? 'Deleting...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
