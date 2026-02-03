import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Container from '@/components/Container'
import Link from 'next/link'
import SpiderRiderPublishedSuccess from './SpiderRiderPublishedSuccess'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ rider_id?: string; rider_code?: string }>
}

export default async function SpiderRiderPublishedPage({ params, searchParams }: Props) {
  const { id: bandId } = await params
  const { rider_id, rider_code } = await searchParams
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect(`/auth/signin?redirect=/dashboard/bands/${bandId}/spider-rider/published`)
  }

  // Verify band ownership
  const { data: band, error: bandError } = await supabase
    .from('bands')
    .select('id, name, slug, claimed_by')
    .eq('id', bandId)
    .single()

  if (bandError || !band || band.claimed_by !== user.id) {
    redirect('/dashboard')
  }

  const riderId = rider_id || ''
  if (!riderId) {
    redirect(`/dashboard/bands/${bandId}?tab=spider-rider`)
  }

  // Fetch rider details (may have rider_code, pdf_storage_path from publish)
  const { data: rider } = await supabase
    .from('spider_riders')
    .select('id, rider_code, version, published_at, pdf_storage_path')
    .eq('id', riderId)
    .eq('band_id', bandId)
    .single()

  const displayCode = rider?.rider_code || rider_code || '—'
  const hasPdf = Boolean(rider?.pdf_storage_path)

  // Get acceptance/booking counts for "What Happens Next"
  const { count: acceptanceCount } = await supabase
    .from('spider_rider_acceptances')
    .select('*', { count: 'exact', head: true })
    .eq('spider_rider_id', riderId)
    .eq('is_active', true)

  const { count: bookingCount } = await supabase
    .from('booking_requests')
    .select('*', { count: 'exact', head: true })
    .eq('spider_rider_id', riderId)
    .eq('status', 'pending')

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://therocksalt.com'}/book/spider-riders/${riderId}`

  return (
    <Container>
      <div className="max-w-2xl mx-auto py-12">
        <SpiderRiderPublishedSuccess
          bandName={band.name}
          riderCode={displayCode}
          riderVersion={rider?.version || 'v1'}
          publishedAt={rider?.published_at || new Date().toISOString()}
          riderId={riderId}
          publicUrl={publicUrl}
          hasPdf={hasPdf}
          acceptanceCount={acceptanceCount ?? 0}
          pendingBookingCount={bookingCount ?? 0}
          bandId={bandId}
        />
      </div>
    </Container>
  )
}
