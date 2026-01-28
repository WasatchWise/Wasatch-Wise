# 🚀 GrooveLeads Pro - Deployment Checklist

**Last Updated:** October 31, 2025  
**Status:** Ready for deployment

---

## ✅ Pre-Deployment Verification

Run this before deploying:

```bash
# Run security check
bash scripts/security-check.sh

# Type check
npm run type-check

# Lint check  
npm run lint

# Build test
npm run build
```

---

## 📋 Step-by-Step Deployment Guide

### 🔒 Phase 1: Security Verification (5 minutes)

- [ ] **1.1** Run security check script
  ```bash
  bash scripts/security-check.sh
  ```
  Expected: "ALL CHECKS PASSED" or "PASSED WITH WARNINGS"

- [ ] **1.2** Verify no `.env.local` in git
  ```bash
  git status | grep ".env"
  ```
  Expected: No output

- [ ] **1.3** Verify `.env.example` exists
  ```bash
  cat .env.example
  ```
  Expected: File with placeholder values only

- [ ] **1.4** Review documentation
  - [ ] `README.md` - Up to date
  - [ ] `SUPABASE_SETUP.md` - Complete
  - [ ] `GITHUB_SECURITY.md` - Complete
  - [ ] `SECURITY_AUDIT.md` - Complete

---

### 🐙 Phase 2: GitHub Deployment (10 minutes)

- [ ] **2.1** Initialize git (already done)
  ```bash
  git init
  ```

- [ ] **2.2** Review what will be committed
  ```bash
  git status
  git diff
  ```

- [ ] **2.3** Stage all files
  ```bash
  git add .
  ```

- [ ] **2.4** Verify staging
  ```bash
  git status
  # Verify NO .env.local files are staged
  ```

- [ ] **2.5** Create first commit
  ```bash
  git commit -m "Initial commit: GrooveLeads Pro MVP

  - Next.js 14 with TypeScript
  - Supabase integration with 3 migrations
  - Project pipeline management
  - Scoring algorithm
  - Dashboard and analytics
  - Premium features with subscription tiers
  - Email campaign system
  - AI enrichment features
  - Construction Wire scraper
  - Secure environment setup
  "
  ```

- [ ] **2.6** Create GitHub repository
  - Go to https://github.com/new
  - Name: `grooveleads-pro` (or your choice)
  - Visibility: **Private** (recommended)
  - Do NOT initialize with README, .gitignore, or license

- [ ] **2.7** Add remote and push
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/grooveleads-pro.git
  git branch -M main
  git push -u origin main
  ```

- [ ] **2.8** Verify on GitHub
  - Visit your repository
  - Check that files are there
  - Verify NO `.env.local` is present
  - Check `.env.example` is present

---

### 🔐 Phase 3: GitHub Security Configuration (5 minutes)

- [ ] **3.1** Set repository to Private
  - Settings → General → Danger Zone → Change visibility → Make private

- [ ] **3.2** Add GitHub Secrets
  - Settings → Secrets and variables → Actions → New repository secret
  
  Add these secrets (get values from your `.env.local`):
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `ORGANIZATION_ID`
  - [ ] `CONSTRUCTION_WIRE_USERNAME`
  - [ ] `CONSTRUCTION_WIRE_PASSWORD`
  - [ ] `GOOGLE_PLACES_API_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `GOOGLE_GEMINI_API_KEY`
  - [ ] `HEYGEN_API_KEY`
  - [ ] `GMAIL_USER`
  - [ ] `GMAIL_APP_PASSWORD`
  - [ ] `SENDGRID_API_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_PUBLISHABLE_KEY`

- [ ] **3.3** Enable Branch Protection (Optional but recommended)
  - Settings → Branches → Add branch protection rule
  - Branch name pattern: `main`
  - Enable:
    - [ ] Require pull request reviews before merging
    - [ ] Require status checks to pass before merging

- [ ] **3.4** Enable Security Features
  - Settings → Code security and analysis
  - Enable:
    - [ ] Dependabot alerts
    - [ ] Dependabot security updates
    - [ ] Secret scanning

---

### 🗄️ Phase 4: Supabase Database Setup (15 minutes)

- [ ] **4.1** Log into Supabase
  - Go to https://app.supabase.com
  - Select your project or create new one

