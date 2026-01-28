#!/usr/bin/env node

import { pathToFileURL } from 'url';
import {
  loadEnv,
  getSupabaseClient,
  buildSlug,
  normalizeText,
  pickImageUrl,
} from './events-utils.mjs';

loadEnv();

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const DEFAULT_CITY = process.env.EVENTS_DEFAULT_CITY || 'Salt Lake City';
const DEFAULT_STATE = process.env.EVENTS_DEFAULT_STATE || 'UT';
const MAX_PAGES = Number(process.env.EVENTS_MAX_PAGES || 3);
const PAGE_SIZE = 50;

function mapTicketmasterEvent(event) {
  const venue = event._embedded?.venues?.[0] || {};
  const startDateTime = event.dates?.start?.dateTime;
  const localDate = event.dates?.start?.localDate;
  const localTime = event.dates?.start?.localTime;
  const startAt = startDateTime || (localDate ? `${localDate}T${localTime || '00:00:00'}` : null);
  const timezone = event.dates?.timezone || 'America/Denver';
  const classification = event.classifications?.[0];

  return {
    slug: buildSlug(event.name, 'ticketmaster', event.id),
    title: normalizeText(event.name) || 'Untitled event',
    description: normalizeText(event.info || event.pleaseNote),
    start_at: startAt ? new Date(startAt).toISOString() : null,
    end_at: null,
    timezone: normalizeText(timezone) || 'America/Denver',
    venue_name: normalizeText(venue.name),
    venue_address: normalizeText(venue.address?.line1),
    city: normalizeText(venue.city?.name),
    state: normalizeText(venue.state?.stateCode),
    lat: venue.location?.latitude ? Number(venue.location.latitude) : null,
    lng: venue.location?.longitude ? Number(venue.location.longitude) : null,
    category: normalizeText(classification?.segment?.name || classification?.genre?.name),
    image_url: pickImageUrl(event.images),
    external_source: 'ticketmaster',
    external_id: String(event.id),
    external_url: event.url || null,
    is_published: true,
  };
}

async function fetchTicketmasterEvents() {
  if (!TICKETMASTER_API_KEY) {
    throw new Error('Missing TICKETMASTER_API_KEY');
  }

  const events = [];
  let page = 0;
  let hasMore = true;

  while (hasMore && page < MAX_PAGES) {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
    url.searchParams.set('apikey', TICKETMASTER_API_KEY);
    url.searchParams.set('city', DEFAULT_CITY);
    url.searchParams.set('stateCode', DEFAULT_STATE);
    url.searchParams.set('size', String(PAGE_SIZE));
    url.searchParams.set('page', String(page));
    url.searchParams.set('sort', 'date,asc');
    url.searchParams.set('locale', '*');

    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ticketmaster API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    const embedded = data._embedded?.events || [];
    events.push(...embedded);

    const totalPages = data.page?.totalPages || 0;
    page += 1;
    hasMore = page < totalPages;
  }

  return events;
}

export async function ingestTicketmaster() {
  const supabase = getSupabaseClient();
  const events = await fetchTicketmasterEvents();
  const mapped = events
    .map(mapTicketmasterEvent)
    .filter(event => event.start_at && event.external_id);

  if (!mapped.length) {
    return { inserted: 0, total: 0 };
  }

  const { error } = await supabase
    .from('events')
    .upsert(mapped, { onConflict: 'external_source,external_id' });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }

  return { inserted: mapped.length, total: mapped.length };
}

async function main() {
  try {
    console.log('Ingesting Ticketmaster events...');
    const result = await ingestTicketmaster();
    console.log(`✅ Ticketmaster ingestion complete: ${result.inserted} events upserted`);
  } catch (error) {
    console.error('Ticketmaster ingestion failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
