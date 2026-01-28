# 🤖 AUTOMATED WORKFLOW: SCRAPE TO COMMISSION

**Fully Automated Sales Pipeline - Mike Monitors, System Executes**

---

## 📋 AUTOMATED WORKFLOW OVERVIEW

```
SCRAPE → AUTO-SCORE → AUTO-ENRICH → AUTO-CAMPAIGN → AUTO-SEND → TRACK → NOTIFY → MEETING → PROPOSE → CLOSE → COMMISSION
```

**Mike's Role:** Monitor, Review, Close Deals  
**System's Role:** Everything Else (Automated)

---

## STEP 1: SCRAPE (Automated Daily) ✅

**Status:** ✅ WORKING (when GitHub Actions fixed)

**What Happens:**
1. GitHub Actions runs daily at 6 AM UTC
2. Scraper logs into Construction Wire
3. Finds new hotel/multifamily projects
4. Extracts project data and contacts
5. Saves to `projects` table

**Output:**
- New projects with `outreach_status = 'new'`
- Ready for auto-scoring

---

## STEP 2: AUTO-SCORE (Immediate) ✅

**Status:** ✅ WORKING

**What Happens:**
1. When project is saved, scoring runs automatically
2. Calculates Groove Fit Score (0-100)
3. Sets `priority_level` (hot/warm/cold)
4. Projects sorted by score

**Output:**
- `groove_fit_score` calculated
- `priority_level` set
- Ready for auto-enrichment

---

## STEP 3: AUTO-ENRICH (Automated for Hot Leads) ⚠️ NEEDS BUILDING

**Status:** ⚠️ MANUAL - NEEDS AUTOMATION

**Current State:**
- Mike must click "Enrich with AI" button
- Only works if Mike manually triggers

**What Should Happen (Automated):**
1. **Trigger:** New project with score 80+ OR score 70+ in 'planning' stage
2. **Automatically:**
   - Query Google Places (competitors, photos)
   - Query YouTube (developer videos)
   - Query OpenAI GPT-4 (insights, objections)
   - Query Google Gemini (close probability)
3. **Save:** Results to `raw_data.enrichment`
4. **Update:** `enrichment_status = 'enriched'`

**What Needs to Be Built:**
- Cron job or webhook that runs after project save
- Auto-enrichment API endpoint (or extend existing)
- Queue system for batch processing
- Rate limiting to avoid API overuse

**Output:**
- Projects automatically enriched
- AI insights available
- Ready for auto-campaign

---

## STEP 4: AUTO-CAMPAIGN GENERATION (Automated) ⚠️ NEEDS BUILDING

**Status:** ⚠️ MANUAL - NEEDS AUTOMATION

**Current State:**
- Mike must select projects
- Mike must click "Generate Campaign"
- Mike must choose options

**What Should Happen (Automated):**
1. **Trigger:** Project enriched AND score 70+ AND stage 'planning' or 'pre-construction'
2. **Automatically:**
   - Research each contact (LinkedIn, company)
   - Generate personalized email using NEPQ framework
   - Create video script (if score 90+ or value $10M+)
   - Generate HeyGen video (if enabled)
   - Create A/B variants (if enabled)
3. **Save:** Campaign to `outreach_campaigns` table
4. **Status:** `status = 'ready_to_send'`

**What Needs to Be Built:**
- Auto-campaign trigger (cron/webhook)
- Batch campaign generation
- Smart video decision logic (when to use video)
- A/B variant generation

**Output:**
- Campaigns automatically generated
- Emails personalized and ready
- Videos created (if applicable)
- Ready for auto-send

---

## STEP 5: AUTO-SEND OUTREACH (Automated) ⚠️ NEEDS BUILDING

**Status:** ⚠️ MANUAL - NEEDS AUTOMATION

**Current State:**
- Campaigns generated but not automatically sent
- Mike must manually trigger sending

**What Should Happen (Automated):**
1. **Trigger:** Campaign status = 'ready_to_send'
2. **Automatically:**
   - Send emails via SendGrid API
   - Schedule follow-ups (based on NEPQ framework)
   - Track opens, clicks, replies
   - Update `outreach_status = 'contacted'`
