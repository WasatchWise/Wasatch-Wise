# Ask Before You App — HCI Design Framework

**Purpose:** Human-Computer Interaction design blueprint for the ABYA campaign site. Defines principles, personas, interaction patterns, and evaluation criteria to guide design decisions and QA.

**Scope:** Campaign site (askbeforeyouapp.com), certification flow, state ecosystems, tools (Quiz, WiseBot, Registry), and Clarion. Excludes DAROS dashboard (separate HCI framework).

**Last updated:** February 2026

---

## 1. Design Principles

### 1.1 Highest Uptake with Least Resistance

The campaign aims to educate and empower stakeholders without friction. Every interaction should:

- **Reduce anxiety** — Users arrive with privacy concerns; the site should reassure, not overwhelm.
- **Enable quick wins** — Within 30 seconds, any persona should feel "this is for me."
- **Respect attention budget** — Session lengths vary (Parent: 15 min; Administrator: 5 min; Teacher: 3 min). Design for the shortest budget; deeper content remains available.
- **Avoid jargon** — Plain language first; technical terms only when necessary (e.g., DPA, FERPA) with inline explanation.

### 1.2 Invisible Tutorial (Mario 1-1)

Teach through doing, not instruction. The interface should:

- **Reveal affordances** — Buttons and links look clickable; state changes are visible; feedback is immediate.
- **Progressive disclosure** — Start simple; complexity emerges when the user seeks it (e.g., state overview → full Utah guide).
- **Recover from mistakes** — Validation errors are clear; users can correct without losing progress.
- **No dead ends** — Every page offers a next step (back, related link, CTA).

### 1.3 Persona-Aware, Not Persona-Locked

- **Who modal** personalizes copy and suggested paths but does *not* gate content.
- **"Just learning"** is a valid entry; users can explore without commitment.
- **Cross-persona paths** — A Parent may want Certification; an Educator may want state laws. Navigation supports all paths.

### 1.4 Trust and Transparency

- **SDPC alignment** — Prominent connection to SDPC framework and A4L.
- **State data** — Clear distinction between "full guide" (Utah) and "overview" (all states); no false promises.
- **Contact and escalation** — Easy path to ask questions or request support.

---

## 2. Personas and Audiences

### 2.1 ABYA Audiences (Product)

| Audience        | Primary need                         | Entry point       | Success metric                    |
|-----------------|--------------------------------------|-------------------|-----------------------------------|
| Parent          | Verify child data is protected       | Who modal, Learn  | Finds "what to ask" in &lt; 2 min  |
| Educator        | Know which tools are approved        | Certification, Learn | Starts certification or finds state info |
| Administrator   | Compliance and policy posture        | State resources   | Finds state laws and contacts     |
| Student         | Understand rights and what to ask    | Who modal, Learn  | Sees self represented             |
| Just learning   | Explore without commitment           | Home, Learn       | Can browse without friction       |

### 2.2 HCI Archetypes (Testing)

| Archetype        | Maps to ABYA      | Cognitive load | Session length | Mobile % |
|------------------|-------------------|----------------|----------------|----------|
| Parent           | Parent            | Moderate       | 15 min         | 80%      |
| Teacher          | Educator          | Low            | 3 min          | 70%      |
| Superintendent   | Administrator     | Low            | 5 min          | 60%      |
| IT Director      | Administrator     | High           | 30 min         | 20%      |
| Board Member     | Administrator     | Low            | 10 min         | 40%      |
| Consultant       | Educator/Admin    | High           | 60 min         | 30%      |

### 2.3 Persona Constraints (Design Limits)

| Persona          | Max clicks to goal | Max load patience | Preferred format           |
|------------------|--------------------|-------------------|----------------------------|
| Superintendent   | 3–4                | 2 s               | Visual, checklist          |
| Teacher          | 2–3                | 2 s               | Checklist, video           |
| Parent           | 4–5                | 3 s               | Text, visual               |
| Board Member     | 4–5                | 3 s               | Visual, text               |
| IT Director      | 6+                 | 5 s               | Checklist, text            |
| Consultant       | 6+                 | 5 s               | Checklist, visual          |

---

## 3. Interaction Patterns by Feature

### 3.1 Home Page

| Pattern              | Implementation                                      |
|----------------------|-----------------------------------------------------|
| One habit, one hero  | "Before you download that app—ask."                 |
| Who are you?         | Modal with 5 options; non-blocking; persists choice |
| Audience cards       | Parent, Educator, Administrator, Student — clear CTAs |
| Primary nav          | Knowledge hub, Certification, State resources, Tools, Contact |
| Trust signals        | SDPC, A4L, orange brand                             |

