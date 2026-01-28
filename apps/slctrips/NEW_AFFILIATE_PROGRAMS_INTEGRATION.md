# New Affiliate Programs Integration Guide 💰

**Date:** January 19, 2026  
**Status:** ✅ Programs Accepted - Integration In Progress

---

## 🎉 PROGRAMS ACCEPTED

All 4 affiliate programs have been successfully accepted in AWIN:

1. ✅ **Sitpack** - Outdoor travel gear (10% commission)
2. ✅ **FLEXTAIL** - Outdoor equipment (8-15% commission)
3. ✅ **VSGO** - Photography gear (15% commission)
4. ✅ **GoWithGuide US** - Private customizable tours (commission varies)

---

## 📋 INTEGRATION CHECKLIST

### Step 1: Get AWIN Merchant IDs ✅ (25% Complete)
**Status:** ✅ Sitpack Found | ⏳ 3 Remaining

**✅ COMPLETED:**
- **Sitpack Merchant ID:** `119965` ✅

**⏳ REMAINING:**
- FLEXTAIL Merchant ID: `______`
- VSGO Merchant ID: `______`
- GoWithGuide US Merchant ID: `______`

**Quick Guide:** See `GET_REMAINING_MERCHANT_IDS.md` for step-by-step instructions.

**Update `.env.local`:**
```bash
# ✅ Already found:
AWIN_SITPACK_MERCHANT_ID=119965

# ⏳ Add these 3:
AWIN_FLEXTAIL_MERCHANT_ID=[GET_THIS]
AWIN_VSGO_MERCHANT_ID=[GET_THIS]
AWIN_GOWITHGUIDE_MERCHANT_ID=[GET_THIS]
```

**How to Find Remaining IDs:**
1. Log into AWIN Dashboard: https://www.awin.com
2. Click **"My Programmes"** tab
3. Search for each program name
4. Click on the program
5. Look for **"Merchant ID"** or **"Program ID"** in:
   - Left sidebar → Program Details
   - URL bar (e.g., `/programs/119965`)
   - Program Information section

### Step 2: Get Affiliate Links ⏳
**Status:** PENDING - Need to generate from AWIN

**Action Required:**
1. For each program in AWIN Dashboard:
   - Click "Links & Tools" or "Get Links"
   - Generate deep links for specific products
   - Copy link format for integration

**Link Formats Needed:**
- Sitpack: Product deep links (Campster 2, etc.)
- FLEXTAIL: Product deep links
- VSGO: Product deep links (Black Snipe, Pocket Ranger, etc.)
- GoWithGuide US: Search/tour links

### Step 3: Code Integration ✅
**Status:** IN PROGRESS

**Completed:**
- ✅ Added configuration to `src/lib/affiliates.ts`
- ✅ Created helper functions:
  - `getSitpackLink()`
  - `getFlextailLink()`
  - `getVsgoLink()`
  - `getGoWithGuideLink()`
- ✅ Updated `trackAffiliateClick()` to include new platforms

**Pending:**
- ⏳ Update `WhatDanPacks.tsx` with new products
- ⏳ Update `ViatorTours.tsx` to include GoWithGuide US
- ⏳ Add products to destination pages

### Step 4: Product Integration ⏳
**Status:** PENDING

**Sitpack Products to Add:**
- Campster 2 (Portable camping chair) - **BESTSELLER**
- Carbon Fiber Stool
- Sleeping Pad
- Adventure Blanket

**FLEXTAIL Products:**
- Review catalog and select best products
- Focus on outdoor/camping gear

**VSGO Products:**
- Black Snipe (2023 Red Dot Award winner)
- Pocket Ranger (Modular ultra-light camera support)
- Waterproof/3D Support equipment

**GoWithGuide US:**
- Add to "Book Your Adventure" sections
- A/B test vs Viator performance

---

## 🛍️ PRODUCT RECOMMENDATIONS

### Sitpack - Top Products

**1. Campster 2** ⭐ BESTSELLER
- **Price:** ~$100-150
- **Commission:** 10% = $10-15 per sale
- **Why:** 100K+ sold, proven bestseller
- **Perfect For:**
  - Camping destinations
  - National parks
  - Outdoor TripKits
  - "What Dan Packs" sections

**2. Carbon Fiber Stool**
- **Why:** Ultra-portable seating
- **Perfect For:** Day trips, hiking destinations

**3. Sleeping Pad**
- **Why:** Camping comfort
- **Perfect For:** Overnight destinations, camping TripKits

**4. Adventure Blanket**
- **Why:** Multi-use outdoor blanket
- **Perfect For:** Picnics, beach destinations, outdoor activities

### VSGO - Top Products

**1. Black Snipe** ⭐ AWARD WINNER
- **Why:** 2023 Red Dot Award winner
- **Perfect For:** Photography destinations, scenic overlooks

**2. Pocket Ranger**
- **Why:** Modular ultra-light camera support
- **Perfect For:** Travel photography, lightweight gear needs

**3. Waterproof/3D Support Equipment**
- **Why:** Professional photography gear
- **Perfect For:** Outdoor photography, adventure photography

