# Week of 2/2/2026 – Top Priorities

**Focus:** SLC Trips revenue-ready, Ask Before You App SDPC-ready by Feb 4, Pipeline IQ run for Mike Sartain tomorrow (Feb 3), Rock Salt adoption in parallel.

---

## 1. SLC Trips – Revenue ready & revenue perfect (February push)

**Goal:** Every payment and affiliate path works; no broken checkout, no missed webhooks, no wrong links.

### Revenue-critical paths
| Path | Purpose | API / Component |
|------|---------|------------------|
| TripKit purchase | Paid TripKits | `POST /api/stripe/create-checkout` ← `TripKitPurchaseButton`, `PurchaseTripKitButton` |
| Welcome Wagon $49 | 90-day guide | `POST /api/checkout` (body: Welcome Wagon) ← `welcome-wagon/page.tsx` |
| Gift checkout | Gift purchases | `POST /api/stripe/create-gift-checkout` ← `GiftPurchaseButton` |
| Success / fulfillment | After payment | `/checkout/success` + Stripe webhook → DB + email |

### Things to verify
- [ ] **Single webhook in production** – Two routes exist: `/api/webhooks/stripe/route.ts` and `/api/stripe/webhook/route.ts`. In Vercel, only one URL should be registered as the Stripe webhook endpoint. Confirm which app is live and that Stripe dashboard points to that URL (e.g. `https://<slctrips-domain>/api/webhooks/stripe` or `.../api/stripe/webhook`), not both.
- [ ] **Stripe env in production** – `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` set and correct for the live app.
- [ ] **End-to-end test** – One real (or test-mode) purchase: TripKit or Welcome Wagon → Stripe Checkout → success page → webhook fires → purchase/fulfillment recorded (and email if applicable).
- [ ] **Affiliate links** – `lib/affiliates.ts`: AWIN, Viator, Amazon, etc. Env: `NEXT_PUBLIC_AWIN_AFFILIATE_ID`, `AMAZON_AFFILIATE_TAG` (or `wasatchwise20-20`). Confirm no broken or non-affiliate fallbacks on key CTAs.
- [ ] **StayKit** – `staykits/page.tsx` calls `/api/staykit/create-checkout` – confirm that route exists and is wired to Stripe if StayKits are live; otherwise hide or gate.

### Config reference
- Stripe: `apps/slctrips/src/lib/stripe-config.ts` (`STRIPE_CONFIG`, `getActivePrice`, `validateStripeConfig`).
- Affiliates: `apps/slctrips/src/lib/affiliates.ts`.

---

## 2. Ask Before You App – Up and flying by Feb 4 (SDPC meeting)

**Goal:** Demo-ready for SDPC: site loads, key messages and SDPC framing are clear, no hard errors.

### Demo-critical pages
| Route | Purpose for SDPC |
|-------|-------------------|
| `/` | Campaign home – “Ask Before You App”, who it’s for, trust/SDPC mention |
| `/learn` | Knowledge hub – state ecosystem, SDPC Registry, “what to ask” |
| `/certification` | NDPA-aligned training – structure and value prop |
| `/ecosystem` | State resources – SDPC member count, state list |

### Things to verify (by Feb 4)
- [ ] **Build & deploy** – `pnpm run build` (or `turbo run build --filter=ask-before-you-app`) succeeds. Deploy to production (e.g. Vercel) so SDPC sees live URL.
- [ ] **Required env (no Stripe needed for content demo)** – `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (validated in `lib/env.ts`). If you show anything that hits Supabase (e.g. states, districts), DB and RLS must allow anon read as needed.
- [ ] **Content and links** – SDPC link (privacy.a4l.org), “SDPC Registry”, “SDPC Member” states on `/learn` and `/ecosystem` render correctly. No 404s on nav: Learn, Certification, State resources.
- [ ] **Who modal** – `OpenWhoModalButton` / `WhoAreYouModal` – open and close without errors.
- [ ] **Optional for demo** – If you don’t show checkout/certification purchase, Stripe can stay unconfigured; `getServerEnv()` treats Stripe as optional.

### Quick local check
```bash
pnpm run dev:abya
# Open /, /learn, /certification, /ecosystem and click through; open Who modal.
```

---

## 3. Pipeline IQ – Run for Mike Sartain (Feb 3)

**Goal:** Mike can use the app tomorrow; no access or “run” blockers.

### Mike’s access (already configured)
- **User:** msartain@getgrooven.com (or `is_god_mode` in DB).
- **Org:** Groove Technologies – full access, no subscription/usage limits.
- **Docs:** `apps/pipeline-iq/MIKE_ACCESS_CONFIGURATION.md`, `START_HERE.md`, `QUICK_START.md`.

### “Run a Pipeline IQ” checklist for tomorrow
- [ ] **App running** – Pipeline IQ deployed and reachable (e.g. Vercel project URL), or local tunnel if demo is local.
- [ ] **Mike can log in** – Supabase Auth (or your auth) has Mike’s account; org linked to Groove Technologies.
- [ ] **Core flow** – Dashboard → Projects (e.g. Marriott) → run enrich and/or campaign generate. No paywall or limit errors for Mike.
- [ ] **Env** – Supabase, OpenAI, Google (Places/Gemini if used), and HeyGen (if you’re doing video) configured in the environment that Mike will use.
- [ ] **One dry run** – Before the meeting: one enrich and/or one campaign generate to confirm no 500s or missing keys.

### Useful commands
```bash
# From repo root
turbo run dev --filter=pipeline-iq
# Or from app
cd apps/pipeline-iq && pnpm run dev
```
- Enrich: `POST /api/projects/<PROJECT_ID>/enrich`
- Campaign: `POST /api/campaigns/generate` with body `{ projectIds, useAI, useVideo, generateVariants }`

---

## 4. Rock Salt – Real-world adoption & Spider Rider backend

**Goal:** Support adoption and backend work; not the main “ship by date” this week.

- **In parallel:** Spider Rider flows, venue capabilities, launch/validation docs (see `apps/rock-salt/docs/LAUNCH_AND_VALIDATION_INDEX.md`).
- **Focus:** Getting artists/venues to adopt; backend (APIs, compatibility, rider generation) stable enough for that. No separate “revenue perfect” deadline this week like SLC Trips.

---

## Summary

| Priority | By when | Main outcome |
|----------|---------|--------------|
| **SLC Trips** | This week / February | Revenue-ready: checkout + webhook + affiliates verified and correct |
| **Ask Before You App** | **Feb 4** | Up and flying for SDPC: build, deploy, key pages and SDPC messaging working |
| **Pipeline IQ** | **Feb 3** | Run for Mike Sartain: app up, Mike has access, one successful enrich/campaign run |
| **Rock Salt** | Ongoing | Adoption and backend; launch docs and Spider Rider in use in the real world |
