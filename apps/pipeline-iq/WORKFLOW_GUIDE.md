# Complete Workflow Guide for Mike

## Overview
This guide explains the complete workflow from viewing a project to closing a deal, with human-in-the-loop automation to reduce manual work.

---

## 🎯 **Step 1: View Project**

1. **Navigate to Dashboard** (`/projects`)
2. **Click on any project** (e.g., "Fairmont Hotel Houston Downtown")
3. **Review project details:**
   - Project type, location, value, units
   - Contacts available
   - Groove fit score
   - AI insights (if enriched)

---

## ✉️ **Step 2: Send Email (Individual)**

### Option A: Quick Email (Recommended)
1. **Click "Quick Email (Gmail)" button** on project detail page
2. **System generates NEPQ email** using:
   - Vertical intelligence (hotel, multifamily, etc.)
   - Contact's role and psychology
   - Project-specific context
3. **Gmail opens automatically** with:
   - Pre-filled recipient
   - Pre-written subject line
   - Pre-written email body (NEPQ format)
   - Tracking pixel embedded (invisible)
4. **Mike reviews the email** in Gmail
5. **Mike clicks "Send"** in Gmail
6. **Mike clicks "I Sent This Email"** button in the app
   - This marks the email as sent in the system
   - Project status updates to "Contacted"
   - System starts tracking for opens/clicks

### Option B: Bulk Email
1. **Select multiple projects** using checkboxes on dashboard
2. **Click "Bulk Email (Gmail)"** button
3. **System generates emails** for all selected projects
4. **First email opens in Gmail**
5. **After sending, click "Open Next Email"** to continue
6. **Repeat until all emails are sent**

---

## 📊 **Step 3: Track Email Activity**

### Automatic Tracking
- **Tracking pixel** embedded in email (invisible 1x1 image)
- When recipient opens email, pixel loads → system records "opened"
- When recipient clicks link, system records "clicked"
- All tracked in `outreach_activities` table

### View Activated Leads
- **Dashboard shows "Activated Leads" section** (green card)
- Lists all projects where emails were opened
- Shows:
  - Contact name
  - Project name
  - When email was opened
  - Whether they clicked links
  - Pre-generated call script

---

## 📞 **Step 4: Make the Call**

### From Activated Leads Section
1. **Click "Call Now"** button (if phone number available)
2. **Or click "View Project"** to see full details

### From Project Detail Page
1. **Click "Call"** button next to contact
2. **Call modal opens**
3. **Fill in:**
   - **Outcome:** Interested, Not Interested, Callback, Voicemail, No Answer
   - **Notes:** What you discussed
   - **Next Steps:** What happens next
4. **Click "Save Call"**
5. **System records:**
   - Call activity in database
   - Updates project status (if interested → "Qualified")
   - Updates contact's last_contacted date
   - Stores notes for future reference

### Call Script
- **Pre-generated** based on:
  - Contact name
  - Project name
  - Email that was opened
- **Shown in Activated Leads section**
- **Also available on project detail page**

---

## 📝 **Step 5: Take Notes & Track Progress**

### Notes Storage
- **Call notes** stored in `outreach_activities` table
- **Project notes** stored in `projects.notes` field
- **Contact metadata** stored in `contacts` table

### Status Updates
- **New** → Just scraped, not contacted
- **Contacted** → Email sent or call made
- **Qualified** → They showed interest
- **Archived** → Not pursuing

### Bulk Status Updates
1. **Select multiple projects** using checkboxes
2. **Click status button:**
   - "Mark as Contacted"
   - "Mark as Qualified"
   - "Archive"
3. **All selected projects update at once**

---

## 🔄 **Complete Workflow Example**

### Scenario: 10 New Projects

1. **Mike views dashboard** → Sees 10 new projects
2. **Selects all 10** using checkboxes
3. **Clicks "Bulk Email (Gmail)"**
4. **System generates 10 personalized NEPQ emails**
5. **Mike reviews and sends each one** (one at a time)
6. **Clicks "I Sent This Email"** after each send
7. **System tracks all emails** with tracking pixels
8. **3 days later:**
   - 5 emails were opened
   - Dashboard shows "Activated Leads" section with 5 projects
9. **Mike clicks "Call Now"** on first activated lead
10. **Makes call, records outcome and notes**
11. **System updates project status** automatically
12. **Mike repeats for remaining 4 activated leads**

---

## 🎯 **Key Features**

### Human in the Loop
- ✅ Mike reviews every email before sending
- ✅ Mike makes every call personally
- ✅ Mike decides outcomes and next steps
- ✅ System never sends emails automatically

### Automation That Helps
- ✅ Generates personalized NEPQ emails
- ✅ Tracks email opens/clicks automatically
- ✅ Surfaces activated leads prominently
- ✅ Generates call scripts
- ✅ Records activities and updates status
- ✅ Stores notes for future reference

### Speed & Efficiency
- ✅ Bulk email generation (10 emails in seconds)
- ✅ Gmail compose links (no copy/paste)
- ✅ One-click call tracking
- ✅ Pre-filled call scripts
- ✅ Automatic status updates

---

## 📋 **API Endpoints**

- `GET /api/projects/[id]/quick-email` - Generate email for single project
- `POST /api/outreach-activities/[trackingId]/mark-sent` - Mark email as sent
- `GET /api/email/track?tracking_id=xxx&event=open` - Email tracking pixel
- `GET /api/activated-leads` - Get all opened emails
- `POST /api/projects/[id]/call` - Record call with notes

---

## 🔧 **Configuration**

### Environment Variables Needed
- `NEXT_PUBLIC_APP_URL` - Your app URL (for tracking pixel)
- `GMAIL_USER` - Mike's Gmail address
- `ORGANIZATION_ID` - Your organization ID

### Gmail Setup
- No special setup needed
- Uses Gmail's compose URL format
- Opens in new tab
- Mike sends from his own Gmail account (not spam)

---

## 💡 **Tips**

1. **Review emails before sending** - NEPQ emails are personalized but you should verify
2. **Call within 24 hours** of email open for best results
3. **Take detailed notes** - They help with future projects
4. **Use bulk actions** for efficiency when processing many projects
5. **Check Activated Leads daily** - These are your hottest prospects

---

## 🚀 **Future Enhancements**

- Email scheduling (send later)
- Automated follow-up sequences
- CRM integration
- Calendar integration for call scheduling
- Video message generation
- LinkedIn outreach

