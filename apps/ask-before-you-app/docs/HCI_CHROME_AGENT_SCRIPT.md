# Ask Before You App — HCI Chrome Agent Script 🤖

**Purpose:** Step-by-step execution script for Claude Chrome extension to run HCI tests on ABYA  
**Target:** https://www.askbeforeyouapp.com  
**Estimated Time:** 45–60 minutes (full suite)

---

## PRE-EXECUTION SETUP

- [ ] Chrome DevTools open (Console + Network tabs)
- [ ] Start at https://www.askbeforeyouapp.com
- [ ] Clear cache if testing post-deployment

---

## PHASE 1: SMOKE (5 min)

### Test 1.1: Site Load & Identity

**Actions:**
1. Navigate to `https://www.askbeforeyouapp.com`
2. Wait for page load (max 5 seconds)
3. Check tab title includes "Ask Before You App"
4. Check Console: no red errors (warnings OK)
5. Verify hero: "Ask Before **You App**" headline and "Before you download that app—ask…" subtext

**Verification:**
- [ ] Correct site (orange campaign branding, not another app)
- [ ] Tab title correct
- [ ] No critical console errors
- [ ] Hero visible

---

### Test 1.2: WiseBot CTA & Primary CTAs on Landing

**Actions:**
1. On homepage, locate "Ask WiseBot" in nav (top right)
2. Verify prominent orange "Have a question? Ask WiseBot" block below hero
3. Verify "Ask WiseBot now" button in that block
4. Scroll to "One place to learn and take action"
5. Verify WiseBot is first card in the 4-card grid
6. Scroll to bottom CTAs
7. Verify "Ask WiseBot" is the primary (orange) button; "Explore the knowledge hub" and "Free certification" are secondary (outline)

**Verification:**
- [ ] "Ask WiseBot" in nav
- [ ] WiseBot hero CTA block visible
- [ ] WiseBot in services grid
- [ ] Primary CTA is "Ask WiseBot"

---

## PHASE 2: NAVIGATION — NO 404s (8 min)

**Actions:**
1. Click **Who are you?** → modal opens
2. Click **Ask WiseBot** (nav) → /tools/wisebot loads
3. Go back to home
4. Click **Knowledge hub** → /learn loads
5. Click **Certification** → /certification loads
6. Click **State resources** → /ecosystem loads
7. Open **Tools** dropdown (if present) → **WiseBot** → /tools/wisebot
8. Open **Tools** → **AI Readiness Quiz** → /tools/ai-readiness-quiz loads
9. Click **Contact** → /contact loads

**Verification:**
- [ ] All nav links load (no 404)
- [ ] Tools dropdown works
- [ ] No broken links

---

## PHASE 3: WISEBOT (10 min)

### Test 3.1: WiseBot Page Load

**Actions:**
1. Navigate to `/tools/wisebot`
2. Verify header: "WiseBot (AI Assistant)"
3. Verify tagline: "Your AI governance and training consultant…"
4. Verify example prompts or input visible
5. Verify "Send" button
6. Check "Want to talk to a human? Contact Us" link

**Verification:**
- [ ] Page loads
- [ ] Input + Send visible
- [ ] No 404

---

### Test 3.2: WiseBot Response (CRITICAL)

**Actions:**
1. Type: "How do we evaluate bias in AI tools?"
2. Click Send (or press Enter)
3. Wait up to 15 seconds
4. Verify assistant response appears (non-empty bubble on left)
5. If empty bubble or error: document exact message shown

**Verification:**
- [ ] Response received (non-empty)
- [ ] No "API configuration error" or "No response received"
- [ ] If error: capture exact text for debugging

**Document if FAIL:**
- Error message: _____
- Console errors: _____
- Network: /api/ai/chat status _____

---

## PHASE 4: ROLE-SPECIFIC CONTENT ON LEARN (12 min)

### Test 4.1: Parent Persona

**Actions:**
1. Navigate to `/learn?who=parent`
2. Verify hero: "Content tailored for you as a parent"
3. Verify section "Understand apps — from a parent's perspective"
4. Verify bullets mention: "Ask the school for a list", "FERPA", "SDPC Registry"
5. Click persona button "I'm a parent" — verify it stays selected (highlighted)
6. Click "I'm an educator" — verify content updates to educator copy

**Verification:**
- [ ] Parent-specific copy (not generic)
- [ ] Persona switcher updates content
- [ ] Active persona highlighted

---

### Test 4.2: Educator Persona

**Actions:**
1. Navigate to `/learn?who=educator`
2. Verify "Understand apps — from an educator's perspective"
3. Verify bullets mention: "Ask before you add a new tool", "Traffic light", "Avoid personal accounts"
4. Verify "Ask WiseBot" link in hero

**Verification:**
- [ ] Educator-specific copy
- [ ] WiseBot prompt visible

---

### Test 4.3: Administrator Persona

