-- ============================================================================
-- AI Content Log: Knowledge Base Tracking Fields
-- ============================================================================

ALTER TABLE ai_content_log
  ADD COLUMN IF NOT EXISTS kb_enhanced boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS kb_results_count int DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_ai_content_log_kb_enhanced
  ON ai_content_log(kb_enhanced);

COMMENT ON COLUMN ai_content_log.kb_enhanced
  IS 'Whether knowledge base context was used to enhance the response';
COMMENT ON COLUMN ai_content_log.kb_results_count
  IS 'Number of KB entries that matched the query';
