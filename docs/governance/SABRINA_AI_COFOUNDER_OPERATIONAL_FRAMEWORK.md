# Sabrina Ramonov — AI Co-Founder Operational Framework

**Purpose:** Operationalize Sabrina's AI Co-Founder methodology (Mixture of Experts, confidence scoring, data-driven interrogation, real numbers, subtraction) so it is executable, not just referenced.  
**Authority:** Founder. **Cross-reference:** [SABRINA_RAMONOV_FOCUS_PLAYBOOK.md](../SABRINA_RAMONOV_FOCUS_PLAYBOOK.md), [CORPORATE_MISSION_POLICIES_PROCEDURES_ACTS.md](./CORPORATE_MISSION_POLICIES_PROCEDURES_ACTS.md).  
**Effective:** February 9, 2026.

---

## Dependency: Analytics Before Full AI Co-Founder

**The AI Co-Founder methodology requires real data to work.** Sabrina is explicit: "Don't lie to your AI co-founder. Input your real numbers."

- **P0 blocker:** If GA4 (and/or Cloudflare Web Analytics) is not installed and **at least 30 days of data** have not been collected, the AI Sparring Partner cannot operate at full rigor. Recommendations will be based on estimates, not facts.
- **Phasing:**
  - **Weeks 1–4:** Foundation only — install GA4, fix P0 issues, collect data. AI Co-Founder prompts can be used for **content outlines and Clarity Prompt Chain** (Inventory → Priority → Clarity) with the caveat that metrics are incomplete.
  - **Week 5+:** Once GA4 (and key metrics) are in place and 30 days of data exist, the **full AI Co-Founder / Sparring Partner** process (strategic decisions, scenario analysis, Mixture of Experts) becomes operational.
- **Pre-execution checklist** (see below) must be satisfied before treating AI output as decision-ready for revenue and funnel.

---

## 1. Mixture of Experts Protocol

**Principle:** Run the **same** strategic prompt across **multiple LLMs** (e.g. ChatGPT, Gemini, DeepSeek) and triangulate. Different models surface different blind spots and questions.

### 1.1 Process

1. **Single prompt:** Write one clear prompt (e.g. AI Co-Founder template below) with context, constraints, and the ask.
2. **Run in parallel:** Paste the same prompt into at least **3** interfaces: e.g. ChatGPT, Gemini (Google), DeepSeek (or Claude). Do not change the prompt between runs.
3. **Capture output:** Save each model’s response (scenarios, questions, confidence, recommendations) in one place (e.g. Notion, Google Doc, repo).
4. **Synthesize:** Compare:
   - Where do 2+ models agree? → Strong signal.
   - Where do they disagree? → Flag for deeper interrogation or data.
   - What questions did each ask that the others didn’t? → Add to your clarification list.
5. **Decision rule when models disagree:** (a) Run the **Data-Driven Interrogation** process (Section 3) on the disputed point; or (b) Default to the **more conservative** recommendation until you have data that resolves the disagreement; or (c) Explicitly document the disagreement and set a date to re-run with new data.

### 1.2 Cross-Examination Protocol ("Play Them Off Each Other")

Sabrina: *"Copy paste Gemini's answer and ask DeepSeek what it thinks."* Force each AI to **critique** the others' outputs instead of only comparing independent runs.

- **Step A:** Get initial recommendations from each of the 3 LLMs (same prompt).
- **Step B — Cross-examine:**  
  - Take **ChatGPT's** recommendation → paste into **Gemini**: *"What's wrong with this approach? What assumptions might be flawed?"*  
  - Take **Gemini's** scenarios → paste into **DeepSeek**: *"What risks are missing? What would cause this to fail?"*  
  - Take **DeepSeek's** (or the third model's) output → paste into **ChatGPT**: *"What did the previous model miss? What would you do differently?"*
- **Step C:** Synthesize the critiques with the original recommendations. Use the cross-examination to surface blind spots before deciding.
- **When to use:** For major strategic decisions (e.g. validating the 52-week plan in Week 5+); optional for monthly Mixture of Experts if time permits.

### 1.3 When to Use

- Major strategic decisions (e.g. new offer, channel, or venture activation; **validating or revising the full 52-week plan** in Week 5+ — be prepared for AI to suggest deleting phases, merging initiatives, or reprioritizing).
- Quarterly Clarity (Inventory → Priority → Clarity).
- At least **once per month** for one strategic question (see Sabrina Ramonov Audit Checklist, Section 7).