- [ ] **4.2** Apply Migration 001
  - Navigate to SQL Editor
  - Click "New query"
  - Copy contents of `supabase/migrations/001_initial_schema.sql`
  - Paste and click "Run"
  - Verify: "Success. No rows returned"

- [ ] **4.3** Apply Migration 002
  - New query
  - Copy contents of `supabase/migrations/002_align_schema.sql`
  - Paste and click "Run"
  - Verify: "Success"

- [ ] **4.4** Apply Migration 003
  - New query
  - Copy contents of `supabase/migrations/003_premium_features.sql`
  - Paste and click "Run"
  - Verify: "Success"

- [ ] **4.5** Verify Tables Created
  ```sql
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name;
  ```
  Expected tables:
  - companies
  - contacts
  - high_priority_projects
  - organizations
  - outreach_activities
  - outreach_campaigns
  - project_stakeholders
  - subscription_plans
  - usage_tracking
  - users

- [ ] **4.6** Verify Organization Created
  ```sql
  SELECT * FROM organizations WHERE name = 'Groove Technologies';
  ```
  Expected: 1 row with Groove Technologies

- [ ] **4.7** Verify User Created
  ```sql
  SELECT * FROM users WHERE email = 'msartain@getgrooven.com';
  ```
  Expected: 1 row with Mike Sartain, is_god_mode = true

- [ ] **4.8** Verify Subscription Plans
  ```sql
  SELECT name, display_name, price_monthly FROM subscription_plans ORDER BY sort_order;
  ```
  Expected: 5 rows (free, pro, premium, enterprise, god_mode)

- [ ] **4.9** Enable Row Level Security (RLS)
  - Copy RLS policies from `SUPABASE_SETUP.md`
  - Paste in SQL Editor
  - Run to enable RLS on all tables

- [ ] **4.10** Get Supabase Credentials
  - Settings → API
  - Copy:
    - Project URL
    - Anon (public) key
    - Service role key (keep secret!)

---

### 🌐 Phase 5: Vercel Deployment (10 minutes)

- [ ] **5.1** Install Vercel CLI (if not installed)
  ```bash
  npm install -g vercel
  ```

- [ ] **5.2** Login to Vercel
  ```bash
  vercel login
  ```

- [ ] **5.3** Deploy to Vercel
  ```bash
  # For production (using custom command)
  sasquatch --prod
  
  # Or use standard vercel command
  vercel --prod
  ```

- [ ] **5.4** Configure Environment Variables in Vercel
  - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  - Add all variables from `.env.local` (same as GitHub secrets)
  - Set for: Production, Preview, Development

  Required variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `ORGANIZATION_ID`
  - [ ] `CONSTRUCTION_WIRE_USERNAME`
  - [ ] `CONSTRUCTION_WIRE_PASSWORD`
  - [ ] `GOOGLE_PLACES_API_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `GOOGLE_GEMINI_API_KEY`
  - [ ] `HEYGEN_API_KEY`
  - [ ] `GMAIL_USER`
  - [ ] `GMAIL_APP_PASSWORD`
  - [ ] `SENDGRID_API_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `NEXT_PUBLIC_SITE_URL`

- [ ] **5.5** Redeploy after adding environment variables
  ```bash
  vercel --prod
  ```

- [ ] **5.6** Get deployment URL
  - Copy the production URL from Vercel dashboard
  - Example: `https://grooveleads-pro.vercel.app`

---

### 🧪 Phase 6: Testing & Verification (15 minutes)

- [ ] **6.1** Test Production Site
  - Visit your Vercel production URL
  - Verify homepage loads

- [ ] **6.2** Test Database Connection
  - Go to `/dashboard`
  - Should see "Total Projects: 1" (Marriott test project)

- [ ] **6.3** Test Projects Page
  - Go to `/projects`
  - Should see the Marriott Hotel test project
  - Verify all columns display correctly

- [ ] **6.4** Test Supabase Connection
  ```bash
  # In your local terminal
  curl https://your-app.vercel.app/api/projects
  ```
  Expected: JSON response with projects

- [ ] **6.5** Test Authentication (if enabled)
  - Go to `/login`
  - Test signup/login flow

- [ ] **6.6** Check Browser Console
  - Open DevTools → Console
  - Verify no errors
  - Check Network tab for API calls

