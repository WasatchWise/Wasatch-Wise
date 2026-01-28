# 🔄 COMPLETE WORKFLOW: SCRAPE TO COMMISSION

**The Full Sales Pipeline from Lead Discovery to Revenue**

---

## 📋 WORKFLOW OVERVIEW

```
SCRAPE → SAVE → SCORE → ENRICH → OUTREACH → RESPOND → MEET → PROPOSE → CLOSE → COMMISSION
```

---

## STEP 1: SCRAPE (Automated Daily)

**What Happens:**
1. GitHub Actions runs daily at 6 AM UTC
2. Scraper logs into Construction Wire
3. Finds new hotel/multifamily projects
4. Extracts project data:
   - Project name, type, stage
   - Location (city, state, address)
   - Value, units, size
   - Contacts (if detail pages enabled)
5. Saves to `projects` table in Supabase

**Data Captured:**
- `cw_project_id` - Unique Construction Wire ID
- `project_name` - Name of project
- `project_type` - Array: ['hotel', 'multifamily', etc.]
- `project_stage` - 'planning', 'pre-construction', etc.
- `project_value` - Estimated value
- `city`, `state`, `address` - Location
- `units_count` - Number of units/rooms
- `raw_data` - Full scraped data including contacts
- `outreach_status` - Set to 'new'

**Output:**
- New projects in database
- `outreach_status = 'new'`
- Ready for scoring

---

## STEP 2: AUTO-SCORE (Immediate)

**What Happens:**
1. When project is saved, scoring runs automatically
2. Calculates **Groove Fit Score** (0-100):
   - Project Type: 30 points (hotel/multifamily = 30)
   - Stage: 25 points (planning = 25, construction = 8)
   - Value: 20 points ($20M+ = 20)
   - Size/Units: 10 points (200+ units = 10)
   - Timeline: 10 points (starting soon = 10)
   - Location: 5 points (priority states = 3)
   - Bonuses: +10% for 3+ services, +5% for large portfolio
3. Sets `priority_level`:
   - Score 80+ = 'hot'
   - Score 60-79 = 'warm'
   - Score < 60 = 'cold'

**Output:**
- `groove_fit_score` - 0-100 score
- `priority_level` - 'hot', 'warm', or 'cold'
- Projects sorted by score in dashboard

---

## STEP 3: IDENTIFY HOT LEADS (Mike's Daily Review)

**What Happens:**
1. Mike logs into dashboard
2. Sees "Hot Leads" count (score 80+)
3. Views Projects page
4. Filters by:
   - Score 80+ (hot leads)
   - Stage: 'planning' (best time to reach out)
   - Type: 'hotel' or 'multifamily'
5. Reviews project details

**Mike's Actions:**
- Clicks into high-scoring projects
- Reviews location, value, stage
- Decides which to pursue

**Output:**
- List of prioritized projects
- Projects selected for enrichment/outreach

---

## STEP 4: ENRICH WITH AI (One-Click)

**What Happens:**
1. Mike clicks "Enrich with AI" on project
2. System simultaneously queries:
   - **Google Places:** Nearby competitors, photos, ratings
   - **YouTube:** Developer videos, presentations
   - **OpenAI GPT-4:** Decision factors, technology needs, objections
   - **Google Gemini:** Strategic insights, close probability
3. Results saved to `raw_data.enrichment`
4. Shows on project detail page:
   - AI Insights (strategic fit, approach, close probability)
   - Location Intelligence (nearby properties)
   - Related Videos (developer content)
   - Competitive Analysis

**Output:**
- `raw_data.enrichment` - Full AI analysis
- `enrichment_status` - 'enriched'
- Strategic talking points for outreach

---

## STEP 5: GENERATE CAMPAIGN (One-Click)

**What Happens:**
1. Mike selects projects (checkboxes)
2. Goes to Campaigns page
3. Chooses options:
   - ✅ AI Personalization (research contacts, personalize)
   - ✅ Video Messages (HeyGen avatars - Premium)
   - ✅ A/B Test Variants (test different approaches)
4. Clicks "Generate AI Campaign"
5. System:
   - Researches each contact (LinkedIn, company)
   - Generates personalized email using NEPQ framework
   - Creates video script (if enabled)
   - Generates HeyGen video (if enabled)
   - Creates A/B variants (if enabled)
6. Campaign saved to `outreach_campaigns` table

**NEPQ Framework Applied:**
- **Connecting:** Build trust, show you understand
- **Engagement:** Uncover pain points
- **Transition:** Create urgency
- **Presentation:** Frame Groove as solution
- **Commitment:** Ask for meeting/proposal

**Output:**
- `outreach_campaigns` record
- Personalized emails for each contact
- Video messages (if enabled)
- Ready to send

---

## STEP 6: SEND OUTREACH (Automated or Manual)

**What Happens:**
1. Campaign is generated
2. Emails sent via SendGrid API
3. Each email tracked:
   - Sent timestamp
   - Opened (via tracking pixel)
   - Clicked (via link tracking)
   - Replied (via webhook)
4. Activities logged to `outreach_activities` table

**Tracking:**
- `emails_sent` - Count incremented
- `emails_opened` - When recipient opens
- `emails_clicked` - When recipient clicks link
- `emails_replied` - When recipient replies

**Output:**
- Emails sent to contacts
- `outreach_status` updated to 'contacted'
- Activities tracked in database

---

## STEP 7: TRACK RESPONSES (Real-Time)

**What Happens:**
1. SendGrid webhooks fire on events:
   - Email opened → `activity_type = 'email_opened'`
   - Link clicked → `activity_type = 'link_clicked'`
   - Email replied → `activity_type = 'responded'`
