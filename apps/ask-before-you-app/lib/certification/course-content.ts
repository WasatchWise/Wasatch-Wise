/**
 * NDPA Usage & Compliance Certification - Complete Course Content
 * Adapted from Utah's Canvas course for SDPC national deployment
 * 
 * Brand Colors (A4L Guidelines):
 * - Primary Blue: #005696
 * - Yellow: #FFC425
 * - Green: #00C389
 * - Orange: #FE5000
 * - Grey: #4D4D4F
 */

export interface Lesson {
  id: string
  title: string
  content: string
}

export interface ModuleBadge {
  emoji: string
  name: string
}

export interface CourseModule {
  id: number
  title: string
  subtitle: string
  duration: string
  badge: ModuleBadge
  lessons: Lesson[]
}

// Module 0: Foundations
export const MODULE_0: CourseModule = {
  id: 0,
  title: 'Foundations',
  subtitle: 'Why Privacy Protection Became Your Job',
  duration: '10 minutes',
  badge: { emoji: '🛡️', name: 'Privacy Guardian' },
  lessons: [
    {
      id: '0.1',
      title: 'The NDPA Genesis: Why This Matters',
      content: `
## The Year Was 2015...

Schools were racing to adopt educational technology. Google Chromebooks were flying off shelves. Every vendor promised to revolutionize learning. But there was a massive problem nobody was talking about yet...

### The Old Reality
- **13,000+ districts** negotiating separately
- **45+ days** per vendor agreement
- **$50K+** in legal fees per incident
- **Zero standardization** across states
- Teachers waiting **months** for critical apps

### Today's Solution
- **One standardized agreement**
- Same-day approvals possible
- Legal protection built-in
- Multi-state collaboration
- Teachers get tools **immediately**

---

## The Breaches That Changed Everything

### 2014: inBloom Collapses
$100M Gates Foundation project storing data on millions of students shuts down after parent revolt. Data included disciplinary records, family situations, even bathroom habits.

**LESSON:** Parents will fight when they discover what's being collected.

### 2019: The Banjo Scandal
Surveillance company secretly scraping students' social media. State discovers founder has hate group ties. $20.7M contract cancelled overnight.

**RESULT:** States become national leaders in privacy protection.

### 2020: Pandemic Privacy Panic
Overnight shift to remote learning. Proctoring software records students in bedrooms. AI flags "cheating" based on eye movements, skin color. ProctorU alone monitored 21 million exams.

**IMPACT:** EdTech adoption explodes 10x without privacy review.

### 2022: Illuminate Education Breach
3.1 million students exposed nationwide. NYC alone: 820,000 affected. Data included psychological evaluations, disability accommodations, disciplinary records dating back to 2016.

**REALITY:** Even "trusted" vendors can fail catastrophically.

### 2024: The AI Training Crisis
EdTech companies quietly updating terms to train AI on student work. Turnitin admits using 22 million student papers for AI training. Your students' essays becoming ChatGPT training data.

**NOW:** You're the last line of defense.

---

## What Exactly Is Student PII?

### Direct Identifiers
*One piece = instant identification*
- Full name
- Student ID number
- Social Security number
- Biometric data (fingerprints, face scans)
- Photos/videos of student
- Parent contact information

### Indirect Identifiers
*Combined = identification possible*
- Date & place of birth
- Race/ethnicity
- Grade level & school
- Schedule & activities
- IP addresses & device IDs
- Location data

### Educational Records
*The academic footprint*
- Grades & transcripts
- Test scores & assessments
- Attendance records
- Disciplinary actions
- Teacher observations
- Course enrollments

### Sensitive Data
*The most vulnerable info*
- IEPs & disability status
- Health & medical records
- Counseling notes
- Family economic status
- Foster care/homeless status
- English learner designation

### Behavioral/Meta Data
*The hidden tracking*
- Keystroke patterns
- Time spent on tasks
- Search queries
- Website visits
- App usage patterns
- Social interactions online

### AI Training Gold
*What AI companies want*
- Student essays & writing
- Problem-solving patterns
- Creative projects
- Voice recordings
- Video submissions
- Collaboration data

> **IMPORTANT:** Even "anonymized" data can be re-identified. MIT researchers re-identified 90% of "anonymous" individuals using just 4 data points.

---

## What Students Actually Fear

### Their Struggles Becoming Permanent
That D in algebra following them to job applications years later

### Their Creativity Being Stolen
Essays and artwork training AI without credit or payment

### Their Privacy Being Weaponized
Mental health support used against them in custody battles

### Their Future Being Limited
Algorithm deciding they're "not college material" in 6th grade

**The psychological toll is real:**
- 87% of students report anxiety about school surveillance
- 24% self-censor online resources
- 17% alter what they say online

The chilling effect stifles learning and self-discovery during critical developmental years.

---

## Your New Superpower

In 50 minutes, you'll go from **overwhelmed to empowered**. From **confused to confident**. From **liability to leader**.

Let's build your privacy shield. Your students are counting on it.
      `,
    },
    {
      id: '0.2',
      title: 'The Business Case: Your ROI Story',
      content: `
## From Crisis to Solution

Remember those breaches and scandals from the previous lesson? Here's how educators fought back...

---

## The Birth of a Movement: SDPC to NDPA

### 2016: Student Data Privacy Consortium (SDPC) Forms
13 pioneering states say "enough." They pool resources, share legal expertise, and begin crafting common privacy language.

### 2014-2018: State-Specific DPAs Emerge
California AB-1584 (2014), Connecticut PA 16-189, Massachusetts laws each create their own. 
**Problem:** Vendors now juggling 13+ different agreements.

### 2019: NDPA Version 1.0 Launches
The breakthrough: **ONE agreement** that works across states. 1,000+ districts provide feedback. Game changer.

### 2024: NDPA Version 2.1 - The Current Standard
Refined through 5 years of real-world use. 28 state alliances involved. Now protecting millions of students across 30+ states.

---

## The Three Flavors of NDPA v2.1

Think of the NDPA like ordering at your favorite soda shop...

### 🟢 STANDARD AGREEMENT
*"Just a Regular Coke, Please"*

Straight from the fountain. No modifications. No mix-ins. No special requests. Walk in, say "Coke," walk out. This is the **NDPA holy grail**.

**EXHIBIT E MAGIC:** Vendor signs once, EVERY district gets unlimited refills! Like one syrup box serving 100 schools. Same Coke, instant service, everyone's happy.

### 🟡 VENDOR-SPECIFIC AGREEMENT
*"Make It Dirty" (Coconut Cream + Lime)*

The classic twist. Vendor wanted coconut cream and lime added. Your Alliance said "sure, that's still reasonable." All changes documented in Exhibit H.

**EXHIBIT E STILL WORKS:** Other districts can order the same "dirty" version! We can batch-make dirty Cokes. Everyone knows what they're getting.

### 🔴 DISTRICT-MODIFIED AGREEMENT
*Your Secret Menu Frankensoda*

"I need 70% Dr Pepper, 30% Mountain Dew, two pumps vanilla, one pump caramel, coconut cream, lime juice, raspberry puree, extra pebble ice, light carbonation, in a 44oz cup with exactly 3 straws..."

Look, we'll make it for you, but this is YOUR thing. Nobody else wants this.

**NO EXHIBIT E:** Can't share your weird creation. Other districts have to start over. Every district has to wait in line for their own custom order.

> **THE LESSON:** Keep it simple. Order the regular Coke when you can. Your teachers get their tools faster, legal saves money, and nobody has to explain why you need three different fruit syrups in your data privacy agreement.

---

## The Genius of Exhibit E

### Without Exhibit E:
- 100 districts = 100 negotiations
- 100 × $77K = **$7.7M wasted**
- 100 × 45 days = **12 years** of waiting

### With Exhibit E:
- 1 negotiation + 99 subscriptions
- $77K cost becomes **$770 per district**
- **Same-day approvals** for subscribers

### The Math:
- Average legal review: **$50K-$100K** per district contract (we use $77K average)
- Average negotiation time: **45 days** per contract
- With just 50 participating LEAs: 50 × $77K = **$3,850,000 saved** per major vendor

> **NOTE:** SDPC Alliance membership provides access to the National DPA Registry at no additional cost per agreement.

---

## Your District's Projected Impact

| Metric | Value |
|--------|-------|
| 💰 **Saved Annually** | $77K (per vendor agreement) |
| 📈 **ROI on Training** | 962% ($800 training vs $77K savings) |
| ⏱️ **Time Reduction** | 44 days → Minutes (with Exhibit E) |

**Every Standard Agreement you process pays for this training 38 times over.**
      `,
    },
  ],
}

