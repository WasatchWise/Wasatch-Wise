import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSpiderRider } from '@/lib/supabase/spider-rider-queries'
import SpiderRiderForm from '@/components/SpiderRiderForm'
import Container from '@/components/Container'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tour Spider Rider',
  description: 'Create your touring contract and get booked by qualified venues and event organizers.',
}

export const dynamic = 'force-dynamic'

export default async function SpiderRiderPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get the band claimed by this user
  const { data: band } = await supabase
    .from('bands')
    .select('id')
    .eq('claimed_by', user.id)
    .single()

  if (!band) {
    // If no band is claimed, redirect to the band list or a claim page
    redirect('/bands?claim=true')
  }

  const bandId = band.id

  // Fetch existing rider if one exists
  const existingRider = await getSpiderRider(bandId)

  return (
    <Container className="py-12">
      <SpiderRiderForm bandId={bandId} existingRider={existingRider} />
    </Container>
  )
}
