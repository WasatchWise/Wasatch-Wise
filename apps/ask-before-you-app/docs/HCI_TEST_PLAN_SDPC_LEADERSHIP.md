# Ask Before You App — HCI Test Plan for SDPC Leadership

**Purpose:** Ensure the Ask Before You App (ABYA) campaign site remains stable and usable for all audiences. This plan supports post-launch verification and can be shared with SDPC leadership to demonstrate ongoing quality assurance.

**Audience:** SDPC leadership, district administrators, and anyone validating that the campaign works as designed.

**Live site:** https://www.askbeforeyouapp.com

**Last updated:** February 2026

---

## 1. How to Use This Document

- **Before a demo or interview:** Run **Section 2 (Smoke)** and **Section 3 (Critical Journeys)** so you know the site is up and key flows work.
- **After a deployment:** Run **Section 2** and **Section 4 (Page-by-Page)**; optionally run **Section 6 (Automated Tests)**.
- **For SDPC / stakeholders:** Share this document as the standard checklist; they can execute the manual steps or watch you run the automated suite.

**Pass criteria:** Smoke tests and Critical Journeys must pass. Page-by-Page and Accessibility items should pass for a “production-ready” sign-off.

---

## 2. Smoke Tests (Do These First)

**Goal:** Confirm the site is live, correct app is served, and no catastrophic errors.

| # | Check | How to verify | Pass? |
|---|--------|----------------|-------|
| 2.1 | Correct site loads | Open https://www.askbeforeyouapp.com — you see **Ask Before You App** branding (orange), not another site (e.g. band or dashboard). | ☐ |
| 2.2 | Tab title | Browser tab shows **Ask Before You App** (e.g. "Ask Before You App \| Student Data Privacy Campaign" or "Knowledge hub \| Ask Before You App" on Learn). | ☐ |
| 2.3 | No critical console errors | Open DevTools → Console. Reload. No red errors that block the page. (Warnings are acceptable.) | ☐ |
| 2.4 | Homepage hero | “Ask Before **You App**” headline and “Before you download that app—ask…” subtext are visible. | ☐ |
| 2.5 | Main nav links | Links for **Knowledge hub**, **Certification**, **State resources** are present and clickable. | ☐ |
| 2.6 | Who are you entry point | A way to open the “Who are you?” flow exists (e.g. “Who are you?” or “Continue” from a modal). | ☐ |

**If any smoke test fails:** Treat as a blocker; fix before demos or sharing with leadership.

---

## 3. Critical User Journeys (By Persona)

**Goal:** Each primary audience can complete their main path without breakage.

### 3.1 Parent

| Step | Action | Expected result | Pass? |
|------|--------|------------------|-------|
| 1 | Open https://www.askbeforeyouapp.com | Campaign home loads. | ☐ |
| 2 | Open “Who are you?” (or equivalent) | Modal appears with role options. | ☐ |
| 3 | Select **Parent** and continue | Modal closes; optional redirect or state update. | ☐ |
| 4 | Click **Knowledge hub** | Navigate to /learn. | ☐ |
| 5 | On Learn, confirm parent-oriented copy | e.g. “For parents: what to ask…” or similar. | ☐ |
| 6 | Click **State resources** | Navigate to /ecosystem. | ☐ |
| 7 | Pick a state (e.g. Utah if available) | State ecosystem page or “coming soon” for others. | ☐ |

### 3.2 Educator

| Step | Action | Expected result | Pass? |
|------|--------|------------------|-------|
| 1 | Open home, open “Who are you?” | Modal with role options. | ☐ |
| 2 | Select **Educator**, continue | Modal closes. | ☐ |
| 3 | Click **Certification** | Navigate to /certification. | ☐ |
| 4 | See NDPA certification modules | e.g. Foundations, Document Anatomy, DPA Workflow, Registry Ninja. | ☐ |
| 5 | Click **Start** or first module | Module or course flow starts (no 404). | ☐ |
| 6 | Click **Knowledge hub** | Navigate to /learn. | ☐ |
| 7 | Click **State resources** | Navigate to /ecosystem; state grid visible. | ☐ |

### 3.3 Administrator

| Step | Action | Expected result | Pass? |
|------|--------|------------------|-------|
| 1 | Open home, open “Who are you?” | Modal with role options. | ☐ |
| 2 | Select **Administrator**, continue | Modal closes. | ☐ |
| 3 | Click **State resources** | Navigate to /ecosystem. | ☐ |
| 4 | Confirm administrator-oriented message | e.g. “As an administrator, here are the state-by-state requirements…” | ☐ |
| 5 | Click **Certification** | Navigate to /certification. | ☐ |
| 6 | Click **Knowledge hub** | Navigate to /learn; state laws section visible. | ☐ |

### 3.4 Student

