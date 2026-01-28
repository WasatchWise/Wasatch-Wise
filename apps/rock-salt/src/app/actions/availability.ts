'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// BAND AVAILABILITY
// ============================================

export async function addBandAvailability(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in' }
  }

  const bandId = formData.get('bandId') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const notes = formData.get('notes') as string
  const minGuarantee = formData.get('minGuarantee') as string
  const doorDealOk = formData.get('doorDealOk') === 'true'
  const willingToTravel = formData.get('willingToTravel') === 'true'
  const maxTravelMiles = formData.get('maxTravelMiles') as string
  const preferredVenueTypes = formData.getAll('preferredVenueTypes') as string[]

  // Verify ownership
  const { data: band } = await supabase
    .from('bands')
    .select('id, claimed_by')
    .eq('id', bandId)
    .single()

  if (!band || band.claimed_by !== user.id) {
    return { success: false, error: 'You do not own this band' }
  }

  const { error } = await supabase
    .from('band_availability')
    .insert({
      band_id: bandId,
      start_date: startDate,
      end_date: endDate || startDate,
      notes: notes?.trim() || null,
      min_guarantee: minGuarantee ? parseInt(minGuarantee) : null,
      door_deal_ok: doorDealOk,
      willing_to_travel: willingToTravel,
      max_travel_miles: maxTravelMiles ? parseInt(maxTravelMiles) : null,
      preferred_venue_types: preferredVenueTypes.length > 0 ? preferredVenueTypes : null,
      created_by: user.id
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/bands')
  revalidatePath('/book')
  return { success: true }
}

export async function deleteBandAvailability(availabilityId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in' }
  }

  // Verify ownership via band
  const { data: availability } = await supabase
    .from('band_availability')
    .select('id, band_id, bands!inner(claimed_by)')
    .eq('id', availabilityId)
    .single()

  const band = availability?.bands as { claimed_by: string } | null
  if (!availability || band?.claimed_by !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  const { error } = await supabase
    .from('band_availability')
    .delete()
    .eq('id', availabilityId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/bands')
  revalidatePath('/book')
  return { success: true }
}

export async function getBandAvailability(bandId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('band_availability')
    .select('*')
    .eq('band_id', bandId)
    .eq('is_booked', false)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true })

  if (error) {
    return { success: false, error: error.message, availability: [] }
  }

  return { success: true, availability: data }
}

// ============================================
// VENUE SLOTS
// ============================================

