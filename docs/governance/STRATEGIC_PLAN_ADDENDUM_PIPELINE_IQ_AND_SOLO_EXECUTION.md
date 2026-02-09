# Strategic Plan Addendum: Pipeline IQ & Solo Execution

**Insert into:** Wasatch Wise LLC Comprehensive Corporate Strategic Plan 2026  
**Location:** After Executive Summary (or in Section I.D Critical Issues / Section III Master Execution Plan)  
**Date:** February 9, 2026

---

## Two critical decisions (replace prior “fix or sunset” / hiring language)

### 1. Pipeline IQ = Strategic Asset (Utility Platform)

**Decision:** Pipeline IQ is **not** “fix or sunset.” It is retained and expanded as a **utility platform** for lead and market intelligence that serves WasatchWise, Ask Before You App, and Adult AI Academy.

- **Current state:** Construction Wire scrapers (hotel, multifamily, senior_living, student_housing) run via GitHub Actions; both Actions are currently failing and will be fixed.
- **Role:** Utility platform — same infrastructure and patterns can support multiple data sources.
- **Expansion vision (phased):**
  - **Phase A:** Fix existing Construction Wire GitHub Actions; restore reliable daily scrape → Pipeline IQ Supabase.
  - **Phase B (K-12 utility):** Add net-new sources such as: K-12 district intelligence (board agendas, RFPs, policy changes), SDPC compliance deadlines/announcements, superintendent/tech director job changes, state AI policy updates (e.g. Utah Office of AI Policy). Prioritize one source first (e.g. Utah AI policy or district RFPs), then add others.
- **Integration:** New Pipeline IQ leads (existing or new sources) sync to central CRM/dashboard via n8n (see N8N_WORKFLOW_BLUEPRINTS.md — Pipeline IQ → CRM).

**Strategic plan wording to use:**  
“Pipeline IQ is a **strategic asset** and **utility platform** for lead and market intelligence. We will fix the existing Construction Wire scrapers and expand with K-12 district intelligence sources (board agendas, RFPs, SDPC, job changes, state AI policy) in phases. Pipeline IQ feeds the central CRM/dashboard via n8n; it is not a candidate for sunset.”

---

### 2. Solo execution model powered by n8n (no hiring until $250K+ revenue)

**Decision:** Solo execution is the default until revenue reaches **$250K+**. All distribution, lead capture, Pipeline IQ → CRM, and analytics digest run through **n8n automation** (and existing apps). n8n is the automation backbone; no full-time or part-time hire is assumed in the plan until that revenue threshold.

- **Implications for the plan:**
  - Content distribution, lead nurture, Pipeline IQ → CRM, and Monday briefing analytics digest are implemented as **n8n workflows** (see N8N_AND_PIPELINE_IQ_AUDIT.md and N8N_WORKFLOW_BLUEPRINTS.md).
  - Hiring/contracting language in the plan (e.g. “hire operations coordinator at $250K”) remains the **trigger** for revisiting the solo model, not an earlier default.
  - “Content editor” or one-off contractors for specific deliverables (e.g. editing 8 posts/month) are still allowed; the constraint is **no ongoing hire** until $250K+.

**Strategic plan wording to use:**  
“**Solo execution model:** All automation (content distribution, lead capture and nurture, Pipeline IQ → CRM, weekly analytics digest) is powered by **n8n**. No hiring until **$250K+ revenue**; at that point we reassess operations coordinator or fractional support.”

---

## Where to paste in the strategic plan

1. **Section I.D (Critical Issues)** — Replace the “Pipeline IQ: fix or sunset” P0 issue with:  
   “Pipeline IQ: **Strategic Asset.** Fix failing GitHub Actions (Construction Wire); plan Phase B K-12 expansion (see governance addendum).”

2. **Section III (Master Execution Plan)** — In Phase 1 or Phase 2, add a short “Automation backbone” bullet:  
   “n8n: Deploy to public URL; implement Lead Router + welcome email (Week 1), content distribution (Week 2), Pipeline IQ → CRM (Week 2–3), weekly analytics digest (Week 4). Solo execution until $250K+ revenue.”

3. **Section IV or V (Operational framework / Financial)** — Restate:  
   “Pipeline IQ = utility platform. Solo execution = n8n until $250K+.”

---

**References**  
- [N8N_AND_PIPELINE_IQ_AUDIT.md](./N8N_AND_PIPELINE_IQ_AUDIT.md)  
- [N8N_WORKFLOW_BLUEPRINTS.md](./N8N_WORKFLOW_BLUEPRINTS.md)  
- [CORPORATE_MISSION_POLICIES_PROCEDURES_ACTS.md](./CORPORATE_MISSION_POLICIES_PROCEDURES_ACTS.md) (Automation Integrity Policy)
