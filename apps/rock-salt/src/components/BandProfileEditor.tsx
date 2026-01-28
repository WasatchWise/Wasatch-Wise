'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from './Button'

interface BandProfileEditorProps {
  band: {
    id: string
    name: string
    bio: string | null
    description: string | null
    origin_city: string | null
    state: string | null
    country: string | null
    formed_year: number | null
    disbanded_year: number | null
    status: string | null
    website_url: string | null
    spotify_url: string | null
    bandcamp_url: string | null
    instagram_handle: string | null
    facebook_url: string | null
    youtube_url: string | null
    press_contact: string | null
    notes: string | null
    band_links?: Array<{ id: string; label: string | null; url: string | null }> | null
    band_genres?: Array<{ genre: { id: string; name: string } | null }> | null
  }
  availableGenres: Array<{ id: string; name: string }>
}

export default function BandProfileEditor({ band, availableGenres }: BandProfileEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [bio, setBio] = useState(band.bio || '')
  const [description, setDescription] = useState(band.description || '')
  const [originCity, setOriginCity] = useState(band.origin_city || '')
  const [state, setState] = useState(band.state || '')
  const [country, setCountry] = useState(band.country || 'USA')
  const [formedYear, setFormedYear] = useState(band.formed_year?.toString() || '')
  const [disbandedYear, setDisbandedYear] = useState(band.disbanded_year?.toString() || '')
  const [status, setStatus] = useState(band.status || 'active')
  const [websiteUrl, setWebsiteUrl] = useState(band.website_url || '')
  const [spotifyUrl, setSpotifyUrl] = useState(band.spotify_url || '')
  const [bandcampUrl, setBandcampUrl] = useState(band.bandcamp_url || '')
  const [instagramHandle, setInstagramHandle] = useState(band.instagram_handle || '')
  const [facebookUrl, setFacebookUrl] = useState(band.facebook_url || '')
  const [youtubeUrl, setYoutubeUrl] = useState(band.youtube_url || '')
  const [pressContact, setPressContact] = useState(band.press_contact || '')
  const [notes, setNotes] = useState(band.notes || '')
  
  // Links management
  const [links, setLinks] = useState<Array<{ id?: string; label: string; url: string }>>(
    band.band_links?.map(l => ({ id: l.id, label: l.label || '', url: l.url || '' })) || []
  )
  
  // Genres management
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    band.band_genres?.map(bg => bg.genre?.id).filter(Boolean) as string[] || []
  )

  const addLink = () => {
    setLinks([...links, { label: '', url: '' }])
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...links]
    updated[index] = { ...updated[index], [field]: value }
    setLinks(updated)
  }

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      // Update band basic info
      const { error: updateError } = await supabase
        .from('bands')
        .update({
          bio: bio.trim() || null,
          description: description.trim() || null,
          origin_city: originCity.trim() || null,
          state: state.trim() || null,
          country: country.trim() || 'USA',
          formed_year: formedYear ? parseInt(formedYear) : null,
          disbanded_year: disbandedYear ? parseInt(disbandedYear) : null,
          status: status || 'active',
          website_url: websiteUrl.trim() || null,
          spotify_url: spotifyUrl.trim() || null,
          bandcamp_url: bandcampUrl.trim() || null,
          instagram_handle: instagramHandle.trim() || null,
          facebook_url: facebookUrl.trim() || null,
          youtube_url: youtubeUrl.trim() || null,
          press_contact: pressContact.trim() || null,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', band.id)

      if (updateError) throw updateError

      // Update links
      const existingLinkIds = links.filter(l => l.id).map(l => l.id!)
      const { data: existingLinks } = await supabase
        .from('band_links')
        .select('id')
        .eq('band_id', band.id)

      const existingLinkIdsInDb = existingLinks?.map(l => l.id) || []
      
      // Delete removed links
      const toDelete = existingLinkIdsInDb.filter(id => !existingLinkIds.includes(id))
      if (toDelete.length > 0) {
        await supabase
          .from('band_links')
          .delete()
          .in('id', toDelete)
      }

      // Insert/update links
      for (const link of links) {
        if (link.url.trim()) {
          if (link.id) {
            // Update existing
            await supabase
              .from('band_links')
              .update({
                label: link.label.trim() || null,
                url: link.url.trim()
              })
              .eq('id', link.id)
          } else {
            // Insert new
            await supabase
              .from('band_links')
              .insert({
                band_id: band.id,
                label: link.label.trim() || null,
                url: link.url.trim()
              })
          }
        }
      }

      // Update genres
      // First, get current genres
      const { data: currentGenres } = await supabase
        .from('band_genres')
        .select('genre_id')
        .eq('band_id', band.id)

      const currentGenreIds = currentGenres?.map(cg => cg.genre_id).filter(Boolean) as string[] || []

      // Remove genres that are no longer selected
      const toRemove = currentGenreIds.filter(id => !selectedGenres.includes(id))
      if (toRemove.length > 0) {
        await supabase
          .from('band_genres')
          .delete()
          .eq('band_id', band.id)
          .in('genre_id', toRemove)
      }

      // Add new genres
      const toAdd = selectedGenres.filter(id => !currentGenreIds.includes(id))
      if (toAdd.length > 0) {
        await supabase
          .from('band_genres')
          .insert(
            toAdd.map(genreId => ({
              band_id: band.id,
              genre_id: genreId
            }))
          )
      }

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Profile
        </h2>
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
            <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio (Short Description)
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="A short bio that appears on your band page..."
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Full Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="A longer description of your band, history, influences, etc..."
        />
      </div>

      {/* Location & Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="origin_city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City
          </label>
          <input
            id="origin_city"
            type="text"
            value={originCity}
            onChange={(e) => setOriginCity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Salt Lake City"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State
          </label>
          <input
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="UT"
          />
        </div>
        <div>
          <label htmlFor="formed_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Formed Year
          </label>
          <input
            id="formed_year"
            type="number"
            value={formedYear}
            onChange={(e) => setFormedYear(e.target.value)}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="2020"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="hiatus">Hiatus</option>
            <option value="dissolved">Dissolved</option>
            <option value="reunited">Reunited</option>
          </select>
        </div>
        {status === 'dissolved' && (
          <div>
            <label htmlFor="disbanded_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Disbanded Year
            </label>
            <input
              id="disbanded_year"
              type="number"
              value={disbandedYear}
              onChange={(e) => setDisbandedYear(e.target.value)}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="2023"
            />
          </div>
        )}
      </div>

      {/* Social Media Links */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Media & Links</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL
            </label>
            <input
              id="website_url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://yourband.com"
            />
          </div>
          <div>
            <label htmlFor="spotify_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Spotify URL
            </label>
            <input
              id="spotify_url"
              type="url"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://open.spotify.com/artist/..."
            />
          </div>
          <div>
            <label htmlFor="bandcamp_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bandcamp URL
            </label>
            <input
              id="bandcamp_url"
              type="url"
              value={bandcampUrl}
              onChange={(e) => setBandcampUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://yourband.bandcamp.com"
            />
          </div>
          <div>
            <label htmlFor="instagram_handle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instagram Handle
            </label>
            <input
              id="instagram_handle"
              type="text"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="yourband"
            />
          </div>
          <div>
            <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facebook URL
            </label>
            <input
              id="facebook_url"
              type="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://facebook.com/yourband"
            />
          </div>
          <div>
            <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              YouTube URL
            </label>
            <input
              id="youtube_url"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://youtube.com/@yourband"
            />
          </div>
        </div>
      </div>

      {/* Additional Links */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Links</h3>
          <button
            type="button"
            onClick={addLink}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Add Link
          </button>
        </div>
        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(index, 'label', e.target.value)}
                placeholder="Label (e.g., SoundCloud)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genres</h3>
        <div className="flex flex-wrap gap-2">
          {availableGenres.map(genre => (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGenres.includes(genre.id)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Press Contact */}
      <div>
        <label htmlFor="press_contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Press Contact Email
        </label>
        <input
          id="press_contact"
          type="email"
          value={pressContact}
          onChange={(e) => setPressContact(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="press@yourband.com"
        />
      </div>

      {/* Notes (Internal) */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Internal Notes (not public)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Internal notes for your reference..."
        />
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="submit" disabled={loading} className="px-6">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

