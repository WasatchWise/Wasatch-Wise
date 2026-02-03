# SLC Trips Pre-Launch Diagnostic Checklist

**Building:** B002 Amusement Park (SLC Trips)  
**Purpose:** Verify purchase flow, delivery, and access before promoting TripKits.  
**Last Updated:** 2025-01-31

---

## 🚨 Systems Audit Findings (2025-01-31)

**Critical:** A live purchase-flow test found that **payment is not connected**. Clicking "Buy for $9.99" gives **instant full access** with no Stripe, no checkout, no account.

| What happened | Expected |
|---------------|----------|
| Click "Buy for $9.99" → instant access to TripKit | Click "Buy" → Stripe Checkout → Payment → Email → Access Code → View |
| URL: `/tripkits/coffee-culture-utah/view` | Checkout URL, then success page, then view |
| Access Code: DEMO-TK-025, Purchased by: preview@slctrips.com | Unique code + buyer email after payment |

**What works:** Product delivery, UI, progress tracking, Dan audio, navigation, Ask Dan concierge, print/PDF, access-code system. The missing piece is **one integration:** wire Stripe to the buy button and gate access on successful payment.

**Do not promote** until Stripe is connected. See [SYSTEMS_AUDIT_SUMMARY.md](SYSTEMS_AUDIT_SUMMARY.md) for consolidated action plan with Rock Salt.

---

## Swiss Cheese: SLC Trips (Audit List)

| Severity | Issue |
|----------|--------|
| 🔴 **Critical** | No payment gateway — Stripe not connected to buy buttons |
| 🔴 **Critical** | No user accounts (or email-based access) for post-purchase access |
| 🔴 **Critical** | Demo mode live — production gives away paid TripKits |
| 🟡 Medium | No purchase confirmation email |
| 🟡 Medium | No "My TripKits" page (where purchased guides live) |
| 🟡 Medium | No login system for accessing purchased content later |
| 🟡 Medium | "Give as Gift" button does nothing |
| 🟢 Minor | Map view "Coming Soon" (document it) |
| 🟢 Minor | Some Dan audio stories missing per destination |
| 🟢 Minor | No self-service refund flow (policy exists) |

---

## B002 Stripe: Code Audit (Repo Check)

**Finding:** The SLC Trips app **already has** Stripe integration in the mono-repo (`apps/slctrips/`):

| Piece | Location | Status |
|-------|----------|--------|
| Buy button | `TripKitPurchaseButton.tsx` | Calls `/api/stripe/create-checkout`, redirects to Stripe when logged in; free TripKits go straight to view |
| Create checkout | `src/app/api/stripe/create-checkout/route.ts` | Creates Stripe Checkout session |
| Webhook | `src/app/api/webhooks/stripe/route.ts` | `checkout.session.completed` → purchases, tripkit_access_codes, customer_product_access |
| View gating | `src/app/tripkits/[slug]/view/page.tsx` | Paid TripKits require `customer_product_access`; no access → "Access Required" |
| Success | `CheckoutSuccessContent`, `/checkout/success` | Session lookup, redirect to TripKit |

**Flow:** Logged-in user clicks "Buy for $X" → POST `/api/stripe/create-checkout` → redirect to Stripe → payment → webhook inserts purchase + access → user can open `/tripkits/[slug]/view` (gated by customer_product_access). Free TripKits: product page has "Start Exploring Now" link straight to view (no checkout).

**Why the audit saw “instant access”:** Possible causes: (1) Auditor clicked a **free** TripKit’s “Start Exploring Now” (goes to view without payment). (2) **Not logged in** — TripKitPurchaseButton shows “Please sign in” and redirects to signin; if they went to view by another route (e.g. direct URL), view may still gate paid TripKits. (3) **Env** — `STRIPE_SECRET_KEY` or webhook secret missing in env so create-checkout fails; need to verify production env. (4) **View gating bug** — e.g. TripKit marked `freemium` or `price === 0` in DB so view doesn’t require access.

