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

### ⚠ → ✅ Resolved (verified end of Feb 11)

| Item | Status (updated Feb 11 EOD) |
|------|--------|
| **Cloudflare Web Analytics** | ✅ Enabled on wasatchwise.com. ABYA not in same CF account — add if desired. |
| **SendGrid vs email** | ⚠ Still open. Resend is primary sender (contact form, quiz, audit). Need to confirm: SendGrid fully sunset? Decision needed by Feb 13. |
| **johnlyman.net audit** | ✅ **Completed.** Links good, 150+ districts verified. Results in `JOHNLYMAN_NET_AUDIT_CHECKLIST.md`. **Remaining:** add prominent WasatchWise CTA on homepage (external site). |
| **First 2 blog posts** | ✅ **Blog Post #1 published** ("5 Questions Superintendents Must Ask Before AI", `28ffa4e`). Blog Post #2 drafted and ready ("FERPA vs COPPA"). MDX blog system + RSS feed built (`f10f10c`). |
| **GitHub security PRs** | ⚠ Still open. Optional; low priority. |
| **Google Sheet Content Calendar** | ✅ Markdown execution schedule (`EXECUTION_SCHEDULE_2026.md`) serves this role. No separate Google Sheet needed unless preferred. |

### ✅ New accomplishments (Feb 11 evening session)

| Item | Status |
|------|--------|
| **Sabrina Matrix first-visit modals** | ✅ One welcome modal per brand entry point (WasatchWise, AAA, ABYA). sessionStorage-based (`c625bcd`). |
| **Brand nav: AAA logo by route** | ✅ AAA logo in header when on `/adult-ai-academy`; ABYA in Brands dropdown; flicker fix (`96bea76`, `4f495a4`). |
| **AAA page: slate palette + events** | ✅ Bluish-gray (slate) palette, in-person seminar section, Facebook event link. Brand Positioning doc updated (`51bf9a0`). |
| **WiseBot Claude integration** | ✅ Claude AI integration for audit analysis (`66c14b1`). |
| **n8n RSS-to-social workflow** | ✅ Blog → social pipeline workflow added (`9de774b`). |
| **Rock Salt bug fixes** | ✅ Event duplication fix + 3 ingest-events fixes (4 commits). |

---

## 2. Revised "Where We Are" (Updated end of Feb 11)

- **Phase 1 (Weeks 1–4) — Stop the Bleeding:** Substantially complete. GA4 live, Pipeline IQ decided, content calendar done, Monday Briefing template ready, Blog Post #1 published, Blog Post #2 ready, johnlyman.net audit done, MDX blog + RSS built, Sabrina first-visit modals live, brand nav routing live, WiseBot Claude integration done, n8n RSS-to-social workflow ready. AAA page updated with slate palette and events.
- **Ahead of schedule:** You're at **end of Week 2** in terms of deliverables — blog posts, analytics, brand experience, and content pipeline all done. Remaining: publish Post #2, email/Resend decision, optional security PRs, and johnlyman.net CTA.

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

## 5. One-Page "What to Do Now" (Updated end of Feb 11)

| Priority | Action | Status | Owner |
|----------|--------|--------|--------|
| ~~1~~ | ~~Run Code Extension questions (Section 4)~~ | ✅ Done (GA4 verified, Cloudflare confirmed) | — |
| ~~2~~ | ~~Draft blog post #1~~ | ✅ **Published** (`28ffa4e`) | — |
| ~~5~~ | ~~Draft blog post #2~~ | ✅ Drafted, ready to publish | — |
| ~~4~~ | ~~johnlyman.net audit~~ | ✅ Done (remaining: add CTA on homepage) | — |
| **1** | **Publish Blog Post #2** ("FERPA vs COPPA") | Ready | You |
| **2** | **Decide email:** Resend only vs Apps Script; if SendGrid still used, export and document | Open | You |
| **3** | **johnlyman.net:** Add prominent WasatchWise CTA on homepage | Open | You |
| **4** | (Optional) Close/merge security PRs on dashboard + ABYA | Open | You |
| **5** | Commit `apps/dashboard/app/api/generate-social-copy/` (untracked) | Open | You |

---

## 6. Document control

| Field | Value |
|-------|--------|
| Title | Revised Plan — Feb 11, 2026 (v2, end-of-day update) |
| Replaces | Week 1–2 focus of Feb 9 plan (not the full 52-week strategy) |
| Next review | After Blog Post #2 published and email decision made (target: Feb 13) |

---

**Summary (updated Feb 11 EOD):** You're now roughly **1 week ahead**. Blog Post #1 published, Post #2 ready, johnlyman.net audited, Sabrina modals live, brand nav working, WiseBot integrated, n8n RSS-to-social ready, AAA page refreshed with slate palette and events, Rock Salt bugs fixed. **Remaining this week:** publish Post #2, decide email (Resend vs SendGrid), add WasatchWise CTA on johnlyman.net, optional security PRs.
