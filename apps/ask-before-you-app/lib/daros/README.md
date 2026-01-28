# District AI Readiness OS (DAROS)

**Project Codename:** DAROS  
**Goal:** Ship a district-facing AI governance + adoption product layer that Clarion can later brand, sell, and attach to their legal/governance work.

## Architecture Overview

DAROS is built as a **compatibility layer** that can merge cleanly into Clarion's workflow. It's designed to be:
- Compliance-grade
- Audit-friendly  
- Modular (can be inserted into Clarion projects)
- White-label ready

## Core Modules

### 1. Policy & Controls Engine (PCE)
Rules-driven checklist system for privacy-by-design controls.

**Key Objects:**
- `Control` - Checklist items (e.g., "GenAI use policy for staff")
- `DistrictControl` - Implementation status per district
- `Evidence` - Links/docs proving compliance

### 2. Stakeholder Outcomes Engine (SOE)
Implements Bob's framework: Home Run/Triple/Double/Single/Miss outcomes per stakeholder group.

**Key Objects:**
- `StakeholderMatrix` - Outcome levels per group (Admin/Teachers/Parents/Students)
- `UptakeScore` - Adoption likelihood (0-100)
- `ResistanceScore` - Change resistance (0-100)

### 3. Training & Change Management Packager (TCMP)
Generates structured training content as JSON → PDF/Slides.

**Outputs:**
- 60-minute admin training deck
- 45-minute teacher practical session
- 20-minute parent info sheet + FAQ
- "What AI is / isn't" template

### 4. Vendor & Data Flow Mapper (VDFM)
Ties AI usage to vendor risk and privacy compliance.

**Key Objects:**
- `Vendor` - Master vendor list
- `DistrictVendor` - Usage mapping per district
- `DataTypes` - PII categories per app
- `AIUsageLevel` - none/embedded/teacher-used/student-facing

## Workflow: 60-Minute Briefing → Artifacts

1. **Input Collection** (pre-session)
   - Policies, vendor list, incident log
   - Current AI usage inventory

2. **Briefing Session** (60 minutes)
   - Stakeholder mapping
   - Risk assessment
   - Quick wins identification

3. **Artifact Generation** (post-session)
   - Stakeholder Matrix
   - 30/60/90 Adoption Plan
   - Controls Checklist
   - Board-Ready One-Pager

## Integration Modes (Clarion)

1. **White-label mode:** Clarion brand on outputs, you operate backend
2. **Referral mode:** Clarion sells legal/governance; you sell implementation pack
3. **Acqui-hire mode:** System becomes their education practice backbone

## Data Model

See `lib/supabase/daros-schema.sql` for complete schema.

Core tables:
- `districts` - District master data
- `artifacts` - All generated outputs
- `controls` - Privacy-by-design checklist
- `district_controls` - Implementation status
- `stakeholder_matrix` - Bob's framework data
- `interventions` - Change management actions
- `vendors` / `district_vendors` - Vendor risk mapping
- `briefing_sessions` - Session tracking
- `adoption_plans` - 30/60/90 plans

## Build Status

- [x] Database schema
- [ ] Policy & Controls Engine
- [ ] Stakeholder Outcomes Engine
- [ ] Training & Change Management Packager
- [ ] Vendor & Data Flow Mapper
- [ ] Artifact generation (PDF/JSON)
- [ ] District portal interface
- [ ] Admin dashboard
