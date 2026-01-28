'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitShow(formData: FormData) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'You must be signed in to submit a show request'
    }
  }

  const bandId = formData.get('bandId') as string
  const venueId = formData.get('venueId') as string
  const proposedDate = formData.get('proposedDate') as string
  const proposedTime = formData.get('proposedTime') as string
  const message = formData.get('message') as string

  // Verify user owns the band
  const { data: band, error: bandError } = await supabase
    .from('bands')
    .select('id, name, claimed_by')
    .eq('id', bandId)
    .single()

  if (bandError || !band) {
    return {
      success: false,
      error: 'Band not found'
    }
  }

  if (band.claimed_by !== user.id) {
    return {
      success: false,
      error: 'You do not own this band'
    }
  }

  // Verify venue exists
  const { data: venue, error: venueError } = await supabase
    .from('venues')
    .select('id, name')
    .eq('id', venueId)
    .single()

  if (venueError || !venue) {
    return {
      success: false,
      error: 'Venue not found'
    }
  }

  // Insert submission
  const { error: insertError } = await supabase
    .from('show_submissions')
    .insert({
      band_id: bandId,
      venue_id: venueId,
      proposed_date: proposedDate || null,
      proposed_time: proposedTime || null,
      message: message.trim() || null,
      submitted_by: user.id,
      status: 'pending'
    })

  if (insertError) {
    return {
      success: false,
      error: 'Failed to submit show request: ' + insertError.message
    }
  }

  // Revalidate relevant paths
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/bands/${bandId}`)

  return {
    success: true,
    message: `Show request sent to ${venue.name}! They'll be notified and can respond.`
  }
}

