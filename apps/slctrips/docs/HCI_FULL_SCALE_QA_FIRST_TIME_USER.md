# SLC Trips – Full-Scale HCI QA (First-Time User)

**Purpose:** Run a comprehensive QA pass as if the user has never visited the site. Use this after clearing site cache (F12 → Application → Clear site data) or in an incognito window with no prior session.

**Prerequisites:**
- Site cache cleared (Application → Clear site data) **or** incognito window
- DevTools open: Network tab (preserve log), Console tab
- Optional: Vercel Runtime Logs open for API debugging
- Base URL: `https://www.slctrips.com` (or staging/local)

---

## Phase 0: Pre-flight (before any navigation)

- [ ] **0.1** DevTools → Application → Storage → Clear site data (all: cookies, localStorage, sessionStorage, cache). Confirm "Clear site data" done.
- [ ] **0.2** Close all other tabs for this origin (optional, reduces noise).
- [ ] **0.3** Network tab: enable "Preserve log", disable cache (Disable cache checkbox).
- [ ] **0.4** Console: note any errors before navigation (should be none or only expected third-party).

---

## Phase 1: Landing & global navigation (first-time load)

- [ ] **1.1** Navigate to `/` (homepage).
  - **Pass:** 200, page title contains "SLCTrips", hero visible ("1 Airport", "1000+ Destinations" or equivalent).
  - **Fail:** 4xx/5xx, blank or broken hero, console errors blocking render.
- [ ] **1.2** Check hero CTAs: "Explore Destinations", "Get Your TripKit" (or equivalent) visible and clickable.
- [ ] **1.3** Check primary nav: Destinations, County Guides / Guardians, AdventureGuides, Guides, "New to Utah?" (or equivalent). All links resolve (no 404).
- [ ] **1.4** Click "Explore Destinations" → URL `/destinations`, content loads.
- [ ] **1.5** Back to home; click "Get Your TripKit" or TripKits nav → URL `/tripkits`, TripKit list loads.
- [ ] **1.6** Back to home; click "New to Utah?" (or Welcome Wagon) → URL `/welcome-wagon`, Welcome Wagon content loads.
- [ ] **1.7** Footer: Terms, Privacy, Refund Policy, Contact, FAQ links present and resolve (no 404).
- [ ] **1.8** Console: no uncaught JS errors; Network: no critical failed requests (XHR/fetch 5xx for our APIs).

---

## Phase 2: Content & discovery (no auth)

- [ ] **2.1** `/destinations` – list/grid loads; at least one destination card visible; click one → destination detail page loads (title, description, map/media if any).
- [ ] **2.2** Destination detail: check "View on Booking.com" (or equivalent) link – opens AWIN/Booking URL with tracking params (e.g. `awinaffid`, `awinmid`) or redirects to booking.com.
- [ ] **2.3** Destination detail: check any Amazon/product link – URL contains `tag=` (Associate tag).
- [ ] **2.4** `/tripkits` – list of TripKits; free TripKit (e.g. TK-000 "Utah Unlocked") shows "FREE FOREVER" or equivalent; paid TripKits show price (e.g. $12.99).
- [ ] **2.5** Click a **paid** TripKit (e.g. Ski Utah, Haunted Highway) → detail page: hero, price, "Buy for $X.XX" button visible.
- [ ] **2.6** Click a **free** TripKit → detail page: "Get Free Access" (or equivalent) visible; click → redirects to `/tripkits/[slug]/view` or email gate, no Stripe.
- [ ] **2.7** `/guardians` or County Guides – page loads; at least one guardian/county card visible; click one → detail loads.
- [ ] **2.8** `/staykits` – StayKits catalog loads; "Purchase StayKit" or pricing visible if offered.

---

## Phase 3: Authentication (first-time / returning)

- [ ] **3.1** From any page, open header/auth: "Sign In" (or "My TripKits" if already signed in) visible.
- [ ] **3.2** Click "Sign In" → `/auth/signin` (or equivalent). Form: email, password, submit visible.
- [ ] **3.3** Submit with **invalid** email (e.g. `notanemail`) – validation error or message; no 500.
- [ ] **3.4** Submit with **valid** credentials (test account): redirect to home or intended page; header shows "My TripKits" or account state.
- [ ] **3.5** Refresh page – session persists (still signed in).
- [ ] **3.6** Sign out (if available) → header shows "Sign In" again; session cleared.

---

## Phase 4: Revenue – TripKit purchase (authenticated)

