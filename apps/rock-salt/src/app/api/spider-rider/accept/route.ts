import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { spiderRiderId, venueId, notes } = body

    if (!spiderRiderId || !venueId) {
      return NextResponse.json(
        { error: 'Spider Rider ID and Venue ID are required' },
        { status: 400 }
      )
    }

    // Verify user owns the venue
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, name')
      .eq('id', venueId)
      .eq('claimed_by', user.id)
      .single()

    if (venueError || !venue) {
      return NextResponse.json(
        { error: 'You do not own this venue' },
        { status: 403 }
      )
    }

    // Verify the spider rider exists and is published
    const { data: rider, error: riderError } = await supabase
      .from('spider_riders')
      .select('id, band_id, status, band:bands(name)')
      .eq('id', spiderRiderId)
      .eq('status', 'published')
      .single()

    if (riderError || !rider) {
      return NextResponse.json(
        { error: 'Spider Rider not found or not published' },
        { status: 404 }
      )
    }

    // Check if acceptance already exists
    const { data: existingAcceptance } = await supabase
      .from('spider_rider_acceptances')
      .select('id')
      .eq('spider_rider_id', spiderRiderId)
      .eq('venue_id', venueId)
      .eq('is_active', true)
      .single()

    if (existingAcceptance) {
      return NextResponse.json(
        { error: 'You have already accepted this Spider Rider' },
        { status: 409 }
      )
    }

    // Create the acceptance record
    const { data: acceptance, error: acceptanceError } = await supabase
      .from('spider_rider_acceptances')
      .insert({
        spider_rider_id: spiderRiderId,
        venue_id: venueId,
        accepted_by: user.id,
        notes: notes || null,
        is_active: true,
      })
      .select()
      .single()

    if (acceptanceError) {
      console.error('Error creating acceptance:', acceptanceError)
      return NextResponse.json(
        { error: 'Failed to create acceptance' },
        { status: 500 }
      )
    }

    // Update the acceptance count on the spider rider
    await supabase.rpc('increment_acceptance_count', {
      rider_id: spiderRiderId
    }).catch(() => {
      // If RPC doesn't exist, do manual update
      supabase
        .from('spider_riders')
        .update({
          acceptance_count: rider.acceptance_count ? rider.acceptance_count + 1 : 1
        })
        .eq('id', spiderRiderId)
    })

    return NextResponse.json({
      success: true,
      acceptance: {
        id: acceptance.id,
        venue: venue.name,
        band: rider.band?.name,
      },
    })
  } catch (error) {
    console.error('Accept Spider Rider error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get acceptances for current user's venues
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's venues
    const { data: venues } = await supabase
      .from('venues')
      .select('id')
      .eq('claimed_by', user.id)

    if (!venues || venues.length === 0) {
      return NextResponse.json({ acceptances: [] })
    }

    const venueIds = venues.map(v => v.id)

    // Get all acceptances for user's venues
    const { data: acceptances, error } = await supabase
      .from('spider_rider_acceptances')
      .select(`
        *,
        venue:venues(id, name),
        spider_rider:spider_riders(
          id,
          version,
          guarantee_min,
          guarantee_max,
          band:bands(id, name, slug, image_url)
        )
      `)
      .in('venue_id', venueIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching acceptances:', error)
      return NextResponse.json(
        { error: 'Failed to fetch acceptances' },
        { status: 500 }
      )
    }

    return NextResponse.json({ acceptances })
  } catch (error) {
    console.error('Get acceptances error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Revoke an acceptance
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const acceptanceId = searchParams.get('id')

    if (!acceptanceId) {
      return NextResponse.json(
        { error: 'Acceptance ID is required' },
        { status: 400 }
      )
    }

    // Get the acceptance and verify ownership
    const { data: acceptance, error: fetchError } = await supabase
      .from('spider_rider_acceptances')
      .select('*, venue:venues(claimed_by)')
      .eq('id', acceptanceId)
      .single()

    if (fetchError || !acceptance) {
      return NextResponse.json(
        { error: 'Acceptance not found' },
        { status: 404 }
      )
    }

    if (acceptance.venue?.claimed_by !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this venue' },
        { status: 403 }
      )
    }

    // Soft delete - set is_active to false
    const { error: updateError } = await supabase
      .from('spider_rider_acceptances')
      .update({ is_active: false })
      .eq('id', acceptanceId)

    if (updateError) {
      console.error('Error revoking acceptance:', updateError)
      return NextResponse.json(
        { error: 'Failed to revoke acceptance' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revoke acceptance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
