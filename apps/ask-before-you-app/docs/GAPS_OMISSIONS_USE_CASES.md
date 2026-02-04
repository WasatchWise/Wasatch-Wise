# Ask Before You App — Gaps, Omissions, Unfinished Work, Dynamic Options, Use-Case Coverage

**Purpose:** Single reference for what’s missing, what’s thin, how to be more dynamic, and how to cover all audiences and scenarios.

**Date:** Feb 3, 2026

---

## 1. Gaps (Things We Said We’d Do but Haven’t Finished)

### 1.1 Certification (NDPA)

| Gap | Where | Impact |
|-----|--------|--------|
| **Quiz per module** | Plan: `/certification/quiz/[moduleId]`. Built: none. | No knowledge check or “passed” state after each module. |
| **Certificate page / PDF** | Plan: `/certification/certificate` + PDF generation. Built: none. | No shareable “I completed NDPA certification” proof. |
| **Progress in DB** | Plan: `certification_progress` table, resume across devices. Built: localStorage only per module. | Progress lost on new device/incognito; no completion reporting. |
| **Module lock/unlock** | Plan: complete Module N before N+1. Built: all modules open. | Users can skip; no enforced sequence. |
| **User registration + state selection** | Plan: state at sign-up, state-specific wording. Built: no sign-up for certification. | Content is state-agnostic; no “your state” personalization in course. |
| **Embedded video** | Plan: video in lessons. Built: markdown only. | No video assets in course. |

*Note: NDPA_CERTIFICATION_COURSE_PLAN.md still says “Module 3/4 Content (Needed)” but `course-content.ts` has full MODULE_3 and MODULE_4 content; the plan doc is out of date.*

### 1.2 Request an App Review

| Gap | Where | Impact |
|-----|--------|--------|
| **Persist submissions** | `app/request/page.tsx`: “For now, just simulate submission.” No DB or email. | Requests are not stored or forwarded; no follow-up. |

### 1.3 Stripe / Fulfillment

| Gap | Where | Impact |
|-----|--------|--------|
| **Post-purchase emails** | `app/api/ask-before-you-app/webhook/route.ts`: `// TODO: Send email notification to you (admin)` and `// TODO: Send confirmation email to customer`. | After certification purchase, no automated emails. |

### 1.4 DAROS / Dashboard

| Gap | Where | Impact |
|-----|--------|--------|
| **Vendors bulk import UI** | `lib/daros/README.md`: “Vendors bulk import (placeholder page in place).” API `import-uspa` exists. | No full UI flow for district vendor import in dashboard. |

### 1.5 Artifacts / PDF

| Gap | Where | Impact |
|-----|--------|--------|
| **PDF generation** | `lib/daros/artifacts.ts`: `// TODO: Generate PDF and upload to storage`. | Artifact download is not PDF; may be JSON or other format only. |

### 1.6 Navigation / Home

| Gap | Where | Impact |
|-----|--------|--------|
| **Services anchor** | Header links to `/#services`. ABYA home has no `id="services"`. | Clicking “Services” goes to `/` but doesn’t scroll to a section. |

---

## 2. Omissions (Things We Never Built or Explicitly Scoped Out)

### 2.1 State Ecosystems

- **Only Utah in code.** All other states show “Coming Soon” or “Not Yet Available.” No fallback (e.g. federal law + “how to find your state’s page”) for non-Utah users.
- **Optional `states` table** (008_states.sql) not required for v1; listing comes from `ALL_STATES` + `getStateEcosystem()`. If you want “which states have content” in DB or admin, you’d run that migration and seed.

### 2.2 Certification (Advanced)

- **Real SDPC Registry API integration** — We link out to sdpc.a4l.org; no search/embed in-app.
- **Practice scenarios / simulations** — No “practice DPA classification” or scenario drills.
- **State-specific content switching** — No “[Your State]’s audit provisions” in course copy.
- **Admin dashboard for alliance managers** — No ABYA UI for SDPC/alliance admins to see completions.
- **Completion reporting to SDPC** — No webhook or API to report certification completion.
- **LTI integration** — No Canvas/LMS embed.

### 2.3 Audiences vs HCI Personas

- **ABYA audiences:** Parent, Educator, Administrator, Student, Just learning (5).
- **HCI test personas:** Superintendent, IT Director, Teacher, Board Member, Parent, Consultant (6).
- **Omission:** No distinct “Board member” or “Consultant” in the Who modal. Board member likely uses Administrator; Consultant may use Administrator or Just learning. If you want full HCI coverage in-product, consider adding Board member and/or Consultant to the modal and tailoring copy.