- [ ] **4.1** Sign in with an account that **does not** own the target TripKit.
- [ ] **4.2** Go to a **paid** TripKit detail (e.g. Brewery Trail, Coffee Culture – pick one you don’t own).
- [ ] **4.3** Click "Buy for $X.XX".
  - **Pass:** Browser redirects to `checkout.stripe.com` (Stripe Checkout).
  - **Fail:** Stays on site; Network: `POST /api/stripe/create-checkout` returns 400/500. Check Response body for `code`: `already_owned` | `auth_required` | `tripkit_id_required` | etc.; check Vercel logs for `[Stripe Checkout] 400: ...`.
- [ ] **4.4** On Stripe Checkout: use test card `4242 4242 4242 4242`, any future expiry, any CVC, any billing. Complete payment.
- [ ] **4.5** Redirect to `/checkout/success?session_id=...` – success message visible; "Access Your TripKit" or access code/link shown (or polling message).
- [ ] **4.6** Network: `GET /api/purchases/by-session?session_id=...` returns 200 and `access_code` (for TripKit) after a short delay (webhook must run first).
- [ ] **4.7** Click "Access Your TripKit" or open `/tk/[accessCode]` – TripKit view/content loads (no 404).
- [ ] **4.8** Go to `/account/my-tripkits` (or My TripKits) – purchased TripKit appears in list.
- [ ] **4.9** Return to same TripKit detail; click "Buy" again – **Pass:** 400 with `code: "already_owned"`, redirect to `/tripkits/[slug]/view` and/or toast "You already own this TripKit".

---

## Phase 5: Revenue – Welcome Wagon (guest or authenticated)

- [ ] **5.1** Clear site data or use incognito; go to `/welcome-wagon`.
- [ ] **5.2** Page loads: hero, pricing tiers (Free Week 1, $49 90-Day, $299 Corporate) and "Buy Now - $49" (or equivalent) visible.
- [ ] **5.3** Click "Buy Now - $49".
  - **Pass:** Redirect to `checkout.stripe.com` (Stripe Checkout).
  - **Fail:** Stays on page; Network: `POST /api/checkout` returns 500 or 400. Check Response body and Vercel logs.
- [ ] **5.4** (Optional) Complete test payment → redirect to `/checkout/success`; confirmation message; email (if SendGrid configured) received with access link.
- [ ] **5.5** Lead capture (free Week 1): submit email (and name if present) – **Pass:** 200 from API, success message or redirect; no 500.

---

## Phase 6: Revenue – StayKit (authenticated)

- [ ] **6.1** Signed in; go to `/staykits`.
- [ ] **6.2** Catalog loads; click "Purchase StayKit" on a paid StayKit.
  - **Pass:** Redirect to Stripe Checkout.
  - **Fail:** 400/500; check Network response and Vercel logs.
- [ ] **6.3** (Optional) Complete test payment → redirect to success URL; access to StayKit (e.g. `/my-staykit`) works.

---

## Phase 7: Revenue – Gift purchase (optional)

- [ ] **7.1** From a TripKit detail, find "Give as Gift" (or GiftPurchaseButton).
- [ ] **7.2** Click → flow starts (modal or gift page); fill recipient email if required; submit.
  - **Pass:** Redirect to Stripe Checkout (gift).
  - **Fail:** 400/500; check Network and logs.
- [ ] **7.3** (Optional) Complete test payment; gift reveal/redeem flow works.

---

## Phase 8: Checkout cancel & error states

- [ ] **8.1** Start any paid checkout (TripKit or Welcome Wagon); on Stripe Checkout click "Back" or cancel.
- [ ] **8.2** Redirect to `/checkout/cancel` or back to product page – "No worries, your payment was not processed" (or equivalent) visible; no charge.
- [ ] **8.3** Unauthenticated TripKit purchase: sign out, go to paid TripKit, click "Buy for $X.XX".
  - **Pass:** Toast/msg "Please sign in to purchase" and redirect to `/auth/signin?redirect=...`; **or** 401 from API and clear error in UI.
- [ ] **8.4** Invalid session on success page: open `/checkout/success?session_id=invalid_session_123` – **Pass:** No crash; "processing" or "session invalid" or retry message; no 500.

---

## Phase 9: Affiliate & outbound links

- [ ] **9.1** Homepage: "Rent a Car", "Find Hotels" (or equivalent) – click each. **Pass:** AWIN/Booking URL with tracking params, then redirect to booking.com (or partner).
- [ ] **9.2** Destination detail: "View on Booking.com", "Book on Viator", product links – **Pass:** URLs contain affiliate/tracking params (e.g. AWIN, `tag=` for Amazon); no 404.
- [ ] **9.3** Open link in new tab; confirm destination domain (booking.com, viator.com, amazon.com) and that tracking params are present in URL bar (or first redirect).

