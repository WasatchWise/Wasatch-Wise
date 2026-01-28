'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type UpdatePayload = {
  musicianId: string
  role?: string | null
  location?: string | null
  bio?: string | null
  instruments?: string[] | null
  disciplines?: string[] | null
  seeking_band?: boolean
  available_for_lessons?: boolean
}

export async function updateMusicianProfile(payload: UpdatePayload) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to update this profile' }
  }

  const { data: musician, error: fetchError } = await supabase
    .from('musicians')
    .select('id, slug, claimed_by')
    .eq('id', payload.musicianId)
    .single()

  if (fetchError || !musician) {
    return { success: false, error: 'Musician not found' }
  }

  if (musician.claimed_by !== user.id) {
    return { success: false, error: 'You do not have permission to update this profile' }
  }

  const { error: updateError } = await supabase
    .from('musicians')
    .update({
      role: payload.role ?? null,
      location: payload.location ?? null,
      bio: payload.bio ?? null,
      instruments: payload.instruments ?? [],
      disciplines: payload.disciplines ?? [],
      seeking_band: payload.seeking_band ?? false,
      available_for_lessons: payload.available_for_lessons ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.musicianId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  if (musician.slug) {
    revalidatePath(`/musicians/${musician.slug}`, 'page')
  }
  revalidatePath('/musicians', 'page')

  return { success: true }
}
