import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Container from '@/components/Container'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Band Index | The Rock Salt',
  description: 'Index of Utah bands with genres, location, and booking context.',
}

export const revalidate = 60 // Revalidate every minute

// Get all bands with their genres
async function getBandsWithGenres() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bands')
    .select(`
      id,
      name,
      slug,
      hometown,
      bio,
      image_url,
      tier,
      featured,
      band_genres (
        genre:genres ( id, name )
      ),
      band_links (
        label,
        url
      ),
      band_photos (
        url,
        is_primary
      )
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching bands:', error)
    return []
  }

  return data || []
}

// Get all unique genres
async function getAllGenres() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('genres')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching genres:', error)
    return []
  }

  return data || []
}

// Get upcoming events to show "playing soon" bands
async function getUpcomingEventBands() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      name,
      start_time,
      venue:venues ( name, city ),
      event_bands (
        band:bands (
          id,
          name,
          slug
        )
      )
    `)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Error fetching upcoming events:', error)
    return []
  }

  return data || []
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const selectedGenre = typeof params.genre === 'string' ? params.genre : null
  const searchQuery = typeof params.q === 'string' ? params.q.toLowerCase() : null

  const [bands, genres, upcomingEvents] = await Promise.all([
    getBandsWithGenres(),
    getAllGenres(),
    getUpcomingEventBands(),
  ])

  // Filter bands based on search and genre
  let filteredBands = bands.filter(band => {
    // Genre filter
    if (selectedGenre) {
      const bandGenres = band.band_genres?.map(bg => bg.genre?.name?.toLowerCase()) || []
      if (!bandGenres.includes(selectedGenre.toLowerCase())) {
        return false
      }
    }

    // Search filter
    if (searchQuery) {
      const nameMatch = band.name.toLowerCase().includes(searchQuery)
      const bioMatch = band.bio?.toLowerCase().includes(searchQuery)
      const hometownMatch = band.hometown?.toLowerCase().includes(searchQuery)
      if (!nameMatch && !bioMatch && !hometownMatch) {
        return false
      }
    }

    return true
  })

  // Sort: Featured/HOF first, then alphabetically
  filteredBands = filteredBands.sort((a, b) => {
    if (a.tier === 'hof' && b.tier !== 'hof') return -1
    if (b.tier === 'hof' && a.tier !== 'hof') return 1
    if (a.featured && !b.featured) return -1
    if (b.featured && !a.featured) return 1
    return a.name.localeCompare(b.name)
  })

  // Get bands playing soon (from events)
  const bandsPlayingSoon = new Set<string>()
  upcomingEvents.forEach(event => {
    event.event_bands?.forEach(eb => {
      if (eb.band?.slug) {
        bandsPlayingSoon.add(eb.band.slug)
      }
    })
  })

  // Popular genres (ones with most bands)
  const genreCounts = new Map<string, number>()
  bands.forEach(band => {
    band.band_genres?.forEach(bg => {
      const name = bg.genre?.name
      if (name) {
        genreCounts.set(name, (genreCounts.get(name) || 0) + 1)
      }
    })
  })
  const popularGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name]) => name)

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-4">
          Band Index
        </h1>
        <p className="text-lg text-zinc-400">
          {filteredBands.length} bands indexed
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery || ''}
            placeholder="Search bands, genres, locations"
            className="flex-1 px-4 py-3 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-5 py-3 border border-zinc-800 text-zinc-100 rounded-md hover:border-amber-500 hover:text-amber-200 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Genre Pills */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/discover"
            className={`px-3 py-2 rounded-md text-sm font-semibold border transition-colors ${
              !selectedGenre
                ? 'border-amber-500 text-amber-200 bg-zinc-900'
                : 'border-zinc-800 text-zinc-400 hover:text-zinc-100'
            }`}
          >
            All Genres
          </Link>
          {popularGenres.map(genre => (
            <Link
              key={genre}
              href={`/discover?genre=${encodeURIComponent(genre)}`}
              className={`px-3 py-2 rounded-md text-sm font-semibold border transition-colors ${
                selectedGenre?.toLowerCase() === genre.toLowerCase()
                  ? 'border-amber-500 text-amber-200 bg-zinc-900'
                  : 'border-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {genre}
            </Link>
          ))}
        </div>

        {/* Active Filters */}
        {(selectedGenre || searchQuery) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Filter:</span>
            {selectedGenre && (
              <span className="px-3 py-1 bg-zinc-900 text-zinc-200 rounded-md border border-zinc-800">
                {selectedGenre}
              </span>
            )}
            {searchQuery && (
              <span className="px-3 py-1 bg-zinc-900 text-zinc-200 rounded-md border border-zinc-800">
                "{searchQuery}"
              </span>
            )}
            <Link
              href="/discover"
              className="text-zinc-400 hover:text-zinc-100 font-semibold"
            >
              Clear
            </Link>
          </div>
        )}
      </div>

      {/* Playing This Week Banner */}
      {!selectedGenre && !searchQuery && bandsPlayingSoon.size > 0 && (
        <div className="mb-8 p-4 border border-zinc-800 rounded-md">
          <h2 className="text-lg font-semibold text-zinc-100 mb-2">
            Bands playing soon
          </h2>
          <div className="flex flex-wrap gap-2">
            {[...bandsPlayingSoon].slice(0, 8).map(slug => {
              const band = bands.find(b => b.slug === slug)
              if (!band) return null
              return (
                <Link
                  key={slug}
                  href={`/bands/${slug}`}
                  className="px-3 py-1 border border-zinc-800 text-zinc-300 rounded-md text-sm hover:text-zinc-100"
                >
                  {band.name}
                </Link>
              )
            })}
            <Link
              href="/events"
              className="px-3 py-1 border border-zinc-800 text-zinc-300 rounded-md text-sm hover:text-zinc-100"
            >
              Full gig guide
            </Link>
          </div>
        </div>
      )}

      {/* Band Grid */}
      {filteredBands.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBands.map(band => {
            const primaryPhoto = band.band_photos?.find(p => p.is_primary) || band.band_photos?.[0]
            const imageUrl = primaryPhoto?.url || band.image_url
            const genres = band.band_genres?.map(bg => bg.genre?.name).filter(Boolean).slice(0, 2) || []
            const isPlayingSoon = band.slug && bandsPlayingSoon.has(band.slug)
            const spotifyLink = band.band_links?.find(l =>
              l.label?.toLowerCase().includes('spotify') ||
              l.url?.includes('spotify.com')
            )

            return (
              <Link
                key={band.id}
                href={`/bands/${band.slug}`}
                className={`group relative bg-zinc-950 rounded-md overflow-hidden border transition-colors ${
                  band.tier === 'hof'
                    ? 'border-amber-500'
                    : band.tier === 'platinum'
                    ? 'border-zinc-600'
                    : isPlayingSoon
                    ? 'border-emerald-600'
                    : 'border-zinc-800 hover:border-amber-500'
                }`}
              >
                {/* Image */}
                <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={band.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-zinc-500">
                      No image
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {band.tier === 'hof' && (
                    <span className="px-2 py-1 bg-zinc-900 text-amber-200 text-xs font-semibold rounded-md border border-amber-500">
                      Hall of Fame
                      </span>
                    )}
                    {band.tier === 'platinum' && (
                    <span className="px-2 py-1 bg-zinc-900 text-zinc-200 text-xs font-semibold rounded-md border border-zinc-600">
                        PLATINUM
                      </span>
                    )}
                    {isPlayingSoon && (
                    <span className="px-2 py-1 bg-zinc-900 text-emerald-200 text-xs font-semibold rounded-md border border-emerald-600">
                      Playing soon
                      </span>
                    )}
                  </div>

                  {/* Spotify indicator */}
                {spotifyLink && (
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-1 bg-zinc-900 text-emerald-200 text-xs rounded-md border border-emerald-600">
                      Spotify
                    </span>
                  </div>
                )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-zinc-100 mb-1 group-hover:text-amber-200 transition-colors">
                    {band.name}
                  </h3>
                  {band.hometown && (
                    <p className="text-sm text-zinc-400 mb-2">
                      {band.hometown}
                    </p>
                  )}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {genres.map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-zinc-900 text-zinc-300 text-xs rounded-md border border-zinc-800"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-zinc-800 rounded-md">
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            No bands found
          </h2>
          <p className="text-zinc-400 mb-6">
            Adjust search or filters.
          </p>
          <Link
            href="/discover"
            className="inline-block px-4 py-2 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500"
          >
            Clear filters
          </Link>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 p-8 border border-zinc-800 rounded-md text-center">
        <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
          Submit band
        </h2>
        <p className="text-zinc-400 mb-6">
          Add your band with verified links and metadata.
        </p>
        <Link
          href="/submit"
          className="inline-block px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500"
        >
          Open intake
        </Link>
      </div>
    </Container>
  )
}
