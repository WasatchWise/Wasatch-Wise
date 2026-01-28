# 👋 NEW TO THIS PROJECT? START HERE!

**Are you:**
- A new AI agent starting a conversation?
- A developer joining the team?
- John returning after a break?

**👉 READ THIS FIRST:** `.claudecode/project-context.md`

That file contains EVERYTHING you need to know:
- Database architecture (views vs tables - CRITICAL!)
- What's been completed
- What's pending
- Key decisions made (don't redo them!)
- Common pitfalls to avoid
- How to do common tasks

---

## ⚡ Ultra-Quick Reference

**Database:**
- Use `public_destinations` VIEW for queries (not `destinations` table)
- 1,634 total destinations, 1,535 active
- 49 tables, 5 views (multi-view architecture)
- Type safety: 100% ✅ (as of Oct 29, 2025)

**Recent Changes (Oct 29, 2025):**
- ✅ Removed 11 redundant columns
- ✅ Added `themes TEXT[]` column
- ✅ Created TypeScript interfaces for all JSONB fields
- ✅ Migration executed successfully

**Documentation:**
1. `.claudecode/project-context.md` ⭐ **READ THIS FIRST**
2. `ARCHITECTURE_DISCOVERY.md` - View architecture explanation
3. `MIGRATION_UPDATE_V3.md` - Latest migration details
4. `DECISIONS_LOG.md` - Why we made each decision

**Next Steps:**
- Data enrichment (Google Places, AI content, themes)
- Fix 1,147 destinations missing sources
- Verify 876 stale destinations

---

**Don't waste 15 minutes reorienting - just read `.claudecode/project-context.md` first!** ⏱️
