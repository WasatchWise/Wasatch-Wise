# 🎯 NEPQ INTEGRATION MAP

**Where NEPQ Lives in the Architecture**

NEPQ exists in three layers, not one:
1. **Scoring and qualification logic**
2. **Campaign and message generation**
3. **Human handoff and meeting flow**

---

## 📍 NEPQ AT EACH POINT (Scrape to Commission)

### 1. Scrape and Auto-Score
**NEPQ Role:** Silent gatekeeper

**What It Does:**
- Controls eligibility (not writing)
- If project stage too late → don't advance to outreach
- If value below threshold → deprioritize
- If services mismatch → block auto-campaign

**Implementation:**
- Add NEPQ constraints to scoring outcomes
- Only prospects that can move through NEPQ conversation advance

**Code Location:**
- `lib/utils/scoring.ts` - Add NEPQ eligibility checks

---

### 2. Auto-Enrich (Future)
**NEPQ Role:** Objection pre-mapping

**What It Does:**
- Tags enrichment output (not just stores)
- NEPQ-aligned enrichment fields:
  - Likely decision drivers
  - Likely objections
  - Emotional risk factors
  - Status-quo bias indicators

**Implementation:**
- Enrichment output includes NEPQ context
- Guides how system speaks later

**Code Location:**
- `app/api/projects/[id]/enrich/route.ts` - Add NEPQ tagging

---

### 3. Campaign Generation
**NEPQ Role:** Message shape control

**What It Does:**
- Every message must pass NEPQ checks before saving
- Guardrails:
  - No premature solution framing
  - No feature dumping
  - No assumptive close language
  - Mandatory curiosity-first opening
  - Clear, soft transition to conversation

**Implementation:**
- Validate generated content against NEPQ guardrails
- Block generation if violated

**Code Location:**
- `app/api/campaigns/generate/route.ts` - Add NEPQ validation
- `lib/nepq/guardrails.ts` - Use `validateNEPQContent()`

---

### 4. Auto-Send (Future)
**NEPQ Role:** Pacing and restraint

**What It Does:**
- Controls follow-up timing
- Maximum follow-ups
- Escalation rules

**Examples:**
- Open with no reply → reflective follow-up, not urgency
- Click but no reply → clarification-based follow-up
- Silence after multiple attempts → stop, don't chase

**Implementation:**
- Use `getNEPQFollowUpTiming()` for delays
- Use `shouldPauseFollowUp()` for limits

**Code Location:**
- `app/api/cron/auto-send/route.ts` (future) - Use NEPQ timing

---

### 5. Response Handling
**NEPQ Role:** Intent classification

**What It Does:**
- When reply comes in, NEPQ determines reply type:
  - Curiosity
  - Skepticism
  - Deflection
  - Logistics
  - Rejection
- Labels for Mike so he responds appropriately

**Implementation:**
- Classify reply intent
- Show NEPQ-appropriate response suggestions

**Code Location:**
- `app/api/webhooks/sendgrid/route.ts` (future) - Classify replies

---

### 6. Meeting Scheduling (Phase A)
**NEPQ Role:** Expectation setting

**What It Does:**
- Before/during meeting logging, NEPQ enforces:
  - What meeting is for
  - What it's not for
  - No proposal implied unless discovery criteria met
- System doesn't allow skipping discovery stages

**Implementation:**
- Validate NEPQ stage before allowing meeting
- Set meeting expectations based on current stage
- Prevent proposal meetings if not ready

**Code Location:**
- `app/api/projects/[id]/meetings/route.ts` - Use `canAdvanceStage()`

---

### 7. Post-Meeting Workflow (Phase A)
**NEPQ Role:** Permission-based advancement

**What It Does:**
- Post-meeting buttons map to NEPQ stages:
  - "They're Interested" → permission to explore solutions
  - "Send Proposal" → only enabled if discovery criteria checked
  - "Follow Up Needed" → keeps conversation open without pressure
