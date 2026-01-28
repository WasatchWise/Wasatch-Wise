'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimBand(bandId: string) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'You must be signed in to claim a band page'
    }
  }

  // Check if band exists and is not already claimed
  const { data: band, error: fetchError } = await supabase
    .from('bands')
    .select('id, name, slug, claimed_by')
    .eq('id', bandId)
    .single()

  if (fetchError) {
    console.error('Error fetching band:', fetchError)
    return {
      success: false,
      error: `Band not found: ${fetchError.message}`
    }
  }

  if (!band) {
    return {
      success: false,
      error: 'Band not found'
    }
  }

  if (band.claimed_by) {
    return {
      success: false,
      error: 'This band page has already been claimed'
    }
  }

  // Claim the band
  const { error: updateError } = await supabase
    .from('bands')
    .update({
      claimed_by: user.id,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', bandId)

  if (updateError) {
    console.error('Error updating band:', updateError)
    return {
      success: false,
      error: `Failed to claim band page: ${updateError.message}. Please try again.`
    }
  }

  // Revalidate the band page and dashboard
  if (band.slug) {
    revalidatePath(`/bands/${band.slug}`, 'page')
  }
  revalidatePath('/bands', 'layout')
  revalidatePath('/dashboard')

  return {
    success: true,
    message: `You've successfully claimed ${band.name}!`
  }
}
