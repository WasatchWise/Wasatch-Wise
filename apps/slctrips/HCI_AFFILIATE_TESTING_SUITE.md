# HCI Affiliate Testing Suite 💰

**Purpose:** Comprehensive testing and monitoring for affiliate revenue streams  
**Focus:** Ensure affiliate links work, track performance, and maximize revenue  
**Date:** January 2026  
**Priority:** CRITICAL (Revenue Impact)

---

## 🎯 AFFILIATE TESTING OVERVIEW

### Affiliate Partners to Test:
1. **AWIN/Booking.com** - Hotels, Car Rentals, Flights (Primary Revenue)
2. **Amazon** - Gear recommendations
3. **Viator** - Tours and activities
4. **Yelp** - Destination links (tracking only)

### Key Metrics to Monitor:
- Click-through rates (CTR)
- Conversion rates
- Revenue per click (RPC)
- Monthly revenue trends
- Link placement effectiveness
- Campaign performance

---

## 📋 TEST SUITE: AFFILIATE LINK FUNCTIONALITY

### Test AF1: Homepage Affiliate Links
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
- ❌ Missing AWIN tracking parameters
- ❌ Links don't open correctly
- ❌ Analytics not tracking
- ❌ Wrong merchant ID

---

### Test AF2: Destination Page Affiliate Links
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
4. **Test Car Rentals Link:**
   - [ ] Car rental link present (if applicable)
   - [ ] Uses AWIN tracking
   - [ ] Location parameter correct
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
- ❌ Missing affiliate links on popular destinations
- ❌ Incorrect tracking parameters
- ❌ Broken links
- ❌ Missing destination context in tracking

---

### Test AF3: TripKit Viewer Affiliate Links
**Priority:** HIGH  
**Time:** 6 minutes

**Steps:**
1. Navigate to a TripKit viewer (e.g., `/tripkits/ski-utah-complete/view`)
2. **Check "Enhance Your Visit" section:**
   - [ ] Accommodation recommendations present
   - [ ] Links use affiliate tracking
   - [ ] TripKit context in campaign parameter
3. **Check "What Dan Packs" section (if applicable):**
   - [ ] Gear recommendations visible
   - [ ] Amazon affiliate links work
   - [ ] AWIN links formatted correctly
4. **Verify tracking:**
   - [ ] Campaign parameters include TripKit code
   - [ ] Analytics events fire on clicks

**Expected Results:**
- ✅ TripKit-specific affiliate links functional
- ✅ Context included in tracking
- ✅ Links monetize TripKit content

**Issues to Flag:**
- ❌ Missing affiliate opportunities
- ❌ Generic tracking (no TripKit context)
- ❌ Broken links

---

### Test AF4: Booking Components Affiliate Links
**Priority:** CRITICAL  
**Time:** 5 minutes

**Steps:**
1. Navigate to a destination page
2. **Test BookingAccommodations Component:**
   - [ ] Component visible
   - [ ] "Search Hotels" link present
   - [ ] Link uses `buildBookingAffiliateUrl()`
   - [ ] AWIN tracking correct
3. **Test BookingCarRentals Component:**
   - [ ] Component visible (if applicable)
   - [ ] "Search Car Rentals" link present
   - [ ] Location parameter correct
   - [ ] AWIN tracking correct
4. **Test BookingFlights Component:**
   - [ ] Component visible (if applicable)
   - [ ] "Search Flights" link present
   - [ ] Airport code parameters correct
   - [ ] AWIN tracking correct

**Expected Results:**
- ✅ All booking components functional
- ✅ Consistent AWIN tracking format
- ✅ Location parameters correct

**Issues to Flag:**
- ❌ Components not rendering
- ❌ Incorrect URL parameters
- ❌ Missing AWIN tracking

---

### Test AF5: AWIN MasterTag Implementation
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
- ❌ AWIN script not loading
- ❌ Wrong publisher ID
- ❌ CSP blocking AWIN
- ❌ JavaScript errors

---

### Test AF6: Affiliate Link Tracking & Analytics
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
   - [ ] Event parameters consistent

**Expected Results:**
- ✅ All affiliate clicks tracked in GA4
- ✅ Event parameters complete
- ✅ Consistent tracking across all links

**Issues to Flag:**
- ❌ Missing analytics events
- ❌ Incomplete event parameters
- ❌ Inconsistent tracking

