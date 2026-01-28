# HCI Runthroughs for Mike - Monday Morning Workflow

## 🎯 **TL;DR - The 30-Minute Monday Morning Routine**

1. **Dashboard Check** (2 min) → See hot leads count
2. **Call Hot Leads** (20-30 min) → Anyone who opened email gets a call
3. **Review Follow-Ups** (5 min) → Click "Send Follow-Up" for items >3 days old
4. **Done** → Everything else is automated or weekly/monthly

---

## Overview
This document provides step-by-step Human-Computer Interaction (HCI) runthroughs for Mike's Monday morning workflow, focusing on scraper operations, property status tracking, follow-up scheduling, and analytics for non-responsive companies.

**KISS Principle:** Focus on what matters most - calls to hot leads. Everything else is either automated or can wait.

---

## 🎯 **RUNTHROUGH 1: Monday Morning - Starting Fresh**

### **Step 1: Logging In & Dashboard Overview**
**Time: 8:00 AM**

1. **Open Dashboard**
   - Navigate to `/dashboard`
   - View quick stats cards:
     - **Total Projects**: Shows all projects in pipeline
     - **Hot Leads**: Projects with score ≥80
     - **Need to Call**: Count of opened emails requiring immediate follow-up

2. **Check Scraper Status**
   - Locate "Scraper Status" card on dashboard
   - See current status:
     - ✅ **Active** (green) = Recent successful scrape
     - ⚠️ **Unknown** (yellow) = No recent activity
     - ❌ **Failed** (red) = Last scrape encountered errors
   - Review "Last Run" timestamp
   - View "projects" count from last successful run

---

## 🔄 **RUNTHROUGH 2: Running the Scraper via Dashboard Button**

### **Step 1: Accessing Scraper Controls**

**Current Implementation:**
- Scraper runs via API endpoint `/api/scrape/construction-wire`
- Requires API key authentication
- Currently triggered via GitHub Actions (scheduled daily at 6 AM UTC)

**Recommended UI Flow (To Be Implemented):**

1. **On Dashboard:**
   - Find "Scraper Status" card
   - Click **"Run Scraper Now"** button
   - Modal appears with options:
     - Project types (multi-select)
     - States (multi-select)
     - Minimum project value ($)
     - Max results limit

2. **Scraper Execution:**
   - Click **"Start Scrape"**
   - Button shows loading state: "Running..."
   - Status updates to:
     - ⏳ "Running" (blue spinning icon)
     - Real-time progress indicator
     - Estimated time remaining

3. **Completion:**
   - Status changes to ✅ "Success"
   - Shows:
     - Projects found: X
     - Projects inserted: Y
     - Projects updated: Z
   - Toast notification: "Scrape completed! Found X new projects"

4. **Error Handling:**
   - If failed, status shows ❌ "Failed"
   - Error message displayed in red alert box
   - "View Logs" button links to detailed error logs
   - "Retry" button available

---

## 📊 **RUNTHROUGH 3: Property Status Tracking**

### **Status Flow for Each Property**

Each project has an `outreach_status` field that tracks progression:

#### **Core Status Definitions (KISS - 6 Statuses):**

1. **`new`** (Gray) - Just scraped, no outreach yet
2. **`contacted`** (Blue) - Email sent, waiting for response
3. **`warm`** (Yellow/Orange) - Email opened/clicked (any engagement) ← **CALL THESE**
4. **`qualified`** (Green) - Positive response, interested
5. **`closed`** (Green/Red) - Won (✅) or Lost (❌)
6. **`archived`** (Gray) - Not interested, move on

**Decision Tree:**
- **New** → System auto-sends email → **Contacted**
- **Contacted + Email Opened** → **Warm** → **Call immediately**
- **Warm + Positive Response** → **Qualified** → Schedule meeting
- **Contacted + No Response (21+ days)** → **Archived**

**Note:** System may use more granular statuses internally (meeting_scheduled, proposal_sent, etc.) but Mike only needs to track these 6 core statuses.

### **Viewing Property Status:**

1. **On Dashboard:**
   - Go to "Projects" section
   - Each project row shows:
     - Project name
     - Location (city, state)
     - Current status badge
     - Groove fit score
   - Quick action buttons:
     - "Contacted"
     - "Engaged"
     - "Qualified"

2. **On Projects Page (`/projects`):**
   - Full project list with filters
   - Status column shows current `outreach_status`
   - Click project to see detailed view

3. **On Individual Project Page (`/projects/[id]`):**
   - Full status history
   - Timeline of all activities
   - Current status prominently displayed
   - Action buttons based on current status

---

## 📧 **RUNTHROUGH 4: Email Domain, Deliverability & Subject Line Strategy**

### **Email Domain & Sender Identity:**

