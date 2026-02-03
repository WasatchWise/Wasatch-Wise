# Pre-Launch Deployment Checklist

**TheRockSalt.com – Spider Network Launch**  
Use this checklist before inviting users. Complete each section in order.

---

## 1. Environment Variables

Verify in **Vercel** → Project → Settings → Environment Variables (Production + Preview).

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | e.g. `https://yznquvzzqrvjafdfczak.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | From Supabase Dashboard → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-side only; never expose to client |
| `STRIPE_SECRET_KEY` | If using payments | Use live key for production |
| `STRIPE_WEBHOOK_SECRET` | If using payments | From Stripe → Webhooks → Signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | If using payments | Live key for production |
| `CRON_SECRET` | If using event sync | Random string for cron auth |

**Quick test:** Deploy a preview; confirm app loads and auth works (sign in/sign out).

---

## 2. Database Migrations

Confirm all migrations are applied on the **production** Supabase project.

**Spider Rider + Venue Capability migrations (required for launch):**

- `20260201_spider_rider_publication_fields.sql` – rider_code, pdf_storage_path, sha256_hash, generate_spider_rider_code
- `20260202_venue_capabilities.sql` – venue capability columns

**How to verify:**

1. Supabase Dashboard → SQL Editor → run:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'spider_riders' AND column_name IN ('rider_code','pdf_storage_path','sha256_hash');
   ```
   Expect 3 rows.

2. Same for venues:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'venues' AND column_name IN ('typical_guarantee_min','profile_updated_at');
   ```
   Expect 2 rows.

If columns are missing, run the migration files manually in SQL Editor (see conversation history for manual run instructions).

---

## 3. Supabase Policies & RLS

- **Auth:** Sign-up/sign-in works for production URL (e.g. therocksalt.com).
- **Bands:** Users can create/claim bands; RLS restricts to own rows.
- **Venues:** Users can claim venues; RLS restricts to claimed_by.
- **Spider Riders:** Bands can create/update own riders; published riders readable by authenticated users.
- **Spider Rider PDFs:** `contracts` bucket – service role can upload; authenticated users can read paths under `riders/` (or use signed URLs via your download API).

**Quick test:** As a test user, claim a band, create a rider, publish, download PDF. As another user, claim a venue, open Capabilities tab, save profile.

---

## 4. Storage Buckets

| Bucket | Purpose | Policies |
|--------|---------|----------|
| `contracts` | Rider PDFs | Upload: service role (or authenticated with path check). Read: via app API that generates signed URLs (e.g. `/api/spider-rider/[id]/download`). |

**Verify:** Publish a rider → confirm PDF appears in Storage → confirm Download PDF works on success page and public rider page.

---

## 5. Error Monitoring

- **Vercel:** Check Deployment → Functions for runtime errors.
- **Optional:** Add Sentry (or similar) for client and server errors; add `SENTRY_DSN` to env.

**Pre-launch:** Trigger one known error (e.g. invalid route) and confirm it appears in logs or Sentry.

---

## 6. Analytics / Tracking

- **Minimum:** Vercel Analytics (if enabled) for page views.
- **Optional:** Add custom events for: Rider Published, Venue Profile Saved, Compatibility View, Accept Rider (when built).
- **Privacy:** Ensure any tracking is disclosed (e.g. in privacy policy or footer).

---

## 7. Critical User Flows (Smoke Test)

Run once on **production** (or production-like) URL:

1. **Artist**
   - Sign up / Sign in  
   - Claim or create band  
   - Create Spider Rider (all 5 steps)  
   - Publish → see success page, rider code, Download PDF  
   - Open public rider page → Download Rider PDF  

2. **Venue**
   - Sign up / Sign in  
   - Claim venue  
   - Open Capabilities tab → complete wizard → Save Draft on step 1 → Save Profile on Review  
   - Overview tab → see Profile Completeness  
   - Browse `/book/spider-riders` → see compatibility badges/filters (if signed in as venue owner)  

3. **Compatibility**
   - As venue owner: open a rider detail page → see compatibility breakdown  
   - As band owner: open band dashboard → see Compatible Venues (if rider published)  

---

## 8. Go/No-Go

- [ ] All required env vars set in production  
- [ ] Migrations applied (spider rider + venue capabilities)  
- [ ] RLS and storage tested with real auth  
- [ ] Rider publish → PDF upload + download works  
- [ ] Venue capability wizard saves and shows completeness  
- [ ] Compatibility badges/filters work on browse page  
- [ ] No critical errors in Vercel (or Sentry) for smoke flows  

**Signed off:** ___________________ **Date:** ___________

---

*Next: [USER_RECRUITMENT.md](./USER_RECRUITMENT.md) for who to invite and how.*
