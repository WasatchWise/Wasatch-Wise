'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimVenue(venueId: string) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'You must be signed in to claim a venue page'
    }
  }

  // Check if venue exists and is not already claimed
  const { data: venue, error: fetchError } = await supabase
    .from('venues')
    .select('id, name, slug, claimed_by')
    .eq('id', venueId)
    .single()

  if (fetchError) {
    console.error('Error fetching venue:', fetchError)
    return {
      success: false,
      error: `Venue not found: ${fetchError.message}`
    }
  }

  if (!venue) {
    return {
      success: false,
      error: 'Venue not found'
    }
  }

  if (venue.claimed_by) {
    return {
      success: false,
      error: 'This venue page has already been claimed'
    }
  }

  // Claim the venue
  const { data: updatedVenue, error: updateError } = await supabase
    .from('venues')
    .update({
      claimed_by: user.id,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', venueId)
    .is('claimed_by', null)
    .select('id, claimed_by')

  if (updateError) {
    console.error('Error updating venue:', updateError)
    return {
      success: false,
      error: `Failed to claim venue page: ${updateError.message}. Please try again.`
    }
  }

  const claimedRecord = updatedVenue?.[0]
  if (!claimedRecord || claimedRecord.claimed_by !== user.id) {
    return {
      success: false,
      error: 'Claim failed to persist. Please try again.'
    }
  }

  // Revalidate the venue page and dashboard
  if (venue.slug) {
    revalidatePath(`/venues/${venue.slug}`, 'page')
  }
  revalidatePath('/venues', 'layout')
  revalidatePath('/dashboard')

  return {
    success: true,
    message: `You've successfully claimed ${venue.name}!`
  }
}
