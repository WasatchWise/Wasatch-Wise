# HCI Chrome Agent Execution Script 🤖

**Purpose:** Step-by-step execution guide for Claude Chrome Agent  
**Format:** Structured for automated/semi-automated execution  
**Estimated Time:** 90-120 minutes (full suite)

---

## 🎯 EXECUTION STRATEGY

### Mode 1: Full Suite (Recommended)
- Execute all test suites in priority order
- Complete documentation
- Best for comprehensive testing

### Mode 2: Quick Check
- Execute critical path only
- Use `HCI_CHROME_AGENT_QUICK_CHECKLIST.md`
- Best for rapid verification

### Mode 3: Focused Testing
- Execute specific test suites based on recent changes
- Best for targeted validation

---

## 📋 PRE-EXECUTION SETUP

### 1. Environment Preparation
```bash
# Clear browser cache
# Open Chrome DevTools
# Set up test accounts
# Prepare test data
```

### 2. Test Data Preparation
- **Test Emails:** `test+${timestamp}@example.com`
- **Test Card:** `4242 4242 4242 4242`
- **Declined Card:** `4000 0000 0000 0002`
- **Test Password:** `TestPassword123!`

### 3. Tools Setup
- [ ] Chrome DevTools open
- [ ] Network tab monitoring
- [ ] Console tab monitoring
- [ ] Test results document open
- [ ] Screenshot tool ready

---

## 🔄 EXECUTION FLOW

### PHASE 1: CRITICAL PATH (23 min)

#### Test 1.1: Homepage Load & Navigation
**Time:** 3 min

**Actions:**
1. Navigate to `https://www.slctrips.com`
2. Wait for page load (max 5 seconds)
3. Verify elements:
   - Hero text: "1 Airport • 1000+ Destinations"
   - Button: "Explore Destinations"
   - Button: "Get Your TripKit"
   - Header navigation
4. Check console for errors
5. Check network for 404s

**Verification Points:**
- [ ] Page loads < 3 seconds
- [ ] All CTAs visible
- [ ] No console errors
- [ ] No broken images

**Document:**
- Load time: _____ seconds
- Errors found: _____
- Screenshot: [if issues]

---

#### Test 1.2: TripKit Purchase Flow
**Time:** 8 min

**Actions:**
1. Navigate to `/tripkits`
2. Wait for page load
3. Identify paid TripKit (e.g., "Morbid Misdeeds")
4. Click TripKit card
5. Verify detail page loads
6. Locate purchase button
7. Click purchase button
8. **If not authenticated:**
   - Verify redirect to `/auth/signin`
   - Sign in or create account
9. **If authenticated:**
   - Verify Stripe checkout loads
   - Enter test card: `4242 4242 4242 4242`
   - Complete payment
10. Verify success page
11. Verify access code displayed
12. Click "Access Your TripKit"
13. Verify TripKit loads

**Verification Points:**
- [ ] Purchase button visible
- [ ] Checkout loads
- [ ] Payment processes
- [ ] Access code generated
- [ ] TripKit accessible

**Document:**
- TripKit tested: _____
- Access code: _____
- Issues: _____

---

#### Test 1.3: Authentication Flow
**Time:** 5 min

**Actions:**
1. Navigate to `/auth/signin`
2. Verify sign-in form
3. **Test Sign Up:**
   - Click "Sign Up" link
   - Fill form:
     - Email: `test+signup${Date.now()}@example.com`
     - Password: `TestPassword123!`
   - Submit
   - Verify account created
4. **Test Sign In:**
   - Sign in with created account
   - Verify redirect
5. **Test Password Reset:**
   - Click "Forgot Password"
   - Enter email
   - Verify instructions shown

**Verification Points:**
- [ ] Sign up works
- [ ] Sign in works
- [ ] Password reset works
- [ ] Redirects work

**Document:**
- Test email: _____
- Issues: _____

---

#### Test 1.4: Library Access
**Time:** 4 min

**Actions:**
1. Sign in to account with purchased TripKits
2. Navigate to `/account/my-tripkits`
3. Verify library page loads
4. Verify TripKit cards visible
5. Verify card elements:
   - Cover image
   - Name
   - Tagline
   - Destination count
   - Access badge
6. Click "View TripKit"
7. Verify TripKit viewer loads
8. Verify content accessible

**Verification Points:**
- [ ] Library loads
- [ ] TripKits visible
- [ ] Cards complete
- [ ] Navigation works

**Document:**
- TripKits found: _____
- Issues: _____

---

#### Test 1.5: Free TripKit Access
**Time:** 3 min

**Actions:**
1. Navigate to `/tripkits/tk-000`
2. Verify page loads
3. Verify email gate form
4. Enter email: `test+free${Date.now()}@example.com`
5. Submit form
6. Verify instant access
7. Verify content displays
8. Verify all 29 destinations accessible

**Verification Points:**
- [ ] Email gate works
- [ ] Free access granted
- [ ] Content accessible
- [ ] No payment required

**Document:**
- Test email: _____
- Issues: _____

---

### PHASE 2: HIGH PRIORITY (47 min)

#### Test 2.1: Complete New User Journey
**Time:** 10 min

**Actions:**
1. Start as anonymous user
2. Browse destinations
3. View destination detail
4. Navigate to TripKits
5. View free TripKit
6. Get free access
7. Browse content
8. Purchase paid TripKit
9. Access purchased TripKit
10. Check library

