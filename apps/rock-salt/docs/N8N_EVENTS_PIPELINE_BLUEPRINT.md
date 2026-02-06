# n8n Events Pipeline Blueprint (Rock Salt)

**Goal:** Take a list of venue sources (calendar pages, Bandsintown, Songkick, Facebook events, etc.), pull events, run an LLM pass to normalize into our schema, dedupe, then push into Supabase.

**Key idea:** Don’t try to fully scrape perfectly. Fetch raw HTML → extract candidate event blocks (roughly) → **LLM normalize into strict JSON** → validate and dedupe → store. That avoids brittle scrapers.

**Storage target:** Supabase (fits our stack; `events`, `venues`, `venue_sources`).

---

## Table: `venue_sources`

Use this to drive “which pages to fetch.” Populate via Supabase UI, SQL, or a future admin UI.

| Column        | Type    | Description |
|---------------|---------|-------------|
| `id`          | uuid    | PK |
| `venue_name`  | text    | Display name (e.g. "Soundwell") |
| `city`        | text    | Default "Salt Lake City" |
| `state`       | text    | Default "UT" |
| `source_url`  | text    | Calendar page URL to fetch |
| `source_type` | text    | `venue_site`, `bandsintown`, `songkick`, `facebook`, `instagram_link`, `other` |
| `priority`    | smallint| 1=high, 2=normal, 3=low (fetch order) |
| `active`      | boolean | If false, skip |
| `last_fetched_at` | timestamptz | Set after successful fetch |
| `last_error`  | text    | Set if fetch/parse failed |
| `created_at`  | timestamptz | |
| `updated_at`  | timestamptz | |

**Migration:** `supabase/migrations/20260215_venue_sources_and_external_url.sql`

**Seed example (run in SQL editor):**

```sql
INSERT INTO public.venue_sources (venue_name, city, source_url, source_type, priority, active)
VALUES
  ('Soundwell', 'Salt Lake City', 'https://www.soundwellslc.com/events/', 'venue_site', 1, true),
  ('Urban Lounge', 'Salt Lake City', 'https://www.theurbanlounge.com/events', 'venue_site', 1, true),
  ('Kilby Court', 'Salt Lake City', 'https://kilbycourt.com/events', 'venue_site', 1, true),
  ('The Commonwealth Room', 'Salt Lake City', 'https://thecommonwealthroom.com/events', 'venue_site', 2, true),
  ('Metro Music Hall', 'Salt Lake City', 'https://metromusichall.com/events', 'venue_site', 2, true);
```

---

## Workflow A: “Venue list → events” (daily or hourly)

1. **Trigger**  
   Cron: run daily at 9:00 AM (or hourly).

2. **Read venue list**  
   Supabase node:  
   - **Operation:** Get many  
   - **Table:** `venue_sources`  
   - **Filter:** `active = true`  
   - **Order:** `priority ASC`, then `venue_name`

3. **Loop over each row**  
   SplitInBatches or Loop Over Items. For each item:
   - `source_url` = URL to fetch  
   - `venue_name`, `city` = context for LLM

4. **Fetch page**  
   HTTP Request node:  
   - URL: `{{ $json.source_url }}`  
   - Follow redirects: on  
   - Headers:  
     - `User-Agent`: e.g. `Mozilla/5.0 (compatible; RockSaltBot/1.0)`  
     - `Accept-Language`: `en-US,en;q=0.9`

5. **Clean HTML (optional but recommended)**  
   Function node: strip `<script>`, `<style>`, collapse whitespace, keep main body. Goal: fewer tokens, not perfection.

   ```js
   const html = $input.first().json.data || $input.first().json.body || '';
   const stripped = html
     .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
     .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
     .replace(/\s+/g, ' ')
     .trim();
   return { json: { html: stripped.slice(0, 120000), venue_name: $('Supabase').item.json.venue_name, source_url: $('Supabase').item.json.source_url } };
   ```

   (Adjust `$('Supabase')` to the name of your Supabase node if different.)