export async function addVenueSlot(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in' }
  }

  const venueId = formData.get('venueId') as string
  const slotDate = formData.get('slotDate') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const loadInTime = formData.get('loadInTime') as string
  const setTime = formData.get('setTime') as string
  const setLengthMinutes = formData.get('setLengthMinutes') as string
  const compensationType = formData.get('compensationType') as string
  const guaranteeAmount = formData.get('guaranteeAmount') as string
  const doorSplitPercentage = formData.get('doorSplitPercentage') as string
  const expectedDraw = formData.get('expectedDraw') as string
  const backlineProvided = formData.get('backlineProvided') === 'true'
  const soundEngineerProvided = formData.get('soundEngineerProvided') === 'true'
  const ageRestriction = formData.get('ageRestriction') as string
  const preferredGenres = formData.getAll('preferredGenres') as string[]

  // Verify ownership
  const { data: venue } = await supabase
    .from('venues')
    .select('id, claimed_by')
    .eq('id', venueId)
    .single()

  if (!venue || venue.claimed_by !== user.id) {
    return { success: false, error: 'You do not own this venue' }
  }

  const { error } = await supabase
    .from('venue_slots')
    .insert({
      venue_id: venueId,
      slot_date: slotDate,
      title: title?.trim() || null,
      description: description?.trim() || null,
      load_in_time: loadInTime || null,
      set_time: setTime || null,
      set_length_minutes: setLengthMinutes ? parseInt(setLengthMinutes) : null,
      compensation_type: compensationType || 'negotiable',
      guarantee_amount: guaranteeAmount ? parseInt(guaranteeAmount) : null,
      door_split_percentage: doorSplitPercentage ? parseInt(doorSplitPercentage) : null,
      expected_draw: expectedDraw ? parseInt(expectedDraw) : null,
      backline_provided: backlineProvided,
      sound_engineer_provided: soundEngineerProvided,
      age_restriction: ageRestriction || null,
      preferred_genres: preferredGenres.length > 0 ? preferredGenres : null,
      created_by: user.id
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/venues')
  revalidatePath('/book')
  return { success: true }
}

export async function deleteVenueSlot(slotId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in' }
  }

  // Verify ownership via venue
  const { data: slot } = await supabase
    .from('venue_slots')
    .select('id, venue_id, venues!inner(claimed_by)')
    .eq('id', slotId)
    .single()

  const venue = slot?.venues as { claimed_by: string } | null
  if (!slot || venue?.claimed_by !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  const { error } = await supabase
    .from('venue_slots')
    .delete()
    .eq('id', slotId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/venues')
  revalidatePath('/book')
  return { success: true }
}

export async function getVenueSlots(venueId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('venue_slots')
    .select('*')
    .eq('venue_id', venueId)
    .eq('status', 'open')
    .gte('slot_date', new Date().toISOString().split('T')[0])
    .order('slot_date', { ascending: true })

  if (error) {
    return { success: false, error: error.message, slots: [] }
  }

  return { success: true, slots: data }
}

// ============================================
// BOOKING OPPORTUNITIES (RFP)
// ============================================

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in' }
  }

  const postedByType = formData.get('postedByType') as 'band' | 'venue'
  const bandId = formData.get('bandId') as string | null
  const venueId = formData.get('venueId') as string | null
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const dateFlexible = formData.get('dateFlexible') === 'true'
  const specificDate = formData.get('specificDate') as string
  const dateRangeStart = formData.get('dateRangeStart') as string
  const dateRangeEnd = formData.get('dateRangeEnd') as string
  const preferredCities = formData.getAll('preferredCities') as string[]
  const preferredVenueTypes = formData.getAll('preferredVenueTypes') as string[]
  const expectedDraw = formData.get('expectedDraw') as string
  const preferredGenres = formData.getAll('preferredGenres') as string[]
  const compensationDetails = formData.get('compensationDetails') as string
  const expiresAt = formData.get('expiresAt') as string

  // Verify ownership
  if (postedByType === 'band') {
    const { data: band } = await supabase
      .from('bands')
      .select('id, claimed_by')
      .eq('id', bandId)
      .single()
    if (!band || band.claimed_by !== user.id) {
      return { success: false, error: 'You do not own this band' }
    }
  } else {
    const { data: venue } = await supabase
      .from('venues')
      .select('id, claimed_by')
      .eq('id', venueId)
      .single()
    if (!venue || venue.claimed_by !== user.id) {
      return { success: false, error: 'You do not own this venue' }
    }
  }

  const { error } = await supabase
    .from('booking_opportunities')
    .insert({
      posted_by_type: postedByType,
      band_id: postedByType === 'band' ? bandId : null,
      venue_id: postedByType === 'venue' ? venueId : null,
      title: title.trim(),
      description: description?.trim() || null,
      date_flexible: dateFlexible,
      specific_date: specificDate || null,
      date_range_start: dateRangeStart || null,
      date_range_end: dateRangeEnd || null,
      preferred_cities: preferredCities.length > 0 ? preferredCities : null,
      preferred_venue_types: preferredVenueTypes.length > 0 ? preferredVenueTypes : null,
      expected_draw: expectedDraw ? parseInt(expectedDraw) : null,
      preferred_genres: preferredGenres.length > 0 ? preferredGenres : null,
      compensation_details: compensationDetails?.trim() || null,
      expires_at: expiresAt || null,
      created_by: user.id
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/book')
  return { success: true }
}

export async function applyToOpportunity(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in' }
  }

  const opportunityId = formData.get('opportunityId') as string
  const applicantType = formData.get('applicantType') as 'band' | 'venue'
  const bandId = formData.get('bandId') as string | null
  const venueId = formData.get('venueId') as string | null
  const message = formData.get('message') as string
  const proposedDate = formData.get('proposedDate') as string
  const proposedCompensation = formData.get('proposedCompensation') as string

  // Verify ownership
  if (applicantType === 'band') {
    const { data: band } = await supabase
      .from('bands')
      .select('id, claimed_by')
      .eq('id', bandId)
      .single()
    if (!band || band.claimed_by !== user.id) {
      return { success: false, error: 'You do not own this band' }
    }
  } else {
    const { data: venue } = await supabase
      .from('venues')
      .select('id, claimed_by')
      .eq('id', venueId)
      .single()
    if (!venue || venue.claimed_by !== user.id) {
      return { success: false, error: 'You do not own this venue' }
    }
  }

  const { error } = await supabase
    .from('opportunity_applications')
    .insert({
      opportunity_id: opportunityId,
      applicant_type: applicantType,
      band_id: applicantType === 'band' ? bandId : null,
      venue_id: applicantType === 'venue' ? venueId : null,
      message: message?.trim() || null,
      proposed_date: proposedDate || null,
      proposed_compensation: proposedCompensation?.trim() || null,
      applied_by: user.id
    })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You have already applied to this opportunity' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/book')
  return { success: true }
}