---

### Test AF7: Mobile Affiliate Link Functionality
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
- ❌ Links too small on mobile
- ❌ Tracking broken on mobile
- ❌ Poor mobile UX

---

## 📊 AFFILIATE PERFORMANCE MONITORING

### Test AF8: AWIN Dashboard Verification
**Priority:** CRITICAL  
**Time:** 10 minutes (Manual - Weekly)

**Steps:**
1. **Access AWIN Dashboard:**
   - [ ] Login to AWIN account
   - [ ] Publisher ID: `2060961`
2. **Check Recent Activity:**
   - [ ] Clicks recorded
   - [ ] Conversions tracked
   - [ ] Revenue showing
3. **Review Campaign Performance:**
   - [ ] `slctrips-homepage-cars` campaign
   - [ ] `slctrips-homepage-hotels` campaign
   - [ ] `slctrips-accommodations` campaign
   - [ ] Destination-specific campaigns
4. **Analyze Top Performing Links:**
   - [ ] Which destinations drive most clicks?
   - [ ] Which TripKits drive most bookings?
   - [ ] Homepage vs destination page performance
5. **Check for Issues:**
   - [ ] Declined conversions (check for reasons)
   - [ ] Missing clicks (tracking issues)
   - [ ] Revenue discrepancies

**Expected Results:**
- ✅ Clicks registering in AWIN
- ✅ Conversions tracking correctly
- ✅ Revenue matching expectations
- ✅ No tracking gaps

**Issues to Flag:**
- ❌ No clicks registered (tracking broken)
- ❌ High click, zero conversion (link issues)
- ❌ Missing revenue (commission issues)
- ❌ Declined conversions (need investigation)

---

### Test AF9: Google Analytics Affiliate Reports
**Priority:** HIGH  
**Time:** 5 minutes (Manual - Weekly)

**Steps:**
1. **Access Google Analytics:**
   - [ ] Navigate to GA4 property
   - [ ] Check event reports
2. **Review Affiliate Events:**
   - [ ] Event: `affiliate_click`
   - [ ] Event: `booking_click`
   - [ ] Event parameters populated
3. **Analyze Performance:**
   - [ ] Total affiliate clicks
   - [ ] Click-through rate
   - [ ] Top performing pages
   - [ ] Top performing destinations
4. **Compare with AWIN:**
   - [ ] GA4 clicks vs AWIN clicks (should be similar)
   - [ ] Identify discrepancies

**Expected Results:**
- ✅ Events tracked in GA4
- ✅ Data aligns with AWIN
- ✅ Performance insights available

**Issues to Flag:**
- ❌ Missing events in GA4
- ❌ Large discrepancies with AWIN
- ❌ Incomplete event data

---

### Test AF10: Affiliate Revenue Trends
**Priority:** HIGH  
**Time:** 5 minutes (Manual - Monthly)

**Steps:**
1. **Review Monthly Revenue:**
   - [ ] Current month revenue
   - [ ] Previous month comparison
   - [ ] Year-over-year trend
2. **Identify Patterns:**
   - [ ] Seasonal trends
   - [ ] Best performing days/weeks
   - [ ] Correlation with content updates
3. **Check for Declining Revenue:**
   - [ ] Are clicks declining?
   - [ ] Are conversions declining?
   - [ ] Is revenue per click declining?
4. **Investigate Issues:**
   - [ ] If revenue declining, check:
     - Link placement
     - Link visibility
     - Tracking functionality
     - AWIN account status

**Expected Results:**
- ✅ Revenue trends stable or growing
- ✅ Seasonal patterns identified
- ✅ Declining revenue addressed quickly

**Issues to Flag:**
- ❌ Revenue declining unexpectedly
- ❌ Clicks declining (visibility issues)
- ❌ Conversions declining (link problems)
- ❌ Account issues

---

## 🔍 DEEP DIVE AFFILIATE ANALYSIS

### Test AF11: Link Placement Effectiveness
**Priority:** MEDIUM  
**Time:** 10 minutes (Manual - Monthly)

**Steps:**
1. **Audit Link Placements:**
   - [ ] Homepage affiliate section
   - [ ] Destination pages
   - [ ] TripKit viewer pages
   - [ ] Booking components
2. **Measure Performance by Placement:**
   - [ ] Click-through rate by location
   - [ ] Conversion rate by location
   - [ ] Revenue by placement