**Current Configuration:**
- **Sender Email**: `msartain@getgrooven.com` (Mike's actual business email)
- **Sender Name**: "Mike Sartain - Groove Technologies"
- **Reply-To**: `msartain@getgrooven.com`
- **Email Service**: SendGrid (enterprise email delivery platform)

**Why This Matters:**
- ✅ Recipients see emails from Mike's actual business domain (`getgrooven.com`)
- ✅ Looks like a personal email from Mike, not a generic sales platform
- ✅ Reply-To goes directly to Mike's inbox for genuine responses
- ✅ Professional domain builds trust vs. generic "noreply" addresses

### **Subject Line Optimization Strategy:**

**Current Subject Line Patterns:**
Based on vertical-specific NEPQ email generation, subjects include:
- **Wedge Questions**: "Quick question about {projectName}"
- **Pain Math**: "re: Quick question about {projectName}"
- **Fear/Competitive**: "Saw something about {location}"
- **Story**: "What happened at a {vertical} last month"
- **Exit**: "Closing the loop on {projectName}"

**Subject Line Best Practices (Current System):**

1. **Pattern Interruption**
   - Avoid salesy keywords: "Free", "Act Now", "Limited Time", "Special Offer"
   - Use conversational tone: "Quick question", "Saw this", "One more thought"
   - Personalized: Includes actual project name or location

2. **Length Optimization**
   - Target: 40-50 characters (mobile-friendly)
   - Examples:
     - ✅ "Quick question about Marriott Downtown" (43 chars)
     - ✅ "re: Quick question about {propertyName}" (30-45 chars)
     - ❌ "Exciting opportunity for your hotel project that could save you money" (too long)

3. **Curiosity-Driven**
   - Questions that make them think: "Quick question about..."
   - Pattern breaks: "Saw this about..." (not typical vendor email)
   - Personal: Uses actual project/location names

4. **Vertical-Specific Optimization**
   - **Hospitality**: "Quick question about {hotelName} events"
   - **Senior Living**: "Quick question about {facilityName}"
   - **Multifamily**: "Quick question about {propertyName} move-in day"
   - **Student**: "Quick question about {propertyName} move-in day"

### **Getting Past Firewalls & Spam Filters:**

#### **1. Email Authentication (SPF, DKIM, DMARC)**

**Current State:** SendGrid handles authentication
**Recommended Configuration:**

- **SPF Record**: Should include SendGrid's sending servers
  ```
  TXT @ "v=spf1 include:sendgrid.net ~all"
  ```

- **DKIM**: SendGrid provides DKIM keys (should be configured)
  - Check SendGrid dashboard → Settings → Sender Authentication
  - Add CNAME records to `getgrooven.com` DNS

- **DMARC**: Recommended policy
  ```
  TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@getgrooven.com"
  ```
  - Start with `p=none` (monitoring mode)
  - After 30 days, move to `p=quarantine` or `p=reject` if reputation is good

**Action Items:**
- Verify SendGrid domain authentication is complete
- Check DNS records are properly configured
- Monitor DMARC reports for authentication failures

#### **2. Domain Reputation Management**

**Current Strategies:**
- ✅ Using professional business domain (`getgrooven.com`)
- ✅ Sending through SendGrid (reputable ESP)
- ✅ Rate limiting (50 emails/minute max)
- ⚠️ Need domain warm-up for new sending IPs

**Domain Warm-Up Process:**
- **Days 1-3**: 10-20 emails/day
- **Days 4-7**: 50-100 emails/day
- **Days 8-14**: 200-500 emails/day
- **Days 15-30**: Gradually increase to full volume
- **Ongoing**: Maintain consistent sending patterns

**Reputation Monitoring:**
- SendGrid provides reputation scores
- Monitor bounce rates (keep <2%)
- Watch spam complaint rates (keep <0.1%)
- Track open rates (target: 35%+)

#### **3. Content-Based Spam Prevention**

**Avoid These Red Flags:**
- ❌ Excessive exclamation marks!!! 
- ❌ ALL CAPS WORDS
- ❌ Spam trigger words: "Free", "Limited Time", "Click Here", "Buy Now"
- ❌ Too many links (>3-4 links)
- ❌ Poor HTML formatting
- ❌ Missing text version (HTML-only emails)

**Current System Does Well:**
- ✅ Plain text emails (no HTML spam triggers)
- ✅ Natural language (AI-generated, conversational)
- ✅ No excessive links (typically 1-2 links max)
- ✅ Personalization (project names, locations)

#### **4. List Hygiene**

**Best Practices:**
- ✅ Validate email addresses before sending
- ✅ Remove bounces immediately (hard bounces)
- ✅ Honor unsubscribe requests promptly
- ✅ Remove inactive contacts after 6+ months
- ✅ Don't send to purchased lists (only scraped contacts)

### **Getting Past Attention Walls:**

#### **1. Subject Line Psychology**

**Attention Capture Strategies:**

1. **Curiosity Gap**
   - "Quick question about..." (creates curiosity)
   - "Saw this about..." (pattern interrupt)
   - "One more thought..." (implies previous context)

2. **Personalization**
   - Include actual project name (shows research)
   - Include location/city (shows local relevance)
   - Role-specific triggers (e.g., "move-in day" for property managers)

3. **Question Format**
   - Questions create engagement (recipient mentally answers)
   - Examples:
     - "Quick question about {propertyName}"
     - "Who's responsible if the wifi doesn't work on move-in day?"
     - "What's your plan when 200 guests all connect simultaneously?"

4. **Pattern Interruption**
   - Doesn't look like typical vendor email
   - Conversational, not salesy
   - Short and scannable (mobile-first)

#### **2. Timing Optimization**

**Best Send Times (By Role):**
- **Developers/Owners**: 7-9 AM local time
- **GCs**: 6-7 AM local time (before jobsite)
- **Property Managers**: 9-10 AM local time
- **IT Directors**: 8-9 AM local time
- **Administrators**: 10-11 AM local time

**Why It Matters:**
- Early morning = Less email competition
- Before workday = Decision makers check email first
- Local time = Respects timezone boundaries

#### **3. Pre-Header Text (Recommended Addition)**

**Current State:** Not implemented
**Recommended:** Add pre-header text

- First 90-100 characters after subject line
- Shows in email preview (Gmail, Outlook)
- Should complement subject line
- Example:
  ```
  Subject: "Quick question about Marriott Downtown"
  Pre-header: "Who's responsible if the wifi doesn't work on move-in day?"
  ```

#### **4. A/B Testing Subject Lines**

**Current State:** Subject lines generated but not A/B tested
**Recommended:** Track subject line performance

**Test Variations:**
- **Question vs. Statement**: 
  - A: "Quick question about {projectName}"
  - B: "Thought about {projectName}"
  
- **Personal vs. Generic**:
  - A: "Quick question about Marriott Downtown"
  - B: "Quick question about your hotel project"
  
- **Length Variations**:
  - A: "Quick question about {projectName}" (short)
  - B: "Quick question about {projectName} move-in day" (specific)

**Metrics to Track:**
- Open rate by subject line variation
- Click rate by subject line variation
- Reply rate by subject line variation

### **Deliverability Quick Checklist:**

**One-Time Setup (Done by Developer):**
- ✅ Verify SendGrid domain authentication configured
- ✅ Test email delivery to Gmail/Outlook
- ✅ Domain warm-up complete (if new)

**Weekly Check (2 minutes):**
- Bounce rate < 2%? ✅ Good
- Open rate > 30%? ✅ Good
- Anything flagged? Review

**Monthly Review (Optional):**
- Review subject line performance
- Check for spam complaints
- Optimize based on data

**KISS Approach:** If emails are delivering and opening, you're good. Don't overthink it.

---

## 📧 **RUNTHROUGH 5: Vertical-Specific Email Customization & Product Showcase**

### **Vertical Intelligence in Emails:**

The system automatically customizes emails based on the project's vertical classification:

#### **The 4 Groove Verticals:**

1. **Hospitality** (Hotels)
   - Pain Points: Guest Satisfaction Scores, Wi-Fi Reliability, Review Management
   - Products Shown: Hospitality Bundle
   - Email Tone: Event-focused, brand standards, TripAdvisor impact

2. **Senior Living**
   - Pain Points: Resident Safety, Fall Detection, Staff Efficiency
   - Products Shown: Senior Living Bundle
   - Email Tone: Family-focused, telehealth readiness, CMS compliance

3. **Multifamily**
   - Pain Points: Amenity Fees, Smart Building/IoT, Resident Retention
   - Products Shown: Multifamily/MDU Bundle
   - Email Tone: Lease-up speed, move-in day, Google reviews

4. **Student/Commercial**
   - Pain Points: Bandwidth Density, Access Control
   - Products Shown: Student/Commercial Bundle
   - Email Tone: Move-in day density, gaming optimization, social media impact

### **Email Structure with Vertical-Specific Elements:**

Each email includes:

1. **Vertical-Aware Opening**
   - Uses NEPQ wedge questions specific to vertical
   - References vertical-specific pain points
   - Role-based psychology (Developer, GC, Property Manager, etc.)

2. **Groove Product/Bundle Section** (Recommended Addition)
   ```html
   <div class="product-showcase">
     <h3>Our {Vertical Name} Solution</h3>
     <ul>
       <li><a href="/hospitality#wifi" data-element="product-link-wifi">Wi-Fi Infrastructure</a></li>
       <li><a href="/hospitality#access-control" data-element="product-link-access">Access Control</a></li>
       <li><a href="/hospitality#structured-cabling" data-element="product-link-cabling">Structured Cabling</a></li>
     </ul>
     <a href="/hospitality" class="cta-button" data-element="cta-vertical-bundle">
       View {Vertical Name} Bundle
     </a>
   </div>
   ```

3. **Vertical-Specific Testimonials/Case Studies**
   - References similar properties in the same vertical
   - Shows ROI specific to that vertical's pain points

### **Element-Level Click Tracking for A/B Testing:**

**Current State:** System tracks email-level opens and clicks only
**Recommended Enhancement:** Element-level tracking

#### **Trackable Elements:**

1. **Product Links**
   - `data-element="product-link-wifi"`
   - `data-element="product-link-access"`
   - `data-element="product-link-cabling"`
   - `data-element="product-link-tv"`
   - `data-element="product-link-security"`

2. **CTA Buttons**
   - `data-element="cta-vertical-bundle"`
   - `data-element="cta-schedule-call"`
   - `data-element="cta-view-case-study"`
   - `data-element="cta-download-brochure"`

3. **Email Sections**
   - `data-element="section-pain-points"`
   - `data-element="section-products"`
   - `data-element="section-testimonial"`
   - `data-element="section-case-study"`

4. **Vertical-Specific Elements**
   - `data-element="hospitality-event-av"`
   - `data-element="senior-living-telehealth"`
   - `data-element="multifamily-smart-home"`
   - `data-element="student-gaming-optimization"`

#### **Database Schema for Element Tracking:**

```sql
-- New table: outreach_element_clicks
CREATE TABLE outreach_element_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES outreach_activities(id),
  element_id TEXT NOT NULL, -- e.g., "product-link-wifi"
  element_type TEXT NOT NULL, -- e.g., "product-link", "cta", "section"
  element_position INTEGER, -- Order in email (1, 2, 3...)
  vertical TEXT, -- "hospitality", "senior_living", etc.
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for analytics
CREATE INDEX idx_element_clicks_activity ON outreach_element_clicks(activity_id);
CREATE INDEX idx_element_clicks_element ON outreach_element_clicks(element_id);
CREATE INDEX idx_element_clicks_vertical ON outreach_element_clicks(vertical);
```

#### **A/B Testing Structure:**

**Test Variations:**
- **Variant A**: Products listed first, CTA at bottom
- **Variant B**: Pain points first, products in middle, CTA prominent
- **Variant C**: Case study first, products as secondary

**Metrics Tracked:**
- Which product links get the most clicks per vertical?
- Which CTA placement converts best?
- Which vertical-specific elements resonate?
- Element click-through rate by vertical
- Conversion rate: Element click → Meeting scheduled

#### **Analytics Dashboard:**

**Element Performance View:**
- Heat map showing most-clicked elements per vertical
- Comparison: Element performance across verticals
- Trends: Which elements are trending up/down

**Example Insights:**
- "Senior Living contacts click 'telehealth-ready rooms' 3x more than other products"
- "Hospitality bundle CTA at top converts 40% better than bottom placement"
- "Student housing contacts prefer 'gaming optimization' over 'access control'"

---

## 📧 **RUNTHROUGH 6: Follow-Up Schedule When Recipients Don't Open First Outreach**

### **The Problem:**
When initial email is sent but not opened, system needs to:
- Track time since first email
- Schedule follow-up attempts
- Escalate outreach strategy

### **Current System Behavior:**

#### **Email Status Tracking:**
- `pending` → Email queued but not sent
- `sent` → Email delivered to recipient's server
- `delivered` → Confirmed delivery
- `opened` → Recipient opened email (tracked via pixel)
- `clicked` → Recipient clicked link in email
- `replied` → Recipient responded
- `bounced` → Email failed to deliver

### **Follow-Up Schedule (Recommended):**

#### **Touchpoint 1: Initial Email**
- **When**: Immediately after scraping (if project score ≥70)
- **Status**: `outreach_status = 'contacted'`
- **Contact status**: `response_status = 'contacted'`

#### **Touchpoint 2: Follow-Up Email #1**
- **When**: 3 days after initial email (if no open)
- **Condition**: `status = 'sent'` or `'delivered'` AND `opened_at IS NULL`
- **Action**: Send follow-up email with different subject line
- **Update**: `contact_count = 1`
- **Status**: Keep `outreach_status = 'contacted'`

#### **Touchpoint 3: Video Outreach**
- **When**: 7 days after initial email (if still no open)
- **Condition**: 
  - `contact_count >= 1`
  - `response_status = 'no_response'`
  - Project value ≥ $5M OR score ≥ 85 OR decision maker
- **Action**: Generate and send HeyGen video message
- **Update**: `activity_type = 'video'`, `contact_count = 2`

#### **Touchpoint 4: Final Email Attempt**
- **When**: 14 days after initial email (if still no engagement)
- **Condition**: 
  - `contact_count >= 2`
  - No opens, clicks, or replies
- **Action**: Send "Last attempt" email with different angle
- **Update**: `contact_count = 3`

#### **Touchpoint 5: Archive Decision Point**
- **When**: 21 days after initial email (if zero engagement)
- **Condition**: 
  - `contact_count >= 3`
  - All activities have `status IN ('sent', 'delivered')`
  - No opens, clicks, or replies
- **Action**: Mark as `not_interested` or archive
- **Update**: 
  - `outreach_status = 'not_interested'`
  - `response_status = 'no_response'`
  - Optionally: `status = 'archived'` if confirmed dead lead

### **Dashboard Indicators:**

1. **Campaigns Page (`/campaigns`):**
   - Shows all sent emails
   - Filters: All / Opened / Clicked
   - "Pending" count = emails sent but not opened
   - Color coding:
     - 🟢 Green = Clicked
     - 🔵 Blue = Opened
     - 🟡 Yellow = Sent/Delivered (waiting)
     - 🔴 Red = Bounced

2. **Hot Leads Section:**
   - Only shows projects with opened emails
   - Call script provided
   - "Mark as Called" button available

3. **Follow-Up Queue (To Be Implemented):**
   - Section showing projects ready for follow-up
   - Shows days since last contact
   - Recommended next action
   - One-click "Send Follow-Up" button

---

## 📈 **RUNTHROUGH 7: Analytics - Consistently Not Interested Companies**

### **Tracking Non-Responsive Companies:**

The system tracks engagement at multiple levels:

1. **Contact Level** (`contacts` table):
   - `contact_count`: Number of outreach attempts
   - `response_status`: 'not_contacted' | 'no_response' | 'responded' | 'engaged' | 'qualified'
   - `last_contact_date`: Last outreach timestamp

2. **Company Level** (`companies` table):
   - Aggregate of all contacts at that company
   - Can identify companies where multiple contacts are non-responsive

3. **Project Level** (`high_priority_projects` table):
   - `outreach_status`: Current stage
   - Multiple projects from same company can be tracked

### **Analytics Dashboard (`/analytics`):**

#### **Metrics Tracked:**

1. **Pipeline Health:**
   - Total projects
   - By status breakdown
   - Average groove fit score
   - Pipeline value by status

2. **Outreach Performance:**
   - Total emails sent
   - Open rate (%)
   - Click rate (%)
   - Reply rate (%)
   - Bounce rate (%)

3. **Conversion Funnel:**
   - New → Contacted
   - Contacted → Engaged
   - Engaged → Qualified
   - Qualified → Won

4. **Non-Response Analysis:**
   - Companies with 0% open rate (after 3+ attempts)
   - Contacts marked as `no_response`
   - Projects marked as `not_interested`
   - Average time to archive

#### **Identifying Consistently Not Interested:**

**Query Logic:**
```sql
-- Find companies where all contacts are non-responsive
SELECT 
  c.company_name,
  COUNT(DISTINCT ct.id) as total_contacts,
  COUNT(DISTINCT p.id) as total_projects,
  AVG(CASE WHEN ct.response_status = 'no_response' THEN 1 ELSE 0 END) as non_response_rate
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id
LEFT JOIN project_stakeholders ps ON ps.contact_id = ct.id
LEFT JOIN high_priority_projects p ON p.id = ps.project_id
WHERE ct.contact_count >= 3
GROUP BY c.company_name
HAVING AVG(CASE WHEN ct.response_status = 'no_response' THEN 1 ELSE 0 END) = 1.0
```

**UI Display:**
- "Not Interested Companies" section
- Shows:
  - Company name
  - Number of contacts attempted
  - Number of projects
  - Last contact date
  - Open rate: 0%
- Actions:
  - "Archive Company" button
  - "Mark as Do Not Contact" checkbox
  - Export to CSV

### **Archive Decision Workflow:**

#### **When to Archive:**

**Automatic Archive (Recommended):**
- After **3 contact attempts** (contact_count = 3)
- **21+ days** since first contact
- Zero engagement (no opens, clicks, replies)
- All activities have status 'sent' or 'delivered'

**Manual Archive:**
- User explicitly marks as "Not Interested"
- User archives via project detail page
- Bulk archive via analytics page

#### **Archive Actions:**

1. **Update Project:**
   - `outreach_status = 'not_interested'`
   - `status = 'archived'` (optional)
   - `archived_at = NOW()`
   - `archived_reason = 'No response after 3 attempts'`

2. **Update Contact:**
   - `response_status = 'no_response'`
   - Keep `contact_count` for analytics

3. **Archive Record:**
   - Insert into `archived_records` table:
     - `original_table = 'high_priority_projects'`
     - `original_id = project.id`
     - `archive_reason = 'Consistently non-responsive'`
     - `archived_at = NOW()`

4. **Analytics Update:**
   - Increment "lost" count in pipeline_metrics
   - Track company-level non-response rate
   - Flag company for future scraping (optional: skip)

### **Company-Level Intelligence:**

**Future Enhancement (Recommended):**
- Company scoring based on historical response rate
- Auto-flag companies with <10% historical open rate
- Skip automatic outreach for known non-responsive companies
- Manual review queue for low-probability companies

---

## 📝 **RUNTHROUGH 8: Manual Lead Input (Non-Construction Wire Leads)**

### **The Need:**
Mike gets leads from other sources:
- Networking events
- Referrals
- Trade shows
- LinkedIn connections
- Previous relationships
- Industry publications

These need to be tracked in the same system with the same schema.

### **Manual Project Entry Workflow:**

**Step 1: Access "Add Project" Form**
- Navigate to `/projects` page
- Click **"+ Add Project"** button (top right)
- Modal/form appears

**Step 2: Fill Required Fields (Minimal to Start)**
- **Project Name** (required) - e.g., "Sunset Ridge Apartments"
- **Project Type** (required) - Select: Hotel, Multifamily, Senior Living, Student, etc.
- **Location** - City, State
- **Source** (dropdown) - "Manual Entry", "Referral", "Networking", "Other"

**Step 3: Optional Fields (Can Fill Later)**
- Project Value ($)
- Units Count
- Project Stage (Planning, Pre-Construction, etc.)
- Developer Name
- Contact Information
- Notes/Context

**Step 4: Save & Auto-Score**
- Click **"Save Project"**
- System:
  - Calculates Groove Fit Score automatically
  - Assigns `outreach_status = 'new'`
  - Assigns `priority_level` based on score
  - Adds to pipeline

**Step 5: Enrichment (Optional, One-Click)**
- Project appears in list
- Click **"Enrich with AI"** button
- System auto-fills missing data:
  - Geocodes location
  - Finds developer info
  - Discovers contacts
  - Calculates better score
  - Adds research insights

### **Quick Entry Form (KISS Version):**

**Fast Path (30 seconds):**
1. Project Name: "Sunset Ridge"
2. Type: Multifamily
3. City: Austin, TX
4. Source: Referral
5. **Save** → Done

System handles the rest. You can enrich/add details later.

**Full Entry (2 minutes):**
- All fields available
- Can add contacts immediately
- Can set custom status
- Can add notes/context

### **Source Tracking:**
Projects track their source:
- `construction_wire` (scraped)
- `manual_entry` (you added it)
- `referral` (someone told you about it)
- `networking` (met at event)
- `other` (specify in notes)

**Why This Matters:**
- Track ROI of different lead sources
- Know which sources convert best
- Optimize time spent on lead generation

### **After Manual Entry:**
Project behaves exactly like scraped projects:
- ✅ Same scoring system
- ✅ Same outreach automation
- ✅ Same status tracking
- ✅ Same analytics
- ✅ Can trigger campaigns
- ✅ Can add to hot list

**KISS Principle:** Manual entry takes 30 seconds. System does the rest.

---

## 🎯 **RUNTHROUGH 9: Goal Setting & Progress Tracking with NEPQ Optimization**

### **The Need:**
Mike wants to:
- Set goals (revenue, services sold, deals closed, amenities)
- Track progress over time
- Get AI-powered recommendations on how to hit goals
- Reverse-engineer from goals to tactics

### **Goal Setting Workflow:**

**Step 1: Access Goals Dashboard**
- Navigate to `/analytics` page
- Click **"Goals"** tab
- See current goals and progress

**Step 2: Create New Goal**
- Click **"+ New Goal"** button
- Select goal type:
  - **Revenue Goal** - Target: $X over Y period
  - **Deals Closed** - Target: X deals over Y period
  - **Services Sold** - Target: X WiFi installs, Y Access Control, etc.
  - **Amenities** - Target: X smart home deals, Y fiber projects, etc.
  - **Pipeline Value** - Target: $X in pipeline
  - **Meeting Goals** - Target: X meetings booked

**Step 3: Set Goal Parameters**
- **Goal Name**: "Q1 2025 Revenue"
- **Target Value**: $500,000
- **Time Period**: January 1 - March 31, 2025
- **Current Progress**: Auto-calculated from closed deals
- **Breakdown** (optional):
  - By vertical (Hospitality: $200K, Multifamily: $300K)
  - By service type (WiFi: $150K, Access Control: $100K, etc.)

**Step 4: Save Goal**
- Goal appears on analytics dashboard
- Progress bar shows: Current / Target
- Days remaining shown
- Pace indicator: "On track" / "Ahead" / "Behind"

### **Goal Progress Dashboard:**

**Visual Elements:**
- **Progress Bar**: Shows % complete
- **Trend Line**: Shows progress over time
- **Pace Calculation**: "At current pace, you'll hit $X by Y date"
- **Gap Analysis**: "Need $X more to hit goal"

**Goal Cards Show:**
```
🎯 Q1 2025 Revenue
Target: $500,000 | Current: $325,000 | Progress: 65%
[████████████████░░░░] 65%
At current pace: $487,000 by March 31 (ON TRACK)
Need: $175,000 more | Days left: 45
```

### **NEPQ-Powered Optimization Recommendations:**

**How It Works:**
System analyzes:
- Current goal progress
- Historical performance
- Pipeline status
- Vertical performance
- Outreach effectiveness
- NEPQ psychology data

**Generates Recommendations:**

**Example: Revenue Goal Behind Pace**
```
🎯 Goal: Q1 Revenue ($500K)
Current: $325K (65%) | On pace: $487K | Need: $175K

NEPQ Optimization Recommendations:

1. **Focus on High-Value Projects**
   - 3 projects in pipeline worth $180K+ combined
   - All at "Qualified" status
   - NEPQ insight: Hospitality deals close 40% faster in Q1
   - Action: Prioritize Marriott Hotel ($85K), Hyatt Resort ($65K), 
     Four Seasons ($95K)

2. **Vertical Strategy**
   - Hospitality vertical: 45% close rate, 18-day sales cycle
   - Multifamily vertical: 32% close rate, 28-day sales cycle
   - Recommendation: Focus 70% effort on Hospitality (faster close)

3. **Outreach Optimization**
   - Projects with "move-in day" pain point: 52% response rate
   - Projects with "event AV" pain point: 38% response rate
   - Action: Emphasize move-in day urgency in multifamily emails

4. **Subject Line Optimization**
   - "Quick question about {propertyName} move-in day" → 48% open rate
   - Current average: 32% open rate
   - Action: Use move-in day angle for all multifamily outreach

5. **Contact Timing**
   - Hospitality contacts: Best response 8-9 AM local
   - Multifamily contacts: Best response 9-10 AM local
   - Current: Mixed timing (avg 32% open rate)
   - Action: Schedule Hospitality emails for 8 AM, Multifamily for 9 AM
```

### **Reverse-Engineering from Goals:**

**Example: "I need $175K more revenue"**

System calculates:
1. **Deals Needed**: $175K ÷ avg deal size ($42K) = 4.2 deals → **Need 5 deals**
2. **Pipeline Required**: With 32% close rate, need 5 ÷ 0.32 = **16 qualified deals**
3. **Meetings Needed**: With 18% meeting-to-close rate, need 16 ÷ 0.18 = **89 meetings**
4. **Outreach Needed**: With 12% response rate, need 89 ÷ 0.12 = **742 emails sent**

**Then Provides Tactics:**
- "To hit goal, focus on 16 projects currently at 'Qualified' status"
- "Prioritize these 5 high-value projects: [list]"
- "Send follow-ups to 23 'Warm' contacts this week"
- "Emphasize 'move-in day' pain point for multifamily (higher conversion)"

### **Amenity/Service Goals:**

**Example Goal**: "Sell 12 Access Control systems in Q1"

**NEPQ Recommendations:**
- Access Control converts best in Senior Living (38% close rate)
- Use "resident safety" pain point (highest conversion)
- Target Directors of Nursing (decision makers, respond best to safety angle)
- Subject line: "Quick question about {facilityName} resident safety"
- Timing: Send 2-3 PM local (when they're thinking about resident care)

### **Goal Dashboard Features:**

**Multiple Goals:**
- Revenue: $500K (65% complete)
- Deals Closed: 8/12 (67% complete)
- Services Sold: WiFi: 15/20, Access Control: 8/12
- Pipeline Value: $2.4M/$3M (80% complete)

**Each Goal Shows:**
- Progress bar
- Trend (getting better/worse)
- Days remaining
- Pace (on track/behind/ahead)
- Top 3 recommendations

**At-a-Glance View:**
```
🎯 GOALS DASHBOARD

Revenue:        [████████████░░░░] 65% - ON TRACK
Deals Closed:   [██████████░░░░░░] 67% - ON TRACK  
WiFi Services:  [███████████░░░░░] 75% - AHEAD ✅
Access Control: [████████░░░░░░░░] 67% - BEHIND ⚠️

⚠️ Access Control behind pace - See recommendations below
```

### **Smart Recommendations Engine:**

**Uses NEPQ Data to Suggest:**
- Which verticals to focus on (based on goal type)
- Which pain points to emphasize (highest conversion)
- Which roles to target (best decision makers)
- Which subject lines work (best open rates)
- Which timing works (best response rates)
- Which projects to prioritize (highest value + conversion probability)

**Example Output:**
```
To catch up on Access Control goal:
1. Focus on Senior Living vertical (38% conversion)
2. Target 5 projects: [list with contact info]
3. Use "resident safety" pain point in emails
4. Send emails Tuesday-Thursday, 2-3 PM local
5. Follow up with Directors of Nursing (best responders)
```

### **KISS Version:**

**Set Goal:**
1. Go to Analytics → Goals
2. Click "+ New Goal"
3. Choose type, set target, set date
4. **Done**

**Check Progress:**
- See progress bar on dashboard
- If behind, click "Get Recommendations"
- System tells you what to do

**That's it.** System handles the optimization logic.

---

## 🔬 **RUNTHROUGH 10: A/B Testing Email Elements**

### **Setting Up Element-Level A/B Tests:**

1. **Create Test Variants**
   - Go to Campaigns page → "A/B Testing" section
   - Create new test:
     - **Test Name**: "Product Placement - Hospitality Q1"
     - **Vertical**: Hospitality
     - **Variants**: 3
     - **Split**: 33%/33%/34%
   
2. **Define Variants:**
   - **Variant A**: Products listed first, then pain points, CTA at bottom
   - **Variant B**: Pain points first, products in middle, prominent CTA
   - **Variant C**: Case study/testimonial first, products secondary

3. **Track Elements:**
   - Each element tagged with `data-element` attribute
   - System automatically tracks clicks on each element
   - Analytics show:
     - Click count per element
     - Click rate per element
     - Conversion: Element click → Meeting scheduled

4. **Review Results:**
   - After 100 emails sent per variant:
     - Variant A: 12% overall CTR, 3 meetings
     - Variant B: 18% overall CTR, 8 meetings ← **Winner**
     - Variant C: 15% overall CTR, 5 meetings
   - Element breakdown:
     - Variant B's "cta-vertical-bundle" clicked 35 times (35% CTR)
     - Variant A's "cta-vertical-bundle" clicked 8 times (8% CTR)

5. **Apply Winning Variation:**
   - Set Variant B as default for Hospitality vertical
   - System automatically uses winning template going forward

### **Continuous Optimization:**

- **Weekly Review**: Check element performance across all verticals
- **Monthly Optimization**: Update email templates based on top performers
- **Quarterly Tests**: Run new A/B tests to beat current winners
- **Vertical Refinement**: Different variations win in different verticals

---

## ⚡ **QUICK DECISION TREES**

### **When Email Opens:**
```
Email Opened?
  ├─ YES → Call immediately (use generated call script)
  │   ├─ Got meeting? → Mark as "Qualified"
  │   └─ Not interested? → Mark as "Archived"
  │
  └─ NO → Check days since sent
      ├─ < 3 days → Wait
      ├─ 3-6 days → Send follow-up (system auto-queues)
      ├─ 7-20 days → Send video (if high-value project)
      └─ 21+ days → Archive (system auto-archives)
```

### **When to Call vs. When to Email:**
```
Email Opened? → CALL (they're engaged, strike while hot)
Email Not Opened? → Follow-up email (they haven't seen it)
After 3 attempts? → Archive (move on)
```

### **Priority Order (Do First):**
1. 🟢 **Hot Leads** (opened email) → Call now
2. 🟡 **Follow-Ups** (3+ days old) → Send follow-up
3. ⚪ **New Projects** (score ≥80) → Auto-emails sent
4. 🔴 **Archive** (21+ days, no response) → Auto-archived

---

## 🎬 **COMPLETE MONDAY MORNING WORKFLOW EXAMPLE**

### **8:00 AM - The 30-Minute Monday Morning Routine**

**Step 1: Dashboard Check (2 minutes)**
- Login → Dashboard
- See big numbers:
  - **Hot Leads: 12** ← This is your priority
  - Scraper: ✅ Active (if not, click "Run Now")
  - Total Projects: 342 (nice to know, not urgent)

**Step 2: Call Hot Leads (20-30 minutes)**
- Click "🔥 Calls to Make" section
- See 12 prospects who opened emails
- For each:
  1. Click "Call" button (opens phone dialer)
  2. Read generated call script
  3. Make the call
  4. After call: Click "Mark as Called" or "Qualified"
- **Done when:** All 12 calls made

**Step 3: Quick Follow-Up Check (5 minutes)**
- Navigate to `/campaigns`
- See "Follow-Up Queue" (if implemented) or filter: Status = "Sent", >3 days old
- Click "Send Follow-Up" for any items
- **Done when:** Queue empty or reviewed

**That's it. You're done.** ✅

Everything else (analytics, A/B testing, archives) can wait for weekly/monthly review.

### **9:00 AM - Run Scraper (If Needed - Usually Automated)**

1. **Trigger Manual Scrape**
   - Click "Run Scraper Now" on dashboard
   - Select: All project types, All states, Min $500K
   - Click "Start Scrape"
   - Monitor progress: "Running... 47 projects found so far..."
   - Wait 2-3 minutes
   - See: "✅ Success! 23 new projects, 15 updated"

2. **Review New Projects**
   - Navigate to `/projects`
   - Filter: Status = "new"
   - See 23 new projects
   - Review top-scoring ones (score ≥80)
   - System will auto-send emails for high-scoring projects

### **10:00 AM - Follow-Up Queue Review (Usually Automated)**

1. **Identify Follow-Ups Needed**
   - Go to Campaigns page
   - Filter: Status = "Sent" or "Delivered"
   - Sort by: Created date (oldest first)
   - See projects contacted 3+ days ago with no opens

2. **Send Follow-Up #1 (Day 3)**
   - Select projects: 3 days old, no opens
   - Click "Send Follow-Up" batch action
   - System sends follow-up email
   - Updates: `contact_count = 1`

3. **Review Video Candidates (Day 7)**
   - Filter: 7+ days old, no opens, score ≥85 OR value ≥$5M
   - See 8 projects eligible for video
   - Click "Send Video" (optional manual override)
   - System generates HeyGen video
   - Sends video email
   - Updates: `contact_count = 2`, `activity_type = 'video'`

### **10:30 AM - Analytics Deep Dive (Monthly, Not Daily)**

**Note:** This is a monthly review task, not daily. Skip this on Monday mornings.

**Monthly Review (Do Once a Month):**
1. Check analytics dashboard
2. Review top-performing subject lines
3. Note any trends (which verticals perform best)
4. Adjust if needed (usually not needed)

**KISS Rule:** If open rate > 30% and reply rate > 10%, don't change anything.

### **11:00 AM - Add Manual Lead (As Needed)**

**When:** Mike gets a lead from networking, referral, etc.

**Quick Entry (30 seconds):**
1. Navigate to `/projects`
2. Click **"+ Add Project"**
3. Fill minimal fields:
   - Project Name
   - Type
   - City, State
   - Source: "Manual Entry" or "Referral"
4. Click **Save**
5. **Done** - Project added, system scores it

**Optional Enrichment:**
- Click **"Enrich with AI"** on the new project
- System fills in missing details
- Finds contacts
- Improves score

**KISS Rule:** Fast entry = 30 seconds. Enrichment can wait.

---

### **11:00 AM - Archive Review (Weekly, Not Daily)**

**Note:** This is automated. System auto-archives after 21 days with no response.

**Weekly Check (5 minutes, Fridays):**
- Navigate to `/analytics` → "Archive Queue"
- Review auto-archived items
- Confirm or un-archive if needed
- Usually: Just confirm, system is smart

**KISS Rule:** Trust the automation. Only review if something looks wrong.

### **Friday Afternoon - Weekly Review (15 minutes)**

1. **Check Goal Progress**
   - Navigate to `/analytics` → Goals tab
   - See all active goals and progress
   - If behind on any goal, click "Get Recommendations"
   - System provides NEPQ-powered tactics

2. **Quick Actions Based on Goals**
   - If revenue behind: System suggests which projects to prioritize
   - If deals behind: System suggests which contacts to call
   - If services behind: System suggests which verticals to focus on

3. **Plan Next Week**
   - Review goal progress
   - Adjust priorities based on recommendations
   - Schedule follow-ups for recommended contacts

**Quick Weekly Check (Friday, 15 minutes):**
1. Dashboard → See week's stats
2. Any trends? (More opens? More replies?)
3. Plan next week: Any high-value projects coming up?

**That's it.** Don't overthink it.

---

## ⚠️ **COMMON MISTAKES TO AVOID**

1. **Calling before 7 AM local time** - Respect timezones
2. **Archiving after 1 attempt** - Give it 3 attempts (21 days)
3. **Skipping hot leads** - These are your highest ROI, always prioritize
4. **Overthinking analytics** - If open rate > 30%, you're good
5. **Manual follow-ups** - Let system auto-send after 3 days
6. **Spending hours on A/B testing** - Monthly review is enough

---

## 🔧 **SYSTEM RECOMMENDATIONS FOR FULL IMPLEMENTATION**

*Note: These are technical implementation details. For workflow purposes, assume these are handled by the system.*

### **1. Follow-Up Automation**

**Current State:** Manual follow-ups
**Recommended:** Automated follow-up queue

**Implementation:**
- Cron job runs daily at 9 AM
- Queries: `outreach_activities` where:
  - `status IN ('sent', 'delivered')`
  - `opened_at IS NULL`
  - `created_at <= NOW() - INTERVAL '3 days'`
- Creates follow-up tasks
- Dashboard shows "Follow-Up Queue" section
- One-click "Send Now" for each item

### **2. Archive Automation**

**Current State:** Manual archive
**Recommended:** Auto-archive after criteria met

**Implementation:**
- Cron job runs daily at 10 PM
- Queries projects where:
  - `contact_count >= 3`
  - Last contact > 21 days ago
  - No opens, clicks, or replies
- Auto-updates: `outreach_status = 'not_interested'`
- Sends notification to Mike for review
- Analytics updated

### **3. Company-Level Intelligence**

**Current State:** Project-level tracking only
**Recommended:** Company scoring system

**Implementation:**
- Add `company_response_rate` field to `companies` table
- Calculate: (total opens / total sent) per company
- Flag companies with <10% response rate
- Skip auto-outreach for flagged companies
- Manual review queue for low-probability companies

### **4. Scraper Button UI**

**Current State:** API-only, GitHub Actions
**Recommended:** Dashboard button with real-time status

**Implementation:**
- Add "Run Scraper" button to ScraperStatus component
- Modal with options (project types, states, min value)
- Real-time status updates via WebSocket or polling
- Progress bar showing current progress
- Completion notification with results

### **5. Element-Level Click Tracking**

**Current State:** Email-level tracking only (opened/clicked)
**Recommended:** Element-level tracking with A/B testing

**Implementation:**
- Add `data-element` attributes to all clickable elements in emails
- Create `outreach_element_clicks` table
- Update email generation to include tracking pixels per element
- Build analytics dashboard showing:
  - Element performance heat map
  - Vertical-specific element preferences
  - A/B test results by element
  - Conversion funnel: Element click → Meeting

**Benefits:**
- Know which products resonate per vertical
- Optimize CTA placement and wording
- Understand which pain points drive clicks
- Refine email templates based on data, not guesswork
- Improve conversion rates through iterative testing

### **6. Manual Project Entry**

**Current State:** Projects only come from Construction Wire scraping
**Recommended:** "Add Project" form for manual entry

**Implementation:**
- Add "+ Add Project" button to Projects page
- Simple form with required fields (name, type, location)
- Optional fields (value, stage, contacts, notes)
- Auto-calculates Groove Fit Score on save
- Tracks source (manual_entry, referral, networking, etc.)
- Can trigger AI enrichment after creation

**Benefits:**
- Track all leads in one place (not just scraped ones)
- Capture referrals and networking contacts
- Same workflow/automation for all projects
- Source tracking for ROI analysis

### **7. Goal Setting & NEPQ Optimization**

**Current State:** Analytics shows metrics but no goals or recommendations
**Recommended:** Goal setting with AI-powered optimization

**Implementation:**
- Create `goals` table:
  ```sql
  CREATE TABLE goals (
    id UUID PRIMARY KEY,
    organization_id UUID,
    goal_type TEXT, -- revenue, deals_closed, services_sold, amenities
    goal_name TEXT,
    target_value NUMERIC,
    current_value NUMERIC, -- auto-calculated
    start_date DATE,
    end_date DATE,
    breakdown JSONB, -- by vertical, service type, etc.
    created_at TIMESTAMPTZ
  );
  ```
- Goals dashboard showing progress bars
- NEPQ optimization engine:
  - Analyzes goal progress vs. target
  - Calculates what's needed (deals, meetings, emails)
  - Recommends tactics based on NEPQ data:
    - Which verticals to focus on
    - Which pain points to emphasize
    - Which subject lines to use
    - Which projects to prioritize
    - Which contacts to target
- Reverse-engineers from goal to tactics

**Benefits:**
- Clear targets and progress tracking
- Data-driven recommendations (not guesswork)
- NEPQ psychology informs strategy
- Know exactly what to do to hit goals
- Adapt tactics based on what actually works

---

## 📝 **QUICK REFERENCE: KEY TIMELINES**

**The Simple Version:**
- **Day 0**: Email sent (auto)
- **Day 3**: Follow-up sent (auto)
- **Day 7**: Video sent if high-value (auto)
- **Day 21**: Auto-archive if no response (auto)

**Mike's Actions:**
- **Immediate**: Call anyone who opens email
- **Weekly**: Review archive queue (confirm auto-archives)
- **Monthly**: Check analytics

---

## 📋 **DETAILED TIMELINE REFERENCE (For Reference)**

| Action | Timing | Condition |
|--------|--------|-----------|
| Initial Email | Immediately | Project score ≥70, auto-sent |
| Follow-Up #1 | +3 days | No open detected |
| Video Outreach | +7 days | No open + (score ≥85 OR value ≥$5M) |
| Final Email | +14 days | Still no engagement |
| Archive Decision | +21 days | 3+ attempts, zero engagement |
| Auto-Archive | Daily at 10 PM | Meets archive criteria |

---

## 🎯 **METRICS THAT MATTER (KISS - 3 Core Metrics)**

**Daily Check:**
1. **Hot Leads Count** - How many calls to make?

**Weekly Check:**
2. **Open Rate** - Target 35%+ (if below, check subject lines)
3. **Pipeline Value** - Total opportunity in pipeline

**Monthly Deep Dive (Optional):**
- All other metrics (reply rates, click rates, A/B tests, etc.)
- Only review if something seems off

**KISS Rule:** If hot leads > 10/week and open rate > 30%, you're crushing it. Don't overthink metrics.

---

---

## 📚 **QUICK REFERENCE APPENDICES**

### **Vertical Quick Reference (One-Page)**

| Vertical | Pain Points | Products | Subject Line Pattern |
|----------|-------------|----------|---------------------|
| **Hospitality** | Guest satisfaction, Wi-Fi, reviews | Hospitality Bundle | "Quick question about {hotelName} events" |
| **Senior Living** | Safety, telehealth, compliance | Senior Living Bundle | "Quick question about {facilityName}" |
| **Multifamily** | Lease-up, smart home, retention | Multifamily Bundle | "Quick question about {propertyName} move-in day" |
| **Student** | Bandwidth density, gaming | Student/Commercial Bundle | "Quick question about {propertyName} move-in day" |

### **Goal Setting Quick Reference**

**Goal Types:**
- **Revenue**: Target $X over time period
- **Deals Closed**: Target X deals
- **Services Sold**: Target X of specific service (WiFi, Access Control, etc.)
- **Pipeline Value**: Target $X in pipeline
- **Meetings**: Target X meetings booked

**When Behind on Goal:**
1. Click "Get Recommendations" on goal card
2. System analyzes:
   - What's needed to catch up
   - Which projects/contacts to prioritize
   - Which tactics work best (NEPQ data)
3. Follow recommendations

**KISS Rule:** Set goal once. Check progress weekly. Follow recommendations when behind.

### **Status Quick Reference**

- 🟢 **New** → Auto-email sent → **Contacted**
- 🔵 **Contacted** → Email opened? → **Warm** (call now!)
- 🟡 **Warm** → Positive response? → **Qualified**
- ✅ **Qualified** → Meeting → Proposal → **Closed (Won)**
- ❌ **No response after 21 days** → **Archived**

### **What to Ignore (Don't Overthink)**

- ❌ Deep analytics dives (monthly is fine)
- ❌ A/B testing optimization (quarterly is fine)
- ❌ Subject line tweaking (if open rate > 30%, leave it)
- ❌ Element-level tracking (nice-to-have, not essential)
- ❌ Perfect deliverability setup (if it's working, it's fine)

### **One-Page Cheat Sheet**

```
MONDAY MORNING (30 min):
1. Dashboard → Hot Leads count
2. Call all hot leads (use scripts)
3. Review follow-up queue
4. Add any manual leads (if you got referrals/etc.)
5. Done ✅

WEEKLY (15 min, Fridays):
1. Check goal progress (Analytics → Goals)
2. If behind on goal → Click "Get Recommendations"
3. Review archive queue (confirm auto-archives)
4. Done ✅

MONTHLY (30 min, end of month):
1. Set new goals for next month/quarter
2. Deep analytics review
3. Check A/B test results
4. Adjust if needed
5. Done ✅

MANUAL LEAD ENTRY (30 sec, as needed):
1. Projects → "+ Add Project"
2. Name, Type, Location, Source
3. Save → Done ✅
(Optional: Click "Enrich with AI" later)
```

---

*This document should be updated as the system evolves and new features are implemented.*

**Remember: KISS. Focus on calls to hot leads. Everything else is automated or can wait.**

