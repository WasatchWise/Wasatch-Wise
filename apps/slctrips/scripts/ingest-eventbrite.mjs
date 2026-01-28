#!/usr/bin/env node

import { pathToFileURL } from 'url';
import {
  loadEnv,
  getSupabaseClient,
  buildSlug,
  normalizeText,
} from './events-utils.mjs';

loadEnv();

const EVENTBRITE_TOKEN = process.env.EVENTBRITE_API_TOKEN;
const DEFAULT_LOCATION = process.env.EVENTS_DEFAULT_LOCATION || 'Salt Lake City, UT';
const MAX_PAGES = Number(process.env.EVENTS_MAX_PAGES || 3);
const PAGE_SIZE = 50;

function mapEventbriteEvent(event) {
  const venue = event.venue || {};
  const address = venue.address || {};
  const startAt = event.start?.utc || event.start?.local;
  const endAt = event.end?.utc || event.end?.local;

  return {
    slug: buildSlug(event.name?.text, 'eventbrite', event.id),
    title: normalizeText(event.name?.text) || 'Untitled event',
    description: normalizeText(event.description?.text),
    start_at: startAt ? new Date(startAt).toISOString() : null,
    end_at: endAt ? new Date(endAt).toISOString() : null,
    timezone: normalizeText(event.start?.timezone) || 'America/Denver',
    venue_name: normalizeText(venue.name),
    venue_address: normalizeText(address.localized_address_display || address.address_1),
    city: normalizeText(address.city),
    state: normalizeText(address.region),
    lat: venue.latitude ? Number(venue.latitude) : null,
    lng: venue.longitude ? Number(venue.longitude) : null,
    category: normalizeText(event.category?.name || event.category_id),
    image_url: event.logo?.url || null,
    external_source: 'eventbrite',
    external_id: String(event.id),
    external_url: event.url || null,
    is_published: true,
  };
}

async function fetchEventbriteEvents() {
  if (!EVENTBRITE_TOKEN) {
    throw new Error('Missing EVENTBRITE_API_TOKEN');
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${EVENTBRITE_TOKEN}` },
    });
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    return { response, data };
  }

  const events = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= MAX_PAGES) {
    const url = new URL('https://www.eventbriteapi.com/v3/events/search/');
    url.searchParams.set('location.address', DEFAULT_LOCATION);
    url.searchParams.set('expand', 'venue,category');
    url.searchParams.set('sort_by', 'date');
    url.searchParams.set('start_date.range_start', new Date().toISOString());
    url.searchParams.set('page', String(page));
    url.searchParams.set('page_size', String(PAGE_SIZE));

    const { response, data } = await fetchJson(url);

    if (response.status === 404) {
      console.warn('Eventbrite search endpoint unavailable; falling back to org events.');
      return fetchEventbriteOrgEvents(fetchJson);
    }

    if (!response.ok) {
      throw new Error(`Eventbrite API error ${response.status}: ${JSON.stringify(data).slice(0, 500)}`);
    }

    events.push(...(data.events || []));
    hasMore = Boolean(data.pagination?.has_more_items);
    page += 1;
  }

  return events;
}

async function fetchEventbriteOrgEvents(fetchJson) {
  const { response: orgResponse, data: orgData } = await fetchJson(
    'https://www.eventbriteapi.com/v3/users/me/organizations/'
  );

  if (!orgResponse.ok) {
    throw new Error(`Eventbrite org lookup failed ${orgResponse.status}: ${JSON.stringify(orgData).slice(0, 500)}`);
  }

  const orgId = orgData.organizations?.[0]?.id;
  if (!orgId) {
    throw new Error('Eventbrite org ID not found');
  }

  const events = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= MAX_PAGES) {
    const url = new URL(`https://www.eventbriteapi.com/v3/organizations/${orgId}/events/`);
    url.searchParams.set('status', 'live');
    url.searchParams.set('order_by', 'start_asc');
    url.searchParams.set('page', String(page));
    url.searchParams.set('page_size', String(PAGE_SIZE));

    const { response, data } = await fetchJson(url);

    if (!response.ok) {
      throw new Error(`Eventbrite org events error ${response.status}: ${JSON.stringify(data).slice(0, 500)}`);
    }

    events.push(...(data.events || []));
    hasMore = Boolean(data.pagination?.has_more_items);
    page += 1;
  }

  return events;
}

export async function ingestEventbrite() {
  const supabase = getSupabaseClient();
  const events = await fetchEventbriteEvents();
  const mapped = events
    .map(mapEventbriteEvent)
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
    console.log('Ingesting Eventbrite events...');
    const result = await ingestEventbrite();
    console.log(`✅ Eventbrite ingestion complete: ${result.inserted} events upserted`);
  } catch (error) {
    console.error('Eventbrite ingestion failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
