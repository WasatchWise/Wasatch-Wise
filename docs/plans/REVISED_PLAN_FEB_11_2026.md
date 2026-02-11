# Wasatch Wise LLC — Revised Plan (Feb 11, 2026)

**Context:** Original plan dated Feb 9, 2026. Today is **Wednesday, February 11, ~9:00 AM**. This document rewrites the plan based on what has been accomplished and sets priorities going forward. You reported being **~3 days ahead**.

**Verification update (Feb 11):** Code Extension verification is complete. See **`docs/reports/CODE_EXTENSION_VERIFICATION_FEB_11.md`** for full findings. **Critical:** GA4 was not firing in production because `NEXT_PUBLIC_GA_MEASUREMENT_ID` was not set in Vercel. Both apps now use this env var when set. **Action:** Add the variable in Vercel for both projects (dashboard: `G-Z6E4LRL4Q8`, askbeforeyouapp: `G-RN4R6STPML`), redeploy, then re-check GA4 Realtime.

---

## 1. What We’ve Accomplished (Verified from Repo & Docs)

These items are **confirmed** from code and docs in the monorepo. Anything that requires logging into live sites (Cloudflare, GA4 UI, Vercel, johnlyman.net) is listed in **Section 4** as questions for Claude Code Extension.

### ✅ Done

| Original Plan Item | Status | Evidence |
|-------------------|--------|----------|
| **GA4 implementation** | **Done** (code-side) | `GoogleAnalytics.tsx` in `apps/dashboard` and `apps/ask-before-you-app`; both wired in root layout. Doc: `docs/ANALYTICS_GA4_VERIFICATION.md`. ABYA uses `G-RN4R6STPML`; dashboard uses env/fallback. Adult AI Academy noted as “redirects / under dashboard” so may use dashboard GA4 when served from same app. |
| **Pipeline IQ decision** | **Done** | `docs/PIPELINE_IQ_SUNSET_DECISION.md` (Feb 10): **Maintenance** — not sunset, not fix. Serves Groove (construction B2B); no K-12 lead feed. Manual browser-extension workflow only; no GitHub Actions to maintain. |
| **AI Co-Founder + Week 1 outlines** | **Done** | `docs/content/WEEK1_BLOG_OUTLINES.md` — 3 outlines (5 Questions Superintendent, FERPA vs COPPA, Utah Office of AI Policy). All “Ready for draft.” |
| **Content calendar / execution schedule** | **Done** | `docs/EXECUTION_SCHEDULE_2026.md` — week-by-week through Phase 5. Week 1 starts Feb 10; today (Wed Feb 11) was slated for Pipeline IQ decision + AI Co-Founder prompt. |
| **Monday Corporate Briefing template** | **Done** | `docs/MONDAY_CORPORATE_BRIEFING_TEMPLATE.md` — sections: metrics, AI Sparring Partner, content planning, “What we’re NOT doing,” week-ahead priorities. |
| **Adult AI Academy build** | **Ahead of plan** | Full Next.js app in `apps/adult-ai-academy`: synthesis, library, pilot, HCI test, HeyGen/audio APIs, Supabase, production orchestrator, auditor, knowledge graph. Plan had “redirects to WasatchWise” and “BUILD Q2, launch Q3” — you have a real product in progress. |

### ⚠ Documented but completion unclear (need verification)

| Item | Notes |
|------|--------|
| **Cloudflare Web Analytics** | Plan: enable on wasatchwise.com + askbeforeyouapp.com. No repo evidence; needs browser check. |
| **SendGrid vs email** | Feb 9 doc (`TODAY_FEB_9_2026.md`) says **Resend** is used for contact form, quiz, audit; SendGrid migration was in original plan. Need to confirm: SendGrid fully sunset? Resend the only sender? Apps Script optional? |
| **johnlyman.net audit** | `docs/JOHNLYMAN_NET_AUDIT_CHECKLIST.md` exists; all checkboxes **unchecked** in repo. Either not done or not marked done. |
| **First 2 blog posts** | Outlines ready; no evidence in repo of published posts (no blog app or content files found in this pass). |
| **GitHub security PRs** | Plan: close 20+ CVE PRs. Not verified in repo. |
| **Google Sheet Content Calendar** | Plan: 52-week Google Sheet. We have markdown schedule; unknown if Sheet exists and is populated. |

