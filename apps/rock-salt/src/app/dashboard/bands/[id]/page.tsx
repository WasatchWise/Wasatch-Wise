import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Container from '@/components/Container'
import Link from 'next/link'
import BandDashboardTabs from '@/components/dashboard/BandDashboardTabs'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function ManageBandPage({ params, searchParams }: Props) {
  const { id } = await params
  const { tab } = await searchParams
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(`/auth/signin?redirect=/dashboard/bands/${id}`)
  }

  // Get band details and verify ownership
  let band: any | null = null
  const { data: bandData, error: bandError } = await supabase
    .from('bands')
    .select(`
      id,
      name,
      slug,
      bio,
      description,
      image_url,
      origin_city,
      state,
      country,
      formed_year,
      disbanded_year,
      status,
      website_url,
      spotify_url,
      bandcamp_url,
      instagram_handle,
      facebook_url,
      youtube_url,
      press_contact,
      notes,
      claimed_by,
      claimed_at,
      band_tracks (
        id,
        title,
        file_url,
        description,
        track_type,
        play_count,
        is_featured,
        created_at
      ),
      band_photos (
        id,
        url,
        caption,
        is_primary,
        photo_order,
        created_at
      ),
      band_links (
        id,
        label,
        url
      ),
      band_genres (
        genre:genres (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single()

  band = bandData

  if (bandError || !band) {
    const { data: fallbackBand, error: fallbackError } = await supabase
      .from('bands')
      .select('id, name, slug, image_url, claimed_by, claimed_at')
      .eq('id', id)
      .single()

    if (!fallbackError && fallbackBand) {
      band = {
        ...fallbackBand,
        bio: null,
        description: null,
        origin_city: null,
        state: null,
        country: null,
        formed_year: null,
        disbanded_year: null,
        status: null,
        website_url: null,
        spotify_url: null,
        bandcamp_url: null,
        instagram_handle: null,
        facebook_url: null,
        youtube_url: null,
        press_contact: null,
        notes: null,
        band_tracks: [],
        band_photos: [],
        band_links: [],
        band_genres: [],
      }
    }
  }

  // Get all available genres for the editor
  const { data: genres } = await supabase
    .from('genres')
    .select('id, name')
    .order('name', { ascending: true })

  if (!band) {
    redirect('/dashboard')
  }

  // Verify user owns this band
  if (band.claimed_by !== user.id) {
    redirect('/dashboard')
  }

  // Get Spider Riders for this band
  const { data: spiderRiders } = await supabase
    .from('spider_riders')
    .select('*')
    .eq('band_id', id)
    .order('created_at', { ascending: false })

  // Get acceptances for published riders
  const publishedRiderIds = spiderRiders?.filter(r => r.status === 'published').map(r => r.id) || []
  let acceptances: any[] = []
  if (publishedRiderIds.length > 0) {
    const { data: acceptanceData } = await supabase
      .from('spider_rider_acceptances')
      .select(`
        id,
        spider_rider_id,
        venue_id,
        notes,
        is_active,
        created_at,
        venues (
          id,
          name,
          slug,
          city,
          state
        )
      `)
      .in('spider_rider_id', publishedRiderIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    acceptances = acceptanceData || []
  }

  // Get booking requests
  const { data: bookingRequests } = await supabase
    .from('booking_requests')
    .select(`
      id,
      spider_rider_id,
      venue_id,
      requested_date,
      status,
      notes,
      created_at,
      venues (
        id,
        name,
        slug,
        city,
        state
      )
    `)
    .in('spider_rider_id', spiderRiders?.map(r => r.id) || [])
    .order('created_at', { ascending: false })

  // Get show submissions for this band
  const { data: submissions } = await supabase
    .from('show_submissions')
    .select(`
      id,
      band_id,
      venue_id,
      proposed_date,
      proposed_time,
      message,
      status,
      venue_response,
      counter_date,
      counter_time,
      created_at,
      venues!show_submissions_venue_id_fkey(
        id,
        name,
        slug
      )
    `)
    .eq('band_id', id)
    .order('created_at', { ascending: false })

  // Get all venues for submitting shows
  const { data: allVenues } = await supabase
    .from('venues')
    .select('id, name, slug, city, state')
    .order('name', { ascending: true })

  // Get band's Salt Rocks balance (if column exists)
  let saltRocksBalance = 0
  try {
    const { data: balanceData } = await supabase
      .from('bands')
      .select('salt_rocks_balance')
      .eq('id', id)
      .single()
    saltRocksBalance = (balanceData as any)?.salt_rocks_balance || 0
  } catch {
    // Column may not exist in production yet
  }

  // Get recent transactions
  let transactions: any[] = []
  try {
    const { data: txData } = await supabase
      .from('salt_rocks_transactions')
      .select('*')
      .eq('band_id', id)
      .order('created_at', { ascending: false })
      .limit(10)
    transactions = txData || []
  } catch {
    // Table may not have band_id column yet
  }

  // Get generated contracts
  const { data: contracts } = await supabase
    .from('generated_contracts')
    .select(`
      id,
      event_date,
      agreed_guarantee,
      status,
      generated_at,
      venues (
        id,
        name,
        slug
      )
    `)
    .eq('band_id', id)
    .order('generated_at', { ascending: false })

  const tracks = band.band_tracks || []
  const photos = band.band_photos || []

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            {band.image_url && (
              <img
                src={band.image_url}
                alt={band.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {band.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Band Dashboard
              </p>
            </div>
          </div>
          <Link
            href={`/bands/${band.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            View Public Page
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Tabbed Dashboard */}
      <BandDashboardTabs
        band={band}
        genres={genres || []}
        spiderRiders={spiderRiders || []}
        acceptances={acceptances}
        bookingRequests={bookingRequests || []}
        contracts={contracts || []}
        submissions={submissions || []}
        allVenues={allVenues || []}
        tracks={tracks}
        photos={photos}
        saltRocksBalance={saltRocksBalance}
        transactions={transactions}
        initialTab={tab || 'overview'}
      />
    </Container>
  )
}
