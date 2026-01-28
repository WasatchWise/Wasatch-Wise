# HCI Testing Script for Chrome Extension Agent 🤖

**Target Tool:** Clog Code Chrome Extension Agent  
**Purpose:** Automated HCI/usability testing for TripKits  
**Date:** January 2025

---

## 🎯 TESTING OVERVIEW

### What This Script Tests:
1. ✅ **Purchase Flow** - End-to-end purchase experience
2. ✅ **Authentication** - Sign in/sign up functionality
3. ✅ **Gift Purchases** - Gift purchase and reveal flow
4. ✅ **Library Access** - User TripKit library functionality
5. ✅ **AI Concierge** - Accuracy and user experience
6. ✅ **Navigation** - User flow and wayfinding
7. ✅ **Content Accuracy** - Deep dive stories, destination info
8. ✅ **Sharing Features** - Share buttons and functionality

---

## 📋 TEST SCENARIOS FOR CHROME EXTENSION

### Test 1: Purchase Flow (Critical Path)
**Goal:** Verify users can successfully purchase a TripKit

**Steps:**
1. Navigate to `/tripkits`
2. Find a paid TripKit (e.g., "Morbid Misdeeds")
3. Click on the TripKit card
4. Verify TripKit details page loads
5. Click "Purchase" or "Buy Now" button
6. **Check:** Are you redirected to sign-in if not authenticated?
7. If authenticated, verify Stripe checkout appears
8. **Note:** Use Stripe test mode for actual testing
9. Complete test purchase (use Stripe test card: `4242 4242 4242 4242`)
10. Verify success page appears
11. Check redirect to `/account/my-tripkits`
12. Verify TripKit appears in library

**Expected Results:**
- ✅ Purchase button visible
- ✅ Authentication required (if not logged in)
- ✅ Stripe checkout loads
- ✅ Success page appears after payment
- ✅ TripKit appears in library

**Issues to Flag:**
- ❌ Purchase button not visible
- ❌ No authentication prompt
- ❌ Checkout doesn't load
- ❌ Payment succeeds but TripKit doesn't appear in library
- ❌ Error messages unclear

---

### Test 2: Authentication Flow
**Goal:** Verify users can sign in/sign up

**Steps:**
1. Navigate to `/auth/signin`
2. **Check:** Sign-in form visible
3. Enter test email: `test@example.com`
4. Enter test password: `testpassword123`
5. Click "Sign In" button
6. **If account doesn't exist:**
   - Verify error message or redirect to sign-up
   - Navigate to `/auth/signup`
   - Fill sign-up form
   - Verify account creation
7. **If account exists:**
   - Verify successful sign-in
   - Check redirect to `/my-tripkits` or intended destination
8. **Test password reset:**
   - Navigate to `/forgot-password`
   - Enter email
   - Verify reset email instructions appear

**Expected Results:**
- ✅ Sign-in form functional
- ✅ Sign-up creates account
- ✅ Password reset works
- ✅ Redirects work correctly

**Issues to Flag:**
- ❌ Form validation errors unclear
- ❌ No error messages for failed login
- ❌ Redirect doesn't work
- ❌ Sign-up doesn't create account

---

### Test 3: Gift Purchase Flow
**Goal:** Verify gift purchases work end-to-end

**Steps:**
1. Navigate to a paid TripKit page
2. Look for "Buy as Gift" or "Gift" button
3. Click gift purchase button
4. **Check:** Gift form appears (sender name, recipient email, message)
5. Fill in gift details:
   - Sender name: "Test Gifter"
   - Recipient email: "recipient@example.com"
   - Gift message: "Enjoy this TripKit!"
6. Optionally set scheduled delivery date
7. Click "Purchase Gift"
8. Verify Stripe checkout loads with gift metadata
9. Complete test purchase
10. Verify gift success page appears
11. **Check:** Gift access code is provided
12. **Test gift reveal:**
    - Navigate to `/gift/reveal/[access-code]`
    - Verify gift box animation appears
    - Click "Open Gift"
    - Verify TripKit details revealed
    - Click "Start Exploring"
    - Verify redirect to TripKit viewer

**Expected Results:**
- ✅ Gift purchase form functional
- ✅ Gift metadata stored correctly
- ✅ Gift reveal page works
- ✅ Recipient can access TripKit

**Issues to Flag:**
- ❌ Gift button not visible
- ❌ Gift form missing fields
- ❌ Gift metadata not stored
- ❌ Gift reveal page broken
- ❌ Access code doesn't work

---

### Test 4: Library Access
**Goal:** Verify users can access purchased TripKits

