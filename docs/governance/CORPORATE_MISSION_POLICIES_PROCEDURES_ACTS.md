# Wasatch Wise LLC — Corporate Mission, Policies, Procedures & Regulatory Acts

**Effective:** February 9, 2026  
**Authority:** Founder / Wasatch Wise LLC  
**Cross-walk:** Monday Corporate Briefing (2/9), Sabrina Ramonov Focus Playbook, Brand Positioning, Three-Brand Empire Strategy

---

## 1. Corporate Mission Statement

**Wasatch Wise LLC exists to help organizations and individuals use AI safely, wisely, and effectively—through governance, education, and tooling—without over-diversifying.**

- **We do:** One coherent lane—AI readiness, safety, and literacy—expressed through a small number of focused brands and ventures (WasatchWise / Ask Before You App / Adult AI Academy, plus supporting products that directly serve that lane).
- **We do not:** Chase unrelated markets, add ventures that dilute focus, or say yes to opportunities that do not clearly advance our primary strategy. We protect builder time and operational clarity so execution quality and volume can compound.

*Aligned with:* Focus playbook (one mission, one lane, say no to 99.9%); briefing recommendation to reduce cognitive overhead from 12 ventures and to fix automations before adding scope.

---

## 2. Policies

### 2.1 Primary Focus Policy

- At any time, **no more than 2–3 ventures** may be designated **Primary Focus** (ACTIVE — Primary Focus in the Monday briefing).
- All other ventures are classified per the Venture Lifecycle (Active/Platform, Moderate, Needs Attention, Setup/Early Dev, Dormant, Future, Planned).
- Resource allocation (time, commits, automation work, content) favors Primary Focus ventures. Other ventures receive maintenance or targeted sprints only when consistent with quarterly Clarity outcome.
- **Current Primary Focus (as of 2/9):** Ask Before You App, SLC Trips. Dashboard/DAROS is Platform (enables other ventures). All other ventures are subject to status review per Dormant Venture Act.

### 2.2 Venture Lifecycle Policy

Ventures are classified and reviewed as follows:

| Status | Definition | Action |
|--------|------------|--------|
| **ACTIVE — Primary Focus** | Core to revenue or strategic goal; receives majority of build time | Maintain; measure weekly |
| **ACTIVE — Platform** | Shared infrastructure (e.g. Dashboard/DAROS); enables other ventures | Maintain; no feature creep unless it serves Primary Focus |
| **MODERATE** | In use but not primary; receives periodic updates | Scheduled maintenance; no new major scope without Clarity alignment |
| **NEEDS ATTENTION** | Broken automations, failing CI, or known blockers | P0 until restored to MODERATE or explicitly deprioritized |
| **SETUP / EARLY DEV** | In development; not yet launched | Time-box; either activate or move to Dormant/Future |
| **DORMANT** | No active development; scaffolding or legacy only | Subject to Dormant Venture Act (archive or activate) |
| **FUTURE / PLANNED** | Notion or roadmap only; no code commitment yet | No resource allocation until promoted to Setup or Active |

Reclassification happens during **Venture Status Review** (see Procedures).

### 2.3 What We Do Not Do (Exclusion Policy)

The following are **out of scope** unless explicitly approved as strategic:

- **Unrelated product lines** (e.g. entertainment apps, non-AI SaaS, pure content plays that do not feed the AI-readiness lane).
- **New ventures** that do not map to WasatchWise / Ask Before You App / Adult AI Academy / DAROS or their direct supporting products (e.g. SLC Trips as travel/concierge tied to brand; Pipeline IQ as lead-gen tool for enterprise).
- **Meetings, partnerships, advisory, coaching, speaking, or “opportunities”** that do not have a clear, long-term strategic tie to a Primary Focus venture or Platform. Default is **no**; yes requires written one-line strategic reason.
- **Permanent “scaffolding-only” ventures.** Ventures that remain in Dormant with only 1–2 commits for multiple months must be either activated with a time-boxed plan or archived (see Dormant Venture Act).

*Aligned with:* Sabrina’s “be very explicit in the things I DO NOT DO” and Blotato-style “who it’s NOT for.”

### 2.4 Opportunity Filter Policy

- **Default: decline.** Say no to the vast majority of inbound (meetings, collabs, podcasts, advisory, investment, partnership, mentorship, speaking).
- **Yes only when:** There is a long-term strategic reason tied to a Primary Focus venture or Platform (e.g. revenue-generating partner, distribution that drives newsletter or product signups).
- **Principle:** “Everyone knocking on your door today will still be knocking when you’re 10x further along. No FOMO.” (Focus playbook.)