### 2.4 Student-Specific Depth

- Student is an audience and gets learn#apps and “what to ask / your rights.” Certification page says “this course is for educators and admins” and points students to the hub. No dedicated “Student rights” or “What students can ask” deep-dive page.

### 2.5 Non-SDPC States / Int’l

- No content for states that aren’t SDPC members (e.g. Alaska) beyond “Not Yet Available.” No international or “outside US” path.

### 2.6 Accessibility & i18n

- **i18n:** No localization; English only.
- **Accessibility:** HCI includes accessibility tests; not every flow may be audited (keyboard nav, screen reader, reduced motion). Worth a pass.

---

## 3. Unfinished (In Progress or Stubbed)

| Item | Status | Next step |
|------|--------|-----------|
| Request form | Stub (simulate only) | Wire to Supabase table + optional email/webhook (e.g. same pattern as contact). |
| Stripe webhook emails | TODO in code | Implement admin + customer email on successful payment. |
| Certification quizzes | Not started | Add `/certification/quiz/[moduleId]` and optional progress/DB. |
| Certificate | Not started | Add `/certification/certificate` and optional PDF. |
| Daros vendors import | Placeholder UI | Build full import flow in dashboard using `import-uspa` API. |
| Artifact PDF | TODO in code | Implement PDF generation and storage for Daros artifacts. |
| Services on home | Missing anchor | Add `id="services"` to a home section or change Header “Services” to `/learn`. |

---

## 4. Ways to Be More Dynamic

### 4.1 Data-Driven Instead of Hard-Coded

| Today | More dynamic option |
|-------|---------------------|
| State ecosystems in code (`lib/ecosystem/states/utah.ts`) | Load from API or CMS; or `state_ecosystems` table (JSONB per state) so non-devs can add/update states. |
| “Guides Ready” count = `Object.keys(STATE_ECOSYSTEMS).length` | Derive from DB or build-time manifest so it updates as states are added. |
| SDPC member count = `SDPC_MEMBER_STATES.length` | Periodic sync from SDPC or config so the number stays current. |
| Certification content in `course-content.ts` | Move to CMS or DB for non-dev edits and versioning. |

### 4.2 Persona-Driven Experience

