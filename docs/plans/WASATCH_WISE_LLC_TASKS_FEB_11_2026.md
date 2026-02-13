# Wasatch Wise LLC — TASKS for February 11, 2026

**Reference:** Comprehensive Corporate Strategic Plan (Feb 9, 2026)  
**Context:** Wednesday, Feb 11, 2026. Revised plan and verification report reflect ~3 days ahead of original Week 1–2 schedule.

**Status as of end of Feb 11:** Wed checklist is complete except operations (email/Resend, optional security PRs). Both blog posts expanded to ~1,200 words and pushed; Blog Post #1 **published**; GA4 debug removed; johnlyman.net audit done (results in checklist; only remaining item is adding a prominent WasatchWise CTA on that site). All commits pushed to `main`; Vercel will have latest.

**Additional Feb 11 accomplishments (evening session):**
- Sabrina Matrix first-visit modals implemented for all 3 brand entry points (`c625bcd`)
- AAA logo in header by route + ABYA logo in Brands dropdown (`96bea76`)
- AAA logo flicker fix on `/adult-ai-academy` (`4f495a4`)
- Adult AI Academy page: slate palette, in-person seminar section, Facebook event link (`51bf9a0`)
- WiseBot: Claude AI integration and audit analysis (`66c14b1`)
- MDX blog system with RSS feed for content pipeline (`f10f10c`)
- Blog Post #1 ("5 Questions Superintendents Must Ask Before AI") published (`28ffa4e`)
- Rock Salt: event duplication fix, ingest-events fixes (`bf36779`, `0e46ab1`, `15529d7`, `b501961`)
- n8n RSS-to-social workflow added (`9de774b`)

---

## Where We Are vs. the 2/9 Report

### Completed (aligned with 2/9 Plan)

| 2/9 Plan Item | Status as of Feb 11 |
|---------------|---------------------|
| **GA4 data streams** | ✅ Env vars set in Vercel for wasatchwise + askbeforeyouapp; tracking verified via phone test (Realtime: page_view, session_start). |
| **Cloudflare Web Analytics** | ✅ Enabled on wasatchwise.com (askbeforeyouapp.com not in Cloudflare account used). |
| **Pipeline IQ decision** | ✅ Done (Feb 10): Maintenance mode — no fix, no sunset; manual workflow only. |
| **AI Co-Founder + Week 1 outlines** | ✅ Three outlines in `docs/content/WEEK1_BLOG_OUTLINES.md`; all ready for draft. |
| **Content calendar / execution schedule** | ✅ `docs/EXECUTION_SCHEDULE_2026.md`; week-by-week through Phase 5. |
| **Monday Corporate Briefing template** | ✅ `docs/MONDAY_CORPORATE_BRIEFING_TEMPLATE.md`. |
| **Adult AI Academy** | ✅ Ahead of plan — full app (synthesis, library, pilot, HeyGen, Supabase). |
| **Blog post #1 (5 Questions…)** | ✅ **Published.** Expanded to ~1,181 words; MDX blog system built; committed and pushed (`28ffa4e`). |
| **Blog post #2 (FERPA vs. COPPA)** | ✅ Expanded to ~1,200 words; WiseBot SDPC CTA; in repo and pushed. Ready to publish. |
| **MDX blog system + RSS** | ✅ Full blog infrastructure built with RSS feed for content pipeline (`f10f10c`). |
| **Sabrina Matrix first-visit modals** | ✅ One welcome modal per brand entry point (WasatchWise, AAA, ABYA). sessionStorage-based, one per session (`c625bcd`). |
| **Brand nav: AAA logo by route** | ✅ AAA logo shows in header when on `/adult-ai-academy`; ABYA in Brands dropdown; flicker fix applied (`96bea76`, `4f495a4`). |
| **AAA page: slate palette + events** | ✅ Bluish-gray (slate) palette, in-person seminar section, Facebook event link added (`51bf9a0`). Brand Positioning doc updated with AAA visual identity. |
| **WiseBot Claude integration** | ✅ Claude AI integration for audit analysis (`66c14b1`). |
| **n8n RSS-to-social workflow** | ✅ Workflow added for blog → social pipeline (`9de774b`). |
| **Rock Salt bug fixes** | ✅ Event duplication fix, ingest-events serialization/venue fixes (`bf36779`, `0e46ab1`, `15529d7`, `b501961`). |
| **GA4 debug flag** | ✅ Removed from Vercel (user). |
| **johnlyman.net audit** | ✅ Completed (another agent). Results in `docs/JOHNLYMAN_NET_AUDIT_CHECKLIST.md`. Sections + 150+ districts verified; no broken links. Only gap: add prominent WasatchWise CTA on johnlyman.net homepage (site is external). |

### Remaining from 2/9 Week 1–2 / Revised Plan

