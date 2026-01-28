import { notFound } from 'next/navigation'
import { getBandBySlug, getBandEvents, getAllBandSlugs, getEventsByBandName } from '@/lib/supabase/queries'
import { getSpiderRider } from '@/lib/supabase/spider-rider-queries'
import { getArtistDetailsCached, extractArtistId, type ArtistDetails } from '@/lib/apis/spotify'
import Container from '@/components/Container'
import AudioPlayer from '@/components/AudioPlayer'
import ClaimBandButton from '@/components/ClaimBandButton'
import StartConversationButton from '@/components/StartConversationButton'
import SpotifyEmbed from '@/components/SpotifyEmbed'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 0 // Force dynamic rendering

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  // Return empty array for dynamic rendering
  // In production, you can pre-generate known slugs
  return []
}

// Convert slug to readable band name (e.g., "cattle-decapitation" -> "Cattle Decapitation")
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const band = await getBandBySlug(slug)

  if (!band) {
    // Check if band appears in events
    const bandName = slugToName(slug)
    const events = await getEventsByBandName(bandName)
    if (events.length > 0) {
      return {
        title: bandName,
        description: `${bandName} - Utah band with upcoming shows`,
      }
    }
    return {
      title: 'Band Not Found'
    }
  }

  return {
    title: band.name,
    description: `${band.name} - band profile and show history`,
  }
}

