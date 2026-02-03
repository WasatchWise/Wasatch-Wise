import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculateCompatibility,
  type RiderForCompatibility,
  type VenueForCompatibility,
} from '@/lib/compatibility'

/**
 * GET /api/compatibility/venue/[venueId]
 * Returns riders compatible with this venue, sorted by compatibility score
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const supabase = await createClient()

    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, name, slug, capacity, stage_width_feet, stage_depth_feet, input_channels, has_house_drums, has_backline, typical_guarantee_max, typical_guarantee_min, age_restrictions')
      .eq('id', venueId)
      .single()

    if (venueError || !venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const { data: riders, error: ridersError } = await supabase
      .from('spider_riders')
      .select(`
        id,
        rider_code,
        guarantee_min,
        guarantee_max,
        min_stage_width_feet,
        min_stage_depth_feet,
        min_input_channels,
        requires_house_drums,
        age_restriction,
        band:bands(id, name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(100)

    if (ridersError) {
      return NextResponse.json(
        { error: 'Failed to fetch riders' },
        { status: 500 }
      )
    }

    const venueForCompat: VenueForCompatibility = {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      capacity: venue.capacity,
      stage_width_feet: venue.stage_width_feet,
      stage_depth_feet: venue.stage_depth_feet,
      input_channels: venue.input_channels,
      has_house_drums: venue.has_house_drums,
      has_backline: venue.has_backline,
      typical_guarantee_max: venue.typical_guarantee_max ?? undefined,
      typical_guarantee_min: venue.typical_guarantee_min ?? undefined,
      age_restrictions: venue.age_restrictions ?? undefined,
    }

    const compatibleRiders = (riders || []).map((rider) => {
      const riderForCompat: RiderForCompatibility = {
        id: rider.id,
        guarantee_min: rider.guarantee_min,
        guarantee_max: rider.guarantee_max,
        min_stage_width_feet: rider.min_stage_width_feet,
        min_stage_depth_feet: rider.min_stage_depth_feet,
        min_input_channels: rider.min_input_channels,
        requires_house_drums: rider.requires_house_drums,
        age_restriction: rider.age_restriction,
      }
      const compatibility = calculateCompatibility(riderForCompat, venueForCompat)
      return {
        riderId: rider.id,
        riderCode: rider.rider_code || null,
        bandName: rider.band?.name || null,
        bandSlug: rider.band?.slug || null,
        compatibility,
      }
    })

    compatibleRiders.sort(
      (a, b) => b.compatibility.overallScore - a.compatibility.overallScore
    )

    return NextResponse.json({
      venueId: venue.id,
      venueName: venue.name,
      venueSlug: venue.slug,
      compatibleRiders,
    })
  } catch (error) {
    console.error('Compatibility venue error:', error)
    return NextResponse.json(
      { error: 'Failed to compute compatibility' },
      { status: 500 }
    )
  }
}
