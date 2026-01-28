# 🎯 ROADMAP TO 100% - Complete Action Plan

**Current Status:** 60%  
**Target:** 100% (Mike can close sales at high ROI)  
**Timeline:** 2-3 days of focused work

---

## 🚨 PHASE 1: CRITICAL FIXES (Must Do First - 8 hours)

### 1. Fix Table Name Mismatch ⚠️ BLOCKER
**Time:** 2 hours  
**Priority:** CRITICAL

**Problem:**
- Dashboard uses `projects` table
- Enrichment uses `high_priority_projects` table
- Scraper saves to `projects` table
- Data is split, enrichment won't work

**Solution:**
1. Choose ONE table: `projects` (recommended - already used by dashboard)
2. Update all queries:
   - `app/api/projects/[id]/enrich/route.ts` → change `high_priority_projects` to `projects`
   - `lib/scrapers/construction-wire.ts` → change `high_priority_projects` to `projects`
   - Any other files using `high_priority_projects`
3. Migrate data from `high_priority_projects` to `projects` (if any exists)
4. Test: Scrape → Enrich → View in dashboard

**Files to Update:**
- `app/api/projects/[id]/enrich/route.ts` (line 129)
- `app/api/projects/[id]/psychology/route.ts` (line 34, 232)
- `lib/scrapers/construction-wire.ts` (lines 233, 243, 256)
- Any other references to `high_priority_projects`

---

### 2. Fix GitHub Actions Scraper ⚠️ BLOCKER
**Time:** 4 hours  
**Priority:** CRITICAL

**Problem:**
- Workflow failing with exit code 100
- Screenshots folder missing
- Script may have runtime errors

**Solution:**
1. **Test scraper locally first:**
   ```bash
   npx tsx scripts/scrape-construction-wire-enhanced.ts --headless --details --max=5
   ```
2. **Fix any errors:**
   - Check Construction Wire login
   - Verify selectors still work
   - Fix any TypeScript errors
   - Test data saving to database
3. **Create screenshots folder:**
   ```bash
   mkdir -p screenshots
   echo "# Screenshots from failed scrapes" > screenshots/README.md
   ```
