# Affiliate Monitoring & Revenue Optimization Guide 💰

**Purpose:** Comprehensive guide for monitoring affiliate performance and maximizing revenue  
**Target:** SLCTrips.com Affiliate Programs  
**Update Frequency:** Weekly monitoring, Monthly deep dive

---

## 🎯 QUICK MONITORING CHECKLIST

### Daily Checks (5 minutes):
- [ ] AWIN dashboard: Any errors or warnings?
- [ ] Check for broken affiliate links (automated check)
- [ ] Monitor click trends (declining = problem)

### Weekly Checks (15 minutes):
- [ ] Review AWIN performance data
- [ ] Compare clicks vs conversions
- [ ] Check Google Analytics affiliate events
- [ ] Identify top-performing pages
- [ ] Review revenue trends

### Monthly Deep Dive (60 minutes):
- [ ] Comprehensive performance analysis
- [ ] Revenue trend analysis
- [ ] Campaign performance review
- [ ] Link placement optimization
- [ ] Competitive analysis (if data available)

---

## 📊 KEY METRICS TO MONITOR

### Critical Revenue Metrics:
1. **Total Clicks** - Are people clicking affiliate links?
2. **Conversion Rate** - Are clicks converting to bookings?
3. **Revenue** - Actual earnings from affiliates
4. **Revenue Per Click (RPC)** - Efficiency metric
5. **Click-Through Rate (CTR)** - Link effectiveness

### Performance Indicators:
- **Month-over-Month Revenue Growth** - Are we growing?
- **Top Performing Pages** - Where do clicks come from?
- **Top Performing Campaigns** - Which campaigns work best?
- **Top Performing Destinations** - Which destinations monetize best?
- **Top Performing TripKits** - Which TripKits drive bookings?

---

## 🔍 AWIN DASHBOARD MONITORING

### Weekly AWIN Dashboard Review:

**Step 1: Access AWIN Dashboard**
- Login: https://www.awin.com
- Publisher ID: `2060961`
- Navigate to Reports → Transactions

**Step 2: Check Recent Activity**
- Last 7 days: Clicks, Conversions, Revenue
- Compare to previous week
- Look for anomalies (sudden drops, spikes)

**Step 3: Review Campaign Performance**
- Filter by campaign:
  - `slctrips-homepage-cars`
  - `slctrips-homepage-hotels`
  - `slctrips-accommodations`
  - Destination-specific campaigns
  - TripKit-specific campaigns

**Step 4: Analyze Top Performers**
- Which campaigns have highest revenue?
- Which destinations drive most bookings?
- Which TripKits monetize best?
- What's the average order value?

**Step 5: Identify Issues**
- Declined conversions (check reasons)
- Missing clicks (tracking issues)
- Revenue discrepancies
- Zero-click campaigns

**Red Flags (Fix Immediately):**
- ❌ Zero clicks (tracking broken)
- ❌ Declining clicks (visibility issue)
- ❌ High clicks, zero conversions (link problem)
- ❌ Revenue declining unexpectedly

---

## 📈 GOOGLE ANALYTICS MONITORING

### Weekly GA4 Review:

**Step 1: Access Google Analytics**
- Navigate to Events report
- Filter for affiliate events:
  - `affiliate_click`
  - `booking_click`

**Step 2: Review Event Data**
- Total affiliate clicks (last 7 days)
- Click-through rate
- Top pages with affiliate clicks
- Top destinations with affiliate clicks

**Step 3: Compare with AWIN**
- GA4 clicks should align with AWIN clicks
- If GA4 > AWIN: Some clicks not tracking in AWIN
- If AWIN > GA4: Analytics tracking issue

**Step 4: Analyze Performance**
- Which pages drive most clicks?
- Which destinations drive most clicks?
- Which TripKits drive most clicks?
- What's the conversion path?

---

## 🔧 AFFILIATE HEALTH MONITORING

### Automated Health Checks:

**Run Weekly:**
```bash
node scripts/monitor-affiliate-performance.mjs
```

**What It Checks:**
- ✅ AWIN configuration (Publisher ID, Merchant ID)
- ✅ Affiliate link formats
- ✅ Codebase implementation
- ✅ Analytics tracking setup

**Manual Checks:**
- ✅ Click affiliate links to verify they work
- ✅ Check AWIN MasterTag loads (DevTools)
- ✅ Verify tracking parameters in URLs
- ✅ Test mobile affiliate links

---

## 💰 REVENUE TREND ANALYSIS

### Monthly Revenue Review:

