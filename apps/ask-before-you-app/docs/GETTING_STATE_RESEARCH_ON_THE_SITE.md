# Getting State Laws & Research on the Site

Your state-by-state research (laws, contacts, compliance, AI governance) **already appears on the site** via in-repo TypeScript. You do **not** need SQLite; this app uses **Supabase (PostgreSQL)** when content lives in the database.

---

## Why is Utah the only state I can interact with?

On the **deployed** app (what’s on `main` without the foundation work), the state page only checks **full guides** (`getStateEcosystem`). Only Utah has a full guide, so every other state shows “Coming Soon.”

The **foundation** (overview for all 50 + DC) only appears when:

1. **Foundation data** is in the repo: `lib/ecosystem/state-foundation-data.ts` and `lib/ecosystem/foundation-types.ts`.
2. **Ecosystem index** exports `getStateFoundation` and `STATE_FOUNDATION`.
3. **State page** uses the foundation when there’s no full guide: “if no full guide but foundation exists → show overview.”

Those changes were only on your machine. Once you **commit and push** the foundation files and the updated `index.ts` and `app/ecosystem/[stateCode]/page.tsx`, and redeploy, every state will show at least the overview (laws, compliance, contacts); Utah will still be the only one with the full guide.

---

## How It Works Today

| Item | Where it lives | How the site uses it |
|------|----------------|----------------------|
| **CSV** (`data/state-student-privacy-ai-profiles-table1.csv`) | Repo (reference only) | Source for building content; not imported directly. |
| **State foundation profiles** (50 states + DC) | `lib/ecosystem/state-foundation-data.ts` | `getStateFoundation(stateCode)` — used on `/ecosystem/[stateCode]` when a state has no “full guide” yet. |
| **Full state guide** (Utah only so far) | `lib/ecosystem/states/utah.ts` | `getStateEcosystem('UT')` — full guide with workflows, roles, resources. |
| **States list** | `lib/ecosystem/types.ts` → `ALL_STATES` | Ecosystem landing page grid and links. |

So the research **is** on the site: every state has an **Overview** (laws, compliance, contacts) from `state-foundation-data.ts`; Utah has a **Full guide** from `utah.ts`. To keep it that way you only need to:

1. **Commit** `lib/ecosystem/state-foundation-data.ts` (and any new/updated state files).
2. **Deploy** the app (e.g. Vercel). No database step required for this content.

---

## Do You Need to Put It in Supabase?

**No** — not unless you want to:

- Edit state profiles without code deploys (e.g. from a CMS or admin UI).
- Share the same content with another app or API.
- Run queries/reports on state data in the database.

If you’re fine editing state content in code and deploying, the current approach (TypeScript in the repo) is enough and is already live.

---

## Option B: Store State Profiles in Supabase

If you **do** want this content in the database:

1. **Create a table** (e.g. `state_profiles`) via a Supabase migration — columns or JSONB for: code, name, sdpc_member, agency_name, state_laws (JSON), compliance_summary, contact_email, contact_phone, website, etc.
2. **Seed it** with a one-time script that:
   - Reads `lib/ecosystem/state-foundation-data.ts` (or parses the CSV), and
   - Inserts/upserts into `state_profiles`.
3. **Change the app** so `/ecosystem/[stateCode]` (and any listing) fetches from Supabase instead of `getStateFoundation()`.

Then you can update state profiles in Supabase (manually or via a future admin UI) without redeploying.

---

## Summary

- **To have the research on the site:** It’s already there via `state-foundation-data.ts`. Commit and deploy; no SQLite and no Supabase needed for this.
- **To move it into Supabase:** Use a **Supabase migration** (Postgres) plus a **seed/import script**, not SQLite. The doc above outlines the migration + seed + app changes.

If you want to go ahead with the Supabase option, the next step is to add a migration (e.g. `011_state_profiles.sql`) and a script that seeds from `state-foundation-data.ts` or the CSV.