3. **Identify Best Performers:**
   - [ ] Which placements drive most revenue?
   - [ ] Which destinations drive most bookings?
   - [ ] Which TripKits monetize best?
4. **Optimization Opportunities:**
   - [ ] Move low-performing links
   - [ ] Add links to high-traffic pages
   - [ ] Test different placements

**Expected Results:**
- ✅ Performance data for all placements
- ✅ Optimization opportunities identified
- ✅ Revenue maximized through placement

**Issues to Flag:**
- ❌ No data for placement
- ❌ Underperforming placements
- ❌ Missing opportunities

---

### Test AF12: Campaign Tracking Accuracy
**Priority:** MEDIUM  
**Time:** 5 minutes (Manual - Monthly)

**Steps:**
1. **Review Campaign Parameters:**
   - [ ] Homepage campaigns: `slctrips-homepage-cars`, `slctrips-homepage-hotels`
   - [ ] Destination campaigns: `slctrips-[destination]`
   - [ ] TripKit campaigns: `slctrips-tripkit-[code]`
   - [ ] Booking component campaigns
2. **Verify Campaign Data in AWIN:**
   - [ ] Campaigns appear in reports
   - [ ] Data segmented correctly
   - [ ] No "unknown" campaigns
3. **Check Campaign Naming:**
   - [ ] Consistent naming convention
   - [ ] Descriptive campaign names
   - [ ] Easy to identify source

**Expected Results:**
- ✅ All campaigns tracked in AWIN
- ✅ Data properly segmented
- ✅ Easy to analyze performance

**Issues to Flag:**
- ❌ Missing campaign parameters
- ❌ Generic campaign names
- ❌ Data not segmented

---

### Test AF13: Affiliate Link Health Check
**Priority:** HIGH  
**Time:** 15 minutes (Automated - Weekly)

**Steps:**
1. **Automated Link Testing:**
   - [ ] Test all AWIN links for validity
   - [ ] Verify tracking parameters present
   - [ ] Check links don't return 404s
   - [ ] Verify merchant ID correct
2. **Manual Spot Checks:**
   - [ ] Sample 10 random affiliate links
   - [ ] Click each link
   - [ ] Verify opens correct page
   - [ ] Check tracking parameters in URL
3. **Check for Broken Links:**
   - [ ] Use link checker tool
   - [ ] Identify any 404s or redirects
   - [ ] Fix broken links immediately

**Expected Results:**
- ✅ All links functional
- ✅ Tracking parameters correct
- ✅ No broken links
- ✅ Consistent link format

**Issues to Flag:**
- ❌ Broken affiliate links (CRITICAL)
- ❌ Missing tracking parameters
- ❌ Wrong merchant IDs
- ❌ Redirects breaking tracking

---

## 💰 REVENUE MAXIMIZATION TESTS

### Test AF14: Affiliate Disclosure Compliance
**Priority:** HIGH  
**Time:** 3 minutes

**Steps:**
1. **Check Affiliate Disclosure:**
   - [ ] Disclosure present on affiliate pages
   - [ ] Disclosure accessible (footer link)
   - [ ] Disclosure clear and prominent
2. **Verify Link Labeling:**
   - [ ] Affiliate links have `rel="sponsored"`
   - [ ] Links open in new tabs
   - [ ] Clear indication links are external
3. **Check Legal Compliance:**
   - [ ] FTC guidelines followed
   - [ ] Disclosure wording appropriate
   - [ ] Disclosure easy to find

**Expected Results:**
- ✅ Disclosure present
- ✅ Links properly labeled
- ✅ Legal compliance met

**Issues to Flag:**
- ❌ Missing disclosure
- ❌ Links not labeled
- ❌ Compliance issues

---

### Test AF15: Conversion Funnel Analysis
**Priority:** MEDIUM  
**Time:** 10 minutes (Manual - Monthly)

**Steps:**
1. **Track User Journey:**
   - [ ] Homepage → Click affiliate link → Booking
   - [ ] Destination page → Click affiliate link → Booking
   - [ ] TripKit viewer → Click affiliate link → Booking
2. **Measure Funnel Metrics:**
   - [ ] Impression to click rate
   - [ ] Click to conversion rate
   - [ ] Overall conversion rate
