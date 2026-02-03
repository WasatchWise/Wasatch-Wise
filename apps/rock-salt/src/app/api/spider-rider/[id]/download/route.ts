import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/spider-rider/[id]/download
 * Returns a signed URL for the published rider PDF (or redirects to it)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: riderId } = await params
    const supabase = await createClient()

    const { data: rider, error: fetchError } = await supabase
      .from('spider_riders')
      .select('id, pdf_storage_path, status, band:bands(claimed_by)')
      .eq('id', riderId)
      .single()

    if (fetchError || !rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 })
    }

    if (!rider.pdf_storage_path) {
      return NextResponse.json(
        { error: 'PDF not available for this rider' },
        { status: 404 }
      )
    }

    // Allow download for: band owner, or anyone for published riders (public)
    const { data: { user } } = await supabase.auth.getUser()
    const isBandOwner = rider.band?.claimed_by === user?.id

    if (rider.status !== 'published' && !isBandOwner) {
      return NextResponse.json(
        { error: 'This rider is not yet published' },
        { status: 403 }
      )
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from('contracts')
      .createSignedUrl(rider.pdf_storage_path, 3600) // 1 hour

    if (signedError || !signed?.signedUrl) {
      console.error('Error creating signed URL:', signedError)
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    // Return JSON with URL, or redirect if Accept header prefers redirect
    const accept = request.headers.get('accept') || ''
    if (accept.includes('application/json')) {
      return NextResponse.json({ downloadUrl: signed.signedUrl })
    }

    // Default: redirect to signed URL for direct download
    return NextResponse.redirect(signed.signedUrl)
  } catch (error) {
    console.error('Spider rider download error:', error)
    return NextResponse.json(
      { error: 'Failed to get download link' },
      { status: 500 }
    )
  }
}