6. **LLM normalize into events (the money step)**  
   Use OpenAI, Anthropic, or another LLM node. **Prompt and schema below.**

7. **Validate**  
   - Parse JSON.  
   - Filter: drop events outside date range (e.g. Feb 1–Mar 31, 2026); drop if `ethos_fit_score < 2` if you want only 2+.

8. **Send to Rock Salt**  
   HTTP Request node:  
   - Method: POST  
   - URL: `https://your-rock-salt-domain.com/api/ingest-events`  
   - Body: `{ "events": <array from LLM>, "source": "n8n" }`  
   - Headers: `Authorization: Bearer <CRON_SECRET or API key>`  

   Our API will: find-or-create venue, dedupe by `date|venue_name|headliner`, insert into `events`.

9. **Optional: update venue_sources**  
   Supabase “Update” node: set `last_fetched_at = now()`, clear `last_error` on success; set `last_error` on failure.

10. **Optional: alert**  
    If new events inserted > 0, send Slack or email summary.

---

## LLM prompt (copy into n8n LLM node)

**System (or first user) message:**

```
You are an expert at extracting live music events from HTML. You output only valid JSON and never invent details.
```

**User message (use this + the HTML):**

```
Below is HTML from a venue calendar or events page. Extract every live music event that:
- Falls between 2026-02-01 and 2026-03-31 (inclusive).
- Fits "Rock Salt ethos": original music, local/regional scene, DIY-but-professional, real bills. Exclude tribute-only nights, wedding/corporate acts, and DJ-only club nights unless clearly part of the local original music scene.

Ethos score (include for each event):
- 5: original, scene-defining local/regional bill
- 4: original, good bill, fits Rock Salt lane
- 3: mixed bill, unclear originality
- 2: mostly covers/tribute/DJ
- 1: not a fit

Output a single JSON array. Each object must have exactly these keys:
- date (string, "YYYY-MM-DD")
- start_time (string or null, e.g. "19:00" or "7:00 PM")
- venue_name (string)
- city (string)
- headliner (string)
- support (array of strings)
- genre_tags (array of strings, 3–6 tags)
- primary_link (string, best event page URL or "")
- ticket_link (string or null)
- ethos_fit_score (number, 1–5)
- ethos_fit_note (string, one sentence)
- source_page (string, the URL this HTML came from)
- missing_info (array of strings, e.g. ["start_time", "ticket_link"])

Do not invent dates, venues, or act names. If something is unclear, put it in missing_info and use null or "" where appropriate. Output only the JSON array, no markdown or explanation.
```

Then append the cleaned HTML (and optionally `source_page` URL) so the LLM knows the source.

**Strict output schema (for validation / parser guardrails):**

```json
[
  {
    "date": "YYYY-MM-DD",
    "start_time": "HH:MM or null",
    "venue_name": "",
    "city": "",
    "headliner": "",
    "support": [],
    "genre_tags": [],
    "primary_link": "",
    "ticket_link": "",
    "ethos_fit_score": 1,
    "ethos_fit_note": "",
    "source_page": "",
    "missing_info": []
  }
]
```

In n8n you can add a “Validate/parse” step: parse JSON, then filter items where `date >= "2026-02-01"` and `date <= "2026-03-31"`, and optionally `ethos_fit_score >= 2`.

---

## Dedupe + upsert strategy

- **Stable key:** `event_key = date + "|" + venue_name + "|" + headliner` (normalize venue_name to lowercase trim for comparison).
- **Server-side (recommended):** Our `POST /api/ingest-events` does:
  - Find-or-create venue by `venue_name` (and city/state).
  - For each event: check if an event already exists with same date (day), same `venue_id`, and same title/headliner (or normalized name).
  - If not exists: insert into `events` with `title` = headliner (or "Headliner + Support"), `start_time`, `venue_id`, `venue_name`, `city`, `state`, `description` (e.g. genre_tags + ethos_fit_note), `ticket_url`, `external_url` = primary_link, `external_source` = 'n8n'.