export async function respondToApplication(
  applicationId: string,
  status: 'accepted' | 'declined',
  responseMessage?: string
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in' }
  }

  // Get application and verify opportunity ownership
  const { data: application } = await supabase
    .from('opportunity_applications')
    .select(`
      id,
      opportunity_id,
      booking_opportunities!inner(
        id,
        posted_by_type,
        band_id,
        venue_id
      )
    `)
    .eq('id', applicationId)
    .single()

  if (!application) {
    return { success: false, error: 'Application not found' }
  }

  const opportunity = application.booking_opportunities as any

  // Verify ownership
  if (opportunity.posted_by_type === 'band') {
    const { data: band } = await supabase
      .from('bands')
      .select('claimed_by')
      .eq('id', opportunity.band_id)
      .single()
    if (!band || band.claimed_by !== user.id) {
      return { success: false, error: 'Not authorized' }
    }
  } else {
    const { data: venue } = await supabase
      .from('venues')
      .select('claimed_by')
      .eq('id', opportunity.venue_id)
      .single()
    if (!venue || venue.claimed_by !== user.id) {
      return { success: false, error: 'Not authorized' }
    }
  }

  const { error } = await supabase
    .from('opportunity_applications')
    .update({
      status,
      response_message: responseMessage?.trim() || null,
      responded_at: new Date().toISOString()
    })
    .eq('id', applicationId)

  if (error) {
    return { success: false, error: error.message }
  }

  // If accepted, update opportunity status
  if (status === 'accepted') {
    await supabase
      .from('booking_opportunities')
      .update({ status: 'filled' })
      .eq('id', application.opportunity_id)
  }

  revalidatePath('/book')
  revalidatePath('/dashboard')
  return { success: true }
}

// ============================================
// DISCOVERY / SEARCH
// ============================================

export async function getOpenVenueSlots(filters?: {
  date?: string
  city?: string
  genres?: string[]
}) {
  const supabase = await createClient()

  let query = supabase
    .from('venue_slots')
    .select(`
      *,
      venues!inner(id, name, slug, city, state, image_url, capacity)
    `)
    .eq('status', 'open')
    .gte('slot_date', new Date().toISOString().split('T')[0])
    .order('slot_date', { ascending: true })

  if (filters?.date) {
    query = query.eq('slot_date', filters.date)
  }

  if (filters?.city) {
    query = query.ilike('venues.city', `%${filters.city}%`)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message, slots: [] }
  }

  return { success: true, slots: data }
}

export async function getAvailableBands(filters?: {
  date?: string
  genres?: string[]
  city?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('band_availability')
    .select(`
      *,
      bands!inner(id, name, slug, image_url, origin_city, state, band_genres(genre:genres(name)))
    `)
    .eq('is_booked', false)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true })

  if (filters?.date) {
    query = query
      .lte('start_date', filters.date)
      .gte('end_date', filters.date)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message, availability: [] }
  }

  return { success: true, availability: data }
}

export async function getOpenOpportunities(filters?: {
  type?: 'band' | 'venue'
  date?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('booking_opportunities')
    .select(`
      *,
      bands(id, name, slug, image_url),
      venues(id, name, slug, image_url)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (filters?.type) {
    query = query.eq('posted_by_type', filters.type)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message, opportunities: [] }
  }

  return { success: true, opportunities: data }
}