**Compare Metrics:**
- Current month vs previous month
- Current month vs same month last year
- Average revenue per day
- Best performing days/weeks

**Identify Patterns:**
- Seasonal trends (summer, ski season)
- Day-of-week patterns
- Correlation with content updates
- Correlation with marketing campaigns

**If Revenue Declining:**
1. Check clicks: Are they declining too?
2. Check conversions: Is conversion rate dropping?
3. Check links: Are they broken or hidden?
4. Check AWIN: Any account issues?
5. Check tracking: Is AWIN MasterTag loading?

---

## 🚨 CRITICAL ISSUES TO FLAG IMMEDIATELY

### Revenue Blockers (Fix Immediately):
1. **AWIN MasterTag Not Loading**
   - Impact: No tracking = no revenue
   - Check: DevTools → Network tab → Look for `awin1.com` script
   - Fix: Verify CSP allows `awin1.com`

2. **All Affiliate Links Broken**
   - Impact: Zero revenue
   - Check: Click links manually
   - Fix: Verify affiliate configuration

3. **No Clicks Registering in AWIN**
   - Impact: Can't track revenue
   - Check: AWIN dashboard → Reports
   - Fix: Verify tracking parameters, MasterTag

4. **Zero Revenue (Tracking Broken)**
   - Impact: No earnings
   - Check: AWIN dashboard for conversions
   - Fix: Verify tracking, check AWIN account

5. **AWIN Account Suspended/Disabled**
   - Impact: All revenue lost
   - Check: AWIN account status
   - Fix: Contact AWIN support immediately

---

## 📝 WEEKLY AFFILIATE REPORT TEMPLATE

```markdown
## Affiliate Performance Report - Week of [Date]

### AWIN/Booking.com Performance
- **Total Clicks:** [Number]
- **Total Conversions:** [Number]
- **Conversion Rate:** [%]
- **Revenue:** $[Amount]
- **Revenue Per Click:** $[Amount]
- **Week-over-Week Change:** [%] ↑/↓

### Top Performing Campaigns (by Revenue)
1. [Campaign Name]: $[Revenue] ([Conversions] conversions)
2. [Campaign Name]: $[Revenue] ([Conversions] conversions)
3. [Campaign Name]: $[Revenue] ([Conversions] conversions)

### Top Performing Pages (by Clicks)
1. [Page]: [Clicks] clicks, $[Revenue]
2. [Page]: [Clicks] clicks, $[Revenue]
3. [Page]: [Clicks] clicks, $[Revenue]

### Top Performing Destinations (by Conversions)
1. [Destination]: [Conversions] conversions, $[Revenue]
2. [Destination]: [Conversions] conversions, $[Revenue]
3. [Destination]: [Conversions] conversions, $[Revenue]

### Issues Found
- [Issue description with severity]

### Action Items
- [Action item 1]
- [Action item 2]

### Next Week Focus
- [Priority 1]
- [Priority 2]
```

---

## 🎯 REVENUE OPTIMIZATION STRATEGIES

### Link Placement Optimization:

**High-Performing Placements:**
- Homepage "Book Your Adventure" section
- Destination pages "Enhance Your Visit" section
- TripKit viewer pages
- Booking components (Accommodations, Car Rentals, Flights)

**Optimization Opportunities:**
1. **Move Low-Performing Links**
   - If a placement has low CTR, test different placement
   - Test above-the-fold vs below-the-fold

2. **Add Links to High-Traffic Pages**
   - Identify pages with high traffic but no affiliate links
   - Add contextual affiliate links

3. **Test Different Call-to-Actions**
   - A/B test button text
   - Test different button styles
   - Test link placement in content

### Campaign Tracking Optimization:

**Best Practices:**
- Use descriptive campaign names
- Include destination/TripKit context
- Segment by page type (homepage, destination, TripKit)
- Track seasonal campaigns separately

**Campaign Naming Convention:**
- Homepage: `slctrips-homepage-[type]`
- Destination: `slctrips-[destination-slug]`
- TripKit: `slctrips-tripkit-[code]`
- Booking Component: `slctrips-[component]-[type]`

### Content Optimization:

**Maximize Revenue:**
1. **Add Affiliate Links to Popular Content**
   - Identify top-performing blog posts/destinations
   - Add contextual affiliate links

2. **Optimize Link Copy**
   - Use compelling CTAs
   - Highlight value proposition
   - Create urgency when appropriate

3. **Test Different Approaches**
   - A/B test link placements
   - Test different link styles
   - Test seasonal messaging

---

## 🔍 DEEP DIVE ANALYSIS (Monthly)

