# Ask Before You App — Supabase

## Empty project setup

If your ABYA Supabase project has **no tables yet**, run migrations in this order in the Supabase SQL Editor (Dashboard → SQL Editor → New query):

1. **000_abya_bootstrap.sql** — extension + `email_captures` + `districts`
2. **001_sdpc_registry.sql** — vendors, data_use_agreements, tool_assessments, compliance_checks, etc.
3. **002_rls_policies.sql** — RLS policies
4. **003_ai_log_kb_fields.sql** — AI log / KB fields
5. **004_pricing_system.sql** — pricing_tiers, subscriptions, workshops
6. **005_citation_system.sql** — knowledge_sources, chat_sessions, chat_messages, citations
7. **006_ask_before_you_app.sql** — app_reviews, review_findings, review_reports, review_notes
8. **007_common_sense_privacy_evaluations.sql** — Common Sense Media privacy evaluations
9. **008_states.sql** — *(optional)* `states` table for listing and “ecosystem available” flag; ecosystem content stays in code. See `docs/STATE_AND_DISTRICT_DATA_DESIGN.md`.

Copy each file’s contents into a new query and run it. Order matters: `001` depends on `districts` (created in `000`).

## DAROS dashboard

If you use the **dashboard** (districts, sessions, artifacts), run **daros-schema.sql** after the numbered migrations (e.g. after `007`). It creates `artifacts`, `controls`, `district_controls`, `stakeholder_matrix`, `interventions`, `district_vendors`, `briefing_sessions`, `adoption_plans`. It uses `CREATE TABLE IF NOT EXISTS` for `districts` and `vendors`, so it’s safe after `000` and `001`.

## After migrations

- **Email signups:** `email_captures` (Who Are You modal, newsletter).
- **Common Sense data:** Put `privacy.csv` in `data/privacy.csv` and run `pnpm run seed:common-sense-privacy` (see `data/README.md`).
- **States (optional):** If you ran `008_states.sql`, run `seeds/002_states.sql` in the SQL Editor to seed all 51 states and set Utah as having ecosystem content.

## Env

- **App:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
- **Service role (required for seed/import):** `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for the Common Sense import script and any admin operations. Never expose the service role key to the client.