| Today | More dynamic option |
|-------|---------------------|
| Persona sets learn hash (e.g. admin → #state-laws) and a line of copy on learn/certification/ecosystem | **Default landing by persona:** Parent → learn#apps; Educator → certification; Administrator → ecosystem or learn#state-laws; Student → learn#apps + optional “Student rights” section; Just learning → learn. |
| Same certification order for everyone | **Suggested path by role:** Educator: M0 → M1 → M2 → M3 → M4; Administrator: M0 → M1 then ecosystem, then M2–M4; Parent/Student: “Start with Understand apps” and optionally M0 only. |
| Ecosystem: one state grid for all | **“Your state” from IP or profile:** Prefer user’s state in grid or show it first (with consent). |

### 4.3 Real Integrations

| Today | More dynamic option |
|-------|---------------------|
| Link out to SDPC Registry only | **Registry search in-app:** Embed or iframe sdpc.a4l.org search, or use Registry API if available so users search without leaving ABYA. |
| No completion reporting | **Completion webhook/API:** On certification complete, POST to SDPC or alliance endpoint (if they provide one). |
| Contact/request forms | **CRM or n8n:** Already have lead router webhook for contact; add request form to same pipeline and tag as “app review request.” |

### 4.4 Freshness and Trust

| Today | More dynamic option |
|-------|---------------------|
| “Last updated” in state ecosystem is static in code | **Last updated from CMS/DB** or from a simple “last content deploy” timestamp. |
| No “What’s new” or changelog | **Blog or changelog** (even a single page) for NDPA updates, new states, new tools. |

---

## 5. Use-Case Coverage (Are We Hitting Everyone?)

### 5.1 By ABYA Audience

| Audience | Primary need | What we do today | Gaps / improvements |
|----------|--------------|-------------------|----------------------|
| **Parent** | Know what apps touch my kid’s data; what to ask. | Who modal → learn#apps; SDPC Registry link; “what to ask” copy; student rights in hub. | Optional: dedicated “Parent checklist” or one-pager; optional email series. |
| **Educator** | Vet tools; get certified; know the rules. | learn#apps, #certification; full certification course; ecosystem by state. | Quizzes + certificate would complete “I’m certified” use case. |
| **Administrator** | State laws, roles, compliance; board-ready story. | Who modal → learn#state-laws; ecosystem (Utah full); certification with “you might want state laws first.” | Optional: “Board one-pager” or DAROS briefing CTA more prominent; more states. |
| **Student** | What are my rights? What can I ask? | learn#apps; “your rights”; certification page redirects to hub. | Optional: “For students” micro-section or page (rights + 3 questions to ask). |
| **Just learning** | Verify before trust; get oriented. | Who modal → learn#apps; generic copy; all sections available. | Good; optional “Start here” path (one page that links to apps + state + certify). |

### 5.2 By HCI Persona (If We Want Parity)

| HCI Persona | Maps to ABYA | Covered? | Note |
|-------------|--------------|----------|------|
| Superintendent | Administrator | Yes | Ecosystem + certification + “state laws first.” |
| IT Director | Administrator | Yes | Same; could add “IT checklist” later. |
| Teacher | Educator | Yes | Certification + learn#apps. |
| Board Member | Administrator | Partial | Same content; no “board member” label; could add CTA to DAROS briefing. |
| Parent | Parent | Yes | learn#apps, SDPC Registry, what to ask. |
| Consultant | Administrator or Just learning | Partial | No “Consultant” in modal; could add and tailor (e.g. “Resources for consultants”). |

### 5.3 By Scenario

| Scenario | Covered? | Note |
|----------|----------|------|
| “I’m a parent, I want to know what to ask the school.” | Yes | learn#apps, SDPC Registry, request form. |
| “I’m a teacher, I want to get certified.” | Yes (content) | Full course; missing quiz + certificate for “proof.” |
| “I’m an admin, I need my state’s laws and contacts.” | Yes for Utah | Other states: “Coming Soon”; no fallback content. |
| “I’m a student, what are my rights?” | Partial | Copy in hub; no dedicated student page. |
| “I want to suggest an app for you to review.” | Stub | Request form doesn’t persist. |
| “I’m in a non-SDPC state (e.g. Alaska).” | No | Grid shows “Not Yet Available”; no federal-only or “find your state” guidance. |
| “I need a certificate to show my district.” | No | No certificate page/PDF. |
| “I’m a consultant helping a district.” | Partial | Can use Administrator; no consultant-specific entry. |

---

## 6. Prioritized “Close the Gaps” List

**High impact, relatively contained:**

1. **Request form** — Persist to Supabase (e.g. `app_requests` or `email_captures` with source) and/or send to lead router; same pattern as contact.
2. **Stripe webhook** — Send admin + customer emails on successful certification purchase.
3. **Services link** — Add `id="services"` to a home section (e.g. “What you get”) or set Header “Services” to `/learn`.

**Medium impact, more work:**

4. **Certification quiz** — One quiz per module (e.g. 3–5 questions), store in localStorage or DB, show “Module complete” before next.
5. **Certificate page** — `/certification/certificate` after all modules; optional PDF download (e.g. react-pdf or server-side PDF).
6. **Student “rights”** — One short section or page: “What students can ask / your rights” with 3–5 bullets and link to FERPA/state.

**Lower priority / later:**

7. **More states** — Add 1–2 more state ecosystems (e.g. CA, TX) from research plan; or “Federal + how to find your state” for non-Utah.
8. **Daros vendors import** — Full UI in dashboard.
9. **Artifact PDF** — Implement in Daros.
10. **Board member / Consultant** — Add to Who modal and one line of copy each; optional “Consultant resources” page.

---

## 7. Summary

- **Gaps:** Certification (quizzes, certificate, DB progress), request form (no persist), Stripe emails (TODO), Daros (vendors import, artifact PDF), Services anchor.
- **Omissions:** More states, SDPC Registry in-app, completion reporting, LTI, state-specific course copy, student deep-dive, non-SDPC fallback, i18n, Board/Consultant in modal.
- **Unfinished:** Request stub, webhook emails, artifact PDF, vendors import UI.
- **More dynamic:** Data-driven states/counts, persona-based default landings and paths, Registry in-app, completion webhook, “last updated” and changelog.
- **Use cases:** Parent, Educator, Administrator, and Just learning are well covered; Student is partial; Board member and Consultant are implicit (Administrator). Non-Utah and “I need a certificate” are the main missing scenarios.

Use this doc to decide what to do next (e.g. request form + webhook emails + Services for quick wins, then quizzes + certificate for “certification complete” story).
