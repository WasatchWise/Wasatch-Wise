# 🎯 PHASE A: CLOSING INFRASTRUCTURE

**Build Order: Revenue First, Automation Later**

**Goal:** Capture every deal that closes, starting TODAY.

**NEPQ Integration:** Every action enforces NEPQ guardrails. This is a sales system, not a machine.

---

## ✅ ACCEPTANCE CRITERIA

**Phase A is complete when:**
1. ✅ Mike can log a meeting in < 30 seconds
2. ✅ After meeting, Mike can mark outcome in < 15 seconds
3. ✅ When deal closes, Mike can log it with services/commission in < 1 minute
4. ✅ All meetings, proposals, and deals visible in one place
5. ✅ Commission calculated automatically

**If a deal closes tomorrow, we capture it cleanly. Everything else is secondary.**

---

## 1. MEETING TRACKING UI

### Database Schema

**Use existing `outreach_activities` table:**
- `activity_type = 'meeting'`
- `activity_date` = Meeting date/time
- `metadata` = JSON with:
  - `meeting_type`: 'discovery' | 'demo' | 'proposal' | 'follow_up'
  - `attendees`: Array of names
  - `notes`: Meeting notes
  - `outcome`: null (set after meeting)

**Update `projects` table:**
- `outreach_status` = 'meeting_scheduled' when meeting logged
- `outreach_status` = 'meeting_completed' after meeting

### UI Components

**1. "Schedule Meeting" Button**
- Location: Project detail page (`app/(dashboard)/projects/[id]/page.tsx`)
- Placement: Next to "Send Email" button
- Action: Opens meeting modal

**2. Meeting Form Modal**
- Fields:
  - Date/Time picker (required)
  - Meeting Type dropdown (discovery, demo, proposal, follow_up)
  - Attendees (text input, comma-separated)
  - Notes (textarea)
- Submit: Creates `outreach_activity` and updates project status

**3. Meeting List View**
- Show on project detail page
- List all meetings for this project
- Show: Date, Type, Status (upcoming/completed)

### API Endpoint

```typescript
// POST /api/projects/[id]/meetings
{
  activity_date: string (ISO date)
  meeting_type: string
  attendees: string[]
  notes: string
}
```

**NEPQ Integration:**
- Validates current NEPQ stage allows meeting
- Ensures discovery criteria met (if proposal meeting)
- Sets meeting expectations based on NEPQ stage
- Prevents skipping NEPQ stages

**Response:**
- Creates `outreach_activity`
- Updates `outreach_status = 'meeting_scheduled'`
- Validates NEPQ stage transition
- Returns meeting record

---

## 2. POST-MEETING WORKFLOW

### After Meeting Actions

**Status Options (NEPQ-Enforced):**
1. **"They're Interested"** → `outreach_status = 'interested'`
   - **NEPQ Check:** Validates transition from ENGAGEMENT/TRANSITION stage
   - **Requires:** Pain identified, challenges understood
   - Creates follow-up task: "Send proposal for [Project Name]"
   - Due: 24 hours after meeting
   
2. **"Send Proposal"** → `outreach_status = 'proposal_sent'`
   - **NEPQ Check:** Only allowed if in TRANSITION or PRESENTATION stage
   - **Requires:** Emotional gap created, consequences acknowledged
   - Opens proposal form (NEPQ-framed, not feature dump)
   - After proposal sent, creates follow-up task: "Follow up on proposal"
   - Due: 7 days after proposal

3. **"Not a Fit"** → `outreach_status = 'not_interested'`
   - **NEPQ Check:** Always allowed (can exit at any stage)
   - Marks project as cold
   - Optional: Archive project

4. **"Follow Up Needed"** → `outreach_status = 'follow_up_needed'`
   - **NEPQ Check:** Keeps conversation in current stage
   - Creates follow-up task with NEPQ-appropriate messaging
   - Due: Based on NEPQ stage timing rules

### UI Components

