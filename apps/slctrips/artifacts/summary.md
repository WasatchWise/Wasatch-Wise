# SLCTrips Infrastructure Audit Report
**Date:** October 28, 2025
**Site:** https://www.slctrips.com
**Auditor:** Senior SRE/DevOps Engineer
**Mode:** Read-only, Zero-disruption

---

## Executive Snapshot

### 🔴 RED (Critical Issues)
1. **LCP 14.13 seconds** - Core Web Vitals catastrophic failure (target: <2.5s)
2. **Database credentials exposed** in git-tracked markdown files
3. **Database DNS failure** - cannot connect to db.mkepcjzqnbowrgbvjfem.supabase.co
4. **API keys exposed** in repository (Google Places, ElevenLabs, HeyGen)

### 🟡 YELLOW (High Priority)
1. **Missing security headers** - No CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
2. **No Cloudflare WAF** - Site served directly by Vercel, no additional DDoS/bot protection
3. **RLS policies not verified** - Cannot audit row-level security without DB access
4. **404 errors** on /staykit and /about routes

### 🟢 GREEN (Acceptable)
1. **HSTS enabled** - 2-year max-age
2. **Vercel cache working** - Consistent HIT responses
3. **Supabase REST API accessible** - 338 tables exposed via API
4. **SEO fundamentals** - Lighthouse SEO score 100/100
5. **TBT and CLS excellent** - 3ms TBT, 0 CLS

---

## Top 5 Risks with Fixes

### 1. 🔴 CRITICAL: Database Credentials Exposed in Git
**Impact:** 5/5 | **Effort:** 2/5 | **Priority Score:** 14

**Problem:**
Production database password `5w55dmaWp!CJGvn` and Supabase service role keys committed to:
- `DEPLOYMENT_MISSION_BRIEF.md`
- `VERCEL_ENV_VARS.md`
- `slctrips-v2/.mcp.json`
- Multiple other markdown documentation files

**Why It Matters:**
Anyone with repository access (or if repo becomes public) has full database admin access. Can read/write/delete all data, bypass RLS, access auth.users table.

**Fix (Within 2 hours):**
1. Go to Supabase dashboard → Settings → Database
2. Reset database password immediately
3. Regenerate service role key in Supabase API settings
4. Update Vercel environment variables (Settings → Environment Variables)
5. Update local .env.local (NEVER commit this file)
6. Add warning to README about exposed credentials
7. Consider using `git filter-branch` or BFG Repo-Cleaner to remove from history

**Owner:** DevOps + Security

---

### 2. 🔴 CRITICAL: LCP 14.13 Seconds (Core Web Vitals Failure)
**Impact:** 5/5 | **Effort:** 3/5 | **Priority Score:** 13

**Problem:**
Largest Contentful Paint is 14.13 seconds on mobile, 5.6x over Google's 2.5s threshold. Desktop performance also weak at 74/100.

**Why It Matters:**
- Google Search ranking penalty (CWV is a ranking factor)
- 53% of mobile users abandon sites that take >3s to load
- Poor user experience directly impacts conversion rates

**Lighthouse Breakdown:**
```
Performance: 73/100 (mobile), 74/100 (desktop)
LCP: 14,132ms (target: <2,500ms) ❌
TBT: 3ms (target: <200ms) ✅
CLS: 0 (target: <0.1) ✅
```

**Fix (Within 8 hours):**
1. Identify hero image/component causing slow LCP
   ```bash
   npx lighthouse https://www.slctrips.com --view --only-categories=performance
   ```
2. Convert images to optimized WebP/AVIF format
3. Use Next.js `<Image>` component with `priority` prop for hero
4. Add explicit width/height to prevent layout shift
5. Implement preload for critical resources:
   ```html
   <link rel="preload" as="image" href="/hero.webp" />
   ```
6. Defer non-critical JavaScript
7. Consider CDN for static assets if not already using one
8. Re-test with Lighthouse mobile until LCP < 2.5s

**Owner:** Frontend + Performance Engineering

---

### 3. 🔴 CRITICAL: Database Hostname DNS Failure
**Impact:** 5/5 | **Effort:** 1/5 | **Priority Score:** 14

**Problem:**
```bash
psql: error: could not translate host name "db.mkepcjzqnbowrgbvjfem.supabase.co" to address: nodename nor servname provided, or not known
```

**Why It Matters:**
Cannot run migrations, database scripts, or admin tasks. Blocks developer workflows and emergency database operations.

**Fix (Within 30 minutes):**
1. Log into Supabase dashboard
2. Navigate to Settings → Database
3. Copy the correct **Connection Pooler** URL (typically: `aws-0-us-west-1.pooler.supabase.com`)
4. Update DATABASE_URL in:
   - `.env.local` (DO NOT COMMIT)
   - Vercel environment variables
