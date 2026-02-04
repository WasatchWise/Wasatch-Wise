# Ask Before You App — Full HCI Test Run

**Use this when:** You need to test *everything* — not just smoke. Every page, every persona journey, nav/footer, accessibility, and viewports.

**Live site:** https://www.askbeforeyouapp.com  
**Pass:** Every checked item must pass. Fix any failure before sign-off.

---

## 1. Smoke

| # | Check | Pass? |
|---|--------|-------|
| 1.1 | Open site → **Ask Before You App** branding (orange), not another site | ☐ |
| 1.2 | Tab title includes **Ask Before You App** | ☐ |
| 1.3 | DevTools Console: no red errors (warnings OK) | ☐ |
| 1.4 | Homepage hero: “Ask Before **You App**” and “Before you download that app—ask…” | ☐ |
| 1.5 | Nav shows **Who are you?**, **Knowledge hub**, **Certification**, **State resources**, **Tools**, **Contact** (no Services, no Brands, no Pricing) | ☐ |
| 1.6 | “Who are you?” opens modal with Parent, Educator, Administrator, Student, Just learning | ☐ |

---

## 2. Nav — No 404s (every link on-site)

| # | Action | Expected | Pass? |
|---|--------|----------|-------|
| 2.1 | Click **Who are you?** | Modal opens | ☐ |
| 2.2 | Click **Knowledge hub** | /learn loads | ☐ |
| 2.3 | Click **Certification** | /certification loads | ☐ |
| 2.4 | Click **State resources** | /ecosystem loads | ☐ |
| 2.5 | Open **Tools** → **AI Readiness Quiz** | /tools/ai-readiness-quiz loads | ☐ |
| 2.6 | Open **Tools** → **WiseBot** | /tools/wisebot loads | ☐ |
| 2.7 | Open **Tools** → **Vendor Registry** | /registry loads | ☐ |
| 2.8 | Click **Contact** | /contact loads | ☐ |

---

## 3. Footer — Campaign & tools (in-site), other properties (external)

| # | Action | Expected | Pass? |
|---|--------|----------|-------|
| 3.1 | Footer **Campaign**: Knowledge hub | Goes to /learn | ☐ |
| 3.2 | Footer **Campaign**: Certification | Goes to /certification | ☐ |
| 3.3 | Footer **Campaign**: State resources | Goes to /ecosystem | ☐ |
| 3.4 | Footer **Campaign**: Contact | Goes to /contact | ☐ |
| 3.5 | Footer **Tools & resources**: AI Readiness Quiz | Goes to /tools/ai-readiness-quiz | ☐ |
| 3.6 | Footer **Tools & resources**: Vendor Registry | Goes to /registry | ☐ |
| 3.7 | Footer **Tools & resources**: WiseBot | Goes to /tools/wisebot | ☐ |
| 3.8 | Footer **Tools & resources**: Clarion Brief | Goes to /clarion | ☐ |
| 3.9 | Footer **Our other properties**: Adult AI Academy | External link opens (no 404 on askbeforeyouapp.com) | ☐ |
| 3.10 | Footer **Our other properties**: WasatchWise | External link opens | ☐ |

---

## 4. Critical journey — Parent

| # | Action | Expected | Pass? |
|---|--------|----------|-------|
| 4.1 | Open home | Campaign home | ☐ |
| 4.2 | Open “Who are you?” | Modal | ☐ |
| 4.3 | Select **Parent** → Continue | Modal closes; redirect to /learn?who=parent#apps or equivalent | ☐ |
| 4.4 | On Learn: parent-oriented copy visible | e.g. “For parents: what to ask…” | ☐ |
| 4.5 | Click **State resources** | /ecosystem | ☐ |
| 4.6 | Click **Utah** (or first state with data) | State page (e.g. /ecosystem/ut) loads | ☐ |

---

## 5. Critical journey — Educator

| # | Action | Expected | Pass? |
|---|--------|----------|-------|
| 5.1 | Open home, open “Who are you?” | Modal | ☐ |
| 5.2 | Select **Educator** → Continue | Modal closes | ☐ |
| 5.3 | Click **Certification** | /certification | ☐ |
| 5.4 | See NDPA modules (e.g. Foundations, Document Anatomy, DPA Workflow, Registry Ninja) | Module list visible | ☐ |
| 5.5 | Click Start or first module | Module content or flow (no 404) | ☐ |
| 5.6 | Click **Knowledge hub** | /learn | ☐ |
| 5.7 | Click **State resources** | /ecosystem, state grid | ☐ |

---

## 6. Critical journey — Administrator

| # | Action | Expected | Pass? |
|---|--------|----------|-------|
| 6.1 | Open home, open “Who are you?” | Modal | ☐ |
| 6.2 | Select **Administrator** → Continue | Modal closes | ☐ |
| 6.3 | Click **State resources** | /ecosystem | ☐ |
| 6.4 | Administrator-oriented message visible | e.g. “As an administrator, here are the state-by-state…” | ☐ |
| 6.5 | Click **Certification** | /certification | ☐ |
| 6.6 | Click **Knowledge hub** | /learn, state laws section | ☐ |

---

## 7. Critical journey — Student

