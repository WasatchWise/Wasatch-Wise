import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/spider-rider
 * Get spider riders for the authenticated user's bands
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bandId = searchParams.get('bandId')
    const status = searchParams.get('status')

    // First get user's bands
    const { data: userBands } = await supabase
      .from('bands')
      .select('id')
      .eq('claimed_by', user.id)

    const bandIds = userBands?.map(b => b.id) || []

    let query = supabase
      .from('spider_riders')
      .select(`
        *,
        band:bands(id, name, slug, claimed_by)
      `)

    // Filter by band if specified
    if (bandId) {
      // Verify user owns this band
      if (!bandIds.includes(bandId)) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }
      query = query.eq('band_id', bandId)
    } else {
      // Only show riders for bands the user owns
      query = query.in('band_id', bandIds)
    }

    // Filter by status if specified
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching spider riders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Spider rider GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spider riders' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/spider-rider
 * Create a new spider rider
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { band_id, ...riderData } = body

    if (!band_id) {
      return NextResponse.json({ error: 'band_id is required' }, { status: 400 })
    }

    // Validate minimum guarantee (stored in cents)
    if (riderData.guarantee_min && riderData.guarantee_min < 10000) {
      return NextResponse.json(
        { error: 'Minimum guarantee must be at least $100. We don\'t do "exposure" gigs.' },
        { status: 400 }
      )
    }

    // Verify user owns this band
    const { data: band, error: bandError } = await supabase
      .from('bands')
      .select('id, claimed_by')
      .eq('id', band_id)
      .single()

    if (bandError || !band) {
      return NextResponse.json({ error: 'Band not found' }, { status: 404 })
    }

    if (band.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized to create rider for this band' }, { status: 403 })
    }

    // Get next version number
    const { data: existingRiders } = await supabase
      .from('spider_riders')
      .select('version_number')
      .eq('band_id', band_id)
      .order('version_number', { ascending: false })
      .limit(1)

    const nextVersionNumber = (existingRiders?.[0]?.version_number || 0) + 1

    // Create the spider rider
    const { data: rider, error: createError } = await supabase
      .from('spider_riders')
      .insert({
        band_id,
        version_number: nextVersionNumber,
        status: 'draft',
        ...riderData,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating spider rider:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json(rider, { status: 201 })
  } catch (error) {
    console.error('Spider rider POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create spider rider' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/spider-rider
 * Update an existing spider rider (only drafts can be edited)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, band_id, status: newStatus, ...riderData } = body

    if (!id) {
      return NextResponse.json({ error: 'Rider ID required' }, { status: 400 })
    }

    // Validate minimum guarantee (stored in cents)
    if (riderData.guarantee_min && riderData.guarantee_min < 10000) {
      return NextResponse.json(
        { error: 'Minimum guarantee must be at least $100.' },
        { status: 400 }
      )
    }

    // Verify user owns this rider's band and it's still a draft
    const { data: existingRider, error: fetchError } = await supabase
      .from('spider_riders')
      .select(`
        *,
        band:bands(id, claimed_by)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !existingRider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    if (existingRider.band?.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this rider' }, { status: 403 })
    }

    if (existingRider.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot edit a published or archived rider. Create a new version instead.' },
        { status: 400 }
      )
    }

    // Update the rider
    const { data: rider, error: updateError } = await supabase
      .from('spider_riders')
      .update({
        ...riderData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating spider rider:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(rider)
  } catch (error) {
    console.error('Spider rider PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update spider rider' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/spider-rider
 * Delete a spider rider (only drafts can be deleted)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Rider ID required' }, { status: 400 })
    }

    // Verify user owns this rider's band and it's still a draft
    const { data: existingRider, error: fetchError } = await supabase
      .from('spider_riders')
      .select(`
        *,
        band:bands(id, claimed_by)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !existingRider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    if (existingRider.band?.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this rider' }, { status: 403 })
    }

    if (existingRider.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot delete a published or archived rider. Archive it instead.' },
        { status: 400 }
      )
    }

    // Delete the rider
    const { error: deleteError } = await supabase
      .from('spider_riders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting spider rider:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Spider rider DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete spider rider' },
      { status: 500 }
    )
  }
}