// Module 1: Document Anatomy & Classification
export const MODULE_1: CourseModule = {
  id: 1,
  title: 'Document Anatomy & Classification',
  subtitle: 'Learn to vet agreements by analyzing key components',
  duration: '12 minutes',
  badge: { emoji: '📋', name: 'Classification Specialist' },
  lessons: [
    {
      id: '1.1',
      title: 'Anatomy of an NDPA',
      content: `
## What a "Perfect" Green Light NDPA Looks Like

When you originate a new agreement, this is your goal. A "Green Light" NDPA is a standard, unmodified v2.1 document, correctly filled out and signed by the vendor.

Let's break down the **six critical checkpoints:**

---

## ✅ Checkpoint 1: The Legal Handshake

**What to Look For:** Verify the full, correct legal names and addresses for both your Local Education Agency (LEA) and the Provider.

> "An agreement with the wrong legal party is like sending a certified letter to the wrong address—it has no legal effect."

**Why It Matters:** This simple verification ensures the entire contract is valid and enforceable.

---

## ✅ Checkpoint 2: The Point of Commitment

**What to Look For:** A simple two-part check:
- The Provider's signature section is **COMPLETE** (signature, name, title, date)
- Your LEA signature section is **BLANK**

> "The vendor must always sign first. This is their legally binding promise to uphold the terms."

**Why It Matters:** Your signature should be the final step that accepts their offer and officially activates the contract.

---

## ✅ Checkpoint 3: Defining the Scope

**What to Look For:** The specific, official name of the product your teacher requested (e.g., "MathWiz Reading App v3.0," not just "MathWiz").

> "Ambiguity is your enemy. If the product isn't listed by name, this DPA does not cover it."

**Why It Matters:** This prevents a vendor from later claiming, "Oh, the DPA covers our old platform, not the new one your teacher is using."

---

## ✅ Checkpoint 4: The Data Inventory

**What to Look For:** A fully completed grid where the vendor declares every single student data element their product collects, marking each as Required (R) or Optional (O).

> "Think of this as the vendor's 'data ingredients list.' Your signature gives them permission to collect everything on it."

**Why It Matters:** This is arguably the most important exhibit for you to critically review.

**APPLY DATA MINIMIZATION:** *"Is every piece of data listed here truly necessary for the tool's educational purpose?"*

---

## ✅ Checkpoint 5: The "Piggybacking" Clause (Exhibit E)

**What to Look For:** For a Standard "Green Light" NDPA, the Provider must sign this 3-page exhibit. This creates the "General Offer."

> "The vendor's signature here turns your single agreement into a reusable resource for every other district in the state."

**Your Protocol:**
- **VETTING:** Verify all fillable information across all three pages is completed
- **UPLOADING:** Requires two separate files:
  - The Full NDPA: Complete signed agreement including Exhibit E
  - Exhibit E Standalone: Separate PDF with ONLY the three pages of Exhibit E

---

## ✅ Checkpoint 6: The State Compliance Check (Exhibits G & H)

**What to Look For:** Your final check for state-level compliance and modifications.

**FOR "GREEN LIGHT" STATUS:**
- Exhibit G (State Terms) is fully completed with Subprocessors link and Employee Data table
- Exhibit H (Modifications) is completely blank or states "None"

**Why It Matters:** This confirms the vendor has agreed to your state's laws with absolutely no changes to standard clauses.
      `,
    },
    {
      id: '1.2',
      title: 'Vetting Modified Agreements',
      content: `
## The Traffic Light System: Your Mental Model for Risk

You know what a perfect "Green Light" NDPA looks like. But what happens when a vendor returns an agreement that's been changed? This is where your most critical skill—**classification**—comes into play.

> "Classification isn't just about paperwork—it's about protecting students from real-world data breaches and privacy violations."

---

## 🚦 The Traffic Light System

### 🟢 GREEN LIGHT: GO
- Standard, unmodified NDPA
- Safe to proceed immediately

### 🟡 YELLOW LIGHT: CAUTION
- Modified agreement (changes in Exhibit H)
- Verify changes before proceeding

### 🔴 RED LIGHT: STOP
- Problematic or invalid document
- Reject and do not sign

---

## Understanding Exhibit H: Yellow vs. Red Changes

Exhibit H is the **ONLY acceptable place** for modifications. But not all changes in Exhibit H are equal. Some we can work with (Yellow Light), others are deal-breakers (Red Light).

---

## 🟡 YELLOW LIGHT: Changes We Can Negotiate

### ✓ Data Retention Periods
Vendor wants to keep data for 60 days instead of 30 after contract ends.

### ✓ Technical Implementation Details
Specific encryption standards, backup procedures, or security protocols.

### ✓ Notification Timelines
Breach notification within 48 hours instead of 24 hours (if still reasonable).

### ✓ Service-Specific Clarifications
How their specific platform handles parent access requests.

**ACTION:** Forward to legal for review

---

## 🔴 RED LIGHT: Changes We Never Accept

### ❌ Limiting Your Right to Audit
ANY modification to audit rights. This is protected by state statute.

### ❌ Weakening Liability or Indemnification
Capping damages, limiting liability, or shifting responsibility to the LEA.

### ❌ Data Ownership Changes
Claiming any ownership or license to student data beyond service provision.

### ❌ Modifying State Terms (Exhibit G)
Any changes to state-specific requirements, especially audit provisions.

**ACTION:** Reject immediately

---

## 🚨 Immediate Red Flags (Changes Outside Exhibit H)

If you see ANY of these, it's an immediate Red Light - **STOP and REJECT:**

### ❌ Crossed-Out Clauses in Main Document
Vendor has struck through, crossed out, or deleted text in the main agreement clauses (Articles I-VII).

### ❌ Handwritten Changes or Margin Notes
Any handwritten modifications, additions, or notes anywhere in the document.

### ❌ Missing Critical Exhibits
Vendor deleted or didn't include required exhibits (especially Exhibit A - Data Elements or Exhibit E - General Offer).

### ❌ Wrong Version or Template
Vendor used an old version (not v2.1), their own DPA template, or a template from another state.

### ❌ Added Limiting Language
Vendor inserted phrases like "subject to our Terms of Service" or "as amended from time to time" anywhere.

### ❌ Unsigned or Improperly Signed
No vendor signature, digital stamp instead of signature, or LEA already signed before vendor.

---

## Quick Decision Guide

| Signal | Action |
|--------|--------|
| 🟢 Green | Sign it |
| 🟡 Yellow | Escalate it |
| 🔴 Red | Reject it |

> **REMEMBER:** If changes exist OUTSIDE of Exhibit H = RED LIGHT. The ONLY acceptable place for modifications is Exhibit H. Period.
      `,
    },
  ],
}

