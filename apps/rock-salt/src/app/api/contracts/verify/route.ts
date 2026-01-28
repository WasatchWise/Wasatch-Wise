import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const acceptanceId = searchParams.get('acceptanceId')
    const hash = searchParams.get('hash')

    if (!acceptanceId && !hash) {
      return NextResponse.json(
        { error: 'Acceptance ID or hash is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Build query based on what was provided
    let query = supabase
      .from('generated_contracts')
      .select(`
        id,
        contract_hash,
        generated_at,
        acceptance:spider_rider_acceptances(
          id,
          created_at,
          venue:venues(name, city, state),
          spider_rider:spider_riders(
            version,
            band:bands(name)
          )
        )
      `)

    if (acceptanceId) {
      query = query.eq('acceptance_id', acceptanceId)
    }
    if (hash) {
      query = query.eq('contract_hash', hash)
    }

    const { data: contract, error } = await query.single()

    if (error || !contract) {
      return NextResponse.json({
        verified: false,
        message: 'Contract not found in our records',
      })
    }

    const acceptance = contract.acceptance
    const rider = acceptance?.spider_rider
    const band = rider?.band
    const venue = acceptance?.venue

    return NextResponse.json({
      verified: true,
      contract: {
        id: contract.id,
        hash: contract.contract_hash,
        generatedAt: contract.generated_at,
        bandName: band?.name,
        venueName: venue?.name,
        venueLocation: venue?.city && venue?.state
          ? `${venue.city}, ${venue.state}`
          : null,
        riderVersion: rider?.version,
        acceptanceDate: acceptance?.created_at,
      },
    })
  } catch (error) {
    console.error('Verify contract error:', error)
    return NextResponse.json(
      { error: 'Failed to verify contract' },
      { status: 500 }
    )
  }
}