**Destinations to Add VSGO:**
- Arches National Park
- Zion National Park
- Bryce Canyon
- Alpine Loop
- Any scenic viewpoint

### FLEXTAIL - Products

**Status:** Need to review catalog
**Focus:** Outdoor/camping equipment
**Commission:** 8-15% (tiered)

### GoWithGuide US - Tours

**Service:** Private, customizable tours in 500+ cities
**Perfect For:**
- ALL destination pages
- "Book Your Adventure" sections
- City destinations (SLC, Park City, Moab, etc.)
- Major tourist destinations

**Placement Strategy:**
- Add alongside Viator links
- A/B test which performs better
- Use for personalized tour experiences

---

## 📍 PLACEMENT STRATEGY

### "What Dan Packs" Sections

**Sitpack:**
- Add to camping destinations
- Add to outdoor TripKits
- Add to national park destinations

**FLEXTAIL:**
- Add to outdoor/camping destinations
- Add to adventure TripKits

**VSGO:**
- Add to scenic/photography destinations
- Add to national park pages
- Add to overlook/viewpoint destinations

### "Book Your Adventure" Sections

**GoWithGuide US:**
- Add to ALL destination pages
- Place alongside Viator
- Use for private tour options

**Example Placement:**
```tsx
<div className="flex gap-2">
  <a href={viatorLink}>Book on Viator</a>
  <a href={goWithGuideLink}>Book Private Tour</a>
</div>
```

---

## 💰 REVENUE PROJECTIONS

### Monthly Revenue Potential:

**Sitpack:**
- Estimated: $200-500/month
- Based on: 10% commission, $100-150 avg order

**FLEXTAIL:**
- Estimated: $150-400/month
- Based on: 8-15% commission, outdoor gear focus

**VSGO:**
- Estimated: $100-300/month
- Based on: 15% commission, photography niche

**GoWithGuide US:**
- Estimated: $300-700/month
- Based on: Variable commission, tour bookings

**Total New Revenue Potential:** $750-1,900/month

**Combined with Existing:**
- Booking.com: Ongoing
- Viator: Ongoing
- Amazon: Ongoing
- **Total Potential:** $1,000-2,500+/month

---

## 🔧 TECHNICAL IMPLEMENTATION

### Configuration Added to `affiliates.ts`:

```typescript
sitpack?: {
  enabled: boolean;
  merchantId?: string;
};
flextail?: {
  enabled: boolean;
  merchantId?: string;
};
vsgo?: {
  enabled: boolean;
  merchantId?: string;
};
gowithguide?: {
  enabled: boolean;
  merchantId?: string;
};
```

### Helper Functions Created:

```typescript
getSitpackLink(productUrl?: string, campaign?: string): string | null
getFlextailLink(productUrl?: string, campaign?: string): string | null
getVsgoLink(productUrl?: string, campaign?: string): string | null
getGoWithGuideLink(destinationName?: string, campaign?: string): string | null
```

### Campaign Tracking:

Use descriptive campaign names:
- `slctrips-sitpack-[destination]`
- `slctrips-flextail-[destination]`
- `slctrips-vsgo-[destination]`
- `slctrips-gowithguide-[destination]`

---

## 📊 MONITORING & OPTIMIZATION

### Weekly Checks:

1. **AWIN Dashboard:**
   - Review clicks for each new program
   - Check conversion rates
   - Compare performance

2. **A/B Testing:**
   - GoWithGuide US vs Viator
   - Sitpack vs FLEXTAIL product performance
   - VSGO placement optimization

3. **Revenue Tracking:**
   - Monitor monthly revenue per program
   - Identify top-performing products
   - Optimize underperformers

### Monthly Analysis:

1. **Performance Review:**
   - Which products convert best?
   - Which destinations drive most revenue?
   - Which placement works best?

2. **Optimization:**
   - Add products to high-traffic pages
   - Remove underperforming products
   - Test new placements

---

## ✅ NEXT STEPS

### Immediate (This Week):

1. ⏳ **Get AWIN Merchant IDs** from dashboard
2. ⏳ **Update `.env.local`** with merchant IDs
3. ⏳ **Get affiliate links** for top products
4. ⏳ **Update `WhatDanPacks.tsx`** with new products
5. ⏳ **Update `ViatorTours.tsx`** to include GoWithGuide US

### Short-Term (This Month):

1. ⏳ **Add products to destination pages**
2. ⏳ **Test affiliate links** in production
3. ⏳ **Monitor performance** in AWIN dashboard
4. ⏳ **A/B test** GoWithGuide vs Viator

### Long-Term (This Quarter):

1. ⏳ **Optimize product selection** based on performance
2. ⏳ **Expand to TripKit viewers**
3. ⏳ **Create product recommendation engine**
4. ⏳ **Scale successful placements**

---

## 📝 NOTES

- All programs are AWIN-based, so tracking is consistent
- Merchant IDs are required before links will work
- Product deep links provide better conversion than homepage links
- GoWithGuide US should be tested alongside Viator for best results
- Focus on high-converting products first (Campster 2, Black Snipe)

---

**Last Updated:** January 19, 2026  
**Status:** Integration in progress - Merchant IDs needed