3. **Rate Limiting:**
   - Max 50 emails/hour (avoid spam)
   - Stagger sends (don't blast all at once)
   - Respect SendGrid limits

**What Needs to Be Built:**
- Auto-send queue system
- Rate limiting logic
- SendGrid integration (verify it works)
- Follow-up scheduling

**Output:**
- Emails automatically sent
- Activities tracked
- Follow-ups scheduled
- Status updated

---

## STEP 6: AUTO-TRACK RESPONSES (Real-Time) ⚠️ PARTIALLY WORKING

**Status:** ⚠️ NEEDS VERIFICATION

**What Should Happen:**
1. SendGrid webhooks fire on events:
   - Email opened → `activity_type = 'email_opened'`
   - Link clicked → `activity_type = 'link_clicked'`
   - Email replied → `activity_type = 'responded'`
2. Activities saved to `outreach_activities`
3. Engagement score recalculated
4. Total score updated

**What Needs to Be Built:**
- SendGrid webhook endpoint (`/api/webhooks/sendgrid`)
- Webhook verification
- Activity logging
- Score recalculation trigger

**Output:**
- Real-time response tracking
- Engagement scores updated
- Notifications to Mike

---

## STEP 7: AUTO-NOTIFY MIKE (Real-Time) ⚠️ NEEDS BUILDING

**Status:** ⚠️ NOT BUILT

**What Should Happen:**
1. **When email opened:** Notification (low priority)
2. **When link clicked:** Alert (medium priority)
3. **When email replied:** URGENT notification (high priority)
4. **When meeting requested:** URGENT notification
5. **Daily summary:** Email with stats

**What Needs to Be Built:**
- Notification system (in-app + email)
- Priority levels
- Notification preferences
- Daily digest email

**Output:**
- Mike knows immediately when someone responds
- Never misses a hot lead

---

## STEP 8: MEETING SCHEDULED (Manual - Mike's Action) ⚠️ NEEDS TRACKING

**Status:** ⚠️ NOT TRACKED

**What Happens:**
1. Contact replies with interest
2. Mike schedules meeting (outside system - calendar, phone, etc.)
3. **PROBLEM:** Meeting not tracked in system

**What Should Happen:**
1. Mike clicks "Schedule Meeting" button on project/contact
2. Meeting form:
   - Date/time
   - Attendees
   - Meeting type (discovery, demo, proposal)
   - Notes
3. Meeting saved to database
4. `outreach_status` updated to 'meeting_scheduled'
5. Follow-up reminder set (1 day before meeting)
6. Post-meeting task created (follow up after meeting)

**What Needs to Be Built:**
- Meeting scheduling UI
- Meeting tracking table (or use `outreach_activities`)
- Calendar integration (optional)
- Follow-up reminders
- Post-meeting workflow

**Output:**
- Meetings tracked in system
- Status updated
- Reminders set
- Post-meeting tasks created

---

## STEP 9: POST-MEETING WORKFLOW ⚠️ NEEDS BUILDING

**Status:** ⚠️ NOT BUILT

**What Should Happen After Meeting:**
1. **Immediately after meeting:**
   - Task created: "Follow up on [Project Name] meeting"
   - Due: 24 hours after meeting
   - Notes field for meeting summary
2. **If meeting went well:**
   - Mike marks as "Interested"
   - `outreach_status` = 'interested'
   - Proposal workflow triggered
3. **If meeting didn't go well:**
   - Mike marks as "Not Interested"
   - `outreach_status` = 'not_interested'
   - Project archived or marked cold

**What Needs to Be Built:**
- Post-meeting action UI
- Task creation system
- Proposal workflow trigger
- Status update logic

**Output:**
- Clear next steps after meeting
- Tasks created automatically
- Status updated

---

## STEP 10: PRESENT PROPOSAL (Manual - Mike's Action) ⚠️ NEEDS TRACKING

**Status:** ⚠️ NOT TRACKED

**What Happens:**
1. After meeting, Mike creates proposal
2. Services identified (WiFi, DIRECTV, Phone, AV, etc.)
3. Proposal sent
4. **PROBLEM:** Not tracked in system

**What Should Happen:**
1. Mike clicks "Create Proposal" on project
2. Proposal form:
   - Services (checkboxes: WiFi, DIRECTV, Phone, AV, etc.)
   - Proposal value
   - Proposal date
   - Notes
3. Proposal saved
4. `outreach_status` = 'proposal_sent'
5. Follow-up reminder set (7 days if no response)

**What Needs to Be Built:**
- Proposal creation UI
- Services selection
- Proposal tracking
- Follow-up reminders

**Output:**
- Proposals tracked
- Services identified
- Follow-ups scheduled

---

## STEP 11: CLOSE DEAL (Manual - Mike's Action) ✅ PARTIALLY WORKING

**Status:** ⚠️ NEEDS UI

**What Should Happen:**
1. Customer accepts proposal
2. Contract signed
3. Mike clicks "Mark as Won" on project
4. Deal form:
   - Services sold (checkboxes)
   - Deal value
   - Close date
   - Commission amount (auto-calculated: services × $1,000)
5. `outreach_status` = 'won'
6. `actual_revenue` = Deal value
7. `closed_at` = Close date
8. Commission tracked

**What Needs to Be Built:**
- "Mark as Won" UI button
- Deal form
- Commission calculation
- Revenue tracking

**Output:**
- Deals tracked
- Commission calculated
- Revenue attributed

---

## STEP 12: INSTALLATION & ONBOARDING (Post-Contract) ⚠️ NEEDS DOCUMENTATION

**Status:** ⚠️ NEEDS CONTENT

**What Should Happen:**
1. After deal closed, onboarding workflow starts
2. Timeline shown to Mike:
   - Week 1: Site survey, equipment ordering
   - Week 2: Equipment delivery, installation prep
   - Week 3: Installation begins
   - Week 4: Testing, go-live, training
3. Tasks created for each phase
4. Customer communication templates

**What Needs to Be Built:**
- Onboarding workflow UI
- Timeline visualization
- Task templates
- Customer communication templates

**Output:**
- Clear onboarding process
- Tasks for each phase
- Customer knows what to expect

---

## STEP 13: COMMISSION TRACKED (Automatic) ⚠️ NEEDS BUILDING

**Status:** ⚠️ NOT BUILT

**What Should Happen:**
1. When deal marked as won:
   - Commission = Services Sold × $1,000
   - Commission saved to database
2. Monthly commission report:
   - Total commissions
   - By project
   - By service type
   - By month

**What Needs to Be Built:**
- Commission calculation
- Commission tracking table
- Monthly reports
- Revenue attribution

**Output:**
- Commissions tracked
- Reports available
- Revenue attributed correctly

---

## 🤖 AUTOMATION REQUIREMENTS

### What Needs to Be Built:

1. **Auto-Enrichment System** (HIGH PRIORITY)
   - Cron job/webhook after project save
   - Batch processing for hot leads
   - Rate limiting

2. **Auto-Campaign Generation** (HIGH PRIORITY)
   - Trigger after enrichment
   - Batch campaign creation
   - Smart video decision logic

3. **Auto-Send System** (HIGH PRIORITY)
   - Queue system
   - Rate limiting
   - SendGrid integration

4. **Response Tracking** (MEDIUM PRIORITY)
   - SendGrid webhook endpoint
   - Activity logging
   - Score recalculation

5. **Notification System** (MEDIUM PRIORITY)
   - In-app notifications
   - Email notifications
   - Priority levels

6. **Meeting Tracking** (MEDIUM PRIORITY)
   - Meeting scheduling UI
   - Meeting tracking
   - Follow-up reminders

7. **Post-Meeting Workflow** (MEDIUM PRIORITY)
   - Task creation
   - Status updates
   - Proposal trigger

8. **Proposal Tracking** (LOW PRIORITY)
   - Proposal creation UI
   - Services selection
   - Follow-up reminders

9. **Deal Closing UI** (LOW PRIORITY)
   - "Mark as Won" button
   - Deal form
   - Commission calculation

10. **Commission Tracking** (LOW PRIORITY)
    - Commission calculation
    - Monthly reports
    - Revenue attribution

---

## 📊 MIKE'S MONITORING DASHBOARD

**What Mike Should See:**

1. **Pipeline Overview:**
   - Total projects
   - Hot leads (80+)
   - Pipeline value
   - Average score

2. **Campaign Performance:**
   - Emails sent today/week
   - Open rate
   - Response rate
   - Click rate
   - A/B test results

3. **Response Activity:**
   - New replies (URGENT)
   - Link clicks (warm)
   - Email opens (monitor)
   - Video views

4. **Meeting Schedule:**
   - Upcoming meetings
   - Meetings this week
   - Post-meeting tasks

5. **Deal Pipeline:**
   - Proposals sent
   - Deals in negotiation
   - Deals closed this month
   - Commission earned

6. **Alerts & Notifications:**
   - New hot leads
   - Email replies
   - Meeting requests
   - High-value opportunities

---

## ⚡ AUTOMATION TRIGGERS

### Automatic Triggers:

1. **New Project Scraped:**
   - → Auto-score
   - → If score 80+: Auto-enrich
   - → If score 70+ & planning: Auto-enrich

2. **Project Enriched:**
   - → If score 70+ & planning: Auto-generate campaign
   - → If score 90+ or $10M+: Include video

3. **Campaign Generated:**
   - → Auto-send (with rate limiting)
   - → Schedule follow-ups

4. **Email Sent:**
   - → Track opens/clicks/replies
   - → Update engagement score
   - → Notify on replies

5. **Email Replied:**
   - → URGENT notification to Mike
   - → Update status
   - → Create follow-up task

6. **Meeting Scheduled:**
   - → Set reminder (1 day before)
   - → Create post-meeting task

7. **Deal Closed:**
   - → Calculate commission
   - → Track revenue
   - → Start onboarding workflow

---

## 🎯 SUCCESS METRICS

**Automation Metrics:**
- % of hot leads auto-enriched
- % of enriched projects auto-campaigned
- % of campaigns auto-sent
- Time from scrape to first email
- Response time to replies

**Mike's Efficiency:**
- Hours saved per week
- Deals closed per month
- Commission earned
- Pipeline value growth

---

**This is the fully automated workflow - Mike monitors, system executes!** 🚀

