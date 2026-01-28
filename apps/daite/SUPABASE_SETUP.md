# Supabase Setup Guide for DAiTE

## Quick Start

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Create new project
   - Note your project URL and API keys

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and paste the contents of `Daite supabase schema.sql`
   - Execute the schema
   - Verify all tables are created

3. **Enable Extensions**
   - The schema includes:
     - `uuid-ossp` (for UUID generation)
     - `vector` (for pgvector embeddings)
     - `pg_trgm` (for text search)

4. **Set Up Row Level Security (RLS)**
   - RLS policies are included in the schema
   - Review and adjust as needed for your use case

## Environment Variables

Add these to your `.env.local`:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Client Setup

### Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Create Supabase Client Utility

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Key Tables Overview

### User System
- `users` - Main user table (extends Supabase Auth)
- `user_settings` - User preferences and settings

### Identity Map
- `identity_maps` - OCEAN scores, attachment styles, love languages
- `relationship_patterns` - Identified relationship patterns
- `user_red_flags` / `user_green_flags` - User preferences

### Profiles
- `user_profiles` - Public-facing profile data
- `user_neurodivergent_profile` - Neurodivergent-specific attributes
- `user_photos` - Profile photos
- `user_prompts` - Profile prompts/responses

### CYRAiNO Agents
- `cyraino_agents` - Each user's personal AI agent
- `agent_memory` - Agent memory with RAG embeddings
- `agent_learning_logs` - Learning from interactions

### Matching
- `agent_conversations` - Agent-to-agent dialogues
- `matches` - Resulting matches
- `match_preferences` - User matching preferences

### Messaging
- `conversations` - Chat conversations
- `messages` - Individual messages
- `message_drafts` - AI-assisted message drafts

### Scheduling
- `availability_windows` - Sunday calendar system
- `date_preferences` - Date type preferences
- `planned_dates` - Scheduled dates
- `date_feedback` - Post-date feedback

### Token Economy
- `token_balances` - User token balances
- `token_transactions` - Token transaction history
- `accountability_scores` - User accountability metrics

## Vector Search

The schema includes pgvector indexes for semantic matching:
- `identity_maps.identity_embedding`
- `user_profiles.profile_embedding`
- `cyraino_agents.agent_embedding`
- `agent_memory.memory_embedding`

Use these for similarity search in your matching algorithm.

## Authentication

Supabase Auth handles:
- User signup/login
- Email verification
- Password reset
- OAuth providers (optional)

The `users` table extends `auth.users` with additional profile data.

## Next Steps

1. Run the schema in Supabase SQL Editor
2. Set up authentication in your frontend
3. Replace mock data with Supabase queries
4. Implement vector embeddings for matching
5. Set up real-time subscriptions for messaging

