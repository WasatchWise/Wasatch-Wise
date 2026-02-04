# Ask Before You App — SDPC MVP Runbook (Feb 4, 2026)

**Meeting:** Student Data Privacy Consortium  
**Goal:** Show a working MVP of our parallel product: NDPA certification, vendor privacy pieces, state ecosystems, and components that make ABYA a robust sister to SDPC.

---

## 1. Demo-critical pages (in order)

| Route | What to show |
|-------|----------------|
| **`/`** | Campaign home — “Ask Before You App,” who it’s for, **trust/SDPC mention** (we’re built on the same frameworks). Open **Who Are You** modal to show persona capture. |
| **`/learn`** | Knowledge hub — state ecosystem intro, **SDPC Registry** callout, “what to ask” by audience (parent, educator, administrator, student). |
| **`/certification`** | **NDPA-aligned training** — 5 modules (Foundations, Document Anatomy, DPA Workflow, Registry Ninja, Crisis Mastery), value prop, link to SDPC. |
| **`/ecosystem`** | **State resources** — SDPC member count (50+), state grid (Utah live; others “Coming Soon”), “Built on SDPC framework.” Click **UT** to show full Utah ecosystem. |
| **`/ecosystem/ut`** | Utah deep-dive: laws, roles, DPA templates (NDPA v2.1, NRDPA, EISP-NDPA), workflows, contacts. |
| **`/registry`** | Vendor Registry — explains we point to **SDPC Registry**; link to search and to privacy.a4l.org. |
| **`/request`** | Request an app review — shows we tie into SDPC Registry guidance and community. |

Optional if time: **`/tools/wisebot`** (privacy Q&A), **`/tools/ai-readiness-quiz`**, **Who modal** on home.

---

## 2. Key messages for SDPC

- **We’re a sister, not a replacement.** We’re built on the same frameworks (NDPA, SDPC Registry, state alliances). We point users to official sources; we don’t replace them.
- **NDPA certification.** Free, ~50-minute, NDPA-focused training so educators and admins speak the same language as districts and state alliances.
- **Vendor privacy.** We explain how to evaluate tools, what to ask vendors, and we direct people to the **SDPC Registry** (privacy.a4l.org / sdpc.a4l.org) to verify.
- **State things.** State-by-state ecosystem (Utah live as model); SDPC member count and “Coming Soon” for other states shows we’re aligned with the consortium.
- **One habit.** “Ask before you app” — one simple habit that protects privacy at home, school, and work.

---

## 3. Pre-meeting checklist (today / tomorrow AM)

### Build & deploy
- [ ] **Build:** `pnpm run build --filter=ask-before-you-app` (or from repo root: `turbo run build --filter=ask-before-you-app`) succeeds.
- [ ] **Deploy** to production (e.g. Vercel) so SDPC has a live URL. Confirm the URL (e.g. `https://ask-before-you-app.vercel.app` or your custom domain).

### Environment (content-only demo)
- [ ] **Supabase (optional for static demo):** If you show anything that hits Supabase (e.g. districts, email capture), set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the deploy environment. If you only show static pages + ecosystem (from code), you can skip for demo.
- [ ] **Stripe:** Not required for content demo. Certification purchase can be skipped; `getServerEnv()` treats Stripe as optional.

### Content & links
- [ ] **SDPC links** work: [privacy.a4l.org](https://privacy.a4l.org), [sdpc.a4l.org/search.php](https://sdpc.a4l.org/search.php) (Registry search). No broken links on `/`, `/learn`, `/certification`, `/ecosystem`, `/request`, `/registry`.
- [ ] **Nav:** From home, click **Knowledge hub**, **Certification**, **State resources** — no 404s. From Header (on /learn, /certification, /ecosystem): **NDPA Certification**, **State Ecosystems**, **Vendor Registry**, **AI Readiness Quiz**, **WiseBot** — all resolve.
- [ ] **Who modal:** On home, click “Who are you?” (or equivalent); modal opens and closes without errors.

### Quick local smoke test
```bash
pnpm run dev:abya
# Open http://localhost:3000 (or the port shown)
# Visit: / → /learn → /certification → /ecosystem → /ecosystem/ut → /registry → /request
# Open Who modal on home. Click SDPC and SDPC Registry links.
```

---

## 4. Talking points (30-second / 2-minute)

**30 seconds:**  
“Ask Before You App is a national awareness campaign built on the same frameworks as the Student Data Privacy Consortium. We help parents, educators, and administrators understand state laws, vet vendors, and use the SDPC Registry—and we offer a free NDPA-aligned certification so they can speak the same language as districts and state alliances.”

**2 minutes:**  
Walk the site: home (one habit, who it’s for, SDPC trust) → Knowledge hub (what to ask, SDPC Registry) → Certification (five modules, NDPA-focused) → State resources (50+ SDPC members, Utah ecosystem live) → Utah page (laws, roles, DPAs, workflows). Emphasize: we point to official sources and the SDPC Registry; we’re a sister that extends reach and education, not a replacement.

---

## 5. If something breaks during demo

- **Site down:** Have the production URL and a backup (e.g. local tunnel or a second deploy) if possible.
- **404 on a nav link:** Stick to the core path: `/` → `/learn` → `/certification` → `/ecosystem` → `/ecosystem/ut`. Skip Tools/Brands dropdown if needed.
- **Who modal error:** Skip it; the rest of the content still shows audience (parents, educators, etc.) on the home page.
- **Supabase/Stripe errors:** For a content-only demo, avoid pages that require auth or payment; focus on Learn, Certification, Ecosystem, Registry, Request.

---

## 6. Components that make us a “robust sister”

| Component | Where it lives | SDPC-relevant message |
|-----------|----------------|------------------------|
| **NDPA certification** | `/certification`, `/certification/module/[id]` | NDPA-aligned training; same language as districts/state alliances. |
| **Vendor privacy / SDPC Registry** | `/learn` (what to ask), `/registry`, `/request` | We direct users to the SDPC Registry and official sources. |
| **State ecosystems** | `/ecosystem`, `/ecosystem/[stateCode]` | Laws, roles, DPA templates, workflows by state; Utah as model; SDPC member count. |
| **Campaign narrative** | `/` | “Ask before you app” + who it’s for + built on SDPC frameworks. |
| **Who Are You** | Modal on `/` | Persona (parent, educator, admin, student) for tailored content. |
| **WiseBot / AI Readiness Quiz** | `/tools/wisebot`, `/tools/ai-readiness-quiz` | Optional: show we’re thinking about AI + privacy in schools. |

---

**Last updated:** Feb 3, 2026  
**Owner:** Ask Before You App team
