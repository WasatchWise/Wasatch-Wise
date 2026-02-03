# 💰📚 Pricing & Citation-Enabled WiseBot Implementation

**Date:** January 22, 2026  
**Status:** ✅ **Code Complete** - Ready for Database Setup

---

## ✅ What's Been Implemented

### 1. Pricing System

#### Database Schema
- ✅ `pricing_tiers` table - Stores service tiers with pricing ranges
- ✅ `subscriptions` table - Tracks client inquiries and subscriptions
- ✅ `workshops` table - Add-on workshop offerings
- ✅ Seed data for all 3 pricing tiers and 3 workshop types
- ✅ RLS policies (public read for pricing/workshops, user-scoped for subscriptions)

#### UI Components
- ✅ `/pricing` page with full pricing display
- ✅ Three-tier pricing cards (DAROS Briefing, 30-Day Sprint, Ongoing Support)
- ✅ Workshop add-ons section
- ✅ Orange brand styling throughout
- ✅ "Pricing" link added to header navigation
- ✅ Contact form integration with `?service=` query parameter

### 2. Citation-Enabled WiseBot

#### Database Schema
- ✅ `knowledge_sources` table - Stores NotebookLM sources
- ✅ `chat_sessions` table - Conversation session tracking
- ✅ `chat_messages` table - Individual messages with citation tracking
- ✅ `message_citations` table - Junction table for message-source relationships
- ✅ Full-text search indexes for knowledge sources
- ✅ RLS policies for user-scoped chat sessions

#### API Route
- ✅ `/api/wisebot` - New endpoint with citation support
- ✅ Searches knowledge sources based on query
- ✅ Enhances Claude prompt with source context
- ✅ Parses citations from Claude responses
- ✅ Saves citations to database
- ✅ Returns citations with response

#### UI Updates
- ✅ WiseBot page updated to use new citation API
- ✅ Citation cards displayed below assistant messages
- ✅ Source details (title, author, summary, URL)
- ✅ "226+ expert sources" badge in header
- ✅ BookOpen icon for citation indicators

---

## 🚀 Next Steps (Manual Actions Required)

### Step 1: Run Database Migrations (15 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your WasatchWise project

2. **Run Migration 004: Pricing System**
   ```sql
   -- Copy contents of: lib/supabase/migrations/004_pricing_system.sql
   -- Paste into Supabase SQL Editor
   -- Click "Run"
   ```

3. **Run Migration 005: Citation System**
   ```sql
   -- Copy contents of: lib/supabase/migrations/005_citation_system.sql
   -- Paste into Supabase SQL Editor
   -- Click "Run"
   ```

4. **Verify Tables Created**
   - Check that these tables exist:
     - `pricing_tiers` (should have 3 rows)
     - `subscriptions`
     - `workshops` (should have 3 rows)
     - `knowledge_sources` (should have 4 initial rows)
     - `chat_sessions`
     - `chat_messages`
     - `message_citations`

### Step 2: Import NotebookLM Sources (2-3 hours)

You have **226 sources** in NotebookLM that need to be imported. Options:

#### Option A: Manual Import (Recommended for Start)
1. Export sources from NotebookLM (if available)
2. Create a CSV or JSON file with columns:
   - `title`
   - `source_type` (pdf, web, doc, report, etc.)
   - `author`
   - `publication_date`
   - `url`
   - `summary`
   - `key_topics` (array of strings)

3. Use this SQL template to import:
   ```sql
   INSERT INTO knowledge_sources (title, source_type, author, url, summary, key_topics)
   VALUES 
   ('Source Title', 'pdf', 'Author Name', 'https://...', 'Summary text', ARRAY['topic1', 'topic2']),
   -- ... repeat for all 226 sources
   ;
   ```

#### Option B: Automated Import Script (Future)
- Create a script to import from NotebookLM API (if available)
- Or create a bulk import endpoint

#### Option C: Gradual Import
- Start with the 4 seed sources
- Add sources as you use them
- Build up to 226 over time

### Step 3: Test the System (30 minutes)

1. **Test Pricing Page**
   - Visit: `https://www.wasatchwise.com/pricing`
   - Verify all 3 tiers display correctly
   - Click "Book Discovery Call" - should link to `/contact?service=...`
   - Check responsive design on mobile

2. **Test WiseBot Citations**
   - Visit: `https://www.wasatchwise.com/tools/wisebot`
   - Ask: "What is FERPA?"
   - Verify response includes citations
   - Check citation cards display below response
   - Click external links (if URLs are in sources)