---

## 2. Confidence Score Verification

**Principle:** AI must reveal its **confidence level** during the questioning process. Do not accept a final recommendation until the AI states it is **95% confident** (or you explicitly accept a lower confidence with documented risk).

### 2.1 In the Prompt

- Add to any AI Co-Founder / Sparring Partner prompt:  
  **"Ask me clarifying questions, one at a time, until you are 95% confident in your answer. After each answer, state your current confidence score (0–100%)."**
- When the AI gives a recommendation, require:  
  **"What is your confidence level in this recommendation? What would need to be true for it to be 95%+?"**

### 2.2 In the Workflow

- **After** the AI generates scenarios or a plan: ask explicitly: **"What's your confidence level in this recommendation?"**
- **Threshold:** Do not treat the output as **decision-ready** until confidence is ≥ 95%, or you document the gap (e.g. "AI at 70% due to missing churn data") and accept the risk.
- **Low confidence:** If the AI reports &lt; 95%, either (a) supply the missing data and re-run, or (b) document the uncertainty and time-box a follow-up once data exists.

---

## 3. Data-Driven Interrogation Process

**Principle:** The AI will "roast you with questions." You must be willing to run **actual queries** (SQL, GA4, Supabase, spreadsheets) to answer them. Sabrina describes spending a 4-hour block doing this deep work.

### 3.1 Process Intensity

- **Shallow:** One round of Q&A with AI, no data lookup. Use only for brainstorming or content outlines.
- **Standard:** AI asks clarifying questions; you answer from memory or quick lookups. Accept that confidence may stay below 95%.
- **Deep (AI Co-Founder grade):** AI asks questions → you run **queries or reports** to get real numbers → you feed answers back → AI asks the next question. **One question at a time.** Repeat until 95% confidence or you hit a data gap (then document the gap).

### 3.2 Operational Requirements

- **SQL/data access:** Ability to run queries against Supabase (or your source of truth) for revenue, leads, conversion, churn.
- **GA4 (or equivalent):** Visitor, session, conversion by channel and by brand.
- **Time block:** Schedule at least one **4-hour (or 2x2-hour) block** per month for deep interrogation when a strategic decision is in play.

### 3.3 Documenting Data Gaps

- When the AI asks a question you **cannot** answer with current data: record it in a "Data gaps" list (Notion, doc, or repo).
- Use this list to prioritize analytics and instrumentation (e.g. "Trial→Paid conversion by brand" → add tracking).

### 3.4 Deep Interrogation Session Requirements ("4-Hour Flight")

Treat the deep-work block as **sacred, uninterrupted time** (Sabrina: a 4-hour flight spent on this).

- **No interruptions:** Turn off notifications; block calendar; no meetings or context switches during the block.
- **Pre-load everything:** Before the session, open or export: SQL client, GA4 (or equivalent), financial/revenue reports, funnel dashboards. Have queries or bookmarks ready so you can answer AI’s questions without leaving the flow.
- **Real-time data pulls:** If possible, have a co-founder or team member available to run ad-hoc queries or lookups so you can paste real numbers back into the AI without breaking the session. Solo: batch your data pulls at the start and document "data to fetch later" if something unexpected comes up.
- **Single focus:** One strategic question or decision per session. Do not mix deep interrogation with other work.

---

## 4. Real Numbers Requirement & AI Co-Founder Template

**Principle:** "Don't lie to your AI co-founder. Input your real numbers." Estimates are acceptable only when clearly labeled; otherwise use actuals.

### 4.1 Metrics to Supply (when available)

Include these in your AI Co-Founder context so recommendations are data-based:

| Metric | Description | Where to get it |
|--------|-------------|------------------|
| **Revenue (MRR/ARR)** | Per brand or total | Stripe, Supabase, internal dashboard |
| **Churn rate** | % or count per period | Billing/subscription data |
| **ARPU** | Average revenue per user (or per customer) per month | Revenue / paying customers |
| **Net New MRR** | New MRR added in period | Billing |
| **Churned MRR** | MRR lost in period | Billing |
| **Trial → Paid conversion** | % by brand (e.g. WasatchWise, ABYA, Adult AI Academy) | Funnel: signup → paid |
| **Funnel stage conversion** | Visitor → lead → trial → paid, per stage % | GA4 + CRM or Supabase |
| **Affiliate / partner costs** | $/month if applicable | Finance |
| **Traffic** | Sessions, users, top pages (by property) | GA4, Cloudflare |
| **Email list size & open/click rates** | Per newsletter or brand | Email provider |

