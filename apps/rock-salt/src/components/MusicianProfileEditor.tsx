'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { updateMusicianProfile } from '@/app/actions/updateMusicianProfile'

type MusicianProfileEditorProps = {
  musicianId: string
  claimedBy: string | null
  role: string | null
  location: string | null
  bio: string | null
  instruments: string[] | null
  disciplines: string[] | null
  seekingBand: boolean | null
  availableForLessons: boolean | null
}

export default function MusicianProfileEditor({
  musicianId,
  claimedBy,
  role,
  location,
  bio,
  instruments,
  disciplines,
  seekingBand,
  availableForLessons,
}: MusicianProfileEditorProps) {
  const { user, loading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formState, setFormState] = useState({
    role: role || '',
    location: location || '',
    bio: bio || '',
    instruments: (instruments || []).join(', '),
    disciplines: (disciplines || []).join(', '),
    seekingBand: !!seekingBand,
    availableForLessons: !!availableForLessons,
  })

  if (loading || !user || claimedBy !== user.id) {
    return null
  }

  const handleChange = (field: keyof typeof formState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    const instrumentList = formState.instruments
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const disciplineList = formState.disciplines
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const result = await updateMusicianProfile({
      musicianId,
      role: formState.role || null,
      location: formState.location || null,
      bio: formState.bio || null,
      instruments: instrumentList,
      disciplines: disciplineList,
      seeking_band: formState.seekingBand,
      available_for_lessons: formState.availableForLessons,
    })

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Update failed')
    }

    setSaving(false)
  }

  return (
    <section className="border border-zinc-800 rounded-md p-6 bg-zinc-950">
      <h2 className="text-xl font-semibold text-zinc-100 mb-4">Update profile</h2>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Primary role</label>
          <input
            type="text"
            value={formState.role}
            onChange={(event) => handleChange('role', event.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100"
            placeholder="Bassist, Sound Engineer, Journalist"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Location</label>
          <input
            type="text"
            value={formState.location}
            onChange={(event) => handleChange('location', event.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100"
            placeholder="Salt Lake City, UT"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Instruments (comma-separated)</label>
          <input
            type="text"
            value={formState.instruments}
            onChange={(event) => handleChange('instruments', event.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100"
            placeholder="Bass, Guitar, Keys"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Disciplines (comma-separated)</label>
          <input
            type="text"
            value={formState.disciplines}
            onChange={(event) => handleChange('disciplines', event.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100"
            placeholder="Sound Engineer, Journalist"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Profile note</label>
          <textarea
            value={formState.bio}
            onChange={(event) => handleChange('bio', event.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100"
            placeholder="Short technical profile note."
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={formState.seekingBand}
              onChange={(event) => handleChange('seekingBand', event.target.checked)}
            />
            Seeking band
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={formState.availableForLessons}
              onChange={(event) => handleChange('availableForLessons', event.target.checked)}
            />
            Available for lessons
          </label>
        </div>
        {error && (
          <div className="border border-red-800 bg-red-950/40 text-red-200 rounded-md p-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="border border-emerald-700 bg-emerald-950/30 text-emerald-200 rounded-md p-3 text-sm">
            Profile updated.
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save updates'}
        </button>
      </div>
    </section>
  )
}