// Module 2: The Standardized DPA Workflow
export const MODULE_2: CourseModule = {
  id: 2,
  title: 'The Standardized DPA Workflow',
  subtitle: 'Transform Chaos into Confidence with a Proven System',
  duration: '12 minutes',
  badge: { emoji: '🔍', name: 'DPA Detective' },
  lessons: [
    {
      id: '2.1',
      title: 'The Standardized DPA Workflow',
      content: `
## When Teachers Need Apps NOW

### Sound Familiar?
"Hey, I need MathWiz Pro approved ASAP - my class starts using it Monday!"

"The vendor says we just need to click 'agree' to their terms. That's fine, right?"

"It's free and other districts use it. Can you just approve it quickly?"

Each request triggers the same critical decision: Do we already have protection in place, or do we need to secure it?

---

## Two Ways This Can Go...

### WITHOUT A PROCESS:
- Panic-search through emails
- Wonder if legal approved something similar
- Tell teacher "I'll look into it" (they hear "no")
- Vendor sends 47-page terms of service
- 3 weeks later... still waiting

**Result:** Frustrated teachers, risky workarounds

### WITH THE PROCESS:
- Check two specific sources (10 min)
- Follow your decision tree
- Give teacher immediate status update
- Execute Path A or B with confidence
- Resolution in hours, not weeks

**Result:** Happy teachers, protected students

---

## Your Strategic Decision Framework

### STEP 1: THE TWO-SOURCE CHECK
Every request starts here. These searches determine your entire path:
1. **State Application Menu** - Your state's pre-approved list
2. **National SDPC Registry** - Nationwide agreement database

> "This 10-minute search can save you 3 hours of back-and-forth with vendors."

---

## PATH A: AGREEMENT FOUND (~75% of requests)

**Your 10-Minute Process:**
1. Find agreement in registry
2. Verify it's Green Light
3. Log into SDPC's Auto Exhibit E Creator
4. Click "Subscribe"
5. Email teacher: "Approved!"

**Time to approval: 10 minutes**

---

## PATH B: NO AGREEMENT YET (~25% of requests)

**Your First Contact Protocol:**
1. Open proven email template
2. Attach NDPA package
3. Send to vendor contact
4. Update teacher on status
5. Track in your system

**Time to initiate: 10 minutes**

---

## Your Essential Resources:
- **State Application Menu:** Your state's pre-approved list
- **SDPC Registry:** National agreement database
- **Email Template:** Proven vendor outreach

*Next: See this process in action with real examples*
      `,
    },
    {
      id: '2.2',
      title: 'Guided Analysis: Mastering the Registry',
      content: `
## Registry Navigation: Discerning Real Protection from Empty Promises

> "Discernment means knowing the difference between a marketing badge and legal protection."

---

## I DO: Watch Me Navigate with Discernment

### LEA-ORIGINATED AGREEMENTS (Most Common)
Your first stop: State Application Menu

**What to Look For:**
- Originating LEA name (who did the work)
- Agreement status (Green/Yellow/Red)
- If it's GREEN → Log in to SDPC to subscribe via the Auto Exhibit E Creator

### STATEWIDE AGREEMENTS (Pre-Approved)
Products from your State Education Agency (Canvas, Nearpod, Adobe, etc.)

**Quick Add Process:**
1. Login to SDPC Registry
2. Your District Agreements → Add New → OTHER
3. Select RESOURCE from dropdown
4. Choose correct AGREEMENT VERSION
5. Enter metadata → Submit

### NO AGREEMENT FOUND (Requires Discernment)
Check other states' agreements for reference before reaching out

**Research Before Contact:**
- Which states have agreements?
- Standard or Vendor-Specific?
- What's in their Exhibit H?
- Contact email in Exhibit E?

---

## CRITICAL: Badges vs. Binding Agreements

### ❌ PRIVACY PLEDGE / iKeepSafe Badge:
- Marketing promise
- NOT legally binding
- NO enforcement power
- **ACTION: Seek NDPA**

### ✅ SIGNED NDPA/DPA:
- Legal contract
- Binding obligations
- Full protection
- **ACTION: Approve**

---

## YOU DO: The Discernment Challenge

Time to practice your discernment skills. You'll investigate a vendor and determine the best path forward.

### Your Investigation Mission:

**Scenario:** A teacher requests "SuperLearn" (or choose a product that has been requested in your LEA)

1. **First Check:** Is it in the State Application Menu?
   (If no, proceed to SDPC Registry)

2. **Registry Search:** Find at least 2 states with agreements
   Document: State name, Agreement type, Expiration date

3. **Discernment Questions:**
   - Is it Standard (Green) or Vendor-Specific (Yellow)?
   - What products are listed in Exhibit A?
   - What data elements in Exhibit B concern you?
   - If Yellow, what's modified in Exhibit H?

4. **Contact Discovery:** Find the vendor email in Exhibit E
   This is your point of contact if you need to initiate

5. **Decision Point:**
   Based on your research, would you:
   - Initiate your own NDPA request?
   - Recommend an alternative product?

*This exercise builds your discernment muscle—the ability to quickly assess and decide*

---

## Discernment Checkpoint

You can now distinguish between real protection and empty promises. You know where to look, what to look for, and how to decide.
      `,
    },
  ],
}