### 4.2 AI Co-Founder Prompt Template (Enhanced)

Use this (or a shortened version) when running Mixture of Experts or Sparring Partner sessions. **Fill in real numbers where you have them; label estimates.**

```
You are a top 0.1% expert in [e.g. K-12 AI governance / edtech / solopreneur growth], acting as my AI Co-Founder.

CONTEXT:
- [Company/mission in 1–2 sentences]
- [Primary offer and target customer]
- [Current primary focus: 1–3 ventures or goals]

REAL NUMBERS (use these; do not invent):
- MRR: $[X]
- Churn rate: [X]%
- ARPU: $[X]/month
- Net New MRR (last 30d): $[X]
- Churned MRR (last 30d): $[X]
- Trial → Paid conversion: [X]%
- Funnel: Visitor → Lead [X]%, Lead → Trial [X]%, Trial → Paid [X]%
- Affiliate/partner costs: $[X]/month
- Traffic (sessions, last 30d): [X] by property
- Email list: [X] subscribers; open rate [X]%; click rate [X]%

CONSTRAINTS:
- [e.g. Solo until $250K; no new ventures; must fix P0 automations first]

CURRENT TODO LIST (paste your entire task backlog from Notion, Linear, or project management system):
[Paste full list — Sabrina literally copy-pasted her entire Google Doc TODO list into the prompt]

EVERYTHING YOU'RE CONSIDERING:
[Every "maybe we should..." idea from the last month — opportunities, projects, partnerships you haven't said no to yet]

I need your help with: [one specific decision or question].

Ask me clarifying questions, one at a time, until you are 95% confident in your answer. After each of my answers, state your current confidence score (0–100%). When you give a recommendation, state your final confidence and what would need to be true for it to be 95%+.
```

### 4.3 One Question at a Time

- **Explicit rule:** The AI should ask **one** clarifying question → you answer (with data if possible) → AI states confidence → then asks the **next** question. Do not let the AI dump 10 questions in one message; enforce one-at-a-time in your instruction or by replying with one answer and "Next question."

### 4.4 Prompt Evolution Tracking

Sabrina tweaks the prompt for her specific business. Treat the AI Co-Founder template as a **living asset**:

- **Version control:** When you change the template (e.g. add metrics, change constraints, refine the ask), record the version or date and what you changed (e.g. in a doc, Notion, or repo).
- **Document why:** For each modification, note the reason (e.g. "Added ARPU after AI kept asking for it"; "Narrowed to one decision after too many scenarios").
- **A/B testing (optional):** Run the same strategic question with two prompt variants across LLMs (e.g. short vs. long context, with vs. without TODO dump) and compare quality of recommendations and confidence. Use results to lock in the better variant.

---

## 5. Subtraction Philosophy

**Principle:** "A real co-founder doesn't add work. They subtract it." Success is measured partly by what you **stop** doing.

### 5.1 Mindset

- **Delete 99%:** Already in the focus playbook; here we make subtraction **measurable**.
- **Weekly question:** "What did we NOT do last week?" and "What are we NOT doing this week?" (in Monday Corporate Briefing).
- **Track subtraction:** Count tasks eliminated, projects archived, decisions explicitly **not** pursued. Example: "237 tasks deleted" (Sabrina) or "3 ventures archived, 2 opportunities declined."

### 5.2 In the Monday Corporate Briefing

- Add to **Contents** (Section 3.1 of governance doc):
  - **What we did NOT do last week** (opportunities declined, work deliberately skipped).
  - **What we are NOT doing this week** (reinforce exclusion policy and focus).
- **Subtraction metrics (optional but recommended):** Tasks eliminated this month, projects archived, number of "no" decisions. Goal: celebrate subtraction as much as addition.

---

## 6. Pre-Execution Checklist (AI Co-Founder Grade)

Before treating the **full** AI Co-Founder methodology as operational (strategic decisions, Mixture of Experts, 95% confidence), ensure:

