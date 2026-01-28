import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/spider-rider/publish
 * Publish a spider rider (makes it immutable and visible to venues)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { riderId } = body

    if (!riderId) {
      return NextResponse.json({ error: 'riderId is required' }, { status: 400 })
    }

    // Verify user owns this rider's band
    const { data: rider, error: fetchError } = await supabase
      .from('spider_riders')
      .select(`
        *,
        band:bands(id, name, claimed_by)
      `)
      .eq('id', riderId)
      .single()

    if (fetchError || !rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    if (rider.band?.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized to publish this rider' }, { status: 403 })
    }

    if (rider.status !== 'draft') {
      return NextResponse.json(
        { error: `Cannot publish a rider that is already ${rider.status}` },
        { status: 400 }
      )
    }

    // Validate required fields before publishing
    if (!rider.guarantee_min || rider.guarantee_min < 10000) {
      return NextResponse.json(
        { error: 'Minimum guarantee of at least $100 is required to publish' },
        { status: 400 }
      )
    }

    // Archive any existing published riders for this band
    const { error: archiveError } = await supabase
      .from('spider_riders')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('band_id', rider.band_id)
      .eq('status', 'published')
      .neq('id', riderId)

    if (archiveError) {
      console.error('Error archiving previous rider:', archiveError)
      // Continue anyway - this isn't fatal
    }

    // Publish the rider
    const { data: publishedRider, error: publishError } = await supabase
      .from('spider_riders')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', riderId)
      .select()
      .single()

    if (publishError) {
      console.error('Error publishing spider rider:', publishError)
      return NextResponse.json({ error: publishError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      rider: publishedRider,
      message: `Spider Rider for ${rider.band?.name} is now live!`,
    })
  } catch (error) {
    console.error('Spider rider publish error:', error)
    return NextResponse.json(
      { error: 'Failed to publish spider rider' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/spider-rider/archive
 * Archive a published spider rider
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const riderId = searchParams.get('riderId')

    if (!riderId) {
      return NextResponse.json({ error: 'riderId is required' }, { status: 400 })
    }

    // Verify user owns this rider's band
    const { data: rider, error: fetchError } = await supabase
      .from('spider_riders')
      .select(`
        *,
        band:bands(id, claimed_by)
      `)
      .eq('id', riderId)
      .single()

    if (fetchError || !rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    if (rider.band?.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized to archive this rider' }, { status: 403 })
    }

    if (rider.status === 'archived') {
      return NextResponse.json({ error: 'Rider is already archived' }, { status: 400 })
    }

    // Archive the rider
    const { data: archivedRider, error: archiveError } = await supabase
      .from('spider_riders')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', riderId)
      .select()
      .single()

    if (archiveError) {
      console.error('Error archiving spider rider:', archiveError)
      return NextResponse.json({ error: archiveError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      rider: archivedRider,
    })
  } catch (error) {
    console.error('Spider rider archive error:', error)
    return NextResponse.json(
      { error: 'Failed to archive spider rider' },
      { status: 500 }
    )
  }
}
