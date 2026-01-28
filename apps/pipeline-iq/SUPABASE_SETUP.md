# Supabase Setup & Migration Guide

## 🔒 Security Checklist

### ✅ Before Deploying to Supabase

- [ ] All migrations are in `supabase/migrations/` directory
- [ ] Database schema matches TypeScript types in `types/database.types.ts`
- [ ] Row Level Security (RLS) policies are configured
- [ ] Service role keys are stored securely (never in code)
- [ ] `.env.local` is in `.gitignore` and NOT committed
- [ ] `.env.example` is committed (with placeholder values only)

---

## 📁 Database Migrations

All database migrations are stored in the `supabase/migrations/` directory and should be applied in order:

### Migration Files:

1. **`001_initial_schema.sql`**
   - Creates base tables: organizations, users, projects, contacts, companies
   - Sets up indexes and initial data
   - Creates the Groove Technologies organization
   - Inserts Mike Sartain as owner

2. **`002_align_schema.sql`**
   - Aligns schema with TypeScript types
   - Updates project scoring (groove_fit_score, engagement_score, timing_score, total_score)
   - Creates pipeline_metrics view
   - Adds Construction Wire integration fields

3. **`003_premium_features.sql`**
   - Adds subscription tiers and billing
   - Creates usage tracking for AI features
   - Implements feature access controls
   - Sets up God Mode for admins
   - Defines subscription plans: Free, Pro, Premium, Enterprise, God Mode

---

## 🚀 Applying Migrations to Supabase

### Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order:
   - `001_initial_schema.sql`
   - `002_align_schema.sql`
   - `003_premium_features.sql`
4. Click **Run** for each migration

### Method 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations
supabase db push

# Or apply specific migration
supabase db execute --file supabase/migrations/001_initial_schema.sql
supabase db execute --file supabase/migrations/002_align_schema.sql
supabase db execute --file supabase/migrations/003_premium_features.sql
```

### Method 3: Using MCP Tools (If Available)

If you have Supabase MCP tools configured:

```bash
# Apply each migration
mcp_supabase_apply_migration --name "001_initial_schema" --query "$(cat supabase/migrations/001_initial_schema.sql)"
```

---

## 🔐 Row Level Security (RLS)

**Important:** RLS policies need to be configured to ensure data security.

### Create RLS Policies:

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_priority_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own org
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Projects: Users can only see projects from their org
CREATE POLICY "Users can view their org's projects"
  ON high_priority_projects FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert their org's projects"
  ON high_priority_projects FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their org's projects"
  ON high_priority_projects FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Contacts: Users can only see contacts from their org
CREATE POLICY "Users can view their org's contacts"
  ON contacts FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Companies: Users can only see companies from their org
CREATE POLICY "Users can view their org's companies"
  ON companies FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Campaigns: Users can only see campaigns from their org
CREATE POLICY "Users can view their org's campaigns"
  ON outreach_campaigns FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Activities: Users can only see activities from their org
CREATE POLICY "Users can view their org's activities"
  ON outreach_activities FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Subscription Plans: Everyone can view plans (public)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- Usage Tracking: Users can only see their org's usage
CREATE POLICY "Users can view their org's usage"
  ON usage_tracking FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
```

---

## 🔑 Environment Variables

### Required Supabase Variables:

Get these from your Supabase dashboard → Settings → API:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Organization ID:

This is the UUID of your Groove Technologies organization:

```env
ORGANIZATION_ID=34249404-774f-4b80-b346-a2d9e6322584
```

---

## 📊 Database Tables

### Core Tables:

- **organizations** - Companies using the platform
- **users** - User accounts linked to organizations
- **high_priority_projects** - Construction projects
- **contacts** - Decision makers and influencers
- **companies** - Construction companies (developers, architects, contractors)
- **project_stakeholders** - Many-to-many relationship between projects and contacts
- **outreach_campaigns** - Marketing campaigns
- **outreach_activities** - Individual outreach actions

### Premium Features Tables:

- **subscription_plans** - Defines Free, Pro, Premium, Enterprise, God Mode tiers
- **usage_tracking** - Tracks AI enrichment, email sends, video generation

### Views:

- **pipeline_metrics** - Aggregated project metrics by stage
- **monthly_usage** - Aggregated usage by month
- **current_month_usage** - Current month usage for limit checks
- **admin_subscription_stats** - Admin dashboard stats

---

## 🧪 Testing Your Setup

After applying migrations, test with:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check organization exists
SELECT * FROM organizations WHERE name = 'Groove Technologies';

-- Check user exists
SELECT * FROM users WHERE email = 'msartain@getgrooven.com';

-- Check subscription plans exist
SELECT * FROM subscription_plans ORDER BY sort_order;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 🛡️ Security Best Practices

### ✅ DO:

- Use the service role key ONLY on the server side
- Use the anon key for client-side requests
- Enable RLS on all tables
- Test RLS policies thoroughly
- Use environment variables for all secrets
- Keep `.env.local` in `.gitignore`
- Commit `.env.example` with placeholders

### ❌ DON'T:

- Never commit `.env.local` or any file with real API keys
- Never use service role key in client-side code
- Never hardcode API keys in source code
- Never share service role keys in Slack, email, or docs
- Never disable RLS without a very good reason

---

## 📱 Supabase Auth Setup

### Enable Email Auth:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set up redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

### Create Auth Pages:

The app has auth pages at:
- `/login` - User login
- `/signup` - User registration

---

## 🔄 Keeping Schema in Sync

### Generate TypeScript Types:

After any schema changes, regenerate types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

Or using Supabase CLI:

```bash
supabase gen types typescript --linked > types/database.types.ts
```

---

## 📞 Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Dashboard:** https://app.supabase.com
- **Project Owner:** Mike Sartain (msartain@getgrooven.com)

---

## ✅ Final Checklist Before Going Live

- [ ] All migrations applied successfully
- [ ] RLS policies created and tested
- [ ] Environment variables configured in Vercel/hosting platform
- [ ] Auth providers enabled and configured
- [ ] TypeScript types generated and match schema
- [ ] Test data inserted and verified
- [ ] Backups configured in Supabase
- [ ] Monitoring and alerts set up
- [ ] `.env.local` is NOT in git history
- [ ] Service role key stored securely (not in code)

---

**Last Updated:** October 31, 2025  
**Database Version:** 3 migrations (001, 002, 003)