5. Test connection:
   ```bash
   psql "postgresql://postgres:<password>@<correct-host>:6543/postgres"
   ```
6. Document correct format in team docs

**Note:** Direct connection typically uses port 5432, pooler uses 6543.

**Owner:** Database Administrator / DevOps

---

### 4. 🟡 HIGH: Missing Security Headers
**Impact:** 4/5 | **Effort:** 2/5 | **Priority Score:** 12

**Problem:**
Current headers:
```
✅ strict-transport-security: max-age=63072000
❌ content-security-policy: MISSING
❌ x-frame-options: MISSING
❌ x-content-type-options: MISSING
❌ referrer-policy: MISSING
```

**Why It Matters:**
- No CSP = vulnerable to XSS attacks
- No X-Frame-Options = can be embedded in malicious iframes (clickjacking)
- No X-Content-Type-Options = MIME-sniffing vulnerabilities
- No Referrer-Policy = leaks referrer data to external sites

**Fix (Within 4 hours):**

Add to `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://mkepcjzqnbowrgbvjfem.supabase.co;"
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        }
      ]
    }
  ];
}
```

Deploy to staging first, test thoroughly, then production.

**Owner:** Frontend + Security

---

### 5. 🟡 HIGH: No WAF or DDoS Protection Layer
**Impact:** 3/5 | **Effort:** 3/5 | **Priority Score:** 9

**Problem:**
Site served directly by Vercel (dae8d44e6274f6d4.vercel-dns-016.com). No Cloudflare proxy, no WAF, no geographic filtering.

**Why It Matters:**
- Vulnerable to DDoS attacks beyond Vercel's default protection
- No bot protection for scraping/abuse
- No geographic blocking for international threats
- No rate limiting at edge

**Fix (Within 24 hours):**
Option A: Add Cloudflare as proxy
1. Add site to Cloudflare
2. Update DNS to point to Cloudflare nameservers
3. Configure Cloudflare to proxy to Vercel
4. Enable WAF rules (OWASP Core Ruleset)
5. Set up rate limiting rules
6. Enable Bot Fight Mode

Option B: Verify Vercel plan includes adequate protection
1. Confirm Vercel Pro plan includes DDoS mitigation
2. Enable Vercel Firewall if available
3. Set up Vercel rate limiting

**Owner:** Infrastructure / Security

---

## Quick Wins (Can Ship Within 24 Hours)

### 1. Rotate Exposed Credentials ⚡ Priority: 14
**Impact:** Eliminate immediate security breach risk
**Effort:** Low (30 minutes)

**Steps:**
1. Supabase dashboard → Settings → Database → Reset Password
2. Supabase dashboard → Settings → API → Regenerate service_role key
3. Vercel dashboard → Settings → Environment Variables → Update all Supabase vars
4. Update local `.env.local` (ensure in .gitignore)
5. Test deployment to confirm connectivity
6. Add note to README warning about credential exposure in git history

---

### 2. Fix Database Connection String ⚡ Priority: 14
**Impact:** Restore direct database access for migrations
**Effort:** Low (15 minutes)

**Steps:**
1. Supabase dashboard → Settings → Database → Copy Connection Pooler URL
2. Format: `postgresql://postgres:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
3. Update DATABASE_URL in .env.local
4. Update DATABASE_URL in Vercel environment variables
5. Test: `psql "$DATABASE_URL" -c "SELECT version();"`

---

### 3. Add Security Headers ⚡ Priority: 12
**Impact:** Protect against XSS, clickjacking, MIME-sniffing
**Effort:** Low (2 hours including testing)

**Steps:**
1. Add headers config to next.config.js (see code above)
2. Start with CSP in report-only mode to catch violations
3. Deploy to preview branch
4. Monitor for CSP violations in browser console
5. Adjust CSP directives as needed
6. Deploy to production

---

### 4. Optimize Hero Image for LCP ⚡ Priority: 13
**Impact:** Fix Core Web Vitals, improve SEO ranking
**Effort:** Medium (4-6 hours)

**Steps:**
1. Run Lighthouse with view: `npx lighthouse https://www.slctrips.com --view`
2. Identify LCP element (likely hero image)
3. Convert to WebP: `npx @squoosh/cli --webp auto <image>`
4. Replace with Next.js Image:
   ```jsx
   <Image
     src="/hero.webp"
     alt="Description"
     width={1920}
     height={1080}
     priority
   />
   ```
5. Test locally and measure LCP
6. Deploy to preview and run Lighthouse again
7. Target: LCP < 2.5s on mobile

---

### 5. Fix 404 Routes ⚡ Priority: 7
**Impact:** Better UX, eliminate navigation dead-ends
**Effort:** Low (1 hour)