2. Activities saved to `outreach_activities`
3. Dashboard updates in real-time
4. Mike sees:
   - Response rate
   - Open rate
   - Click rate
   - Who replied

**Engagement Score Calculated:**
- Email opened: +5 points
- Link clicked: +10 points
- Responded: +25 points
- Meeting scheduled: +40 points
- Proposal requested: +50 points

**Output:**
- `engagement_score` updated
- `total_score` recalculated
- Response notifications

---

## STEP 8: SCHEDULE MEETING (Manual)

**What Happens:**
1. Contact replies with interest
2. Mike schedules meeting (outside system or via calendar link)
3. Meeting details logged:
   - Date/time
   - Attendees
   - Notes
4. `outreach_status` updated to 'meeting_scheduled'

**Output:**
- Meeting scheduled
- Project status updated
- Follow-up reminders set

---

## STEP 9: PRESENT PROPOSAL (Manual)

**What Happens:**
1. After meeting, Mike creates proposal
2. Services identified:
   - WiFi
   - DIRECTV
   - Phone Systems
   - Audio Visual
   - Structured Cabling
   - Access Control
   - etc.
3. Proposal sent
4. `outreach_status` updated to 'proposal_sent'

**Output:**
- Proposal sent
- Services tracked
- Project status updated

---

## STEP 10: CLOSE DEAL (Manual)

**What Happens:**
1. Customer accepts proposal
2. Contract signed
3. Mike marks project as "Won":
   - Updates `outreach_status` to 'won'
   - Enters `actual_revenue` (deal value)
   - Enters `closed_at` (date)
   - Enters services sold (for commission calculation)
4. Commission calculated:
   - $1,000 per service sold
   - Example: 4 services = $4,000 commission

**Commission Tracking:**
- Services sold: Array of services
- Commission per service: $1,000
- Total commission: `services.length × $1,000`
- Revenue share: Commission amount

**Output:**
- `outreach_status = 'won'`
- `actual_revenue` = Deal value
- `closed_at` = Close date
- Commission calculated
- Revenue tracked

---

## STEP 11: INSTALLATION & ONBOARDING (Post-Contract)

**What Happens:**
1. **Week 1:** Site survey, equipment ordering
2. **Week 2:** Equipment delivery, installation prep
3. **Week 3:** Installation begins
4. **Week 4:** Testing, go-live, training

**Customer Needs:**
- Access to site
- Space for equipment
- Power requirements
- Network access

**Output:**
- Installation complete
- Customer onboarded
- Services live

---

## STEP 12: COMMISSION PAID (Monthly)

**What Happens:**
1. Commission calculated at deal close
2. Tracked in system
3. Paid monthly (outside system)
4. Revenue attributed to:
   - Project
   - Campaign
   - Services sold

**Commission Formula:**
```
Commission = Services Sold × $1,000
```

**Example:**
- Hotel project: 4 services (WiFi, DIRECTV, Phone, AV)
- Commission: 4 × $1,000 = $4,000

---

## 📊 METRICS TRACKED THROUGHOUT

### Pipeline Metrics:
- Total projects
- Hot leads (80+)
- Pipeline value
- Average score

### Outreach Metrics:
- Emails sent
- Open rate
- Response rate
- Click rate

### Conversion Metrics:
- Meetings booked
- Proposals sent
- Deals closed
- Revenue generated

### Revenue Metrics:
- Commission per deal
- Services sold
- Total revenue share
- Close rate

---

## 🎯 KEY DECISION POINTS

### When to Enrich:
- ✅ Score 80+ (hot leads)
- ✅ Score 70+ if in planning stage
- ✅ High value ($10M+)

### When to Send Campaign:
- ✅ After enrichment (have insights)
- ✅ Score 70+
- ✅ Planning or pre-construction stage

### When to Follow Up:
- ✅ Email opened but no reply (3 days)
- ✅ Link clicked (immediate)
- ✅ No response (7 days)

### When to Close:
- ✅ Proposal accepted
- ✅ Contract signed
- ✅ Payment received

---

## ⚡ OPTIMIZATION TIPS

1. **Focus on Hot Leads First**
   - Score 80+ = highest priority
   - Planning stage = best timing

2. **Enrich Before Outreach**
   - AI insights = better personalization
   - Competitive intel = stronger pitch

3. **Use Video for High-Value**
   - $20M+ projects
   - Score 90+
   - 3x higher response rates

4. **Track Everything**
   - Know what works
   - Optimize messaging
   - Improve close rates

5. **Follow Up Quickly**
   - Respond within 24 hours
   - Follow up every 3-7 days
   - Don't give up after 1 email

---

## 📈 EXPECTED CONVERSION RATES

Based on industry standards:

- **Leads → Meetings:** 12% (with AI personalization)
- **Meetings → Proposals:** 50%
- **Proposals → Closed:** 30%
- **Overall Close Rate:** 1.8% (12% × 50% × 30%)

**With 500 leads:**
- 60 meetings (12%)
- 30 proposals (50% of meetings)
- 9 deals closed (30% of proposals)
- $36,000 commission (9 deals × 4 services × $1,000)

---

## 🎉 SUCCESS METRICS

**Month 1:**
- 500+ projects in pipeline
- 50+ campaigns sent
- 10+ meetings booked
- 2-3 deals closed
- $8K-12K commission

**Month 3:**
- 1,500+ projects
- 150+ campaigns
- 30+ meetings
- 8-10 deals closed
- $32K-40K commission

**Month 6:**
- 3,000+ projects
- 300+ campaigns
- 60+ meetings
- 18-20 deals closed
- $72K-80K commission

---

**This is the complete workflow from scrape to commission!** 🚀

