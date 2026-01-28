# 💎 PipelineIQ - Premium Tier Strategy

## **Freemium to Premium Model**

---

## 🎯 **TIER STRUCTURE**

### **FREE (Starter)**
**$0/month - Get Started**

✅ **Included:**
- 100 projects in pipeline
- 1 user seat
- Basic project scoring
- Manual data entry
- Email templates (static)
- CSV export
- Community support

❌ **Not Included:**
- AI enrichment
- Personalized emails
- Video messages
- A/B testing
- Real-time scraping
- API access

**Target:** Solo sales reps, small teams testing the platform

---

### **PRO ($99/month)**
**Most Popular - AI-Powered Sales**

✅ **Everything in Free, plus:**
- 1,000 projects
- 5 user seats
- ⭐ **AI project enrichment** (OpenAI + Google)
- ⭐ **AI-generated personalized emails**
- ⭐ **A/B test variants**
- Contact research & insights
- Automated scraping (daily)
- Advanced analytics
- Email support
- API access (1,000 calls/month)

❌ **Not Included:**
- AI video messages
- Multi-channel sequences
- Custom AI training
- White-label branding

**Target:** Sales teams wanting AI automation

---

### **PREMIUM ($299/month)**
**Video Outreach Included**

✅ **Everything in Pro, plus:**
- 5,000 projects
- 15 user seats
- 🎥 **AI video messages (50/month)**
- 🎥 **Personalized HeyGen avatars**
- Multi-channel sequences (email + video + LinkedIn)
- Priority support (2-hour response)
- API access (10,000 calls/month)
- Advanced integrations
- Custom reporting
- Dedicated success manager

❌ **Not Included:**
- Unlimited videos
- White-label branding
- Custom AI models
- SLA guarantees

**Target:** High-performing sales teams closing big deals

---

### **ENTERPRISE (Custom)**
**Everything + White-Label**

✅ **Everything in Premium, plus:**
- Unlimited projects
- Unlimited users
- 🎥 **Unlimited AI videos**
- 🎨 **White-label branding**
- Custom domain
- Custom AI training on your data
- Unlimited API access
- SSO / SAML authentication
- Dedicated infrastructure
- 99.9% SLA
- Custom contracts
- On-premise deployment option

**Target:** Large enterprises, agencies, resellers

**Pricing:** Starting at $1,500/month

---

## 👑 **GOD MODE (Mike Sartain)**

**Admin Super User - Unlimited Everything**

✅ **Special Powers:**
- ♾️ Unlimited projects
- ♾️ Unlimited users
- ♾️ Unlimited AI enrichment
- ♾️ Unlimited video messages
- 🔧 Backend admin panel
- 🔧 View all organizations
- 🔧 Impersonate any user
- 🔧 Override any limits
- 🔧 Access analytics for all customers
- 🔧 Feature flag controls
- 📊 Revenue dashboard
- 💰 Billing management
- 🎛️ System configuration

**Badge:** "Founder Account" or "God Mode" 👑

**Special Features:**
- Can test all features for free
- Access to admin routes: `/admin/*`
- Can view aggregate stats across all customers
- Feature testing ground
- Can enable/disable features for specific orgs
- Direct database access (read-only UI)

---

## 💰 **PRICING PSYCHOLOGY**

### **Why This Works:**

**1. Clear Value Ladder**
```
Free → $99 → $299 → $1,500+
Each tier = 3x value increase
```

**2. Anchor on Video**
- Free/Pro: "No videos"
- Premium: "50 videos/month"
- Enterprise: "Unlimited videos"
- Clear reason to upgrade

**3. Usage-Based Expansion**
- Start with 50 videos
- Need more? Upgrade to Enterprise
- Or buy add-on packs ($99 for 25 more videos)

**4. Seat-Based Revenue**
- Free: 1 seat
- Pro: 5 seats
- Premium: 15 seats
- Enterprise: Unlimited
- Natural team growth = revenue growth

---

## 🎮 **FEATURE FLAGS SYSTEM**

### **Database Schema:**