**Steps:**
1. Sign in to test account with purchased TripKits
2. Navigate to `/account/my-tripkits`
3. **Check:** Library page loads
4. **Check:** Purchased TripKits visible
5. Verify TripKit cards show:
   - Cover image
   - TripKit name
   - Tagline
   - Destination count
   - Access type badge (Purchased/Redeemed/Complimentary)
6. Click "View TripKit" button
7. **Check:** Redirects to TripKit viewer
8. **Check:** TripKit content loads (destinations, stories)
9. **Test empty state:**
   - Sign in with account with no TripKits
   - Verify empty state message appears
   - Verify "Browse TripKits" button works

**Expected Results:**
- ✅ Library shows all purchased TripKits
- ✅ TripKit cards display correctly
- ✅ Navigation to viewer works
- ✅ Empty state helpful

**Issues to Flag:**
- ❌ Library doesn't load
- ❌ TripKits missing from library
- ❌ TripKit cards broken layout
- ❌ Navigation to viewer fails
- ❌ Empty state confusing

---

### Test 5: AI Concierge Accuracy
**Goal:** Verify AI Concierge provides accurate information

**Steps:**
1. Navigate to a TripKit viewer page (e.g., `/tripkits/morbid-misdeeds/view`)
2. **Check:** Dan Concierge floating button visible (bottom right)
3. Click Dan Concierge button
4. **Check:** Chat window opens
5. **Check:** Initial greeting appears
6. **Test weather query:**
   - Ask: "What's the weather like in Salt Lake City?"
   - **Verify:** Response includes temperature, conditions
   - **Check accuracy:** Compare with actual weather (OpenWeather API or weather.com)
   - **Note:** Should be accurate (uses real API)
7. **Test ski conditions:**
   - Ask: "What are the ski conditions at Snowbird?"
   - **Verify:** Response includes base depth, new snow, lifts/trails
   - **Check accuracy:** Compare with Snowbird website
   - **Note:** May be outdated (hardcoded data) - FLAG THIS
8. **Test canyon status:**
   - Ask: "How's the traffic in Little Cottonwood Canyon?"
   - **Verify:** Response includes traffic level, tips
   - **Check accuracy:** Compare with UDOT website
   - **Note:** May be inaccurate (time-based estimates) - FLAG THIS
9. **Test destination search:**
   - Ask: "Find hiking destinations in my TripKit"
   - **Verify:** Response lists relevant destinations from TripKit
   - **Check accuracy:** Compare with actual TripKit destinations
   - **Note:** Should be 100% accurate (uses TripKit data)
10. **Test events:**
    - Ask: "What's happening in Salt Lake City today?"
    - **Verify:** Response lists events
    - **Check accuracy:** Verify events are actually happening
    - **Note:** May be outdated (curated data) - FLAG THIS
11. **Test TripKit-specific queries:**
    - Ask TripKit-specific question (e.g., "Recommend something from my TripKit")
    - **Verify:** Response references TripKit destinations
    - **Check:** Recommendations are from user's TripKit

**Expected Results:**
- ✅ Weather queries accurate (95%+)
- ✅ Destination search accurate (100%)
- ⚠️ Ski conditions may be outdated (60% accuracy) - FLAG
- ⚠️ Canyon status may be inaccurate (70% accuracy) - FLAG
- ⚠️ Events may be outdated (40% accuracy) - FLAG
- ✅ TripKit-specific queries work

**Issues to Flag:**
- ❌ Chat doesn't open
- ❌ No response to queries
- ❌ Weather data incorrect (if using API, should be accurate)
- ❌ Ski conditions outdated (expected issue - flag)
- ❌ Canyon status inaccurate (expected issue - flag)
- ❌ Events outdated (expected issue - flag)
- ❌ Doesn't recommend from TripKit

---

### Test 6: Navigation & Wayfinding
**Goal:** Verify users can navigate the site easily

**Steps:**
1. Start at homepage `/`
2. **Check:** Header navigation visible
3. **Check:** Main navigation links work:
   - TripKits
   - Destinations
   - About
   - Sign In
4. Navigate to `/tripkits`
5. **Check:** TripKits page loads
6. **Check:** TripKit cards visible
7. Click on a TripKit
8. **Check:** TripKit detail page loads
9. **Check:** "View TripKit" or "Get Access" button visible
10. Navigate to TripKit viewer
11. **Check:** Breadcrumb navigation (if exists)
12. **Check:** "Back to TripKit Info" link works
13. **Check:** Share buttons visible
14. **Test deep navigation:**
    - Navigate to story page
    - **Check:** "Back to TripKit" link works
    - Navigate to destination detail
    - **Check:** Navigation back works