export default async function BandPage({ params }: Props) {
  const { slug } = await params
  const band = await getBandBySlug(slug)

  // If band not in database, check if they appear in events
  if (!band) {
    const bandName = slugToName(slug)
    const events = await getEventsByBandName(bandName)

    if (events.length > 0) {
      // Show auto-generated stub page for bands appearing in events
      const now = new Date()
      const upcomingEvents = events.filter(e => e.start_time && new Date(e.start_time) >= now)
      const pastEvents = events.filter(e => e.start_time && new Date(e.start_time) < now)

      // Try to fetch artist photo from Spotify
      const spotifyArtist = await getArtistDetailsCached(null, bandName)

      return (
        <Container className="py-12">
          <div className="mb-8 flex flex-col md:flex-row gap-6 items-start">
            {/* Spotify Artist Photo */}
            {spotifyArtist?.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={spotifyArtist.imageUrl}
                  alt={bandName}
                  className="w-48 h-48 object-cover rounded-lg shadow-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Photo from Spotify
                </p>
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-zinc-900 text-zinc-200 rounded-md text-xs font-semibold uppercase border border-zinc-800">
                  Auto-Generated
                </span>
                <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100">
                  {bandName}
                </h1>
              </div>
              <p className="text-lg text-zinc-400">
                This band appears in our events calendar but hasn't claimed their profile yet.
              </p>
              {spotifyArtist && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {spotifyArtist.genres.slice(0, 4).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-zinc-900 text-zinc-300 text-sm rounded-md border border-zinc-800"
                    >
                      {genre}
                    </span>
                  ))}
                  <a
                    href={spotifyArtist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 border border-zinc-800 text-zinc-200 text-sm rounded-md hover:border-amber-500"
                  >
                    Listen on Spotify
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mb-12 p-6 border border-zinc-800 rounded-md">
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">
              Are you {bandName}?
            </h2>
            <p className="text-zinc-400 mb-4">
              Claim this page to add your bio, photos, music, and upcoming shows.
            </p>
            <Link
              href="/submit"
              className="inline-block px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
            >
              Claim your page
            </Link>
          </div>

          {/* Shows */}
          {upcomingEvents.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Upcoming Shows
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {event.name || 'Untitled Event'}
                    </h3>
                    {event.start_time && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {new Date(event.start_time).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZone: 'America/Denver'
                        })}
                      </p>
                    )}
                    {event.venue && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <Link href={`/venues/${event.venue.id}`} className="text-indigo-600 hover:underline">
                          {event.venue.name}
                        </Link>
                        {event.venue.city && ` • ${event.venue.city}, ${event.venue.state || 'UT'}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {pastEvents.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Past Shows ({pastEvents.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.slice(0, 6).map(event => (
                  <div
                    key={event.id}
                    className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {event.name || 'Untitled Event'}
                    </h3>
                    {event.start_time && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.start_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          timeZone: 'America/Denver'
                        })}
                      </p>
                    )}
                    {event.venue && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.venue.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Info about claiming */}
          <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>
              This page was auto-generated from our events calendar.
              <br />
              <Link href="/submit" className="text-indigo-600 hover:underline">Submit your band</Link> to add photos, music, bio, and more.
            </p>
          </div>
        </Container>
      )
    }

    // No band found anywhere
    notFound()
  }

  const events = await getBandEvents(band.id)

  // Separate upcoming and past events
  const now = new Date()
  const upcomingEvents = events.filter(e => e.start_time && new Date(e.start_time) >= now)
  const pastEvents = events.filter(e => e.start_time && new Date(e.start_time) < now)

  // Get featured/primary photo from database
  const primaryPhoto = band.band_photos?.find(p => p.is_primary) || band.band_photos?.[0]

  // Look for Spotify link in band_links
  const spotifyLink = band.band_links?.find(
    link => link.label?.toLowerCase().includes('spotify') ||
      link.url?.includes('spotify.com/artist')
  )

  // Always fetch Spotify data for embeds and enrichment
  const spotifyArtist = await getArtistDetailsCached(
    spotifyLink?.url || null,
    band.name
  )

  const spiderRider = await getSpiderRider(band.id)

  // Get Spotify artist ID for embed
  const spotifyArtistId = spotifyLink?.url
    ? extractArtistId(spotifyLink.url)
    : spotifyArtist?.id || null

  // Use database photo first, fall back to Spotify
  const displayPhoto = primaryPhoto ? {
    url: primaryPhoto.url,
    caption: primaryPhoto.caption,
    source_attribution: primaryPhoto.source_attribution
  } : spotifyArtist?.imageUrl ? {
    url: spotifyArtist.imageUrl,
    caption: null,
    source_attribution: `Photo from Spotify`
  } : null

  // Combine genres from database and Spotify
  const dbGenres = band.band_genres?.map(bg => bg.genre?.name).filter(Boolean) || []
  const spotifyGenres = spotifyArtist?.genres || []
  const allGenres = [...new Set([...dbGenres, ...spotifyGenres.slice(0, 3)])]

  // Check if HOF tier
  const isHOF = band.tier === 'hof'
  const isPlatinum = band.tier === 'platinum'
  const isFeatured = band.tier === 'featured'

  return (
    <Container className="py-12">
      {/* ROCK & ROLL HALL OF FAME BANNER - Refined */}
      {isHOF && (
        <div className="mb-8 relative bg-zinc-950 border border-amber-500 rounded-md overflow-hidden p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-zinc-900 text-amber-200 rounded-md text-xs font-semibold uppercase border border-amber-500">
              Hall of Fame
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-2 leading-tight">
            {band.name}
          </h1>
          {band.hometown && (
            <p className="text-amber-200 text-lg font-semibold">{band.hometown}</p>
          )}
        </div>
      )}

      {/* PLATINUM TIER BANNER - Refined */}
      {isPlatinum && (
        <div className="mb-8 relative bg-zinc-950 border border-zinc-600 rounded-md overflow-hidden p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-zinc-900 text-zinc-200 rounded-md text-xs font-semibold uppercase border border-zinc-600">
              Platinum
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-2 leading-tight">
            {band.name}
          </h1>
          {band.hometown && (
            <p className="text-zinc-300 text-lg font-semibold">{band.hometown}</p>
          )}
        </div>
      )}

      {/* REGULAR HEADER (Featured/Free tier) */}
      {!isHOF && !isPlatinum && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {isFeatured && (
              <span className="px-2 py-1 bg-zinc-900 text-amber-200 rounded-md text-xs font-semibold uppercase border border-amber-500">
                Featured
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100">
              {band.name}
            </h1>
          </div>
          {band.hometown && (
            <p className="text-xl text-zinc-400 mb-4">{band.hometown}</p>
          )}
        </div>
      )}

      {/* QUICK STATS BAR */}
      {(band.formed_year || band.status || band.origin_city || band.releases?.length || events.length > 0) && (
        <div className="mb-8 p-6 rounded-md border border-zinc-800 bg-zinc-950">
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            {band.origin_city && (
              <div className="text-center md:text-left">
                <div className="text-sm text-zinc-500 uppercase tracking-wide mb-1">From</div>
                <div className="text-lg font-semibold text-zinc-100">
                  {band.origin_city}{band.state ? `, ${band.state}` : ''}
                </div>
              </div>
            )}

            {band.formed_year && (
              <div className="text-center md:text-left">
                <div className="text-sm text-zinc-500 uppercase tracking-wide mb-1">
                  {band.disbanded_year ? 'Active' : 'Formed'}
                </div>
                <div className="text-lg font-semibold text-zinc-100">
                  {band.formed_year}{band.disbanded_year ? ` - ${band.disbanded_year}` : ` (${new Date().getFullYear() - band.formed_year} yrs)`}
                </div>
              </div>
            )}

            {band.status && (
              <div className="text-center md:text-left">
                <div className="text-sm text-zinc-500 uppercase tracking-wide mb-1">Status</div>
                <div className="text-lg font-semibold capitalize text-zinc-100">
                  {band.status}
                </div>
              </div>
            )}

            {band.releases && band.releases.length > 0 && (
              <div className="text-center md:text-left">
                <div className="text-sm text-zinc-500 uppercase tracking-wide mb-1">Releases</div>
                <div className="text-lg font-semibold text-zinc-100">
                  {band.releases.length}
                </div>
              </div>
            )}

            {events.length > 0 && (
              <div className="text-center md:text-left">
                <div className="text-sm text-zinc-500 uppercase tracking-wide mb-1">Total shows</div>
                <div className="text-lg font-semibold text-zinc-100">
                  {events.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENT SECTION */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
          <div className="flex-1 w-full md:w-auto">
            {/* Genres (combined from database + Spotify) */}
            {allGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-sm font-semibold text-zinc-400 mr-2">Genres:</span>
                {allGenres.map((genre, idx) => (
                  <Link
                    key={idx}
                    href={`/discover?genre=${encodeURIComponent(String(genre))}`}
                    className="px-3 py-2 text-sm font-semibold rounded-md border border-zinc-800 text-zinc-300 hover:border-amber-500"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            )}

            {/* Bio - PROMINENTLY DISPLAYED */}
            {(band.bio || band.description) && (
              <div className="mb-6 p-6 rounded-md border border-zinc-800 bg-zinc-950">
                <h2 className="text-2xl font-semibold text-zinc-100 mb-4 uppercase">
                  About
                </h2>
                <p className="text-lg leading-relaxed text-zinc-300">
                  {band.bio || band.description}
                </p>
              </div>
            )}

            {/* Tech Rider */}
            <div className="mb-6 p-5 rounded-md border border-zinc-800 bg-zinc-950">
              <h2 className="text-lg font-semibold text-zinc-100 mb-2 uppercase">
                Tech Rider
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                {spiderRider?.tech_rider_url ? (
                  <a
                    href={spiderRider.tech_rider_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-800 text-zinc-200 hover:border-amber-500 transition-colors font-semibold"
                  >
                    Tech rider PDF
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span>Tech rider not on file.</span>
                )}
                {spiderRider?.stage_plot_url && (
                  <a
                    href={spiderRider.stage_plot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-800 text-zinc-200 hover:border-amber-500 transition-colors font-semibold"
                  >
                    Stage plot
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                {(!spiderRider || !spiderRider.tech_rider_url) && (
                  <Link
                    href="/dashboard/spider-rider"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-800 text-zinc-200 hover:border-amber-500 transition-colors font-semibold"
                  >
                    Open Spider Riders
                  </Link>
                )}
              </div>
            </div>

            {/* Links */}
            {band.band_links && band.band_links.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {band.band_links.map(link => (
                  <a
                    key={link.id}
                    href={link.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-zinc-800 text-zinc-200 hover:border-amber-500 transition-colors font-semibold"
                  >
                    {link.label || 'Link'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Primary Photo (from database or Spotify) */}
          {displayPhoto && (
            <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center md:items-start">
              <img
                src={displayPhoto.url}
                alt={displayPhoto.caption || band.name}
                className="w-full md:w-64 h-auto md:h-64 object-cover rounded-md border border-zinc-800"
              />
              {displayPhoto.source_attribution && (
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  {displayPhoto.source_attribution}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Claim Page Button (if not claimed) - MOVED LOWER AND STYLED DIFFERENTLY */}
        <ClaimBandButton
          bandId={band.id}
          bandName={band.name}
          isClaimed={!!band.claimed_by}
        />

        {/* Message Band Button (for venues to contact bands) */}
        {band.claimed_by && (
          <div className="mt-4">
            <StartConversationButton
              targetType="band"
              targetId={band.id}
              targetName={band.name}
            />
          </div>
        )}
      </div>

      {/* LISTEN NOW - Spotify Embed */}
      {spotifyArtistId && (
        <section className="mb-12">
          <div className="p-6 rounded-md border border-zinc-800 bg-zinc-950">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <h2 className="text-2xl font-semibold uppercase text-zinc-100">
                Listen now
              </h2>
            </div>
            <SpotifyEmbed artistId={spotifyArtistId} theme="dark" />
          </div>
        </section>
      )}

      {/* Band Members Section */}
      {band.band_members && band.band_members.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-zinc-100">
            Band members
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {band.band_members.map((member, idx) => (
              <div
                key={idx}
                className="p-6 rounded-md border border-zinc-800 bg-zinc-950"
              >
                {member.musician?.slug ? (
                  <a
                    href={`/musicians/${member.musician.slug}`}
                    className="text-xl font-semibold mb-2 block text-amber-200 hover:underline"
                  >
                    {member.musician.name}
                  </a>
                ) : (
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                    {member.musician?.name || 'Unknown'}
                  </h3>
                )}

                {member.instrument && (
                  <p className="text-zinc-300 font-semibold mb-1">
                    {member.instrument}
                  </p>
                )}

                {member.role && member.role !== member.instrument && (
                  <p className="text-zinc-400 text-sm mb-2">
                    {member.role}
                  </p>
                )}

                {(member.tenure_start || member.tenure_end) && (
                  <p className="text-sm text-zinc-500 mb-2">
                    {member.tenure_start || '?'} - {member.tenure_end || 'Present'}
                  </p>
                )}

                {member.musician?.bio && (
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-3">
                    {member.musician.bio}
                  </p>
                )}

                {(member.musician?.website_url || member.musician?.instagram_handle) && (
                  <div className="flex gap-3 mt-4">
                    {member.musician.website_url && (
                      <a
                        href={member.musician.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-200 hover:text-amber-100"
                      >
                        Website
                      </a>
                    )}
                    {member.musician.instagram_handle && (
                      <a
                        href={`https://instagram.com/${member.musician.instagram_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-200 hover:text-amber-100"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Releases/Albums Section */}
      {band.releases && band.releases.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-zinc-100">
            Releases
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {band.releases
              .sort((a, b) => {
                const yearA = a.release_year || 0
                const yearB = b.release_year || 0
                return yearB - yearA
              })
              .map((release) => (
                <div
                  key={release.id}
                  className="rounded-md overflow-hidden border border-zinc-800 bg-zinc-950"
                >
                  {release.cover_image_url && (
                    <img
                      src={release.cover_image_url}
                      alt={release.title}
                      className="w-full aspect-square object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-zinc-100 mb-1">
                      {release.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
                      {release.release_year && <span>{release.release_year}</span>}
                      {release.format && (
                        <>
                          {release.release_year && <span>•</span>}
                          <span className="capitalize">{release.format}</span>
                        </>
                      )}
                    </div>
                    {(release.spotify_url || release.bandcamp_url) && (
                      <div className="flex gap-2">
                        {release.spotify_url && (
                          <a
                            href={release.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-3 py-2 rounded-md text-sm font-semibold border border-zinc-800 text-zinc-200 hover:border-amber-500"
                          >
                            Spotify
                          </a>
                        )}
                        {release.bandcamp_url && (
                          <a
                            href={release.bandcamp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-3 py-2 rounded-md text-sm font-semibold border border-zinc-800 text-zinc-200 hover:border-amber-500"
                          >
                            Bandcamp
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}


      {/* Photo Gallery */}
      {band.band_photos && band.band_photos.length > 1 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Photos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {band.band_photos
              .sort((a, b) => (a.photo_order || 0) - (b.photo_order || 0))
              .map(photo => (
                <div key={photo.id} className="aspect-square">
                  <img
                    src={photo.url}
                    alt={photo.caption || band.name}
                    className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                  />
                  {photo.caption && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Custom HTML Section */}
      {band.custom_html && (
        <section className="mb-12">
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: band.custom_html }}
          />
        </section>
      )}

      {/* Upcoming Shows */}
      {upcomingEvents.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Upcoming Shows
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {event.name || 'Untitled Event'}
                </h3>
                {event.start_time && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {new Date(event.start_time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZone: 'America/Denver'
                    })}
                  </p>
                )}
                {event.venue && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {event.venue.name}
                    {event.venue.address && ` • ${event.venue.address}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Shows */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Past Shows
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.slice(0, 6).map(event => (
              <div
                key={event.id}
                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {event.name || 'Untitled Event'}
                </h3>
                {event.start_time && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.start_time).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                )}
                {event.venue && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {event.venue.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!band.band_photos?.length && events.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Additional data pending verification.
          </p>
        </div>
      )}
    </Container>
  )
}
