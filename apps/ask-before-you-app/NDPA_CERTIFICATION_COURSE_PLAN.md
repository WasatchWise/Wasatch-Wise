# NDPA Usage & Compliance Certification - SDPC Edition

## Project Overview

**Goal:** Recreate Utah's NDPA Canvas course as a standalone web application for SDPC  
**Target:** All 30+ SDPC member states (state-agnostic)  
**Platform:** Next.js app within `ask-before-you-app`  
**Source:** https://usbe.instructure.com/courses/2677

---

## Course Structure

### Module 0: Foundations (10 min)
- 0.1: The NDPA Genesis - Why This Matters
- 0.2: The Business Case - Your ROI Story
- 0.3: Knowledge Check (Quiz)
- 0.4: Privacy Guardian Badge ✓

### Module 1: Document Anatomy & Classification (12 min)
- 1.1: Anatomy of an NDPA
- 1.2: Vetting Modified Agreements (Traffic Light System)
- 1.3: Knowledge Check (Quiz)
- 1.4: Classification Specialist Badge ✓

### Module 2: The Standardized DPA Workflow (12 min)
- 2.1: The Standardized DPA Workflow
- 2.2: Guided Analysis - Mastering the Registry
- 2.3: Knowledge Check (Quiz)
- 2.4: DPA Detective Badge ✓

### Module 3: Registry Ninja - Advanced Problem-Solving (12 min)
- 3.1: The Ninja Toolkit - Advanced Search Techniques
- 3.2: The 5-Step Protocol for Edge Case Mastery
- 3.3: Knowledge Check (Quiz)
- 3.4: Registry Ninja Badge ✓

### Module 4: Vendor & Crisis Mastery (10 min)
- 4.1: The DPA Originator's Playbook
- 4.2: The Crisis Response Protocol
- 4.3: Knowledge Check (Quiz)
- 4.4: DPA Master Badge ✓

### Course Completion
- Key Takeaways
- Final Assessment
- Certificate Generation

---

## State-Agnostic Modifications

### Replace Utah-Specific References:

| Utah Version | SDPC Version |
|--------------|--------------|
| Utah Code 53E-9-309 | [Your State]'s audit provisions |
| USPA (Utah Student Privacy Alliance) | [Your Alliance] / SDPC Alliance |
| 41 districts + 100+ charters | [Dynamic: pull from state data] |
| 700,000+ Utah students | [Dynamic: consortium-wide stats] |
| Exhibit G (Utah Terms) | Exhibit G ([State] Terms) |
| Utah State Board of Education | [State Education Agency] |

### Dynamic State Selection:
- User selects their state at registration
- Course content adapts terminology
- State-specific exhibits referenced dynamically
- Alliance contact info pulled from SDPC database

---

## Technical Architecture

```
/app/certification/
├── page.tsx                    # Course landing/registration
├── layout.tsx                  # Course shell with progress sidebar
├── [moduleId]/
│   ├── page.tsx               # Module overview
│   └── [lessonId]/
│       └── page.tsx           # Individual lesson
├── quiz/
│   └── [moduleId]/
│       └── page.tsx           # Module quiz
├── badge/
│   └── [badgeId]/
│       └── page.tsx           # Badge award screen
└── certificate/
    └── page.tsx               # Final certificate
```

### Database Schema:
```sql
-- User progress tracking
CREATE TABLE certification_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  state_code TEXT,
  alliance_id TEXT,
  current_module INT DEFAULT 0,
  current_lesson INT DEFAULT 0,
  badges_earned TEXT[],
  quiz_scores JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  certificate_url TEXT
);

-- Quiz responses
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY,
  progress_id UUID REFERENCES certification_progress,
  module_id INT,
  question_id TEXT,
  answer TEXT,
  correct BOOLEAN,
  answered_at TIMESTAMPTZ
);
```

---

## Content Modules (From Utah Course)

### Module 0 Content ✓
- [x] NDPA Genesis - breach history, PII definitions
- [x] Business Case - SDPC evolution, three NDPA flavors, Exhibit E
- [x] Privacy Guardian Badge

