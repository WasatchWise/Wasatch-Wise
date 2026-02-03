# Claude Chrome Extension: Full-Stack Browser Checks Prompt

**Copy the prompt below and give it to the Claude Chrome extension.** It will run browser-level checks on your production sites and the platforms behind them (Vercel, Supabase, GitHub).

---

## Prompt (copy from here)

You're helping verify a full-stack setup. Run these browser-level checks and report back in this format:

**RESULT:** Pass / Partial / Fail  
**FINDINGS:** [What you observed, with URLs and any errors]  
**BUGS:** [Issues fixable in the UI or by user action]  
**NEEDS CURSOR:** [Issues that require code/config changes—report to the dev in Cursor]

---

### 1. Production sites

Open each URL, confirm it loads (no 5xx, no blank page), and note what you see.

- **www.wasatchwise.com**  
  - Loads? SSL valid?  
  - Homepage: hero, nav (Services, Pricing, Tools, Ask Before You App, Contact).  
  - AAA only in footer (Resources), not in main nav.  
  - Quick check: click "Ask Before You App" and one other link.

- **www.adultaiacademy.com**  
  - Loads? SSL valid?  
  - Should show the **Adult AI Academy** marketing page (not the WasatchWise homepage).  
  - Hero: "Practical AI literacy for adults—whether you're upskilling, hesitant to try AI…"  
  - Who It's For: Reluctant or Hesitant Learners, Gen X/Xennials, Anyone Ready to Go Beyond Basics.  
  - No K-12 educator copy (no FERPA/COPPA, lesson planning, assessment in hero/audience).  
  - Footer/CTA: links to Ask Before You App and WasatchWise.

- **Content Factory (optional)**  
  - **adult-ai-academy.vercel.app** or **content-factory.vercel.app**  
  - Loads? Sidebar/title shows "CONTENT FACTORY" (not "Adult AI Academy").

If any site fails or shows wrong content, note it in FINDINGS and NEEDS CURSOR.

---

### 2. Vercel

- Go to **https://vercel.com/dashboard**.  
- **Projects:**  
  - **wasatchwise** – Latest deployment status (Building / Ready / Error). If Error, note the error message or link to the failed build.  
  - **adult-ai-academy** (or **content-factory**) – Latest deployment status.  
- **wasatchwise → Settings → Domains:**  
  - **www.wasatchwise.com** and **www.adultaiacademy.com** listed and verified (no warnings).  
- **wasatchwise → Settings → Build & Deployment:**  
  - Install Command (if set): e.g. `pnpm install --no-frozen-lockfile` – note if present.  
- **Deployments:**  
  - For wasatchwise, note the status of the most recent deployment (Ready / Error / Canceled). If Error, open it and note the failing step (e.g. install, build) and error text.

Report: deployment status for each project, domain list, and any build/domain errors.

---

### 3. Supabase

- Go to **https://supabase.com/dashboard** and open the project used by WasatchWise/dashboard (e.g. production).  
- **Project Settings → API:**  
  - Project URL and anon key exist (you don’t need to paste values).  
- **Table Editor (or Database):**  
  - Confirm key tables exist if you know them: e.g. `city_metrics`, `building_registry`, `system_health` (for Wasatchville), or `districts`, etc. Note any missing or obviously broken tables.  
- **Logs (optional):**  
  - If you can open API or Postgres logs without deep auth, note any repeated errors (e.g. 500s, connection errors).  
- **Authentication (optional):**  
  - If the app uses auth, note whether Providers are configured (e.g. Email, OAuth) and if there are any warnings.

Report: project reachable, key tables present (or not), and any critical log/auth issues.

---

### 4. GitHub

- Go to the repo (e.g. **github.com/[org]/wasatchwise** or the actual repo URL).  
- **Default branch (e.g. main):**  
  - Latest commit message and that the branch exists.  
- **Actions (if used):**  
  - Latest workflow run status (success / failure / skipped). If failure, note the workflow name and a one-line reason if visible.  
- **Settings (if you have access):**  
  - Confirm the repo is connected to Vercel (e.g. in Integrations or Deployments). If you can’t see Settings, skip and say "No access to repo settings."

Report: branch status, last Actions result, and Vercel connection if visible.

---

### 5. Optional: Key app flows (if time permits)

- **www.wasatchwise.com**  
  - Open **AI Readiness Quiz** (or **Tools → AI Readiness Quiz**), complete one or two steps, confirm it advances.  
  - Open **Contact**, confirm form and submit (or at least that it doesn’t error on load).  
- **WiseBot (if present):**  
  - Open WiseBot, send one message. Note if you get a response or a timeout/error.

Add any failures or odd behavior to FINDINGS and NEEDS CURSOR.

---

When you’re done, summarize:

- **RESULT:** Pass / Partial / Fail  
- **FINDINGS:** Bullet list with URL and what you saw (e.g. "wasatchwise.com – nav correct", "Vercel wasatchwise – last deploy Error: …").  
- **BUGS:** Anything the user can fix in the browser (e.g. redeploy, domain verify, enable a feature).  
- **NEEDS CURSOR:** Anything that requires code, env, or config changes (for the dev to fix in the repo).

If you couldn’t access something (e.g. private repo, no Supabase login), say so in FINDINGS and still report everything you could check.

---

## How to use this

1. Open your Claude Chrome extension.  
2. Paste the **entire prompt** (from "You're helping verify…" through "…could check.").  
3. Send. The extension will open tabs, click through, and report back.  
4. Share the RESULT / FINDINGS / BUGS / NEEDS CURSOR block with your dev (or Cursor) so code/config fixes can be applied.

You can run this after every major deploy or weekly as a sanity check.
