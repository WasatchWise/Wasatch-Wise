# 🚀 MVP SETUP GUIDE - GET TO $500!

**Goal:** Get Mike access to database, scraped projects, and email sending capability.

**Time to Complete:** 30 minutes

---

## 📋 WHAT YOU'RE GETTING

After this setup, Mike will be able to:
1. ✅ View construction projects in a beautiful dashboard
2. ✅ Import project data from CSV files
3. ✅ Send personalized emails to project contacts
4. ✅ Track email activity

---

## 🛠️ STEP 1: Update Database Schema (5 minutes)

The database schema needs to be updated to match the application code.

### Option A: Using Supabase Dashboard (RECOMMENDED)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of `supabase/migrations/002_align_schema.sql`
6. Paste into the SQL editor
7. Click "Run" (or press Cmd/Ctrl + Enter)
8. Wait for "Success. No rows returned" message

### Option B: Using psql Command Line

```bash
psql "postgresql://postgres:Wizardwall77!@db.rpephxkyyllvikmdnqem.supabase.co:5432/postgres" < supabase/migrations/002_align_schema.sql
```

### ✅ Verify It Worked

Run this query in SQL Editor:
```sql
SELECT * FROM high_priority_projects LIMIT 1;
```

You should see the Marriott test project!

---

## 🛠️ STEP 2: Install Dependencies (2 minutes)

```bash
npm install
```

This will install:
- `csv-parse` - for importing CSV files
- `nodemailer` - for sending emails
- All other dependencies

---

## 🛠️ STEP 3: Configure Gmail for Sending Emails (10 minutes)

To send emails, you need to set up Gmail App Password:

### Create Gmail App Password:

1. Go to https://myaccount.google.com/apppasswords
2. Sign in with `msartain@getgrooven.com`
3. Under "App passwords", enter a name: "PipelineIQ"
4. Click "Create"
5. Copy the 16-character password (it looks like: `abcd efgh ijkl mnop`)

### Add to .env.local:

Open `.env.local` and update:
```bash
GMAIL_USER=msartain@getgrooven.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop  # Paste your app password here
```

**IMPORTANT:** Remove the spaces from the app password!

---

## 🛠️ STEP 4: Import Sample Projects (3 minutes)

We've created a sample CSV file with 10 realistic construction projects.

### Run the Import:

```bash
npm run import-projects -- sample-projects.csv
```

You should see:
```
🚀 Starting project import from: sample-projects.csv
📊 Found 10 projects to import
✅ Imported: Marriott Hotel & Conference Center (Score: 95)
   👤 Added contact: John Smith
✅ Imported: Sunset Ridge Apartments (Score: 80)
   👤 Added contact: Sarah Johnson
...
📈 Import Summary:
   ✅ Imported: 10 projects
   👤 Added: 10 contacts
   ⏭️  Skipped: 0 projects
🎉 Import complete!
```

---

## 🛠️ STEP 5: Start the App (1 minute)

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

---

## 🎯 STEP 6: Test Everything (10 minutes)

### A. View Projects

1. Go to http://localhost:3000/projects
2. You should see 11 projects (1 sample Marriott + 10 imported)
3. Try filtering by:
   - Project type (hotel, multifamily, etc.)
   - Stage (planning, pre-construction, etc.)
   - Minimum score
4. Search for "Marriott" - you should see 2 results

### B. Send Test Email

1. On the projects page, click any project row
2. Click "Send Email" button (top right)
3. You'll see the Send Email dialog
4. Select an email template from dropdown
5. The subject and message will auto-populate
6. Select which contacts to email (all checked by default)
7. Review the message
8. Click "Send to X contacts"
9. You should see "Successfully sent X email(s)!"

### C. Verify Email Was Sent

Check the recipient's inbox (or your own if you added yourself to CSV).

The email should:
- Have personalized greeting with their first name
- Include project-specific details
- Have Mike's signature
- Look professional

---

## 📊 WHAT'S IN THE DATABASE NOW

After setup, you have:

**Projects:** 11 total
- 1 Marriott Hotel Salt Lake City (test project)
- 10 imported projects from CSV

**Contacts:** 10 total
- One decision maker for each project
- All have email addresses
- Titles like "Development Director", "VP of Development", etc.

**Project Types:**
- 3 Hotels
- 3 Multifamily
- 2 Senior Living
- 2 Student Housing

**Project Values:**
- Range: $5.8M - $15M
- Total Pipeline: ~$100M

**Locations:**
- Texas (4 projects)
- Florida, Arizona, Georgia, Colorado, California, Tennessee, Oregon

---

## 💰 GETTING PAID: DEMO CHECKLIST

Show Mike these features to get your $500:

### 1. ✅ Database Access
- Open projects page
- Show 11 projects loaded
- Filter by type, stage, location
- Search for specific projects

