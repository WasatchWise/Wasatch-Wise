# n8n Events Pipeline – Remaining Setup

Quick checklist and copy-paste for finishing the "Rock Salt: Venue list → events" workflow.

---

## 1. Ingest API (already in repo)

The endpoint **already exists** at:

- **File:** `apps/rock-salt/src/app/api/ingest-events/route.ts`
- **Route:** `POST /api/ingest-events`

No code change needed. Ensure:

- Rock Salt app is deployed (or running locally) so n8n can reach it.
- **CRON_SECRET** is set in the **Rock Salt** environment (Vercel → Project → Settings → Environment Variables, or `.env.local` for local). The API only enforces auth when `CRON_SECRET` is set.

---

## 2. Replace "LLM normalize to events" with OpenAI node

Your n8n version may not have the node type from the import. Use the built-in **OpenAI** node (under **AI** in the node list) instead.

### Steps

1. Delete or disconnect the existing "LLM normalize to events" node.
2. Add an **OpenAI** node (search "OpenAI" or look under **AI**).
3. Connect **Clean HTML** → **OpenAI**.
4. Configure:
   - **Resource:** Chat
   - **Model:** `gpt-4o-mini` (or `gpt-4o` if you prefer)
   - **Messages:** use the blocks below.

### System message (first message)

```
You are an expert at extracting live music events from HTML. You output only valid JSON and never invent details.
```

### User message (second message – paste this, then append the HTML)

Use a single message that includes the instruction **and** the HTML. In n8n you can build it with an expression so the HTML from the previous node is appended.

**Option A – Expression (recommended):** Set the user message to an expression, e.g.:

```
Below is HTML from a venue calendar. Extract every live music event that:
- Falls between 2026-02-01 and 2026-03-31 (inclusive).
- Fits "Rock Salt ethos": original music, local/regional scene, DIY-but-professional, real bills. Exclude tribute-only, wedding/corporate, DJ-only unless part of local original scene.

Ethos score per event: 5=scene-defining original, 4=original fits lane, 3=mixed, 2=mostly covers/DJ, 1=not a fit.

Output a single JSON array. Each object: date (YYYY-MM-DD), start_time (string or null), venue_name, city, headliner, support (array), genre_tags (array), primary_link, ticket_link, ethos_fit_score (1-5), ethos_fit_note, source_page (URL of this HTML), missing_info (array). Do not invent details. Output only the JSON array, no markdown.

HTML:
{{ $json.html }}

Source URL: {{ $json.source_url }}
```

(Adjust `$json.html` / `$json.source_url` if your "Clean HTML" node outputs different property names.)

**Option B – Fixed prompt:** If your OpenAI node doesn’t support expressions in the message body, put the same text in a fixed "User message" and ensure the **input** to the OpenAI node still contains `html` and `source_url` in the payload (so you can debug); the model will only see what you put in the message, so you may need a Code node before OpenAI that builds one string: `promptText + item.json.html`.

5. Connect the **OpenAI** node output to your **Validate and filter** (Code) node.

---

## 3. POST ingest-events node

- **URL:** The workflow uses **n8n Variables** so you don’t hardcode the domain.  
  - In n8n: **Settings → Variables** → add `ROCK_SALT_URL` = your Rock Salt base URL (no trailing slash), e.g.  
    `https://therocksalt.com` or `http://localhost:3000` for local.  
  - The POST node URL is: `{{ $env.ROCK_SALT_URL || 'https://therocksalt.com' }}/api/ingest-events`  
    (If you re-import the workflow JSON, it uses this expression; override the fallback by setting `ROCK_SALT_URL`.)
- **Authorization:** Set header  
  `Authorization` = `Bearer {{ $env.CRON_SECRET }}`  
  so n8n sends the same secret the Rock Salt API expects.

---

## 4. CRON_SECRET and ROCK_SALT_URL in both places

| Where | What to set |
|-------|-------------|
| **n8n (Docker)** | In `infrastructure/n8n/.env`: add `CRON_SECRET` and optionally `ROCK_SALT_URL`. These are passed into the n8n container via `docker-compose.yml` and are available as `$env.CRON_SECRET` and `$env.ROCK_SALT_URL` in workflow expressions. Restart: `cd infrastructure/n8n && docker compose up -d`. |
| **n8n (UI Variables)** | If not using Docker env: Settings → Variables → add `CRON_SECRET` and `ROCK_SALT_URL` (same values). |
| **Rock Salt** | Vercel env (or `.env.local`): `CRON_SECRET` = (same value). Only required if you want the API to enforce auth; if unset, the API skips the check. |

Use a long random string for `CRON_SECRET` (e.g. `openssl rand -hex 32`).

---

## 5. Test the workflow

1. **Test the API directly** (optional). Replace `ROCK_SALT_URL` and `YOUR_CRON_SECRET` with your values:

   ```bash
   # Production example:
   curl -X POST "https://therocksalt.com/api/ingest-events" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     -d '{"events":[{"date":"2026-02-15","venue_name":"Soundwell","city":"Salt Lake City","headliner":"Test Band"}],"source":"n8n"}'

   # Local dev example:
   curl -X POST "http://localhost:3000/api/ingest-events" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     -d '{"events":[{"date":"2026-02-15","venue_name":"Soundwell","city":"Salt Lake City","headliner":"Test Band"}],"source":"n8n"}'
   ```

   Expect: `{"success":true,"inserted":1,"skipped":0,"errors":[]}` (or `inserted:0, skipped:1` if that event already exists).

2. **In n8n:** Run the workflow once with "Execute Workflow" (trigger disabled). Check:
   - Read venue_sources returns rows.
   - Fetch page returns HTML.
   - Clean HTML passes `html` and `source_url`.
   - OpenAI returns a JSON array.
   - Validate and filter passes only in-range, ethos ≥ 2.
   - POST ingest-events returns 200 and `inserted`/`skipped` in the body.

3. **Enable trigger:** Turn on the "Daily 9 AM" (or your chosen) schedule.

---

## 6. Roll the date range forward

To keep the pipeline useful beyond Feb–Mar 2026, change the prompt and the "Validate and filter" Code node to use a rolling window, e.g. "today" to "today + 60 days". You can use n8n expressions for the current date and pass them into the prompt and filter.

---

**Full prompt and schema:** See [N8N_EVENTS_PIPELINE_BLUEPRINT.md](./N8N_EVENTS_PIPELINE_BLUEPRINT.md) (LLM prompt and strict output schema).
