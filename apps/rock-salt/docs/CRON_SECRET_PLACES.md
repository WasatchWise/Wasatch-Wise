# Where Rock Salt’s CRON_SECRET Must Be Set

Use the **same value** everywhere so n8n (or any caller) can authenticate to Rock Salt’s cron/protected APIs.

---

## 1. Where you SET the value (must match)

| Place | Purpose |
|-------|--------|
| **Rock Salt (server)** | API reads `process.env.CRON_SECRET` to validate `Authorization: Bearer <secret>`. |
| **n8n (caller)** | Workflow sends the secret when calling `POST /api/ingest-events`. |

### Rock Salt app

- **Production:** Vercel → Rock Salt project → Settings → Environment Variables → `CRON_SECRET`
- **Local:** `apps/rock-salt/.env.local` (or `.env`) → `CRON_SECRET=...`

### n8n (so it can call Rock Salt)

- **Docker:** `infrastructure/n8n/.env` → `CRON_SECRET=...` (same value). Loaded by `docker-compose.yml` and passed into the n8n container.
- **Or n8n UI:** Settings → Variables → `CRON_SECRET` (if you’re not using Docker env).

---

## 2. Where it’s referenced in the repo (no need to set again)

| File | How it’s used |
|------|----------------|
| `apps/rock-salt/src/app/api/ingest-events/route.ts` | Reads `process.env.CRON_SECRET`; rejects request if header ≠ `Bearer ${CRON_SECRET}` when set. |
| `apps/rock-salt/src/app/api/scrape-events/route.ts` | Optional auth (commented out): same `Bearer CRON_SECRET` check. |
| `infrastructure/n8n/docker-compose.yml` | Passes `CRON_SECRET: ${CRON_SECRET:-}` into the n8n service env. |
| `apps/rock-salt/docs/n8n-workflow-venue-to-events.json` | POST node uses `Authorization: Bearer {{ $env.CRON_SECRET }}`. |

---

## 3. Docs that mention it

- `apps/rock-salt/.env.example` – lists `CRON_SECRET` for local/Vercel.
- `infrastructure/n8n/.env.example` – lists `CRON_SECRET` for n8n.
- `apps/rock-salt/docs/N8N_REMAINING_SETUP.md` – setup and curl examples.
- `apps/rock-salt/docs/N8N_EVENTS_PIPELINE_BLUEPRINT.md` – pipeline auth.
- `apps/rock-salt/docs/LAUNCH_CHECKLIST.md` – launch checklist.
- `apps/rock-salt/README.md`, `ONBOARDING.md`, `DEPLOYMENT.md` – env and cron notes.

---

## Summary

**Set the same `CRON_SECRET` in exactly two places:**

1. **Rock Salt** – Vercel env (production) and/or `apps/rock-salt/.env.local` (local).
2. **n8n** – `infrastructure/n8n/.env` (and restart: `cd infrastructure/n8n && docker compose up -d`), or n8n UI Variables.

Generate a value once (e.g. `openssl rand -hex 32`) and paste it in both.