**Actions:**
1. Navigate to `/learn?who=administrator`
2. Verify "Understand apps — from an administrator's perspective"
3. Verify bullets mention: "Establish a vetting workflow", "NDPA", "Exhibit H"
4. State laws section: "State laws & procedures — for administrators"

**Verification:**
- [ ] Administrator-specific copy
- [ ] State laws tailored

---

### Test 4.4: Student Persona

**Actions:**
1. Navigate to `/learn?who=student`
2. Verify "Understand apps — from a student's perspective"
3. Verify bullets mention: "You have rights", "FERPA", "Ask what apps collect"

**Verification:**
- [ ] Student-specific copy (not generic)

---

### Test 4.5: Just Learning (Default)

**Actions:**
1. Navigate to `/learn` (no ?who=)
2. Verify generic "Understand apps" (no "from a X perspective")
3. Click "I'm just learning" — verify generic content

**Verification:**
- [ ] Generic content when no persona
- [ ] Persona buttons work

---

## PHASE 5: CRITICAL JOURNEYS (10 min)

### Journey A: Parent

1. Home → "Who are you?" → Select **Parent** → Continue
2. Verify redirect to /learn?who=parent (or equivalent)
3. Verify parent-oriented copy on Learn
4. Click State resources → /ecosystem
5. Click Utah (or first state with guide) → state page loads

**Verification:**
- [ ] Modal closes, redirect works
- [ ] Parent content on Learn
- [ ] State page loads

---

### Journey B: Educator

1. Home → "Who are you?" → Select **Educator** → Continue
2. Click **Certification** → /certification
3. Verify NDPA module list (e.g. Foundations, Document Anatomy)
4. Click Start or first module → no 404
5. Click **Knowledge hub** → educator content on Learn

**Verification:**
- [ ] Certification loads
- [ ] Modules accessible
- [ ] Educator content on Learn

---

### Journey C: WiseBot from Landing

1. Home → Click "Ask WiseBot now" (orange CTA block)
2. Verify /tools/wisebot loads
3. Send a message
4. Verify response (or documented error)

**Verification:**
- [ ] CTA navigates to WiseBot
- [ ] WiseBot responds or error is documented

---

## PHASE 6: FOOTER & OTHER PAGES (5 min)

**Actions:**
1. Home → Footer **Campaign**: Knowledge hub, Certification, State resources, Contact — all work
2. Footer **Tools & resources**: AI Readiness Quiz, WiseBot, Vendor Registry, Clarion — all work
3. Navigate to /certification — module list visible
4. Navigate to /ecosystem — state grid (50+ states), SDPC count visible
5. Navigate to /ecosystem/ut — Utah page loads (or "coming soon" if applicable)
6. Navigate to /contact — form or contact info
7. Navigate to /tools/ai-readiness-quiz — quiz loads
8. Navigate to /clarion — Clarion content loads

**Verification:**
- [ ] All footer links work
- [ ] No 404 on key pages

---

## PHASE 7: ACCESSIBILITY (5 min)

**Actions:**
1. Tab through homepage — focus moves logically
2. Verify focus ring visible on links/buttons
3. Open "Who are you?" — focus inside modal
4. Close modal — focus returns
5. On Learn: Tab through persona buttons — all focusable
6. Check images have alt text (DevTools or aXe)

**Verification:**
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Modal focus trap works

---

## RESULTS TEMPLATE

```markdown
# ABYA HCI Test Report

**Date:** [Date]
**Tester:** Claude Chrome Agent
**Site:** https://www.askbeforeyouapp.com
**Total Time:** [Minutes]

## Summary
- Smoke: PASS / FAIL
- Nav: PASS / FAIL
- WiseBot (response): PASS / FAIL ⚠️ CRITICAL
- Role-specific Learn: PASS / FAIL
- Critical Journeys: PASS / FAIL
- Footer/Pages: PASS / FAIL
- Accessibility: PASS / FAIL

## Critical Issues
1. [If WiseBot doesn't respond: document error message, /api/ai/chat status, console errors]
2. [Any blocker]

## High Priority Issues
1. [Broken nav, 404, missing CTA]
2. [...]

## Notes
- [Screenshots or observations]
```

---

## QUICK CHECKLIST (10 min — Critical Path Only)

- [ ] 1.1 Site load, hero, no console errors
- [ ] 1.2 WiseBot CTA on landing, primary CTA is "Ask WiseBot"
- [ ] 2.1–2.5 Nav: Who are you?, Knowledge hub, Certification, State resources, WiseBot
- [ ] 3.2 WiseBot responds to "How do we evaluate bias in AI tools?"
- [ ] 4.1 Parent content on /learn?who=parent
- [ ] 4.2 Educator content on /learn?who=educator
- [ ] 5A Parent journey: Who are you? → Parent → Learn → State resources → Utah
- [ ] 5C WiseBot CTA from landing → WiseBot loads → sends message → response

---

**Ready for Claude Chrome extension execution.** 🤖✅