```sql
-- Subscription plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'free', 'pro', 'premium', 'enterprise', 'god_mode'
  display_name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL, -- in cents
  price_yearly INTEGER, -- annual discount
  stripe_price_id TEXT,
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization subscriptions
ALTER TABLE organizations ADD COLUMN subscription_plan_id UUID REFERENCES subscription_plans(id);
ALTER TABLE organizations ADD COLUMN subscription_status TEXT DEFAULT 'active'; -- active, past_due, canceled, trialing
ALTER TABLE organizations ADD COLUMN trial_ends_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN billing_cycle TEXT DEFAULT 'monthly'; -- monthly, yearly
ALTER TABLE organizations ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN stripe_subscription_id TEXT;

-- Usage tracking
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  feature_type TEXT NOT NULL, -- 'ai_enrichment', 'video_generation', 'email_sent', 'api_call'
  count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast usage queries
CREATE INDEX idx_usage_org_feature_date ON usage_tracking(organization_id, feature_type, created_at);

-- Feature usage summary view
CREATE VIEW monthly_usage AS
SELECT
  organization_id,
  feature_type,
  DATE_TRUNC('month', created_at) AS month,
  SUM(count) AS total_usage
FROM usage_tracking
GROUP BY organization_id, feature_type, DATE_TRUNC('month', created_at);
```

### **Feature Limits Configuration:**

```typescript
const PLAN_FEATURES = {
  free: {
    projects_limit: 100,
    users_limit: 1,
    ai_enrichment: false,
    ai_email_generation: false,
    video_generation: false,
    api_access: false,
    custom_branding: false,
    priority_support: false,
    monthly_limits: {
      ai_enrichments: 0,
      videos: 0,
      emails: 100,
      api_calls: 0,
    }
  },

  pro: {
    projects_limit: 1000,
    users_limit: 5,
    ai_enrichment: true,
    ai_email_generation: true,
    video_generation: false,
    api_access: true,
    custom_branding: false,
    priority_support: false,
    monthly_limits: {
      ai_enrichments: 500,
      videos: 0,
      emails: 5000,
      api_calls: 1000,
    }
  },

  premium: {
    projects_limit: 5000,
    users_limit: 15,
    ai_enrichment: true,
    ai_email_generation: true,
    video_generation: true,
    api_access: true,
    custom_branding: false,
    priority_support: true,
    monthly_limits: {
      ai_enrichments: 2500,
      videos: 50,
      emails: 25000,
      api_calls: 10000,
    }
  },

  enterprise: {
    projects_limit: null, // unlimited
    users_limit: null,
    ai_enrichment: true,
    ai_email_generation: true,
    video_generation: true,
    api_access: true,
    custom_branding: true,
    priority_support: true,
    monthly_limits: {
      ai_enrichments: null,
      videos: null,
      emails: null,
      api_calls: null,
    }
  },

  god_mode: {
    projects_limit: null,
    users_limit: null,
    ai_enrichment: true,
    ai_email_generation: true,
    video_generation: true,
    api_access: true,
    custom_branding: true,
    priority_support: true,
    admin_panel: true,
    view_all_orgs: true,
    override_limits: true,
    monthly_limits: {
      ai_enrichments: null,
      videos: null,
      emails: null,
      api_calls: null,
    }
  }
}
```

---

## 🔒 **IMPLEMENTATION: FEATURE GATING**

### **Middleware to Check Limits:**

```typescript
// lib/permissions.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function checkFeatureAccess(
  organizationId: string,
  feature: string
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createServerSupabaseClient()

  // Get organization's subscription
  const { data: org } = await supabase
    .from('organizations')
    .select('subscription_plan:subscription_plans(*)')
    .eq('id', organizationId)
    .single()

  if (!org?.subscription_plan) {
    return { allowed: false, reason: 'No active subscription' }
  }

  const plan = PLAN_FEATURES[org.subscription_plan.name]

  // Check if feature is included in plan
  if (!plan[feature]) {
    return {
      allowed: false,
      reason: `${feature} not available in ${org.subscription_plan.display_name} plan`
    }
  }

  // Check monthly usage limits
  const limit = plan.monthly_limits[feature]
  if (limit === null) return { allowed: true } // unlimited

  // Get current month's usage
  const { data: usage } = await supabase
    .from('monthly_usage')
    .select('total_usage')
    .eq('organization_id', organizationId)
    .eq('feature_type', feature)
    .gte('month', new Date(new Date().setDate(1)).toISOString())
    .single()

  const currentUsage = usage?.total_usage || 0

  if (currentUsage >= limit) {
    return {
      allowed: false,
      reason: `Monthly limit reached (${currentUsage}/${limit})`
    }
  }

  return { allowed: true }
}

export async function trackFeatureUsage(
  organizationId: string,
  feature: string,
  count: number = 1,
  metadata?: any
) {
  const supabase = await createServerSupabaseClient()

  await supabase.from('usage_tracking').insert({
    organization_id: organizationId,
    feature_type: feature,
    count,
    metadata,
  })
}

export async function isGodMode(userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  const { data: user } = await supabase
    .from('users')
    .select('is_god_mode, email')
    .eq('id', userId)
    .single()

  // Mike's email or god_mode flag
  return user?.is_god_mode === true || user?.email === 'msartain@getgrooven.com'
}
```

