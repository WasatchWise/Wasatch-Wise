'use client'

import { useState, useMemo } from 'react'
import type { EventWithRelations } from '@/lib/supabase/queries'

interface EventsCalendarClientProps {
  initialEvents: EventWithRelations[]
}

export default function EventsCalendarClient({ initialEvents }: EventsCalendarClientProps) {
  const [genreFilter, setGenreFilter] = useState('ALL')
  const [regionFilter, setRegionFilter] = useState('ALL')

  // Dynamic Dates for Header
  const now = new Date()
  const displayMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const todayLabel = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })

  const handleGenreFilter = (genre: string) => {
    setGenreFilter(genre)
    // Future: implement filtering against event tags/genres
  }

  const handleRegionFilter = (region: string) => {
    setRegionFilter(region)
    // Future: implement filtering against venue city
  }

  // Filtering & Grouping Logic
  const { thisWeek, comingLater, pastEvents, highlights } = useMemo(() => {
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000
    const weekFromNow = new Date(now.getTime() + oneWeekMs)

    // Sort all events by date
    const sorted = [...initialEvents].sort((a, b) =>
      new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime()
    )

    const upcoming = sorted.filter(e => e.start_time && new Date(e.start_time) >= now)
    const archived = sorted.filter(e => e.start_time && new Date(e.start_time) < now).reverse()

    return {
      highlights: upcoming.slice(0, 2), // Next 2 shows
      thisWeek: upcoming.filter(e => new Date(e.start_time!) < weekFromNow),
      comingLater: upcoming.filter(e => new Date(e.start_time!) >= weekFromNow),
      pastEvents: archived
    }
  }, [initialEvents])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 py-8 mb-10">
        <div className="max-w-[1200px] mx-auto px-5">
          <h1 className="text-4xl md:text-5xl font-semibold uppercase tracking-tight mb-2">
            {displayMonth}
          </h1>
          <div className="text-zinc-300 text-lg font-semibold uppercase tracking-wide">
            Local show calendar
          </div>
          <div className="text-zinc-500 text-sm mt-2">
            Documenting Utah music since 2002 • Updated {todayLabel}
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-5">
        {/* Filters */}
        <div className="mb-8 p-5 bg-zinc-950 rounded-md border border-zinc-800">
          <span className="text-zinc-300 font-semibold text-sm uppercase mb-2 block">
            Filter by Genre
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by genre">
            {['ALL', 'PUNK/HARDCORE', 'METAL', 'INDIE/ALT', 'FOLK/AMERICANA', 'COUNTRY', 'EDM/ELECTRONIC', 'BLUES/ROCK'].map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreFilter(genre)}
                aria-pressed={genreFilter === genre}
                className={`px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${genreFilter === genre
                  ? 'border-amber-500 text-amber-200'
                  : 'border-zinc-800 text-zinc-400 hover:text-zinc-100'
                  }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 p-5 bg-zinc-950 rounded-md border border-zinc-800">
          <span className="text-zinc-300 font-semibold text-sm uppercase mb-2 block">
            Filter by Region
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by region">
            {['ALL', 'SALT LAKE VALLEY', 'UTAH COUNTY', 'OGDEN/WEBER', 'RURAL'].map((region) => (
              <button
                key={region}
                onClick={() => handleRegionFilter(region)}
                aria-pressed={regionFilter === region}
                className={`px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${regionFilter === region
                  ? 'border-amber-500 text-amber-200'
                  : 'border-zinc-800 text-zinc-400 hover:text-zinc-100'
                  }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Don't Sleep On - Auto-computed highlights */}
        {highlights.length > 0 && (
          <div className="mb-12 border border-zinc-800 rounded-md p-8">
            <div className="text-2xl font-semibold text-zinc-100 mb-5">
              Highlights
            </div>
            <div className="space-y-4">
              {highlights.map(event => {
                const date = new Date(event.start_time!)
                const isToday = date.toDateString() === now.toDateString()
                return (
                  <div key={event.id} className="bg-zinc-900 p-4 rounded-md border-l-4 border-amber-500">
                    <strong className="text-amber-200">
                      {isToday ? 'Tonight' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </strong>{' '}
                    — {event.name || event.title} @ {event.venue?.name || 'Venue TBD'}
                  </div>
                )
              })}
              <div className="bg-zinc-900 p-4 rounded-md border-l-4 border-amber-500 text-zinc-300">
                Additional dates pending verification.
              </div>
            </div>
          </div>
        )}

        {/* THIS WEEK */}
        <div className="mb-12 bg-zinc-950 rounded-md p-8 border border-zinc-800">
          <h2 className="text-2xl font-semibold text-zinc-100 uppercase mb-6 pb-4 border-b border-zinc-800 tracking-tight">
            Next 7 Days
          </h2>

          {thisWeek.length > 0 ? (
            thisWeek.map(event => (
              <div key={event.id}>
                <DayHeader day={new Date(event.start_time!).toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit' }).toUpperCase()} />
                <ShowCard
                  venue={event.venue?.name || 'TBD'}
                  location={event.venue?.city || ''}
                  lineup={event.name || event.title || ''}
                  meta={[
                    { label: 'Time', value: new Date(event.start_time!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
                  ]}
                />
              </div>
            ))
          ) : (
            <p className="text-zinc-500 py-8 text-center">No shows scheduled for the next 7 days.</p>
          )}
        </div>

        {/* COMING LATER */}
        <div className="mb-12 bg-zinc-950 rounded-md p-8 border border-zinc-800">
          <h2 className="text-2xl font-semibold text-zinc-100 uppercase mb-6 tracking-tight">
            Coming later
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {comingLater.length > 0 ? (
              comingLater.map(event => (
                <div key={event.id} className="p-4 bg-zinc-900 rounded-md border-l-4 border-zinc-700">
                  <div className="font-semibold text-zinc-100">
                    {new Date(event.start_time!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {event.name || event.title}
                  </div>
                  <div className="text-sm text-zinc-500">{event.venue?.name || 'TBD'} • {event.venue?.city || ''}</div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 col-span-2 text-center p-4">Additional dates pending verification.</p>
            )}
          </div>
        </div>

        {/* PAST EVENTS ARCHIVE */}
        {pastEvents.length > 0 && (
          <div className="mb-12 bg-zinc-950 rounded-md p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold text-zinc-400 uppercase mb-6 pb-4 border-b border-zinc-800 tracking-tight">
              Past events archive
            </h2>

            <div className="space-y-2">
              <details className="group">
                <summary className="cursor-pointer list-none flex items-center justify-between p-4 bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors">
                  <span className="font-semibold text-amber-200">Recently past shows (expand)</span>
                  <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 mt-2 space-y-4">
                  {pastEvents.slice(0, 15).map(event => (
                    <ShowCard
                      key={event.id}
                      venue={event.venue?.name || 'TBD'}
                      location={event.venue?.city || ''}
                      lineup={event.name || event.title || ''}
                      meta={[
                        { label: 'Date', value: new Date(event.start_time!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
                      ]}
                    />
                  ))}
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Venue Table */}
        <div className="mb-12 bg-zinc-950 rounded-md p-8 overflow-x-auto border border-zinc-800">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-5">
            Venue quick reference
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-zinc-900 text-zinc-300 p-4 text-left font-semibold uppercase text-xs border-b border-zinc-800">Venue</th>
                  <th className="bg-zinc-900 text-zinc-300 p-4 text-left font-semibold uppercase text-xs border-b border-zinc-800">Location</th>
                  <th className="bg-zinc-900 text-zinc-300 p-4 text-left font-semibold uppercase text-xs border-b border-zinc-800">Genre focus</th>
                  <th className="bg-zinc-900 text-zinc-300 p-4 text-left font-semibold uppercase text-xs border-b border-zinc-800">Notes</th>
                </tr>
              </thead>
              <tbody>
                {venueData.map((venue, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40">
                    <td className="p-4 border-b border-zinc-800"><strong>{venue.name}</strong></td>
                    <td className="p-4 border-b border-zinc-800">{venue.location}</td>
                    <td className="p-4 border-b border-zinc-800">{venue.genre}</td>
                    <td className="p-4 border-b border-zinc-800">{venue.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 py-10 text-center border-t border-zinc-800 mt-12">
        <div className="flex justify-center gap-8 mb-5 flex-wrap text-zinc-400">
          <a href="https://therocksalt.com" className="hover:text-zinc-100 transition-colors">TheRockSalt.com</a>
          <a href="https://therocksalt.com/live" className="hover:text-zinc-100 transition-colors">Stream</a>
          <a href="/events" className="hover:text-zinc-100 transition-colors">Submit show</a>
          <a href="https://discord.gg/hW4dmajPkS" className="hover:text-zinc-100 transition-colors">Coordination channel</a>
        </div>
        <p className="text-zinc-500 text-sm">Documenting Utah music since 2002 • Updated {todayLabel}</p>
        <p className="text-zinc-600 text-xs mt-2">© {new Date().getFullYear()} The Rock Salt</p>
      </footer>
    </div>
  )
}

// Helper Components
function DayHeader({ day }: { day: string }) {
  return (
    <div className="bg-zinc-900 text-zinc-100 p-4 my-6 rounded-md text-lg font-semibold uppercase tracking-wide border border-zinc-800">
      {day}
    </div>
  )
}

interface ShowCardProps {
  venue: string
  location: string
  lineup: React.ReactNode | string
  badges?: Array<{ text: string; type: 'default' | 'special' | 'warning' }>
  meta?: Array<{ label: string; value: string }>
  genreBadge?: string
}

function ShowCard({ venue, location, lineup, badges = [], meta = [], genreBadge }: ShowCardProps) {
  // Extract time and date from meta for semantic markup
  const timeInfo = meta.find(m => m.label === 'Time')
  const dateInfo = meta.find(m => m.label === 'Date')

  return (
    <article className="bg-zinc-900 p-5 mb-4 rounded-md border-l-4 border-amber-500">
      <header className="font-semibold text-zinc-100 text-lg mb-2">
        <address className="not-italic inline">
          {venue} <span className="text-zinc-500 text-sm ml-2">{location}</span>
        </address>
        {badges.map((badge, idx) => (
          <span
            key={idx}
            className={`inline-block ml-2 px-2.5 py-1 rounded-md text-xs font-semibold uppercase border ${
              badge.type === 'special'
                ? 'border-emerald-600 text-emerald-200'
                : badge.type === 'warning'
                  ? 'border-amber-500 text-amber-200'
                  : 'border-zinc-700 text-zinc-300'
              }`}
          >
            {badge.text}
          </span>
        ))}
      </header>
      <h3 className="text-zinc-200 mb-2 text-sm font-normal">
        {typeof lineup === 'string' ? lineup : lineup}
      </h3>
      <footer className="flex flex-wrap gap-4 mt-2 text-xs">
        {meta.map((item, idx) => (
          <span key={idx} className="text-zinc-400">
            {item.label === 'Time' || item.label === 'Date' ? (
              <time dateTime={item.value}>
                <strong className="text-zinc-100">{item.label}:</strong> {item.value}
              </time>
            ) : (
              <>
                <strong className="text-zinc-100">{item.label}:</strong> {item.value}
              </>
            )}
          </span>
        ))}
        {genreBadge && (
          <span className="inline-block border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-md text-xs font-semibold uppercase">
            {genreBadge}
          </span>
        )}
      </footer>
    </article>
  )
}

// Venue data
const venueData = [
  { name: 'Kilby Court', location: 'SLC (Granary)', genre: 'Indie, alt, punk', notes: 'All-ages, backyard shows' },
  { name: 'Urban Lounge', location: 'SLC (Sugar House)', genre: 'Rock, metal, indie', notes: '21+ after 9 PM' },
  { name: 'Aces High Saloon', location: 'SLC (Central)', genre: 'Punk, metal, hardcore', notes: 'Dive bar legend' },
  { name: 'Velour', location: 'Provo', genre: 'All-ages indie, alt', notes: 'Battle of the Bands hub' },
  { name: 'Piper Down Pub', location: 'SLC (Ballpark)', genre: 'Folk-punk, Irish', notes: '$5 cover standard' },
  { name: 'Barbary Coast Saloon', location: 'Murray', genre: 'Blues, hard rock', notes: 'Biker-friendly' },
  { name: 'Ice Haus', location: 'Murray', genre: 'Rock, indie', notes: 'Trivia/karaoke midweek' },
  { name: 'Soundwell', location: 'SLC (Downtown)', genre: 'EDM, indie, jam', notes: '21+ / All Ages varies' },
  { name: 'State Room', location: 'SLC (Downtown)', genre: 'Americana, honky-tonk, indie', notes: 'Seated venue' },
  { name: 'Hog Wallow', location: 'Cottonwood Heights', genre: 'Acoustic, jam, rock', notes: 'Canyon vibes, 21+' },
  { name: 'Tailgate Tavern', location: 'S. Salt Lake', genre: 'Country, honky-tonk', notes: 'Country Music Mondays' },
  { name: 'Redemption Bar & Grill', location: 'Herriman', genre: 'Tributes, covers', notes: 'Sports bar vibes' },
  { name: 'Kamikazes', location: 'Ogden', genre: 'Rock, punk, touring acts', notes: 'House of Rock' },
  { name: 'Metro Music Hall', location: 'SLC (Downtown)', genre: 'Drag, touring acts, metal', notes: 'Large capacity' },
  { name: 'The Depot', location: 'SLC (Downtown)', genre: 'Touring acts, dance parties', notes: '18+ / 21+ varies' },
  { name: 'The Complex', location: 'SLC (West Side)', genre: 'EDM, hip-hop, festivals', notes: 'Multi-room mega-venue' },
]
