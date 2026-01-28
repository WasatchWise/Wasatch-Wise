import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const genre = searchParams.get('genre')
    const state = searchParams.get('state')

    const supabase = await createClient()

    // Build query for bands
    // Note: salt_rocks_balance/boost_score may not exist until migrations are applied
    let query = supabase
      .from('bands')
      .select(`
        id,
        name,
        slug,
        bio,
        origin_city,
        state,
        image_url,
        band_genres(
          genre:genres(name)
        )
      `, { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    // Filter by state if provided
    if (state) {
      query = query.eq('state', state)
    }

    const { data: bands, error, count } = await query

    if (error) {
      console.error('Leaderboard query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard', details: error.message },
        { status: 500 }
      )
    }

    // If genre filter, filter in-memory (would be better as a DB join)
    let filteredBands = bands || []
    if (genre) {
      filteredBands = filteredBands.filter((band) =>
        band.band_genres?.some(
          (bg: { genre: { name: string } | null }) =>
            bg.genre?.name?.toLowerCase().replace(/\s+/g, '-') === genre
        )
      )
    }

    // Get active boost counts for each band (if table exists)
    const bandIds = filteredBands.map(b => b.id)
    let boostCounts: Record<string, number> = {}

    if (bandIds.length > 0) {
      try {
        const { data: boosts } = await supabase
          .from('band_boosts')
          .select('band_id')
          .in('band_id', bandIds)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())

        if (boosts) {
          boostCounts = boosts.reduce((acc, boost) => {
            acc[boost.band_id] = (acc[boost.band_id] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        }
      } catch {
        // band_boosts table may not exist yet
      }
    }

    // Format response
    const leaderboard = filteredBands.map((band, index) => ({
      rank: offset + index + 1,
      id: band.id,
      name: band.name,
      slug: band.slug,
      bio: band.bio,
      city: band.origin_city,
      state: band.state,
      imageUrl: band.image_url,
      saltRocksBalance: (band as Record<string, unknown>).salt_rocks_balance as number || 0,
      boostScore: (band as Record<string, unknown>).boost_score as number || 0,
      activeBoosts: boostCounts[band.id] || 0,
      genres: band.band_genres
        ?.map((bg: { genre: { name: string } | null }) => ({
          name: bg.genre?.name,
          slug: bg.genre?.name?.toLowerCase().replace(/\s+/g, '-'),
        }))
        .filter((g): g is { name: string; slug: string } => !!g.name) || [],
    }))

    return NextResponse.json({
      leaderboard,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