### 2.5 Automation Integrity Policy

- **Failing automations are P0** until fixed or explicitly retired.
- Any scheduled automation (e.g. GitHub Actions scrapers, N8N workflows) that fails repeatedly must be:
  - **Fixed** within the current sprint, or
  - **Temporarily disabled** with a ticket to fix or retire, or
  - **Retired** with documentation and any dependent processes updated.
- No new automations for non–Primary Focus ventures until all P0 automation failures are resolved.
- **Current P0 (as of 2/9):** Pipeline IQ — Construction Wire scrapes (both scheduled jobs); restore or retire.

### 2.6 Security & Hygiene Policy

- **Security:** All CVE/fix PRs (e.g. React Server Components, dependency bumps) must be reviewed and either merged or closed within **10 business days**. No PR may remain in open draft for 20+ days without a decision.
- **Git:** No broken refs (e.g. `main 2` with space). Stale stashes must be reviewed and either applied or dropped each quarter to avoid bitrot.
- **CI:** Failures on the main monorepo or primary app repos are P1; fix or revert within 48 hours.

---

## 3. Procedures

### 3.1 Monday Corporate Briefing Procedure

- **Cadence:** Every Monday (or first working day of the week).
- **Owner:** Founder or designated agent.
- **Contents:**
  - Corporate overview (entity, structure, infrastructure).
  - Department status for **all** ventures (one line per venture: name, domain, status, recent activity).
  - Urgent action items (failing automations, security PRs, blockers).
  - Week priorities table (P0 / P1 / P2 by department).
  - Month strategic outlook (goals by venture).
  - Infrastructure health (Cloudflare, Supabase, Vercel, N8N).
  - Key metrics (commits, fix:feature ratio, active vs dormant apps, failing automations, open PRs).
  - Recommendation (top 3 things to address).
- **Output:** Published to terminal, Notion, or `docs/reports/` as appropriate. Used to drive P0/P1/P2 and to check compliance with Primary Focus and Automation Integrity policies.

### 3.2 Weekly Priority Procedure

- **Cadence:** Same as briefing; priorities are set in the Monday briefing.
- **Levels:**
  - **P0:** Must be done this week (e.g. fix failing scrapers, merge/close security PR).
  - **P1:** Primary Focus and Platform work; continue key initiatives.
  - **P2:** Important but not blocking; N8N review, git cleanup, content schedule.
- **Rule:** No more than 3 P0 items per week. If there are more, the list is reprioritized so only the top 3 are P0.
- **Tracking:** Notion (My Week, Overdue, By Status); briefing table is the single source of truth for the week.

### 3.3 Quarterly Clarity Procedure

- **Cadence:** Once per quarter (e.g. first week of Jan, Apr, Jul, Oct).
- **Purpose:** Identify the **one** highest-leverage activity and reduce busy work (per Sabrina Clarity Prompt Chain).
- **Steps:**
  1. **Inventory** — Exhaustive list of everything the corporation/Founder does (ventures, ops, content, meetings, admin). Optional: calendar screenshots.
  2. **Priority** — With AI or written analysis: What are the **top 3 activities** that drive 80%+ of results? Clarifying questions until 95% confident.
  3. **Clarity** — What is the **1 thing** that makes all other tasks/goals 10x easier? That becomes the strategic focus for the quarter.
- **Output:** One-page Clarity outcome; used to set Primary Focus and to justify saying no to everything else. Venture Status Review (below) should align with this outcome.

### 3.4 Venture Status Review Procedure

- **Cadence:** At least once per quarter (can coincide with Clarity).
- **Steps:**
  1. List every venture with current status (from briefing).
  2. For each **DORMANT** or **NEEDS ATTENTION** venture: decide **Activate** (with time-box and success criteria), **Archive** (document and reduce to minimal presence in monorepo), or **Leave as-is** (with next review date).
  3. Enforce **Primary Focus Policy:** confirm no more than 2–3 Primary Focus; adjust if needed.
  4. Update Monday briefing template and Notion so status labels match.
- **Output:** Updated venture list and any archive/activation decisions; Dormant Venture Act compliance.

### 3.5 Automation Health Check Procedure

- **Cadence:** Weekly (as part of briefing) and on-demand when failures are reported.
- **Steps:**
  1. List all scheduled automations (GitHub Actions, N8N, cron).
  2. For each: last run, pass/fail, and owner (venture or shared).
  3. Any failure → create or update P0 item (fix or retire).
  4. Report in briefing under “Urgent” and “Infrastructure health.”
