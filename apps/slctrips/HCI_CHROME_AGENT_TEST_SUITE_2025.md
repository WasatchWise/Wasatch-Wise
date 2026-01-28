# HCI Test Suite for Claude Chrome Agent 🤖

**Purpose:** Comprehensive HCI/usability testing script for Claude Chrome Extension Agent  
**Target:** SLCTrips.com Production Site  
**Date:** January 2025  
**Estimated Time:** 90-120 minutes for full suite

---

## 🎯 TESTING OVERVIEW

### Test Categories:
1. **Critical Path** - Revenue & Core Functionality (30 min)
2. **Affiliate Performance** - Revenue Generation & Tracking (25 min) 💰
3. **User Flows** - Complete User Journeys (25 min)
4. **Content & Accuracy** - Information Quality (20 min)
5. **Accessibility & UX** - Usability Standards (15 min)
6. **Edge Cases** - Error Handling & Boundaries (10 min)

### Success Criteria:
- ✅ All critical paths must pass
- ⚠️ High priority items should pass
- 📝 Document all issues with severity levels

---

## 📋 TEST SUITE 1: CRITICAL PATH TESTS

### Test 1.1: Homepage Load & Navigation
**Priority:** CRITICAL  
**Time:** 3 minutes

**Steps:**
1. Navigate to `https://www.slctrips.com`
2. **Verify:**
   - [ ] Page loads within 3 seconds
   - [ ] Hero section displays: "1 Airport • 1000+ Destinations"
   - [ ] "Explore Destinations" button visible and clickable
   - [ ] "Get Your TripKit" button visible and clickable
   - [ ] Header navigation visible (TripKits, Destinations, About, Sign In)
   - [ ] No console errors
   - [ ] No broken images

**Expected Results:**
- ✅ Homepage loads completely
- ✅ All primary CTAs visible
- ✅ Navigation functional

**Issues to Flag:**
- ❌ Page load > 5 seconds
- ❌ Missing CTAs
- ❌ Console errors
- ❌ Broken images

---

### Test 1.2: TripKit Purchase Flow
**Priority:** CRITICAL  
**Time:** 8 minutes

**Steps:**
1. Navigate to `/tripkits`
2. **Verify:** TripKits page loads with TripKit cards
3. Click on a paid TripKit (e.g., "Morbid Misdeeds" or "Ski Utah Complete")
4. **Verify:** TripKit detail page loads
5. **Check:** Purchase button visible ("Purchase TripKit" or "Buy Now")
6. Click purchase button
7. **If not authenticated:**
   - [ ] Redirected to `/auth/signin`
   - [ ] Can sign in or sign up
8. **If authenticated:**
   - [ ] Stripe checkout loads
   - [ ] Can enter test card: `4242 4242 4242 4242`
   - [ ] Payment processes successfully
9. **After payment:**
   - [ ] Success page appears (`/checkout/success`)
   - [ ] Access code displayed (format: `TK-XXXX-XXXX`)
   - [ ] "Access Your TripKit" button works
   - [ ] Redirects to TripKit viewer or `/account/my-tripkits`

**Expected Results:**
- ✅ Purchase flow completes end-to-end
- ✅ Access code generated and displayed
- ✅ TripKit accessible after purchase

**Issues to Flag:**
- ❌ Purchase button missing
- ❌ Checkout doesn't load
- ❌ Payment fails
- ❌ Access code not generated
- ❌ TripKit not accessible after purchase

---

### Test 1.3: Authentication Flow
**Priority:** CRITICAL  
**Time:** 5 minutes

**Steps:**
1. Navigate to `/auth/signin`
2. **Verify:** Sign-in form visible
3. **Test Sign Up:**
   - Click "Sign Up" link
   - Fill form with test email: `test+${Date.now()}@example.com`
   - Enter password: `TestPassword123!`
   - Submit form
   - [ ] Account created successfully
   - [ ] Redirected appropriately
4. **Test Sign In:**
   - Sign in with created account
   - [ ] Sign in successful
   - [ ] Redirected to intended destination or `/account/my-tripkits`
5. **Test Password Reset:**
   - Click "Forgot Password"
   - Enter email
   - [ ] Reset email instructions shown
   - [ ] Can navigate back to sign in

**Expected Results:**
- ✅ Sign up creates account
- ✅ Sign in works
- ✅ Password reset flow functional

**Issues to Flag:**
- ❌ Form validation errors unclear
- ❌ Sign up fails silently
- ❌ Sign in doesn't work
- ❌ No error messages

---

### Test 1.3a: Account Authentication - Sign Up
**Priority:** CRITICAL  
**Time:** 4 minutes

**Steps:**
1. Navigate to `/auth/signup`
2. **Verify:** Sign-up form visible with fields:
   - [ ] Email input
   - [ ] Password input
   - [ ] Confirm password input (if present)
   - [ ] Submit button
3. **Test Form Validation:**
   - Try submitting empty form
   - [ ] Validation errors appear
   - [ ] Error messages clear
4. **Test Invalid Email:**
   - Enter invalid email: `invalid-email`
   - [ ] Email validation error appears
5. **Test Weak Password:**
   - Enter weak password: `12345`
   - [ ] Password strength validation appears