**Expected Results:**
- ✅ Header navigation functional
- ✅ Links work correctly
- ✅ Breadcrumbs helpful (if present)
- ✅ Back buttons work
- ✅ Deep navigation possible

**Issues to Flag:**
- ❌ Navigation links broken
- ❌ No way to go back
- ❌ Breadcrumbs missing or incorrect
- ❌ Lost in navigation

---

### Test 7: Content Accuracy & Accessibility
**Goal:** Verify content displays correctly and accurately

**Steps:**
1. Navigate to a TripKit viewer
2. **Check:** Deep Dive Stories section visible
3. **Check:** Story count matches expected (e.g., Morbid Misdeeds should have 5 stories)
4. Click on a story
5. **Check:** Full story content loads
6. **Verify:** Story content is complete (not truncated)
7. **Check:** Story includes:
   - Title
   - Subtitle (if exists)
   - Full content
   - Reading time
   - Featured image (if exists)
8. Navigate back to TripKit viewer
9. **Check:** Destinations list visible
10. **Check:** Destination count matches expected
11. Click on a destination
12. **Check:** Destination details load
13. **Verify:** Destination information accurate:
    - Name
    - Description/story
    - Location details
    - Images

**Expected Results:**
- ✅ All stories accessible
- ✅ Story content complete
- ✅ Destination information accurate
- ✅ Images load correctly

**Issues to Flag:**
- ❌ Stories missing
- ❌ Story content truncated
- ❌ Destination information incorrect
- ❌ Images don't load
- ❌ Content incomplete

---

### Test 8: Sharing Features
**Goal:** Verify sharing functionality works

**Steps:**
1. Navigate to TripKit viewer page
2. **Check:** Share button visible in Actions section
3. Click Share button
4. **Check:** Dropdown menu appears with options:
   - Twitter
   - Facebook
   - LinkedIn
   - Reddit
   - Email
   - Copy Link
   - Native Share (mobile)
5. Test "Copy Link":
   - Click "Copy Link"
   - **Check:** Link copied to clipboard
   - **Verify:** Link is correct format
6. Test "Twitter":
   - Click "Twitter"
   - **Check:** Twitter share dialog opens (or new tab)
   - **Verify:** Pre-filled text includes TripKit name
7. Test story card sharing:
   - Navigate to Deep Dive Stories section
   - **Check:** Each story card has share icon
   - Click share icon on story
   - **Check:** Share options appear
8. Test story page sharing:
   - Navigate to a story page
   - **Check:** Share button visible
   - Click share
   - **Verify:** Story-specific URL shared

**Expected Results:**
- ✅ Share buttons visible
- ✅ Share dropdown works
- ✅ Copy link works
- ✅ Social sharing works
- ✅ Story sharing works

**Issues to Flag:**
- ❌ Share buttons not visible (CRITICAL - we just fixed this)
- ❌ Dropdown doesn't open
- ❌ Copy link doesn't work
- ❌ Social sharing broken
- ❌ Story sharing missing

---

### Test 9: Mobile Responsiveness
**Goal:** Verify site works on mobile devices

**Steps:**
1. Set browser to mobile viewport (375x667 - iPhone SE)
2. Navigate to homepage
3. **Check:** Layout responsive
4. **Check:** Navigation menu works (hamburger menu if exists)
5. Navigate to TripKit page
6. **Check:** TripKit cards stack vertically
7. Navigate to TripKit viewer
8. **Check:** Actions section responsive
9. **Check:** Share buttons accessible
10. **Check:** Deep Dive Stories responsive
11. Test Dan Concierge on mobile:
    - Click Dan button
    - **Check:** Chat window sized appropriately
    - **Check:** Input field accessible
    - **Check:** Keyboard doesn't cover input
12. **Check:** Native share API triggers on mobile

**Expected Results:**
- ✅ Layout responsive
- ✅ Navigation works on mobile
- ✅ Buttons accessible
- ✅ Text readable
- ✅ Forms usable

**Issues to Flag:**
- ❌ Layout broken on mobile
- ❌ Buttons too small
- ❌ Text too small
- ❌ Forms unusable
- ❌ Keyboard covers input

---

### Test 10: Error Handling
**Goal:** Verify error messages are helpful

**Steps:**
1. **Test authentication errors:**
   - Try to sign in with wrong password
   - **Check:** Error message appears
   - **Verify:** Error message is clear
