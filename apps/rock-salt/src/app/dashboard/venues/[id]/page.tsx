import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import Container from '@/components/Container'
import Link from 'next/link'
import VenueDashboardTabs from '@/components/dashboard/VenueDashboardTabs'
import { getVenueSlots } from '@/app/actions/availability'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

const ALLOWED_TABS = new Set([
  'overview',
  'profile',
  'capabilities',
  'slots',
  'submissions',
  'bookings',
  'wallet',
])

export default async function ManageVenuePage({ params, searchParams }: Props) {
  noStore()
  const { id } = await params
  const { tab } = await searchParams
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(`/auth/signin?redirect=/dashboard/venues/${id}`)
  }

  // Get venue details and verify ownership
  type VenuePhoto = {
    id: string
    url: string
    caption: string | null
    is_primary: boolean | null
    photo_order: number | null
    created_at: string
  }
  type VenueRecord = {
    id: string
    name: string
    slug: string
    address: string | null
    city: string | null
    state: string | null
    phone: string | null
    email: string | null
    website: string | null
    description: string | null
    notes: string | null
    capacity: number | null
    venue_type: string | null
    image_url: string | null
    website_url: string | null
    social_media_links: Record<string, unknown> | null
    claimed_by: string | null
    claimed_at: string | null
    stage_width_feet?: number | null
    stage_depth_feet?: number | null
    input_channels?: number | null
    has_house_drums?: boolean | null
    has_backline?: boolean | null
    typical_guarantee_min?: number | null
    typical_guarantee_max?: number | null
    payment_methods?: string[] | null
    w9_on_file?: boolean | null
    insurance_coi_on_file?: boolean | null
    green_room_available?: boolean | null
    green_room_description?: string | null
    meal_buyout_available?: boolean | null
    typical_meal_buyout_amount?: number | null
    drink_tickets_available?: number | null
    guest_list_spots?: number | null
    parking_spaces?: number | null
    age_restrictions?: string[] | null
    load_in_notes?: string | null
    curfew_time?: string | null
    venue_photos: VenuePhoto[]
  }
  let venue: VenueRecord | null = null
  const { data: venueData, error: venueError } = await supabase
    .from('venues')
    .select(`
      id,
      name,
      slug,
      address,
      city,
      state,
      phone,
      email,
      website,
      description,
      notes,
      capacity,
      venue_type,
      image_url,
      website_url,
      social_media_links,
      claimed_by,
      claimed_at,
      stage_width_feet,
      stage_depth_feet,
      input_channels,
      has_house_drums,
      has_backline,
      typical_guarantee_min,
      typical_guarantee_max,
      payment_methods,
      w9_on_file,
      insurance_coi_on_file,
      green_room_available,
      green_room_description,
      meal_buyout_available,
      typical_meal_buyout_amount,
      drink_tickets_available,
      guest_list_spots,
      parking_spaces,
      age_restrictions,
      load_in_notes,
      curfew_time,
      venue_photos (
        id,
        url,
        caption,
        is_primary,
        photo_order,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  venue = venueData as VenueRecord | null

  if (venueError || !venue) {
    const { data: fallbackVenue, error: fallbackError } = await supabase
      .from('venues')
      .select('id, name, slug, address, city, state, phone, website_url, capacity, venue_type, claimed_by, claimed_at')
      .eq('id', id)
      .single()

    if (!fallbackError && fallbackVenue) {
        venue = {
        ...fallbackVenue,
        email: null,
        website: null,
        description: null,
        notes: null,
        image_url: null,
        social_media_links: null,
        venue_photos: [],
        } as VenueRecord
    }
  }

  if (!venue) {
    redirect('/dashboard')
  }

  // Verify user owns this venue
  if (venue.claimed_by !== user.id) {
    redirect('/dashboard')
  }

  const photos = venue.venue_photos || []

  const [
    submissionsResult,
    acceptancesResult,
    bookingRequestsResult,
    contractsResult,
    balanceResult,
    transactionsResult,
    slotsResult,
  ] = await Promise.all([
    supabase
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
        bands!show_submissions_band_id_fkey(
          id,
          name,
          slug
        )
      `)
      .eq('venue_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('spider_rider_acceptances')
      .select(`
        id,
        spider_rider_id,
        venue_id,
        notes,
        is_active,
        created_at,
        spider_riders (
          id,
          version,
          bands (
            id,
            name,
            slug
          )
        )
      `)
      .eq('venue_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('booking_requests')
      .select(`
        id,
        spider_rider_id,
        venue_id,
        requested_date,
        status,
        notes,
        created_at,
        bands (
          id,
          name,
          slug
        )
      `)
      .eq('venue_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('generated_contracts')
      .select(`
        id,
        event_date,
        agreed_guarantee,
        status,
        generated_at,
        bands (
          id,
          name,
          slug
        )
      `)
      .eq('venue_id', id)
      .order('generated_at', { ascending: false }),
    supabase
      .from('venues')
      .select('salt_rocks_balance')
      .eq('id', id)
      .single(),
    supabase
      .from('salt_rocks_transactions')
      .select('id, venue_id, amount, type, description, created_at')
      .eq('venue_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    getVenueSlots(id),
  ])

  const submissions = submissionsResult.data || []
  const acceptances = acceptancesResult.data || []
  const bookingRequests = bookingRequestsResult.data || []
  const contracts = contractsResult.data || []

  let saltRocksBalance = 0
  if (!balanceResult.error) {
    saltRocksBalance = (balanceResult.data as { salt_rocks_balance?: number } | null)?.salt_rocks_balance || 0
  }

  const transactions = transactionsResult.error ? [] : transactionsResult.data || []
  const slots = slotsResult.slots || []

  const initialTab = tab && ALLOWED_TABS.has(tab) ? tab : 'overview'

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:underline mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            {venue.image_url && (
              <img
                src={venue.image_url}
                alt={venue.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {venue.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Venue Dashboard
              </p>
            </div>
          </div>
          <Link
            href={`/venues/${venue.slug}`}
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
      <VenueDashboardTabs
        venue={venue}
        slots={slots}
        submissions={submissions}
        acceptances={acceptances}
        bookingRequests={bookingRequests}
        contracts={contracts}
        photos={photos}
        saltRocksBalance={saltRocksBalance}
        transactions={transactions}
        initialTab={initialTab}
      />
    </Container>
  )
}