3. **Identify Drop-off Points:**
   - [ ] Where do users drop off?
   - [ ] Why aren't they clicking?
   - [ ] Why aren't they converting?

**Expected Results:**
- ✅ Funnel metrics measured
- ✅ Drop-off points identified
- ✅ Optimization opportunities found

**Issues to Flag:**
- ❌ High impression, low click (visibility issue)
- ❌ High click, low conversion (link/landing page issue)
- ❌ Overall low conversion (optimization needed)

---

## 📈 REPORTING TEMPLATE

### Weekly Affiliate Report:
```markdown
## Affiliate Performance Report - Week of [Date]

### AWIN/Booking.com Performance
- Total Clicks: [Number]
- Total Conversions: [Number]
- Conversion Rate: [%]
- Revenue: $[Amount]
- Revenue Per Click: $[Amount]

### Top Performing Campaigns
1. [Campaign Name]: $[Revenue]
2. [Campaign Name]: $[Revenue]
3. [Campaign Name]: $[Revenue]

### Top Performing Pages
1. [Page]: [Clicks] clicks, $[Revenue]
2. [Page]: [Clicks] clicks, $[Revenue]
3. [Page]: [Clicks] clicks, $[Revenue]

### Issues Found
- [Issue description]

### Action Items
- [Action item]
```

---

## 🚨 CRITICAL ISSUES TO FLAG IMMEDIATELY

### Revenue Blockers (Fix Immediately):
1. ❌ AWIN MasterTag not loading
2. ❌ All affiliate links broken
3. ❌ No clicks registering in AWIN
4. ❌ Zero revenue (tracking broken)
5. ❌ AWIN account suspended/disabled

### High Priority Issues (Fix This Week):
1. ⚠️ Declining click-through rate
2. ⚠️ Declining conversion rate
3. ⚠️ Broken links on popular pages
4. ⚠️ Missing affiliate links on high-traffic pages
5. ⚠️ Tracking discrepancies between GA4 and AWIN

### Medium Priority (Address This Month):
1. 📝 Low-performing placements
2. 📝 Missing campaign parameters
3. 📝 Optimization opportunities
4. 📝 Mobile affiliate experience improvements

---

## 🔧 AFFILIATE HEALTH CHECKS

### Daily Checks:
- [ ] AWIN dashboard: Any errors or warnings?
- [ ] Google Analytics: Affiliate events firing?

### Weekly Checks:
- [ ] Review AWIN performance data
- [ ] Check for broken affiliate links
- [ ] Verify top performers still working
- [ ] Review revenue trends

### Monthly Checks:
- [ ] Comprehensive link audit
- [ ] Performance analysis by placement
- [ ] Campaign optimization review
- [ ] Revenue trend analysis
- [ ] Competition comparison (if data available)

---

## 📝 QUICK REFERENCE

### AWIN Configuration:
- **Publisher ID:** `2060961`
- **Booking.com Merchant ID:** `6776`
- **MasterTag:** Loaded in layout
- **Tracking Format:** `awin1.com/cread.php?awinmid=[merchant]&awinaffid=[publisher]&campaign=[name]&ued=[destination-url]`

### Amazon Configuration:
- **Affiliate Tag:** `wasatchwise-20`
- **Tracking Format:** `amazon.com/s?k=[search]&tag=wasatchwise-20`

### Viator Configuration:
- **API Key:** `VIATOR_API_KEY` env variable
- **Tracking:** Via Viator API integration

### Key URLs:
- AWIN Dashboard: https://www.awin.com
- Google Analytics: [Your GA4 Property]
- Booking.com Partner Hub: https://www.booking.com/affiliate-program

---

## ✅ SUCCESS CRITERIA

### Must Pass (Critical):
- ✅ All affiliate links functional
- ✅ AWIN MasterTag loading
- ✅ Clicks registering in AWIN
- ✅ Conversions tracking
- ✅ Revenue generating

### Should Pass (High Priority):
- ✅ Analytics tracking complete
- ✅ Campaign parameters correct
- ✅ Mobile experience works
- ✅ No broken links
- ✅ Compliance met

### Nice to Have:
- ✅ Optimal link placements
- ✅ High conversion rates
- ✅ Growing revenue trends
- ✅ Detailed performance insights

---

**Ready for comprehensive affiliate testing!** 💰✅

This suite ensures your affiliate revenue streams are healthy, tracked properly, and optimized for maximum performance.
