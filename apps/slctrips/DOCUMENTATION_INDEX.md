# 📚 SLCTrips v2 - Complete Documentation Index

**Stop. Read this first.** This index tells you exactly which document to read based on what you need.

---

## 🎯 I'm a new AI agent starting a conversation

**👉 READ:** `.claudecode/project-context.md`

This is your complete onboarding guide. It has:
- Database architecture (views vs tables!)
- Current state & what's been completed
- Key decisions (don't redo them!)
- Common pitfalls to avoid
- How to do common tasks
- Everything you need to be productive immediately

**Time to read:** 10-15 minutes
**Time saved:** Hours of trial and error

---

## 🚀 Quick Reference Guides

### Just need a reminder of basics?

**👉 READ:** `START_HERE.md`

Ultra-quick reference:
- Database structure (5 views, 49 tables)
- Recent changes (Oct 29 migration)
- What's next
- Links to detailed docs

**Time to read:** 2 minutes

---

### Want to understand the database architecture?

**👉 READ:** `ARCHITECTURE_DISCOVERY.md`

Deep dive on the view-based architecture:
- Why we use views instead of direct table queries
- The 5 core views and their purposes
- Complete table inventory (49 tables)
- Architectural patterns discovered
- Scale readiness assessment

**Time to read:** 15 minutes
**Best for:** Understanding why the database is designed this way

---

### Need to know why we made specific decisions?

**👉 READ:** `DECISIONS_LOG.md`

Tracks every major architectural and product decision:
- Database architecture decisions
- Type safety decisions
- Content strategy decisions
- Rejected ideas (don't propose these again!)
- Pending decisions (need to be made)

**Time to read:** 10 minutes
**Best for:** Before proposing architecture changes

---

## 🔧 Migration & Recent Changes

### What changed in the recent migration?

**👉 READ:** `MIGRATION_UPDATE_V3.md`

Latest migration details (Oct 29, 2025):
- What changed from V2 to V3
- 5 dependent views discovered and handled
- How to execute the migration
- Verification steps
- Impact summary

**Time to read:** 5 minutes
**Best for:** Understanding what just changed

---

### How to run database migrations?

**👉 READ:** `MIGRATION_INSTRUCTIONS.md`

Step-by-step migration guide:
- Backup procedure
- Execution steps
- Verification queries
- Rollback instructions
- Post-migration tasks

**Time to read:** 8 minutes
**Best for:** Actually running migrations

---

### What was the architecture cleanup all about?

**👉 READ:** `ARCHITECTURE_CLEANUP_SUMMARY.md`

Complete analysis of the Oct 29 cleanup:
- Problems identified (redundancy, type safety, bloat)
- Solutions implemented
- Before/after metrics
- Files created/modified
- Lessons learned

**Time to read:** 10 minutes
**Best for:** Understanding the full scope of recent work

---

### Quick migration reference

**👉 READ:** `README_MIGRATION.md`

Quick start for the migration:
- TL;DR summary
- 5-minute execution guide
- What got fixed
- Architecture grade

**Time to read:** 3 minutes
**Best for:** "Just tell me how to run it"

---

## 👨‍💻 Development Docs

### Main project README

**👉 READ:** `README.md` (this repo's root)

Standard project README with:
- Quick start for developers
- Project overview
- Tech stack
- Common tasks
- Documentation links

**Time to read:** 5 minutes
**Best for:** New developers joining the team

---

### TypeScript definitions

**👉 READ:** `src/types/database.types.ts`

All TypeScript interfaces:
- Database table types
- JSONB field interfaces (9 new interfaces added Oct 29)
- Enums
- 100% type-safe definitions

**Time to read:** Scan as needed
**Best for:** Reference while coding

---

## 📊 By Use Case

### "I'm starting a new conversation and don't know the project"
1. `.claudecode/project-context.md` ⭐
2. `ARCHITECTURE_DISCOVERY.md`
3. `DECISIONS_LOG.md`

### "I need to understand the database quickly"
1. `START_HERE.md`
2. `ARCHITECTURE_DISCOVERY.md`
3. `.claudecode/project-context.md` (Common Tasks section)

### "I want to propose an architecture change"
1. `DECISIONS_LOG.md` (check if it's already decided/rejected)
2. `.claudecode/project-context.md` (understand current state)
3. `ARCHITECTURE_DISCOVERY.md` (understand why it's designed this way)

### "I need to run the migration"
1. `README_MIGRATION.md` (quick overview)
2. `MIGRATION_INSTRUCTIONS.md` (detailed steps)
3. `MIGRATION_UPDATE_V3.md` (what changed)

### "I'm debugging an issue with queries"
1. `.claudecode/project-context.md` (Common Pitfalls section)
2. `ARCHITECTURE_DISCOVERY.md` (understand views vs tables)
3. `src/types/database.types.ts` (check type definitions)

### "I want to know what's been done and what's next"
1. `START_HERE.md` (quick status)
2. `.claudecode/project-context.md` (Current State section)
3. `ARCHITECTURE_CLEANUP_SUMMARY.md` (recent work)

---

## 📁 All Documentation Files

### Core Onboarding
- `.claudecode/project-context.md` ⭐ **Start here for new agents**
- `README.md` - Main project README
- `START_HERE.md` - Ultra-quick reference
- `DOCUMENTATION_INDEX.md` - This file

### Architecture & Decisions
- `ARCHITECTURE_DISCOVERY.md` - View architecture deep dive
- `DECISIONS_LOG.md` - Why we made each decision

### Migration Docs (Oct 29, 2025)
- `MIGRATION_UPDATE_V3.md` - Latest migration details
- `MIGRATION_INSTRUCTIONS.md` - How to run migrations
- `ARCHITECTURE_CLEANUP_SUMMARY.md` - What was fixed
- `README_MIGRATION.md` - Quick migration reference

### Code References
- `src/types/database.types.ts` - TypeScript definitions
- `src/app/destinations/[slug]/page.tsx` - Destination pages
- `src/components/WhatDanPacks.tsx` - Gear recommendations
- `scripts/enrich-destinations.js` - Data enrichment

---

## 🔄 Keeping Docs Updated

### When to update documentation:

**Update `.claudecode/project-context.md` when:**
- Database structure changes
- Major features are completed
- Key decisions are made
- Common pitfalls are discovered

**Update `DECISIONS_LOG.md` when:**
- Architecture decisions are made
- Approaches are tried and rejected
- Pending decisions are resolved

**Update migration docs when:**
- New migrations are created
- Migration procedures change

**Update `START_HERE.md` when:**
- Current state significantly changes
- Priority tasks shift

---

## ⚡ Speed Reading Tips

### If you only have 2 minutes:
Read `START_HERE.md`

### If you have 10 minutes:
Read `.claudecode/project-context.md` (TL;DR + Current State + Common Pitfalls)

### If you have 30 minutes:
1. `.claudecode/project-context.md` (complete)
2. `ARCHITECTURE_DISCOVERY.md` (skim)
3. `DECISIONS_LOG.md` (skim)

### If you have time:
Read everything in the order listed under "By Use Case" for your situation.

---

## 🎯 The Golden Rule

**Before doing ANY work on this project:**

1. Read `.claudecode/project-context.md`
2. Check `DECISIONS_LOG.md` if proposing changes
3. Scan `ARCHITECTURE_DISCOVERY.md` to understand views

**This will save you hours of trial and error.** ⏱️

---

**Last Updated:** Oct 29, 2025
**Documentation Status:** Complete and up-to-date ✅
**Next Update:** When major features are completed or architecture changes