**Verification Points:**
- [ ] Complete journey works
- [ ] No dead ends
- [ ] Navigation clear

**Document:**
- Journey completed: [Yes/No]
- Issues: _____

---

#### Test 2.3: Access Code Redemption
**Time:** 4 min

**Actions:**
1. Get access code (from purchase or email)
2. Navigate to `/tk/[access-code]`
3. Verify code works
4. Test invalid code: `/tk/INVALID-CODE`
5. Verify error handling

**Verification Points:**
- [ ] Valid codes work
- [ ] Invalid codes handled
- [ ] Error messages helpful

**Document:**
- Access code tested: _____
- Issues: _____

---

#### Test 3.1: AI Concierge Accuracy
**Time:** 12 min

**Actions:**
1. Navigate to TripKit viewer
2. Locate Dan Concierge button
3. Click to open chat
4. **Test Weather:**
   - Ask: "What's the weather in Salt Lake City?"
   - Verify response
   - Compare with actual weather
5. **Test Destination Search:**
   - Ask: "Find hiking destinations in my TripKit"
   - Verify results from TripKit
6. **Test TripKit Recommendations:**
   - Ask: "Recommend something from my TripKit"
   - Verify recommendations relevant
7. **Test Ski Conditions:**
   - Ask: "What are the ski conditions at Snowbird?"
   - ⚠️ FLAG: Likely outdated
8. **Test Canyon Status:**
   - Ask: "How's traffic in Little Cottonwood Canyon?"
   - ⚠️ FLAG: May be inaccurate
9. **Test Events:**
   - Ask: "What's happening in Salt Lake City today?"
   - ⚠️ FLAG: May be outdated

**Verification Points:**
- [ ] Chat opens
- [ ] Weather accurate (95%+)
- [ ] Destination search 100% accurate
- ⚠️ Ski conditions outdated (FLAG)
- ⚠️ Canyon status inaccurate (FLAG)
- ⚠️ Events outdated (FLAG)

**Document:**
- Weather accuracy: _____
- Destination search accuracy: _____
- Issues flagged: _____

---

#### Test 4.1: Keyboard Navigation
**Time:** 5 min

**Actions:**
1. Navigate to homepage
2. Press Tab repeatedly
3. Verify focus moves logically
4. Verify focus indicators visible
5. Test form navigation
6. Test skip links (if present)

**Verification Points:**
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] All elements accessible

**Document:**
- Issues: _____

---

#### Test 4.3: Mobile Responsiveness
**Time:** 6 min

**Actions:**
1. Set viewport to 375x667 (iPhone SE)
2. Navigate to homepage
3. Verify layout responsive
4. Verify text readable
5. Verify buttons adequate size (44x44px min)
6. Verify no horizontal scroll
7. Test TripKit page
8. Test Dan Concierge on mobile
9. Test native share

**Verification Points:**
- [ ] Layout responsive
- [ ] Touch targets adequate
- [ ] Forms usable
- [ ] No layout breaks

**Document:**
- Issues: _____

---

#### Test 5.1: Error Handling
**Time:** 6 min

**Actions:**
1. **Test Auth Errors:**
   - Sign in with wrong password
   - Verify error message
2. **Test Purchase Errors:**
   - Use declined card: `4000 0000 0000 0002`
   - Verify error message
3. **Test 404:**
   - Navigate to `/tripkits/nonexistent`
   - Verify 404 page
4. **Test Access Errors:**
   - Try to access TripKit without purchase
   - Verify access message

**Verification Points:**
- [ ] Error messages clear
- [ ] Error messages actionable
- [ ] Can recover from errors

**Document:**
- Issues: _____

---

### PHASE 3: MEDIUM PRIORITY (40 min)

[Continue with remaining tests from Test Suite 2-5]

---

## 📊 RESULTS COMPILATION

### After Each Phase:

**Phase 1 Results:**
- Tests Passed: ___/5
- Tests Failed: ___/5
- Critical Issues: ___
- Screenshots: ___

**Phase 2 Results:**
- Tests Passed: ___/6
- Tests Failed: ___/6
- High Priority Issues: ___
- Screenshots: ___

**Phase 3 Results:**
- Tests Passed: ___/8
- Tests Failed: ___/8
- Medium Priority Issues: ___
- Screenshots: ___

---

## 🎯 FINAL REPORT TEMPLATE

```markdown
# HCI Test Execution Report

**Date:** [Date]
**Tester:** Chrome Agent
**Browser:** Chrome [Version]
**Viewport:** Desktop/Mobile
**Total Time:** [Minutes]

## Summary
- Total Tests: ___
- Passed: ___
- Failed: ___
- Warnings: ___

## Critical Issues
1. [Issue description]
2. [Issue description]

## High Priority Issues
1. [Issue description]
2. [Issue description]

## Medium Priority Issues
1. [Issue description]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Screenshots
- [Screenshot links]

## Next Steps
- [Action item 1]
- [Action item 2]
```

---

## 🔄 ITERATION GUIDE

### If Test Fails:
1. Document failure
2. Take screenshot
3. Note console errors
4. Check network requests
5. Verify test data
6. Retry if appropriate
7. Move to next test

### If Test Passes:
1. Document pass
2. Note any warnings
3. Continue to next test

### If Test Partially Passes:
1. Document partial pass
2. Note what worked
3. Note what failed
4. Flag for review

---

**Ready for execution!** 🤖✅

Follow this script systematically for comprehensive testing coverage.