**Verify (don’t assume):** (1) Production env has `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. (2) Open Coffee Culture product page **incognito** → click "Buy for $9.99" → expect "Please sign in" or redirect to signin. (3) Log in → click "Buy for $9.99" → expect redirect to Stripe Checkout (not to view). (4) After test purchase, expect confirmation/email and access to view; no DEMO-TK-* for that purchase.

**Conclusion:** You are **not** in scenario (C) “code not written.” You are in **scenario (A)** with a potential **environment configuration** issue. The fix is likely env, DB (Coffee Culture status), or which entry point was tested — not a rebuild.

---

## Scenario (A): Env/Config Uncertainty

**You don’t have architecture paralysis or code paralysis. You have environment configuration uncertainty.**

The code exists. The system is built. The gauge can move. You need to verify the “batteries are in the remote”: env vars, DB row for Coffee Culture, Stripe webhook.

---

## Why the Audit Saw Instant Access (Three Theories)

| Theory | What happened | How to confirm |
|--------|----------------|----------------|
| **1. Wrong TripKit** | Auditor hit a **free** TripKit (e.g. Utah Unlocked TK-000) — “Start Exploring Now” goes straight to view. | Confirm they tested `/tripkits/coffee-culture-utah` (paid), not a free slug. |
| **2. Env missing** | `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` not set in deployment → create-checkout fails → app may surface error or fallback. | Check production env in Vercel/hosting dashboard. |
| **3. Not logged in + other route** | Buy button shows “Please sign in”; auditor may have used a direct link to view. Paid view should still show “Access Required” if no customer_product_access. | Test incognito: Buy → sign-in; direct `/tripkits/coffee-culture-utah/view` → “Access Required” if no purchase. |

---

## Where DEMO-TK-025 and preview@slctrips.com Come From

**Code:** `apps/slctrips/src/app/tripkits/[slug]/view/page.tsx` (lines 166–168):

```ts
let accessCode = `DEMO-${tk.code}`;
let customerEmail = 'preview@slctrips.com';
```

These are **default display values** for **non–TK-000** TripKits. They are only overridden for TK-000 when `searchParams.access` is set (then we read from `tripkit_access_codes`). For paid TripKits (non–TK-000), the view page **does not** replace these with the buyer’s access code/email in the UI — it only **gates** access via `customer_product_access`. So:

- **Seeing DEMO-TK-025 in the viewer does not mean “payment was bypassed.”** It means the viewer is showing and the displayed “Access Code” / “Purchased by” use the default placeholders.
- **Real gate:** For paid TripKits, `hasAccess` (row in `customer_product_access`) must be true; otherwise the page shows “Access Required.”

So the auditor could have seen DEMO-TK-025 because: (1) They had access (test purchase or seed data) and the UI showed the default label, or (2) They hit a **free** TripKit (price = 0 or status = freemium), so the paid gate was skipped and they reached view with the default display values.

---

## Critical Test (Run This)

**1. Production environment**

- Where is SLC Trips deployed? (e.g. Vercel / Railway / Netlify)
- In that dashboard, confirm:
  - `STRIPE_SECRET_KEY` (starts with `sk_live_` or `sk_test_`)
  - `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` if the app uses it
- If any are missing → add from Stripe Dashboard and redeploy.

**2. Coffee Culture in the database**

```sql
SELECT slug, title, price, status, tier
FROM tripkits
WHERE slug = 'coffee-culture-utah';
```

- **Expected:** `price = 9.99`, `status` = active (not `freemium`), paid tier.
- If `status = 'freemium'` or `price = 0` → that explains free access; set to paid and correct price.

**3. Stripe Dashboard**

- Developers → Webhooks: endpoint for your domain exists, listens for `checkout.session.completed`, signing secret matches `STRIPE_WEBHOOK_SECRET`.
- Check for recent checkout sessions and any failed webhook events.

**4. End-to-end purchase test (incognito)**

1. Open `/tripkits/coffee-culture-utah`.
2. Click “Buy for $9.99” → expect “Please sign in” or redirect to auth.
3. Sign in (real or test account, not preview@slctrips.com).
4. Click “Buy for $9.99” again → expect redirect to **Stripe Checkout** (stripe.com), not to view.
5. Pay with test card `4242 4242 4242 4242`.
6. Expect redirect to success page and (if implemented) confirmation email with access link.
7. Open `/tripkits/coffee-culture-utah/view` (or link from email) → expect TripKit content. UI may still show “DEMO-TK-025” / “preview@slctrips.com” as labels; what matters is access is granted after payment.

If step 4 doesn’t redirect to Stripe → env or create-checkout issue (check Network tab and server logs).  
If step 6/7 fail → webhook or DB issue (check Stripe webhook logs and `customer_product_access`).

---

## Actual Purchase Flow (Paid TripKits)

1. User clicks “Buy for $9.99” (TripKitPurchaseButton).  
2. If not logged in → “Please sign in” and redirect to auth.  
3. If logged in → POST `/api/stripe/create-checkout`.  
4. API creates Stripe Checkout session (metadata: tripkit, building_id, campaign; success_url / cancel_url).  
5. User redirected to Stripe Checkout.  
6. User pays with card.  
7. Stripe sends `checkout.session.completed` to webhook.  
8. Webhook creates purchase, tripkit_access_codes (if used), and **customer_product_access**.  
9. User redirected to success page.  
10. Success page shows access link to `/tripkits/[slug]/view`.  
11. View page checks **customer_product_access** → if present, show content; if not, show “Access Required.”

**Free TripKits:** Product page shows “Start Exploring Now” → link goes straight to `/tripkits/[slug]/view` (no checkout).

---

## Weekend Plan (Config, Not Rebuild)

| When | Task |
|------|------|
| **Friday** | (1) Check production env (Stripe keys). (2) Check DB: Coffee Culture price and status. (3) Check Stripe webhook endpoint and signing secret. (4) One test purchase in incognito. |
| **Saturday AM** | If Friday passed: run full 11-step test. If Friday failed: fix the failing piece (env / DB / webhook) and retry. |
| **Saturday PM** | Once test purchase works: one TikTok (“First 10 buyers get 50% off”), Stripe coupon or manual refund, watch dashboard and fix issues. |
| **Sunday** | If 10 test purchases worked: proof B002 revenue pipe works; update city_metrics or screenshot Stripe; plan next week. If not: document what broke and fix before scaling. |

**Implication:** This is a **config fix** (env, DB, webhook), not a code rebuild. ~30 minutes of verification and config, not 30 hours of coding.

---

## Revised Question (Step 1)

Run **Step 1 (Critical Test)** and note:

1. Where is SLC Trips deployed? (Vercel / Railway / Netlify / other)  
2. Do the Stripe env vars exist there?  
3. What does Coffee Culture show in the DB for `price` and `status`?

If the answers are: **Vercel**, **No (missing vars)**, **status = freemium** → weekend fix is: add env vars, set Coffee Culture to paid, test one purchase, then launch beta.

---

## The Missing Link (What to Build)

**Current:** Click "Buy" → Instant access (demo mode) **if** the auditor hit a path that bypasses checkout (e.g. free TripKit link or direct view URL). For **paid** flow with login, code path is: Buy → create-checkout → Stripe → webhook → access.

**Needed (if still broken):** Ensure Click "Buy" → **Stripe Checkout** → Payment → **Confirmation email** with access link → **Access code** / customer_product_access → View (gated). If create-checkout or webhook fail (env, keys, RLS), fix those; do not rewrite the flow from scratch.

---

## Post-Fix Test Flow (11 Steps)

After Stripe is wired, run this in **incognito / private** browser:

1. [ ] Go to cheapest TripKit (e.g. Coffee Culture $9.99).
2. [ ] Click "Buy for $9.99".
3. [ ] **Expect:** Stripe checkout modal or redirect.
4. [ ] Complete purchase with test card `4242 4242 4242 4242`.
5. [ ] **Expect:** Confirmation email with access link.
6. [ ] Click access link in email.
7. [ ] **Expect:** TripKit unlocked; unique access code shown.
8. [ ] Log out (or close session).
9. [ ] Return later; log back in (or use same email/link).
10. [ ] **Expect:** Still have access to purchased TripKit.
11. [ ] **Expect:** Access granted. (UI may still show "DEMO-TK-*" / "preview@slctrips.com" as display placeholders for non–TK-000; what matters is access is granted after payment.)

All 11 must pass before promoting.

---

## Launch Philosophy: Minimum Viable Purchase

**Not "minimum viable product" — minimum viable purchase.**  
The product is already viable. The gate: **Can someone give you money and receive value?**

**The only checklist that matters:**

1. ✅ Can they **find the buy button**?
2. ✅ Does **Stripe take their money**?
3. ✅ Do they **immediately get access**?
4. ✅ Is the **TripKit content actually there**?
5. ✅ Can they **log back in later**?

Everything else is optimization. "Perfect" is the enemy of revenue.

---

## Automation Hierarchy (Solo Operator)

| Layer | Requirement | Status |
|-------|-------------|--------|
| Payment | Automatic (Stripe) | Verify |
| Delivery | Automatic (post-purchase) | Verify |
| Access | Automatic (auth / gated content) | Verify |
| Support | Manual (email) | OK |
| Updates | Batched (e.g. quarterly) | OK |

You don't need zero Swiss cheese. You need to **know where the holes are** so you can fix them while collecting revenue.

---

## Pre-Launch Diagnostic (Run This Before Promoting)

Use this as a step-by-step test. Check each box when done; note any failure and fix before moving on.

### 1. Purchase Flow (Stopping Before Payment)

- [ ] Go to slctrips.com (or TripKit product page).
- [ ] Find a TripKit (e.g. Coffee Culture $9.99 or Utah Unlocked free).
- [ ] Click buy / add to cart / checkout.
- [ ] Proceed to Stripe Checkout (or payment step).
- [ ] **Do not complete payment yet.** Confirm: form loads, amount correct, no broken layout.
- [ ] Note: URL of checkout, any errors or confusing copy.

**Pass:** User can reach payment step without errors.  
**Fail:** Broken link, wrong price, missing button, 404, or unclear CTA.

---

### 2. Stripe Integration

- [ ] Complete one **test** purchase (Stripe test card `4242 4242 4242 4242`).
- [ ] Confirm Stripe Dashboard shows the payment (test mode).
- [ ] Confirm webhook (if used) fires — e.g. n8n Stripe workflow or app webhook.
- [ ] If live mode: Confirm live key is correct; confirm webhook signing secret matches.

**Pass:** Payment appears in Stripe; no webhook errors.  
**Fail:** Payment fails, no event in Stripe, or webhook 4xx/5xx.

---

### 3. Delivery (Post-Purchase)

- [ ] After test purchase: Does the user see a **success** or **thank you** page?
- [ ] Is access **immediate**? (e.g. "Download your TripKit," link to PDF, or "Access your guide").
- [ ] Open the delivered asset (PDF, page, link). Is content present and correct for that TripKit?
- [ ] If email delivery: Check inbox (and spam); link works.

**Pass:** User gets clear confirmation and can open the TripKit content.  
**Fail:** No confirmation, broken link, wrong product, or empty file.

---

### 4. Authentication / Access

- [ ] If login required to purchase: Create account (or guest checkout). Complete flow.
- [ ] If login required to access: Log in after purchase. Can you see the purchased TripKit?
- [ ] Log out. Log back in. Confirm purchased content is still accessible.
- [ ] Password reset (if applicable): Request reset, use link, set new password, log in.

**Pass:** User can create account, purchase, access content, and log back in later.  
**Fail:** Can't sign up, can't access after purchase, or session/access lost on re-login.

---

### 5. User Experience (Swiss Cheese Audit)

- [ ] **Mobile:** Run steps 1–4 on a phone (or responsive view). Any layout or tap issues?
- [ ] **Clear CTA:** Is it obvious what to click to buy? Any competing or confusing buttons?
- [ ] **Errors:** Intentionally trigger an error (e.g. card decline). Is the message clear and recoverable?
- [ ] **TripKit list:** Are all products listed correctly (name, price, short description)?

**Pass:** No major friction on mobile; CTAs clear; errors understandable.  
**Fail:** Broken mobile flow, ambiguous CTAs, or cryptic errors.

---

## Controlled Soft Launch (3 Phases)

Use this after the diagnostic passes.

### Phase 1: 10-Customer Beta (This Week)

- One TikTok: "I need 10 brave souls to test my new TripKit. First 10 to comment get 50% off. Help me break things before launch."
- Goal: 10 purchases; immediate feedback on what breaks.
- Outcome: Fix list + testimonials for real launch.
- Risk: ~$65 in discounts. Upside: Confidence.

### Phase 2: Pay What You Want (48 Hours)

- After Phase 1 fixes: "Name your price. $1 or $100, I don't care. Just tell me if it works."
- Removes price anxiety; builds goodwill; proves delivery.

### Phase 3: Tiered Confidence Launch

- Start with lowest-price TripKit (e.g. Coffee Culture $9.99).
- If that flows smoothly, add mid-tier, then higher (e.g. $24.99).
- Each tier = more confidence before full promotion.

---

## Fears Addressed (Quick Reference)

| Fear | Response |
|------|----------|
| "They can't buy it" | Run Diagnostic §1–2. Fix checkout and Stripe. |
| "Website doesn't work" | Run §1 and §5. Fix broken links and mobile. |
| "Stripe isn't set up" | Run §2. Confirm test/live mode and webhooks. |
| "It doesn't work correctly" | Define v1: payment + delivery + access. Run §3–4. |
| "Auth/login issues" | Run §4. Fix signup, post-purchase access, re-login. |
| "Not worth the price" | 337K viral views = proof of value. Price per destination is tiny. |
| "Not good" | Content is proven (videos). Packaging can iterate. |
| "I screw something up" | Phase 1 beta finds screw-ups with 10 users, not 5.5K. |

---

## What to Do Next

1. **Run the Pre-Launch Diagnostic** (sections 1–5) and check every box or document every fail.
2. **Fix any fails** before promoting to @slctrips followers.
3. **Option A:** Have someone (e.g. AI-assisted) walk through a full purchase and document each step.
4. **Option B:** Walk through the checklist yourself and note friction points.
5. **Option C:** Fix the single biggest fear first (e.g. "Delivery" or "Auth"), then re-run that part of the diagnostic.

After the diagnostic passes, use Phase 1 (10-customer beta) to validate with real buyers before scaling promotion.

See [SLCTRIPS_TIKTOK_ANALYSIS.md](SLCTRIPS_TIKTOK_ANALYSIS.md) for content strategy and [MEDIA_AND_ADVERTISING_SECTOR.md](MEDIA_AND_ADVERTISING_SECTOR.md) for TikTok-as-launcher context.
