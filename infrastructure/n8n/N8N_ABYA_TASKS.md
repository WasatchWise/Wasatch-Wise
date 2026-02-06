# n8n – Ask Before You App (ABYA) Task List

**Purpose:** ABYA-specific n8n work for the construction team. Add these to the same task list as Rock Salt; everything here is B006 (Board of Education / Ask Before You App).

**Backlog reference:** [N8N_AUTOMATION_BACKLOG.md](N8N_AUTOMATION_BACKLOG.md) §4 (Leads & forms). ABYA does not use Stripe; no revenue webhook for B006.

---

## 1. Universal Lead Router – ABYA sources (Priority)

**Backlog item:** 4.1 Universal Lead Router (webhook: `ask-before-lead` or single webhook with `source` in body).

ABYA already sends POST to **`LEAD_ROUTER_WEBHOOK_URL`** from two places. n8n needs a workflow that:

- **Accepts** webhook POST with JSON body.
- **Routes** by `source` (and optionally building B006).
- **Writes** to Supabase (e.g. leads/contacts table) and/or CRM, and optionally notifies Slack/email.

### 1.1 ABYA contact form

**App:** `apps/ask-before-you-app/app/actions/contact.ts`  
**Trigger:** User submits contact form (name, email, organization, role, message).  
**Payload** (app sends this to `LEAD_ROUTER_WEBHOOK_URL`):

```json
{
  "source": "contact_form",
  "name": "...",
  "email": "...",
  "organization": "...",
  "role": "...",
  "message": "...",
  "timestamp": "2026-02-03T..."
}
```

**n8n task:** Webhook trigger → parse body → route when `source === 'contact_form'` (or path/query indicates ABYA) → insert to Supabase/CRM, optional Slack/email. Tag as **B006** and **abya_contact**.

### 1.2 ABYA AI readiness quiz / audit

**App:** `apps/ask-before-you-app/lib/ai/analyze-audit.ts`  
**Trigger:** User completes AI readiness quiz and audit is analyzed.  
**Payload** (app sends to `LEAD_ROUTER_WEBHOOK_URL` or `MAKE_WEBHOOK_URL`):

```json
{
  "source": "quiz_audit",
  "audit_id": "...",
  "email": "...",
  "organization": "...",
  "role": "...",
  "analysis": { ... },
  "scores": { ... },
  "timestamp": "2026-02-03T..."
}
```

**n8n task:** Same webhook workflow → route when `source === 'quiz_audit'` → insert to Supabase/CRM (e.g. lead + audit summary), optional Slack/email. Tag as **B006** and **abya_quiz**.

### 1.3 ABYA app review request (when app is wired)

**App:** `apps/ask-before-you-app/app/request/page.tsx` — currently **stub** (no persist, no webhook). When we implement persistence, we will send to the same lead router with something like:

```json
{
  "source": "abya_app_request",
  "name": "...",
  "email": "...",
  "organization": "...",
  "appName": "...",
  "appUrl": "...",
  "reason": "...",
  "timestamp": "..."
}
```

**n8n task (future):** Add branch in lead router for `source === 'abya_app_request'` → same Supabase/CRM + optional notify. Tag as **B006** and **abya_app_request**.

### 1.4 ABYA Who modal / email capture (optional)

**App:** `apps/ask-before-you-app/app/actions/email-capture.ts` — currently **does not** call the lead router; only writes to Supabase `email_captures`.  
**Optional n8n task:** If we add a call to `LEAD_ROUTER_WEBHOOK_URL` from the app for Who modal signups (e.g. `source: 'abya_welcome_modal'`), add a branch in the lead router for that source. Otherwise skip.

---

## 2. Optional: ABYA hot leads metric (Backlog 4.3)

**Backlog item:** 4.3 Ask Before You App – hot leads → `hot_leads` (B006).

**n8n task (optional):** If we want a “hot leads” count for B006 in the dashboard (e.g. contact form + quiz + app request in last 7 days), add a workflow or branch that:

- Counts leads from lead router where source is one of `contact_form`, `quiz_audit`, `abya_app_request`, `abya_welcome_modal` and building = B006.
- Writes or upserts to city_metrics: e.g. `abya_hot_leads` or a generic `hot_leads` with a way to filter by B006.

**Trim if not needed** for MVP.

---

## 3. Summary – Add to construction team list

| # | Task | Type | Notes |
|---|------|------|--------|
| 1 | **Universal Lead Router – ABYA contact form** | Webhook | Accept POST with `source: contact_form`; route to Supabase/CRM; tag B006, abya_contact. |
| 2 | **Universal Lead Router – ABYA quiz/audit** | Webhook | Accept POST with `source: quiz_audit`; route to Supabase/CRM; tag B006, abya_quiz. |
| 3 | **Universal Lead Router – ABYA app request** | Webhook (future) | Add branch for `source: abya_app_request` when app is wired. |
| 4 | **ABYA hot leads (optional)** | Optional | Count ABYA leads → city_metrics abya_hot_leads or hot_leads for B006. |

**Note:** ABYA does not use Stripe; certification is free. No Stripe → city_metrics (abya_revenue) workflow needed for B006.

**Env (ABYA app):** For lead router to receive ABYA traffic, set `LEAD_ROUTER_WEBHOOK_URL` in the Ask Before You App (ABYA) deployment to the n8n webhook URL (e.g. `https://your-n8n.com/webhook/ask-before-lead` or `/webhook/lead` with routing by body).

---

*Last updated: 2026-02-03*