3. **Test Database**
   - Check `chat_sessions` table - should have new rows
   - Check `chat_messages` table - should have user/assistant messages
   - Check `message_citations` table - should link messages to sources

---

## 📊 Current State

### Database Tables Status

| Table | Status | Rows | Notes |
|-------|--------|------|-------|
| `pricing_tiers` | ⏳ Pending Migration | 0 | Will have 3 after migration |
| `subscriptions` | ⏳ Pending Migration | 0 | Empty until inquiries |
| `workshops` | ⏳ Pending Migration | 0 | Will have 3 after migration |
| `knowledge_sources` | ⏳ Pending Migration | 0 | Will have 4 seed + 226 NotebookLM |
| `chat_sessions` | ⏳ Pending Migration | 0 | Created on first WiseBot use |
| `chat_messages` | ⏳ Pending Migration | 0 | Created with each message |
| `message_citations` | ⏳ Pending Migration | 0 | Created when sources cited |

### Code Status

| Component | Status | Notes |
|-----------|--------|-------|
| Pricing Page | ✅ Complete | Ready to use after migration |
| WiseBot API | ✅ Complete | Ready to use after migration |
| WiseBot UI | ✅ Complete | Citations display ready |
| Header Navigation | ✅ Complete | Pricing link added |
| Database Migrations | ✅ Complete | Ready to run |

---

## 🎯 Features Implemented

### Pricing Page Features
- ✅ Three-tier pricing display
- ✅ "Most Popular" badge on 30-Day Sprint
- ✅ Feature breakdowns by tier level
- ✅ Workshop add-ons section
- ✅ Terms and conditions footer
- ✅ Contact form integration
- ✅ Orange brand styling
- ✅ Responsive design

### WiseBot Citation Features
- ✅ Knowledge source search
- ✅ Citation parsing from responses
- ✅ Citation cards with source details
- ✅ External link support
- ✅ Session tracking
- ✅ Message history with citations
- ✅ "226+ sources" branding
- ✅ BookOpen icon indicators

---

## 🔧 Configuration

### Environment Variables Required
All existing variables are sufficient:
- ✅ `ANTHROPIC_API_KEY` - For Claude API
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - For database
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - For service operations

### API Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/wisebot` | POST | Citation-enabled chat | ✅ Ready |
| `/api/ai/chat` | POST | Legacy streaming chat | ✅ Still works |
| `/pricing` | GET | Pricing page | ✅ Ready |

---

## 📝 Notes

### Citation System
- Currently uses simple keyword matching for source selection
- Future enhancement: Vector embeddings for semantic search
- Citations are parsed from Claude's response format: `[Source 1]`
- Multiple citations supported: `[Source 1, Source 2]`

### Pricing System
- Pricing tiers are hardcoded in seed data
- Can be updated via Supabase dashboard
- Contact form receives `?service=` parameter for tracking
- Subscriptions table tracks inquiries through to active contracts

### Knowledge Sources
- Initial 4 seed sources are basic examples
- Need to import your 226 NotebookLM sources
- Full-text search enabled for title, summary, author
- GIN index on `key_topics` array for fast topic filtering

---

## 🐛 Known Limitations

1. **Source Search**: Currently uses simple keyword matching. For better results, consider:
   - Vector embeddings (pgvector extension)
   - More sophisticated full-text search
   - Semantic similarity matching

2. **Citation Parsing**: Relies on Claude formatting citations as `[Source N]`. If Claude doesn't follow format, citations won't be captured.

3. **NotebookLM Import**: Manual process required. No automated import script yet.

---

## 🚀 Future Enhancements

### Short-term
- [ ] Create NotebookLM import script
- [ ] Add vector embeddings for semantic search
- [ ] Improve citation parsing reliability
- [ ] Add citation analytics dashboard

### Long-term
- [ ] Real-time NotebookLM sync
- [ ] Citation quality scoring
- [ ] Source relevance ranking
- [ ] Citation export functionality

---

## ✅ Checklist for Launch

- [ ] Run migration 004 (pricing system)
- [ ] Run migration 005 (citation system)
- [ ] Verify all tables created
- [ ] Import NotebookLM sources (or start with seed data)
- [ ] Test pricing page
- [ ] Test WiseBot with citations
- [ ] Verify citations display correctly
- [ ] Check responsive design
- [ ] Test contact form with `?service=` parameter

---

**Implementation Complete!** 🎉

All code is ready. Next step is running the database migrations and importing your NotebookLM sources.