- [ ] **GA4** (and/or Cloudflare Web Analytics) installed and **≥ 30 days** of data collected on primary properties.
- [ ] **Real numbers** ready: at least MRR, churn (if applicable), funnel conversion, traffic. No "TBD" for core metrics when running strategic prompts.
- [ ] **3 AI accounts** set up (e.g. ChatGPT, Gemini, DeepSeek) for Mixture of Experts.
- [ ] **4-hour block** (or 2x2-hour) scheduled for deep work when a strategic decision is in play; session run per **§3.4** (no interruptions, pre-loaded data, "4-hour flight" conditions).
- [ ] **SQL/data access** available to answer AI’s questions (Supabase, GA4, or export to Sheet).

Until this checklist is satisfied, use AI Co-Founder for **content and Clarity only**; do not treat strategic recommendations as binding without explicit "low confidence" documentation.

---

## 7. Sabrina Ramonov Audit Checklist (Monthly)

Use this once per month (e.g. last Friday or first Monday) to verify the methodology is in use:

- [ ] Ran the **same** strategic question through **≥ 3 different LLMs** (Mixture of Experts).
- [ ] Achieved **95% confidence score** on at least one recommendation (or documented why not).
- [ ] **Deleted or archived** at least one task, project, or opportunity based on AI or Clarity output (subtraction).
- [ ] **Documented the specific number** of tasks deleted/archived this month (e.g. "12 tasks deleted"; goal: celebrate subtraction like Sabrina’s "237 tasks deleted").
- [ ] **Identified top 3 leverage points** (and verified nothing else was prioritized above them — i.e. the "exact 3 levers" test).
- [ ] Published **≥ 8** substantive content pieces in the month (2x/week minimum if that is the standard).
- [ ] Documented **data gaps**: questions the AI asked that we could not answer with current data.
- [ ] Used AI to **generate and evaluate** alternatives for at least one major decision (scenarios, pros/cons, confidence).

---

## 8. Summary: What Was Added

| Gap | Implementation in this doc |
|-----|----------------------------|
| Mixture of Experts | Section 1: run same prompt across 3 LLMs; synthesize; decision rule when they disagree. |
| Cross-Examination Protocol | Section 1.2: "Play them off each other" — paste one AI's output into another; ask "What's wrong?" / "What risks are missing?"; force critique. |
| Confidence scoring | Section 2: 95% threshold; "What's your confidence level?"; document low confidence. |
| Data-driven interrogation | Section 3: depth levels; one question at a time; SQL/data access; 4-hour block; data gaps list. |
| 4-hour flight / deep session | Section 3.4: no interruptions; pre-load data; real-time data pulls; single focus. §6 checklist references §3.4. |
| Real numbers | Section 4: metrics table (ARPU, Net New/Churned MRR, funnel, affiliate); enhanced template. |
| Massive TODO dump | Section 4.2 template: CURRENT TODO LIST (full backlog) + EVERYTHING YOU'RE CONSIDERING ("maybe we should…"). |
| Prompt evolution tracking | Section 4.4: version control for template; document why changes were made; optional A/B test across LLMs. |
| Analytics dependency | Dependency box + Pre-Execution Checklist: GA4 + 30 days before full AI Co-Founder. |
| Subtraction | Section 5: "What did we NOT do"; track tasks eliminated; add to Monday briefing. |
| One question at a time | Section 4.3 + template: explicit instruction in prompt and workflow. |
| Pre-Execution Checklist | Section 6: GA4, real numbers, 3 AIs, 4hr block (§3.4), SQL access. |
| Weekly subtraction | Section 5.2: add to Monday Corporate Briefing contents. |
| Monthly audit | Section 7: Sabrina Ramonov Audit Checklist (8 items): + specific number of tasks deleted; top 3 leverage points verified. |
| 52-week plan validation | Section 1.3: use Week 5+ deep session to validate/revise master plan; be prepared to delete phases, merge, reprioritize. |

---

**Document control**  
- **Next review:** With first monthly audit (or end of Q1 2026).  
- **Owner:** Founder.  
- **References:** Sabrina Ramonov (Substack, Blotato); [SABRINA_RAMONOV_FOCUS_PLAYBOOK.md](../SABRINA_RAMONOV_FOCUS_PLAYBOOK.md); [CORPORATE_MISSION_POLICIES_PROCEDURES_ACTS.md](./CORPORATE_MISSION_POLICIES_PROCEDURES_ACTS.md).