---

## Phase 10: Accessibility & responsive (spot check)

- [ ] **10.1** Homepage: tab through key interactive elements (nav, hero CTA, footer links) – focus visible, order logical.
- [ ] **10.2** TripKit detail: "Buy" button focusable and activatable with Enter/Space.
- [ ] **10.3** Resize to mobile width (~375px) – nav collapses or remains usable; hero and CTAs readable; no horizontal scroll from broken layout.
- [ ] **10.4** One destination and one TripKit page at mobile width – content readable, buttons tappable.

---

## Phase 11: Performance & SEO (spot check)

- [ ] **11.1** Homepage load: no critical request failing (200 or 304 for main doc and key assets).
- [ ] **11.2** View page source on homepage – `<title>`, meta description present; no obvious duplicate or empty title.
- [ ] **11.3** TripKit detail: `<title>` and meta reflect TripKit name/description.

---

## Phase 12: Post-purchase & account (signed in)

- [ ] **12.1** Signed in; visit `/account/my-tripkits` (or My TripKits) – list of owned TripKits; click one → view/content loads.
- [ ] **12.2** Visit `/tk/[accessCode]` with a valid access code (from email or success page) – TripKit view loads (no 404).
- [ ] **12.3** Visit `/checkout/success` without `session_id` or with invalid – graceful message or redirect; no 500.
- [ ] **12.4** Welcome Wagon access: after purchase, link to `/welcome-wagon/access` or equivalent – **Pass:** Content or dashboard loads for purchaser.

---

## Summary checklist (quick pass)

- [ ] **Landing:** Home loads, nav works, no console errors.
- [ ] **Content:** Destinations & TripKits load; affiliate links have tracking.
- [ ] **Auth:** Sign in / sign out; session persists.
- [ ] **TripKit purchase:** Buy (signed in, TripKit not owned) → Stripe → success → access code → view.
- [ ] **Already owned:** Buy again → 400 `already_owned` → redirect to view.
- [ ] **Welcome Wagon:** Buy $49 → Stripe → success (and email if configured).
- [ ] **Cancel:** Cancel on Stripe → cancel page, no charge.
- [ ] **Unauthenticated buy:** Redirect to sign in or clear error.
- **Logs:** Vercel Runtime Logs show `[Stripe Checkout] 400: already_owned` (or other code) when applicable; no unhandled 500 in logs for checkout.

---

## Running against production

- Base URL: `https://www.slctrips.com`
- Use Stripe **test mode** for payments (test cards); do not use live cards unless intentionally testing live.
- **Automated run (Playwright):** From `apps/slctrips`:
  ```bash
  BASE_URL=https://www.slctrips.com pnpm exec playwright test tests/e2e/full-scale-qa-first-time-user.spec.ts
  ```
  Or against local: `pnpm exec playwright test tests/e2e/full-scale-qa-first-time-user.spec.ts`
- **Manual run:** Use this document as a checklist; clear site data first (Phase 0).

---

## QA Results / Follow-up (2026-02-02)

**Run:** First-time user, cache cleared. Phases 0–12 executed.

**Summary:** Landing, nav, content, auth, revenue paths (TripKit, Welcome Wagon, StayKits), affiliate links, cancel flow, unauthenticated redirect, mobile, SEO all passed. Vercel logs showed expected `[Stripe Checkout] 400: already_owned` for duplicate purchase.

**Non-critical follow-up:**

| Issue | Notes |
|-------|--------|
| **React hydration errors (#418, #423)** | **Addressed:** Footer uses stable `COPYRIGHT_YEAR`; TripKitViewer and welcome-wagon ShareButton/ClientOnlyShareButton use canonical URLs instead of `window.location` so server and client render the same. Re-run QA to confirm console is clear. |
| **Destination card images** | On `/destinations` list, card images show gray placeholders; consider lazy-load tuning or image source. |
| **Google Maps image proxy 403** | `/api/image-proxy` failed for Google Places photo (Vercel logs). Check proxy auth/headers or fallback. |
| **TripKit slug mismatch** | "Utah Unlocked" uses slug `meet-the-mt-olympians` instead of `utah-unlocked`; confirm if intentional (e.g. campaign slug). |

---

## Reference

- Revenue paths & APIs: `docs/REVENUE_LOCKDOWN.md`
- Checkout error codes: `invalid_body` | `auth_required` | `tripkit_id_required` | `already_owned` | `invalid_price` | `invalid_name`
- Fidelity check prompt: `docs/CLAUDE_CHROME_EXTENSION_BROWSER_FIDELITY_PROMPT.md`

*Last updated: 2026-02-02. First-time user, cache cleared.*
