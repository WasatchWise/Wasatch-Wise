# Import Venue Scour Events to TheRockSalt.com

This doc describes how to load the **Rock Salt venue scour** events (shows through March 31, 2026) onto the live site so they appear on the [events calendar](https://www.therocksalt.com/events).

---

## Overview

- **Source data:** `docs/reports/ROCK_SALT_VENUE_SCOUR_2026-02-10.md` (in the wasatchwise repo) and the JSON batch in `data/scour-events-march-2026.json`.
- **Mechanism:** The Rock Salt app’s **ingest API** (`POST /api/ingest-events`) accepts an array of normalized events, find-or-creates venues, dedupes by date + venue + headliner, and inserts into `events`. Events then show on `/events`.
- **Auth:** The ingest endpoint requires `Authorization: Bearer <CRON_SECRET>` (same as cron-triggered imports).

---

## 1. Run the migration (once)

Allow `external_source` values `n8n` and `venue_scour` so the ingest can tag these imports:

```bash
cd apps/rock-salt
pnpm db:push
```

Or run the migration manually in the Supabase SQL editor:

- `supabase/migrations/20260216_allow_venue_scour_external_source.sql`

---

## 2. Set environment

In `apps/rock-salt/.env.local` (or your deploy env), ensure:

- **CRON_SECRET** – same value the app uses to authorize the ingest API. The import script sends this as `Bearer <CRON_SECRET>`.

Optional:

- **ROCK_SALT_API_URL** – base URL of the Rock Salt app. Default when running the script locally is `http://localhost:3000`. For production import, set to `https://www.therocksalt.com` (or your production URL).

---

## 3. Run the import script

**With the app running locally:**

```bash
cd apps/rock-salt
# Load .env.local if your shell doesn’t (e.g. export $(cat .env.local | xargs) or use dotenv-cli)
pnpm import-scour-events
```

**Against production:**

```bash
ROCK_SALT_API_URL=https://www.therocksalt.com CRON_SECRET=your_secret pnpm import-scour-events
```

The script reads `data/scour-events-march-2026.json`, POSTs it to `/api/ingest-events` with `source: "venue_scour"`, and prints inserted/skipped counts and any errors.

---

## 4. Payload format and adding more events

The JSON file must match the ingest API’s expected shape:

```json
{
  "source": "venue_scour",
  "events": [
    {
      "date": "2026-02-12",
      "start_time": "19:00",
      "venue_name": "Abravanel Hall",
      "city": "Salt Lake City",
      "headliner": "Disney-Pixar's Up in Concert",
      "support": [],
      "primary_link": "https://utahsymphony.org",
      "ticket_link": "https://..."
    }
  ]
}
```

- **Required:** `date` (YYYY-MM-DD), `venue_name`, `headliner`.
- **Optional:** `start_time` (e.g. `"19:00"` or `"7:00 PM"`), `city`, `support` (array of strings), `primary_link`, `ticket_link`.

To add more shows from the full scour report or from 24tix:

1. Append new objects to the `events` array in `data/scour-events-march-2026.json` (or create a second file and point the script at it).
2. Re-run `pnpm import-scour-events`. The API dedupes by date + venue + headliner, so duplicates are skipped.

---

## 5. Verify on the site

After a successful run:

- Open **https://www.therocksalt.com/events** (or your local URL).
- Confirm scour events appear in the calendar with correct date, venue, and title.
- Venues are created on first use; repeat runs with the same payload skip duplicates.

---

## 6. Reference

- **Scour report:** `docs/reports/ROCK_SALT_VENUE_SCOUR_2026-02-10.md` (in wasatchwise repo).
- **Ingest API:** `src/app/api/ingest-events/route.ts`.
- **Prompt for future scours:** `docs/guides/ROCK_SALT_EVENTS_VENUE_SCOUR_PROMPT.md`; use 24tix.com/search for Utah indie/DIY.
