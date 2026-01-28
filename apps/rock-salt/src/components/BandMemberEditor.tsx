'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Musician {
  id: string
  name: string
  slug: string
  role?: string | null
}

interface BandMember {
  band_id: string
  musician_id: string
  role: string | null
  instrument: string | null
  tenure_start: string | null
  tenure_end: string | null
  added_by?: string | null
  verification_count?: number
  musicians: Musician
}

interface BandMemberEditorProps {
  bandId: string
  bandName: string
  isOwner: boolean
}

export default function BandMemberEditor({ bandId, bandName, isOwner }: BandMemberEditorProps) {
  const [members, setMembers] = useState<BandMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Musician[]>([])
  const [searching, setSearching] = useState(false)
  const [showAddNew, setShowAddNew] = useState(false)
  const [newMusician, setNewMusician] = useState({ name: '', role: '', instrument: '' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch current members
  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('band_members')
      .select(`
        band_id,
        musician_id,
        role,
        instrument,
        tenure_start,
        tenure_end,
        added_by,
        verification_count,
        musicians (
          id,
          name,
          slug,
          role
        )
      `)
      .eq('band_id', bandId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching members:', error)
    } else {
      setMembers((data as unknown as BandMember[]) || [])
    }
    setLoading(false)
  }, [bandId, supabase])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Search for musicians
  const searchMusicians = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    const { data, error } = await supabase
      .from('musicians')
      .select('id, name, slug, role')
      .ilike('name', `%${query}%`)
      .limit(10)

    if (!error && data) {
      // Filter out musicians already in the band
      const existingIds = new Set(members.map(m => m.musician_id))
      setSearchResults(data.filter(m => !existingIds.has(m.id)))
    }
    setSearching(false)
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchMusicians(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, members])

  // Add existing musician to band
  const addExistingMusician = async (musician: Musician, role?: string, instrument?: string) => {
    setAdding(true)
    setError(null)

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('band_members')
      .insert({
        band_id: bandId,
        musician_id: musician.id,
        role: role || null,
        instrument: instrument || null,
        added_by: userData.user?.id,
      })

    if (error) {
      setError(error.message)
    } else {
      setSearchQuery('')
      setSearchResults([])
      fetchMembers()
    }
    setAdding(false)
  }

  // Create new musician and add to band
  const createAndAddMusician = async () => {
    if (!newMusician.name.trim()) {
      setError('Name is required')
      return
    }

    setAdding(true)
    setError(null)

    const { data: userData } = await supabase.auth.getUser()

    // Create slug from name
    const slug = newMusician.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create the musician
    const { data: newMusicianData, error: createError } = await supabase
      .from('musicians')
      .insert({
        name: newMusician.name.trim(),
        slug,
        role: newMusician.role || null,
      })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      setAdding(false)
      return
    }

    // Add to band
    const { error: addError } = await supabase
      .from('band_members')
      .insert({
        band_id: bandId,
        musician_id: newMusicianData.id,
        role: newMusician.role || null,
        instrument: newMusician.instrument || null,
        added_by: userData.user?.id,
      })

    if (addError) {
      setError(addError.message)
    } else {
      setNewMusician({ name: '', role: '', instrument: '' })
      setShowAddNew(false)
      fetchMembers()
    }
    setAdding(false)
  }

  // Remove member from band
  const removeMember = async (musicianId: string) => {
    if (!confirm('Remove this member from the band?')) return

    const { error } = await supabase
      .from('band_members')
      .delete()
      .eq('band_id', bandId)
      .eq('musician_id', musicianId)

    if (error) {
      setError(error.message)
    } else {
      fetchMembers()
    }
  }

  // Verify a membership (any user can do this)
  // Note: This requires the verify_band_membership RPC function to be deployed
  const verifyMember = async (musicianId: string) => {
    try {
      const { error } = await supabase.rpc('verify_band_membership', {
        p_band_id: bandId,
        p_musician_id: musicianId,
      })

      if (error) {
        // Silently fail if RPC doesn't exist yet
        console.log('Vouch feature not yet enabled:', error.message)
      } else {
        fetchMembers()
      }
    } catch (e) {
      console.log('Vouch feature not available')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Band Members
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {members.length} member{members.length !== 1 ? 's' : ''} • Scene genealogy powered by the community
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Current Members List */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No members added yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {isOwner ? 'Add members who play in this band' : 'The band owner can add members'}
            </p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.musician_id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {member.musicians.name.charAt(0)}
                </div>
                <div>
                  <a
                    href={`/musicians/${member.musicians.slug}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {member.musicians.name}
                  </a>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {member.role && <span>{member.role}</span>}
                    {member.role && member.instrument && <span>•</span>}
                    {member.instrument && <span>{member.instrument}</span>}
                  </div>
                  {member.tenure_start && (
                    <div className="text-xs text-gray-400">
                      {member.tenure_start}{member.tenure_end ? ` - ${member.tenure_end}` : ' - present'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Verification badge */}
                {(member.verification_count ?? 0) > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {member.verification_count} vouch{(member.verification_count ?? 0) !== 1 ? 'es' : ''}
                  </div>
                )}

                {/* Vouch button */}
                <button
                  onClick={() => verifyMember(member.musician_id)}
                  className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  title="Vouch for this connection"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </button>

                {/* Remove button (owner only) */}
                {isOwner && (
                  <button
                    onClick={() => removeMember(member.musician_id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Remove member"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Member Section (Owner only) */}
      {isOwner && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add Member
          </h3>

          {/* Search existing musicians */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a musician..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              </div>
            )}

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map((musician) => (
                  <button
                    key={musician.id}
                    onClick={() => addExistingMusician(musician)}
                    disabled={adding}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {musician.name}
                      </p>
                      {musician.role && (
                        <p className="text-sm text-gray-500">{musician.role}</p>
                      )}
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 text-sm font-medium">
                      + Add
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  No musicians found matching "{searchQuery}"
                </p>
                <button
                  onClick={() => {
                    setNewMusician({ ...newMusician, name: searchQuery })
                    setShowAddNew(true)
                    setSearchQuery('')
                  }}
                  className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
                >
                  + Create "{searchQuery}" as new musician
                </button>
              </div>
            )}
          </div>

          {/* Create new musician form */}
          {showAddNew && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Add New Musician
                </h4>
                <button
                  onClick={() => setShowAddNew(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newMusician.name}
                    onChange={(e) => setNewMusician({ ...newMusician, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={newMusician.role}
                    onChange={(e) => setNewMusician({ ...newMusician, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Lead Vocals"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instrument
                  </label>
                  <input
                    type="text"
                    value={newMusician.instrument}
                    onChange={(e) => setNewMusician({ ...newMusician, instrument: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Guitar"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddNew(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={createAndAddMusician}
                  disabled={adding || !newMusician.name.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? 'Adding...' : 'Add Musician'}
                </button>
              </div>
            </div>
          )}

          {!showAddNew && (
            <button
              onClick={() => setShowAddNew(true)}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
            >
              + Add someone not in our database
            </button>
          )}
        </div>
      )}

      {/* Info for non-owners */}
      {!isOwner && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Know someone who played in {bandName}?{' '}
            <button className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Suggest a member
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
