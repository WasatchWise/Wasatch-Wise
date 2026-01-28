# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Rings at Fullmer Legacy Center** (www.getintherings.com) - a privacy-first youth development PWA with quest tracking, portfolio management, badge systems, and Cyclone visualization. Built on Supabase with Next.js 16.

### Founder
**John Lyman, M.Ed.** - "The Interface Between Systems and Stories"
- 16 years running youth programs at YouthCity (5,000+ youth annually, 200+ learning experiences)
- 6 years as Utah's Student Data Privacy Specialist (50,000+ educators trained)
- Chaired committee that wrote Utah's K-12 AI professional development framework
- Bassist/songwriter for Starmy (24 years, Lollapalooza 2004)

### Core Philosophy
- **Agency Over Surveillance**: All data collection is user-initiated (Tap In, Loot Drop)
- **HOMAGO Flow**: Hanging Out → Messing Around → Geeking Out
- **Privacy by Design**: Youth control their own story
- **Humans in the Loop**: Technology serves humans, not the reverse

### Terminology
- Users = "Champions"
- Classes = "Quests"
- Grades = "Badges"
- Homework = "Artifacts"
- Attendance = "Tap In"
- Uploads = "Loot Drops"

## Developmental Framework (Seven-Year Itch)

John's developmental philosophy based on 7-year cycles:
- **0-7 Littles**: Early childhood, foundation building
- **7-17 Formative**: Structure and skill-building, youth programs
- **17-21 LEADS**: Leadership prep, autonomy practice, pathway planning
- **21+ Staff**: Driving staff (must be 21 to drive)

Youth programs serve ages 7-17. LEADS is the leadership pipeline for 17-21.

## Current State (November 2024)

### What's Built

#### Landing Page (`/app/src/app/page.tsx`)
- Hero with animated rings background
- Legacy section (Gene Fullmer story)
- Programs section (4 pillars: Wellness, TechNest, Creative Studio, Civic Lab)
- The 9 Rings visualization
- The Science section (HOMAGO, Brain Science, Dev Stages, SOLE)
- Community section ("Serving the Whole Community")
- Privacy section
- Founder section (John Lyman bio)
- Get Involved CTA
- Location/footer

#### 8 Demo Dashboards
Each styled for its specific audience:

| Demo | Path | Audience | Theme |
|------|------|----------|-------|
| Board | `/demo/board` | Board members | Professional light, data visualization |
| Staff | `/demo/staff` | Facility workers | Operational blue/gray, quick-scan |
| Parent | `/demo/parent` | Parents | Warm cream, reassuring greens |
| Youth | `/demo/youth` | Young people | Cyberpunk HUD, game-like |
| Adult | `/demo/adult` | Adult members | Sophisticated purple/navy |
| Senior | `/demo/senior` | Seniors | Large fonts, warm tones |
| Partner | `/demo/partner` | Event partners | Clean business, ROI focus |
| Incubator | `/demo/incubator` | Coworking/entrepreneurs | Startup aesthetic |

#### Incubator Demo Features
- Coworking floor map (24 desks: quiet/collaborative/phone zones)
- Kitchen incubator resident management
- Mentor sessions (coworkers → youth)
- Lassonde Institute, SBDC partnerships
- Revenue tracking dashboard

#### Core App Routes
- `/dashboard` - Main user dashboard
- `/quests` - Quest browser with filtering
- `/quests/[id]` - Individual quest detail
- `/cyclone` - Ring visualization
- `/badges` - Badge collection
- `/portfolio` - Champion's portfolio
- `/tap-in` - Check-in
- `/loot-drop` - Upload artifacts
- `/sessions` - Session management

#### Components
- `CycloneMini` - Compact ring visualization for dashboards
- `ActivityTicker` - Real-time activity feed

### Database
- 412 quests with steps and ring associations
- Full schema in `supabase/migrations/`
- Supabase project: `afwcgpjnyvknnuadsdsz`

### PWA Setup
- `manifest.json` in public folder
- `icon.webp` (512x512, 46KB) and `apple-icon.webp` (180x180, 8.8KB)
- Theme color: `#0a0a14`

## Common Commands

### Development
```bash
cd app
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
```

### Database
```bash
# Link to project
supabase link --project-ref afwcgpjnyvknnuadsdsz

# Apply migrations
supabase db push

# Reset with seed data
supabase db reset

# Create new migration
supabase migration new migration_name
```

