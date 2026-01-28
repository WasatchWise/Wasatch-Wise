# DAiTE Design Specification

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Comprehensive Product Design Document

---

## Table of Contents

1. [Onboarding](#1-onboarding)
2. [Vibe Check Mechanics](#2-vibe-check-mechanics)
3. [Match Expiration & Discovery Lifecycle](#3-match-expiration--discovery-lifecycle)
4. [Messaging Rules](#4-messaging-rules)
5. [Safety Systems](#5-safety-systems)
6. [Venue & Event Data](#6-venue--event-data)
7. [Pseudonym System](#7-pseudonym-system)
8. [Photo Handling](#8-photo-handling)
9. [Notification Strategy](#9-notification-strategy)
10. [Premium & Monetization](#10-premium--monetization)
11. [Community Features](#11-community-features)
12. [Relationship Progression](#12-relationship-progression)
13. [Re-entry & CY Continuity](#13-re-entry--cy-continuity)
14. [CY Memory & Limits](#14-cy-memory--limits)
15. [Accessibility](#15-accessibility)
16. [Data Portability](#16-data-portability)
17. [CY Reset / Starting Over](#17-cy-reset--starting-over)

---

## 1. Onboarding: "Learn How DAiTE Works"

The first 5 minutes determine everything. Users need to understand this isn't another swipe app.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    WELCOME TO DAiTE                             │
│                                                                 │
│   [Animated sequence - 4 screens, skippable but discouraged]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### SCREEN 1: THE PROBLEM

```
"Dating apps made meeting easy and connecting hard.

 Swipe. Match. Awkward opener. Ghost.

 We think there's a better way."

 [Next →]
```

### SCREEN 2: YOUR CYRAiNO

```
"Meet your CYRAiNO - your personal AI that learns who
 you really are, then advocates for you.

 Instead of you selling yourself to strangers,
 your CYRAiNO talks to their CYRAiNO.

 Two AI agents having a conversation about whether
 their humans might actually connect."

 [Animation: Two CY avatars talking, speech bubbles]

 [Next →]
```

### SCREEN 3: THE STORY

```
"When there's potential, you'll read the conversation.

 Not a compatibility percentage.
 The beginning of your story together.

 'My human finds magic in quiet mornings...'
 'Mine too. She calls it earned silence...'

 You decide if you want to meet the person
 your CYRAiNO found for you."

 [Next →]
```

### SCREEN 4: THE COMMITMENT

```
"DAiTE is different. We ask more of you.

 ✓ Take time to help your CYRAiNO know you
 ✓ Be honest - your CY represents the real you
 ✓ Show up when you say you will
 ✓ Be kind, even when saying no

 In return, we'll help you find someone worth finding.

 Ready to meet your CYRAiNO?"

 [Let's Go →]
```

---

## 2. Vibe Check Mechanics

The core matchmaking engine. Needs clear rules.

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIBE CHECK SYSTEM                            │
└─────────────────────────────────────────────────────────────────┘
```

### TRIGGER

User sends CY on a vibe check (costs tokens)

### PROCESS

1. **CY identifies candidate pool**
   - Location compatible
   - Basic preferences match (age range, etc.)
   - Both users have active profiles
   - Neither has blocked the other
   - Haven't been matched before

2. **CY prioritizes by:**
   - Assessment compatibility (if available)
   - Aesthetic resonance
   - Value alignment
   - Profile completeness of other user

3. **CY conducts conversations**
   - 3-5 agent dialogues per vibe check
   - Each dialogue: 6-10 exchanges
   - Asynchronous (doesn't require other user to be online)

4. **CY evaluates results**
   - Compatibility score (internal, not shown as number)
   - Match decision: YES / MAYBE / NO
   - If YES or MAYBE: generates narrative excerpt

5. **CY returns with discoveries**
   - Typically 1-3 discoveries per vibe check
   - Sometimes 0 (no strong matches found - tokens refunded 50%)

### TIMING

- Vibe check duration: 1-4 hours (async)
- User sees "CY is out meeting people..." status
- Push notification when CY returns

### LIMITS

- 1 vibe check at a time (can't stack)
- Max 3 vibe checks per week (prevents spamming)
- Cooldown: 24 hours between vibe checks

### COSTS

- Standard vibe check: 10 tokens
- Extended vibe check (more candidates): 20 tokens
- Refund if <2 discoveries: 50% tokens back

---

## 3. Match Expiration & Discovery Lifecycle

Discoveries shouldn't sit forever. Creates urgency without pressure.

### DISCOVERY LIFECYCLE

**Day 0: Discovery arrives**
- User sees discovery card
- Can: [Interested] [Pass] [Save for Later]

**Day 1-7: Active window**
- If [Interested]: Waits for mutual interest
- If other user also [Interested] within 7 days: MATCH
- Both notified

**Day 7: Soft expiration**
- Discovery moves to "Expiring Soon"
- Notification: "Your discovery with [X] expires in 24h"

**Day 8: Expiration**
- If no action: Discovery removed
- Neither user notified of expiration (no rejection feeling)
- Can re-discover in future vibe checks (6 month cooldown)

### SAVE FOR LATER

- Max 5 saved discoveries
- Saved discoveries don't expire for 30 days
- Costs 2 tokens to save
- Other user doesn't know they're saved

---

## 4. Messaging Rules

Once matched, how does communication work?

### MESSAGING SYSTEM

#### UNLOCK

- Match occurs → Chat unlocked for both
- No token cost to message (matching was the gate)
- First message suggested by CY (from vibe check insights)

#### CY COACHING (The Whispers)

- CY coaching is ON by default
- User can toggle off per conversation or globally
- Coaching appears as subtle overlay, not inline

**Coaching triggers:**
- Conversation lull (>24h no messages): "Maybe ask about [X]?"
- Low-effort message detected: "You might want to expand on that"
- Topic from vibe check unused: "You haven't mentioned [shared interest] yet"
- Positive momentum: "This is going well! 👍" (encouragement)
- Pre-send review (optional): Checks tone before sending

#### MESSAGE VISIBILITY

- Read receipts: ON by default, user can turn off
- Typing indicator: ON by default, user can turn off
- Last active: Shows "Active today" / "Active this week" (not precise)
- Online status: NOT shown (reduces pressure)

#### RESPONSE TIME EXPECTATIONS

- No forced response windows
- But: 72h no response → CY nudges: "Want to keep this going?"
- 7 days no response from either side → CY offers to help craft closure message or unmatch

#### UNMATCH

- Either user can unmatch anytime
- Option 1: Silent unmatch (just disappear)
- Option 2: CY-assisted closure message (kind exit)
- After unmatch: Conversation deleted for both within 24h

---

## 5. Safety Systems

Critical for any dating platform. Extra critical with AI.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAFETY ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────┘
```

### VERIFICATION TIERS

**Tier 0: Unverified**
- Email confirmed only
- Limited visibility in vibe checks
- Badge: None

**Tier 1: Photo Verified**
- Selfie matches profile photos (AI check)
- Normal visibility
- Badge: ✓ Photo Verified

**Tier 2: ID Verified (Optional)**
- Government ID matches selfie
- ID data NOT stored (hash only for re-verification)
- Boosted visibility, trust signal
- Badge: ✓✓ Identity Verified

**Tier 3: Social Verified (Optional)**
- LinkedIn or other professional network connected
- Adds credibility layer
- Badge: ✓✓✓ Fully Verified

### REPORTING SYSTEM

**Report categories:**
- Fake profile / Catfishing
- Inappropriate photos
- Harassment in messages
- Dangerous behavior (threats, stalking)
- Scam / Spam
- Underage user
- Other (free text)

**Report handling:**
- Immediate: User blocked from reporting user
- <1 hour: Human review for safety categories
- <24 hours: Human review for all others
- Action: Warning → Suspension → Permanent ban
- Reporter notified: "We've taken action" (no details)

### AUTOMATED SAFETY

**CY monitors for:**
- Requests for money / financial info
- Requests to move off-platform quickly
- Threatening language
- Requests for personal info (address, workplace)
- Age-inappropriate conversations
- Patterns across multiple users (serial behavior)

**When detected:**
- Warning to recipient: "CY noticed something concerning..."
- Flagged for human review
- Repeated: Automatic suspension pending review

### BLOCKING

- Block is instant and complete
- Blocked user sees nothing (no "you've been blocked")
- Blocked user cannot:
  - See your profile in discoveries
  - Be matched via vibe checks
  - Message you ever
  - Know they're blocked
- Block list is private, exportable

### DATE SAFETY FEATURES

**Pre-date:**
- Venue vetting (public places suggested)
- Share date details with emergency contact (opt-in)
- Video vibe check option before meeting

**During date:**
- Check-in prompts: "How's it going?" (opt-in)
- Discreet SOS: Triggers fake emergency call
- Location sharing with trusted contact (opt-in)

**Post-date:**
- "Did you feel safe?" prompt (private, feeds safety score)
- Easy path to report if anything concerning

---

## 6. Venue & Event Data

Where do the "vertex points" come from?

### VENUE DATA STRATEGY

#### SOURCES (Layered)

**Layer 1: Google Places API**
- Wide coverage, basic info
- Categories, ratings, hours, photos
- Limitation: Generic, not curated

**Layer 2: Yelp Fusion API**
- Better curation, reviews
- Vibe-relevant categories
- Limitation: Coverage varies by city

**Layer 3: Local partnerships (Phase 2)**
- SLCTrips integration (you mentioned)
- City-specific curators
- Revenue opportunity: featured venues

**Layer 4: User-generated (Phase 3)**
- "Suggest a date spot"
- Community-vetted venues
- Moderated for quality

#### VENUE ATTRIBUTES (Beyond APIs)

What CY needs to know for date planning:

- Noise level: Quiet / Moderate / Loud
- Vibe: Romantic / Casual / Active / Creative
- Price range: $ / $$ / $$$ / $$$$
- Best for: First date / Getting to know / Special occasion
- Accessibility: Wheelchair / Parking / Transit
- Sensory notes: Lighting, crowd density (ND-friendly)
- Dog-friendly: Yes / No / Patio only
- Reservation needed: Yes / No / Recommended
- Peak times: When to avoid for quiet conversation

#### DATA ENRICHMENT

**Initial:** Pull from APIs

**Then:** Enrich via:
- User feedback post-date: "Was this a good spot?"
- AI analysis of reviews: Extract vibe keywords
- Manual curation: Top venues in each city tagged by team

### EVENT DATA

**Sources:**
- Eventbrite API
- Local event feeds
- Venue calendars (where available)
- User submissions

**Use cases:**
- "There's a jazz night Thursday that matches both your vibes"
- "The farmers market is Saturday if you want something daytime"
- Seasonal: "Holiday market opens this weekend"

---

## 7. Pseudonym System

Privacy layer between real identity and dating identity.

### PSEUDONYM DESIGN

#### GENERATION OPTIONS

**Option A: User chooses freely**
- Any name they want
- Risk: Offensive names, impersonation
- Mitigation: Blocklist, moderation

**Option B: Generated + customizable**
- System suggests 5 options based on aesthetic
- User can regenerate or modify
- Pattern: [Adjective][Noun] or [Word][Word]
- Examples: "QuietVinyl", "MorningRitual", "WarmMinimalist"

**Option C: First name only (real or chosen)**
- More personal
- Risk: Less privacy

#### RECOMMENDATION: Option B (Generated + customizable)

- Ties to aesthetic (feels personal)
- Privacy preserved
- Conversation starter: "So why 'QuietVinyl'?"
- Can change later (costs tokens)

### PSEUDONYM RULES

- Unique across platform (no duplicates)
- 3-20 characters
- Letters and numbers only
- Checked against blocklist
- Can change: 1 free change, then 5 tokens per change
- Old pseudonyms released after 90 days

### REAL NAME REVEAL

- Never required
- User controls when/if to share
- CY coaching: "You've been chatting for a while. Want to share your real name?"
- Milestone suggestion: Before first date

---

## 8. Photo Handling

Beyond privacy (covered earlier), the UX of photos.

### PHOTO SYSTEM

#### UPLOAD REQUIREMENTS

- Minimum: 2 photos to be discoverable
- Maximum: 8 photos
- At least 1 must clearly show face
- No group photos as primary
- No sunglasses/heavy filters on primary

#### MODERATION (Automated + Human)

**Automated rejection:**
- Nudity / explicit content
- Violence
- Clearly not a person (meme, object)
- ID documents visible
- Children without adults
- Contact info visible (phone, social handles)
- Copyright content (celebrities, stock photos)

**Human review queue:**
- Borderline automated flags
- Reported photos
- Random sample for quality

#### PROGRESSIVE REVEAL MECHANICS

Level 5 → 1 (blur decreasing)

**In discovery:**
- Default: Level 3 (face shape visible, not identifiable)
- User can set their "discovery blur level" (3-5)

**After match:**
- Photos unlock to Level 2
- User can choose to reveal to Level 1 (full)

**Token unlock:**
- Before match, can spend tokens to reveal more
- Cost: 3 tokens per level
- Other user notified: "Someone unlocked your photo" (Doesn't say who until match)

#### PHOTO PROMPTS

Instead of just photos, guided prompts:

- "A photo that shows your vibe"
- "You doing something you love"
- "A recent photo that feels like you"
- "With your pet / favorite person / favorite place"
- "The view from your favorite spot"

Prompts are visible under photos in profile.

---

## 9. Notification Strategy

Notifications can make or break an app. Too many = uninstall. Too few = forgotten.

### NOTIFICATION PHILOSOPHY

"Only notify when it matters. Make every notification worthwhile."

### NOTIFICATION TIERS

#### TIER 1: Always On (unless user fully disables)

- New match
- First message from new match
- CY returned from vibe check with discoveries
- Safety alerts
- Account security

#### TIER 2: On by Default (can disable)

- New message in active conversation
- Discovery expiring in 24h
- Date reminder (1 day before, 2 hours before)
- CY has a question for you (rare, important)
- Someone interested in you (waiting for your response)

#### TIER 3: Off by Default (can enable)

- Profile views (if we show this at all)
- CY coaching reminders
- Weekly activity summary
- New features / updates
- Token balance low

#### TIER 4: Never

- Marketing
- "Come back, we miss you!"
- Other users' activity
- Anything manipulative

### TIMING RULES

- Respect quiet hours (default 10pm-8am, customizable)
- Batch non-urgent notifications (max 3 per day outside matches)
- No notifications within 30 min of last one (except matches)
- Analyze user patterns: if they only check evenings, notify then

### NOTIFICATION COPY

Tone: Warm but not pushy. Never manipulative.

**Good:** "Nova found 2 people you might like ✨"  
**Bad:** "You have matches waiting! Don't miss out!"

**Good:** "Jamie sent you a message"  
**Bad:** "Jamie is waiting for your reply!"

**Good:** "Your date with Alex is tomorrow"  
**Bad:** "Don't forget your date! Set a reminder now!"

---

## 10. Premium & Monetization

How does DAiTE make money sustainably?

### MONETIZATION PHILOSOPHY

"We win when you find someone. Not when you keep swiping."

Our incentives must align with user success.

### TOKEN ECONOMY (Core)

**Free tokens:**
- Sign up: 20 tokens
- Complete profile: +10 tokens
- Complete each assessment: +3-10 tokens
- Good post-date feedback received: +5 tokens
- Consistent engagement (weekly): +5 tokens
- Refer a friend: +10 tokens (when they complete profile)
- Success story submission: +20 tokens

**Earn through behavior:**
- High accountability score: 10% token bonus on all earnings
- Verified profile: 5% bonus
- Mentor new users (future): +tokens

**Spend tokens:**
- Vibe check: 10-20 tokens
- Extended vibe check: 20 tokens
- Save discovery for later: 2 tokens
- Reveal photo level: 3 tokens
- Change pseudonym: 5 tokens
- Avatar customization: 3-15 tokens
- Book date through platform: varies by venue
- See who's interested in you: 5 tokens

### TOKEN PURCHASE

- 30 tokens: $4.99
- 75 tokens: $9.99 (25% bonus)
- 200 tokens: $19.99 (60% bonus)
- 500 tokens: $39.99 (100% bonus)

### SUBSCRIPTION MODEL (DAiTE+)

$19.99/month or $149.99/year

**Includes:**
- 100 tokens/month
- Unlimited vibe checks (no weekly limit)
- See who's interested before you express interest
- Advanced filters in vibe checks
- Priority in other users' vibe checks
- Extended discovery window (14 days vs 7)
- CY coaching enhanced (more detailed suggestions)
- Read receipts default off for you, on for others (stealth)
- Profile boost once per month

**Does NOT include:**
- Better matches (matching quality same for everyone)
- Skip verification
- Bypass safety systems
- Any "pay to win" mechanics

### VENUE PARTNERSHIPS (B2B Revenue)

- Featured venue placement in date suggestions
- Booking commissions (10-15%)
- Analytics for venues (anonymized: "X dates happened here")
- "DAiTE Date Night" partnerships (special menus, experiences)

### SUCCESS FEE MODEL (Future/Experimental)

Optional: Users who end up in committed relationships can choose to contribute ("Pay it forward")
- 100% goes to subsidizing tokens for users who can't afford them
- Creates goodwill loop

---

## 11. Community Features (Beyond 1:1)

Not just dating - social fabric.

### COMMUNITY VISION

- Phase 1: 1:1 Dating (MVP)
- Phase 2: Friendship mode
- Phase 3: Group events
- Phase 4: Interest communities

### FRIENDSHIP MODE

Same CY, same vibe checks, but:
- User sets "Looking for: Friends"
- CY knows to advocate for friendship compatibility
- Separate discovery feed
- No romantic framing in dialogues

Use case: New to city, neurodivergent seeking ND friends, etc.

### GROUP EVENTS (Future)

DAiTE-hosted or facilitated events:
- "Vinyl Night" - CY-matched groups who love records
- "Quiet Coffee" - Low-stimulation meetup for ND users
- "Adventure Day" - Hiking/activity for matched groups
- "Creative Date Night" - Art class, cooking, etc.

**How it works:**
- CY suggests events based on your aesthetic
- You opt-in
- CY matches you with a small group (4-8 people)
- Not romantic pressure - group dynamic
- Could become dates, friendships, or just good night out

### INTEREST COMMUNITIES (Future)

- "Vinyl Collectors of [City]"
- "Quiet Morning People"
- "ND Dating Support"
- Moderated spaces, CY-facilitated discussions
- Organic way to meet before vibe checks

---

## 12. Relationship Progression

What happens when dating works?

### RELATIONSHIP STAGES

#### STAGE: Matched

- Just matched, haven't met
- CY coaching active
- Discovery info visible

#### STAGE: Dating

- Have been on 1+ dates
- CY continues coaching
- Post-date reflections
- Date planning active

#### STAGE: Exclusive (User-declared)

- Both users mark "We're exclusive"
- Hidden from discovery
- CY shifts to relationship mode
- Date planning continues
- Removes them from vibe checks

#### STAGE: Graduated (Success!)

- Users declare they're leaving together
- Celebration moment
- Offered to share success story (optional)
- Profiles archived (can return if needed)
- CY says goodbye: "I'm so happy for you. I'll be here if you ever need me."

### WHAT CY DOES IN RELATIONSHIP MODE

- Suggests date ideas based on what's worked
- Anniversary reminders
- "You haven't planned a date in a while" nudges
- Conflict coaching (if enabled): "It sounds like you're frustrated. Want to talk through it?"
- Continues learning and growing with the relationship

---

## 13. Re-entry & CY Continuity

People leave and come back. What happens?

### ACCOUNT STATES

#### ACTIVE

- Normal usage

#### PAUSED

- User choice: "I need a break"
- Profile hidden from discovery
- CY preserved
- Can reactivate anytime
- No time limit

#### GRADUATED

- Left with a partner
- Profile archived
- CY preserved
- Can return if relationship ends

#### DELETED

- Full deletion per privacy policy
- CY gone
- Cannot recover

### RE-ENTRY SCENARIOS

#### From PAUSED:

- Welcome back
- CY remembers everything
- "Hey! Ready to get back out there? Let me catch up on what's changed with you."
- Optional: Update assessments, refresh profile

#### From GRADUATED (relationship ended):

- Sensitive re-entry
- CY: "I'm sorry it didn't work out. I'm here when you're ready. No rush."
- Grace period: 30 days before any vibe checks suggested
- CY offers to talk through what happened (learning)
- Option to refresh profile or start with clean slate

#### From DELETED (new account):

- Treated as new user
- If same email: "Welcome back. Your previous CY is gone, but we can start fresh."
- New CY, new profile
- Previous matches/blocks: STILL PRESERVED (safety)

---

## 14. CY Memory & Limits

CY can't remember everything forever. How does memory work?

### CY MEMORY ARCHITECTURE

#### MEMORY TYPES

**Core Identity (permanent until user deletes):**
- Values
- Relationship goals
- Dealbreakers
- Aesthetic profile
- Assessment results
- Key quotes user explicitly shared

**Conversational Memory (summarized over time):**
- Recent conversations (full, last 30 days)
- Older conversations (summarized, 30-180 days)
- Very old (key points only, 180+ days)
- User can access full transcripts anytime (their data)

**Match Memory:**
- Who they matched with
- Key moments from those connections
- What worked / didn't work
- User preferences learned from feedback

### MEMORY SUMMARIZATION

Over time, CY summarizes:

**Full conversation (Day 1):**
"User talked about their morning routine. They said they need quiet time before the world asks things of them. Coffee, vinyl, no phone for an hour. They asked about whether I thought they were weird for needing that. I reassured them it's self-awareness, not weird."

**Summarized (Day 60):**
"Morning routine is sacred. Needs quiet, coffee, vinyl, no phone. Protective of this time. Self-aware about needs."

**Core memory (Day 200):**
"Values quiet mornings as self-restoration time."

### USER CONTROL

- User can see all memory at any time
- User can delete specific memories
- User can download full conversation history
- User can "teach" CY: "Remember this specifically"
- User can correct CY: "That's not quite right, I meant..."

---

## 15. Accessibility

Neurodivergent-first means accessibility-first.

### ACCESSIBILITY FEATURES

#### VISUAL

- Color blind modes (protanopia, deuteranopia, tritanopia)
- High contrast mode
- Dark mode / light mode / system
- Font size scaling (50%-200%)
- Reduced motion option (no animations)
- Screen reader optimized (ARIA labels, semantic HTML)
- All images have alt text (AI-generated + reviewed)

#### COGNITIVE

- Simple language option (reduces complex vocabulary)
- Numbered steps for multi-step processes
- Clear progress indicators
- Undo available for most actions
- No time pressure (no countdown timers)
- "Read aloud" option for long text
- Summary mode for CY conversations

#### SENSORY

- Notification controls (sound, vibration, visual only)
- No sudden sounds
- No flashing content
- Venue sensory notes (noise, crowd, lighting)
- Date planning considers sensory needs

#### MOTOR

- Keyboard navigation full support
- Large touch targets (minimum 44x44px)
- No gestures required (swipe has tap alternatives)
- Voice input for messages (optional)
- Adjustable tap sensitivity

#### NEURODIVERGENT-SPECIFIC

**Explicit communication mode:**
- CY is more direct
- Less subtext in suggestions
- Clear expectations stated

**Social scripting:**
- CY provides more conversation scripts
- "You could say exactly: '[script]'"
- Date preparation more detailed

**Routine support:**
- Consistent UI patterns
- Predictable notification timing
- Date itineraries very detailed

**Overwhelm protection:**
- "Quiet mode" - reduces all inputs
- Discovery feed limited to 1 at a time (optional)
- Conversation pauses: "Take a break?" prompts

---

## 16. Data Portability

Users own their data. They can take it.

### DATA EXPORT

#### WHAT'S EXPORTABLE

- Profile data (JSON)
- All CY conversations (JSON + readable format)
- CY's learned model of you (structured summary)
- Assessment results
- Match history (your side only)
- Message history (your messages only)
- Photos (original uploads)
- Account settings
- Activity log

#### FORMAT OPTIONS

- JSON (structured, machine-readable)
- PDF (human-readable report)
- ZIP (all files bundled)

#### TIMELINE

- Request export from settings
- Processing: Up to 24 hours
- Download link emailed (expires in 7 days)
- Can request new export once per week

### CY PORTABILITY (Future)

Could your CY come with you to other platforms?
- Export CY model as portable format
- Another platform could "import" your CY
- Interoperability standard (way future, but design for it)

---

## 17. CY "Reset" / Starting Over

What if someone wants a fresh start without deleting account?

### CY RESET OPTIONS

#### OPTION 1: Memory Wipe

- CY forgets everything except core profile
- Assessments preserved
- Aesthetic preserved
- Match history preserved (safety)
- Like "CY got amnesia"
- Free (once per year, then 50 tokens)

#### OPTION 2: Full CY Reset

- New CY entirely
- New name, new avatar
- All memory gone
- Assessments can be re-taken
- Match history preserved (safety)
- 100 tokens or included in premium

#### OPTION 3: Profile Reset

- Same CY, but refresh public profile
- New photos, new pseudonym
- CY helps rebuild
- Previous matches can't see you were same person
- 50 tokens

### WHY PRESERVE MATCH HISTORY?

Safety. If you blocked someone or they blocked you, that must persist even through resets. Otherwise abusers could just reset to re-access victims.

**Internal match history preserved:**
- Blocks persist
- Reports persist
- Not visible to user in new context
- Prevents abuse cycling

---

## Document Status

This specification serves as the comprehensive design document for DAiTE. All features, mechanics, and systems described above should be implemented according to these guidelines.

**Next Steps:**
- Convert to database schema
- Create user stories from each section
- Build implementation roadmap
- Design API endpoints based on these requirements

