-- Citation System Migration
-- Creates tables for knowledge sources, chat messages, and citations

-- Knowledge Sources Table
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_type TEXT, -- pdf, web, doc, report, rubric, policy
  author TEXT,
  publication_date DATE,
  url TEXT,
  notebooklm_id TEXT,
  summary TEXT,
  key_topics TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table (enhanced with citations)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources_used UUID[], -- Array of knowledge_source IDs
  kb_enhanced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Citations Junction Table
CREATE TABLE IF NOT EXISTS message_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  quote_text TEXT,
  relevance_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, source_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_topics ON knowledge_sources USING GIN(key_topics);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_type ON knowledge_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_citations_message ON message_citations(message_id);
CREATE INDEX IF NOT EXISTS idx_message_citations_source ON message_citations(source_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_email);

-- Full-text search index for knowledge sources
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_search ON knowledge_sources 
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(author, '')));

-- Updated_at trigger
CREATE TRIGGER IF NOT EXISTS update_knowledge_sources_updated_at
  BEFORE UPDATE ON knowledge_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed with initial knowledge sources (from NotebookLM)
INSERT INTO knowledge_sources (title, source_type, author, summary, key_topics) VALUES
('Deep Research Report: Comprehensive Governance', 'report', 'WasatchWise', 
 'Comprehensive analysis of AI governance frameworks for K-12 education', 
 ARRAY['governance', 'policy', 'compliance', 'K-12']),
 
('Framework for Ethical AI Integration in K-12 Education', 'pdf', 'Multiple Authors',
 'Guidelines for ethical AI deployment in education settings',
 ARRAY['ethics', 'K-12', 'AI integration', 'student privacy', 'FERPA']),
 
('IEdTech Trusted Apps Accessibility Rubric', 'rubric', 'IEdTech',
 'Assessment framework for educational technology accessibility compliance',
 ARRAY['accessibility', 'edtech', 'compliance', 'WCAG', 'ADA']),
 
('USBE Data Governance Plan', 'policy', 'Utah State Board of Education',
 'State-level data governance and privacy guidelines for Utah schools',
 ARRAY['data governance', 'FERPA', 'student data', 'privacy', 'Utah'])
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_citations ENABLE ROW LEVEL SECURITY;

-- Public read access for knowledge sources
CREATE POLICY IF NOT EXISTS "Knowledge sources are viewable by everyone"
  ON knowledge_sources FOR SELECT
  USING (true);

-- Chat sessions: users can read their own, service role can do everything
CREATE POLICY IF NOT EXISTS "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Users can create their own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (true);

-- Chat messages: users can read messages from their sessions
CREATE POLICY IF NOT EXISTS "Users can view messages from their sessions"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (chat_sessions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text OR auth.role() = 'service_role')
    )
  );

CREATE POLICY IF NOT EXISTS "Users can create messages in their sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Message citations: same as messages
CREATE POLICY IF NOT EXISTS "Users can view citations from their messages"
  ON message_citations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_messages
      JOIN chat_sessions ON chat_sessions.id = chat_messages.session_id
      WHERE chat_messages.id = message_citations.message_id
      AND (chat_sessions.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text OR auth.role() = 'service_role')
    )
  );

COMMENT ON TABLE knowledge_sources IS 'Knowledge base sources from NotebookLM and other sources';
COMMENT ON TABLE chat_sessions IS 'WiseBot chat conversation sessions';
COMMENT ON TABLE chat_messages IS 'Individual messages in chat sessions with citation tracking';
COMMENT ON TABLE message_citations IS 'Junction table linking messages to their cited sources';
