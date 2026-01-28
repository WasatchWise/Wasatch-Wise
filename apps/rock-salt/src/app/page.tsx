import { getBands, getEvents, getBandBySlug } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NowPlaying from '@/components/NowPlaying'

export const revalidate = 60

export default async function HomePage() {
  const now = new Date()
  const displayDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Data fetching
  const [allBands, allEvents] = await Promise.all([
    getBands(100),
    getEvents(200) // Increased to capture all month's events
  ])

  // Improved Featured Artist Logic:
  // 1. Try to find a band with 'featured' = true
  // 2. If many, pick one (could be random, but let's just pick first for stability)
  // 3. Fallback to 'eagle-twin' or first band
  const featuredArtist = allBands.find(b => b.featured) || allBands.find(b => b.slug === 'eagle-twin') || allBands[0]

  if (!featuredArtist) {
    return <div>No bands found.</div>
  }

  const band = await getBandBySlug(featuredArtist.slug || '')
  if (!band) return <div>Artist not found</div>

  const allUpcomingEvents = allEvents
    .filter(e => e.start_time && new Date(e.start_time) >= now)
    .sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime())

  const upcomingEvents = allUpcomingEvents.slice(0, 5) // Show only 5 for display

  // Get stats for social proof
  const supabase = await createClient()
  const { count: totalBandsCount } = await supabase
    .from('bands')
    .select('id', { count: 'exact', head: true })

  const totalBands = totalBandsCount ?? allBands.length
  const totalEvents = allUpcomingEvents.length // Total count of all upcoming events

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm text-zinc-400">Documenting Utah music since 2002 • {displayDate}</p>
              <h1 className="text-4xl md:text-5xl font-semibold mt-2">The Rock Salt</h1>
              <p className="text-xs tracking-[0.2em] text-zinc-500 mt-3">
                YOUR BAND LIVES HERE
              </p>
              <p className="text-zinc-400 mt-3 max-w-2xl">
                The town square for bands, venues, and fans. Schedule, archive, and coordinate.
              </p>
            </div>
            <form action="/discover" method="get" className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <input
                type="text"
                name="q"
                placeholder="Search bands, venues, events"
                className="flex-1 px-4 py-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-md border border-zinc-800 text-zinc-100 hover:border-amber-500 hover:text-amber-200 transition-colors"
              >
                Search
              </button>
            </form>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/events" className="px-3 py-2 border border-zinc-800 rounded-md hover:border-amber-500">
                Schedule
              </Link>
              <Link href="/spider-network/web" className="px-3 py-2 border border-zinc-800 rounded-md hover:border-amber-500">
                Network Map
              </Link>
              <Link href="/bands" className="px-3 py-2 border border-zinc-800 rounded-md hover:border-amber-500">
                Bands
              </Link>
              <Link href="/venues" className="px-3 py-2 border border-zinc-800 rounded-md hover:border-amber-500">
                Venues
              </Link>
              <Link href="/live" className="px-3 py-2 border border-zinc-800 rounded-md hover:border-amber-500">
                Stream
              </Link>
              <Link href="/book" className="px-3 py-2 border border-zinc-800 rounded-md hover:border-amber-500">
                Book
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
              <div>
                <div className="text-lg font-semibold text-zinc-100">{totalBands}</div>
                <div>Active bands indexed</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-100">{totalEvents}</div>
                <div>Upcoming events</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-100">24/7</div>
                <div>Live stream</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">This week</h2>
                <Link href="/events" className="text-sm text-zinc-400 hover:text-zinc-100">
                  Full gig guide
                </Link>
              </div>
              {upcomingEvents.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {upcomingEvents.slice(0, 6).map((event) => {
                    const eventDate = new Date(event.start_time!)
                    return (
                      <Link
                        key={event.id}
                        href={`/events#${event.id}`}
                        className="border border-zinc-800 rounded-md p-4 hover:border-amber-500 transition-colors"
                      >
                        <div className="text-sm text-zinc-400">
                          {eventDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'America/Denver'
                          })}
                        </div>
                        <div className="text-base font-semibold mt-2 line-clamp-2">{event.name}</div>
                        <div className="text-sm text-zinc-400 mt-1">
                          {event.venue?.name || 'Venue'} • {eventDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'America/Denver'
                          })}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-sm text-zinc-500 border border-zinc-800 rounded-md p-4">
                  No upcoming events listed.
                </div>
              )}
            </div>
            <div className="border border-zinc-800 rounded-md p-4 space-y-6">
              <div>
                <div className="text-sm text-zinc-400">Now playing</div>
                <h3 className="text-lg font-semibold mt-2">Rock Salt Radio</h3>
                <div className="mt-4 border border-zinc-800 rounded-md p-3 bg-zinc-900">
                  <NowPlaying />
                </div>
                <Link
                  href="/live"
                  className="mt-4 inline-flex px-3 py-2 border border-zinc-800 rounded-md hover:border-amber-500 text-sm"
                >
                  Open stream
                </Link>
              </div>

              <div>
                <div className="text-sm text-zinc-400">Curated playlist</div>
                <h3 className="text-lg font-semibold mt-2 mb-4">The Rock Salt: Fresh Picks</h3>
                <iframe
                  style={{ borderRadius: '12px' }}
                  src="https://open.spotify.com/embed/playlist/6uTuAYkMZJuFDpvEDUo3Iz?utm_source=generator&theme=0"
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="The Rock Salt Spotify Playlist"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
          <div className="border border-zinc-800 rounded-md p-4">
            <h3 className="text-lg font-semibold text-amber-200">Find Bandmates</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Looking for a drummer? Or a band to join? Browse local musicians by instrument and availability.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/musicians" className="px-3 py-2 border border-zinc-800 rounded-md text-sm hover:border-amber-500">
                Browse musicians
              </Link>
              <Link href="/submit" className="px-3 py-2 border border-zinc-800 rounded-md text-sm hover:border-amber-500">
                Create profile
              </Link>
            </div>
          </div>
          <div className="border border-zinc-800 rounded-md p-4">
            <h3 className="text-lg font-semibold text-[#5865F2]">Join Discord</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Real-time coordination. Connect with 890+ local musicians to book shows and find network connections.
            </p>
            <a
              href="https://discord.gg/hW4dmajPkS"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md text-sm transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-2.05-9.12-5.594-13.682a.074.074 0 0 0-.033-.027ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419Z" /></svg>
              Join Community
            </a>
          </div>
          <div className="border border-zinc-800 rounded-md p-4">
            <h3 className="text-lg font-semibold">Archive access</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Band pages, venue specs, and show history in one index.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/bands" className="px-3 py-2 border border-zinc-800 rounded-md text-sm hover:border-amber-500">
                Band index
              </Link>
              <Link href="/venues" className="px-3 py-2 border border-zinc-800 rounded-md text-sm hover:border-amber-500">
                Venue index
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6">
          <div className="border border-zinc-800 rounded-md p-4">
            <h3 className="text-lg font-semibold">Spider Riders</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Standardized booking terms. Verified venues access full riders.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/spider-riders" className="px-3 py-2 border border-zinc-800 rounded-md text-sm">
                Browse riders
              </Link>
              <Link href="/dashboard/spider-rider" className="px-3 py-2 border border-zinc-800 rounded-md text-sm">
                Publish rider
              </Link>
            </div>
          </div>
          <div className="border border-zinc-800 rounded-md p-4">
            <h3 className="text-lg font-semibold">Submit master file</h3>
            <p className="text-sm text-zinc-400 mt-2">
              WAV, FLAC, or MP3. Add credits, socials, and location metadata.
            </p>
            <Link href="/submit" className="mt-4 inline-flex px-3 py-2 border border-zinc-800 rounded-md text-sm">
              Open intake
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