| Step | Action | Expected result | Pass? |
|------|--------|------------------|-------|
| 1 | Open home, open “Who are you?” | Modal with role options. | ☐ |
| 2 | Select **Student**, continue | Modal closes. | ☐ |
| 3 | Click **Knowledge hub** | Navigate to /learn. | ☐ |
| 4 | Click **State resources** | Navigate to /ecosystem. | ☐ |
| 5 | Click **Certification** (optional) | Navigate to /certification. | ☐ |

### 3.5 Just learning (curious visitor)

| Step | Action | Expected result | Pass? |
|------|--------|------------------|-------|
| 1 | Open home; dismiss or skip “Who are you?” | Can use site without selecting a role. | ☐ |
| 2 | Click **Knowledge hub** | Navigate to /learn. | ☐ |
| 3 | Use persona shortcuts on Learn (e.g. “I’m a parent”, “I’m just learning”) | Page scrolls or updates to relevant section. | ☐ |
| 4 | Click **State resources** | Navigate to /ecosystem. | ☐ |

---

## 4. Page-by-Page Checklist

**Goal:** Every public page loads and shows expected content and structure.

| Page | URL | Checks | Pass? |
|------|-----|--------|-------|
| **Home** | / | Hero, “Ask Before You App”, audience cards (Parents, Educators, etc.), nav (Knowledge hub, Certification, State resources), footer. | ☐ |
| **Learn (Knowledge hub)** | /learn | Title “Knowledge hub”, sections: Understand apps, State laws & procedures, Be an advocate, Certification card; state selector; persona buttons work. | ☐ |
| **Learn with persona** | /learn?who=educator (or parent, etc.) | Same as /learn; optional persona-specific line (e.g. “Here for you as an educator”). | ☐ |
| **Certification** | /certification | NDPA certification intro; list of modules (e.g. Foundations, Document Anatomy, DPA Workflow, Registry Ninja); Start / Begin buttons. | ☐ |
| **Certification module** | /certification/module/0 (and 1, 2, 3) | Module content or “start module” flow; no 404. | ☐ |
| **Ecosystem (State resources)** | /ecosystem | “State Privacy Ecosystems”; SDPC member count; “Guides Ready” count; state grid (all 50 + DC); Utah (or current) has distinct styling if available. | ☐ |
| **State guide (e.g. Utah)** | /ecosystem/utah | State name, overview, laws, roles, resources, or “coming soon” where applicable. | ☐ |
| **Contact** | /contact | Contact form or contact info; no 404. | ☐ |
| **Pricing** | /pricing | Pricing or “contact for pricing” content; no 404. | ☐ |
| **Registry** | /registry | Vendor registry or “coming soon” / placeholder; no 404. | ☐ |
| **AI Readiness Quiz** | /tools/ai-readiness-quiz | Quiz loads; first question or intro visible. | ☐ |
| **WiseBot** | /tools/wisebot | WiseBot or tool placeholder loads; no 404. | ☐ |

---

## 5. Accessibility (WCAG 2.1 AA Focus)

**Goal:** Core accessibility requirements so the campaign is usable by all stakeholders.

| # | Check | How to verify | Pass? |
|---|--------|----------------|-------|
| 5.1 | Images have alt text | DevTools or aXe: every `img` has an `alt` attribute (can be empty for decorative). | ☐ |
| 5.2 | Headings in order | Home and Learn: logical heading levels (e.g. one h1, then h2, h3). | ☐ |
| 5.3 | Focus visible | Tab through home and Learn: focus ring visible on links and buttons. | ☐ |
| 5.4 | Keyboard nav | Can reach Knowledge hub, Certification, State resources, and “Who are you?” and activate with keyboard only. | ☐ |
| 5.5 | Form labels (Contact) | On /contact, every input has an associated label or aria-label. | ☐ |
| 5.6 | Color not only cue | Important info (e.g. state “has data” vs “coming soon”) is not conveyed by color alone (text or icon too). | ☐ |
| 5.7 | Modal focus | When “Who are you?” modal opens, focus moves inside; closing returns focus. | ☐ |

*Full automated WCAG-style checks are in the test suite; see Section 6.*

---

## 6. Cross-Device & Viewport

**Goal:** Critical flows work on desktop, tablet, and phone.

| Viewport | Smoke (2.1–2.6) | Learn loads | Certification loads | Ecosystem loads | Pass? |
|----------|------------------|-------------|----------------------|-----------------|-------|
| Desktop (e.g. 1280×720) | ☐ | ☐ | ☐ | ☐ | ☐ |
| Tablet (e.g. 768×1024) | ☐ | ☐ | ☐ | ☐ | ☐ |
| Mobile (e.g. 375×667) | ☐ | ☐ | ☐ | ☐ | ☐ |