**Steps:**
1. Search for /staykit and /about references: `grep -r "staykit\|about" src/`
2. Either:
   - Create placeholder pages in `src/app/staykit/page.tsx` and `src/app/about/page.tsx`
   - Remove nav links if pages not needed
3. Update navigation components
4. Deploy and test all nav links

---

## Core Web Vitals Deep Dive

### Current State
| Metric | Mobile | Desktop | Target | Status |
|--------|--------|---------|--------|--------|
| LCP | 14.13s | ~8s | <2.5s | 🔴 FAIL |
| TBT | 3ms | ~2ms | <200ms | 🟢 PASS |
| CLS | 0 | 0 | <0.1 | 🟢 PASS |

### What to Fix (Priority Order)
1. **Hero image optimization** - Likely the LCP element
2. **Resource hints** - Add preload for critical assets
3. **JavaScript reduction** - Defer non-critical scripts
4. **Font loading** - Use font-display: swap
5. **Third-party scripts** - Audit and defer where possible

### Expected Impact
Fixing LCP to <2.5s could improve:
- Search ranking: +5-10 positions for competitive keywords
- Bounce rate: -20% to -30%
- Conversion rate: +10% to +15%
- Mobile users: +30% retention

---

## Vercel Environment Notes

### What We Know (Limited Access)
- Deployment: ✅ Working (x-vercel-cache: HIT)
- Region: sfo1 (San Francisco)
- DNS: dae8d44e6274f6d4.vercel-dns-016.com
- IPs: 216.150.16.193, 216.150.1.193
- Cache: Functioning correctly

### What We Can't Verify (No API Token)
- Environment variables count and values
- Build logs and error rates
- Serverless function cold start times
- Edge cache configuration
- Recent deployment history

### Recommendation
Provide `VERCEL_TOKEN` for next audit to enable:
- Automated env var validation
- Build log analysis
- Performance metrics over time
- Deployment history review

---

## Supabase Findings

### Accessible via REST API ✅
- Project ID: mkepcjzqnbowrgbvjfem
- REST API: https://mkepcjzqnbowrgbvjfem.supabase.co/rest/v1/
- Tables exposed: 338
- Sample tables verified:
  - `tripkits` - TripKit marketplace catalog
  - `guardians` - County guardian characters (29 rows sampled)
  - `destinations` - Destination locations
  - `deep_dive_stories` - Content stories
  - `bundles` - TripKit bundles
  - `categories` - Destination categories

### Direct Database Connection ❌
```
Error: could not translate host name "db.mkepcjzqnbowrgbvjfem.supabase.co" to address
```

**Impact:**
- Cannot run migrations
- Cannot audit RLS policies
- Cannot check auth configuration
- Cannot get accurate row counts
- Cannot inspect indexes and performance

