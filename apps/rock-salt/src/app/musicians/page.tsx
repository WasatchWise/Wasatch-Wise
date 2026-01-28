import Container from '@/components/Container'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Musicians | The Rock Salt',
  description: 'Index of individual musicians and their bands.',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

type MusicianRow = {
  id: string
  name: string
  slug: string | null
  role: string | null
  location: string | null
  instagram_handle: string | null
  website_url: string | null
  seeking_band: boolean | null
  available_for_lessons: boolean | null
  instruments: string[] | null
  disciplines: string[] | null
  band_members: Array<{
    instrument: string | null
  }> | null
}

export default async function MusiciansPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const searchQuery = typeof params.q === 'string' ? params.q.toLowerCase() : null
  const seekingOnly = params.seeking === '1'

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('musicians')
    .select(`
      id,
      name,
      slug,
      role,
      location,
      instagram_handle,
      website_url,
      seeking_band,
      available_for_lessons,
      instruments,
      disciplines,
      band_members ( instrument )
    `)
    .order('name', { ascending: true })
    .limit(500)

  const musicians: MusicianRow[] = error ? [] : (data as MusicianRow[]) || []
  const filtered = searchQuery
    ? musicians.filter(m =>
        m.name.toLowerCase().includes(searchQuery) ||
        m.role?.toLowerCase().includes(searchQuery) ||
        m.location?.toLowerCase().includes(searchQuery)
      )
    : musicians
  const filteredBySeeking = seekingOnly
    ? filtered.filter(m => m.seeking_band)
    : filtered

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-4">
          Musicians
        </h1>
        <p className="text-lg text-zinc-400">
          {filteredBySeeking.length} indexed
        </p>
      </div>

      <div className="mb-8">
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery || ''}
            placeholder="Search name, role, location"
            className="flex-1 px-4 py-3 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {seekingOnly && <input type="hidden" name="seeking" value="1" />}
          <button
            type="submit"
            className="px-5 py-3 border border-zinc-800 text-zinc-100 rounded-md hover:border-amber-500 transition-colors"
          >
            Search
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-zinc-500">Filter:</span>
          {seekingOnly ? (
            <Link
              href={searchQuery ? `/musicians?q=${encodeURIComponent(searchQuery)}` : '/musicians'}
              className="px-3 py-1 bg-zinc-900 text-zinc-200 rounded-md border border-zinc-800"
            >
              Seeking band only
            </Link>
          ) : (
            <Link
              href={searchQuery ? `/musicians?q=${encodeURIComponent(searchQuery)}&seeking=1` : '/musicians?seeking=1'}
              className="px-3 py-1 bg-zinc-950 text-zinc-300 rounded-md border border-zinc-800 hover:border-amber-500"
            >
              Seeking band only
            </Link>
          )}
        </div>
      </div>

      {filteredBySeeking.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 rounded-md">
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">No musicians found</h2>
          <p className="text-zinc-400 mb-6">Adjust search or filters.</p>
          <Link
            href="/musicians"
            className="inline-block px-4 py-2 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBySeeking.map(musician => {
            const listedInstruments = (musician.instruments || []).map(instrument => instrument.trim()).filter(Boolean)
            const instruments = Array.from(
              new Set(
                (musician.band_members || [])
                  .map(member => member.instrument?.trim())
                  .filter(Boolean) as string[]
              )
            )
            const instrumentDisplay = listedInstruments.length > 0 ? listedInstruments : instruments
            const disciplines = (musician.disciplines || []).map(discipline => discipline.trim()).filter(Boolean)
            return (
            <Link
              key={musician.id}
              href={musician.slug ? `/musicians/${musician.slug}` : '#'}
              className="block bg-zinc-950 border border-zinc-800 rounded-md p-5 hover:border-amber-500 transition-colors"
            >
              <h2 className="text-lg font-semibold text-zinc-100 mb-1">
                {musician.name}
              </h2>
              {musician.role && (
                <p className="text-sm text-zinc-400 mb-1">{musician.role}</p>
              )}
              {musician.location && (
                <p className="text-sm text-zinc-500">{musician.location}</p>
              )}
              {instrumentDisplay.length > 0 && (
                <p className="text-sm text-zinc-400 mt-2">
                  Instruments: {instrumentDisplay.slice(0, 4).join(', ')}
                  {instrumentDisplay.length > 4 ? ' +' : ''}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {disciplines.map((discipline) => (
                  <span
                    key={`${musician.id}-${discipline}`}
                    className="px-2 py-1 text-xs uppercase tracking-wide border border-zinc-700 text-zinc-300 rounded-md"
                  >
                    {discipline}
                  </span>
                ))}
                {musician.seeking_band && (
                  <span className="px-2 py-1 text-xs uppercase tracking-wide border border-amber-500 text-amber-200 rounded-md">
                    Seeking band
                  </span>
                )}
                {musician.available_for_lessons && (
                  <span className="px-2 py-1 text-xs uppercase tracking-wide border border-zinc-700 text-zinc-300 rounded-md">
                    Lessons
                  </span>
                )}
              </div>
              {!musician.slug && (
                <p className="text-xs text-zinc-600 mt-3">Profile needs slug.</p>
              )}
            </Link>
            )
          })}
        </div>
      )}

      <div className="mt-12 border border-zinc-800 rounded-md p-6 text-center">
        <h2 className="text-xl font-semibold text-zinc-100 mb-3">Add a musician</h2>
        <p className="text-zinc-400 mb-4">
          Send a roster update to connect members across bands.
        </p>
        <a
          href="mailto:music@therocksalt.com"
          className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-md text-zinc-200 hover:border-amber-500 transition-colors"
        >
          Send roster update
        </a>
      </div>
    </Container>
  )
}
