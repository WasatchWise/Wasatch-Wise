import EventCard from '@/components/EventCard';
import { createSupabaseServerClient } from '@/lib/supabaseServerComponent';

export const revalidate = 300;

type SearchParams = {
  q?: string;
  category?: string;
  city?: string;
  state?: string;
  from?: string;
  to?: string;
};

export default async function EventsPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = createSupabaseServerClient();
  const q = searchParams?.q?.trim() || '';
  const category = searchParams?.category?.trim() || '';
  const city = searchParams?.city?.trim() || '';
  const state = searchParams?.state?.trim() || '';
  const from = searchParams?.from?.trim() || '';
  const to = searchParams?.to?.trim() || '';

  let query = supabase
    .from('events')
    .select('*')
    .eq('is_published', true);

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (category) {
    query = query.ilike('category', `%${category}%`);
  }
  if (city) {
    query = query.ilike('city', `%${city}%`);
  }
  if (state) {
    query = query.ilike('state', `%${state}%`);
  }
  if (from) {
    query = query.gte('start_at', from);
  }
  if (to) {
    query = query.lte('start_at', to);
  }

  const { data: events } = await query
    .order('start_at', { ascending: true })
    .limit(60);

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl space-y-8 px-6 py-12">
        <header className="space-y-3">
          <h1 className="text-4xl font-semibold text-slate-900">Salt Lake City Events</h1>
          <p className="max-w-2xl text-base text-slate-600">
            Curated upcoming events from trusted partners. Search by keyword, category, or location.
          </p>
        </header>

        <form className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-6" method="get">
          <input
            type="text"
            name="q"
            placeholder="Search events"
            defaultValue={q}
            className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            defaultValue={category}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            defaultValue={city}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            defaultValue={state}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Search
            </button>
          </div>
        </form>

        {events && events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            No events found. Try adjusting your search filters.
          </div>
        )}
      </section>
    </main>
  );
}