### **Usage in API Routes:**

```typescript
// app/api/projects/[id]/enrich/route.ts
import { checkFeatureAccess, trackFeatureUsage } from '@/lib/permissions'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const organizationId = request.headers.get('x-organization-id')

  // Check if AI enrichment is allowed
  const access = await checkFeatureAccess(organizationId, 'ai_enrichment')

  if (!access.allowed) {
    return NextResponse.json(
      {
        error: 'Feature not available',
        reason: access.reason,
        upgrade_url: '/settings/billing'
      },
      { status: 403 }
    )
  }

  // Perform enrichment...
  const result = await enrichProject(params.id)

  // Track usage
  await trackFeatureUsage(organizationId, 'ai_enrichment', 1, {
    project_id: params.id
  })

  return NextResponse.json({ success: true, result })
}
```

---

## 🎨 **UPGRADE PROMPTS & CTAs**

### **In-App Upgrade Prompts:**

**1. When Feature is Locked:**
```tsx
<LockedFeature
  feature="AI Video Messages"
  currentPlan="Pro"
  requiredPlan="Premium"
  ctaText="Upgrade to Premium"
  benefits={[
    "Generate 50 personalized videos per month",
    "3x higher response rates",
    "Stand out from every competitor"
  ]}
/>
```

**2. When Limit is Reached:**
```tsx
<UsageLimitReached
  feature="AI Enrichment"
  used={500}
  limit={500}
  nextResetDate="Dec 1, 2025"
  options={[
    {
      label: "Upgrade to Premium",
      action: "upgrade",
      description: "Get 2,500 enrichments/month"
    },
    {
      label: "Buy Add-on Pack",
      action: "addon",
      description: "+500 enrichments for $49"
    }
  ]}
/>
```

**3. Usage Dashboard:**
```tsx
<UsageDashboard>
  <UsageBar
    feature="AI Enrichment"
    used={325}
    limit={500}
    status="good"
  />
  <UsageBar
    feature="Videos"
    used={0}
    limit={0}
    status="locked"
    upgradePrompt="Unlock with Premium"
  />
  <UsageBar
    feature="Emails"
    used={4850}
    limit={5000}
    status="warning"
    message="Close to limit"
  />
</UsageDashboard>
```

---

## 💳 **BILLING IMPLEMENTATION**

### **Stripe Products & Prices:**

```typescript
// Create in Stripe Dashboard or via API
const STRIPE_PRODUCTS = {
  pro_monthly: {
    product: 'prod_xxxxx',
    price: 'price_xxxxx', // $99/month
  },
  pro_yearly: {
    product: 'prod_xxxxx',
    price: 'price_xxxxx', // $950/year (20% discount)
  },
  premium_monthly: {
    product: 'prod_xxxxx',
    price: 'price_xxxxx', // $299/month
  },
  premium_yearly: {
    product: 'prod_xxxxx',
    price: 'price_xxxxx', // $2,870/year (20% discount)
  },
  video_addon_pack: {
    product: 'prod_xxxxx',
    price: 'price_xxxxx', // $99 for 25 extra videos
  }
}
```

### **Upgrade Flow:**

```typescript
// app/api/billing/upgrade/route.ts
export async function POST(request: NextRequest) {
  const { organizationId, planName, billingCycle } = await request.json()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabase = await createServerSupabaseClient()

  // Get or create Stripe customer
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id, name')
    .eq('id', organizationId)
    .single()

  let customerId = org.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { organization_id: organizationId },
      name: org.name,
    })
    customerId = customer.id

    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', organizationId)
  }

  // Create checkout session
  const priceId = STRIPE_PRODUCTS[`${planName}_${billingCycle}`].price

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: {
      organization_id: organizationId,
      plan_name: planName,
    }
  })

  return NextResponse.json({ sessionId: session.id, url: session.url })
}
```

---

## 📊 **ADMIN DASHBOARD (God Mode)**

### **What Mike Can See:**

**1. Revenue Dashboard:**
- Total MRR/ARR
- Customer count by plan
- Churn rate
- Expansion revenue
- LTV/CAC metrics

**2. Customer Management:**
- List all organizations
- View usage per customer
- Upgrade/downgrade customers
- Issue refunds
- Enable features temporarily

