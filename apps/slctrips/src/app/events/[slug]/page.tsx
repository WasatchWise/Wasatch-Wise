import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServerComponent';

export const revalidate = 300;

type EventRecord = {
  slug: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  timezone?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  city?: string | null;
  state?: string | null;
  image_url?: string | null;
  external_url?: string | null;
  category?: string | null;
};

function formatEventDate(startAt: string, endAt?: string | null) {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  if (end) {
    return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`;
  }

  return dateFormatter.format(start);
}

function removeEmpty(value: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single<EventRecord>();

  if (!event) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com';
  const location = [event.city, event.state].filter(Boolean).join(', ');

  const jsonLd = removeEmpty({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.start_at,
    endDate: event.end_at || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: `${baseUrl}/events/${event.slug}`,
    image: event.image_url ? [event.image_url] : undefined,
    location: removeEmpty({
      '@type': 'Place',
      name: event.venue_name,
      address: removeEmpty({
        '@type': 'PostalAddress',
        streetAddress: event.venue_address,
        addressLocality: event.city,
        addressRegion: event.state,
      }),
    }),
  });

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-4xl space-y-8 px-6 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="space-y-4">
          <Link href="/events" className="text-sm font-semibold text-blue-600">
            ← Back to events
          </Link>
          <h1 className="text-4xl font-semibold text-slate-900">{event.title}</h1>
          <p className="text-lg text-slate-600">{formatEventDate(event.start_at, event.end_at)}</p>
          {event.category ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {event.category}
            </span>
          ) : null}
        </div>

        {event.image_url ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <img src={event.image_url} alt={event.title} className="h-96 w-full object-cover" />
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">About this event</h2>
            <p className="whitespace-pre-line text-base text-slate-700">
              {event.description || 'Details coming soon.'}
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
            <div className="text-sm text-slate-600">
              <div className="font-semibold text-slate-900">Location</div>
              {event.venue_name ? <div>{event.venue_name}</div> : null}
              {event.venue_address ? <div>{event.venue_address}</div> : null}
              {location ? <div>{location}</div> : null}
            </div>

            {event.external_url ? (
              <Link
                href={event.external_url}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                View tickets →
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