6. **Test Successful Sign Up:**
   - Enter valid email: `test+signup${Date.now()}@example.com`
   - Enter strong password: `TestPassword123!`
   - Submit form
   - [ ] Account created successfully
   - [ ] Success message appears
   - [ ] Redirected to appropriate page (homepage or account page)
   - [ ] User is authenticated (check for user menu/avatar)

**Expected Results:**
- ✅ Form validation works
- ✅ Account creation successful
- ✅ User authenticated after signup
- ✅ Redirect works correctly

**Issues to Flag:**
- ❌ No form validation
- ❌ Account creation fails
- ❌ User not authenticated after signup
- ❌ No redirect or wrong redirect

---

### Test 1.3b: Account Authentication - Sign In
**Priority:** CRITICAL  
**Time:** 5 minutes

**Steps:**
1. Navigate to `/auth/signin`
2. **Verify:** Sign-in form visible
3. **Test Invalid Credentials:**
   - Enter wrong email: `wrong@example.com`
   - Enter any password
   - Submit
   - [ ] Error message appears
   - [ ] Error message is clear ("Invalid email or password")
4. **Test Wrong Password:**
   - Enter correct email
   - Enter wrong password
   - Submit
   - [ ] Error message appears
   - [ ] Error message is clear
5. **Test Successful Sign In:**
   - Enter valid credentials
   - Submit
   - [ ] Sign in successful
   - [ ] Redirected to intended destination or `/account/my-tripkits`
   - [ ] User menu/avatar visible in header
   - [ ] Can access protected pages
6. **Test "Remember Me" (if present):**
   - Check "Remember Me" checkbox
   - Sign in
   - Close browser
   - Reopen and navigate to site
   - [ ] Still signed in (session persisted)

**Expected Results:**
- ✅ Error handling works
- ✅ Sign in successful with valid credentials
- ✅ User authenticated
- ✅ Protected pages accessible
- ✅ Session persists (if "Remember Me" used)

**Issues to Flag:**
- ❌ No error messages for invalid credentials
- ❌ Sign in fails with valid credentials
- ❌ User not authenticated
- ❌ Protected pages not accessible
- ❌ Session doesn't persist

---

### Test 1.3c: Account Authentication - Password Reset
**Priority:** HIGH  
**Time:** 4 minutes

**Steps:**
1. Navigate to `/auth/signin`
2. Click "Forgot Password" or navigate to `/auth/reset-password`
3. **Verify:** Password reset form visible
4. **Test Invalid Email:**
   - Enter invalid email
   - Submit
   - [ ] Validation error appears