**1. Post-Meeting Action Buttons**
- Location: Project detail page (after meeting date passes)
- Show when: `outreach_status = 'meeting_scheduled'` AND `activity_date` < now
- Buttons:
  - "They're Interested" (green)
  - "Send Proposal" (blue)
  - "Not a Fit" (gray)
  - "Follow Up Needed" (yellow)

**2. Meeting Outcome Form**
- If "They're Interested" → Opens proposal form
- If "Send Proposal" → Opens proposal form
- If "Not a Fit" → Confirms and updates status
- If "Follow Up Needed" → Creates task

### API Endpoint

```typescript
// POST /api/projects/[id]/meetings/[meetingId]/complete
{
  outcome: 'interested' | 'proposal_sent' | 'not_interested' | 'follow_up_needed'
  notes?: string
  proposal_data?: {
    services: string[]
    proposal_value: number
    proposal_date: string
  }
}
```

**Response:**
- Updates `outreach_activity.metadata.outcome`
- Updates `outreach_status`
- Creates follow-up task if needed
- Returns updated project

---

## 3. PROPOSAL TRACKING

### Database Schema

**Use `outreach_activities` table:**
- `activity_type = 'proposal'`
- `activity_date` = Proposal sent date
- `metadata` = JSON with:
  - `services`: Array of service names
  - `proposal_value`: Number
  - `proposal_id`: Optional external ID

**Update `projects` table:**
- `outreach_status` = 'proposal_sent'
- Store services in `services_needed` or new `proposed_services` field

### UI Components

**1. "Create Proposal" Button**
- Location: Project detail page
- Show when: `outreach_status IN ('interested', 'meeting_completed')`
- Action: Opens proposal form

**2. Proposal Form (NEPQ-Framed)**
- **NEPQ Enforcement:**
  - Only shows if NEPQ stage allows (TRANSITION or PRESENTATION)
  - Proposal template reflects: problems agreed upon, consequences, timing, why Groove fits
  - Never: "Here's everything we do" or "Here's a menu"
- Fields:
  - Services (checkboxes):
    - WiFi / Managed WiFi
    - DIRECTV
    - Phone Systems
    - Audio Visual
    - Structured Cabling
    - Access Control
    - ERCES
    - Smart Locks
    - EV Charging
    - Cellular DAS
  - Proposal Value (number input)
  - Proposal Date (date picker, defaults to today)
  - Notes (textarea) - Pre-filled with NEPQ-framed language
- Submit: Creates `outreach_activity` and updates status (validates NEPQ transition)

**3. Proposal List View**
- Show on project detail page
- List all proposals for this project
- Show: Date, Services, Value, Status

### API Endpoint

```typescript
// POST /api/projects/[id]/proposals
{
  services: string[]
  proposal_value: number
  proposal_date: string
  notes?: string
}
```

**Response:**
- Creates `outreach_activity`
- Updates `outreach_status = 'proposal_sent'`
- Creates follow-up task (7 days)
- Returns proposal record

---

## 4. DEAL CLOSING UI

### Database Schema

**Update `projects` table:**
- `outreach_status` = 'won' or 'lost'
- `actual_revenue` = Deal value
- `closed_at` = Close date
- `services_sold` = Array of services (new field or use existing)

**New table or use existing:**
- Store commission: `commission_amount` (services.length × $1,000)
- Or calculate on-the-fly

### UI Components

**1. "Mark as Won" / "Mark as Lost" Buttons**
- Location: Project detail page
- Show when: `outreach_status IN ('proposal_sent', 'interested', 'negotiating')`
- Action: Opens deal form

**2. Deal Form (NEPQ-Confirmation)**
- **NEPQ Enforcement:**
  - At close, NEPQ's job is done (confirmation, not persuasion)
  - No pressure language
  - Confirms: decision ownership, timing, criteria
  - Feels inevitable, not coerced
- Fields:
  - Services Sold (checkboxes - same as proposal)
  - Deal Value (number input)
  - Close Date (date picker, defaults to today)
  - Commission (auto-calculated: services.length × $1,000, but editable)
  - Notes (textarea)
