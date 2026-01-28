'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimMusician(musicianId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to claim a musician profile' }
  }

  const { data: musician, error: fetchError } = await supabase
    .from('musicians')
    .select('id, name, slug, claimed_by')
    .eq('id', musicianId)
    .single()

  if (fetchError || !musician) {
    return { success: false, error: 'Musician not found' }
  }

  if (musician.claimed_by) {
    return { success: false, error: 'This musician profile has already been claimed' }
  }

  const { error: updateError } = await supabase
    .from('musicians')
    .update({
      claimed_by: user.id,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', musicianId)

  if (updateError) {
    return { success: false, error: `Failed to claim musician profile: ${updateError.message}` }
  }

  if (musician.slug) {
    revalidatePath(`/musicians/${musician.slug}`, 'page')
  }
  revalidatePath('/musicians', 'page')

  return { success: true, message: `You've successfully claimed ${musician.name}` }
}
