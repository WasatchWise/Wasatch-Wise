import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/venues/[id]/profile
 * Update venue capability profile
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: venueId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, claimed_by')
      .eq('id', venueId)
      .single()

    if (venueError || !venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    if (venue.claimed_by !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this venue' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const updateData: Record<string, unknown> = {
      typical_guarantee_min: body.typical_guarantee_min ?? null,
      typical_guarantee_max: body.typical_guarantee_max ?? null,
      payment_methods: body.payment_methods ?? [],
      w9_on_file: body.w9_on_file ?? false,
      insurance_coi_on_file: body.insurance_coi_on_file ?? false,
      stage_width_feet: body.stage_width_feet ?? null,
      stage_depth_feet: body.stage_depth_feet ?? null,
      input_channels: body.input_channels ?? null,
      has_house_drums: body.has_house_drums ?? false,
      has_backline: body.has_backline ?? false,
      green_room_available: body.green_room_available ?? false,
      green_room_description: body.green_room_description || null,
      meal_buyout_available: body.meal_buyout_available ?? false,
      typical_meal_buyout_amount: body.typical_meal_buyout_amount ?? null,
      drink_tickets_available: body.drink_tickets_available ?? null,
      guest_list_spots: body.guest_list_spots ?? null,
      parking_spaces: body.parking_spaces ?? null,
      age_restrictions: body.age_restrictions ?? [],
      load_in_notes: body.load_in_notes || null,
      curfew_time: body.curfew_time || null,
      profile_updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('venues')
      .update(updateData)
      .eq('id', venueId)

    if (updateError) {
      console.error('Venue profile update error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Venue profile updated',
    })
  } catch (error) {
    console.error('Venue profile PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update venue profile' },
      { status: 500 }
    )
  }
}