| # | Action | Expected | Pass? |
|---|--------|----------|-------|
| 7.1 | Open home, open “Who are you?” | Modal | ☐ |
| 7.2 | Select **Student** → Continue | Modal closes | ☐ |
| 7.3 | Click **Knowledge hub** | /learn | ☐ |
| 7.4 | Click **State resources** | /ecosystem | ☐ |
| 7.5 | Click **Certification** | /certification | ☐ |

---

## 8. Critical journey — Just learning

| # | Action | Expected | Pass? |
|---|--------|----------|-------|
| 8.1 | Open home; dismiss/skip “Who are you?” | Site usable without role | ☐ |
| 8.2 | Click **Knowledge hub** | /learn | ☐ |
| 8.3 | On Learn: click “I’m a parent” (or “I’m just learning”) | Section scrolls or updates | ☐ |
| 8.4 | Click **State resources** | /ecosystem | ☐ |

---

## 9. Page-by-page (every public page)

| # | Page | URL | Check | Pass? |
|---|------|-----|--------|-------|
| 9.1 | Home | / | Hero, audience cards, nav, footer | ☐ |
| 9.2 | Learn | /learn | “Knowledge hub”, Understand apps, State laws, Be an advocate, Certification card, state selector, persona buttons | ☐ |
| 9.3 | Learn (educator) | /learn?who=educator | Persona line for educator | ☐ |
| 9.4 | Learn (parent) | /learn?who=parent | Persona line for parent | ☐ |
| 9.5 | Certification | /certification | NDPA intro, module list, Start/Begin | ☐ |
| 9.6 | Module 0 | /certification/module/0 | Content or start flow; no 404 | ☐ |
| 9.7 | Module 1 | /certification/module/1 | No 404 | ☐ |
| 9.8 | Module 2 | /certification/module/2 | No 404 | ☐ |
| 9.9 | Module 3 | /certification/module/3 | No 404 | ☐ |
| 9.10 | Ecosystem | /ecosystem | State Privacy Ecosystems, SDPC count, Guides Ready, state grid (50+DC) | ☐ |
| 9.11 | Utah | /ecosystem/ut | State name, overview, laws, roles, contacts, resources (or coming soon) | ☐ |
| 9.12 | Contact | /contact | Form or contact info; no 404 | ☐ |
| 9.13 | Registry | /registry | Registry or placeholder; no 404 | ☐ |
| 9.14 | AI Readiness Quiz | /tools/ai-readiness-quiz | Quiz loads; first question or intro | ☐ |
| 9.15 | WiseBot | /tools/wisebot | WiseBot or placeholder; no 404 | ☐ |
| 9.16 | Clarion | /clarion | Clarion Brief content; no 404 | ☐ |

---

## 10. Accessibility (WCAG 2.1 AA focus)

| # | Check | How | Pass? |
|---|--------|-----|-------|
| 10.1 | Images have alt text | Every `img` has `alt` (empty OK for decorative) | ☐ |
| 10.2 | Headings in order | Home & Learn: one h1, then h2/h3 | ☐ |
| 10.3 | Focus visible | Tab through home & Learn; focus ring on links/buttons | ☐ |
| 10.4 | Keyboard nav | Reach and activate Knowledge hub, Certification, State resources, Who are you?, Contact with keyboard only | ☐ |
| 10.5 | Contact form labels | /contact: every input has label or aria-label | ☐ |
| 10.6 | Color not only cue | State “has data” vs “coming soon” has text/icon too | ☐ |
| 10.7 | Modal focus | “Who are you?” opens → focus inside; close → focus returns | ☐ |

---

## 11. Cross-device (smoke + one journey per viewport)

| Viewport | Smoke (1.1–1.6) | One full journey (e.g. Parent 4.1–4.6) | Pass? |
|----------|-------------------|----------------------------------------|-------|
| Desktop (1280×720) | ☐ | ☐ | ☐ |
| Tablet (768×1024) | ☐ | ☐ | ☐ |
| Mobile (375×667) | ☐ | ☐ | ☐ |

---

## 12. Automated suite (Playwright)

| # | Action | Pass? |
|---|--------|-------|
| 12.1 | From repo root: `BASE_URL=https://www.askbeforeyouapp.com pnpm --filter ask-before-you-app exec playwright test --config=tests/hci/playwright.config.ts` | ☐ |
| 12.2 | All projects (chromium, firefox, webkit, mobile-chrome, mobile-safari, tablet, accessibility) run; no failures | ☐ |
| 12.3 | HTML report generated: `pnpm --filter ask-before-you-app exec playwright show-report tests/hci/hci-report` | ☐ |

---

## 13. Full-run sign-off

- **Date:** _______________
- **Tester:** _______________
- **Environment:** https://www.askbeforeyouapp.com

| Section | All passed? |
|---------|-------------|
| 1. Smoke | ☐ |
| 2. Nav (no 404s) | ☐ |
| 3. Footer | ☐ |
| 4. Journey: Parent | ☐ |
| 5. Journey: Educator | ☐ |
| 6. Journey: Administrator | ☐ |
| 7. Journey: Student | ☐ |
| 8. Journey: Just learning | ☐ |
| 9. Page-by-page | ☐ |
| 10. Accessibility | ☐ |
| 11. Cross-device | ☐ |
| 12. Automated suite | ☐ |

**Notes / issues:** _______________________________________________