// Module 3: Registry Ninja
export const MODULE_3: CourseModule = {
  id: 3,
  title: 'Registry Ninja: Advanced Problem-Solving',
  subtitle: 'Master Advanced Search When Simple Searches Fail',
  duration: '12 minutes',
  badge: { emoji: '🥷', name: 'Registry Ninja' },
  lessons: [
    {
      id: '3.1',
      title: 'The Ninja Toolkit: Advanced Search Techniques',
      content: `
## When Basic Search Comes Up Empty

> "A detective finds what's there. A ninja finds what's hidden."

---

## Case Study: The Vanishing Vendor Mystery

**The Request:** "We need Flipgrid for video discussions!"

**The Problem:** Searching "Flipgrid" returns zero results.

**The Detective:** Gives up, tells teacher "not available."

### THE NINJA SOLUTION:
- Knows Flipgrid was acquired by Microsoft
- Searches "Microsoft" instead
- Finds the agreement that covers ALL Microsoft education products, including Flipgrid
- Teacher gets approval in 5 minutes

---

## Your Ninja Search Arsenal

### 🔮 WILDCARD MASTERY (*)
The asterisk (*) is your expansion tool. Can't find "Edpuzzle"? Try "Ed*" to catch variations.

**Example:** Micro* finds Microsoft, Microbit, Microphone apps

### 🔗 BOOLEAN OPERATORS
Combine terms with AND/OR logic to cast a wider net or narrow results precisely.

**Example:** (Google OR Alphabet) AND Classroom

### 🎯 SMART FILTERING
Use state, date, and type filters to find relevant agreements when drowning in results.

**Example:** Filter by "Your State" + "Last 6 months"

### 🏢 PARENT COMPANY INTEL
Many apps get acquired. Quick Google search: "[App name] parent company" reveals the truth.

**Example:** Flipgrid → Microsoft, Clever → Kahoot

### ✏️ EXACT SPELLING
Your search field might be very strict. Often the Exhibit E search asks for exact spelling to find the correct product.

**Example:** Class Dojo vs ClassDojo

---

## The Ninja Mindset

> "Zero results doesn't mean 'not available.' It means 'search differently.'"

Every vendor is findable if you know how to look.

*Next: The 5-Step Protocol for solving any edge case*
      `,
    },
    {
      id: '3.2',
      title: 'The 5-Step Protocol for Edge Case Mastery',
      content: `
## The 5-Step Ninja Protocol & Parental Consent

> "When your toolkit doesn't find an answer, you don't guess—you follow the protocol."

---

## The Edge Case Elimination & Parental Consent Protocol

### STEP 1: EXHAUST ALL SEARCH TECHNIQUES
Wildcards, Boolean, filters, parent company research. Document what you tried.

### STEP 2: ASSESS DATA SENSITIVITY
What data will be shared? Names only? Full records? Behavioral data?

### STEP 3: APPLY RISK-BASED DECISION
Low risk → Conditional approval. High risk → Escalate or reject.

### STEP 4: DOCUMENT EVERYTHING
Create a paper trail: searches tried, vendor responses, your rationale.

### STEP 5: SET FOLLOW-UP REMINDERS
Calendar reminder to check for updates, compliance, or re-evaluate.

---

## Common Edge Cases & Ninja Solutions

### "ABSOLUTELY ZERO RESULTS"
**Situation:** Tried everything. Vendor is a ghost.

**NINJA MOVE:** Email vendor directly with NDPA package. Give 5-day deadline. No response = inform teacher it's unavailable.

### "EXPIRED AGREEMENT FOUND"
**Situation:** Agreement expired 6 months ago.

**NINJA MOVE:** Expired = proof they'll sign! Attach old agreement, request new v2.1 signature.

### "ONLY CALIFORNIA HAS IT"
**Situation:** California DPA exists, no agreement for your state.

**NINJA MOVE:** Send your state's NDPA with model email language to the provider email address located on Exhibit E.

### "PRODUCT GOT RENAMED"
**Situation:** ClassFlow is now Promethean.

**NINJA MOVE:** Check agreement for "successor products" language. Get written confirmation new name is covered.

---

## Written Parental Consent Best Use Cases:
- Minimal PII collected
- Great for small pilot programs
- Great for use in afterschool clubs as part of sign-up
- Short-term use (< 30 days)

*Written Parental Consent is revokable.*

---

## Protocol Learned. Time to Practice.

*Next: Apply your ninja skills in real-world scenarios*
      `,
    },
  ],
}

