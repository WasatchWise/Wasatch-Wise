# Wasatch Wise LLC — TASKS for February 11, 2026

**Reference:** Comprehensive Corporate Strategic Plan (Feb 9, 2026)  
**Context:** Wednesday, Feb 11, 2026. Revised plan and verification report reflect ~3 days ahead of original Week 1–2 schedule.

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
| **Blog post #1 (5 Questions…)** | ✅ Draft exists: `apps/dashboard/content/blog/5-questions-superintendents-must-ask-before-ai.mdx` (~733 words; outline target 1,200). |

### Remaining from 2/9 Week 1–2 / Revised Plan

- Remove GA4 debug flag (clean-up).
- Publish or expand Blog Post #1; draft/publish Blog Post #2 (FERPA vs. COPPA).
- johnlyman.net audit (CTA, 150+ districts, broken links).
- Email: confirm Resend as single sender; document SendGrid status if still in use.
- Optional: GitHub security PRs (dashboard + ask-before-you-app); add askbeforeyouapp.com to Cloudflare if desired.

---

## Tasks — Wednesday, February 11, 2026

### Clean-up

- [ ] **Remove GA4 debug flag** — Vercel → wasatchwise project → Settings → Environment Variables → delete `NEXT_PUBLIC_GA_DEBUG` (or set to `false`) → redeploy. *(Tracking verified via phone test; debug no longer needed.)*

### Content

- [ ] **Blog Post #1** — Either (a) expand to ~1,200 words and publish, or (b) publish as-is. File: `apps/dashboard/content/blog/5-questions-superintendents-must-ask-before-ai.mdx`.
- [ ] **Blog Post #2** — Start draft for “FERPA vs. COPPA for AI in Schools” from Outline 2 (`docs/content/WEEK1_BLOG_OUTLINES.md`). Target 1,200 words; CTA: WiseBot SDPC assessment. *(Draft may already exist: `content/blog/ferpa-vs-coppa-ai-in-schools.mdx` — verify and expand if needed.)*

### Credibility / Marketing

- [ ] **johnlyman.net audit** — Run `docs/JOHNLYMAN_NET_AUDIT_CHECKLIST.md`: check links, add WasatchWise CTA on homepage, confirm “150+ districts” in Privacy Perimeter, screenshot for reference.

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

- [ ] AAA layout (AAA logo in nav, tagline, nav: Courses, Blog, Community, Get Started)
- [ ] AAA blog structure + first 3 posts
- [ ] Portal MVP: catalog page + course structure
- [ ] First course: “AI Literacy Foundations,” 4 modules, 12 lessons
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
**Version:** 1.0  
**Next:** Update or replace with a new TASKS doc for Feb 12+ as needed.