### 3.2 Knowledge Hub (Learn)

| Pattern              | Implementation                                      |
|----------------------|-----------------------------------------------------|
| Persona shortcuts    | "I'm a parent" / "I'm an educator" — scroll or update |
| Sections             | Understand apps, State laws, Be an advocate, Certification |
| State selector       | Quick link to ecosystem                             |
| Progressive depth    | Overview → linked state pages                       |

### 3.3 Certification

| Pattern              | Implementation                                      |
|----------------------|-----------------------------------------------------|
| Module list          | Foundations, Document Anatomy, DPA Workflow, Registry Ninja |
| Single entry         | "Start" or first module — no gate                   |
| State context        | Optional state param for future personalization     |
| Progress             | localStorage per module; visible progress bar       |
| Interruption recovery| Resume from last lesson (when implemented)          |

### 3.4 State Resources (Ecosystem)

| Pattern              | Implementation                                      |
|----------------------|-----------------------------------------------------|
| State grid           | All 51 states clickable; visual distinction for full vs overview |
| Full guide (Utah)    | Blue highlight, green dot; laws, roles, workflows   |
| Overview (others)    | Laws, compliance, contacts; "full guide in development" |
| No dead ends         | "Coming soon" states still show overview or link to Utah |
| SDPC count           | Visible trust metric                               |

### 3.5 Tools (Quiz, WiseBot, Registry)

| Tool                 | Pattern                                             |
|----------------------|-----------------------------------------------------|
| AI Readiness Quiz    | Step-by-step; email capture for results; resumable (localStorage) |
| WiseBot              | Chat interface; streaming; voice option             |
| Vendor Registry      | Link-out or embed to SDPC; placeholder OK           |

### 3.6 Contact and Request

| Pattern              | Implementation                                      |
|----------------------|-----------------------------------------------------|
| Contact form         | Clear labels; role selector; validation feedback    |
| Request an app       | Stub or DB-backed; confirmation message             |
| Error recovery       | Inline validation; resubmit without losing data     |

---

## 4. Cognitive Load Design

### 4.1 Information Density by Page

| Page          | Target density | Rationale                                    |
|---------------|----------------|----------------------------------------------|
| Home          | Low            | One message; minimal decisions               |
| Learn         | Medium         | Sections; scan or dive                       |
| Certification | Medium–high    | Modules; progressive depth                   |
| Ecosystem     | Low (grid)     | State grid is scannable; state page medium   |
| State (Utah)  | High           | Full content; allow scroll and skim          |
| Contact       | Low            | Form only; no extra content                  |
| Quiz          | Low per step   | One question at a time                       |

### 4.2 F-Pattern and Scan Patterns

- **Home, Learn:** F-pattern — headline, subtext, cards left-to-right.
- **State grid:** Spotted pattern — state codes scannable; Utah stands out.
- **Certification modules:** Layer-cake — headings and sections; quick jump via nav.
- **Forms:** Commitment — label above input; single column.

### 4.3 Educational Friction

Intentional friction that teaches correct behavior:

- **State selector:** Click state → see overview or full guide; teaches "your state has info."
- **Who modal:** Choosing role → tailored copy; teaches "we have content for you."
- **Quiz:** One question at a time → prevents overwhelm; teaches assessment structure.
- **Certification:** Module structure → teaches DPA workflow sequence.

---

## 5. Accessibility Requirements (WCAG 2.1 AA)

| Requirement        | Implementation                                       |
|--------------------|------------------------------------------------------|
| Alt text           | Every `img` has `alt` (empty for decorative)         |
| Heading order      | One h1; logical h2/h3 hierarchy                      |
| Focus visible      | Visible focus ring on all interactive elements       |
| Keyboard nav       | All primary flows achievable with keyboard only      |
| Form labels        | Every input has associated label or aria-label       |
| Color independence | State "full" vs "overview" not by color alone        |
| Modal focus        | Focus trap in Who modal; return on close             |
| Reduced motion     | Respect `prefers-reduced-motion` where applicable    |

---

## 6. Cross-Device and Viewport

| Viewport     | Priority   | Key constraints                                |
|--------------|------------|------------------------------------------------|
| Desktop      | Primary    | Full nav; state grid 10 columns                |
| Tablet       | Secondary  | Responsive grid; touch targets ≥ 44px          |
| Mobile       | Critical   | Hamburger nav; stacked cards; state grid 5 cols|