// Module 4: Vendor & Crisis Mastery
export const MODULE_4: CourseModule = {
  id: 4,
  title: 'Vendor & Crisis Mastery',
  subtitle: 'Create New Agreements & Handle High-Pressure Situations',
  duration: '10 minutes',
  badge: { emoji: '👑', name: 'DPA Master' },
  lessons: [
    {
      id: '4.1',
      title: "The DPA Originator's Playbook",
      content: `
## Becoming the Originator: When You Create the Path

> "You're not just getting one agreement. You're creating a statewide solution that 100+ districts can use instantly."

---

## The Originator's Opportunity

**Scenario:** A teacher desperately needs an app. No agreement exists anywhere.

You could say "sorry, not available"... or you could become the hero who creates the agreement for everyone.

This lesson teaches you to create agreements vendors will actually sign.

---

## The 4-Step Origination Process

### STEP 1: THE STRATEGIC FIRST CONTACT

Your opening email sets the tone. Too aggressive = ignored. Too weak = endless negotiation.

**What You'll Send:**
- Professional request (template provided)
- Blank NDPA v2.1 attached
- Clear 10-business-day deadline

### STEP 2: THE EXHIBIT E POWER MOVE

Most vendors don't understand they're getting access to 100+ districts with one signature. You need to explain this clearly.

> "By signing Exhibit E, you're not just working with our district. You're creating a pre-approved agreement that ANY district in our alliance can adopt instantly. That's 100+ potential customers with zero additional legal work."

This transforms you from "annoying requirement" to "business opportunity"

### STEP 3: THE PRESSURE RESPONSE SCRIPTS

Vendors will push back. They always do. Don't debate—use proven scripts that work.

**They say:** "Just use our terms"
**You say:** Script #1 (State law requirement)

**They say:** "We need changes"
**You say:** Script #2 (Exhibit H explanation)

**They say:** "This is too complex"
**You say:** Script #3 (Simplification offer)

### STEP 4: SUBMIT FOR STATEWIDE REGISTRY

Once signed, submit the agreement to make it available for all districts in your alliance.

- You become the originator hero!
- Your name appears as the originator
- Other districts can piggyback with one click

*Next: Handle crisis situations and emergency protocols*
      `,
    },
    {
      id: '4.2',
      title: 'The Crisis Response Protocol',
      content: `
## Crisis Management: Your Emergency Response Playbook

It's Monday morning. You just discovered what happened over the weekend...

---

## CRISIS #1: THE SHADOW IT DISCOVERY

> "My husband came in Sunday to set up CoolMathApp for my class. He's in IT, so he made accounts for all 30 kids. They're logging in right now!"

**Shadow IT Alert:** Unauthorized deployment, active student use, no DPA

### FIRST 60 MINUTES:
- Don't panic or blame the teacher
- Document: app name, number of students, data collected
- Check if any DPA exists (emergency search)
- If no DPA: prepare containment plan

### IMMEDIATE COMMUNICATION:
"Thank you for letting me know. I need to verify data protection compliance. Please pause new activities while I investigate. Students can continue current work."

### RESOLUTION PATH:
- If low-risk data: Emergency vendor contact
- If high-risk data: Immediate suspension
- Document everything for compliance audit

---

## CRISIS #2: THE BREACH NOTIFICATION

Email from vendor: "We experienced a security incident affecting your district's data..."

### Hour 1-2:
- Notify IT Security
- Notify Legal Counsel
- Document breach details

### Hour 2-24:
- Assess scope of breach
- Prepare parent notification
- Connect with state authorities

---

## CRISIS #3: THE "TESTING TOMORROW" EMERGENCY

Director: "State testing starts tomorrow. We MUST have TestPrepPro working by 8am!"

### EMERGENCY DEPLOYMENT PROTOCOL:

1. **Assess:** Is this truly state-mandated?
   - If it's STATE mandated, odds are the product has a STATEWIDE agreement
   - Check the Application Menu
   - Add to registry

2. **If not...**
   - **Contact:** Emergency vendor outreach with deadline
   - **Document:** Get Director's written authorization
   - **Deploy:** If approved, with restrictions
   - **Follow-up:** Complete full DPA within 72 hours

---

## CRISIS #4: THE LEGAL THREAT

Vendor: "If you don't sign our terms immediately, we'll pursue legal action for breach of contract."

### NEVER NEGOTIATE UNDER THREAT:
- Forward to legal counsel immediately
- Document all communications
- Do NOT sign anything under pressure
- Prepare alternative solution for teachers

---

## CRISIS #5: THE DEFIANT DEPLOYMENT

Teacher: "I don't care what you say. Other districts use it. I'm using it anyway."

### PROFESSIONAL ESCALATION:
- Document the refusal in writing
- Inform their department head
- Explain liability risks
- Offer compliant alternatives
- If continues: follow local policies and procedures

---

## Your Crisis Response Checklist

### DOCUMENT EVERYTHING:
- Screenshots
- Email chains
- Phone call notes
- Timeline of events

### KNOW YOUR ESCALATION:
- IT Security team
- Legal counsel
- State privacy professionals
- PR/Communications

### STAY PROFESSIONAL:
- No blame game
- Focus on solutions
- Communicate clearly
- Follow protocol

> "In crisis, your calm professionalism protects both students and your district."

*Ready to prove your mastery of all four modules?*
      `,
    },
  ],
}