- Prevents proposal dumping

**Implementation:**
- Check NEPQ criteria before allowing status changes
- Use `canAdvanceStage()` to validate transitions

**Code Location:**
- `app/api/projects/[id]/meetings/[id]/complete/route.ts` - Use NEPQ validation

---

### 8. Proposal Creation (Phase A)
**NEPQ Role:** Framing control

**What It Does:**
- Proposals reflect:
  - Problems agreed upon
  - Consequences of inaction
  - Why timing matters
  - Why Groove fits
- Never: "Here's everything we do" or "Here's a menu"

**Implementation:**
- Proposal template uses NEPQ framing
- Validate proposal language against NEPQ guardrails

**Code Location:**
- `app/api/projects/[id]/proposals/route.ts` - Use NEPQ validation
- Proposal form pre-fills with NEPQ-framed language

---

### 9. Deal Close (Phase A)
**NEPQ Role:** Confirmation, not persuasion

**What It Does:**
- At close, NEPQ's job is done
- System confirms:
  - Decision ownership
  - Decision timing
  - Decision criteria
- No pressure language. No "last chance" nonsense.

**Implementation:**
- Deal form uses confirmation language
- No pressure tactics

**Code Location:**
- `app/api/projects/[id]/close/route.ts` - Use NEPQ confirmation language

---

## 🔧 IMPLEMENTATION STRATEGY

### Single NEPQ Config
**File:** `lib/nepq/guardrails.ts`

**What It Exports:**
- `NEPQ_GUARDRAILS` - Single config object
- `getNEPQGuardrails(stage)` - Get rules for stage
- `validateNEPQContent(content, stage)` - Validate content
- `canAdvanceStage(current, new, context)` - Validate transitions
- `getNEPQStageFromStatus(status)` - Map status to stage

**Usage:**
```typescript
import { NEPQ_GUARDRAILS } from '@/lib/nepq/guardrails'

// Validate content
const validation = NEPQ_GUARDRAILS.validateContent(emailBody, currentStage)
if (!validation.valid) {
  // Block or fix
}

// Check if can advance
const canAdvance = NEPQ_GUARDRAILS.canAdvanceStage(
  currentStatus,
  'proposal_sent',
  { painIdentified: true, engagementScore: 65 }
)
```

---

## 📊 NEPQ STAGE → STATUS MAPPING

| NEPQ Stage | Allowed Statuses | Can Advance To |
|------------|------------------|----------------|
| CONNECTING | `new`, `contacted` | `follow_up_needed`, `interested` |
| ENGAGEMENT | `contacted`, `follow_up_needed` | `interested` |
| TRANSITION | `interested` | `proposal_sent` |
| PRESENTATION | `proposal_sent` | `negotiating`, `won` |
| COMMITMENT | `negotiating`, `won` | `won` (final) |

**Invalid Transitions:**
- Cannot skip stages (e.g., `new` → `proposal_sent`)
- Cannot go backwards (except to `not_interested` or `lost`)

---

## ✅ PHASE A NEPQ INTEGRATION CHECKLIST

### Meeting Tracking
- [ ] Validate NEPQ stage before allowing meeting
- [ ] Set meeting expectations based on current stage
- [ ] Prevent proposal meetings if discovery not complete

### Post-Meeting Workflow
- [ ] Check NEPQ criteria before allowing "Send Proposal"
- [ ] Validate status transitions using `canAdvanceStage()`
- [ ] Use NEPQ timing for follow-up tasks

### Proposal Creation
- [ ] Validate proposal language against NEPQ guardrails
- [ ] Pre-fill proposal with NEPQ-framed language
- [ ] Ensure proposal reflects problems/consequences, not features

### Deal Closing
- [ ] Use confirmation language (not persuasion)
- [ ] Validate NEPQ stage allows 'won'
- [ ] No pressure tactics

---

**NEPQ is now the spine. The system stops being a clever automation and becomes a controlled sales instrument.** 🎯

