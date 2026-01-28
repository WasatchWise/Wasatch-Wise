# Welcome Wagon Email Alignment Analysis

## Current State

The Week 1 Survival Guide email is sent via `/api/welcome-wagon/send-guide` when users sign up for the free guide. The email content is hardcoded in the route handler.

A new comprehensive `week-one-welcome-wagon-kit.md` has been created with detailed, structured content.

## Content Comparison

### ✅ What's in BOTH (Aligned)
- Utilities setup (electric, gas, water/sewer/trash, internet)
- Hard water warning and plumbing tips
- DMV requirements and 60-day timeline
- Grid system explanation
- Altitude acclimation tips
- LDS culture basics
- Ensign Peak hike recommendation
- Coffee shop mentions
- Restaurant recommendations
- Renters' rights mention

### 📧 What's ONLY in the Email (Should Keep)
- **Grocery store recommendations**: Harmon's, Smith's/Kroger, Trader Joe's, Whole Foods
- **Banking recommendations**: Zions Bank, America First Credit Union
- **Money-saving tips**: Costco gas, ski passes, free museum days
- **Library card info**: Salt Lake County Library benefits
- **Specific restaurant dishes**: "The Hoss" at Sweet Lake, etc.
- **First Night Kit checklist**: TP, paper towels, snacks, water, ibuprofen
- **Urgent Care location**: Salt Lake InstaCare (389 S 900 E)
- **90-Day Guide upsell**: Detailed feature list and CTA

### 📄 What's ONLY in the Markdown (Should Add to Email)
- **Emergency contact details table**: 911, police non-emergency, fire, water emergencies, plumbing services, 211 social services
- **Comprehensive coffee shop list**: Full addresses, specialties, and vibes for 6+ shops
- **Complete restaurant list**: Addresses, hours, and specific dishes to order
- **Detailed hike information**: Trailhead addresses, parking, fees, difficulty levels
- **Neighborhood boundaries**: Detailed characteristics, safety ratings, median rent, demographics
- **Action checklist**: Checkbox format for tracking week 1 tasks
- **More detailed utility emergency info**: SLC Public Utilities Emergency Hotline (801) 483-6700
- **Water softener specifics**: Roto-Rooter and Manwill Plumbing contact info

## Recommendations

### Option 1: Enhance Email + Link to Full Guide (Recommended)
**Best for**: Keeping email concise while providing comprehensive reference

1. **Add critical missing info to email**:
   - Emergency contacts table (911, utilities emergency, plumbing)
   - SLC Public Utilities Emergency Hotline prominently displayed
   - Link to full markdown/PDF version

2. **Add prominent CTA in email**:
   ```
   📖 Want the complete reference guide with all addresses, hours, and detailed checklists?
   [Download Full Week 1 Welcome Wagon Kit →] (link to markdown or PDF)
   ```

3. **Keep email focused on urgent actions**:
   - Utilities (with emergency numbers)
   - DMV scheduling
   - First 24-48 hour essentials
   - Link to comprehensive guide for everything else

### Option 2: Create PDF from Markdown + Attach to Email
**Best for**: Providing offline reference

1. Convert `week-one-welcome-wagon-kit.md` to PDF
2. Attach PDF to email via SendGrid
3. Keep email as summary/overview
4. PDF serves as comprehensive reference document

### Option 3: Create Web Page + Link from Email
**Best for**: Interactive, always-updated content

1. Create `/welcome-wagon/week-one-guide` page
2. Render markdown content as styled web page
3. Link from email: "View complete guide online"
4. Allows for updates without resending emails

## Immediate Action Items

### High Priority (Add to Email Now)
1. ✅ **Emergency contacts section** - Critical safety info
   ```
   🚨 Emergency Contacts
   • 911 for emergencies
   • Police Non-Emergency: (801) 799-3000
   • Water/Sewer Emergency: (801) 483-6700
   • Plumbing Emergency: Roto-Rooter (24/7)
   ```

2. ✅ **SLC Public Utilities Emergency Hotline** - Add to utilities section
   - Currently only shows business hours number
   - Add emergency line prominently

3. ✅ **Link to comprehensive guide** - Add CTA
   - Either PDF download or web page link
   - Position after utilities section

### Medium Priority (Enhance Later)
4. Add coffee shop addresses to email (currently just names)
5. Add restaurant addresses/hours (currently just names)
6. Add detailed hike info (currently just Ensign Peak mention)
7. Add neighborhood comparison table (currently just text mentions)

### Low Priority (Nice to Have)
8. Convert markdown to PDF for attachment
9. Create web page version of guide
10. Add interactive checklist feature

## Implementation Notes

### Current Email Structure
- Location: `src/app/api/welcome-wagon/send-guide/route.ts`
- Format: Hardcoded HTML template (lines 38-257)
- Length: ~250 lines of HTML
- Content: Comprehensive but missing emergency contacts

### Proposed Changes
1. **Add emergency contacts section** after utilities table
2. **Add "View Complete Guide" CTA** after first week essentials
3. **Keep email length manageable** - don't duplicate everything from markdown
4. **Use markdown as source of truth** - email should reference it

## Next Steps

1. ✅ Review this alignment document
2. ⏳ Update email template with emergency contacts
3. ⏳ Add link to comprehensive guide (PDF or web page)
4. ⏳ Test email rendering in multiple clients
5. ⏳ Decide on PDF/web page format for full guide
6. ⏳ Update `WELCOME_WAGON_PROMISES.md` if needed

