# Adult AI Academy — Blog Space & Instructional Portal

**Purpose:** AAA needs its own **blog** and **instructional portal** so it stands as a clear brand and learning destination (TikTok, link-in-bio, email, and future paid courses all point here).

**Brand framing:** Adult AI Academy is **1/3 of the Holy Trinity** — WasatchWise, Adult AI Academy, Ask Before You App. Equal stature, distinct audience and offer. When users are in the AAA experience, the nav shows the **AAA logo** and tagline **Smart Tech • Wiser People**; it should feel like its own vertical, not a sub-page of WasatchWise.

**Status:** Scope doc. **Architecture decision: Option B** (see below). **Partial implementation started Feb 11** — AAA logo routing, slate palette, in-person seminar, first-visit modal all live.

---

## Architecture decision: Option B (dashboard)

**Chosen:** Build blog and portal in the **dashboard** app under `/adult-ai-academy/`, with AAA-specific layout (AAA logo in nav, Smart Tech • Wiser People).

**Rationale:**
- adultaiacademy.com already points at the same deployment and shows the AAA landing page.
- One codebase, one deployment; shared Supabase, auth, and pipeline.
- Clear brand separation via routing and layout: when path is `/adult-ai-academy/*`, use AAA layout and nav.
- No extra Vercel project; adultaiacademy.com can keep current routing (e.g. redirect or host header so `/` serves AAA when on that domain).

**Implementation structure (dashboard):**
```
apps/dashboard/
├── app/(marketing)/
│   └── adult-ai-academy/
│       ├── layout.tsx              ← AAA layout (AAA logo, tagline, nav: Courses, Blog, Community, Get Started)
│       ├── page.tsx                ← existing AAA home
│       ├── blog/
│       │   ├── page.tsx            ← blog index
│       │   └── [slug]/page.tsx     ← blog post
│       └── courses/
│           ├── page.tsx            ← catalog
│           └── [slug]/
│               ├── page.tsx       ← course overview
│               └── lessons/[id]/page.tsx  ← lesson player
├── content/
│   └── adult-ai-academy/
│       └── blog/                   ← MDX posts for AAA blog
```

**Current priority:** Finish this week’s WasatchWise blog posts and P0 tasks; AAA blog/portal build in **Phase 4** when ready.

---

## 1. AAA Blog Space

**What it is:** A dedicated blog for Adult AI Academy content — AI literacy for adults and educators, distinct from WasatchWise’s K-12 governance blog.

**Why separate:** WasatchWise blog = superintendents, policy, FERPA/COPPA, consulting. AAA blog = “how to use AI,” tips, demystifying AI, educator-focused. Different audience and SEO; TikTok and AAA campaigns need a clear AAA content home.

**Content examples:**
- What is AI, actually? (plain-English explainers)
- One prompt trick that changes how you use ChatGPT
- AI for lesson planning: do’s and don’ts
- FERPA/COPPA in plain English (bridge to WasatchWise for districts)
- Bias and AI: how to spot it
- Free vs. paid AI tools: where your data goes

**Technical options:**
- **A.** Add `/blog` (or `/insights`, `/learn`) to the **adult-ai-academy** app with MDX posts in `content/blog`, same pattern as dashboard blog.
- **B.** Add an AAA blog section under the **dashboard** (e.g. `/adult-ai-academy/blog`) with its own content dir and layout so adultaiacademy.com can serve it when the domain points there.
- **C.** Standalone AAA marketing site (Next.js) with blog + portal; current AAA app stays the internal content factory.

**CTA / link in bio:** Blog lives at adultaiacademy.com/blog (or equivalent). Every post and TikTok points here; from the blog, clear path to the instructional portal (free course / certification).

---

## 2. AAA Instructional Portal

**What it is:** The place where learners take courses — watch lessons, track progress, earn certificates. Aligns with Feb 9 plan Phase 4: “AI Literacy Foundations” (4 modules, 12 video lessons), paid certification, district site licenses.

**Core features:**
- **Course catalog** — e.g. “AI Literacy Foundations” (free), future paid courses or certifications.
- **Lesson experience** — Video (e.g. 5–10 min) + optional transcript, short check-for-understanding or reflection.
- **Progress** — Per-user progress (completed lessons, modules); persisted in Supabase (or existing AAA DB).
- **Certification / completion** — Free: “completed” badge or certificate; paid: “AI Literacy Certified Educator” with assessment and digital badge.
- **Auth** — Sign up / sign in so progress and certs are tied to a user (Supabase Auth or same as dashboard).

**Technical options:**
- **A.** Build inside the **adult-ai-academy** app: add routes like `/courses`, `/courses/[slug]`, `/courses/[slug]/lessons/[id]`, use existing Supabase; keep content factory (synthesis, library, pilot) as internal tools.
- **B.** Build in the **dashboard** under `/adult-ai-academy/courses` (or subdomain) so one deployment serves both WasatchWise and AAA; shared auth and infra.
- **C.** Separate “AAA learning” app (Next.js + Supabase) focused only on catalog, lessons, progress, certs; AAA content factory produces assets that get published into this app.

**Content pipeline:** The current AAA app (HeyGen, scripts, synthesis) produces video and scripts; the portal consumes them (e.g. video URLs in DB or storage, lesson metadata in Supabase). Blog can promote new courses or lessons.

---

## 3. Suggested order

1. **AAA blog** — Gives TikTok and campaigns a clear AAA content URL; reuse dashboard blog patterns (MDX, frontmatter).
2. **Portal: catalog + one free course** — Single course (e.g. “AI Literacy Foundations”), 4 modules, 12 lessons; no paywall yet. Validates learner flow and progress.
3. **Portal: auth + progress** — So completion and certs are per user.
4. **Portal: paid certification** — Assessment + badge + optional district site licenses.

---

## 4. Phase 4 week-by-week (when ready)

| Week | Focus | Status |
|------|--------|--------|
| **1** | AAA layout (logo + nav) + blog structure + first 3 AAA posts | 🟡 Partial — AAA logo routing by route ✅, slate palette ✅, first-visit modal ✅, ABYA in Brands dropdown ✅. Remaining: full AAA nav (Courses, Blog, Community, Get Started), AAA blog structure, first 3 posts. |
| **2** | Portal MVP: catalog page + course structure (no lessons yet) | ☐ |
| **3–4** | First course: "AI Literacy Foundations," 4 modules, 12 lessons | ☐ |
| **5** | Progress tracking + completion badges | ☐ |
| **6+** | Paid certification: assessment + digital badge; optional district site licenses | ☐ |

---

## 5. Where this lives in the repo

- **Scope and roadmap:** This doc (`docs/plans/ADULT_AI_ACADEMY_BLOG_AND_PORTAL.md`).
- **TikTok / content:** `docs/content/TIKTOK_LIVE_STRUCTURE.md` (AAA as TikTok brand; link in bio → adultaiacademy.com → blog + portal).
- **Feb 9 plan:** Phase 4 (Adult AI Academy launch) = blog + portal + 12 video lessons + free course + paid cert.

---

**Backlog (Phase 4):** AAA layout partially started (logo routing, palette, modal done; full nav + blog structure remaining); AAA portal (catalog + first course); progress + certification. Current sprint: WasatchWise blog posts and P0 tasks; full AAA build when Phase 4 starts.

**Last updated:** February 11, 2026