4. **Verify GitHub Secrets are set:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ORGANIZATION_ID`
   - `CONSTRUCTION_WIRE_USERNAME`
   - `CONSTRUCTION_WIRE_PASSWORD`
5. **Test workflow manually:**
   - Go to GitHub Actions
   - Click "Run workflow" manually
   - Monitor for errors
   - Check logs

**Files to Check:**
- `.github/workflows/scheduled-scrape.yml`
- `scripts/scrape-construction-wire-enhanced.ts`
- Environment variables in GitHub repo settings

---

### 3. Add Environment Variable Validation
**Time:** 1 hour  
**Priority:** HIGH

**Solution:**
1. Create `lib/config/validate-env.ts`:
   ```typescript
   export function validateEnvironment() {
     const required = [
       'NEXT_PUBLIC_SUPABASE_URL',
       'NEXT_PUBLIC_SUPABASE_ANON_KEY',
       'SUPABASE_SERVICE_ROLE_KEY',
       'ORGANIZATION_ID',
     ]
     
     const missing = required.filter(key => !process.env[key])
     
     if (missing.length > 0) {
       throw new Error(`Missing required env vars: ${missing.join(', ')}`)
     }
   }
   ```
2. Call in `app/layout.tsx` or startup
3. Show clear error messages

---

### 4. Add Manual Project Entry UI
**Time:** 2 hours  
**Priority:** HIGH

**Solution:**
1. Add "Add Project" button to Projects page
2. Create modal/form component:
   - Project name (required)
   - Project type (multi-select)
   - Stage (dropdown)
   - Value (number)
   - City, State (required)
   - Units count (optional)
   - Services needed (multi-select)
3. Call `POST /api/projects` to save
4. Show success toast and refresh list

**Files to Create:**
- `components/projects/AddProjectModal.tsx`
- Update `app/(dashboard)/projects/page.tsx`

---

## 🟡 PHASE 2: SALES ENABLEMENT (4 hours)

### 5. Add "What Happens After Payment" Info
**Time:** 1 hour  
**Priority:** HIGH

**Solution:**
1. Create `app/(dashboard)/sales-resources/page.tsx`:
   - Post-contract timeline
   - Installation process
   - What customer needs to prepare
   - Typical project timeline (2-4 weeks)
2. Add link in dashboard sidebar
3. Or add card on dashboard with key info

**Content to Include:**
- **Week 1:** Site survey, equipment ordering
- **Week 2:** Equipment delivery, installation prep
- **Week 3:** Installation begins
- **Week 4:** Testing, go-live, training
- **What customer needs:** Access, space, power requirements

---

### 6. Improve Contact Display & Access
**Time:** 2 hours  
**Priority:** MEDIUM

**Solution:**
1. Ensure contacts are normalized during scraping (already in scraper)
2. Show contacts prominently on project detail page:
   - Add "Contacts" section at top
   - Show email, phone, title
   - Add "Copy Email" button
   - Add "Call" link for phone
3. Add contacts to project list view (optional)

**Files to Update:**
- `app/(dashboard)/projects/[id]/page.tsx` - enhance contact display

---

### 7. Fix Export Functionality
**Time:** 1 hour  
**Priority:** MEDIUM

**Solution:**
1. Test current export button on Projects page
2. Ensure it exports filtered results
3. Add export options:
   - CSV (current)
   - Excel (optional)
   - Print view (optional)

**Files to Check:**
- `app/(dashboard)/projects/page.tsx` - `handleExport` function

---

## 🟢 PHASE 3: WORKFLOW OPTIMIZATION (4 hours)

### 8. Add Quick Actions to Dashboard
**Time:** 1 hour  
**Priority:** MEDIUM

**Solution:**
1. Add prominent action cards:
   - "Enrich Top 10 Projects" (one-click)
   - "Generate Campaign for Hot Leads" (one-click)
   - "View Recent Responses" (quick link)
2. Make workflow faster for Mike

---

### 9. Add Response Tracking
**Time:** 2 hours  
**Priority:** MEDIUM

**Solution:**
1. Track email opens, clicks, replies
2. Show response status on project cards
3. Add "Responses" section to dashboard
4. Alert Mike when someone replies

**Files to Create:**
- `app/(dashboard)/responses/page.tsx`
- Update `outreach_activities` tracking

---

### 10. Add Deal Tracking
**Time:** 1 hour  
**Priority:** MEDIUM

**Solution:**
1. Add "Mark as Won" / "Mark as Lost" buttons to project detail
2. Track:
   - Deal value
   - Services sold
   - Commission amount
   - Close date
3. Show in analytics dashboard

**Database:**
- Already has `actual_revenue`, `closed_at` columns
- Just need UI to update them

---

## 📊 PHASE 4: POLISH & TESTING (2 hours)

### 11. End-to-End Testing
**Time:** 1 hour  
**Priority:** HIGH

**Test Complete Workflow:**
1. ✅ Scraper runs and saves projects
2. ✅ Projects appear in dashboard
3. ✅ Can filter and search projects
4. ✅ Can enrich project with AI
5. ✅ Can generate campaign
6. ✅ Can send emails
7. ✅ Can track responses
8. ✅ Can mark deals as won/lost

---

### 12. Performance Check
**Time:** 1 hour  
**Priority:** MEDIUM

**Check:**
- Page load times (< 2 seconds)
- API response times
- Database query performance
- Mobile responsiveness

---

## ✅ COMPLETION CHECKLIST

### Critical (Must Have):
- [ ] Table name mismatch fixed
- [ ] GitHub scraper working
- [ ] Environment variables validated
- [ ] Manual project entry added
- [ ] Post-payment info added

### High Priority (Should Have):
- [ ] Contact display improved
- [ ] Export functionality working
- [ ] End-to-end testing complete

### Nice to Have:
- [ ] Quick actions on dashboard
- [ ] Response tracking
- [ ] Deal tracking UI
- [ ] Performance optimized

---

## 🎯 SUCCESS CRITERIA

**Mike Can:**
1. ✅ See new leads automatically (scraper working)
2. ✅ Add projects manually if needed
3. ✅ Identify hot leads (scoring works)
4. ✅ Enrich projects with AI (table fixed)
5. ✅ Generate campaigns (already works)
6. ✅ Track responses (needs implementation)
7. ✅ Answer "what happens after payment" (needs content)
8. ✅ Mark deals as won/lost (needs UI)

**When all checked = 100% Ready**

---

## ⏱️ ESTIMATED TIMELINE

**Day 1 (8 hours):**
- Fix table mismatch (2h)
- Fix GitHub scraper (4h)
- Add env validation (1h)
- Add manual entry (1h)

**Day 2 (6 hours):**
- Add post-payment info (1h)
- Improve contacts (2h)
- Fix export (1h)
- Add quick actions (1h)
- Add response tracking (1h)

**Day 3 (2 hours):**
- Add deal tracking (1h)
- End-to-end testing (1h)

**Total: 16 hours = 2-3 days of focused work**

---

## 🚀 CORRECTED BUILD ORDER

**IMPORTANT:** Build in this order, not all at once.

### Phase A: Closing Infrastructure (BUILD FIRST - 12 hours)
**Goal:** Capture every deal that closes, starting TODAY.

1. Meeting tracking UI
2. Post-meeting workflow
3. Proposal tracking
4. Deal closing UI
5. Deals dashboard

**Stop when:** Mike can close a deal and it's captured cleanly.

### Phase B: Light Automation (BUILD AFTER PROOF - 8 hours)
**Only after:** You see consistent replies, meetings, and at least a few closed deals.

6. Auto-enrichment for hot leads (score 80+)
7. Manual campaign creation (Mike approves)

**Stop when:** Revenue flow is proven.

### Phase C: Full Automation (BUILD AFTER SCALE - 19 hours)
**Only after:** Predictable meetings and closed deals.

8. Auto-campaign generation
9. Auto-send with rate limiting
10. SendGrid webhooks
11. Notification system

**See:** `PHASE_A_CLOSING_INFRASTRUCTURE.md` for detailed specs.