---

## 2. Revised “Where We Are” (Effective Wed Feb 11)

- **Phase 1 (Weeks 1–4) — Stop the Bleeding:** Partially complete. GA4 (code), Pipeline IQ decision, AI outlines, execution schedule, and Monday Briefing template are in place. Adult AI Academy is ahead of plan.
- **Assumption (~3 days ahead):** You’re roughly at **end of Week 1 / start of Week 2** in terms of deliverables: first blog drafts and SendGrid/email resolution could be next without redoing what’s done.

---

## 3. Going Forward — Reorganized Priorities (From Wed Feb 11)

### This week (Wed Feb 11 → Fri Feb 13)

1. **Confirm P0 / infra (use Code Extension where needed)**  
   - Cloudflare Web Analytics: enabled on wasatchwise.com and askbeforeyouapp.com? (Section 4 Q1)  
   - GA4: realtime hits in GA4 UI for both sites? (Section 4 Q2)  
   - SendGrid/Resend/Apps Script: one clear decision and one sender for newsletter infra (Section 4 Q3).

2. **Content — first ships**  
   - **Wed–Thu:** Draft blog post #1 from Outline 1 (“5 Questions Every Superintendent…”) — 1,200 words, then edit.  
   - **Thu–Fri:** Draft blog post #2 from Outline 2 (“FERPA vs. COPPA…”).  
   - **Target:** Both ready to publish by **Monday Feb 16** (or publish one by Fri if ready).

3. **johnlyman.net**  
   - Run through `JOHNLYMAN_NET_AUDIT_CHECKLIST.md`: links, CTA, “150+ districts,” screenshot.  
   - If you prefer Code Extension to do the navigation and checks, use Section 4 Q4.

4. **Email / list**  
   - If SendGrid is still in use: export contacts/templates, document decision (keep vs migrate to Resend/Apps Script).  
   - Ensure one “Email Subscribers Master List” (Sheet or Supabase `email_captures`) and one chosen sender for future newsletter.

5. **Optional but high value**  
   - Close or merge GitHub security PRs on dashboard + ask-before-you-app.  
   - Confirm Vercel env: `NEXT_PUBLIC_GA_MEASUREMENT_ID` set for production for dashboard and ABYA.

### Next week (Week of Feb 16)

- **Monday:** First Monday Corporate Briefing using the template; AI Co-Founder generates 3 outlines for Weeks 3–4; pick 2 for the week.  
- **Tue/Thu:** Publish 2 posts (or publish the 2 you drafted this week + 2 new).  
- **Wed:** Google Apps Script welcome sequence (if you chose Apps Script) or finalize Resend for newsletter.  
- **Fri:** Week 2 review; migrate subscribers if you migrated off SendGrid; sunset SendGrid if applicable.

### Phase 2 (Weeks 5–12) — unchanged intent

- 2 posts/week, 16 total in this block.  
- Lead magnets on 4 high-traffic posts.  
- Email list goal: 250+ subscribers.  
- n8n: blog → LinkedIn / Twitter.

### Phase 3–5 — unchanged

- Phase 3: Email automation (welcome, newsletter, abandoned lead magnet).  
- Phase 4: Adult AI Academy launch (you’re already building; focus on curriculum, 12 video lessons, soft launch, then paid cert + district pilots).  
- Phase 5: Scale ($50K+ MRR, 10K visitors, 2K subscribers, 30 Utah districts).

---

## 4. Questions for Claude Code Extension (Browser / Logged-In Access)

