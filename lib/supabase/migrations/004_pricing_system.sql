-- Pricing System Migration
-- Creates tables for pricing tiers, subscriptions, and workshops

-- Pricing Tiers Table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  description TEXT,
  features JSONB,
  popular BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  tier_id UUID REFERENCES pricing_tiers(id),
  status TEXT DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'proposal_sent', 'active', 'paused', 'completed')),
  contract_value DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workshops Table (for add-on purchases)
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_hours DECIMAL(3,1),
  price DECIMAL(10,2),
  description TEXT,
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(contact_email);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pricing_tiers_updated_at ON pricing_tiers;
CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workshops_updated_at ON workshops;
CREATE TRIGGER update_workshops_updated_at
  BEFORE UPDATE ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed pricing data based on rate card
INSERT INTO pricing_tiers (name, slug, price_min, price_max, description, features, popular, order_index) VALUES
('DAROS Briefing', 'daros-briefing', 6300, 15000, '60-Minute Board-Ready Briefing', 
 '{"items": [
   {"level": "Starter ($6,300)", "features": ["Stakeholder Matrix + Controls Snapshot", "30/60/90 Action Plan"]},
   {"level": "Standard ($9,500)", "features": ["+ Top 10 Vendor Inventory", "Safe Harbor Guidance", "2 Follow-ups"]},
   {"level": "Enterprise ($15,000)", "features": ["+ Vendor Risk Map", "Parent/Teacher Comms", "Measurement Baseline"]}
 ]}'::jsonb, false, 1),

('30-Day Implementation Sprint', '30-day-sprint', 12999, 35499, 'Policy, Management, Staff Training, and Governance Infrastructure',
 '{"items": [
   {"level": "Starter ($12,999)", "features": ["AI Use Policy", "1 Admin Workshop", "Staff Safe-Harbor Guidance"]},
   {"level": "Standard ($20,499)", "features": ["+ Teacher Training", "Parent Outreach", "Vendor Vetting Workflow"]},
   {"level": "Enterprise ($35,499)", "features": ["+ Board Session", "Incident Playbook", "Procurement Templates"]}
 ]}'::jsonb, true, 2),

('Ongoing Support & Training', 'ongoing-support', 6300, 50000, 'Sustained Monthly Support',
 '{"items": [
   {"level": "Light (10 hrs/mo)", "price": "$6,300/month", "features": ["Policy updates", "Quarterly check-ins"]},
   {"level": "Standard (20 hrs/mo)", "price": "$14,600/month", "features": ["+ Monthly training", "Priority support"]},
   {"level": "Enterprise (30 hrs/mo)", "price": "$20,000/month", "features": ["+ Dedicated advisor", "Custom deliverables"]}
 ]}'::jsonb, false, 3)
ON CONFLICT (slug) DO NOTHING;

-- Seed workshops
INSERT INTO workshops (name, duration_hours, price, description, max_participants) VALUES
('Virtual Lunch and Learn', 1, 2500, '60-minute interactive session', 50),
('Virtual Workshop', 2, 4500, '2-hour deep-dive training', 50),
('On-site Full Day', 8, 8000, 'Full-day immersive training (travel costs additional)', 100)
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

-- Public read access for pricing tiers and workshops
DROP POLICY IF EXISTS "Pricing tiers are viewable by everyone" ON pricing_tiers;
CREATE POLICY "Pricing tiers are viewable by everyone"
  ON pricing_tiers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Workshops are viewable by everyone" ON workshops;
CREATE POLICY "Workshops are viewable by everyone"
  ON workshops FOR SELECT
  USING (true);

-- Subscriptions: users can read their own, service role can do everything
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE pricing_tiers IS 'Pricing tiers for WasatchWise services';
COMMENT ON TABLE subscriptions IS 'Client subscriptions and inquiries';
COMMENT ON TABLE workshops IS 'Workshop offerings (add-on or standalone)';