- ~~**Publish** Blog Post #1~~ ✅ Published (`28ffa4e`).
- **Publish Blog Post #2** (FERPA vs. COPPA) — drafted and ready; go live when you choose.
- **johnlyman.net:** Add prominent WasatchWise CTA on homepage (e.g. "Consulting with school districts? Learn about WasatchWise →") — change is on that site, not this repo.
- Email: confirm Resend as single sender; document SendGrid status if still in use.
- Optional: GitHub security PRs (dashboard + ask-before-you-app); add askbeforeyouapp.com to Cloudflare if desired.
- **Untracked in repo:** `apps/dashboard/app/api/generate-social-copy/` — add and commit when ready.

---

## Tasks — Wednesday, February 11, 2026

### Clean-up

- [x] **Remove GA4 debug flag** — Vercel → wasatchwise project → Settings → Environment Variables → delete `NEXT_PUBLIC_GA_DEBUG` (or set to `false`) → redeploy. *(Done; tracking verified.)*

### Content

- [x] **Blog Post #1** — Expanded to ~1,200 words; in repo and pushed. File: `apps/dashboard/content/blog/5-questions-superintendents-must-ask-before-ai.mdx`. *Next: publish when ready.*
- [x] **Blog Post #2** — Expanded to ~1,200 words; WiseBot SDPC CTA. File: `apps/dashboard/content/blog/ferpa-vs-coppa-ai-in-schools.mdx`. *Next: publish when ready.*

### Credibility / Marketing

- [x] **johnlyman.net audit** — Completed. Checklist run; results in `docs/JOHNLYMAN_NET_AUDIT_CHECKLIST.md`. Links good; 150+ districts verified. *Remaining (on johnlyman.net): add prominent WasatchWise CTA on homepage.*

### Operations (if time)

- [ ] **Email** — Confirm Resend is the single sender for contact/quiz/audit; if SendGrid still used, export contacts/templates and document decision (keep vs. migrate).
- [ ] **Optional:** Close or merge GitHub security PRs on dashboard and ask-before-you-app.

---

## This Week (Feb 11–13) — Summary

| Day | Focus |
|-----|--------|
| **Wed Feb 11** | Debug flag off; Post #1 publish or expand; start Post #2; johnlyman.net audit. |
| **Thu Feb 12** | Post #2 draft (or finish); email/Resend confirmation. |
| **Fri Feb 13** | Week 1 checkpoint: both posts ready or published; any remaining P0 from 2/9 done. |

---

## Next Week (Feb 16+) — From 2/9 Plan

- **Monday Feb 16:** First Monday Corporate Briefing (use template); AI Co-Founder generates 3 outlines for Weeks 3–4; select 2 for the week.
- **Tue/Thu:** Publish 2 posts (or the 2 from this week).
- **Wed:** Google Apps Script welcome sequence or finalize Resend for newsletter.
- **Fri:** Week 2 review; migrate subscribers if moving off SendGrid; sunset SendGrid if applicable.

---

## Phase 4 backlog — Adult AI Academy (when ready)

Architecture: **Option B** — AAA blog + portal in dashboard under `/adult-ai-academy/` with AAA layout (logo, Smart Tech • Wiser People). See `docs/plans/ADULT_AI_ACADEMY_BLOG_AND_PORTAL.md`.

- [x] AAA logo in nav by route (shows when on `/adult-ai-academy`) + ABYA in Brands dropdown
- [x] AAA page: slate palette, in-person seminar section, Facebook event link
- [x] Sabrina Matrix first-visit modal for AAA entry point
- [ ] AAA full layout (tagline in nav, nav: Courses, Blog, Community, Get Started)
- [ ] AAA blog structure + first 3 posts
- [ ] Portal MVP: catalog page + course structure
- [ ] First course: "AI Literacy Foundations," 4 modules, 12 lessons
- [ ] Progress tracking + completion badges
- [ ] Paid certification + district site licenses

**Current priority:** This week = WasatchWise blog + P0; AAA in Phase 4.

---

## Key Docs

| Doc | Purpose |
|-----|---------|
| **Feb 9 Strategic Plan** (PDF) | Original 52-week plan; Phase 1–5, P0 items, Week 1 checklist. |
| `docs/plans/REVISED_PLAN_FEB_11_2026.md` | Status vs. 2/9; going-forward priorities; one-page “what to do now.” |
| `docs/reports/CODE_EXTENSION_VERIFICATION_FEB_11.md` | GA4 verification (v1.3); phone test success; clean-up steps. |
| `docs/EXECUTION_SCHEDULE_2026.md` | Week-by-week schedule through Phase 5. |
| `docs/content/WEEK1_BLOG_OUTLINES.md` | Outlines for posts 1–3 (5 Questions, FERPA vs COPPA, Utah Office of AI Policy). |

---

**Document:** Wasatch Wise LLC — TASKS for February 11, 2026
**Version:** 1.2 (updated end-of-day Feb 11)
**Next:** Publish Blog Post #2; add WasatchWise CTA on johnlyman.net; email/Resend; optional security PRs; commit `generate-social-copy` route. New TASKS doc for Feb 12+ as needed.