Use these when Code Extension can use browser tabs where you’re logged into GA4, Cloudflare, Vercel, SendGrid, or live sites. Have it answer and drop a short summary into `docs/reports/CODE_EXTENSION_VERIFICATION_FEB_11.md` (or similar) so we have a single source of truth.

### Analytics & infra

1. **Cloudflare Web Analytics**  
   Log into Cloudflare (wasatchwise.com, askbeforeyouapp.com). For each domain: Is “Web Analytics” (or equivalent) **enabled**? Are pageviews/visits visible (even if low)?  
   → Answer: Yes/No per domain + one-sentence state.

2. **GA4 Realtime**  
   Log into Google Analytics (property wasatch-wise-hq or the one you use). Open **Reports → Realtime**. Have Code Extension (or you) open wasatchwise.com and askbeforeyouapp.com in a tab. Do realtime hits appear for each site within a minute?  
   → Answer: Yes/No per site. If No, note: “No stream” vs “Stream exists but no hit.”

3. **Vercel GA4 env**  
   In Vercel: For the **dashboard** (wasatchwise.com) and **ask-before-you-app** projects, check **Settings → Environment Variables**. Is `NEXT_PUBLIC_GA_MEASUREMENT_ID` set for **Production**? What value (e.g. G-XXXXXXXXXX)?  
   → Answer: Set Y/N per project + value if set.

### Email

4. **SendGrid vs Resend**  
   - SendGrid: Log into SendGrid. This month: how many emails sent? Is the account trial or paid? Any active automations or just manual/API?  
   - Repo: Dashboard uses Resend for contact form/quiz/audit.  
   → Answer: “Primary sender is Resend” or “Primary sender is SendGrid”; “SendGrid status: trial/paid, X emails this month”; “Migration needed: Y/N.”

### johnlyman.net

5. **johnlyman.net audit**  
   Open https://johnlyman.net.  
   - Does the homepage have a clear CTA like “Consulting with school districts? Learn about WasatchWise →” (or similar) linking to wasatchwise.com/about or /contact?  
   - In “Privacy Perimeter” (or equivalent): Is “150+ school districts” (or similar) clearly stated?  
   - Run a quick check: any obvious 404s on main nav or key sections?  
   → Answer: CTA present Y/N; 150+ stated Y/N; broken links: None / List critical ones.

### Optional

6. **Adult AI Academy live URL**  
   What does https://adultaiacademy.com show today? (Redirect to wasatchwise.com vs standalone app vs “under construction”.)  
   → One sentence.

7. **First blog post live?**  
   If WasatchWise blog lives on wasatchwise.com or dashboard: Is there a post published in the last 7 days (e.g. “5 Questions…” or “FERPA vs COPPA”)?  
   → Yes/No + URL if yes.

---

## 5. One-Page “What to Do Now” (Wed Feb 11)

| Priority | Action | Owner |
|----------|--------|--------|
| 1 | Run Code Extension questions (Section 4) and save answers to a short verification doc | You / Code Extension |
| 2 | Draft blog post #1 from Outline 1 (1,200 words) | You |
| 3 | Decide email: Resend only vs Apps Script; if SendGrid still used, export and document | You |
| 4 | johnlyman.net: run checklist, add CTA, fix critical broken links | You or Code Extension (Q4–5) |
| 5 | Draft blog post #2 from Outline 2 | You |
| 6 | (Optional) Close/merge security PRs on dashboard + ABYA | You |

---

## 6. Document control

| Field | Value |
|-------|--------|
| Title | Revised Plan — Feb 11, 2026 |
| Replaces | Week 1–2 focus of Feb 9 plan (not the full 52-week strategy) |
| Next review | After Code Extension verification and first 2 posts published |

---

**Summary:** You’re roughly 3 days ahead: GA4 (code), Pipeline IQ decision, AI outlines, execution schedule, Monday Briefing template, and Adult AI Academy build are in place. Focus this week: **confirm analytics and email in production**, **ship 2 blog drafts**, and **finish johnlyman.net audit**. Use Section 4 questions with Claude Code Extension so all “logged-in” checks are done once and recorded.
