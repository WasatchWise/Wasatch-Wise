# SLC Trips – Revenue Lockdown

**Reference for payments and fulfillment.** Stripe webhook and env are already configured; this doc is for verification, debugging, and onboarding—not starting over.

---

## 1. Stripe webhook (already configured)

**Canonical handler:** `POST /api/webhooks/stripe` — this is where fulfillment runs (you already have this in Stripe + env).

- **Reference:** Endpoint URL in Stripe should be `https://<your-production-domain>/api/webhooks/stripe`. Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`.
- **Note:** `/api/stripe/webhook` is deprecated for checkout; only `/api/webhooks/stripe` does purchases, access, and confirmation emails. If both were ever registered, only the canonical one should be used for checkout.

**What the canonical webhook does:**

| Product       | Records purchase | Grants access | Access code (TripKit) | Confirmation email |
|---------------|------------------|---------------|------------------------|---------------------|
| TripKit       | ✅ `purchases`   | ✅ `customer_product_access` | ✅ `tripkit_access_codes` | ✅ SendGrid |
| Welcome Wagon | —                | ✅ `customer_product_access` | —                    | ✅ SendGrid |
| StayKit       | —                | ✅ `customer_product_access` | —                    | ✅ SendGrid |

---

## 2. Environment variables (reference)

Already set in your environment; listed here for reference and debugging.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Webhook + checkout server-side DB (RLS bypass) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe API (checkout sessions) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe.js on frontend |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Webhook signature verification (from Stripe Dashboard) |
| `SENDGRID_API_KEY` | ✅ | Purchase confirmation emails |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Success URLs, access links, emails (e.g. `https://slctrips.com`) |

**Affiliate (optional but revenue-relevant):**

| Variable | Purpose |
|---------|---------|
| `NEXT_PUBLIC_AWIN_AFFILIATE_ID` | AWIN publisher ID (Booking, Sitpack, etc.); fallback in code: `2060961` |
| `AMAZON_AFFILIATE_TAG` | Amazon Associates tag; fallback: `wasatchwise20-20` |
| `AWIN_SITPACK_MERCHANT_ID` | Sitpack via AWIN (when set) |
| `AWIN_FLEXTAIL_MERCHANT_ID` | FLEXTAIL via AWIN (when set) |
| `AWIN_VSGO_MERCHANT_ID` | VSGO via AWIN (when set) |
| `AWIN_GOWITHGUIDE_MERCHANT_ID` | GoWithGuide via AWIN (when set) |
| `VIATOR_API_KEY` | Viator affiliate (when set) |

---

## 3. Checkout entry points (no duplicates)

| Flow | Frontend | API | Auth |
|------|----------|-----|------|
| **TripKit (main)** | `TripKitPurchaseButton`, `PurchaseTripKitButton` | `POST /api/stripe/create-checkout` | Required (401 if not logged in) |
| **TripKit or Welcome Wagon (unified)** | `BuyNowButton`, Welcome Wagon page | `POST /api/checkout` | Optional (guest checkout supported) |
| **Welcome Wagon** | `welcome-wagon/page.tsx` | `POST /api/checkout` (body: `productType: 'welcome-wagon'`) | Optional |
| **StayKit** | `staykits/page.tsx` | `POST /api/staykit/create-checkout` | Required |
| **Gift** | `GiftPurchaseButton` | `POST /api/stripe/create-gift-checkout` | Optional |

All create a Stripe Checkout Session and redirect to Stripe; after payment, Stripe sends `checkout.session.completed` to **`/api/webhooks/stripe`**, which fulfills (access + email).

---

## 4. Post-purchase experience

- **Success page:** `/checkout/success?session_id={CHECKOUT_SESSION_ID}`  
  - Polls `GET /api/purchases/by-session?session_id=...` for TripKit access code (from `tripkit_access_codes`).  
  - Webhook must run first (writes the access code). Polling uses short delays; if webhook is slow, user can use the link in the email.
- **Cancel page:** `/checkout/cancel` (no charge).
- **TripKit access by code:** `/tk/{accessCode}` (code from email or success page).
- **Welcome Wagon access:** `/welcome-wagon/access` (after login/link from email).
- **StayKit access:** `/my-staykit` (after login; access granted by webhook).

---

## 5. Verification (when debugging or after a change)

- **Stripe:** Webhook points at `https://<domain>/api/webhooks/stripe`; signing secret in `STRIPE_WEBHOOK_SECRET`.
- **Test purchase (TripKit):** Paid TripKit → Checkout → test card → success page + email; rows in `purchases`, `customer_product_access`, `tripkit_access_codes`.
- **Test purchase (Welcome Wagon):** Welcome Wagon → checkout → pay → email + `/welcome-wagon/access`.
- **Test purchase (StayKit):** `/staykits` (logged in) → checkout → pay → `/my-staykit` + confirmation email.
- **Affiliate links:** Key CTAs use correct affiliate IDs (no broken fallbacks).

---

## 6. Code reference

| Concern | Location |
|---------|----------|
| Stripe config & pricing | `src/lib/stripe-config.ts` |
| Canonical webhook | `src/app/api/webhooks/stripe/route.ts` |
| Unified checkout (TripKit + Welcome Wagon) | `src/app/api/checkout/route.ts` |
| TripKit-only checkout (auth required) | `src/app/api/stripe/create-checkout/route.ts` |
| StayKit checkout | `src/app/api/staykit/create-checkout/route.ts` |
| Gift checkout | `src/app/api/stripe/create-gift-checkout/route.ts` |
| Success page polling | `src/app/api/purchases/by-session/route.ts` |
| Affiliate links | `src/lib/affiliates.ts` |
| Deprecated webhook (do not use for checkout) | `src/app/api/stripe/webhook/route.ts` |

---

## 7. If something breaks

1. **Stripe Dashboard → Webhooks:** Check recent events for the endpoint; look for 4xx/5xx or “not sent”.
2. **Logs:** Check Vercel (or host) logs for `/api/webhooks/stripe` (signature failure, DB errors, SendGrid errors).
3. **DB:** Confirm `purchases`, `customer_product_access`, `tripkit_access_codes` (for TripKit) after a test payment.
4. **Email:** If confirmation not received, verify `SENDGRID_API_KEY` and sender (e.g. `dan@slctrips.com`) and check SendGrid activity.

---

*Last updated: 2026-02-02. Reference only—Stripe + env already configured.*