**Mobile-first check:** Parent and Teacher are 70–80% mobile; critical journeys must work on 375px width.

---

## 7. Evaluation Framework

### 7.1 Success Metrics

| Metric                    | Target                           | How to measure                    |
|---------------------------|-----------------------------------|-----------------------------------|
| Time to first value       | &lt; 30 s for any persona         | HCI scenario timing               |
| Clicks to goal            | ≤ persona max (see 2.3)           | Playwright click count            |
| Task completion rate      | &gt; 95% for critical journeys    | Manual + automated                |
| Accessibility score       | WCAG 2.1 AA pass                  | axe, manual audit                 |
| Cross-device parity       | All journeys on mobile            | Responsive Playwright projects    |
| Error recovery            | 1 error allowed; must recover     | Form validation scenarios         |

### 7.2 HCI Test Artifacts

| Artifact                         | Purpose                                      |
|----------------------------------|----------------------------------------------|
| [HCI_TEST_PLAN_SDPC_LEADERSHIP.md](./HCI_TEST_PLAN_SDPC_LEADERSHIP.md) | Manual checklist for demos and releases      |
| [HCI_FULL_RUN.md](./HCI_FULL_RUN.md)           | Comprehensive run before sign-off            |
| [HCI_TEST_REPORT_2026-02-05.md](./HCI_TEST_REPORT_2026-02-05.md) | Feb 2026 production run results              |
| `tests/hci/`                     | Playwright automated suite                   |
| `lib/hci/scenarios.ts`           | Canonical scenario definitions               |
| `tests/hci/fixtures/personas.ts` | Persona constraints for automation           |

### 7.3 Scenario Coverage Matrix

| Scenario                | Parent | Educator | Admin | Student | Just learning |
|-------------------------|--------|----------|-------|---------|---------------|
| Home → Learn            | ✓      | ✓        | ✓     | ✓       | ✓             |
| Home → Ecosystem        | ✓      | ✓        | ✓     | ✓       | ✓             |
| Home → Certification    | ✓      | ✓        | ✓     | ✓       | —             |
| Who modal → tailored    | ✓      | ✓        | ✓     | ✓       | —             |
| State page (any state)  | ✓      | ✓        | ✓     | ✓       | ✓             |
| Quiz completion         | ✓      | ✓        | ✓     | ✓       | ✓             |
| Contact form            | ✓      | ✓        | ✓     | ✓       | ✓             |
| WiseBot query           | ✓      | ✓        | ✓     | ✓       | ✓             |

---

## 8. Design Decision Log

Use this section to record HCI-relevant decisions for future reference.

| Date  | Decision                                      | Rationale                                    |
|-------|------------------------------------------------|----------------------------------------------|
| —     | All states clickable; Utah full, others overview | No dead ends; foundation data for 50+DC      |
| —     | Who modal non-blocking                         | Just learning can explore without commitment |
| —     | Certification modules all open                 | Reduce friction; optional sequence           |
| —     | State in certification URL param               | Prep for state-specific content              |

---

## 9. Implementation Roadmap

### Phase 1: Baseline (Current)

- [x] Smoke tests
- [x] Critical journeys by persona
- [x] Page-by-page checklist
- [x] Playwright archetype and scenario tests
- [x] WCAG-oriented accessibility tests

### Phase 2: Alignment

- [ ] Map HCI archetypes to ABYA audiences in UI (Board member, Consultant paths)
- [ ] Add "Coming Soon" state legend clarity (all states clickable)
- [ ] Fix Services anchor or nav (per GAPS_OMISSIONS)
- [ ] Quiz interruption recovery (localStorage persist)

### Phase 3: Enhancement

- [ ] Certificate page and optional PDF
- [ ] Certification progress in DB (cross-device)
- [ ] State-specific certification copy (when state in URL)
- [ ] Reduced motion support

### Phase 4: Measurement

- [ ] Analytics events for persona selection and journey completion
- [ ] Time-to-first-value tracking
- [ ] Session recording for UX research (opt-in)

---

## 10. References

- **AUDIENCES.md** — ABYA audience definitions
- **GAPS_OMISSIONS_USE_CASES.md** — Coverage gaps and persona mapping
- **HCI_TEST_PLAN_SDPC_LEADERSHIP.md** — Manual test plan
- **HCI_FULL_RUN.md** — Full run checklist
- **tests/hci/README.md** — DAROS HCI suite and persona definitions
- **lib/hci/scenarios.ts** — Scenario definitions (quiz, contact, etc.)
