import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getSupabaseClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** LLM-normalized event from n8n (or any pipeline that follows our schema) */
export interface IngestEvent {
  date: string // YYYY-MM-DD
  start_time?: string | null // "19:00" or "7:00 PM"
  venue_name: string
  city?: string
  headliner: string
  support?: string[]
  genre_tags?: string[]
  primary_link?: string | null
  ticket_link?: string | null
  ethos_fit_score?: number
  ethos_fit_note?: string
  source_page?: string
  missing_info?: string[]
}

/** Request body */
interface IngestRequestBody {
  events: IngestEvent[]
  source?: string // e.g. "n8n"
}

/** Normalize time string to HH:mm:ss for building ISO */
function normalizeTime(s: string | null | undefined): string {
  if (!s || typeof s !== 'string') return '20:00:00'
  const t = s.trim()
  const pm = /pm/i.test(t)
  const am = /am/i.test(t)
  let hours: number
  let minutes = 0
  const numMatch = t.match(/(\d{1,2})(?::(\d{2}))?/)
  if (numMatch) {
    hours = parseInt(numMatch[1], 10)
    if (numMatch[2]) minutes = parseInt(numMatch[2], 10)
    if (pm && hours < 12) hours += 12
    if (am && hours === 12) hours = 0
  } else {
    const isoMatch = t.match(/^(\d{1,2}):(\d{2})/)
    if (isoMatch) {
      hours = parseInt(isoMatch[1], 10)
      minutes = parseInt(isoMatch[2], 10)
    } else return '20:00:00'
  }
  const h = Math.max(0, Math.min(23, hours))
  const m = Math.max(0, Math.min(59, minutes))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

/** Build start_time timestamptz for events table */
function buildStartTime(date: string, startTime?: string | null): string {
  const timePart = normalizeTime(startTime)
  return `${date}T${timePart}`
}

/**
 * POST /api/ingest-events
 * Accepts LLM-normalized event array from n8n (or other pipeline).
 * Find-or-create venue, dedupe by date+venue+headliner, insert into events.
 * Auth: Bearer CRON_SECRET or same as scrape-events (optional).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as IngestRequestBody
    const rawEvents = Array.isArray(body.events) ? body.events : []
    const source = body.source || 'n8n'

    if (rawEvents.length === 0) {
      return NextResponse.json({
        success: true,
        inserted: 0,
        skipped: 0,
        errors: [],
        message: 'No events in body'
      })
    }

    const supabase = getSupabaseClient()
    const errors: string[] = []
    let inserted = 0
    let skipped = 0

    for (const ev of rawEvents) {
      try {
        if (!ev.date || !ev.venue_name || !ev.headliner) {
          errors.push(`Skip: missing date/venue_name/headliner for "${ev.headliner}"`)
          skipped++
          continue
        }
        const dateStr = ev.date.trim()
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          errors.push(`Skip: invalid date "${ev.date}" for ${ev.headliner}`)
          skipped++
          continue
        }

        const venueId = await findOrCreateVenue(
          supabase,
          ev.venue_name,
          ev.city || 'Salt Lake City',
          'UT'
        )

        const startTimeIso = buildStartTime(dateStr, ev.start_time)
        const title = ev.headliner + (ev.support?.length ? ` + ${ev.support.slice(0, 2).join(', ')}` : '')

        const { data: sameDayEvents } = await supabase
          .from('events')
          .select('id, title, name, headline')
          .eq('venue_id', venueId)
          .gte('start_time', `${dateStr}T00:00:00`)
          .lte('start_time', `${dateStr}T23:59:59`)

        const headlinerLower = ev.headliner.toLowerCase().trim()
        const alreadyExists = (sameDayEvents ?? []).some(
          (e) =>
            (e.name && e.name.toLowerCase().includes(headlinerLower)) ||
            (e.title && e.title.toLowerCase().includes(headlinerLower)) ||
            (e.headline && e.headline.toLowerCase() === headlinerLower)
        )
        if (alreadyExists) {
          skipped++
          continue
        }

        const descriptionParts: string[] = []
        if (ev.genre_tags?.length) descriptionParts.push(ev.genre_tags.join(', '))
        if (ev.ethos_fit_note) descriptionParts.push(ev.ethos_fit_note)
        const description = descriptionParts.length ? descriptionParts.join(' · ') : null

        const { error: insertError } = await supabase.from('events').insert({
          title: title.slice(0, 255),
          name: ev.headliner,
          venue_id: venueId,
          venue_name: ev.venue_name,
          city: ev.city || 'Salt Lake City',
          state: 'UT',
          start_time: startTimeIso,
          description,
          ticket_url: ev.ticket_link || ev.primary_link || null,
          external_url: ev.primary_link || null,
          external_source: source
        })

        if (insertError) {
          errors.push(`Insert "${ev.headliner}" at ${ev.venue_name}: ${insertError.message}`)
          skipped++
        } else {
          inserted++
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : (typeof err === 'object' && err !== null && 'message' in err) ? String((err as { message: unknown }).message) : JSON.stringify(err)
        errors.push(`Error for ${ev.headliner}: ${msg}`)
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
      errors
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Ingest events error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function findOrCreateVenue(
  supabase: SupabaseClient,
  venueName: string,
  city: string,
  state: string
): Promise<string> {
  const normalizedName = venueName.trim()
  const { data: existing } = await supabase
    .from('venues')
    .select('id')
    .ilike('name', `%${normalizedName}%`)
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id

  const slug = normalizedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const { data: newVenue, error } = await supabase
    .from('venues')
    .insert({
      name: normalizedName,
      slug: slug || `venue-${Date.now()}`,
      city,
      state,
      org_id: '4cadb578-b415-461f-8039-1fd02f68a030'
    })
    .select('id')
    .single()

  if (error) throw error
  return newVenue!.id
}