- [ ] **6.7** Test on Mobile
  - Open site on phone
  - Verify responsive design works

---

### 📊 Phase 7: Post-Deployment Configuration (10 minutes)

- [ ] **7.1** Configure Stripe Webhooks (if using billing)
  - Stripe Dashboard → Developers → Webhooks
  - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
  - Select events:
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
  - Copy webhook signing secret
  - Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

- [ ] **7.2** Configure SendGrid (if using email)
  - Verify sender identity
  - Add domain authentication
  - Test email sending

- [ ] **7.3** Set up Cron Jobs (if needed)
  - Vercel → Project → Settings → Cron Jobs
  - Add daily scraper job:
    ```
    0 2 * * * /api/cron/daily-scrape
    ```

- [ ] **7.4** Configure Custom Domain (optional)
  - Vercel → Project → Settings → Domains
  - Add your custom domain
  - Update DNS records

---

### 🔍 Phase 8: Monitoring & Analytics (5 minutes)

- [ ] **8.1** Set up Vercel Analytics (optional)
  - Enable in Vercel dashboard

- [ ] **8.2** Set up Sentry (optional)
  - Create Sentry project
  - Add DSN to env vars
  - Deploy with Sentry integration

- [ ] **8.3** Set up PostHog (optional)
  - Create PostHog project
  - Add API key to env vars

- [ ] **8.4** Configure Supabase Monitoring
  - Settings → Database → Enable connection pooling
  - Enable daily backups

---

### 📝 Phase 9: Documentation & Handoff (5 minutes)

- [ ] **9.1** Update README with production URL
  ```markdown
  ## 🌐 Production
  
  Live site: https://your-app.vercel.app
  ```

- [ ] **9.2** Document credentials location
  - Create secure note with all credentials
  - Store in password manager (1Password, LastPass, etc.)

- [ ] **9.3** Share access with team
  - Invite team members to GitHub repo
  - Invite to Vercel project
  - Invite to Supabase project

- [ ] **9.4** Create runbook for common tasks
  - How to deploy updates
  - How to check logs
  - How to run migrations
  - Emergency procedures

---

## ✅ Final Verification

- [ ] **Production site is live and accessible**
- [ ] **Database is populated with initial data**
- [ ] **All environment variables are configured**
- [ ] **Authentication works (if enabled)**
- [ ] **API routes respond correctly**
- [ ] **No console errors in production**
- [ ] **Mobile responsive design works**
- [ ] **All GitHub secrets are set**
- [ ] **All Vercel env vars are set**
- [ ] **Branch protection is enabled**
- [ ] **Security scanning is enabled**
- [ ] **Backups are configured**
- [ ] **Team has access**
- [ ] **Documentation is complete**

---

## 🎉 Deployment Complete!

**Your GrooveLeads Pro application is now live in production!**

### Quick Links:

- **Production:** https://your-app.vercel.app
- **GitHub:** https://github.com/YOUR_USERNAME/grooveleads-pro
- **Vercel Dashboard:** https://vercel.com/your-project
- **Supabase Dashboard:** https://app.supabase.com/project/your-project-id

### Next Steps:

1. Monitor logs for any errors
2. Test all features in production
3. Set up daily scraper cron job
4. Configure billing with Stripe
5. Add team members
6. Start importing real project data

---

## 🚨 Emergency Procedures

### If Something Goes Wrong:

1. **Site is down:**
   - Check Vercel dashboard for errors
   - Check Supabase status: https://status.supabase.com
   - Review deployment logs

2. **Database errors:**
   - Check Supabase logs
   - Verify RLS policies
   - Check connection limits

3. **Environment variable issues:**
   - Verify all vars are set in Vercel
   - Redeploy after updating vars
   - Check for typos in variable names

4. **Need to rollback:**
   ```bash
   # In Vercel dashboard, go to Deployments
   # Find previous working deployment
   # Click "..." → "Promote to Production"
   ```

---

## 📞 Support

**Project Owner:** Mike Sartain - msartain@getgrooven.com  
**GitHub Issues:** https://github.com/YOUR_USERNAME/grooveleads-pro/issues  
**Documentation:** See README.md, SUPABASE_SETUP.md, GITHUB_SECURITY.md

---

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Production URL:** _________________  
**Status:** ✅ Complete

