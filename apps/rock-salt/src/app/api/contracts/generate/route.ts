import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateContractPDF,
  generateContractFilename,
  ContractData,
} from '@/lib/pdf/contract-generator'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { acceptanceId } = body

    if (!acceptanceId) {
      return NextResponse.json(
        { error: 'Acceptance ID is required' },
        { status: 400 }
      )
    }

    // Fetch the acceptance with all related data
    const { data: acceptance, error: acceptanceError } = await supabase
      .from('spider_rider_acceptances')
      .select(`
        *,
        venue:venues(
          id,
          name,
          city,
          state,
          address,
          claimed_by
        ),
        spider_rider:spider_riders(
          id,
          version,
          guarantee_min,
          guarantee_max,
          door_split_percentage,
          merch_split_to_venue_percentage,
          min_stage_width_feet,
          min_stage_depth_feet,
          min_input_channels,
          requires_house_drums,
          meal_buyout_amount,
          drink_tickets_count,
          guest_list_allocation,
          green_room_requirements,
          notes_financial,
          notes_technical,
          notes_hospitality,
          band:bands(
            id,
            name,
            origin_city,
            state,
            claimed_by
          )
        )
      `)
      .eq('id', acceptanceId)
      .single()

    if (acceptanceError || !acceptance) {
      return NextResponse.json(
        { error: 'Acceptance not found' },
        { status: 404 }
      )
    }

    // Verify user is either the venue owner or band owner
    const isVenueOwner = acceptance.venue?.claimed_by === user.id
    const isBandOwner = acceptance.spider_rider?.band?.claimed_by === user.id

    if (!isVenueOwner && !isBandOwner) {
      return NextResponse.json(
        { error: 'You are not authorized to generate this contract' },
        { status: 403 }
      )
    }

    // Check if contract already exists
    const { data: existingContract } = await supabase
      .from('generated_contracts')
      .select('id, contract_hash, pdf_storage_path')
      .eq('acceptance_id', acceptanceId)
      .single()

    if (existingContract?.pdf_storage_path) {
      // Return existing contract URL
      const { data: signedUrl } = await supabase.storage
        .from('contracts')
        .createSignedUrl(existingContract.pdf_storage_path, 3600) // 1 hour

      return NextResponse.json({
        success: true,
        contractId: existingContract.id,
        hash: existingContract.contract_hash,
        downloadUrl: signedUrl?.signedUrl,
      })
    }

    // Prepare contract data
    const rider = acceptance.spider_rider
    const band = rider?.band
    const venue = acceptance.venue

    const contractData: ContractData = {
      bandName: band?.name || 'Unknown Band',
      bandCity: band?.origin_city || undefined,
      bandState: band?.state || undefined,
      venueName: venue?.name || 'Unknown Venue',
      venueCity: venue?.city || undefined,
      venueState: venue?.state || undefined,
      venueAddress: venue?.address || undefined,
      riderVersion: rider?.version || 'v1.0',
      guaranteeMin: rider?.guarantee_min || 0,
      guaranteeMax: rider?.guarantee_max || undefined,
      doorSplitPercentage: rider?.door_split_percentage || undefined,
      merchSplitToVenuePercentage: rider?.merch_split_to_venue_percentage || undefined,
      minStageWidth: rider?.min_stage_width_feet || undefined,
      minStageDepth: rider?.min_stage_depth_feet || undefined,
      minInputChannels: rider?.min_input_channels || undefined,
      requiresHouseDrums: rider?.requires_house_drums || false,
      mealBuyoutAmount: rider?.meal_buyout_amount || undefined,
      drinkTicketsCount: rider?.drink_tickets_count || undefined,
      guestListAllocation: rider?.guest_list_allocation || undefined,
      greenRoomRequirements: rider?.green_room_requirements || undefined,
      notesFinancial: rider?.notes_financial || undefined,
      notesTechnical: rider?.notes_technical || undefined,
      notesHospitality: rider?.notes_hospitality || undefined,
      venueNotes: acceptance.notes || undefined,
      acceptanceDate: acceptance.created_at,
      acceptanceId: acceptance.id,
      spiderRiderId: rider?.id || '',
    }

    // Generate PDF
    const { buffer, hash } = await generateContractPDF(contractData)

    // Upload to storage
    const filename = generateContractFilename(
      band?.name || 'band',
      venue?.name || 'venue',
      acceptance.id
    )
    const storagePath = `${acceptance.id}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Still save the contract record even if upload fails
    }

    // Save contract record
    const { data: contract, error: contractError } = await supabase
      .from('generated_contracts')
      .upsert({
        spider_rider_id: rider?.id,
        acceptance_id: acceptance.id,
        contract_hash: hash,
        pdf_storage_path: uploadError ? null : storagePath,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (contractError) {
      console.error('Contract save error:', contractError)
    }

    // Get signed URL for download
    let downloadUrl = null
    if (!uploadError) {
      const { data: signedUrl } = await supabase.storage
        .from('contracts')
        .createSignedUrl(storagePath, 3600)
      downloadUrl = signedUrl?.signedUrl
    }

    return NextResponse.json({
      success: true,
      contractId: contract?.id,
      hash,
      downloadUrl,
    })
  } catch (error) {
    console.error('Generate contract error:', error)
    return NextResponse.json(
      { error: 'Failed to generate contract' },
      { status: 500 }
    )
  }
}
