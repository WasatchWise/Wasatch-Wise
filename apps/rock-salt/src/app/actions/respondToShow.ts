'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function respondToShow(
  submissionId: string,
  status: 'accepted' | 'declined' | 'counter_offer',
  response?: string,
  counterDate?: string,
  counterTime?: string
) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'You must be signed in to respond'
    }
  }

  // Get submission and verify venue ownership
  const { data: submission, error: fetchError } = await supabase
    .from('show_submissions')
    .select(`
      id,
      venue_id,
      venues!inner(claimed_by)
    `)
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) {
    return {
      success: false,
      error: 'Submission not found'
    }
  }

  const venue = submission.venues as { claimed_by: string }
  if (venue.claimed_by !== user.id) {
    return {
      success: false,
      error: 'You do not own this venue'
    }
  }

  // Update submission
  const updateData: any = {
    status,
    responded_by: user.id,
    responded_at: new Date().toISOString()
  }

  if (response) {
    updateData.venue_response = response.trim()
  }

  if (status === 'counter_offer') {
    updateData.counter_date = counterDate || null
    updateData.counter_time = counterTime || null
  }

  const { error: updateError } = await supabase
    .from('show_submissions')
    .update(updateData)
    .eq('id', submissionId)

  if (updateError) {
    return {
      success: false,
      error: 'Failed to respond: ' + updateError.message
    }
  }

  // Revalidate relevant paths
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/venues/${submission.venue_id}`)

  return {
    success: true,
    message: 'Response sent successfully'
  }
}