**3. Feature Flags:**
- Enable beta features for specific orgs
- A/B test new features
- Kill switch for problematic features

**4. System Health:**
- API usage stats
- Error rates
- Response times
- Database performance
- AI API costs

**5. Video Analytics:**
- Videos generated per customer
- Cost per video (HeyGen charges)
- Engagement rates
- ROI metrics

---

## 🎯 **CONVERSION OPTIMIZATION**

### **Free → Pro Triggers:**

1. **After 50 projects:** "You're growing fast! Unlock AI to save 10 hours/week"
2. **After 100 emails:** "Want 5x better response rates? Try AI personalization"
3. **After 30 days:** "Power users like you love Pro - 14-day trial?"

### **Pro → Premium Triggers:**

1. **After 100 AI enrichments:** "Imagine if these had video messages..."
2. **When competition intensifies:** "Beat competitors with personalized videos"
3. **After closing a big deal:** "Want to close more like this? Videos = 3x response rate"

### **Premium → Enterprise Triggers:**

1. **Near video limit:** "You're a power user! Let's chat about unlimited videos"
2. **Team growth:** "Need more seats? Enterprise starts at $1,500/month"
3. **Custom needs:** "Want your own branding? Let's talk Enterprise"

---

## 💰 **FINANCIAL PROJECTIONS**

### **Revenue Mix (Year 1):**

| Plan | Customers | Price | MRR | Percentage |
|------|-----------|-------|-----|------------|
| Free | 100 | $0 | $0 | 0% |
| Pro | 15 | $99 | $1,485 | 45% |
| Premium | 4 | $299 | $1,196 | 36% |
| Enterprise | 1 | $1,500 | $1,500 | 45% |
| **Total** | **120** | - | **$4,181** | **100%** |

### **Revenue Expansion (3 Years):**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Total Customers | 120 | 350 | 800 |
| Paid Customers | 20 | 80 | 250 |
| Free-to-Paid % | 16.7% | 22.9% | 31.3% |
| MRR | $4,181 | $18,250 | $52,500 |
| ARR | $50K | $219K | $630K |
| Avg Revenue/Customer | $208 | $228 | $210 |

### **Unit Economics:**

**Per Premium Customer:**
- Revenue: $299/month
- COGS: ~$50/month (hosting + AI + HeyGen)
- Gross Margin: $249/month (83%)
- CAC: ~$400 (paid ads)
- Payback Period: 1.6 months
- LTV (24 months): $5,976
- LTV/CAC: 14.9x 🎯

---

## 🚀 **LAUNCH STRATEGY**

### **Phase 1: Mike (Founder Account)**
- God mode enabled
- Unlimited everything
- Test all features
- Provide feedback
- Be the case study

### **Phase 2: Early Adopters (5 customers)**
- Offer Pro plan at $49/month (50% off)
- Manual onboarding
- Feedback sessions
- Testimonials
- Validate pricing

### **Phase 3: Public Launch**
- Full pricing live
- Self-service signup
- Automated billing
- Marketing campaign
- Scale customer acquisition

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Database:**
- [ ] Create subscription_plans table
- [ ] Add subscription fields to organizations
- [ ] Create usage_tracking table
- [ ] Create monthly_usage view
- [ ] Seed plan data

### **Backend:**
- [ ] Build permissions system
- [ ] Add feature gating middleware
- [ ] Implement usage tracking
- [ ] Create billing API routes
- [ ] Stripe webhook handlers

### **Frontend:**
- [ ] Pricing page
- [ ] Upgrade flow UI
- [ ] Usage dashboard
- [ ] Locked feature prompts
- [ ] Billing settings page
- [ ] Admin dashboard (Mike only)

### **Stripe:**
- [ ] Create products
- [ ] Create prices
- [ ] Set up webhooks
- [ ] Test checkout flow
- [ ] Configure dunning

---

## 🎉 **THE STRATEGY**

**Give Mike Everything Free (God Mode)**
- Test the platform
- Validate features
- Create case study
- Prove ROI

**Charge Everyone Else**
- Free tier = lead magnet
- Pro tier = AI automation ($99)
- Premium tier = Video magic ($299)
- Enterprise = Unlimited + white-label ($1,500+)

**Video = The Hook**
- Everyone wants it
- It's expensive to provide
- Clear upgrade path
- Protects margins

**Result:**
- High-value customers pay for videos
- Lower-tier customers subsidize infrastructure
- Mike proves the platform works
- Everyone wins

---

Ready to build this out? 💎🚀