**Action Required:** Fix connection string (see Quick Win #2)

### RLS Policy Audit - BLOCKED
Without direct database access, cannot verify:
- Which tables have RLS enabled
- Policy definitions and rules
- Whether policies are permissive (allow true)
- Auth configuration

**Risk:** Potential data exposure if RLS not properly configured.

**Next Steps After DB Access Restored:**
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Review policies
SELECT * FROM pg_policies;

-- Find permissive policies
SELECT * FROM pg_policies WHERE qual = 'true';
```

---

## Cloudflare Status

### Current Configuration
- Status: **NOT IN USE**
- DNS: Points directly to Vercel
- Proxy: Disabled
- WAF: Not active
- Cache: Relying on Vercel cache only

### Implications
**Pros:**
- Simpler infrastructure
- One less point of failure
- Lower latency (fewer hops)

**Cons:**
- No additional DDoS protection
- No WAF for OWASP Top 10 threats
- No bot protection
- No geographic rate limiting
- No edge caching layer

### Should You Add Cloudflare?
**Consider adding if:**
- You anticipate traffic spikes or DDoS risk
- You need geographic blocking (e.g., GDPR compliance)
- You want advanced bot protection
- You need detailed analytics at edge

**Current Vercel protection should suffice for:**
- Small to medium traffic sites
- Low-risk content sites
- Internal/limited-access applications

---

## Google Drive Audit

**Status:** Not performed - no credentials provided

**Required for next audit:**
- `GOOGLE_DRIVE_FOLDER_URL` - Link to SLCTrips project folder
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account JSON with read access

**What we'd check:**
- Is Drive the "source of truth" for any data?
- Are docs up to date with deployed code?
- Are there conflicting versions?
- Single points of failure (only one person has access)?

---

## Git Repository Health

### Repository Details
- URL: https://github.com/WasatchWise/slctrips-v2.git
- Main branch: `main`
- Active branches: 5 (including 2 Claude collaboration branches)
- Tags: None found
- Recent work: Guardian character updates, performance optimizations

### Issues Found

#### 1. Broken Git References
```
warning: ignoring ref with broken name refs/heads/main 2
warning: ignoring ref with broken name refs/remotes/origin/main 2
```
**Fix:** `git fsck && git gc --prune=now`

#### 2. Untracked Files (14)
Multiple guardian images in working directory:
- "BEAVER 2.png", "BOX ELDER 2.png", "CACHE 2.png", etc.
- Should be committed or removed

#### 3. Credentials Exposed (CRITICAL)
50 lines of sensitive data found in tracked files:
- Database password in plaintext
- Supabase service role keys
- API keys (Google Places, ElevenLabs, HeyGen)

**Files with secrets:**
- DEPLOYMENT_MISSION_BRIEF.md
- VERCEL_ENV_VARS.md
- slctrips-v2/.mcp.json
- CHECK_GUARDIANS_RLS.md
- DEPLOYMENT_INSTRUCTIONS.md
- And others

---

## Appendix: Artifact Files

All command outputs and detailed findings saved to:

```
./artifacts/
├── command_log.txt                  # All commands executed
├── headers.txt                      # HTTP response headers
├── homepage.html                    # Full homepage HTML
├── title.txt                        # Page title
├── meta_description.txt             # Meta description
├── uptime_check.txt                 # Status codes for key routes
├── lh_desktop.json                  # Lighthouse desktop audit (full)
├── lh_mobile.json                   # Lighthouse mobile audit (full)
├── security_headers.txt             # Security header analysis
├── third_parties.txt                # Third-party resource URLs
├── git_remotes.txt                  # Git remote configuration
├── git_branches.txt                 # All branches
├── git_recent_commits.txt           # Last 20 commits
├── git_status.txt                   # Working tree status
├── git_tags.txt                     # Git tags
├── git_secret_hits.txt              # Secret scan results
├── vercel_limited.txt               # Vercel access limitation note
├── vercel_headers.txt               # Vercel-specific headers
├── credentials_status.txt           # Env var availability check
├── env_files.txt                    # Local env file status
├── supa_db_connection_issue.txt     # Database connection error
├── supa_rest_root.txt               # Supabase OpenAPI spec
├── supa_table_list.txt              # All 338 tables
├── supa_tripkits_sample.json        # Sample tripkits data
├── supa_guardians_sample.json       # Sample guardians data
├── supa_destinations_sample.json    # Sample destinations data
├── supa_summary.txt                 # Supabase findings summary
├── cloudflare_limited.txt           # Cloudflare access note
├── dns_slctrips.txt                 # DNS lookup results
├── cloudflare_headers.txt           # CF-specific headers (none found)
├── cloudflare_summary.txt           # Cloudflare status summary
├── drive_summary.txt                # Google Drive status
├── summary.json                     # Machine-readable full report
└── summary.md                       # This document
```

---

## Prioritization Model Used

Each risk scored using:
```
Priority = (Impact × 2) + (5 - Effort)
```

Where:
- Impact: 1 (low) to 5 (critical business impact)
- Effort: 1 (< 1 hour) to 5 (> 1 week)

Scores 12+ = Address within 24 hours
Scores 8-11 = Address within 1 week
Scores 4-7 = Address within 1 month
Scores <4 = Backlog

---

## Recommendations Summary

### Do Today (Next 8 Hours)
1. ⚡ Rotate all exposed database credentials and API keys
2. ⚡ Fix Supabase database connection string
3. ⚡ Add security headers (CSP, X-Frame-Options, etc.)

### Do This Week
1. 🎯 Optimize hero image to fix LCP (Core Web Vitals)
2. 🎯 Audit and configure RLS policies once DB access restored
3. 🎯 Fix or remove 404 routes (/staykit, /about)
4. 🎯 Clean up git repository (remove broken refs, commit or remove guardian images)

### Do This Month
1. 📋 Evaluate Cloudflare proxy for additional security
2. 📋 Implement comprehensive monitoring and alerting
3. 📋 Set up proper secrets management (Vercel env vars only, never in git)
4. 📋 Document infrastructure and runbooks for team

---

## Contact for Next Audit

To enable more comprehensive auditing in future, please provide:

**API Tokens:**
- `VERCEL_TOKEN` - Read-only access to project
- `SUPABASE_ACCESS_TOKEN` - Management API access
- `CLOUDFLARE_API_TOKEN` - Read-only analytics (if added)

**Credentials:**
- Correct `DATABASE_URL` - Supabase connection pooler
- `GOOGLE_APPLICATION_CREDENTIALS` - For Drive audit (if needed)

**Access:**
- Vercel team member access (read-only)
- Supabase project collaborator (read-only)

---

**End of Report**
