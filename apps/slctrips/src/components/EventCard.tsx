import Link from 'next/link';

type EventCardData = {
  slug: string;
  title: string;
  start_at: string;
  end_at?: string | null;
  city?: string | null;
  state?: string | null;
  venue_name?: string | null;
  category?: string | null;
  image_url?: string | null;
};

type EventCardProps = {
  event: EventCardData;
};

function formatDateRange(startAt: string, endAt?: string | null) {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (end) {
    const sameDay = start.toDateString() === end.toDateString();
    const dateLabel = dateFormatter.format(start);
    return sameDay
      ? `${dateLabel} · ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
      : `${dateLabel} - ${dateFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}`;
}

export default function EventCard({ event }: EventCardProps) {
  const location = [event.city, event.state].filter(Boolean).join(', ');

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {event.image_url ? (
        <div className="h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-slate-100" />
      )}

      <div className="space-y-3 p-5">
        {event.category ? (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {event.category}
          </span>
        ) : null}

        <h3 className="text-xl font-semibold text-slate-900">
          <Link href={`/events/${event.slug}`} className="hover:text-blue-600">
            {event.title}
          </Link>
        </h3>

        <div className="text-sm text-slate-600">
          <div>{formatDateRange(event.start_at, event.end_at)}</div>
          {event.venue_name ? <div>{event.venue_name}</div> : null}
          {location ? <div>{location}</div> : null}
        </div>

        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center text-sm font-semibold text-blue-600"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}
