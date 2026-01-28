import Container from '@/components/Container'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ClaimMusicianButton from '@/components/ClaimMusicianButton'
import MusicianProfileEditor from '@/components/MusicianProfileEditor'

type Props = {
  params: Promise<{ slug: string }>
}

type Musician = {
  id: string
  name: string
  slug: string | null
  role: string | null
  bio: string | null
  location: string | null
  website_url: string | null
  instagram_handle: string | null
  band_members: Array<{
    instrument: string | null
    role: string | null
    tenure_start: number | null
    tenure_end: number | null
    band: { id: string; name: string; slug: string | null } | null
  }> | null
  seeking_band: boolean | null
  available_for_lessons: boolean | null
  instruments: string[] | null
  disciplines: string[] | null
  claimed_by: string | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('musicians')
    .select('name')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle()

  if (!data) {
    const fallback = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    return {
      title: `${fallback} | The Rock Salt`,
      description: `${fallback} profile is pending verification.`
    }
  }
  return {
    title: `${data.name} | The Rock Salt`,
    description: `${data.name} profile and band associations.`,
  }
}

export default async function MusicianPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('musicians')
    .select(`
      id,
      name,
      slug,
      role,
      bio,
      location,
      website_url,
      instagram_handle,
      seeking_band,
      available_for_lessons,
      instruments,
      disciplines,
      claimed_by,
      band_members (
        instrument,
        role,
        tenure_start,
        tenure_end,
        band:bands ( id, name, slug )
      )
    `)
    .eq('slug', slug)
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    const fallbackName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    return (
      <Container className="py-12">
        <div className="mb-8">
          <Link
            href="/musicians"
            className="inline-flex items-center gap-2 text-amber-200 hover:underline mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to musicians
          </Link>
          <div className="p-8 border border-zinc-800 rounded-lg bg-zinc-900/50 text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-4">
              {fallbackName}
            </h1>
            <p className="text-xl text-zinc-400 mb-6 max-w-2xl mx-auto">
              We know {fallbackName} makes music, but their profile hasn't been created yet.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors"
              >
                Create this profile
              </Link>
              <a
                href="mailto:music@therocksalt.com"
                className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 text-zinc-300 font-semibold rounded-md hover:bg-zinc-800 transition-colors"
              >
                Report an issue
              </a>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  const musician = data as Musician
  const memberships = (musician.band_members || []).filter(m => m.band)
  const listedInstruments = (musician.instruments || []).map(instrument => instrument.trim()).filter(Boolean)
  const disciplines = (musician.disciplines || []).map(discipline => discipline.trim()).filter(Boolean)

  return (
    <Container className="py-12">
      <div className="mb-8 relative">
        <Link
          href="/musicians"
          className="inline-flex items-center gap-2 text-amber-200 hover:underline mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to musicians
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-3">
              {musician.name}
            </h1>
            <div className="text-zinc-400 text-lg space-y-1">
              {musician.role && <div className="font-medium text-zinc-300">{musician.role}</div>}
              {musician.location && <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {musician.location}
              </div>}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {disciplines.map((discipline) => (
                <span
                  key={`${musician.id}-${discipline}`}
                  className="px-2 py-1 text-xs uppercase tracking-wide border border-zinc-700 text-zinc-300 rounded-md"
                >
                  {discipline}
                </span>
              ))}
            </div>
          </div>

          {/* Availability Status Card - Prominent Position */}
          {(musician.seeking_band || musician.available_for_lessons) && (
            <div className="bg-zinc-900 border border-amber-500/30 rounded-lg p-5 max-w-sm w-full shadow-lg shadow-amber-900/10">
              <h3 className="text-amber-200 font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Current Availability
              </h3>
              <div className="space-y-2">
                {musician.seeking_band && (
                  <div className="flex items-center gap-2 text-zinc-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Seeking band opportunities
                  </div>
                )}
                {musician.available_for_lessons && (
                  <div className="flex items-center gap-2 text-zinc-200">
                     <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Available for lessons
                  </div>
                )}
              </div>
               
               {/* Contact CTA */}
               <div className="mt-4 pt-4 border-t border-zinc-800">
                  <a 
                    href="https://discord.gg/hW4dmajPkS" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
                  >
                    Message on Discord
                  </a>
                  <p className="text-xs text-zinc-500 text-center mt-2">
                    Join the community to connect directly.
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>

      {listedInstruments.length > 0 && (
        <section className="mb-8 border border-zinc-800 rounded-md p-6 bg-zinc-950">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Instruments</h2>
          <div className="flex flex-wrap gap-2">
            {listedInstruments.map((instrument) => (
              <span
                key={`${musician.id}-${instrument}`}
                className="px-3 py-1 text-sm bg-zinc-900 text-zinc-300 rounded-md border border-zinc-800"
              >
                {instrument}
              </span>
            ))}
          </div>
        </section>
      )}

      {musician.bio && (
        <section className="mb-8 border border-zinc-800 rounded-md p-6 bg-zinc-950">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Bio</h2>
          <p className="text-zinc-400 whitespace-pre-line leading-relaxed">{musician.bio}</p>
        </section>
      )}

      <section className="mb-8 border border-zinc-800 rounded-md p-6 bg-zinc-950">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-semibold text-zinc-100">Bands & Projects</h2>
           <span className="text-sm text-zinc-500">{memberships.length} found</span>
        </div>
        {memberships.length === 0 ? (
          <p className="text-zinc-400 italic">No band links yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {memberships.map((membership, idx) => (
              <div key={`${membership.band?.id}-${idx}`} className="border border-zinc-800 rounded-md p-4 hover:border-zinc-700 transition-colors bg-zinc-900/30">
                {membership.band?.slug ? (
                  <Link
                    href={`/bands/${membership.band.slug}`}
                    className="text-lg font-semibold text-zinc-100 hover:text-amber-200 transition-colors block mb-1"
                  >
                    {membership.band?.name}
                  </Link>
                ) : (
                  <div className="text-lg font-semibold text-zinc-100 mb-1">{membership.band?.name || 'Unknown band'}</div>
                )}
                <div className="text-sm text-zinc-400">
                  {[membership.role, membership.instrument].filter(Boolean).join(' • ')}
                </div>
                {(membership.tenure_start || membership.tenure_end) && (
                  <div className="text-xs text-zinc-500 mt-2 font-mono">
                    {membership.tenure_start || '?'} – {membership.tenure_end || 'Present'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {(musician.website_url || musician.instagram_handle) && (
        <section className="mb-8 border border-zinc-800 rounded-md p-6 bg-zinc-950">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Links</h2>
          <div className="flex flex-wrap gap-3">
            {musician.website_url && (
              <a
                href={musician.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-md text-zinc-200 hover:border-amber-500 transition-colors"
                title="Personal Website"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                Website
              </a>
            )}
            {musician.instagram_handle && (
              <a
                href={`https://instagram.com/${musician.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-md text-zinc-200 hover:border-amber-500 transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram
              </a>
            )}
          </div>
        </section>
      )}

      {!musician.claimed_by && (
        <div className="mb-8">
          <ClaimMusicianButton
            musicianId={musician.id}
            musicianName={musician.name}
            isClaimed={!!musician.claimed_by}
          />
        </div>
      )}

      <div className="mb-8">
        <MusicianProfileEditor
          musicianId={musician.id}
          claimedBy={musician.claimed_by}
          role={musician.role}
          location={musician.location}
          bio={musician.bio}
          instruments={musician.instruments}
          disciplines={musician.disciplines}
          seekingBand={musician.seeking_band}
          availableForLessons={musician.available_for_lessons}
        />
      </div>

      <section className="border border-zinc-800 rounded-md p-6 text-center bg-zinc-900/20">
        <h2 className="text-xl font-semibold text-zinc-100 mb-3">Update this profile</h2>
        <p className="text-zinc-400 mb-4">
          Send corrections, roster additions, or links.
        </p>
        <a
          href="mailto:music@therocksalt.com"
          className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-md text-zinc-200 hover:border-amber-500 transition-colors"
        >
          Request update
        </a>
      </section>
    </Container>
  )
}
