# TDD Gap Analysis: WasatchWise "Mario 1-1"

## Executive Summary

**Current State:** DAROS consultation platform with vendor/district data  
**Target State:** Multi-tenant SaaS with "Mario 1-1" lead magnet (Cognitive Audit Quiz)  
**Gap:** ~60% alignment - need schema updates, auth integration, and lead magnet rebuild

---

## 1. Database Schema Gaps

### ✅ What We Have
- `clients` table (but missing `domain` and `subscription_tier`)
- `quiz_results` table (but TDD wants unified `audits` table)
- `cognitive_audits` table (similar to TDD `audits` but different structure)
- `ai_content_log` table (similar to TDD `ai_logs` but different structure)
- `districts` table (DAROS-specific, not in TDD)
- `vendors` / `district_vendors` (DAROS-specific)

### ❌ What's Missing (TDD Requirements)

#### 1.1 User Profiles (Auth Integration)
```sql
-- MISSING: user_profiles table
create table user_profiles (
  id uuid primary key references auth.users(id),
  client_id uuid references clients(id),
  full_name text,
  role text check (role in ('admin', 'teacher', 'parent', 'student')),
  email text unique not null,
  created_at timestamptz default now()
);
```

**Impact:** Cannot link Supabase Auth users to clients. No multi-tenant user management.

#### 1.2 Unified Audits Table
```sql
-- CURRENT: quiz_results + cognitive_audits (separate)
-- TDD WANTS: Single audits table
create table audits (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  submitted_by uuid references user_profiles(id),
  answers jsonb not null,
  score_compliance int, -- 0-100
  score_safety int, -- 0-100
  score_fluency int, -- 0-100
  status text default 'pending_analysis',
  ai_report_url text,
  created_at timestamptz default now()
);
```

**Impact:** Quiz data is split across tables. No unified audit workflow.

#### 1.3 AI Logs (Compliance Trail)
```sql
-- CURRENT: ai_content_log (different structure)
-- TDD WANTS: ai_logs with user_id, feature_used, prompt/response snapshots
create table ai_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id),
  feature_used text, -- 'quiz_generator', 'ask_dan', 'proposal_writer'
  prompt_snapshot text,
  response_snapshot text,
  model_version text default 'claude-3.5-sonnet',
  tokens_used int,
  created_at timestamptz default now()
);
```

**Impact:** Current logging doesn't track user context or feature usage.

#### 1.4 Clients Table Updates
```sql
-- MISSING FIELDS:
alter table clients add column domain text unique;
alter table clients add column subscription_tier text default 'free' 
  check (subscription_tier in ('free', 'audit', 'retainer'));
```

**Impact:** Cannot auto-group users by domain. No subscription management.

---

## 2. Security (RLS) Gaps

### ❌ Missing RLS Policies

**Current:** RLS enabled but policies are placeholder  
**TDD Requires:** Multi-tenant policies

```sql
-- MISSING: Proper multi-tenant RLS
create policy "View own district audits" on audits
for select using (
  client_id in (
    select client_id from user_profiles where id = auth.uid()
  )
);
```

**Impact:** Data is not properly isolated by tenant. Security risk.

---

## 3. Frontend Architecture Gaps

### ❌ Missing Components

1. **Shadcn/UI** - Not installed
   - Need: `card`, `button`, `progress`, `radio-group`
   - Current: Custom components (Card, Section, Callout)

2. **Nuqs** - Not installed
   - Need: URL-based state management for quiz
   - Current: No state persistence in URL

3. **Streaming UI** - Not implemented
   - Need: `<Suspense>` boundaries with "Labor Illusion" loading states
   - Current: Basic loading states

4. **Multi-Step Form** - Not built
   - Need: Quiz form with progress tracking
   - Current: No quiz UI exists

---

## 4. AI Workflow Gaps

### ❌ "Mario 1-1" Lead Magnet Not Built

**TDD Requirement:**
1. User submits quiz answers
2. Server Action saves to `audits` table
3. Trigger AI analysis (Claude 3.5 Sonnet)
4. Generate JSON report
5. Send React Email via Resend

**Current State:**
- Quiz logic exists in `app/actions/quiz.ts`
- But saves to `quiz_results` (wrong table)
- No email template
- No PDF generation
- No "Labor Illusion" UI

### ❌ "Ask Dan" Voice/Video Agent Not Built

**TDD Requirement:**
1. MediaRecorder API for audio capture
2. Deepgram/Whisper transcription
3. Claude streaming response
4. ElevenLabs Turbo streaming synthesis
5. Optional HeyGen video (async)

**Current State:**
- HeyGen integration exists (`lib/ai/heygen.ts`)
- ElevenLabs integration exists (`lib/ai/elevenlabs.ts`)
- But no "Ask Dan" UI or workflow

---

## 5. Infrastructure Gaps

### ✅ What We Have
- Next.js 15 (App Router) ✅
- Supabase ✅
- Vercel AI SDK (via `@anthropic-ai/sdk`) ✅
- Resend (installed) ✅
- React Email (installed) ✅

### ❌ What's Missing
- **Vercel AI SDK** - Using raw Anthropic SDK instead
- **Deepgram/Whisper** - No transcription service
- **TikTok Pixel** - Not configured
- **Environment Variables** - Need to verify all TDD vars

---

## 6. Implementation Priority

### Phase 1: Foundation (Day 1-2)
1. ✅ Next.js 15 - Already done
2. ❌ Install Shadcn/UI
3. ❌ Install Nuqs
4. ❌ Update database schema (user_profiles, audits, ai_logs)
5. ❌ Implement RLS policies

### Phase 2: Lead Magnet (Day 3-4)
1. ❌ Build multi-step quiz form (Shadcn + Nuqs)
2. ❌ Update quiz Server Action to use `audits` table
3. ❌ Create React Email template for audit results
4. ❌ Wire Resend email sending
5. ❌ Add "Labor Illusion" loading states

### Phase 3: AI Workflows (Day 5+)
1. ❌ Build "Ask Dan" voice interface
2. ❌ Integrate Deepgram/Whisper
3. ❌ Implement streaming responses
4. ❌ Add async HeyGen video generation

---

## 7. Migration Strategy

### Option A: Clean Slate (Recommended)
- Create new `audits` table
- Migrate `quiz_results` → `audits`
- Keep `cognitive_audits` for DAROS (separate feature)

### Option B: Extend Existing
- Add fields to `quiz_results` to match `audits`
- Rename table to `audits`
- Migrate data

**Recommendation:** Option A - cleaner separation of concerns.

---

## 8. Critical Path Items

**Must Have for "Mario 1-1":**
1. ✅ Database schema updates
2. ✅ RLS policies
3. ✅ Quiz UI (multi-step form)
4. ✅ Email template
5. ✅ Server Action updates

**Nice to Have:**
- "Ask Dan" voice agent
- Streaming UI polish
- TikTok Pixel

---

## Next Steps

1. **Create migration script** to add TDD schema
2. **Install missing dependencies** (Shadcn, Nuqs)
3. **Build quiz UI** with multi-step form
4. **Create email template** for audit results
5. **Update Server Actions** to use new schema
