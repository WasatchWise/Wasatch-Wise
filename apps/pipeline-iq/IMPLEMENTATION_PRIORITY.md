# Implementation Priority - Based on HCI Runthroughs

## 📋 **What We Have (Already Built)**

✅ **Core Platform:**
- Dashboard with stats
- Projects page with filters
- Campaigns/outreach tracking
- Analytics dashboard (basic)
- Scraper integration (Construction Wire)
- Email sending (SendGrid)
- Status tracking (6 core statuses)
- Follow-up logic (day 0, 3, 7, 21)

✅ **AI Features:**
- OpenAI email generation
- Vertical-specific customization
- HeyGen video integration
- NEPQ framework
- Subject line optimization

---

## 🚀 **What Needs to Be Built (From HCI Runthroughs)**

### **Priority 1: Critical for Daily Workflow** 🔥

#### **1. Manual Project Entry** (RUNTHROUGH 8)
**Why:** Mike gets leads from networking, referrals, trade shows - not just Construction Wire
**Time Estimate:** 2-3 hours
**Complexity:** Low

**What to Build:**
- "+ Add Project" button on `/projects` page
- Simple form modal:
  - Required: Name, Type, Location (City/State), Source dropdown
  - Optional: Value, Stage, Developer, Notes
- Auto-calculate Groove Fit Score on save
- Track source field in database
- Link to existing AI enrichment feature

**Files to Modify:**
- `app/(dashboard)/projects/page.tsx` - Add button
- Create: `components/projects/AddProjectModal.tsx`
- `app/api/projects/route.ts` - Add POST endpoint
- `supabase/migrations/` - Add `source` field to projects table

---

#### **2. Goal Setting & Progress Tracking** (RUNTHROUGH 9)
**Why:** Mike needs to set targets and track progress, get recommendations
**Time Estimate:** 4-6 hours
**Complexity:** Medium

**What to Build:**
- Goals table in database
- Goals tab in Analytics page
- Goal creation form
- Progress bars and calculations
- NEPQ optimization recommendations engine
- Reverse-engineering calculator (goal → tactics)

**Files to Create/Modify:**
- Migration: `supabase/migrations/004_goals.sql`
- `app/(dashboard)/analytics/goals/page.tsx` - Goals dashboard
- `components/goals/GoalCard.tsx` - Individual goal display
- `components/goals/CreateGoalModal.tsx` - Goal creation
- `lib/ai/goal-optimizer.ts` - NEPQ recommendation engine
- `app/api/goals/route.ts` - CRUD endpoints
- `app/api/goals/[id]/recommendations/route.ts` - AI recommendations

**Key Logic:**
- Auto-calculate current progress from closed deals/revenue
- Compare to target → show "On Track" / "Behind" / "Ahead"
- NEPQ engine analyzes:
  - Historical conversion rates by vertical
  - Pain point effectiveness
  - Subject line performance
  - Contact timing success
- Reverse-engineer: "Need $X" → "Need Y deals" → "Need Z meetings" → "Need W emails"

---

### **Priority 2: Enhancements** ⚡

#### **3. Element-Level Click Tracking** (RUNTHROUGH 5)
**Time Estimate:** 3-4 hours
**Complexity:** Medium

**What to Build:**
- `outreach_element_clicks` table
- Add `data-element` attributes to email links
- Track clicks on product links, CTAs, sections
- Analytics heat map showing click rates
- A/B testing framework

---

#### **4. Follow-Up Queue UI** (RUNTHROUGH 6)
**Time Estimate:** 2-3 hours
**Complexity:** Low

**What to Build:**
- "Follow-Up Queue" section on campaigns page
- Shows projects that need follow-up (>3 days old, no open)
- One-click "Send Follow-Up" button
- Bulk actions

---

#### **5. Scraper Button UI** (RUNTHROUGH 2)
**Time Estimate:** 2-3 hours
**Complexity:** Medium

**What to Build:**
- "Run Scraper Now" button on dashboard
- Modal with options (project types, states, min value)
- Real-time status updates
- Progress indicator
- Completion notification

---

### **Priority 3: Nice-to-Have** 💡

#### **6. Enhanced Analytics Visualizations**
- Goal progress charts
- Element performance heat maps
- Vertical performance comparisons

#### **7. Keyboard Shortcuts**
- `C` = Mark as called
- `A` = Archive
- `N` = Next project
- `F` = Flag for follow-up

#### **8. Bulk Actions**
- Select multiple projects → Bulk status update
- Select multiple → Bulk archive
- Select multiple → Send follow-ups

---

## 🎯 **Recommended Implementation Order**

### **Phase 1: This Week (Critical for Mike)**
1. ✅ **Manual Project Entry** (2-3 hours) - Most requested
2. ✅ **Goal Setting Basic** (3-4 hours) - Goal creation + progress tracking
   - Skip NEPQ recommendations for now (add later)
   - Just show progress bars and basic calculations

**Total: ~6 hours of focused work**

### **Phase 2: Next Week (Enhancements)**
3. ✅ **NEPQ Goal Recommendations** (2-3 hours) - Add AI optimization
4. ✅ **Follow-Up Queue UI** (2-3 hours) - Easier follow-up management

**Total: ~5 hours**

### **Phase 3: Later (Polish)**
5. Element tracking
6. Scraper button UI
7. Keyboard shortcuts
8. Bulk actions

---

## 🤖 **How to Implement**

### **Option 1: Use This Document with Claude (Recommended)**
```bash
# In terminal with Claude Desktop or Cursor
# Share this file + HCI_RUNTHROUGHS_MIKE.md

"I need to implement Manual Project Entry (RUNTHROUGH 8). 
Here's the spec from the HCI document. Please:
1. Create the database migration
2. Build the form component
3. Add the API endpoint
4. Wire it up to the projects page"
```

### **Option 2: Use Me (Auto) to Implement**
Just ask: "Implement Manual Project Entry feature from the HCI runthroughs"

I can:
- Read the HCI document
- Understand the requirements
- Create all necessary files
- Follow existing code patterns
- Test the implementation

### **Option 3: Manual Implementation**
Use the HCI document as a spec and build it yourself or with your team.

---

## 📝 **Next Steps - Your Choice**

**Option A: Quick Win (2-3 hours)**
→ Implement Manual Project Entry first
→ Mike can start using it immediately
→ Biggest immediate value

**Option B: Full Feature (6-8 hours)**
→ Implement Manual Entry + Basic Goals
→ More complete solution
→ Mike gets both features

**Option C: Let Me Do It**
→ Just say "Implement Priority 1 features from IMPLEMENTATION_PRIORITY.md"
→ I'll build both Manual Entry and Goal Setting
→ You review and test

**Option D: Share with Another Agent**
→ Give both HCI_RUNTHROUGHS_MIKE.md and this file to Claude Desktop
→ It can implement following the same patterns
→ You coordinate the work

---

## 💡 **My Recommendation**

**Start with Manual Project Entry (Option A):**
- ✅ Quick win (2-3 hours)
- ✅ Immediate value for Mike
- ✅ Low complexity = low risk
- ✅ Can test with real data right away

Then add Goals next:
- ✅ Builds on success
- ✅ More complex, but Mike sees value from first feature
- ✅ Can iterate based on feedback

**Or if you want both now:** Option C - I can implement both Priority 1 features in one go.

---

## 🎯 **What Would You Like to Do?**

1. "Implement Manual Project Entry now"
2. "Implement both Priority 1 features"
3. "Show me the code structure first"
4. "Share this with another agent"
5. "Something else"