5. **Test Non-existent Email:**
   - Enter email that doesn't exist: `nonexistent${Date.now()}@example.com`
   - Submit
   - [ ] Success message appears (for security, don't reveal if email exists)
   - [ ] Message indicates email sent if account exists
6. **Test Valid Email:**
   - Enter valid email from test account
   - Submit
   - [ ] Success message appears
   - [ ] Message indicates check email for reset link
7. **Test Reset Link (if accessible):**
   - Check email for reset link
   - Click reset link
   - [ ] Reset password page loads
   - [ ] Can enter new password
   - [ ] Can confirm new password
   - [ ] Password reset successful
   - [ ] Can sign in with new password

**Expected Results:**
- ✅ Password reset form works
- ✅ Email sent for valid accounts
- ✅ Reset link works
- ✅ Password can be changed
- ✅ Can sign in with new password

**Issues to Flag:**
- ❌ Reset form doesn't work
- ❌ No email sent
- ❌ Reset link doesn't work
- ❌ Password reset fails
- ❌ Can't sign in with new password

---

### Test 1.3d: Account Settings & Profile
**Priority:** HIGH  
**Time:** 6 minutes

**Steps:**
1. Sign in to test account
2. Navigate to `/account/settings`
3. **Verify:** Settings page loads
4. **Test Profile Information:**
   - [ ] Current email displayed
   - [ ] Can view profile information
   - [ ] Form fields are editable (if applicable)
5. **Test Password Change:**
   - Locate password change section
   - Enter current password
   - Enter new password: `NewPassword123!`
   - Confirm new password
   - Submit
   - [ ] Password changed successfully
   - [ ] Success message appears
   - [ ] Can sign out and sign in with new password
6. **Test Email Update (if available):**
   - Locate email update section
   - Enter new email
   - Submit
   - [ ] Email update process works
   - [ ] Verification email sent (if required)
7. **Test Account Deletion (if available):**
   - Locate account deletion option
   - [ ] Warning message appears
   - [ ] Confirmation required
   - [ ] Can cancel deletion

**Expected Results:**
- ✅ Settings page accessible
- ✅ Profile information visible
- ✅ Password can be changed
- ✅ Email can be updated (if feature exists)
- ✅ Account deletion protected (if feature exists)

**Issues to Flag:**
- ❌ Settings page doesn't load
- ❌ Can't change password
- ❌ Password change fails
- ❌ Email update doesn't work
- ❌ No confirmation for account deletion

---

### Test 1.3e: Account Session Management
**Priority:** HIGH  
**Time:** 4 minutes

**Steps:**
1. Sign in to test account
2. **Test Sign Out:**
   - Click user menu/avatar
   - Click "Sign Out" or "Logout"
   - [ ] Sign out successful
   - [ ] Redirected to homepage or sign-in page
   - [ ] User menu no longer visible
   - [ ] Protected pages redirect to sign-in
3. **Test Session Expiry:**
   - Sign in
   - Wait for session to expire (or manually clear session)
   - Try to access protected page: `/account/my-tripkits`
   - [ ] Redirected to sign-in page
   - [ ] Message indicates session expired (if applicable)
4. **Test Multiple Tabs:**
   - Sign in in one tab
   - Open new tab
   - Navigate to site
   - [ ] User authenticated in new tab
   - Sign out in one tab
   - [ ] User signed out in all tabs (if session sync enabled)

**Expected Results:**
- ✅ Sign out works
- ✅ Session expiry handled gracefully
- ✅ Multiple tabs sync authentication state

**Issues to Flag:**
- ❌ Sign out doesn't work
- ❌ Session expiry not handled
- ❌ Multiple tabs don't sync
- ❌ Can access protected pages after sign out

---

### Test 1.4: Library Access
**Priority:** CRITICAL  
**Time:** 4 minutes

**Steps:**
1. Sign in to account with purchased TripKits
2. Navigate to `/account/my-tripkits`
3. **Verify:**
   - [ ] Library page loads
   - [ ] Purchased TripKits visible
   - [ ] TripKit cards show:
     - Cover image
     - Name
     - Tagline
     - Destination count
     - Access badge (Purchased/Redeemed)
4. Click "View TripKit" on a purchased TripKit
5. **Verify:**
   - [ ] TripKit viewer loads
   - [ ] Destinations list visible
   - [ ] Deep Dive Stories section visible
   - [ ] Navigation works

**Expected Results:**
- ✅ Library displays all purchased TripKits
- ✅ Can access TripKit content
- ✅ All features functional

**Issues to Flag:**
- ❌ Library doesn't load
- ❌ TripKits missing
- ❌ Can't access content
- ❌ Navigation broken

---

### Test 1.5: Free TripKit Access (TK-000)
**Priority:** CRITICAL  
**Time:** 3 minutes

**Steps:**
1. Navigate to `/tripkits/tk-000` or `/tripkits/meet-the-mt-olympians`
2. **Verify:** TripKit page loads
3. **Check:** Email gate form appears (if not already accessed)
4. Enter test email: `test+free${Date.now()}@example.com`
5. Submit form
6. **Verify:**
   - [ ] Instant access granted (no payment)
   - [ ] TripKit content displays
   - [ ] Can view all 29 destinations
   - [ ] Educational content accessible

**Expected Results:**
- ✅ Free access works without payment
- ✅ Content fully accessible
- ✅ Email captured

**Issues to Flag:**
- ❌ Payment required (should be free)
- ❌ Access not granted
- ❌ Content missing

---

## 📋 TEST SUITE 2: AFFILIATE PERFORMANCE TESTS 💰

**Priority:** CRITICAL (Revenue Impact)  
**Time:** ~25 minutes

### Test 2.0: Homepage Affiliate Links
**Priority:** CRITICAL  
**Time:** 5 minutes

**Steps:**
1. Navigate to homepage (`/`)
2. **Locate "Book Your Adventure" section**
3. **Verify Car Rentals Link:**
   - [ ] "Rent a Car" button visible
   - [ ] Link uses AWIN tracking format
   - [ ] Click link → Opens Booking.com car rentals
   - [ ] URL contains AWIN tracking parameters:
     - `awinmid=6776` (Booking.com merchant ID)
     - `awinaffid=2060961` (Publisher ID)
     - `campaign=slctrips-homepage-cars`
   - [ ] Opens in new tab (`target="_blank"`)
   - [ ] Has `rel="noopener noreferrer sponsored"`
4. **Verify Hotels Link:**
   - [ ] "Find Hotels" button visible
   - [ ] Link uses AWIN tracking format
   - [ ] Click link → Opens Booking.com hotels
   - [ ] URL contains AWIN tracking parameters
   - [ ] Campaign parameter: `slctrips-homepage-hotels`
5. **Verify Google Analytics Tracking:**
   - [ ] Open browser DevTools → Network tab
   - [ ] Click affiliate link
   - [ ] Verify `gtag` event fired:
     - Event: `booking_click`
     - Category: `Homepage Affiliate`
     - Label: `Car Rentals` or `Hotels`

**Expected Results:**
- ✅ All affiliate links functional
- ✅ AWIN tracking parameters correct
- ✅ Analytics tracking works
- ✅ Links open in new tabs

**Issues to Flag:**
- ❌ Missing AWIN tracking parameters (CRITICAL)
- ❌ Links don't open correctly
- ❌ Analytics not tracking
- ❌ Wrong merchant ID (CRITICAL)

---

### Test 2.1: Destination Page Affiliate Links
**Priority:** CRITICAL  
**Time:** 8 minutes

**Steps:**
1. Navigate to a destination page (e.g., `/destinations/park-city`)
2. **Locate "Enhance Your Visit" section**
3. **Verify Accommodation Links:**
   - [ ] Booking.com hotel search link visible
   - [ ] Link uses AWIN tracking
   - [ ] Destination name included in tracking
   - [ ] Campaign parameter specific to destination
   - [ ] Click link → Opens Booking.com with destination
4. **Test Car Rentals Link:**
   - [ ] Car rental link present (if applicable)
   - [ ] Uses AWIN tracking
   - [ ] Location parameter correct
   - [ ] Click link → Opens Booking.com car rentals
5. **Test Viator Tours Link:**
   - [ ] "Tours & Activities" link visible (if applicable)
   - [ ] Uses Viator affiliate tracking
   - [ ] Destination name in search
6. **Test Amazon Gear Links (if present):**
   - [ ] "What Dan Packs" section visible
   - [ ] Gear recommendations have affiliate links
   - [ ] Amazon links include `tag=wasatchwise-20`
   - [ ] AWIN links formatted correctly (if using AWIN for Amazon)

**Expected Results:**
- ✅ All destination affiliate links work
- ✅ Tracking parameters include destination context
- ✅ Links open correctly
- ✅ Campaign tracking specific to destination

**Issues to Flag:**
- ❌ Missing affiliate links on popular destinations (CRITICAL)
- ❌ Incorrect tracking parameters
- ❌ Broken links
- ❌ Missing destination context in tracking

---

### Test 2.2: TripKit Viewer Affiliate Links
**Priority:** HIGH  
**Time:** 6 minutes

**Steps:**
1. Navigate to a TripKit viewer (e.g., `/tripkits/ski-utah-complete/view`)
2. **Check "Enhance Your Visit" section:**
   - [ ] Accommodation recommendations present
   - [ ] Links use affiliate tracking
   - [ ] TripKit context in campaign parameter
   - [ ] Click link → Opens Booking.com
3. **Check "What Dan Packs" section (if applicable):**
   - [ ] Gear recommendations visible
   - [ ] Amazon affiliate links work
   - [ ] AWIN links formatted correctly
   - [ ] Click link → Opens Amazon/merchant with tracking
4. **Verify tracking:**
   - [ ] Campaign parameters include TripKit code
   - [ ] Analytics events fire on clicks
   - [ ] Check Network tab for gtag events

**Expected Results:**
- ✅ TripKit-specific affiliate links functional
- ✅ Context included in tracking
- ✅ Links monetize TripKit content
- ✅ Analytics tracking works

**Issues to Flag:**
- ❌ Missing affiliate opportunities
- ❌ Generic tracking (no TripKit context)
- ❌ Broken links
- ❌ Analytics not tracking

---

### Test 2.3: AWIN MasterTag Implementation
**Priority:** CRITICAL  
**Time:** 3 minutes

**Steps:**
1. Navigate to any page
2. Open browser DevTools → Sources/Network tab
3. **Verify AWIN MasterTag:**
   - [ ] AWIN script loads: `awin1.com/[publisher-id].js`
   - [ ] Publisher ID correct: `2060961`
   - [ ] Script loads in `<head>` or after page load
   - [ ] No console errors related to AWIN
4. **Verify AWIN DataLayer:**
   - [ ] Check for `AWIN_DataLayer` in console
   - [ ] No JavaScript errors
5. **Check CSP Headers:**
   - [ ] `awin1.com` allowed in Content Security Policy
   - [ ] No CSP violations for AWIN

**Expected Results:**
- ✅ AWIN MasterTag loads correctly
- ✅ No JavaScript errors
- ✅ CSP allows AWIN domain

**Issues to Flag:**
- ❌ AWIN script not loading (CRITICAL - revenue loss)
- ❌ Wrong publisher ID (CRITICAL)
- ❌ CSP blocking AWIN (CRITICAL)
- ❌ JavaScript errors

---

### Test 2.4: Affiliate Link Analytics Tracking
**Priority:** HIGH  
**Time:** 5 minutes

**Steps:**
1. Open browser DevTools → Network tab
2. Filter for Google Analytics requests
3. **Click multiple affiliate links:**
   - Homepage car rentals
   - Homepage hotels
   - Destination accommodation link
   - TripKit gear link
4. **Verify Analytics Events:**
   - [ ] Each click fires `affiliate_click` or `booking_click` event
   - [ ] Event includes:
     - `event_category`: "Affiliate" or "Homepage Affiliate"
     - `event_label`: Platform name (e.g., "booking", "amazon", "viator")
     - `destination_id`: Destination identifier
     - `destination_name`: Destination name
5. **Check Event Consistency:**
   - [ ] All affiliate clicks tracked
   - [ ] No missing events
   - [ ] Event parameters complete

**Expected Results:**
- ✅ All affiliate clicks tracked in GA4
- ✅ Event parameters complete
- ✅ Consistent tracking across all links

**Issues to Flag:**
- ❌ Missing analytics events (HIGH - can't optimize)
- ❌ Incomplete event parameters
- ❌ Inconsistent tracking

---

### Test 2.5: Mobile Affiliate Link Functionality
**Priority:** HIGH  
**Time:** 4 minutes

**Steps:**
1. Set viewport to mobile (375x667)
2. Navigate to homepage
3. **Test Mobile Links:**
   - [ ] Affiliate links visible on mobile
   - [ ] Touch targets adequate (44x44px minimum)
   - [ ] Links don't overlap
   - [ ] Text readable
4. **Test Mobile Clicks:**
   - [ ] Tap affiliate links
   - [ ] Links open correctly
   - [ ] Tracking works on mobile
5. **Test Mobile Booking Components:**
   - [ ] Components responsive
   - [ ] Links accessible
   - [ ] Tracking functional

**Expected Results:**
- ✅ Mobile affiliate experience works
- ✅ Touch targets adequate
- ✅ Tracking works on mobile

**Issues to Flag:**
- ❌ Links too small on mobile (HIGH - lost revenue)
- ❌ Tracking broken on mobile
- ❌ Poor mobile UX

---

## 📋 TEST SUITE 3: USER FLOW TESTS

### Test 3.1: Complete New User Journey
**Priority:** HIGH  
**Time:** 10 minutes

**Steps:**
1. Start as anonymous user on homepage
2. Browse destinations (`/destinations`)
3. Click on a destination
4. **Verify:** Destination detail page loads
5. Navigate to TripKits page
6. View free TripKit (TK-000)
7. Enter email for free access
8. Browse purchased TripKit content
9. Navigate to paid TripKit
10. Purchase TripKit (use test card)
11. Access purchased TripKit
12. Check library (`/account/my-tripkits`)

**Expected Results:**
- ✅ Complete journey works smoothly
- ✅ No dead ends
- ✅ Clear navigation throughout

**Issues to Flag:**
- ❌ Navigation breaks
- ❌ Dead ends
- ❌ Confusing flow

---

### Test 3.2: Gift Purchase Flow
**Priority:** MEDIUM  
**Time:** 7 minutes

**Steps:**
1. Navigate to a paid TripKit page
2. **Check:** "Buy as Gift" or "Gift" button visible
3. Click gift button
4. **Verify:** Gift form appears with fields:
   - Sender name
   - Recipient email
   - Gift message (optional)
5. Fill form:
   - Sender: "Test Gifter"
   - Recipient: `recipient+${Date.now()}@example.com`
   - Message: "Enjoy this TripKit!"
6. Complete purchase
7. **Verify:** Gift success page shows access code
8. **Test Gift Reveal:**
   - Navigate to `/gift/reveal/[access-code]`
   - [ ] Gift reveal page loads
   - [ ] Can open gift
   - [ ] TripKit details revealed
   - [ ] Can access TripKit

**Expected Results:**
- ✅ Gift purchase works
- ✅ Gift reveal functional
- ✅ Recipient can access TripKit

**Issues to Flag:**
- ❌ Gift button missing
- ❌ Gift form incomplete
- ❌ Gift reveal broken
- ❌ Access code doesn't work

---

### Test 3.3: Access Code Redemption
**Priority:** HIGH  
**Time:** 4 minutes

**Steps:**
1. Get access code from:
   - Purchase success page, OR
   - Email confirmation
2. Navigate to `/tk/[access-code]`
3. **Verify:**
   - [ ] Access code page loads
   - [ ] TripKit name displays
   - [ ] Can access TripKit content
4. **Test Invalid Code:**
   - Navigate to `/tk/INVALID-CODE`
   - [ ] Error message appears
   - [ ] Message is helpful
   - [ ] Suggests alternatives

**Expected Results:**
- ✅ Valid codes work
- ✅ Invalid codes handled gracefully
- ✅ Error messages helpful

**Issues to Flag:**
- ❌ Valid codes don't work
- ❌ Invalid codes crash
- ❌ No error handling

---

### Test 3.4: Welcome Wagon Flows
**Priority:** MEDIUM  
**Time:** 8 minutes

**Steps:**
1. Navigate to `/welcome-wagon`
2. **Test Free Guide:**
   - Click "Get Free Guide"
   - Enter email: `welcome+${Date.now()}@example.com`
   - Enter name: "Test User"
   - Submit
   - [ ] Success message appears
   - [ ] Email received (check inbox/spam)
3. **Test 90-Day Reservation:**
   - Click "Reserve Yours Now"
   - Enter email and name
   - Submit
   - [ ] Success message appears
   - [ ] Reservation recorded
4. **Test Corporate Inquiry:**
   - Click "Contact for Corporate Pricing"
   - Fill form with company info
   - Submit
   - [ ] Success message appears
   - [ ] Inquiry recorded

**Expected Results:**
- ✅ All Welcome Wagon forms work
- ✅ Emails arrive (for free guide)
- ✅ Database records created

**Issues to Flag:**
- ❌ Forms don't submit
- ❌ Emails not sent
- ❌ No success messages

---

## 📋 TEST SUITE 4: CONTENT & ACCURACY TESTS

### Test 4.1: AI Concierge Accuracy
**Priority:** HIGH  
**Time:** 12 minutes

**Steps:**
1. Navigate to a TripKit viewer page
2. **Verify:** Dan Concierge button visible (bottom right)
3. Click Dan Concierge button
4. **Verify:** Chat window opens
5. **Test Weather Query:**
   - Ask: "What's the weather in Salt Lake City?"
   - [ ] Response includes temperature
   - [ ] Response includes conditions
   - [ ] Compare with actual weather (should be accurate)
6. **Test Destination Search:**
   - Ask: "Find hiking destinations in my TripKit"
   - [ ] Response lists destinations from TripKit
   - [ ] All destinations are actually in TripKit
   - [ ] Should be 100% accurate
7. **Test TripKit-Specific Query:**
   - Ask: "Recommend something from my TripKit"
   - [ ] Response references TripKit destinations
   - [ ] Recommendations are relevant
8. **Test Ski Conditions (Flag Expected Issues):**
   - Ask: "What are the ski conditions at Snowbird?"
   - [ ] Response includes conditions
   - ⚠️ **FLAG:** Likely outdated (hardcoded data)
9. **Test Canyon Status (Flag Expected Issues):**
   - Ask: "How's traffic in Little Cottonwood Canyon?"
   - [ ] Response includes traffic info
   - ⚠️ **FLAG:** May be estimated/inaccurate
10. **Test Events (Flag Expected Issues):**
    - Ask: "What's happening in Salt Lake City today?"
    - [ ] Response lists events
    - ⚠️ **FLAG:** May be outdated

**Expected Results:**
- ✅ Weather queries accurate (95%+)
- ✅ Destination search 100% accurate
- ⚠️ Ski conditions may be outdated (FLAG)
- ⚠️ Canyon status may be inaccurate (FLAG)
- ⚠️ Events may be outdated (FLAG)

**Issues to Flag:**
- ❌ Chat doesn't open
- ❌ No responses
- ❌ Weather data incorrect
- ⚠️ Ski conditions outdated (expected)
- ⚠️ Canyon status inaccurate (expected)
- ⚠️ Events outdated (expected)

---

### Test 4.2: Content Completeness
**Priority:** MEDIUM  
**Time:** 6 minutes

**Steps:**
1. Navigate to a TripKit viewer
2. **Verify Deep Dive Stories:**
   - [ ] Stories section visible
   - [ ] Story count matches expected
   - [ ] Click on a story
   - [ ] Full story content loads (not truncated)
   - [ ] Story includes: title, content, reading time
3. **Verify Destinations:**
   - [ ] Destinations list visible
   - [ ] Destination count matches expected
   - [ ] Click on a destination
   - [ ] Destination details load
   - [ ] Information complete (name, description, location)
4. **Verify Images:**
   - [ ] Images load correctly
   - [ ] No broken images
   - [ ] Images have alt text

**Expected Results:**
- ✅ All content accessible
- ✅ Content complete
- ✅ Images load

**Issues to Flag:**
- ❌ Missing content
- ❌ Truncated stories
- ❌ Broken images
- ❌ Missing alt text

---

### Test 4.3: Destination Information Accuracy
**Priority:** MEDIUM  
**Time:** 4 minutes

**Steps:**
1. Navigate to `/destinations`
2. Click on a destination
3. **Verify:**
   - [ ] Destination name correct
   - [ ] Location information accurate
   - [ ] Description/story complete
   - [ ] Drive time accurate
   - [ ] Distance accurate
   - [ ] Images relevant
4. **Test Search:**
   - Use search to find specific destination
   - [ ] Search results relevant
   - [ ] Can navigate to destination

**Expected Results:**
- ✅ Information accurate
- ✅ Search works
- ✅ Navigation functional

**Issues to Flag:**
- ❌ Incorrect information
- ❌ Search broken
- ❌ Navigation issues

---

## 📋 TEST SUITE 5: ACCESSIBILITY & UX TESTS

### Test 5.1: Keyboard Navigation
**Priority:** HIGH  
**Time:** 5 minutes

**Steps:**
1. Navigate to homepage
2. **Test Tab Navigation:**
   - Press Tab repeatedly
   - [ ] Focus moves logically
   - [ ] Focus indicators visible
   - [ ] Can navigate to all interactive elements
3. **Test Form Navigation:**
   - Navigate to sign-in page
   - [ ] Can tab through all form fields
   - [ ] Can submit with Enter key
4. **Test Skip Links:**
   - [ ] Skip to main content link visible (if present)
   - [ ] Skip link works

**Expected Results:**
- ✅ Keyboard navigation works
- ✅ Focus indicators visible
- ✅ All elements accessible

**Issues to Flag:**
- ❌ Can't navigate with keyboard
- ❌ No focus indicators
- ❌ Trapped in navigation

---

### Test 5.2: Screen Reader Compatibility
**Priority:** MEDIUM  
**Time:** 4 minutes

**Steps:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate to homepage
3. **Verify:**
   - [ ] Headings announced correctly
   - [ ] Links have descriptive text
   - [ ] Buttons have labels
   - [ ] Images have alt text
   - [ ] Forms have labels
4. Navigate to TripKit page
5. **Verify:**
   - [ ] TripKit cards announced
   - [ ] Can navigate content
   - [ ] Structure makes sense

**Expected Results:**
- ✅ Screen reader compatible
- ✅ Content understandable
- ✅ Navigation logical

**Issues to Flag:**
- ❌ Missing labels
- ❌ No alt text
- ❌ Confusing structure

---

### Test 5.3: Mobile Responsiveness
**Priority:** HIGH  
**Time:** 6 minutes

**Steps:**
1. Set viewport to mobile (375x667 - iPhone SE)
2. Navigate to homepage
3. **Verify:**
   - [ ] Layout responsive
   - [ ] Text readable
   - [ ] Buttons large enough (min 44x44px)
   - [ ] No horizontal scroll
4. Navigate to TripKit page
5. **Verify:**
   - [ ] Cards stack vertically
   - [ ] Content readable
   - [ ] Navigation works
6. **Test Dan Concierge on Mobile:**
   - Click Dan button
   - [ ] Chat window sized appropriately
   - [ ] Input accessible
   - [ ] Keyboard doesn't cover input
7. **Test Native Share:**
   - Click share button
   - [ ] Native share API triggers (if mobile)

**Expected Results:**
- ✅ Mobile layout works
- ✅ Touch targets adequate
- ✅ Forms usable
- ✅ No layout breaks

**Issues to Flag:**
- ❌ Layout broken
- ❌ Text too small
- ❌ Buttons too small
- ❌ Horizontal scroll

---

### Test 5.4: Sharing Features
**Priority:** MEDIUM  
**Time:** 4 minutes

**Steps:**
1. Navigate to TripKit viewer
2. **Verify:** Share button visible
3. Click share button
4. **Verify:** Share dropdown appears with options:
   - [ ] Twitter
   - [ ] Facebook
   - [ ] LinkedIn
   - [ ] Reddit
   - [ ] Email
   - [ ] Copy Link
5. **Test Copy Link:**
   - Click "Copy Link"
   - [ ] Link copied to clipboard
   - [ ] Link format correct
6. **Test Social Sharing:**
   - Click "Twitter"
   - [ ] Share dialog opens (or new tab)
   - [ ] Pre-filled text includes TripKit name
7. **Test Story Sharing:**
   - Navigate to Deep Dive Stories
   - [ ] Story cards have share icons
   - [ ] Share works for stories

**Expected Results:**
- ✅ Share buttons visible
- ✅ Share options work
- ✅ Links copy correctly
- ✅ Social sharing functional

**Issues to Flag:**
- ❌ Share buttons missing
- ❌ Dropdown doesn't open
- ❌ Copy link doesn't work
- ❌ Social sharing broken

---

## 📋 TEST SUITE 6: EDGE CASES & ERROR HANDLING

### Test 6.1: Error Handling
**Priority:** HIGH  
**Time:** 6 minutes

**Steps:**
1. **Test Authentication Errors:**
   - Try sign in with wrong password
   - [ ] Error message appears
   - [ ] Error message clear
   - [ ] Can retry
2. **Test Purchase Errors:**
   - Try purchase with declined card (`4000 0000 0000 0002`)
   - [ ] Error message appears
   - [ ] Error message helpful
   - [ ] Can try again
3. **Test 404 Errors:**
   - Navigate to `/tripkits/nonexistent-tripkit`
   - [ ] 404 page appears
   - [ ] 404 page helpful (suggests alternatives)
4. **Test Access Errors:**
   - Try to access TripKit without purchase
   - [ ] "Access Required" message appears
   - [ ] Message suggests purchase
   - [ ] Can navigate to purchase

**Expected Results:**
- ✅ Error messages clear
- ✅ Error messages actionable
- ✅ Can recover from errors

**Issues to Flag:**
- ❌ No error messages
- ❌ Unclear errors
- ❌ Dead ends
- ❌ Can't recover

---

### Test 6.2: Empty States
**Priority:** MEDIUM  
**Time:** 3 minutes

**Steps:**
1. **Test Empty Library:**
   - Sign in with account with no TripKits
   - Navigate to `/account/my-tripkits`
   - [ ] Empty state message appears
   - [ ] Message helpful
   - [ ] "Browse TripKits" button works
2. **Test Empty Search:**
   - Search for non-existent destination
   - [ ] Empty state message appears
   - [ ] Suggests alternatives
3. **Test No Weekly Picks:**
   - Check homepage weekly picks section
   - [ ] Handles empty state gracefully

**Expected Results:**
- ✅ Empty states helpful
- ✅ Clear next steps
- ✅ No dead ends

**Issues to Flag:**
- ❌ No empty state
- ❌ Confusing message
- ❌ No next steps

---

### Test 6.3: Network Error Handling
**Priority:** MEDIUM  
**Time:** 3 minutes

**Steps:**
1. Open browser DevTools
2. Set network to "Offline" or "Slow 3G"
3. Try to navigate pages
4. **Verify:**
   - [ ] Error messages appear
   - [ ] Messages helpful
   - [ ] Can retry when online
5. **Test Form Submission:**
   - Fill form
   - Submit while offline
   - [ ] Error handled gracefully
   - [ ] Can retry when online

**Expected Results:**
- ✅ Network errors handled
- ✅ Clear error messages
- ✅ Can retry

**Issues to Flag:**
- ❌ No error handling
- ❌ White screen
- ❌ Can't recover

---

## 📊 REPORTING TEMPLATE

### For Each Test:

```markdown
**Test ID:** [Test Number]
**Test Name:** [Test Name]
**Priority:** [CRITICAL/HIGH/MEDIUM/LOW]
**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL
**Date:** [Date]
**Browser:** [Chrome Version]
**Viewport:** [Desktop/Mobile]
**Time Taken:** [Minutes]

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
- [Issue 1] - Severity: [CRITICAL/HIGH/MEDIUM/LOW]
- [Issue 2] - Severity: [CRITICAL/HIGH/MEDIUM/LOW]

**Screenshots:**
- [Screenshot URLs if available]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]

**Notes:**
[Additional notes]
```

---

## 🎯 PRIORITY TESTING ORDER

### Phase 1: Critical Path (Must Test First)
1. Test 1.1: Homepage Load & Navigation
2. Test 1.2: TripKit Purchase Flow
3. Test 1.3: Authentication Flow
4. Test 1.3a: Account Authentication - Sign Up
5. Test 1.3b: Account Authentication - Sign In
6. Test 1.4: Library Access
7. Test 1.5: Free TripKit Access

**Time:** ~35 minutes

### Phase 2: High Priority (Affiliate & Revenue)
8. Test 2.0: Homepage Affiliate Links 💰
9. Test 2.1: Destination Page Affiliate Links 💰
10. Test 2.2: TripKit Viewer Affiliate Links 💰
11. Test 2.3: AWIN MasterTag Implementation 💰
12. Test 2.4: Affiliate Link Analytics Tracking 💰
13. Test 2.5: Mobile Affiliate Link Functionality 💰
14. Test 1.3c: Account Authentication - Password Reset
15. Test 1.3d: Account Settings & Profile
16. Test 1.3e: Account Session Management
17. Test 3.1: Complete New User Journey
18. Test 3.3: Access Code Redemption
19. Test 4.1: AI Concierge Accuracy
20. Test 5.1: Keyboard Navigation
21. Test 5.3: Mobile Responsiveness
22. Test 6.1: Error Handling

**Time:** ~90 minutes

### Phase 3: Medium Priority
23. Test 3.2: Gift Purchase Flow
24. Test 3.4: Welcome Wagon Flows
25. Test 4.2: Content Completeness
26. Test 4.3: Destination Information Accuracy
27. Test 5.2: Screen Reader Compatibility
28. Test 5.4: Sharing Features
29. Test 6.2: Empty States
30. Test 6.3: Network Error Handling

**Time:** ~40 minutes

---

## 🔍 AUTOMATED CHECKS

### Page Load Checks:
- [ ] Page loads within 3 seconds
- [ ] No console errors
- [ ] No 404 resources
- [ ] Images load correctly
- [ ] No broken links

### Functionality Checks:
- [ ] Buttons clickable
- [ ] Forms submittable
- [ ] Links work
- [ ] Navigation functional
- [ ] Modals open/close

### Content Checks:
- [ ] Required content visible
- [ ] Text readable (not too small)
- [ ] Images have alt text
- [ ] Headings structured (h1, h2, etc.)
- [ ] No placeholder text in production

### Performance Checks:
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s
- [ ] No layout shifts
- [ ] Images optimized

---

## 📝 QUICK REFERENCE

### Test Cards:
- Stripe Test Card: `4242 4242 4242 4242`
- Declined Card: `4000 0000 0000 0002`
- Test Email Format: `test+${Date.now()}@example.com`

### Key URLs:
- Homepage: `/`
- TripKits: `/tripkits`
- Destinations: `/destinations`
- Sign In: `/auth/signin`
- Sign Up: `/auth/signup`
- Password Reset: `/auth/reset-password`
- Account Settings: `/account/settings`
- Library: `/account/my-tripkits`
- Welcome Wagon: `/welcome-wagon`
- Free TripKit: `/tripkits/tk-000`

### Affiliate Configuration:
- **AWIN Publisher ID:** `2060961`
- **Booking.com Merchant ID:** `6776`
- **Amazon Affiliate Tag:** `wasatchwise-20`
- **AWIN Dashboard:** https://www.awin.com

### Database Verification:
```sql
-- Check purchases
SELECT * FROM purchases ORDER BY purchased_at DESC LIMIT 10;

-- Check access codes
SELECT * FROM tripkit_access_codes ORDER BY created_at DESC LIMIT 10;

-- Check email captures
SELECT * FROM email_captures ORDER BY created_at DESC LIMIT 10;
```

---

## 🚀 EXECUTION GUIDE FOR CHROME AGENT

### Step 1: Preparation
1. Open Chrome DevTools
2. Set up test email accounts
3. Have Stripe test card ready
4. Clear browser cache
5. Open test results document

### Step 2: Execute Tests
1. Follow priority order (Phase 1 → 2 → 3)
2. Document each test result
3. Take screenshots of issues
4. Note console errors
5. Verify database records where applicable

### Step 3: Report Findings
1. Compile all test results
2. Categorize issues by severity
3. Create action items
4. Share report with team

---

## ✅ SUCCESS CRITERIA

### Must Pass (Critical):
- ✅ All Phase 1 tests pass
- ✅ Purchase flow works
- ✅ Authentication works
- ✅ Library access works
- ✅ No critical errors

### Should Pass (High Priority):
- ✅ Most Phase 2 tests pass
- ✅ AI Concierge functional (accuracy noted)
- ✅ Mobile responsive
- ✅ Error handling works

### Nice to Have:
- ✅ All Phase 3 tests pass
- ✅ Perfect accessibility
- ✅ All edge cases handled

---

**Ready for Chrome Agent execution!** 🤖✅

This test suite is designed for systematic execution by the Claude Chrome Extension Agent. Follow the priority order and document all findings.