- **Output:** No silent failures; Automation Integrity Policy upheld.

### 3.6 Git Hygiene Procedure

- **Cadence:** Ad hoc when warnings appear; quarterly as part of Clarity or Venture Status Review.
- **Steps:**
  1. Remove broken refs (e.g. `git update-ref -d "refs/heads/main 2"`).
  2. List stashes; for each: apply and commit, or drop, or document and keep.
  3. Ensure main/default branch CI is green; address security PRs per Security & Hygiene Policy.
- **Output:** Clean refs, no long-lived stashes, security PRs resolved.

---

## 4. Regulatory Acts

The following **Regulatory Acts** are internal “laws” of Wasatch Wise LLC. They codify the policies and procedures above and are referenceable in briefings, Notion, and decision logs.

### 4.1 Primary Focus Act

- **No more than 2–3 ventures** may hold **Primary Focus** at any one time.
- Resource allocation (time, commits, automations, content) **must** favor Primary Focus.
- Reclassification of Primary Focus is done during Venture Status Review or Clarity; no ad hoc promotion without a strategic reason.

### 4.2 Dormant Venture Act

- **Dormant** = no active development; scaffolding or legacy only.
- **No venture may remain Dormant indefinitely** without a decision: **Activate** (with time-box and success criteria) or **Archive** (document, minimal monorepo presence, no CI/deploy burden).
- Venture Status Review **must** address every Dormant venture at least once per quarter.
- **Intent:** Reduce cognitive overhead and align with “no permanent scaffolding-only ventures” (Exclusion Policy).

### 4.3 Automation Integrity Act

- **Failing scheduled automations are P0** until fixed or retired.
- No new automations for non–Primary Focus ventures while any P0 automation failure remains.
- Automation Health Check procedure **must** run weekly; results appear in Monday briefing.

### 4.4 Security & Hygiene Act

- **Security PRs:** Review and merge or close within **10 business days**. No 20+ day open draft security PRs.
- **Git:** No broken refs; stale stashes reviewed quarterly (apply, drop, or document).
- **CI:** Main monorepo and primary app CI failures are P1; resolve or revert within 48 hours.

### 4.5 Clarity Act

- **Quarterly Clarity** (Inventory → Priority → Clarity) is mandatory.
- The **one thing** output drives Primary Focus and opportunity filter for the quarter.
- “Have the courage to ignore the other 999+ things.” (Focus playbook.)

### 4.6 Opportunity Filter Act

- **Default response to inbound opportunities (meetings, podcasts, advisory, partnerships, etc.) is no.**
- **Yes** only when there is a **written one-line strategic reason** tied to a Primary Focus venture or Platform.
- No FOMO; protect builder time.

---

## 5. Cross-Walk Summary

| Briefing element (2/9) | Playbook / strategy | Governance response |
|------------------------|---------------------|----------------------|
| 12 ventures, 4–5 active, 5–6 dormant | One mission, no over-diversification | Mission statement; Primary Focus Policy; Dormant Venture Act |
| Failing Pipeline IQ scrapers | Optimize bottleneck; fix before adding | Automation Integrity Policy & Act; P0 until fixed |
| Security PR open 20 days | — | Security & Hygiene Policy & Act (10-day rule) |
| Broken ref, stashes | — | Git Hygiene Procedure; Security & Hygiene Act |
| “Decide on dormant apps” | Archive or activate; reduce cognitive overhead | Dormant Venture Act; Venture Status Review Procedure |
| P0/P1/P2 priorities | Strategy in ≤3 steps; one outcome | Weekly Priority Procedure; max 3 P0 |
| Fix:feature ratio 1.6:1 (infra churn) | Clarity over busyness | Clarity Act; Quarterly Clarity Procedure |
| Three-brand strategy (ABYA, AAA, WasatchWise) | One lane | Mission statement; Exclusion Policy; What We Do Not Do |

---

## 6. Document Control

- **Next review:** End of Q1 2026 (with Clarity).
- **Owner:** Founder (John C. Lyman Jr.).
- **References:**  
  - `docs/SABRINA_RAMONOV_FOCUS_PLAYBOOK.md`  
  - `docs/brand/BRAND_POSITIONING.md`  
  - `docs/brand/THREE_BRAND_EMPIRE_STRATEGY.md`  
  - Monday Corporate Briefing (e.g. `terminals/2.txt` or equivalent).
