/**
 * Import venue scour events (through March 2026) into TheRockSalt.com via the ingest API.
 *
 * Prerequisites:
 * 1. Run migration: supabase/migrations/20260216_allow_venue_scour_external_source.sql
 * 2. Set CRON_SECRET in .env.local (or env) to match the app's CRON_SECRET
 * 3. Start the Rock Salt app (e.g. pnpm dev) or set ROCK_SALT_API_URL to the deployed URL
 *
 * Usage:
 *   pnpm exec tsx scripts/import-scour-events.ts
 *   ROCK_SALT_API_URL=https://therocksalt.com pnpm exec tsx scripts/import-scour-events.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const API_URL = process.env.ROCK_SALT_API_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET
const PAYLOAD_PATH = resolve(__dirname, '../data/scour-events-march-2026.json')

interface IngestEvent {
  date: string
  start_time?: string | null
  venue_name: string
  city?: string
  headliner: string
  support?: string[]
  primary_link?: string | null
  ticket_link?: string | null
}

interface Payload {
  source?: string
  events: IngestEvent[]
}

async function main() {
  if (!CRON_SECRET) {
    console.error('Set CRON_SECRET in the environment (e.g. from .env.local).')
    process.exit(1)
  }

  let payload: Payload
  try {
    const raw = readFileSync(PAYLOAD_PATH, 'utf-8')
    payload = JSON.parse(raw) as Payload
  } catch (e) {
    console.error('Failed to read or parse payload:', e)
    process.exit(1)
  }

  const events = payload.events || []
  if (events.length === 0) {
    console.log('No events in payload.')
    return
  }

  const url = `${API_URL.replace(/\/$/, '')}/api/ingest-events`
  console.log(`POSTing ${events.length} events to ${url} ...`)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CRON_SECRET}`,
    },
    body: JSON.stringify({
      events,
      source: payload.source || 'venue_scour',
    }),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Ingest failed:', res.status, body)
    process.exit(1)
  }

  console.log('Result:', body)
  console.log(`Inserted: ${body.inserted ?? 0}, Skipped: ${body.skipped ?? 0}`)
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    console.log('Errors (first 10):', body.errors.slice(0, 10))
  }
}

main()