**How:** Resize browser or use DevTools device toolbar; repeat Smoke and one Critical Journey per viewport.

---

## 7. Automated HCI Test Suite (Playwright)

The repo includes a Playwright-based HCI suite that covers personas, scenarios, and accessibility.

### 7.1 When to run

- **After code changes** that touch ABYA pages or shared components.
- **Before a major demo or release** to SDPC or partners.
- **In CI** (optional): run on main or before deploy to catch regressions.

### 7.2 How to run (from repo root or app dir)

**Prerequisites:** Node/pnpm; Playwright browsers installed (`npx playwright install`).

From **monorepo root**:

```bash
pnpm --filter ask-before-you-app exec playwright test --config=tests/hci/playwright.config.ts
```

From **apps/ask-before-you-app**:

```bash
pnpm run test:hci
```

**Run against production (askbeforeyouapp.com):**

```bash
BASE_URL=https://www.askbeforeyouapp.com pnpm run test:hci
```

**Useful variants:**

```bash
# Accessibility tests only
pnpm run test:hci -- --project=accessibility

# Scenario-based persona journeys (e.g. teacher, superintendent)
pnpm run test:hci:scenarios

# HTML report after run
pnpm run test:hci:report
```

### 7.3 What the suite covers

| Category | Location | What it checks |
|----------|----------|----------------|
| **Archetypes** | tests/hci/archetypes/ | Parent, Educator, Administrator, Student, Consultant UI patterns and constraints. |
| **Scenarios** | tests/hci/specs/*-scenarios.spec.ts | Full journeys (e.g. quiz completion, Ask Dan, contact form, dashboard) with time/click constraints. |
| **Cognitive** | tests/hci/cognitive/ | Information density, “invisible tutorial” (Mario 1-1) patterns. |
| **Accessibility** | tests/hci/accessibility/wcag-audit.spec.ts | WCAG 2.1 AA–oriented checks (alt text, structure, forms, etc.). |
| **Projects** | playwright.config.ts | Desktop (Chrome, Firefox, Safari), mobile (Pixel 5, iPhone 12), tablet, accessibility. |

Results are written to `tests/hci/hci-results.json` and an HTML report in `tests/hci/hci-report/`.

---

## 8. Regression & Sign-Off

### 8.1 Recommended cadence

- **After every deploy** to production: run **Section 2 (Smoke)**.
- **Before SDPC or leadership demos:** run **Section 2** and **Section 3 (Critical Journeys)** for at least Parent and Educator.
- **Weekly or pre-release:** run **Section 4 (Page-by-Page)** and **Section 5 (Accessibility)**; optionally **Section 6** and **Section 7**.

### 8.2 Sign-off template

You can use this when sharing with SDPC or internal stakeholders:

- **Date:** _______________
- **Tester:** _______________
- **Environment:** Production (https://www.askbeforeyouapp.com) / Staging (_____________)
- **Smoke (Section 2):** ☐ All passed  
- **Critical Journeys (Section 3):** ☐ Parent ☐ Educator ☐ Administrator ☐ Student ☐ Just learning  
- **Page-by-Page (Section 4):** ☐ All critical pages checked  
- **Accessibility (Section 5):** ☐ Core checks passed  
- **Automated suite (Section 7):** ☐ Run and passed (or: not run / link to report)

**Notes / issues:** _______________________________________________

---

## 9. Quick Reference — Critical URLs

| Purpose | URL |
|--------|-----|
| Live site | https://www.askbeforeyouapp.com |
| Home | https://www.askbeforeyouapp.com/ |
| Knowledge hub | https://www.askbeforeyouapp.com/learn |
| Certification | https://www.askbeforeyouapp.com/certification |
| State resources | https://www.askbeforeyouapp.com/ecosystem |
| Utah (example state) | https://www.askbeforeyouapp.com/ecosystem/utah |
| Contact | https://www.askbeforeyouapp.com/contact |
| Pricing | https://www.askbeforeyouapp.com/pricing |
| Registry | https://www.askbeforeyouapp.com/registry |
| AI Readiness Quiz | https://www.askbeforeyouapp.com/tools/ai-readiness-quiz |
| WiseBot | https://www.askbeforeyouapp.com/tools/wisebot |

---

## 10. Contact & Ownership

- **Campaign:** Ask Before You App (ABYA), built on the SDPC framework.
- **Technical owner:** WasatchWise (see repo and deployment docs).
- **Test plan owner:** Team maintaining ABYA; update this document when new pages or flows are added.

For questions about this test plan or the HCI suite, refer to:

- `apps/ask-before-you-app/docs/DEPLOY_ASKBEFOREYOUAPP_COM.md` — deployment and troubleshooting.
- `apps/ask-before-you-app/tests/hci/README.md` — DAROS HCI suite and persona definitions.
