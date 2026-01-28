import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const DEFAULT_LOCATION = process.env.EVENTS_DEFAULT_LOCATION || 'Salt Lake City, UT';
const DEFAULT_CITY = process.env.EVENTS_DEFAULT_CITY || 'Salt Lake City';
const DEFAULT_STATE = process.env.EVENTS_DEFAULT_STATE || 'UT';
const MAX_PAGES = Number(process.env.EVENTS_MAX_PAGES || 3);
const PAGE_SIZE = 50;

function isAuthorized(request: NextRequest) {
  const secret = process.env.EVENTS_INGEST_SECRET;
  const vercelCron = request.headers.get('x-vercel-cron');
  if (vercelCron) {
    return true;
  }
  if (!secret) {
    return false;
  }
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
  const urlSecret = new URL(request.url).searchParams.get('secret');
  return token === secret || urlSecret === secret;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 90);
}

function buildSlug(title: string, source: string, id: string) {
  const base = slugify(title || 'event');
  return `${base}-${source}-${id}`.replace(/-+/g, '-');
}

function normalizeText(value?: string | null) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function pickImageUrl(images?: Array<{ url?: string; width?: number }>) {
  if (!images?.length) {
    return null;
  }
  const sorted = [...images].sort((a, b) => (b.width || 0) - (a.width || 0));
  return sorted[0]?.url || null;
}

async function fetchEventbriteEvents() {
  const token = process.env.EVENTBRITE_API_TOKEN;
  if (!token) {
    throw new Error('Missing EVENTBRITE_API_TOKEN');
  }

  async function fetchJson(url: URL | string) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await response.text();
    let data: any;
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

async function fetchEventbriteOrgEvents(
  fetchJson: (url: URL | string) => Promise<{ response: Response; data: any }>
) {
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

async function fetchTicketmasterEvents() {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    throw new Error('Missing TICKETMASTER_API_KEY');
  }

  const events = [];
  let page = 0;
  let hasMore = true;

  while (hasMore && page < MAX_PAGES) {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
    url.searchParams.set('apikey', apiKey);
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
    events.push(...(data._embedded?.events || []));

    const totalPages = data.page?.totalPages || 0;
    page += 1;
    hasMore = page < totalPages;
  }

  return events;
}

async function ingestEventbrite() {
  const events = await fetchEventbriteEvents();
  const mapped = events
    .map((event: any) => {
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
    })
    .filter((event: any) => event.start_at && event.external_id);

  if (!mapped.length) {
    return { upserted: 0 };
  }

  const { error } = await supabaseServer
    .from('events')
    .upsert(mapped, { onConflict: 'external_source,external_id' });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }

  return { upserted: mapped.length };
}

async function ingestTicketmaster() {
  const events = await fetchTicketmasterEvents();
  const mapped = events
    .map((event: any) => {
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
    })
    .filter((event: any) => event.start_at && event.external_id);

  if (!mapped.length) {
    return { upserted: 0 };
  }

  const { error } = await supabaseServer
    .from('events')
    .upsert(mapped, { onConflict: 'external_source,external_id' });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }

  return { upserted: mapped.length };
}

async function handleIngest(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [eventbriteResult, ticketmasterResult] = await Promise.allSettled([
    ingestEventbrite(),
    ingestTicketmaster(),
  ]);

  return NextResponse.json({
    eventbrite: eventbriteResult.status === 'fulfilled' ? eventbriteResult.value : { error: String(eventbriteResult.reason) },
    ticketmaster: ticketmasterResult.status === 'fulfilled' ? ticketmasterResult.value : { error: String(ticketmasterResult.reason) },
  });
}

export async function GET(request: NextRequest) {
  return handleIngest(request);
}

export async function POST(request: NextRequest) {
  return handleIngest(request);
}
