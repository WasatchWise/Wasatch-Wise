import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculateCompatibility,
  type RiderForCompatibility,
  type VenueForCompatibility,
} from '@/lib/compatibility'

/**
 * GET /api/compatibility/pair?riderId=...&venueId=...
 * Returns compatibility for a single rider–venue pair
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const riderId = searchParams.get('riderId')
    const venueId = searchParams.get('venueId')

    if (!riderId || !venueId) {
      return NextResponse.json(
        { error: 'riderId and venueId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const [riderRes, venueRes] = await Promise.all([
      supabase
        .from('spider_riders')
        .select('id, guarantee_min, guarantee_max, min_stage_width_feet, min_stage_depth_feet, min_input_channels, requires_house_drums, age_restriction')
        .eq('id', riderId)
        .eq('status', 'published')
        .single(),
      supabase
        .from('venues')
        .select('id, name, capacity, stage_width_feet, stage_depth_feet, input_channels, has_house_drums, has_backline, typical_guarantee_max, typical_guarantee_min, age_restrictions')
        .eq('id', venueId)
        .single(),
    ])

    if (riderRes.error || !riderRes.data) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    if (venueRes.error || !venueRes.data) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const rider = riderRes.data
    const venue = venueRes.data

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

    const venueForCompat: VenueForCompatibility = {
      id: venue.id,
      name: venue.name,
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

    const compatibility = calculateCompatibility(riderForCompat, venueForCompat)

    return NextResponse.json({
      riderId,
      venueId,
      compatibility,
    })
  } catch (error) {
    console.error('Compatibility pair error:', error)
    return NextResponse.json(
      { error: 'Failed to compute compatibility' },
      { status: 500 }
    )
  }
}