// Export all modules
export const COURSE_MODULES: CourseModule[] = [
  MODULE_0,
  MODULE_1,
  MODULE_2,
  MODULE_3,
  MODULE_4,
]

// Course completion content
export const COURSE_COMPLETION = {
  title: 'Key Takeaways & Course Completion',
  subtitle: 'Thank you for your commitment to protecting student data.',
  content: `
## Your Transformation Is Complete

> "You started uncertain. You finish unstoppable."

---

## Your Four Pillars of Mastery

### ⚡ LIGHTNING-FAST APPROVALS
Transform 3-hour vendor struggles into 10-minute victories using the SDPC Registry's piggyback power.
**Time Saved: 95%**

### 🚦 INSTANT RISK ASSESSMENT
Master the Traffic Light System to classify any agreement in seconds: Green (go), Yellow (review), Red (stop).
**Decision Speed: 30 seconds**

### 🥷 EDGE CASE ELIMINATION
Deploy Ninja techniques to find hidden agreements and solve "impossible" vendor challenges.
**Success Rate: 98%**

### 🚨 CRISIS COMMAND
Execute proven protocols for Shadow IT discoveries, data breaches, and vendor pressure tactics.
**Response Time: 60 minutes**

---

## Your Complete DPA Toolkit

- **Email Templates:** First contact & follow-ups
- **Vendor Scripts:** Professional pushback responses
- **Crisis Protocols:** Shadow IT & breach response
- **Decision Trees:** 10-minute approval paths

---

## Welcome to the Elite

You are now among the most skilled student data privacy professionals. Lead with confidence. Protect with authority. Serve with distinction.

### 🎓 DPA MASTER CERTIFIED
  `,
}