- Submit: Updates project status and revenue (validates NEPQ stage allows 'won')

**3. Deal Summary**
- Show on project detail page when `outreach_status = 'won'`
- Display: Services sold, Deal value, Commission, Close date

### API Endpoint

```typescript
// POST /api/projects/[id]/close
{
  outcome: 'won' | 'lost'
  services_sold?: string[] (if won)
  deal_value?: number (if won)
  close_date: string
  commission?: number (auto-calculated if not provided)
  notes?: string
  lost_reason?: string (if lost)
}
```

**Response:**
- Updates `outreach_status`
- Updates `actual_revenue` (if won)
- Updates `closed_at`
- Stores `services_sold`
- Calculates and stores commission
- Returns updated project

---

## 5. DEALS DASHBOARD

### New Page: `/deals`

**Show:**
- All won deals (this month, this quarter, all time)
- All lost deals (with reasons)
- Deals in progress (proposal sent, negotiating)
- Commission totals
- Services sold breakdown

**Filters:**
- Status (won, lost, in progress)
- Date range
- Services
- Deal value range

**Stats:**
- Total deals closed
- Total revenue
- Total commission
- Average deal value
- Win rate (won / (won + lost))

---

## 📋 BUILD CHECKLIST

### Meeting Tracking
- [ ] Add "Schedule Meeting" button to project detail page
- [ ] Create meeting form modal component
- [ ] Create POST /api/projects/[id]/meetings endpoint
- [ ] Update project status to 'meeting_scheduled'
- [ ] Show meetings list on project detail page
- [ ] Test: Log a meeting in < 30 seconds

### Post-Meeting Workflow
- [ ] Add post-meeting action buttons
- [ ] Create outcome form
- [ ] Create POST /api/projects/[id]/meetings/[id]/complete endpoint
- [ ] Create follow-up tasks automatically
- [ ] Update status based on outcome
- [ ] Test: Mark meeting outcome in < 15 seconds

### Proposal Tracking
- [ ] Add "Create Proposal" button
- [ ] Create proposal form component
- [ ] Create POST /api/projects/[id]/proposals endpoint
- [ ] Show proposals list on project detail page
- [ ] Create follow-up task (7 days)
- [ ] Test: Create proposal in < 1 minute

### Deal Closing
- [ ] Add "Mark as Won" / "Mark as Lost" buttons
- [ ] Create deal form component
- [ ] Create POST /api/projects/[id]/close endpoint
- [ ] Auto-calculate commission
- [ ] Update project status and revenue
- [ ] Test: Close deal in < 1 minute

### Deals Dashboard
- [ ] Create /deals page
- [ ] Show won/lost deals
- [ ] Show commission totals
- [ ] Add filters
- [ ] Add stats

---

## 🎯 SUCCESS METRICS

**Phase A is successful when:**
- ✅ Mike can log a meeting in 30 seconds
- ✅ Mike can mark meeting outcome in 15 seconds
- ✅ Mike can create a proposal in 1 minute
- ✅ Mike can close a deal in 1 minute
- ✅ All deals visible in one place
- ✅ Commission calculated automatically
- ✅ **A real deal closes and is captured cleanly**

---

## ⏱️ ESTIMATED TIME

**Meeting Tracking:** 3 hours
**Post-Meeting Workflow:** 2 hours
**Proposal Tracking:** 2 hours
**Deal Closing:** 2 hours
**Deals Dashboard:** 3 hours

**Total: 12 hours (1.5 days of focused work)**

---

## 🚀 START BUILDING

**Build in this order:**
1. Meeting tracking (most important - deals start here)
2. Deal closing (capture revenue)
3. Proposal tracking (bridge between meeting and close)
4. Post-meeting workflow (optimize the bridge)
5. Deals dashboard (visibility)

**Stop when:** Mike can close a deal and it's captured cleanly.

**Then:** Move to Phase B (light automation) only after seeing real revenue flow.

---

**This is the foundation. Everything else builds on this.** 🎯