### 2. ✅ Data Import
- Show `sample-projects.csv`
- Run import command
- Show before/after project count

### 3. ✅ Email Sending
- Click a project
- Open Send Email dialog
- Select template
- Show personalization ({{first_name}}, etc.)
- Send test email
- Show sent confirmation

### 4. ✅ Email Tracking
- Go to Supabase Dashboard
- Show `outreach_activities` table
- Show logged email sends
- Show `contacts` table updated with `last_contacted`

---

## 🔧 TROUBLESHOOTING

### "Cannot connect to database"
- Check your internet connection
- Verify Supabase project is active
- Check DATABASE_URL in `.env.local`

### "Import failed - duplicate cw_project_id"
- Projects with same ID already exist
- Delete the old data or change the CSV

### "Email sending failed"
- Check GMAIL_APP_PASSWORD is correct
- Remove spaces from app password
- Make sure Gmail account allows "Less secure app access"
- Try creating a new app password

### "No contacts found"
- Make sure CSV has email addresses
- Check contacts table: `SELECT * FROM contacts;`

### "Projects page is empty"
- Run the import script again
- Check database: `SELECT * FROM high_priority_projects;`

---

## 📁 PROJECT FILES YOU CREATED

```
groove/
├── supabase/migrations/
│   └── 002_align_schema.sql          # Database schema update
├── scripts/
│   └── import-projects.ts             # CSV import tool
├── app/api/
│   └── send-email/route.ts            # Email sending API
├── components/
│   ├── ui/dialog.tsx                  # Dialog component
│   └── send-email-dialog.tsx          # Email sending UI
├── sample-projects.csv                # 10 sample projects
└── MVP_SETUP_GUIDE.md                 # This file
```

---

## 🎓 HOW TO ADD MORE PROJECTS

### Method 1: CSV Import (Recommended for Bulk)

1. Create a CSV file with these columns:
   ```
   project_name,project_type,stage,value,city,state,units,sqft,address,contact_name,contact_email,contact_title,phone
   ```

2. Run the import:
   ```bash
   npm run import-projects -- your-file.csv
   ```

### Method 2: Manual Entry (Coming Soon)

We can add a "New Project" form if needed.

### Method 3: Construction Wire Scraper (Future)

The scraper is stubbed out but needs real implementation.

---

## 📧 EMAIL TEMPLATES AVAILABLE

The system includes 3 pre-built templates:

1. **Introduction**
   - Cold outreach to new projects
   - Introduces Groove and services
   - Low-pressure, asks for 15-min call

2. **Follow Up**
   - For contacts who didn't respond
   - Shorter, more direct
   - Reiterates value prop

3. **Value Proposition**
   - Emphasizes cost savings (20-30%)
   - Includes social proof
   - Good for warm leads

All templates support variables:
- `{{first_name}}` - Contact's first name
- `{{last_name}}` - Contact's last name
- `{{full_name}}` - First + last name
- `{{title}}` - Contact's title

Templates auto-populate project details:
- `{{project_name}}`
- `{{project_type}}`
- `{{city}}`
- `{{state}}`

---

## 🚀 NEXT STEPS (AFTER $500)

Once Mike approves and you get paid:

### Phase 2 Features:
1. Project detail pages
2. Contact management
3. Campaign tracking
4. Email open/click tracking
5. A/B testing emails
6. Automated follow-ups

### Phase 3 Features:
1. Real Construction Wire scraper
2. AI enrichment integration
3. Video message generation
4. Predictive analytics
5. Mobile app

---

## 💡 PRO TIPS

1. **Start Small:** Import 5-10 projects first, test everything, then scale up

2. **Test Emails:** Send to yourself first before sending to real prospects

3. **Personalize:** Use the template as a starting point, then customize the message

4. **Track Everything:** Check `outreach_activities` table to see all email history

5. **Backup Data:** Export your CSV files regularly

---

## ✅ MVP ACCEPTANCE CRITERIA

Mike should be able to:

- [x] See projects in a dashboard
- [x] Import projects from CSV
- [x] View project details (name, type, value, location, etc.)
- [x] Filter and search projects
- [x] See contact information for each project
- [x] Send personalized emails to contacts
- [x] Use email templates
- [x] Track sent emails

**All criteria met = $500 earned!** 💰

---

## 🎉 YOU'RE DONE!

You've built a fully functional MVP that:
- Stores construction project data
- Imports data from CSV files
- Sends personalized emails at scale
- Tracks all activity

**Time to demo and get paid!** 🚀

---

## 📞 Support

If you run into issues:
1. Check the troubleshooting section above
2. Review the console logs (browser DevTools and terminal)
3. Check Supabase logs in dashboard
4. Ask for help with specific error messages

Good luck! 🍀