### Revenue Source Analysis:

**By Placement:**
- Homepage affiliate section: $X ([X]% of total)
- Destination pages: $X ([X]% of total)
- TripKit viewer pages: $X ([X]% of total)
- Booking components: $X ([X]% of total)

**By Destination:**
- Park City: $X, [X] conversions
- Moab: $X, [X] conversions
- Zion National Park: $X, [X] conversions
- [Continue for top 10 destinations]

**By TripKit:**
- Ski Utah Complete: $X, [X] conversions
- Morbid Misdeeds: $X, [X] conversions
- [Continue for top TripKits]

### Conversion Funnel Analysis:

**Track User Journey:**
1. Page View → Link Impression
2. Link Impression → Link Click
3. Link Click → Booking.com Visit
4. Booking.com Visit → Conversion

**Measure at Each Stage:**
- Impression to Click Rate: [%]
- Click to Visit Rate: [%]
- Visit to Conversion Rate: [%]
- Overall Conversion Rate: [%]

**Identify Drop-off Points:**
- If high impressions, low clicks: Visibility issue
- If high clicks, low visits: Link/landing page issue
- If high visits, low conversions: Booking.com UX issue

---

## 🛠️ TOOLS & SCRIPTS

### Automated Monitoring:

**Run Weekly:**
```bash
# Check affiliate configuration and health
node scripts/monitor-affiliate-performance.mjs
```

**What It Does:**
- Checks AWIN configuration
- Verifies affiliate link formats
- Checks codebase implementation
- Provides recommendations

### Manual Testing:

**Test Affiliate Links:**
1. Open DevTools → Network tab
2. Click affiliate link
3. Verify URL contains tracking parameters
4. Check for analytics events
5. Verify opens correct merchant page

**Test AWIN MasterTag:**
1. Open DevTools → Sources tab
2. Look for `awin1.com/[publisher-id].js`
3. Check for `AWIN_DataLayer` in console
4. Verify no JavaScript errors

---

## 📋 AFFILIATE LINK INVENTORY

### Active Affiliate Links:

**Homepage:**
- Car Rentals: `slctrips-homepage-cars`
- Hotels: `slctrips-homepage-hotels`

**Destination Pages:**
- Accommodations: `slctrips-[destination-slug]`
- Car Rentals: `slctrips-[destination-slug]-cars`
- Tours: `slctrips-[destination-slug]-tours`

**TripKit Viewer:**
- Accommodations: `slctrips-tripkit-[code]-hotels`
- Gear: `slctrips-tripkit-[code]-gear`

**Booking Components:**
- Accommodations: `slctrips-accommodations`
- Car Rentals: `slctrips-cars`
- Flights: `slctrips-flights`

---

## ✅ SUCCESS CRITERIA

### Healthy Affiliate Performance:
- ✅ Clicks increasing or stable month-over-month
- ✅ Conversion rate 2-5% (industry average)
- ✅ Revenue growing month-over-month
- ✅ Revenue per click $0.10+ (varies by merchant)
- ✅ No broken links
- ✅ All clicks tracked in AWIN
- ✅ Analytics events firing correctly

### Red Flags:
- ❌ Clicks declining week-over-week
- ❌ Conversion rate < 1%
- ❌ Revenue declining month-over-month
- ❌ Revenue per click < $0.05
- ❌ Broken links on popular pages
- ❌ Missing clicks in AWIN
- ❌ Analytics not tracking

---

## 📝 QUICK REFERENCE

### AWIN Configuration:
- **Publisher ID:** `2060961`
- **Booking.com Merchant ID:** `6776`
- **MasterTag:** Loaded in `src/app/layout.tsx`
- **Tracking Format:** `awin1.com/cread.php?awinmid=[merchant]&awinaffid=[publisher]&campaign=[name]&ued=[destination-url]`

### Amazon Configuration:
- **Affiliate Tag:** `wasatchwise-20`
- **Tracking Format:** `amazon.com/s?k=[search]&tag=wasatchwise-20`

### Key URLs:
- **AWIN Dashboard:** https://www.awin.com
- **AWIN Reports:** https://www.awin.com/publisher/reports
- **Booking.com Partner Hub:** https://www.booking.com/affiliate-program
- **Google Analytics:** [Your GA4 Property]

### Contact Information:
- **AWIN Support:** [AWIN Support Email/Phone]
- **Booking.com Partner Support:** [Booking.com Support]

---

**Monitor regularly to ensure affiliate revenue stays healthy and optimized!** 💰✅
