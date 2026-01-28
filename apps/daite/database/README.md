# DAiTE Database Schema

This directory contains the complete Supabase database schema for DAiTE, based on the Design Specification.

## Files

- `schema.sql` - Complete database schema with all tables, indexes, RLS policies, and functions

## Quick Setup

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Create a new project
   - Wait for database to be ready

2. **Enable Required Extensions**
   - The schema automatically enables:
     - `uuid-ossp` - UUID generation
     - `vector` - pgvector for embeddings (requires pgvector extension in Supabase)
     - `pg_trgm` - Text search

3. **Run Schema**
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `schema.sql`
   - Execute the entire script
   - Verify tables are created

4. **Verify Installation**
   ```sql
   -- Check tables were created
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Should show ~40+ tables
   ```

## Schema Overview

### Core User System
- `users` - Main user table (extends auth.users)
- `user_profiles` - Public profile data with location
- `user_settings` - User preferences and accessibility settings
- `user_neurodivergent_profile` - ND-specific attributes

### CYRAiNO Agents
- `cyraino_agents` - Each user's AI agent
- `agent_memory` - Memory with summarization (vector embeddings)
- `agent_learning_logs` - Learning from interactions

### Matching System
- `vibe_checks` - User-initiated matchmaking
- `agent_conversations` - Agent-to-agent dialogues
- `discoveries` - Potential matches from vibe checks
- `matches` - Mutual matches

### Messaging
- `conversations` - Chat threads
- `messages` - Individual messages
- `message_drafts` - AI-assisted drafts

### Safety
- `verifications` - Photo/ID/Social verification
- `reports` - User reports
- `blocks` - User blocking
- `safety_flags` - Automated safety monitoring

### Photos
- `user_photos` - Profile photos with moderation
- `photo_reveals` - Progressive reveal levels

### Venues & Events
- `venues` - Date venues from multiple sources
- `events` - Date events

### Token Economy
- `token_balances` - User token balances
- `token_transactions` - Transaction history
- `token_purchases` - Purchase records
- `premium_subscriptions` - DAiTE+ subscriptions
- `accountability_scores` - Affects token bonuses

### Other Features
- `notifications` - User notifications
- `planned_dates` - Scheduled dates
- `date_feedback` - Post-date feedback
- `user_assessments` - Assessment results
- `pseudonym_history` - Pseudonym tracking

## Key Features

### Vector Embeddings
- `user_profiles.profile_embedding` - For semantic profile matching
- `cyraino_agents.agent_embedding` - For agent matching
- `agent_memory.memory_embedding` - For RAG memory retrieval

### Row Level Security (RLS)
- All tables have RLS enabled
- Basic policies included for user data access
- Additional policies needed for:
  - Reading other users' profiles (with privacy filters)
  - Vibe check candidate selection
  - Photo reveals based on blur levels
  - Admin access

### Automatic Functions
- `handle_new_user()` - Creates user data on signup
- `update_updated_at_column()` - Auto-updates timestamps
- `check_vibe_check_limits()` - Validates vibe check constraints
- `expire_old_discoveries()` - Auto-expires discoveries

## Indexes

The schema includes indexes for:
- User lookups
- Location-based queries (GIST indexes)
- Vector similarity search (ivfflat indexes)
- Status and date filtering
- Foreign key relationships

## Next Steps

1. **Add More RLS Policies**
   - Implement privacy-aware profile reading
   - Add admin access policies
   - Implement photo reveal logic

2. **Set Up Vector Embeddings**
   - Configure pgvector extension in Supabase
   - Create embedding generation functions
   - Set up vector index tuning

3. **Add Database Functions**
   - Vibe check execution logic
   - Agent conversation generation
   - Discovery expiration cron jobs
   - Token economy calculations

4. **Set Up Migrations**
   - Create migration files for future changes
   - Version control for schema updates

5. **Add Seed Data**
   - Sample venues
   - Assessment templates
   - Default settings

## Notes

- All timestamps use `TIMESTAMPTZ` (timezone-aware)
- UUIDs are used as primary keys for better distribution
- Check constraints enforce data integrity
- Foreign keys use `ON DELETE CASCADE` where appropriate
- Indexes are optimized for common query patterns

## Support

For questions about the schema, refer to:
- `docs/DESIGN_SPECIFICATION.md` - Full feature specifications
- `SUPABASE_SETUP.md` - Setup instructions
- Supabase documentation: https://supabase.com/docs

