# Cursor ↔ Chrome Extension Agent Coordination
## Two-Agent Workflow for WasatchWise / Wasatchville

**Last updated:** January 29, 2026  
**Purpose:** Define how Cursor (codebase) and the Claude Chrome Extension (in-browser) work together to get the project running to the nth degree.

---

## 🎯 Roles

| Agent | Where | Responsibilities |
|-------|--------|------------------|
| **Cursor** | IDE / codebase | Architecture, code changes, Supabase/API, env, migrations. Assigns tasks, interprets reports, fixes bugs. |
| **Chrome Extension** | Google Chrome (user's browser) | Execute tests in browser, click through flows, verify UI, run Lighthouse/a11y, **correct** things directly in the browser where possible. Report back with pass/fail, screenshots, and concrete issues. |

**Principle:** Cursor owns the repo; the extension owns the live experience. The extension can fix in-browser (e.g. form values, navigation, screenshots). For code/data/API fixes, it reports to Cursor and Cursor ships the fix.

---

## Agent context

### Affiliate program enrollment status

See **`civilization/realms/wasatchville/docs/AFFILIATE_ENROLLMENT_STATUS.md`** for current enrollment status.

**Current status:**

- **Amazon Associates:** ✅ Enrolled (wasatchwise20-20)
- **TikTok** (affiliate / Shop / Creator): ✅ Enrolled

**Directive:** Do not suggest signing up for these programs. Focus on configuration, payment info, product linking, n8n automation, disclosure compliance, and verification.

### Director of Awin Monetization (Chrome extension)

The Chrome extension can operate as **Director of Awin Monetization & Strategic Partnerships** for WasatchVille. Role: master Awin, maximize Booking.com (and Awin network) revenue across 10+ platforms, starting with slctrips.com. Extension explores Awin in browser and reports findings; Cursor implements code/config. See **`civilization/realms/wasatchville/docs/AWIN_MONETIZATION_SECTOR.md`** and **AGENT_ROSTER.md** (A011).

---

## 📡 How We Talk

### Cursor → Chrome Extension (task handoff)

Cursor will post **tasks** in one of these ways (you may see them in chat, in a shared doc, or in a dedicated file):

- **Format:** Clear objective + scope + success criteria + any URLs/env.
- **Example:**
  ```
  TASK: Validate Wasatchville command center Realtime
  SCOPE: apps/dashboard, route /dashboard/command-center
  URL: http://localhost:3000/dashboard/command-center (or production URL)
  SUCCESS: Building health bars update within ~2s after Supabase city_metrics UPDATE.
  REF: START_HERE_WASATCHVILLE.md Step 5.
  ```

### Chrome Extension → Cursor (report back)

Report back so Cursor can act without re-running the browser. Use this format (in chat, or in a file like `CHROME_AGENT_REPORT.md`):

```
REPORT: [Short title]
DATE: [Date]
TASK: [Task ID or title]

RESULT: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

WHAT I DID:
- [Bullet list of steps executed]

FINDINGS:
- [What you observed. Include: URL, viewport, any console errors, network failures]

SCREENSHOTS / EVIDENCE:
- [Paths or descriptions]

BUGS (if any):
- BUG: [One line]
  Steps: [1–3]
  Expected: [ ]
  Actual: [ ]
  Severity: Critical|High|Medium|Low

IN-BROWSER FIXES I MADE:
- [Anything you corrected directly in the browser]

NEEDS CURSOR (code/data/API):
- [List of issues that require codebase or backend changes]
```

**Critical:** For every **FAIL** or **NEEDS CURSOR** item, be specific (URL, selector, error message, response code) so Cursor can fix without guessing.

---

## 🌐 Scope

### Production (www.wasatchwise.com)

- **Ref:** `CLAUDE_CHROME_EXTENSION_TEST_PLAN.md` and `CLAUDE_EXTENSION_INSTRUCTIONS.md`
- Homepage, Quiz, WiseBot, Contact, Registry, Adult AI Academy
- Domain/DNS/SSL, responsive, a11y, performance

### Wasatchville / Dashboard

- **Command center:** Isometric city, building health, Realtime from `city_metrics`
- **URLs:** 
  - Local: `http://localhost:3000/dashboard/command-center`
  - Production: `https://www.wasatchwise.com/dashboard/command-center` (when deployed)
- **Ref:** `START_HERE_WASATCHVILLE.md`, `civilization/realms/wasatchville/`
- **Validate:** Realtime (update metric in Supabase → building updates in UI), pan/zoom, no console errors

### Other apps (when in scope)

- Ask Before You App, SLC Trips, etc. — Cursor will specify per task.

---

## ✅ Ramp-up checklist (Cursor + Chrome)

Use this to drive “get the project up to the nth degree”:

- [ ] **Domain:** www.wasatchwise.com loads, HTTPS, no mixed content
- [ ] **Marketing site:** HOME-001, QUIZ-001, WISEBOT-001, CONTACT-001, REGISTRY-001, AAA-001
- [ ] **Wasatchville Realtime:** Command center subscribed to `city_metrics`; health bars update on DB change
- [ ] **Responsive:** RESPONSIVE-001 (desktop, tablet, mobile)
- [ ] **Accessibility:** A11Y-001 (keyboard, focus, contrast, ARIA)
- [ ] **Performance:** PERF-001 (Lighthouse, Core Web Vitals)
- [ ] **Errors:** ERROR-001 (404, API errors, form validation)
- [ ] **Chrome agent report:** One consolidated report (or per-phase) with PASS/FAIL and NEEDS CURSOR list

---

## 🔧 Where things live

| Need | Location |
|------|----------|
| **Wiring prompt (n8n, Stripe, Amazon, slctrips, dashboard)** | **`docs/guides/CLAUDE_CHROME_EXTENSION_WIRING_PROMPT.md`** – copy-paste for Chrome extension to wire everything on site |
| Full HCI test plan | `CLAUDE_CHROME_EXTENSION_TEST_PLAN.md` |
| Extension mission & quick checklist | `CLAUDE_EXTENSION_INSTRUCTIONS.md` |
| Wasatchville execution (DB + Realtime) | `START_HERE_WASATCHVILLE.md` |
| Realm spec & buildings | `civilization/realms/wasatchville/` |
| Dashboard app | `apps/dashboard/` |
| This coordination protocol | `CURSOR_CHROME_AGENT_COORDINATION.md` |

---

## 📝 Notes for Chrome Extension

1. **You have a co-worker (Cursor).** You execute in the browser and report back; Cursor will fix code, env, and data. Don’t assume you’re alone.
2. **Correct in-browser when possible:** Fill forms, retry flows, adjust viewport, capture screenshots. If something needs a code or API change, put it in **NEEDS CURSOR**.
3. **Be specific in reports:** Include URLs, selectors, console/network errors, and severity so Cursor can fix quickly.
4. **Use the test plan:** Follow `CLAUDE_CHROME_EXTENSION_TEST_PLAN.md` for production; use task handoffs above for Wasatchville and one-off checks.

---

## 📝 Notes for Cursor

1. **Chrome extension is in the user’s browser.** Assign tasks with clear success criteria and URLs (local vs prod).
2. **Expect reports in the format above.** Parse RESULT, FINDINGS, BUGS, and NEEDS CURSOR; fix code/API/DB and re-assign verification if needed.
3. **Wasatchville:** Realtime is validated; next steps (RLS, SendGrid, residents, etc.) can be split into Cursor tasks + browser verification where relevant.

---

**Status:** Active. Use this doc for all Cursor ↔ Chrome Extension handoffs and reports.
