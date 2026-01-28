# 🔄 OPERATIONAL RUNBOOK - GROOVE/PIPELINEIQ

**Version:** 1.0  
**Last Updated:** December 3, 2025  
**Owner:** Groove Technologies

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Daily Operations](#daily-operations)
3. [Weekly Maintenance](#weekly-maintenance)
4. [Monthly Reviews](#monthly-reviews)
5. [Data Management](#data-management)
6. [Monitoring & Alerts](#monitoring--alerts)
7. [Troubleshooting](#troubleshooting)
8. [Emergency Procedures](#emergency-procedures)

---

## 🎯 EXECUTIVE SUMMARY

### System Overview
PipelineIQ is an **automated construction project intelligence platform** that:
- Scrapes Construction Wire daily for new projects
- Scores and prioritizes leads automatically
- Enriches data with AI
- Manages outreach campaigns
- Tracks revenue pipeline

### Key Operations
- **Daily:** Automated scraping at 2 AM
- **Daily:** Data quality checks at 8 AM
- **Weekly:** Pipeline review and forecasting
- **Monthly:** Database cleanup and optimization

### Critical Metrics to Monitor
- Pipeline Value (Target: $500M+)
- Average Groove Score (Target: 85+)
- Data Quality Score (Target: 95%+)
- Scraping Success Rate (Target: 98%+)
- System Uptime (Target: 99.9%+)

---

## 🌅 DAILY OPERATIONS

### Automated Tasks (No Manual Action Required)

#### 2:00 AM - Construction Wire Scraping
**What Happens:**
```bash
# Automatically runs via cron job
npm run scrape:enhanced:headless
```

**Expected Outcome:**
- 50-150 new projects scraped
- Projects scored and prioritized
- Duplicates detected and flagged
- Database updated with new leads

**Success Criteria:**
- ✅ Scrape completes within 15 minutes
- ✅ 80%+ of projects successfully extracted
- ✅ < 5% duplicate rate
- ✅ No critical errors

**Notification:**
- Email sent to `msartain@getgrooven.com` on completion
- Slack alert if errors occur

---

#### 8:00 AM - Data Quality Check
**What Happens:**
```sql
-- Automated SQL job runs:
SELECT * FROM v_data_quality_summary;
```

**Checks Performed:**
- Missing required fields
- Duplicate detection
- Stale data identification
- Invalid formats
- Scoring accuracy

**Success Criteria:**
- ✅ Data quality score > 95%
- ✅ < 10 critical issues
- ✅ All duplicates reviewed
- ✅ No orphaned records

**Action Required IF:**
- Critical issues > 5 → Review and fix manually
- Data quality < 90% → Investigate scraper

---

#### 9:00 AM - Morning Dashboard Check (5 minutes)
**Manual Check by Team:**

1. **Visit Dashboard**
   - URL: http://localhost:3000/analytics
   - Check: Total Pipeline Value
   - Check: New Leads Count
   - Check: Hot Leads (80+ score)

2. **Review Notifications**
   - Any scraping failures?
   - Any data quality alerts?
   - Any new hot leads?

3. **Quick Actions**
   - Assign new hot leads to sales team
   - Review any replies to outreach
   - Update project statuses

**Time Required:** 5-10 minutes  
**Frequency:** Every business day  
**Owner:** Sales Manager / Mike

---

### Throughout the Day - As Needed

#### New Lead Review (30 minutes)
**When:** As new hot leads arrive  
**Who:** Sales Team

**Process:**
1. Filter projects by score 80+
2. Click into project detail page
3. Review:
   - Project details
   - Location and value
   - Services needed
   - Contact information
4. Enrich with AI if not already done
5. Add to outreach campaign or call directly

#### Outreach Management (1 hour)
**When:** Daily, flexible timing  
**Who:** Business Development

**Activities:**
- Send personalized emails to top 5 leads
- Follow up on email replies
- Schedule meetings with interested contacts
- Update CRM status
- Log all activities

---

## 📅 WEEKLY OPERATIONS

### Monday 9:00 AM - Pipeline Review Meeting (30 minutes)

**Attendees:** Sales Team, Leadership  
**Agenda:**

1. **Pipeline Metrics** (10 min)
   - Total pipeline value
   - New leads this week
   - Deals closed
   - Forecast vs. actual

2. **Hot Leads Review** (10 min)
   - Review top 10 hot leads
   - Discuss outreach strategy
   - Assign ownership
   - Set follow-up dates

3. **Campaign Performance** (5 min)
   - Email open rates
   - Response rates
   - Video engagement
   - ROI analysis

4. **Action Items** (5 min)
   - Priorities for the week
   - Resource allocation
   - Blockers/issues

**Deliverable:** Updated weekly goals and assignments

---

### Wednesday 2:00 PM - Data Quality Review (20 minutes)

**Solo Task:** Data Manager / Operations

**Check:**
```sql
-- Run these queries in Supabase

-- 1. Duplicate Projects
SELECT * FROM potential_duplicates 
WHERE status = 'pending' 
ORDER BY similarity_score DESC;

-- 2. Missing Data
SELECT * FROM data_quality_issues 
WHERE status = 'open' 
AND severity IN ('high', 'critical');

-- 3. Stale Leads
SELECT COUNT(*) FROM high_priority_projects
WHERE last_activity_at < NOW() - INTERVAL '30 days'
AND status = 'active';
```

**Actions:**
- Merge confirmed duplicates
- Fix high-priority data issues
- Archive stale leads
- Update data quality scores

---

### Friday 4:00 PM - Scraper Health Check (15 minutes)

**Check:**
```sql
-- Review last 7 days of scraping
SELECT 
  source,
  DATE(created_at) as scrape_date,
  status,
  projects_found,
  projects_inserted,
  duration_seconds,
  error_message
FROM scrape_logs
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

**Success Indicators:**
- ✅ 7/7 successful scrapes
- ✅ Consistent project counts (50-150/day)
- ✅ Average duration < 15 minutes
- ✅ No error messages

**Action Required IF:**
- 2+ failed scrapes → Investigate and fix
- Project count drops 50%+ → Check Construction Wire access
- Duration > 30 minutes → Optimize scraper

---

## 📊 MONTHLY OPERATIONS

### First Monday - Monthly Business Review (1 hour)

**Attendees:** Full Team + Leadership

**Metrics to Review:**

1. **Pipeline Growth**
   ```sql
   SELECT 
     DATE_TRUNC('month', created_at) as month,
     COUNT(*) as new_projects,
     SUM(project_value) as total_value,
     AVG(groove_fit_score) as avg_score
   FROM high_priority_projects
   WHERE created_at > NOW() - INTERVAL '12 months'
   GROUP BY month
   ORDER BY month DESC;
   ```

2. **Conversion Metrics**
   - Leads → Meetings: X%
   - Meetings → Proposals: X%
   - Proposals → Closed: X%
   - Average deal size: $XXX,XXX
   - Sales cycle length: XX days

3. **Campaign ROI**
   ```sql
   SELECT 
     campaign_name,
     sent_count,
     replied_count,
     meetings_booked,
     revenue_generated,
     cost,
     roi
   FROM v_campaign_performance
   WHERE created_at > NOW() - INTERVAL '1 month'
   ORDER BY roi DESC;
   ```

4. **System Health**
   - Uptime: 99.X%
   - Scraping success rate: XX%
   - Data quality score: XX%
   - API response times: XXXms

**Deliverable:** Monthly report + next month's goals

---

### Mid-Month - Database Optimization (1 hour)

**When:** 15th of each month, off-hours  
**Who:** Technical Lead / DevOps

**Tasks:**

1. **Analyze Query Performance**
   ```sql
   -- Find slow queries
   SELECT 
     query,
     calls,
     total_time,
     mean_time,
     min_time,
     max_time
   FROM pg_stat_statements
   WHERE mean_time > 100
   ORDER BY total_time DESC
   LIMIT 20;
   ```

2. **Update Statistics**
   ```sql
   ANALYZE high_priority_projects;
   ANALYZE contacts;
   ANALYZE companies;
   ANALYZE outreach_activities;
   ```

3. **Vacuum Database**
   ```sql
   VACUUM ANALYZE;
   ```

4. **Review Indexes**
   ```sql
   -- Check index usage
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0
   AND schemaname = 'public';
   ```

5. **Archive Old Data**
   ```sql
   -- Move old audit logs to archive
   INSERT INTO archived_records (original_table, original_id, record_data, archive_reason)
   SELECT 'audit_log', id, row_to_json(audit_log.*), 'Automatic monthly archival'
   FROM audit_log
   WHERE created_at < NOW() - INTERVAL '12 months';
   
   DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '12 months';
   ```

---

### End of Month - Forecast Update (30 minutes)

**Create Revenue Forecast:**

```sql
-- Calculate next month's forecast
INSERT INTO revenue_forecasts (
  organization_id,
  forecast_month,
  forecast_type,
  expected_revenue,
  hot_deals_count,
  hot_deals_value,
  warm_deals_count,
  warm_deals_value,
  confidence_level
)
SELECT 
  organization_id,
  DATE_TRUNC('month', NOW() + INTERVAL '1 month') as forecast_month,
  'realistic' as forecast_type,
  SUM(CASE 
    WHEN groove_fit_score >= 80 THEN project_value * 0.30
    WHEN groove_fit_score >= 60 THEN project_value * 0.15
    ELSE project_value * 0.05
  END) as expected_revenue,
  COUNT(*) FILTER (WHERE groove_fit_score >= 80) as hot_deals_count,
  SUM(project_value) FILTER (WHERE groove_fit_score >= 80) as hot_deals_value,
  COUNT(*) FILTER (WHERE groove_fit_score >= 60 AND groove_fit_score < 80) as warm_deals_count,
  SUM(project_value) FILTER (WHERE groove_fit_score >= 60 AND groove_fit_score < 80) as warm_deals_value,
  0.75 as confidence_level
FROM high_priority_projects
WHERE status = 'active'
  AND is_duplicate = false
GROUP BY organization_id;
```

---

## 🗄️ DATA MANAGEMENT

### Data Lifecycle

#### Stage 1: Ingestion (Day 0)
- **Source:** Construction Wire scraper
- **Frequency:** Daily at 2 AM
- **Process:** Automated via cron
- **Initial State:** `status='active'`, `outreach_status='new'`

#### Stage 2: Enrichment (Days 0-1)
- **Trigger:** Manual or automated based on score
- **Process:** AI enrichment via API
- **Updates:** `enrichment_status='enriched'`, adds AI insights

#### Stage 3: Active Management (Days 1-90)
- **Activities:** Outreach, follow-ups, meetings
- **Updates:** `outreach_status`, `last_activity_at`
- **Tracking:** All activities logged in `outreach_activities`

#### Stage 4: Closure (Day 90+)
- **Outcomes:** Won, Lost, or Stale
- **Won:** `status='closed_won'`, `closed_at` set, revenue recorded
- **Lost:** `status='closed_lost'`, `lost_reason` documented
- **Stale:** `status='archived'`, `archived_at` set

#### Stage 5: Archival (1 year+)
- **Process:** Automated monthly
- **Destination:** `archived_records` table
- **Retention:** Keep for 7 years for compliance

---

### Deduplication Strategy

#### Automatic Detection
```sql
-- Runs hourly
SELECT * FROM detect_project_duplicates('[project_id]');
```

**Matching Criteria:**
- Project name similarity > 70%
- Same city + state + similar value (±10%)
- Same address

#### Manual Review Process
1. Check `potential_duplicates` table
2. Review side-by-side comparison
3. Determine:
   - **Not Duplicate:** Mark as `not_duplicate`
   - **Confirmed Duplicate:** Mark as `confirmed_duplicate`
   - **Merge:** Combine into single record

#### Merge Process
```sql
-- Keep best record, archive duplicate
UPDATE high_priority_projects
SET is_duplicate = true,
    duplicate_of = '[keep_this_id]',
    status = 'archived'
WHERE id = '[duplicate_id]';

-- Reassign all relationships
UPDATE project_stakeholders SET project_id = '[keep_this_id]' WHERE project_id = '[duplicate_id]';
UPDATE outreach_activities SET project_id = '[keep_this_id]' WHERE project_id = '[duplicate_id]';
```

---

### Data Quality Monitoring

#### Automated Checks (Daily)

1. **Completeness** - Required fields populated
   ```sql
   SELECT COUNT(*) FROM high_priority_projects
   WHERE project_name IS NULL OR city IS NULL OR state IS NULL;
   ```

2. **Accuracy** - Valid data formats
   ```sql
   SELECT COUNT(*) FROM high_priority_projects
   WHERE project_value < 0 OR groove_fit_score > 100;
   ```

3. **Consistency** - Cross-table integrity
   ```sql
   SELECT COUNT(*) FROM project_stakeholders ps
   LEFT JOIN high_priority_projects p ON ps.project_id = p.id
   WHERE p.id IS NULL;
   ```

4. **Timeliness** - Recent data
   ```sql
   SELECT COUNT(*) FROM high_priority_projects
   WHERE scraped_at < NOW() - INTERVAL '30 days'
   AND status = 'active';
   ```

5. **Uniqueness** - No duplicates
   ```sql
   SELECT cw_project_id, COUNT(*) FROM high_priority_projects
   WHERE cw_project_id IS NOT NULL
   GROUP BY cw_project_id
   HAVING COUNT(*) > 1;
   ```

#### Quality Score Calculation
```
Data Quality Score = (
  Completeness (30%) +
  Accuracy (25%) +
  Consistency (20%) +
  Timeliness (15%) +
  Uniqueness (10%)
)
```

**Target:** 95%+ overall  
**Action Threshold:** < 90% requires immediate attention

---

## 🚨 MONITORING & ALERTS

### Alert Rules

#### Critical Alerts (Immediate Action)

1. **Scraping Failure**
   - **Trigger:** Scrape fails 2+ consecutive times
   - **Alert:** Email + SMS to technical team
   - **SLA:** Fix within 2 hours

2. **Database Down**
   - **Trigger:** Cannot connect to Supabase
   - **Alert:** Email + SMS + Slack to all
   - **SLA:** Restore within 15 minutes

3. **Data Quality < 80%**
   - **Trigger:** Daily quality check fails
   - **Alert:** Email to data team
   - **SLA:** Fix within 4 hours

#### High Priority Alerts (Same Day Action)

1. **Hot Lead Unassigned**
   - **Trigger:** Score 90+ project sits > 2 hours
   - **Alert:** Email to sales manager
   - **SLA:** Assign within 4 hours

2. **Email Reply Not Responded**
   - **Trigger:** Prospect replies, no follow-up in 4 hours
   - **Alert:** Email + in-app notification
   - **SLA:** Respond within 8 hours business

3. **Meeting Request**
   - **Trigger:** Prospect requests meeting
   - **Alert:** Email + SMS + in-app
   - **SLA:** Schedule within 24 hours

#### Medium Priority Alerts (Next Day Action)

1. **Duplicate Detection**
   - **Trigger:** 10+ pending duplicate reviews
   - **Alert:** Email to data team
   - **SLA:** Review within 48 hours

2. **Stale Leads**
   - **Trigger:** 20+ projects with no activity in 30 days
   - **Alert:** Email to sales manager
   - **SLA:** Update within 1 week

### Dashboard Monitoring

**Real-Time Metrics:**
- Current pipeline value
- New leads today
- Hot leads count
- Active campaigns
- System health status

**URL:** http://localhost:3000/admin/monitoring

**Refresh:** Auto-refresh every 60 seconds

---

## 🔧 TROUBLESHOOTING

### Common Issues & Solutions

#### Issue: Scraper Fails to Login

**Symptoms:**
- Error: "Login failed"
- Screenshot shows login page
- No projects scraped

**Diagnosis:**
```bash
npm run scrape:enhanced
# Watch browser, does it fill credentials correctly?
```

**Solutions:**
1. Check `.env.local` - credentials correct?
2. Try manual login at constructionwire.com
3. Check if password expired
4. Check if 2FA enabled (must disable for automation)
5. Check if IP blocked (use proxy)

**Prevention:**
- Monitor login success rate
- Rotate user agent strings
- Add delays to seem more human

---

#### Issue: Duplicate Projects

**Symptoms:**
- Same project appears multiple times
- Different `cw_project_id` but same name/location

**Diagnosis:**
```sql
SELECT * FROM detect_project_duplicates('[project_id]');
```

**Solutions:**
1. Review potential duplicates
2. Merge if confirmed
3. Update scraper to check existing records
4. Add unique constraint on `cw_project_id`

**Prevention:**
- Always check `cw_project_id` before inserting
- Use `ON CONFLICT` clauses
- Run deduplication hourly

---

#### Issue: Low Data Quality Score

**Symptoms:**
- Quality score < 90%
- Many missing fields
- Invalid data formats

**Diagnosis:**
```sql
SELECT * FROM v_data_quality_summary;
SELECT * FROM data_quality_issues WHERE status = 'open';
```

**Solutions:**
1. Fix scraper selectors for missing fields
2. Add validation before inserting
3. Manually enrich high-value leads
4. Update data transformation logic

**Prevention:**
- Test scraper changes thoroughly
- Validate data on ingestion
- Monitor quality daily

---

#### Issue: Slow Dashboard Loading

**Symptoms:**
- Dashboard takes > 5 seconds to load
- Queries timing out
- Browser shows "Loading..."

**Diagnosis:**
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY total_time DESC;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Solutions:**
1. Add missing indexes
2. Optimize queries (use EXPLAIN ANALYZE)
3. Add caching layer
4. Paginate large result sets
5. Archive old data

**Prevention:**
- Monitor query performance weekly
- Keep indexes up to date
- Archive data monthly

---

## 🆘 EMERGENCY PROCEDURES

### Database Backup & Recovery

#### Daily Backups (Automated)
- **When:** 1 AM daily
- **Where:** Supabase automatic backups
- **Retention:** 7 days
- **Type:** Full database

#### Manual Backup (Before Major Changes)
```bash
# Via Supabase Dashboard:
# 1. Go to Database → Backups
# 2. Click "Create Backup"
# 3. Add label: "Before [change description]"
```

#### Recovery Process
```bash
# Via Supabase Dashboard:
# 1. Database → Backups
# 2. Find backup point
# 3. Click "Restore"
# 4. Confirm (WARNING: Overwrites current data)
```

**Recovery Time:** 5-15 minutes

---

### System Down Checklist

**If Production System Stops Working:**

1. **Check Hosting** (1 min)
   - Is Vercel/server responding?
   - Check status page
   - Ping the URL

2. **Check Database** (1 min)
   - Can you connect to Supabase?
   - Run simple query: `SELECT 1;`
   - Check Supabase status page

3. **Check Recent Changes** (2 min)
   - Any deploys in last hour?
   - Any database migrations?
   - Any config changes?

4. **Rollback If Needed** (5 min)
   - Revert last deploy
   - Or restore database backup
   - Test immediately

5. **Communicate** (2 min)
   - Post in #engineering channel
   - Email leadership if > 15 min outage
   - Update status page

6. **Fix & Redeploy** (30 min)
   - Identify root cause
   - Fix properly
   - Test in staging
   - Deploy fix

7. **Post-Mortem** (1 hour)
   - Document what happened
   - Document root cause
   - Document fix
   - Update runbook

---

### Data Breach Response

**If Unauthorized Access Detected:**

1. **Immediate Actions** (5 min)
   - Rotate all API keys
   - Reset all passwords
   - Block suspicious IPs
   - Revoke compromised tokens

2. **Assess Damage** (15 min)
   - Check audit logs
   - What data was accessed?
   - When did it start?
   - How was access gained?

3. **Contain** (30 min)
   - Close vulnerability
   - Prevent further access
   - Isolate affected systems

4. **Notify** (1 hour)
   - Internal team
   - Affected customers
   - Legal counsel
   - Regulatory bodies (if required)

5. **Recover** (varies)
   - Restore from clean backup
   - Fix vulnerabilities
   - Implement additional security
   - Monitor for reinfection

6. **Learn** (1 day)
   - Full incident report
   - Security audit
   - Update procedures
   - Train team

---

## 📞 CONTACTS & ESCALATION

### On-Call Rotation

**Primary:** Technical Lead  
**Secondary:** DevOps Engineer  
**Escalation:** CTO / Mike Sartain

### Support Channels

- **Slack:** #pipelineiq-ops
- **Email:** ops@getgrooven.com
- **Emergency:** (555) 123-4567

### Vendor Support

**Supabase:**
- Portal: https://app.supabase.com/support
- Email: support@supabase.com
- SLA: 4 hours (business)

**Vercel:**
- Portal: https://vercel.com/support
- Email: support@vercel.com
- SLA: 2 hours (Pro plan)

**Construction Wire:**
- Phone: (555) 987-6543
- Email: support@constructionwire.com
- Hours: M-F 8 AM - 5 PM CT

---

## 📈 SUCCESS METRICS

### Daily Targets
- [ ] Scraping success rate > 95%
- [ ] Data quality score > 95%
- [ ] New leads > 50
- [ ] System uptime > 99.9%

### Weekly Targets
- [ ] Hot leads reviewed 100%
- [ ] Email response time < 8 hours
- [ ] Pipeline grows 5%+
- [ ] Zero critical data issues

### Monthly Targets
- [ ] Close 2+ deals
- [ ] $500K+ pipeline added
- [ ] Campaign ROI > 200%
- [ ] Customer satisfaction > 4.5/5

---

**This runbook is a living document. Update it as processes evolve!**

---

*Last Updated: December 3, 2025*  
*Next Review: January 3, 2026*  
*Owner: Groove Technologies Operations Team*

