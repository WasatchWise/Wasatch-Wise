# Deploy Checklist -- Digitization Launch

Before deploying, complete these steps.

## Critical: Audit Fixes

Per `DELIVERABLE_AUDIT_REPORT.md`, all three critical issues have been resolved:

- [x] **District count** -- Confirmed 41 districts + 116 charters = 157 LEAs. Web pages updated. PDFs pending regeneration (see `PDF_CORRECTION_INSTRUCTIONS.md`).
- [x] **Timeline story** -- Confirmed 6-year statewide transformation (8% to 92%). Web pages updated. PDFs pending regeneration.
- [x] **Three statistics** -- Sourced replacements identified. PDFs pending regeneration.

**Remaining PDF work:** Regenerate PDFs using `PDF_CORRECTION_INSTRUCTIONS.md`, then re-copy to `public/downloads/` and Supabase Storage.

## Files Copied (Done)

All 7 PDFs copied to `apps/dashboard/public/downloads/`:

- [x] `WasatchWise_DAROS_Briefing_Proposal.pdf` -> `daros/`
- [x] `WasatchWise_DAROS_OnePager.pdf` -> `daros/`
- [x] `WasatchWise_DAROS_Pricing_Sheet.pdf` -> `daros/`
- [x] `WasatchWise_Case_Study_Utah_K12_Compliance.pdf` -> `case-studies/`
- [x] `AI_Policy_Template_School_Districts.pdf` -> `starter-kit/`
- [x] `Board_Presentation_Template.pdf` -> `starter-kit/`
- [x] `Vendor_Vetting_Checklist.pdf` -> `starter-kit/`

**Note:** These are the pre-correction PDFs. After regeneration with corrected content, re-copy.

## Stripe (Manual - John)

- [ ] Create products in Stripe Dashboard: Starter Kit $79, Prompt Rescue Kit $47, AI Foundations $497
- [ ] Set `STRIPE_STARTER_KIT_PRICE_ID` (optional; ad-hoc price works without it)
- [ ] Register webhook: `https://www.wasatchwise.com/api/stripe/webhook`
- [ ] Add events: `checkout.session.completed`

## Environment Variables (Vercel - Manual)

- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using client-side)
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.wasatchwise.com`
- [ ] `RESEND_API_KEY`
- [ ] `LEAD_ROUTER_WEBHOOK_URL` (N8N)

## Supabase Storage (Manual)

- [ ] Confirm bucket `starter-kit-files` exists (migration should have created it)
- [ ] Upload 3 Starter Kit PDFs to `starter-kit-files` bucket (AI Policy Template, Vendor Checklist, Board Presentation)

## Resend Email Templates (Manual)

- [ ] Starter Kit purchase confirmation (with download links)
- [ ] DAROS lead capture auto-response (with proposal PDF attached)
- [ ] AAA free preview welcome (optional)

## Booking Link (Manual)

- [ ] Set up Cal.com or Calendly booking page for DAROS consultations
- [ ] Set `NEXT_PUBLIC_BOOKING_URL` env var

## Deploy

```bash
git add -A && git commit -m "Launch Starter Kit, DAROS page, Course landing page, Case Study"
git push origin main
```

Vercel auto-deploys from main.

## Post-Deploy Verification

- [ ] Visit /starter-kit -- page loads, CTA works
- [ ] Visit /daros -- page loads, lead form submits
- [ ] Visit /case-studies/utah-k12-compliance -- page loads, numbers show 157 / 6 years
- [ ] Visit /adult-ai-academy/courses/ai-foundations -- page loads, email gate works
- [ ] Visit /pricing -- digital products section shows
- [ ] Test Stripe checkout flow (use test mode)
- [ ] Verify Resend emails fire on purchase and lead capture
- [ ] Check blog posts have footer CTAs