### Module 1 Content ✓
- [x] Anatomy of NDPA - 6 critical checkpoints
- [x] Traffic Light System - Green/Yellow/Red classification
- [x] Classification Specialist Badge

### Module 2 Content (Partial)
- [x] Standardized DPA Workflow - Two-Source Check, Path A & B
- [ ] Guided Analysis - Registry mastery
- [ ] DPA Detective Badge

### Module 3 Content (Needed)
- [ ] Ninja Toolkit - Advanced search
- [ ] 5-Step Protocol - Edge cases
- [ ] Registry Ninja Badge

### Module 4 Content (Needed)
- [ ] DPA Originator's Playbook
- [ ] Crisis Response Protocol
- [ ] DPA Master Badge

---

## Features to Build

### Core Features:
- [ ] User registration with state selection
- [ ] Progress tracking (resume where left off)
- [ ] Module navigation with lock/unlock
- [ ] Rich content rendering (markdown → HTML)
- [ ] Embedded video support
- [ ] Interactive quizzes with scoring
- [ ] Badge awards with animations
- [ ] Certificate generation (PDF)

### Advanced Features:
- [ ] Real SDPC Registry integration
- [ ] Practice scenarios/simulations
- [ ] State-specific content switching
- [ ] Admin dashboard for alliance managers
- [ ] Completion reporting to SDPC
- [ ] LTI integration for Canvas/LMS embedding

---

## Design System

### Color Palette (SDPC Brand):
```css
--sdpc-navy: #1a365d;
--sdpc-blue: #2b6cb0;
--sdpc-light-blue: #4299e1;
--sdpc-gold: #d69e2e;
--sdpc-green: #38a169;
--sdpc-red: #e53e3e;
```

### Badge Icons:
- 🛡️ Privacy Guardian (Module 0)
- 📋 Classification Specialist (Module 1)
- 🔍 DPA Detective (Module 2)
- 🥷 Registry Ninja (Module 3)
- 👑 DPA Master (Module 4)
- 🎓 NDPA Certified (Completion)

---

## Business Model (Contractor Position)

### Target: SDPC Registry Support Manager/Specialist Role (Contractor)
Based on the A4L job posting, position yourself as a contractor who can:

### Deliverables for SDPC:
1. **Complete web-based certification course** - Replaces Canvas dependency
2. **Admin dashboard** for tracking completions across all 30+ state alliances
3. **Certificate generation system** with verification
4. **Training materials** for Registry 2.0 adoption
5. **Migration support** from Registry 1.0 to 2.0

### Ongoing Services (Contractor Model):
- Course content updates (NDPA version changes)
- Technical maintenance and hosting
- New feature development
- Alliance onboarding support
- Registry 2.0 training integration

### Value Proposition for SDPC:
| Current State | With Your Solution |
|---------------|-------------------|
| Canvas LMS licensing fees | Self-hosted, no per-seat costs |
| Utah-only course | 30+ state compatible |
| Manual tracking | Automated completion reporting |
| Static content | Interactive simulations |
| No Registry integration | Direct Registry 2.0 links |

### Alignment with Job Requirements:
- ✅ Training & Enablement (course development)
- ✅ Registry 1.0 to 2.0 Migration (integrated training)
- ✅ Helpdesk & User Support (self-service learning)
- ✅ Application Ownership (you built it, you maintain it)

### Pitch Angle:
"I built Utah's NDPA certification course. I can adapt it for national SDPC deployment, integrated with Registry 2.0, as a contractor delivering ongoing value without the overhead of a full-time hire."

---

## Next Steps

1. [ ] Set up `/app/certification/` route structure
2. [ ] Create course landing page with state selector
3. [ ] Build module/lesson content rendering system
4. [ ] Implement progress tracking
5. [ ] Port Module 0 content (complete)
6. [ ] Port Module 1 content (complete)
7. [ ] Request Module 2-4 content from Utah course
8. [ ] Build quiz system
9. [ ] Create badge award animations
10. [ ] Implement certificate generation

---

*Project Start: January 27, 2026*
*Target Completion: TBD*
