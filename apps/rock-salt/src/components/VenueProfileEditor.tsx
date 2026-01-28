'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from './Button'

interface VenueProfileEditorProps {
  venue: {
    id: string
    name: string
    address: string | null
    city: string | null
    state: string | null
    phone: string | null
    email: string | null
    website: string | null
    website_url: string | null
    description: string | null
    notes: string | null
    capacity: number | null
    venue_type: string | null
    social_media_links: any
  }
}

export default function VenueProfileEditor({ venue }: VenueProfileEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [address, setAddress] = useState(venue.address || '')
  const [city, setCity] = useState(venue.city || '')
  const [state, setState] = useState(venue.state || '')
  const [phone, setPhone] = useState(venue.phone || '')
  const [email, setEmail] = useState(venue.email || '')
  const [website, setWebsite] = useState(venue.website || venue.website_url || '')
  const [description, setDescription] = useState(venue.description || '')
  const [notes, setNotes] = useState(venue.notes || '')
  const [capacity, setCapacity] = useState(venue.capacity?.toString() || '')
  const [venueType, setVenueType] = useState(venue.venue_type || '')
  const [facebook, setFacebook] = useState(venue.social_media_links?.facebook || '')
  const [instagram, setInstagram] = useState(venue.social_media_links?.instagram || '')
  const [twitter, setTwitter] = useState(venue.social_media_links?.twitter || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('venues')
        .update({
          address: address.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          website: website.trim() || null,
          website_url: website.trim() || null,
          description: description.trim() || null,
          notes: notes.trim() || null,
          capacity: capacity ? parseInt(capacity) : null,
          venue_type: venueType || null,
          social_media_links: {
            facebook: facebook.trim() || null,
            instagram: instagram.trim() || null,
            twitter: twitter.trim() || null
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', venue.id)

      if (updateError) throw updateError

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
          Edit Venue Information
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

      {/* Location */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="123 Main St"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="UT"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="(801) 555-1234"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="info@venue.com"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://venue.com"
            />
          </div>
        </div>
      </div>

      {/* Venue Details */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Venue Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="venue_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Venue Type
            </label>
            <select
              id="venue_type"
              value={venueType}
              onChange={(e) => setVenueType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select type...</option>
              <option value="club">Club</option>
              <option value="bar">Bar</option>
              <option value="theater">Theater</option>
              <option value="arena">Arena</option>
              <option value="festival">Festival</option>
              <option value="house_show">House Show</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Capacity
            </label>
            <input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="500"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description (Public)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Tell people about your venue, what to expect, the vibe..."
        />
      </div>

      {/* Social Media */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Media</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facebook URL
            </label>
            <input
              id="facebook"
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://facebook.com/venue"
            />
          </div>
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instagram URL
            </label>
            <input
              id="instagram"
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://instagram.com/venue"
            />
          </div>
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Twitter/X URL
            </label>
            <input
              id="twitter"
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://twitter.com/venue"
            />
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Internal Notes (not public)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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

