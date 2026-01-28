import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'

export async function GET() {
  try {
    const apiKey = process.env.X_API_Key
    const stationId = '693' // The Rock Salt station ID

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Fetch now playing data from AzuraCast
    const response = await fetch(
      `https://a8.asurahosting.com/api/station/${stationId}/nowplaying`,
      {
        headers: {
          'X-API-Key': apiKey,
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`AzuraCast API error: ${response.status}`)
    }

    const data = await response.json()

    const rawArtist = data.now_playing?.song?.artist || 'Unknown Artist'
    let bandSlug: string | undefined

    if (rawArtist && rawArtist !== 'Unknown Artist') {
      const supabase = await createClient()
      const { data: bandByName } = await supabase
        .from('bands')
        .select('slug')
        .ilike('name', rawArtist)
        .limit(1)
        .maybeSingle()

      if (bandByName?.slug) {
        bandSlug = bandByName.slug
      } else {
        const slugCandidate = slugify(rawArtist)
        if (slugCandidate) {
          const { data: bandBySlug } = await supabase
            .from('bands')
            .select('slug')
            .eq('slug', slugCandidate)
            .limit(1)
            .maybeSingle()
          bandSlug = bandBySlug?.slug
        }
      }
    }

    // Transform the AzuraCast response to our format
    const nowPlaying = {
      song: {
        title: data.now_playing?.song?.title || 'Unknown Track',
        artist: rawArtist,
        album: data.now_playing?.song?.album || undefined,
        art: data.now_playing?.song?.art || undefined,
        band_slug: bandSlug,
      },
      live: {
        is_live: data.live?.is_live || false,
        streamer_name: data.live?.streamer_name || undefined,
      },
    }

    return NextResponse.json(nowPlaying)
  } catch (error) {
    console.error('Failed to fetch now playing data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch now playing data' },
      { status: 500 }
    )
  }
}
