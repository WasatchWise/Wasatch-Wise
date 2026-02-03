import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRiderPDF, generateRiderFilename, RiderPDFData } from '@/lib/pdf/rider-generator'

/**
 * POST /api/spider-rider/publish
 * Publish a spider rider (makes it immutable, visible to venues, generates PDF + rider code)
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

    // Verify user owns this rider's band - fetch with band slug for rider code
    const { data: rider, error: fetchError } = await supabase
      .from('spider_riders')
      .select(`
        *,
        band:bands(id, name, slug, origin_city, state, claimed_by)
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

    const publishedAt = new Date().toISOString()

    // Publish the rider (status + published_at first)
    const { data: publishedRider, error: publishError } = await supabase
      .from('spider_riders')
      .update({
        status: 'published',
        published_at: publishedAt,
        updated_at: publishedAt,
      })
      .eq('id', riderId)
      .select()
      .single()

    if (publishError) {
      console.error('Error publishing spider rider:', publishError)
      return NextResponse.json({ error: publishError.message }, { status: 500 })
    }

    // Generate rider code via RPC
    const { data: riderCode, error: codeError } = await supabase.rpc(
      'generate_spider_rider_code',
      { p_band_id: rider.band_id, p_published_at: publishedAt }
    )

    const finalRiderCode = codeError ? `SR-${new Date().getFullYear()}-${String(rider.band?.slug || 'band').slice(0, 12).toUpperCase()}-001` : (riderCode as string)

    // Build PDF data (values in cents)
    const toNum = (v: unknown) => (v == null ? undefined : Number(v))
    const pdfData: RiderPDFData = {
      bandName: rider.band?.name || 'Unknown Band',
      bandCity: rider.band?.origin_city || undefined,
      bandState: rider.band?.state || undefined,
      riderCode: finalRiderCode,
      riderVersion: rider.version || 'v1',
      publishedAt,
      guaranteeMin: toNum(rider.guarantee_min) ?? 0,
      guaranteeMax: toNum(rider.guarantee_max) || undefined,
      doorSplitPercentage: toNum(rider.door_split_percentage) ?? undefined,
      merchSplitToVenuePercentage: toNum(rider.merch_split_to_venue_percentage) ?? undefined,
      minStageWidth: toNum(rider.min_stage_width_feet) ?? undefined,
      minStageDepth: toNum(rider.min_stage_depth_feet) ?? undefined,
      minInputChannels: toNum(rider.min_input_channels) ?? undefined,
      requiresHouseDrums: Boolean(rider.requires_house_drums),
      mealBuyoutAmount: toNum(rider.meal_buyout_amount) ?? undefined,
      drinkTicketsCount: toNum(rider.drink_tickets_count) ?? undefined,
      guestListAllocation: toNum(rider.guest_list_allocation) ?? undefined,
      greenRoomRequirements: rider.green_room_requirements || undefined,
      notesFinancial: rider.notes_financial || undefined,
      notesTechnical: rider.notes_technical || undefined,
      notesHospitality: rider.notes_hospitality || undefined,
      notesBusiness: rider.notes_business || undefined,
      ageRestriction: rider.age_restriction || undefined,
      riderId: rider.id,
    }

    // Generate PDF
    const { buffer, hash } = await generateRiderPDF(pdfData)
    const filename = generateRiderFilename(finalRiderCode, rider.id)
    const storagePath = `riders/${rider.id}/${filename}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    const pdfStoragePath = uploadError ? null : storagePath

    // Update rider with rider_code, pdf_storage_path, sha256_hash
    const { data: updatedRider, error: updateError } = await supabase
      .from('spider_riders')
      .update({
        rider_code: finalRiderCode,
        pdf_storage_path: pdfStoragePath,
        sha256_hash: hash,
        updated_at: publishedAt,
      })
      .eq('id', riderId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating rider with PDF metadata:', updateError)
      // Publish succeeded; PDF metadata update failed - still return success
    }

    const resultRider = updatedRider || publishedRider
    let downloadUrl: string | null = null
    if (pdfStoragePath) {
      const { data: signed } = await supabase.storage
        .from('contracts')
        .createSignedUrl(pdfStoragePath, 3600)
      downloadUrl = signed?.signedUrl ?? null
    }

    return NextResponse.json({
      success: true,
      rider: resultRider,
      riderCode: finalRiderCode,
      downloadUrl,
      publicUrl: `/book/spider-riders/${riderId}`,
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
