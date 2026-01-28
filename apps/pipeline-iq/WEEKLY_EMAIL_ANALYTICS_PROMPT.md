# Weekly Email Analytics Analysis

## For Claude Chrome Extension

Use this prompt when analyzing last week's email performance to optimize today's Tuesday send.

---

## Analysis Prompt

Copy and paste this into Claude with your analytics data:

```
I'm about to send emails for Groove Technology Solutions (property technology) and need to analyze last week's email performance to optimize today's send.

Here's last week's data:
[PASTE YOUR DATA HERE - from SendGrid dashboard or query results below]

Please analyze and provide:

1. **Performance Summary**
   - Open rate (goal: >25%)
   - Click rate (goal: >3%)
   - Reply rate
   - Bounce/spam rate (concern if >2%)

2. **Best Performing**
   - Which subject lines got highest opens?
   - Which send times performed best?
   - Which verticals (hotel, multifamily, senior living) engaged most?

3. **Recommendations for Today's Send**
   - Optimal send time windows by timezone
   - Subject line patterns to use/avoid
   - Any verticals to prioritize or deprioritize
   - Volume recommendations (more/less aggressive?)

4. **Red Flags**
   - Any deliverability issues?
   - High unsubscribe or spam complaints?
   - Emails that bombed?

5. **A/B Test Ideas**
   - What should we test this week?
```

---

## How to Get Your Data

### Option 1: SendGrid Dashboard
1. Go to https://app.sendgrid.com
2. Navigate to **Stats Overview** or **Email Activity**
3. Set date range to last 7 days
4. Screenshot or copy the stats
5. Paste into Claude

### Option 2: Query Supabase Directly
Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Last 7 days email performance from outreach_activities
SELECT 
    DATE(created_at) as send_date,
    COUNT(*) as emails_sent,
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
    COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked,
    COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied,
    COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced,
    ROUND(COUNT(CASE WHEN status = 'opened' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as open_rate_pct
FROM outreach_activities
WHERE activity_type = 'email'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY send_date DESC;
```

```sql
-- Performance by vertical
SELECT 
    metadata->>'vertical' as vertical,
    COUNT(*) as emails_sent,
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
    ROUND(COUNT(CASE WHEN status = 'opened' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as open_rate_pct
FROM outreach_activities
WHERE activity_type = 'email'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY metadata->>'vertical'
ORDER BY open_rate_pct DESC;
```

```sql
-- Performance by send hour (in recipient's local time)
SELECT 
    (metadata->>'sent_hour_local')::int as local_hour,
    COUNT(*) as emails_sent,
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
    ROUND(COUNT(CASE WHEN status = 'opened' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as open_rate_pct
FROM outreach_activities
WHERE activity_type = 'email'
    AND created_at >= NOW() - INTERVAL '7 days'
    AND metadata->>'sent_hour_local' IS NOT NULL
GROUP BY (metadata->>'sent_hour_local')::int
ORDER BY local_hour;
```

```sql
-- Subject line performance
SELECT 
    subject,
    COUNT(*) as times_sent,
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
    ROUND(COUNT(CASE WHEN status = 'opened' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as open_rate_pct
FROM outreach_activities
WHERE activity_type = 'email'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY subject
HAVING COUNT(*) >= 2
ORDER BY open_rate_pct DESC;
```

### Option 3: Check Queue Status
```sql
-- Outreach queue status summary
SELECT 
    status,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(sent_at) as most_recent_send
FROM outreach_queue
GROUP BY status;
```

---

## Key Metrics to Track

| Metric | Good | Concern | Action |
|--------|------|---------|--------|
| Open Rate | >25% | <15% | Test subject lines |
| Click Rate | >3% | <1% | Improve CTA |
| Bounce Rate | <2% | >5% | Clean list |
| Spam Rate | <0.1% | >0.3% | Review content |
| Reply Rate | >1% | <0.5% | Improve personalization |

---

## Groove Baseline Benchmarks

Based on B2B property technology outreach:
- **Industry avg open rate:** 18-22%
- **Our target:** 25-30% (personalized NEPQ approach)
- **Best send times:** Tue-Thu, 9-11am local
- **Avoid:** Monday morning, Friday afternoon, weekends (except Sunday evening)
