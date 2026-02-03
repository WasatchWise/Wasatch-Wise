-- ============================================================================
-- City Infrastructure: Agents, Departments, Councils, and Metrics
-- Enables the full WasatchVille command center experience
-- Run after 008_states.sql
-- ============================================================================

-- Departments within buildings
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  grid_position JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE departments IS 'Departments within each building - the drill-down layer between buildings and agents';

-- Agents (conversational AI personas)
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY, -- A001, A002, etc.
  department_id UUID REFERENCES departments(id),
  building_id TEXT NOT NULL, -- denormalized for quick lookup
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  personality JSONB NOT NULL DEFAULT '{}',
  data_scope TEXT[] DEFAULT '{}', -- which metrics they can access
  system_prompt TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'phase2', 'future', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE agents IS 'AI agents with personality, data access scope, and prompt templates';

-- Agent conversations (chat sessions)
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT REFERENCES agents(id),
  user_id UUID,
  council_id UUID, -- NULL if single-agent, set if council conversation
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  context JSONB DEFAULT '{}', -- building metrics snapshot at conversation start
  metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE agent_conversations IS 'Chat sessions between users and agents';

-- Conversation messages
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES agent_conversations(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(id), -- which agent sent this (for council chats)
  role TEXT NOT NULL CHECK (role IN ('user', 'agent', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE agent_messages IS 'Individual messages within agent conversations';

-- Cross-cutting councils (groups of agents by function)
CREATE TABLE IF NOT EXISTS councils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  member_agent_ids TEXT[] NOT NULL DEFAULT '{}',
  orchestration_mode TEXT DEFAULT 'round_robin' CHECK (orchestration_mode IN ('round_robin', 'parallel', 'hierarchical')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE councils IS 'Cross-building agent groups that can be convened for multi-agent discussions';

-- City metrics (real-time data from external sources via n8n)
CREATE TABLE IF NOT EXISTS city_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT, -- 'currency', 'count', 'percentage', 'months'
  source TEXT NOT NULL, -- 'stripe', 'supabase', 'tiktok', 'spotify', 'convertkit', 'analytics', 'manual'
  recorded_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE city_metrics IS 'Real-time metrics from external sources, populated by n8n workflows';

-- Index for fast metric lookups
CREATE INDEX IF NOT EXISTS idx_city_metrics_building_name ON city_metrics(building_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_city_metrics_recorded ON city_metrics(recorded_at DESC);

-- Enable realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE city_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_messages;

-- RLS policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE councils ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_metrics ENABLE ROW LEVEL SECURITY;

-- Public read access for agents and councils (they're public personas)
CREATE POLICY "Agents are publicly readable"
  ON agents FOR SELECT
  USING (true);

CREATE POLICY "Councils are publicly readable"
  ON councils FOR SELECT
  USING (true);

CREATE POLICY "Departments are publicly readable"
  ON departments FOR SELECT
  USING (true);

CREATE POLICY "City metrics are publicly readable"
  ON city_metrics FOR SELECT
  USING (true);

-- Conversations are user-scoped (for now, allow all - tighten with auth later)
CREATE POLICY "Conversations are accessible"
  ON agent_conversations FOR ALL
  USING (true);

CREATE POLICY "Messages are accessible"
  ON agent_messages FOR ALL
  USING (true);
