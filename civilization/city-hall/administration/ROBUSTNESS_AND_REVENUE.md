# Robustness & Revenue-Ready Checklist

**Purpose:** Keep the monorepo stable, error-resistant, and ready to make money. Use this when onboarding, before releases, or when touching revenue paths.

---

## 1. Environment & Config (Fail-Fast)

### Ask Before You App (ABYA)

- **Validated at runtime:** `lib/env.ts` uses Zod to validate `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Missing or invalid values throw on first use (Supabase client, Stripe client, or payment routes).
- **Required for revenue:**
  - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required for all server/client.
  - `SUPABASE_SERVICE_ROLE_KEY` — required for checkout and webhook (admin writes).
  - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — required for payments; routes return 503 with a clear message if missing.
- **Optional:** `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `HEYGEN_API_KEY`, `ELEVENLABS_API_KEY` for AI and email.

### Adding a new app

- Prefer a shared pattern: one `lib/env.ts` (or equivalent) with a Zod schema, validate on first use, throw with a clear message. Never rely on `process.env.X!` without validation in revenue paths.

---

## 2. Revenue-Critical Paths (Guards & Behavior)

| Path | App | Guard / behavior |
|------|-----|-------------------|
| Checkout (create session) | ABYA | `getStripe()` + `getServerEnv()`; 503 if Stripe or service role missing. |
| Stripe webhook | ABYA | `getServerEnv().STRIPE_WEBHOOK_SECRET`; 503 if not set. Validates signature before handling. |
| Supabase (server) | ABYA | `getServerEnv()`; throws if URL/anon key invalid. |
| Supabase (client) | ABYA | `getClientEnv()`; throws if URL/anon key invalid. |

When adding new payment or lead-capture flows, use the same pattern: validate env and dependencies, return 4xx/5xx with a clear message instead of crashing or leaking errors.

---

## 3. Schema Alignment

- **DAROS / briefing:** Logic lives in `apps/ask-before-you-app/lib/daros/`. DB schema in `lib/supabase/daros-schema.sql` and migrations under `lib/supabase/migrations/`.
- **Building Registry (Wasatchville):** Single source of truth: `civilization/realms/wasatchville/docs/BUILDING_REGISTRY.md`. New ventures get a building entry and, if applicable, an app under `apps/`.
- Before changing district/briefing/artifact shapes, check `daros-schema.sql` and the DAROS README so UI and API stay in sync with the schema.

---

## 4. CI, Deploy, and Lockfiles

- **CI:** `.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile`, then lint and build. Only two Supabase secrets are set; add others if an app needs them to build.
- **Vercel:** Root `vercel.json` uses `pnpm install --frozen-lockfile` so deploys match the lockfile and CI.
- **Single package manager:** Root is pnpm. Avoid adding npm/yarn lockfiles under `apps/`; they confuse editors and can hide version drift. See `QA_INFRASTRUCTURE_REPORT.md` for cleanup list.

---

## 5. Tests You Can Run From Root

- `pnpm run build` — all workspace apps.
- `pnpm run lint` — all workspace apps.
- `pnpm run test:hci` — HCI Playwright tests for ABYA (runs in ask-before-you-app context). Other variants: `test:hci:ui`, `test:hci:report`, `test:hci:scenarios`, `test:hci:superintendent`, `test:hci:teacher`.

---

## 6. Before Going Live (Revenue)

- [ ] ABYA: Supabase URL, anon key, service role key set in Vercel (and any other env ABYA needs).
- [ ] ABYA: Stripe secret key, webhook secret, and publishable key set; webhook endpoint configured in Stripe dashboard.
- [ ] Run `pnpm run build` and `pnpm run lint` from root; fix any failures.
- [ ] Smoke-test: request a checkout session and (in test mode) complete a payment; confirm webhook updates the review record.

---

## 7. Duplicate / Legacy Files

- Avoid committing `" 2"` or `" (2)"` copies (e.g. `index 2.html`, `package 2.json`). They cause confusion and wrong imports. See `QA_INFRASTRUCTURE_REPORT.md` for known duplicates and cleanup steps.