- **No duplicate rows:** We never create a second row for the same show; we skip if already present.

---

## Workflow B: “Discovery mode” (weekly, optional)

- **Trigger:** Cron weekly.
- **Fetch hub pages:** Bandsintown Utah, Songkick SLC, City Weekly events, etc.
- **LLM step:** “From this page, list every link that looks like a venue calendar or event listing. Output JSON array of { url, label }.”
- **Compare** to existing `venue_sources.source_url`.
- **Insert new URLs** into `venue_sources` with `active = false` and `source_type = 'other'` so someone can review and set `active = true`.

This grows the venue list without manual babysitting.

---

## Where Claude Chrome extension still fits

- **Claude:** One-off research, sanity checks, nuance from social posts, manual discovery.
- **n8n:** Repeatable ingestion, dedupe, publishing, daily/hourly updates.

Run both: Claude for “find,” n8n for “keep up to date.”

---

## Gotchas

1. **Blocked requests:** Some sites block non-browser requests. Try:
   - Realistic `User-Agent` and `Accept-Language`.
   - Wait node between requests (e.g. 2–5 s).
   - If still blocked, add a Bandsintown or Songkick URL for that venue as the `source_url` instead (they’re often more permissive).
2. **Rate limits:** Don’t hammer; use SplitInBatches + Wait between venue_sources.
3. **404s / bad URLs:** The pipeline skips venues that return 404 or empty HTML (no crash). If a venue never yields events, check and fix `source_url` in the `venue_sources` table (or set `active = false` until the URL is verified).
4. **LLM output:** If the model returns markdown-wrapped JSON, strip `` ```json `` and `` ``` `` in a Function node before parse.
5. **Date range:** Roll the window forward (e.g. “next 60 days”) so the same workflow works forever; update the prompt’s date range or pass it as a variable.

---

## Roll-forward (use forever)

- In the LLM prompt, replace the fixed date range with a variable, e.g. “between `{{ $env.START_DATE }}` and `{{ $env.END_DATE }}`” and set those in a Cron or at the start of the workflow (e.g. “today” and “today + 60 days”).
- Keep `venue_sources` updated via Workflow B or manual adds.
- Ingest API and dedupe logic stay the same; only the date window and venue list change.

---

## Files in this repo

| File | Purpose |
|------|---------|
| `supabase/migrations/20260215_venue_sources_and_external_url.sql` | Creates `venue_sources`, adds `external_url` on `events` |
| `docs/N8N_EVENTS_PIPELINE_BLUEPRINT.md` | This blueprint |
| `src/app/api/ingest-events/route.ts` | POST endpoint: accept LLM JSON array, find-or-create venue, dedupe, insert events |
| `docs/EVENTS_CALENDAR_CLAUDE_EXTENSION_PROMPTS.md` | Claude extension prompts (manual “junior booker”) |

---

## n8n workflow JSON

A ready-to-import n8n workflow is in `docs/n8n-workflow-venue-to-events.json`. Import it (Editor → three dots → Import from File), then:

1. **Credentials**
   - Supabase: create a credential with your project URL and service role (or anon) key; assign it to the “Read venue_sources” node.
   - OpenAI: assign your API key to the “LLM normalize to events” node.
2. **Config**
   - In “Read venue_sources”: confirm table `venue_sources` and filter `active = true` (adjust options to match your n8n version).
   - In “Fetch page”: ensure “Put response in field” (or similar) is set so the response body is in a field like `body` and the input item (with `source_url`, `venue_name`) is preserved; otherwise add a Merge/Code step to combine response + loop item.
   - In “POST ingest-events”: set URL to `https://YOUR_ROCK_SALT_DOMAIN.com/api/ingest-events` and set the `Authorization` header to `Bearer YOUR_CRON_SECRET` (or use an env variable `CRON_SECRET`).
3. **Date range**  
   Update the LLM prompt and the “Validate and filter” Code node so the window is “next 60 days” or your desired range (see “Roll-forward” above).
4. Run once manually, then enable the “Daily 9 AM” Cron trigger.