2. **Test purchase errors:**
   - Try to purchase with invalid card (Stripe test mode: `4000 0000 0000 0002`)
   - **Check:** Error message appears
   - **Verify:** Error message helpful
3. **Test 404 errors:**
   - Navigate to `/tripkits/nonexistent-tripkit`
   - **Check:** 404 page appears
   - **Verify:** 404 page helpful (suggests alternatives)
4. **Test access errors:**
   - Try to access TripKit without purchase
   - **Check:** "Access Required" message appears
   - **Verify:** Message clear and suggests purchase

**Expected Results:**
- ✅ Error messages clear
- ✅ Error messages actionable
- ✅ 404 page helpful
- ✅ Access denied messages helpful

**Issues to Flag:**
- ❌ No error messages
- ❌ Error messages unclear
- ❌ No suggestions for errors
- ❌ Dead ends on errors

---

## 📊 AUTOMATED CHECKS FOR EXTENSION

### Automated Verification Points:

#### Page Load Checks:
- ✅ Page loads within 3 seconds
- ✅ No console errors
- ✅ No 404 resources
- ✅ Images load correctly

#### Functionality Checks:
- ✅ Buttons clickable
- ✅ Forms submittable
- ✅ Links work
- ✅ Navigation functional

#### Content Checks:
- ✅ Required content visible
- ✅ Text readable (not too small)
- ✅ Images have alt text
- ✅ Headings structured

#### Accessibility Checks:
- ✅ Keyboard navigation works
- ✅ Focus indicators visible
- ✅ ARIA labels present
- ✅ Color contrast sufficient

---

## 🎯 PRIORITY TESTING ORDER

### Critical Path (Must Test First):
1. **Purchase Flow** - Revenue blocker
2. **Authentication** - User access blocker
3. **Library Access** - Core functionality

### High Priority:
4. **AI Concierge Accuracy** - User trust
5. **Sharing Features** - Viral growth
6. **Content Accuracy** - Value proposition

### Medium Priority:
7. **Navigation** - User experience
8. **Error Handling** - User support
9. **Mobile Responsiveness** - Reach

### Low Priority:
10. **Gift Purchases** - Nice to have (test after core works)

---

## 📝 REPORTING FORMAT

### For Each Test:
```markdown
**Test Name:** [Test Name]
**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL
**Date:** [Date]
**Browser:** [Chrome Version]
**Viewport:** [Desktop/Mobile]

**Steps Executed:**
1. [Step 1]
2. [Step 2]
...

**Expected Results:**
- [Expected result 1]
- [Expected result 2]

**Actual Results:**
- [Actual result 1]
- [Actual result 2]

**Issues Found:**
- [Issue 1 with severity]
- [Issue 2 with severity]

**Screenshots:**
- [Screenshot URLs if available]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]
```

---

## 🔍 FOCUS AREAS FOR AI CONCIERGE

### Specific Accuracy Tests:

**Weather Accuracy:**
- Ask: "What's the weather in [location]?"
- Compare response with OpenWeather API
- ✅ Should be 95%+ accurate

**Ski Conditions Accuracy:**
- Ask: "What are the conditions at [resort]?"
- Compare response with resort website
- ⚠️ Likely outdated - FLAG THIS

**Canyon Status Accuracy:**
- Ask: "How's traffic in [canyon]?"
- Compare response with UDOT website
- ⚠️ Likely estimated - FLAG THIS

**Destination Search Accuracy:**
- Ask: "Find [activity] in my TripKit"
- Verify results are from user's TripKit
- ✅ Should be 100% accurate

**Events Accuracy:**
- Ask: "What's happening today?"
- Verify events are actually happening
- ⚠️ Likely outdated - FLAG THIS

---

## 🚀 RECOMMENDATIONS FOR EXTENSION AGENT

### How to Use This Script:

1. **Run Critical Path Tests First:**
   - Start with Purchase Flow
   - Then Authentication
   - Then Library Access

2. **Document Issues Clearly:**
   - Include screenshots
   - Note browser/viewport
   - Include error messages

3. **Focus on Accuracy for AI Concierge:**
   - Test weather queries (should be accurate)
   - Test ski conditions (will likely be outdated)
   - Flag outdated data clearly

4. **Test Edge Cases:**
   - Empty library state
   - No purchased TripKits
   - Gift with no message
   - Access code redemption

5. **Mobile Testing:**
   - Don't forget mobile viewport
   - Test native share API
   - Check touch interactions

---

**This script is designed for automated testing. The Chrome extension agent can run through these scenarios systematically and flag issues.** 🤖✅
