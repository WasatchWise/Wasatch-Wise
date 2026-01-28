# 🎯 Groove NEPQ Sales Guide

## **Quick Start: Using NEPQ with Groove Knowledge Base**

This guide shows you how to use the integrated NEPQ framework and Groove knowledge base to create high-converting sales emails and conversations.

---

## 🚀 **Quick Example**

```typescript
import { generateGrooveNEPQEmail } from '@/lib/groove/email-generation'
import { mapProjectToGrooveSolutions } from '@/lib/groove/knowledge-base'

// 1. Map project to Groove solutions
const solutionMapping = mapProjectToGrooveSolutions({
  projectType: ['hotel', 'hospitality'],
  projectStage: 'pre_construction',
  unitCount: 200,
  amenities: ['EV parking', 'smart building']
})

// 2. Generate NEPQ-aligned email
const email = await generateGrooveNEPQEmail({
  contact: {
    first_name: 'John',
    title: 'Project Manager',
    role_category: 'decision_maker'
  },
  project: {
    project_name: 'Marriott Downtown SLC',
    project_type: ['hotel'],
    project_stage: 'pre_construction',
    units_count: 200,
    amenities: ['EV parking']
  },
  nepqContext: {
    isFirstContact: true,
    hasResponded: false,
    engagementLevel: 'low',
    painIdentified: false,
    solutionPresented: false
  }
})

// Result: Email with NEPQ stage, alignment score, value props, etc.
console.log(email.nepqStage) // 'connecting'
console.log(email.groovValueProps) // ['One Partner', 'Groove Guarantee']
console.log(email.nepqAlignmentScore) // 85/100
```

---

## 📋 **The NEPQ Five Stages for Groove**

### **Stage 1: Connecting** (First Contact)

**Goal:** Lower resistance, build trust

**Groove Approach:**
- Mention specialization in their industry
- Use neutral, non-salesy language
- Ask permission-based questions

**Example:**
```
Subject: Quick question about Marriott Downtown SLC

Hi John, I noticed Marriott Downtown SLC is in pre-construction. 
Groove specializes in hotel technology solutions, and I'm curious 
about your approach to the technology infrastructure.

Would you be open to a quick 15-minute conversation this week?
```

**Value Props to Use:**
- Specialization in experience-critical properties
- Industry expertise (awards, certifications)

---

### **Stage 2: Engagement** (Discovery)

**Goal:** Uncover pain points and challenges

**Groove Approach:**
- Ask discovery questions about vendor management
- Understand code compliance concerns
- Identify technology expectations

**Example:**
```
Subject: Curious about your technology approach

Hi John, I'm curious - what challenges are you facing with the 
technology stack for Marriott Downtown SLC?

Many hotel owners struggle with:
- Vendor sprawl and coordination headaches
- Code compliance and inspection risks
- Meeting guest technology expectations

I'd love to learn more about your specific situation.
```

**Pain Points to Surface:**
- Vendor sprawl
- Code risk (ERCES, fire alarms)
- Resident/guest expectations
- Staff overload

---

### **Stage 3: Transition** (Consequence & Urgency)

**Goal:** Create emotional gap, visualize cost of inaction

**Groove Approach:**
- Use loss framing (cost of delay)
- Highlight code compliance risks
- Link to identity/status (professional reputation)

**Example:**
```
Subject: The cost of waiting on Marriott Downtown SLC

Hi John, What's the cost - not just financial, but in time, 
stress, and missed opportunities - of delaying technology 
infrastructure decisions?

Many properties face:
- Failed occupancy permits due to missing ERCES
- Delayed openings impacting revenue
- Competitive disadvantage from outdated technology

If this problem were solved, who would that make you in your 
organization's eyes?
```

**Value Props to Use:**
- Future-ready design (prevents costly retrofits)
- Code compliance (ERCES, fire alarms)

---

### **Stage 4: Presentation** (Solution Alignment)

**Goal:** Frame Groove as the natural answer

**Groove Approach:**
- Link solutions to their stated needs
- Mention 2-3 relevant products max
- Include social proof (awards, similar projects)
- Emphasize "one partner" value

**Example:**
```
Subject: How we've helped similar hotel properties

Hi John, Based on what you've shared about Marriott Downtown SLC, 
here's how Groove can help:

- Structured Cabling & Infrastructure
- DIRECTV Property Solutions
- Managed Wi-Fi Services

Our approach:
- One partner for your entire technology stack
- The Groove Guarantee: On Time, On Scope, On Budget, On Going
- Deep expertise in hotel technology (AT&T Dealer of the Year)

Would you like to see how we've helped similar properties?
```

**Value Props to Use:**
- One Partner (vendor consolidation)
- Groove Guarantee (risk mitigation)
- Specialization (industry expertise)

---

### **Stage 5: Commitment** (Natural Close)

**Goal:** Secure decision through consistency

**Groove Approach:**
- Use consistency check-ins
- Provide options (choice architecture)
- Reinforce with Groove Guarantee
- Low-friction CTA

**Example:**
```
Subject: Next steps for Marriott Downtown SLC

Hi John, Does this approach make sense for Marriott Downtown SLC?

The Groove Guarantee ensures:
- On Time: We commit to the agreed schedule
- On Scope: What we promise is what you get
- On Budget: The number you sign is the number you pay
- On Going: Long-term support after install

If we fail and it's our fault, we make it right with a $500 gift card.

What would you like to do next?
```

**Value Props to Use:**
- Groove Guarantee (all four pillars)
- $500 make-good (risk elimination)

---

## 🎯 **Project-to-Solution Mapping**

The system automatically maps projects to Groove solutions:

```typescript
import { mapProjectToGrooveSolutions } from '@/lib/groove/knowledge-base'

const mapping = mapProjectToGrooveSolutions({
  projectType: ['hotel'],
  projectStage: 'pre_construction',
  unitCount: 200,
  amenities: ['EV parking']
})

// Returns:
// - recommendedProducts: ['structured_cabling', 'directv', 'managed_wifi', ...]
// - discoveryQuestions: ['What's your timeline for...', ...]
// - valuePropsToLead: ['one_partner', 'groove_guarantee']
```

**Mapping Rules:**

| Project Type | Stage | Recommended Products |
|-------------|-------|---------------------|
| Hotel | Pre-Construction | Structured Cabling, DIRECTV, Wi-Fi, Access Control, ERCES |
| Multifamily | Planning | Della OS, Smart Locks, Wi-Fi, Self-Guided Tours, EV Charging |
| Senior Living | Design | Cellular DAS, ERCES, Leak Detection, Wi-Fi, Fall Detection |
| Student Housing | Construction | Della OS, Wi-Fi, Smart Locks, Self-Guided Tours |

---

## 💬 **Objection Handling with NEPQ**

```typescript
import { getGrooveObjectionHandling } from '@/lib/groove/nepq-integration'

const handling = getGrooveObjectionHandling(
  "It's too expensive",
  NEPQStage.PRESENTATION
)

// Returns:
// - validation: "I appreciate you sharing that. Cost is always important."
// - exploration: "Help me understand - what specifically concerns you?"
// - reframe: "What's the cost of maintaining the status quo?"
// - valueProp: "The Groove Guarantee ensures On Budget..."
```

**Common Objections:**

1. **Price/Cost**
   - Validate → Explore → Reframe (cost of inaction) → Groove Guarantee

2. **Timing/Not Ready**
   - Validate → Explore → Reframe (cost of delay) → ERCES code risk

3. **Vendor/Trust**
   - Validate → Explore → Reframe (one partner) → Groove Guarantee + $500

4. **Already Have Solution**
   - Validate → Explore → Reframe (vendor consolidation) → One Partner value

---

## 📊 **NEPQ Alignment Scoring**

Every email gets an NEPQ alignment score (0-100):

- **90-100:** Excellent NEPQ alignment
- **70-89:** Good alignment, minor improvements possible
- **50-69:** Needs work, review language patterns
- **Below 50:** Not NEPQ-aligned, rewrite needed

**Factors:**
- Stage-appropriate language patterns
- Avoids high-pressure words
- Uses permission-based questions
- Loss framing (for transition stage)
- Neutral, consultative tone

---

## 🧠 **Behavioral Economics Integration**

The system automatically applies:

1. **Loss Aversion** - Frames inaction as loss (transition stage)
2. **Social Proof** - Mentions awards, similar projects (presentation stage)
3. **Authority** - References expertise, certifications
4. **Scarcity** - Only if genuine (timing, opportunity)
5. **Reciprocity** - Provides value first (insights, questions)
6. **Choice Architecture** - Provides options, not single mandate

---

## 🎨 **Email Tone by Stage**

| Stage | Tone | Language Patterns |
|-------|------|------------------|
| Connecting | Neutral, Curious | "Would you be open to...", "I'm curious about..." |
| Engagement | Consultative | "Tell me about...", "What challenges are you facing..." |
| Transition | Consequence | "What happens if...", "What's the cost of..." |
| Presentation | Solution-Focused | "Based on what you've told me...", "Here's how we've helped..." |
| Commitment | Consistency | "Does this make sense?", "What would you like to do next?" |

---

## 📚 **Key Resources**

### **Groove Knowledge Base**
- `lib/groove/knowledge-base.ts` - Complete product catalog, value props, pain points
- `lib/groove/nepq-integration.ts` - NEPQ strategy generation
- `lib/groove/email-generation.ts` - Email generation with NEPQ

### **NEPQ Framework**
- `lib/nepq/framework.ts` - Stage definitions and validation
- `lib/nepq/questions.ts` - 273+ question library

### **Documentation**
- `NEPQ_INTEGRATION.md` - Complete NEPQ methodology
- `GROOVE_NEPQ_GUIDE.md` - This guide

---

## 🚀 **Next Steps**

1. **Test Email Generation**
   ```typescript
   const email = await generateGrooveNEPQEmail({...})
   console.log(email.nepqAlignmentScore)
   ```

2. **Review NEPQ Alignment**
   - Check `languageValidation.issues`
   - Review `languageValidation.suggestions`
   - Aim for 85+ alignment score

3. **Iterate Based on Results**
   - Track open rates by NEPQ stage
   - Measure response rates
   - A/B test variants

---

## 💡 **Pro Tips**

1. **First Contact = Connecting Stage**
   - Always start with permission-based questions
   - Never lead with product features
   - Focus on their project, not your solution

2. **Spend 85% on Engagement + Transition**
   - Most time should be discovery and consequence
   - Don't rush to presentation
   - Build emotional commitment first

3. **Use Groove Guarantee Strategically**
   - Best in Presentation/Commitment stages
   - Addresses trust/risk objections
   - Differentiates from competitors

4. **Map Products to Pain Points**
   - Vendor sprawl → One Partner
   - Code risk → ERCES, Fire Alarm
   - Resident expectations → Della OS, Smart Building
   - Staff overload → Automation, Self-Guided Tours

5. **Loss Framing > Gain Framing**
   - "Cost of delay" > "Benefits of moving forward"
   - "Failed inspections" > "Code compliance"
   - "Missed opportunities" > "Revenue potential"

---

**Questions?** See `NEPQ_INTEGRATION.md` for complete methodology details.

