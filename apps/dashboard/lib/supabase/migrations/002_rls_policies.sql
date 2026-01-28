-- ============================================================================
-- Row Level Security (RLS) Policies for SDPC Registry
-- Basic policies - expand once district auth mapping is defined
-- ============================================================================

-- Vendors: public read, service role write
DROP POLICY IF EXISTS "Vendors public read" ON vendors;
CREATE POLICY "Vendors public read"
  ON vendors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Vendors service role write" ON vendors;
CREATE POLICY "Vendors service role write"
  ON vendors FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Video templates: public read (active only), service role write
DROP POLICY IF EXISTS "Video templates public read" ON video_templates;
CREATE POLICY "Video templates public read"
  ON video_templates FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Video templates service role write" ON video_templates;
CREATE POLICY "Video templates service role write"
  ON video_templates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Knowledge base: public read (active only), service role write
DROP POLICY IF EXISTS "Knowledge base public read" ON knowledge_base;
CREATE POLICY "Knowledge base public read"
  ON knowledge_base FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Knowledge base service role write" ON knowledge_base;
CREATE POLICY "Knowledge base service role write"
  ON knowledge_base FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Support interactions: users can read/create their own by email
DROP POLICY IF EXISTS "Support interactions user read" ON support_interactions;
CREATE POLICY "Support interactions user read"
  ON support_interactions FOR SELECT
  TO authenticated
  USING (user_email = (auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Support interactions user create" ON support_interactions;
CREATE POLICY "Support interactions user create"
  ON support_interactions FOR INSERT
  TO authenticated
  WITH CHECK (user_email = (auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Support interactions service role" ON support_interactions;
CREATE POLICY "Support interactions service role"
  ON support_interactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Service-role-only access for sensitive tables until auth mapping is defined
DROP POLICY IF EXISTS "DUAs service role" ON data_use_agreements;
CREATE POLICY "DUAs service role"
  ON data_use_agreements FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Tool assessments service role" ON tool_assessments;
CREATE POLICY "Tool assessments service role"
  ON tool_assessments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Compliance checks service role" ON compliance_checks;
CREATE POLICY "Compliance checks service role"
  ON compliance_checks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Personalized videos service role" ON personalized_videos;
CREATE POLICY "Personalized videos service role"
  ON personalized_videos FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