### Deployment
**IMPORTANT**: Vercel auto-deploy from GitHub is not working. Use manual deploy:
```bash
# From project root (TheRings/, not app/)
vercel --prod
```

### Git Workflow
```bash
git add -A && git commit -m "message" && git push origin main && vercel --prod
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router and Turbopack
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + CSS variables
- **Fonts**: Playfair Display, Oswald, Geist

### Database Schema

**Core Domain Model:**
- **Sites**: Multi-tenant foundation
- **Rings**: 9 domains (Self, Body, Brain, Bubble, Scene, Neighborhood, Community, World, Ether)
- **Pillars**: 4 program pillars
- **Quests**: Curriculum units with HOMAGO structure

**User System:**
- `user_profiles` extends Supabase auth.users
- `site_memberships` with roles (youth, staff, mentor, partner, parent_guardian, admin)

**Key Data Flows:**
1. Quest Flow: `quests` → `quest_versions` → `quest_participation`
2. Portfolio Flow: `portfolios` → `artifacts` → `endorsements`
3. Ring Activation: Computed from participation, badges, service logs

### File Structure
```
TheRings/
├── app/                    # Next.js app
│   ├── public/            # Static assets
│   │   ├── cyclone.png    # Original logo (1.5MB)
│   │   └── manifest.json  # PWA manifest
│   └── src/
│       └── app/
│           ├── layout.tsx      # Root layout
│           ├── page.tsx        # Landing page
│           ├── globals.css     # Global styles
│           ├── icon.webp       # Favicon (46KB)
│           ├── apple-icon.webp # Apple touch icon (8.8KB)
│           ├── demo/           # 8 demo dashboards
│           ├── dashboard/      # Main dashboard
│           ├── quests/         # Quest browser
│           └── ...
├── supabase/
│   ├── migrations/        # Database migrations
│   └── seed.sql          # Seed data
└── docs/                  # Documentation
```

## Key Concepts

### The 9 Rings
1. **Self** - Identity, values, goals
2. **Body** - Physical wellness, nutrition, movement
3. **Brain** - Learning, cognition, problem-solving
4. **Bubble** - Immediate relationships, family
5. **Scene** - Peer groups, social dynamics
6. **Neighborhood** - Local community
7. **Community** - Broader civic engagement
8. **World** - Global awareness
9. **Ether** - Existential, spiritual (circles back to Self)

### The Science (on landing page)
- **HOMAGO**: Hanging Out → Messing Around → Geeking Out
- **Brain Science**: Adolescent brains wired for risk, novelty, peers
- **Dev Stages**: 0-7 Littles, 7-17 Formative, 17-21 LEADS
- **SOLE**: Self-Organized Learning Environment

### Future Features Discussed
- Developmental stage pods (zone of proximal development)
- Coworking space with mentor matching
- Kitchen incubator with rotating residencies
- Lassonde Institute partnership
- Adult lifecycle stages (21-28 Emerging, 28-35 Establishing, etc.)

## Environment Variables

Required: Supabase credentials
Optional: Stripe, Google APIs, OpenWeather, AI services, SendGrid, Unsplash

See `README.env.md` for complete documentation.

## Deployment

- **Production URL**: getintherings.com (or Vercel preview URLs)
- **Vercel Project**: wasatch-wises-projects/the-rings
- **GitHub Repo**: WasatchWise/TheRings

Auto-deploy not working - always use `vercel --prod` from project root.

## Recent Session Summary (Nov 20-21, 2024)

### Completed
1. Restyled all 8 demos for audience-appropriate themes
2. Added "The Science" section (HOMAGO, Brain Science, Dev Stages, SOLE)
3. Added Founder section (John Lyman bio)
4. Built Incubator/Coworking demo
5. Set up PWA with webp icons (1.5MB → 46KB)
6. Updated developmental stages to Seven-Year Itch framework
7. Added LEADS program (17-21 leadership pipeline)

### Key Decisions
- Youth ages: 7-17
- LEADS: 17-21
- Driving staff: 21+
- "Out of School Time" (not "After School")
- "Four pillars of growth" (not "training")

## Next Steps (Potential)
- [ ] Implement actual quest enrollment flow
- [ ] Build real authentication/user profiles
- [ ] Connect demos to real data
- [ ] Add developmental stage selection to user profiles
- [ ] Implement coworking booking system
- [ ] Kitchen incubator application flow
- [ ] Mentor matching system
- [ ] Partner event management
