# 🧪 Comprehensive HCI Test Plan - WasatchWise Platform
## Updated: January 22, 2026

**Test Date:** [Date]  
**Tester:** Claude Chrome Extension  
**Target Domain:** www.wasatchwise.com  
**Test Environment:** Production  
**Platform Version:** Post-Orange Rebrand + Pricing + Citations

---

## 🎯 Test Objectives

### Primary Focus Areas (Deep Testing)
1. **Aesthetics** - Visual design, color consistency, visual hierarchy, professional appearance
2. **Accessibility** - WCAG 2.1 AA compliance, keyboard navigation, screen readers, ARIA labels
3. **Look and Feel** - Overall design quality, brand personality, user perception
4. **Text Size** - Readability, appropriate sizing, mobile optimization, line height
5. **Mobile Responsiveness** - Touch targets, viewport handling, no horizontal scroll, form usability
6. **Padding & Spacing** - Hero section padding, section spacing, card padding, visual rhythm

### Secondary Objectives
7. **Validate Core User Journeys** - All primary user flows work correctly
8. **Verify Orange Brand Identity** - Consistent orange (#E87722) branding throughout
9. **Test New Features** - Pricing page, citation-enabled WiseBot
10. **Validate AI Features** - WiseBot with 226+ source citations
11. **Test Form Submissions** - Contact, quiz, email capture
12. **Verify Navigation** - All internal links and routing
13. **Check Performance** - Page load times and Core Web Vitals
14. **Database Integration** - Pricing tiers, knowledge sources, citations

---

## 📋 Pre-Test Checklist

### Environment Setup
- [ ] Domain accessible at www.wasatchwise.com
- [ ] HTTPS working (SSL certificate active)
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied (004, 005)
- [ ] Pricing tiers seeded (3 tiers)
- [ ] Knowledge sources seeded (4+ sources)
- [ ] Test browser extensions disabled (except Claude)
- [ ] Browser cache cleared
- [ ] Network throttling disabled for initial tests

### Brand Verification
- [ ] Orange color (#E87722) visible throughout
- [ ] No blue colors remaining on user-facing pages
- [ ] Consistent orange hover states
- [ ] Orange buttons and CTAs

---

## 🧪 Test Scenarios

### 1. Homepage & Orange Brand Verification

**Test ID:** HOME-001  
**Priority:** Critical  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to https://www.wasatchwise.com
2. Verify page loads without errors (< 3 seconds)
3. **Brand Color Check:**
   - Logo text is orange (#E87722)
   - "Built for K-12 Reality" text is orange
   - Hero gradient uses orange tones
   - Benefit cards have orange borders
4. Check all navigation links in header:
   - Services (anchor link)
   - Methodology (anchor link)
   - Case Studies (anchor link)
   - Resources (anchor link)
   - Vendor Registry (route)
   - Adult AI Academy (route)
   - WiseBot (route)
   - **Pricing (route)** ← NEW
   - Contact (route)
5. Verify all sections render:
   - Hero section with orange accents
   - Three-column benefit grid
   - Services section
   - Methodology section (orange background)
   - Solution section
   - Case Studies section
   - Resources section (orange background)
   - CTA section (orange gradient)

**Expected Results:**
- ✅ Page loads in < 3 seconds
- ✅ All orange brand colors visible
- ✅ No blue colors on homepage
- ✅ All navigation links work
- ✅ Smooth scrolling to anchor sections
- ✅ No console errors

**Screenshots Required:**
- Full homepage view
- Hero section close-up
- Navigation menu

---

### 2. Pricing Page (NEW)

**Test ID:** PRICING-001  
**Priority:** High  
**Estimated Time:** 8 minutes

**Steps:**
1. Navigate to `/pricing` or click "Pricing" in header
2. Verify page loads correctly
3. **Check Page Header:**
   - Title: "AI Governance Built for Reality"
   - "Built for Reality" text is orange
   - Description text displays
   - "Most districts start with DAROS Briefing" note visible
4. **Verify Three Pricing Tiers:**
   - DAROS Briefing card displays
     - Price range: $6,300 - $15,000
     - Three levels (Starter, Standard, Enterprise)
     - Features listed with checkmarks
     - "Book Discovery Call" button (orange if popular, gray if not)
   - 30-Day Implementation Sprint card
     - "Most Popular" badge (orange)
     - Price range: $12,999 - $35,499
     - Three levels with features
     - "Start Your Sprint" button (orange)
   - Ongoing Support card
     - Price range: $6,300 - $20,000/mo
     - Three levels (Light, Standard, Enterprise)
     - "Schedule Consultation" button
5. **Check Workshops Section:**
   - Three workshop cards display
   - Virtual Lunch & Learn ($2,500)
   - Virtual Workshop ($4,500)
   - On-Site Full Day ($17,999 + travel)
6. **Test Interactions:**
   - Click "Book Discovery Call" on DAROS Briefing
   - Verify redirects to `/contact?service=DAROS%20Briefing`
   - Click "Start Your Sprint" on 30-Day Sprint
   - Verify redirects to `/contact?service=30-Day%20Implementation%20Sprint`
7. **Check Footer:**
   - Terms and conditions visible
   - Payment terms displayed
8. **Test Responsive:**
   - Mobile view (cards stack vertically)
   - Tablet view (2 columns)
   - Desktop view (3 columns)

**Expected Results:**
- ✅ All pricing tiers display correctly
- ✅ Orange brand colors used (buttons, badges)
- ✅ "Most Popular" badge on 30-Day Sprint
- ✅ All CTAs link to contact form with service parameter
- ✅ Workshops section displays
- ✅ Responsive design works
- ✅ No console errors

**Screenshots Required:**
- Full pricing page
- Each pricing tier card
- Workshops section
- Mobile view

---

### 3. WiseBot with Citations (ENHANCED)

**Test ID:** WISEBOT-002  
**Priority:** Critical  
**Estimated Time:** 10 minutes

**Steps:**
1. Navigate to `/tools/wisebot`
2. Verify page loads correctly
3. **Check Header:**
   - WiseBot icon displays
   - Title: "WiseBot (AI Assistant)"
   - Description text
   - **"226+ expert sources with citations" badge** ← NEW
   - BookOpen icon visible
4. **Test Basic Chat:**
   - Type: "What is FERPA?"
   - Click Send or press Enter
   - Verify response appears
   - **Check for citations:**
     - Citation section appears below response
     - "SOURCES CITED:" header visible
     - Source cards display with:
       - Source number [Source 1]
       - Title
       - Author (if available)
       - Summary preview
       - "View source" link (if URL available)
5. **Test Citation Display:**
   - Verify citation cards have orange accents
   - Check external link icon (ExternalLink)
   - Click "View source" link (if available)
   - Verify opens in new tab
6. **Test Multiple Citations:**
   - Ask: "Tell me about AI governance and FERPA compliance"
   - Verify multiple sources cited if applicable
   - Check citation numbering [Source 1, Source 2]
7. **Test Example Prompts:**
   - Click each example prompt button
   - Verify prompt populates input
   - Verify orange hover state on buttons
8. **Test Error Handling:**
   - Disconnect network (DevTools → Network → Offline)
   - Send a message
   - Verify error message displays
   - Reconnect and retry
9. **Test Session Persistence:**
   - Send multiple messages
   - Refresh page
   - Verify conversation history (if implemented)

**Expected Results:**
- ✅ WiseBot responds to queries
- ✅ Citations display below responses
- ✅ Citation cards styled with orange accents
- ✅ Source details (title, author, summary) visible
- ✅ External links work
- ✅ "226+ sources" badge visible
- ✅ Example prompts work
- ✅ Error handling graceful
- ✅ No console errors

**Screenshots Required:**
- WiseBot interface
- Response with citations
- Citation card close-up
- Multiple citations example

---

### 4. AI Readiness Quiz

**Test ID:** QUIZ-002  
**Priority:** High  
**Estimated Time:** 8 minutes

**Steps:**
1. Navigate to `/tools/ai-readiness-quiz`
2. Verify page loads correctly
3. **Check Info Page:**
   - Welcome message displays
   - Instructions visible
   - "Start Quiz" button (orange)
4. **Test Quiz Flow:**
   - Answer Question 1
   - Verify progress bar updates (orange)
   - Click "Next" button
   - Answer all 10 questions
   - Verify question numbering: "Question X of 10"
   - Check "Back" button works (if on question 2+)
5. **Test Final Question:**
   - Answer Question 10
   - Verify "Complete Audit" button appears (orange, prominent)
   - Click "Complete Audit"
   - Verify redirects to results page
6. **Check Results Page:**
   - Score displays
   - Analysis visible
   - "Book Your Cognitive Audit" CTA (orange button)
7. **Test Orange Branding:**
   - Progress bar is orange
   - Selected answer has orange border/hover
   - Buttons are orange
   - No blue colors visible

**Expected Results:**
- ✅ Quiz completes all 10 questions
- ✅ Progress bar updates correctly
- ✅ Results page displays after completion
- ✅ All orange brand colors used
- ✅ No navigation issues
- ✅ No console errors

**Screenshots Required:**
- Quiz start page
- Question with progress bar
- Final question with "Complete Audit" button
- Results page

---

### 5. Contact Form with Service Parameter

**Test ID:** CONTACT-002  
**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to `/contact`
2. Verify form displays
3. **Test Form Fields:**
   - Name (required)
   - Email (required)
   - Organization (required)
   - Role (optional)
   - Message (required)
4. **Test Service Parameter:**
   - Navigate to `/contact?service=DAROS%20Briefing`
   - Verify form pre-fills or displays service context
   - Check if service name appears in form
5. **Test Form Validation:**
   - Submit empty form
   - Verify validation errors
   - Fill required fields
   - Submit form
   - Verify success message
6. **Test Orange Branding:**
   - Submit button is orange
   - Focus rings on inputs are orange
   - Error messages styled correctly

**Expected Results:**
- ✅ Form displays all fields
- ✅ Service parameter captured (if implemented)
- ✅ Validation works
- ✅ Success message displays
- ✅ Orange focus states
- ✅ No console errors

**Screenshots Required:**
- Contact form
- Form with service parameter
- Success message

---

### 6. Vendor Registry

**Test ID:** REGISTRY-001  
**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to `/registry`
2. Verify page loads
3. **Test Search:**
   - Enter search query
   - Click search button (orange)
   - Verify results display
   - Test empty state (no results)
4. **Check Vendor Cards:**
   - Vendor name displays
   - Website link (orange) works
   - Tags display (orange badges)
5. **Test Orange Branding:**
   - Search button is orange
   - Links are orange
   - Badges have orange accents

**Expected Results:**
- ✅ Search functionality works
- ✅ Vendor results display
- ✅ Links work
- ✅ Orange branding consistent
- ✅ No console errors

**Screenshots Required:**
- Registry page
- Search results
- Vendor card

---

### 7. Adult AI Academy Page

**Test ID:** AAA-001  
**Priority:** Medium  
**Estimated Time:** 3 minutes

**Steps:**
1. Navigate to `/adult-ai-academy`
2. Verify page loads
3. **Check Content:**
   - AAA.png logo displays
   - Heading and description visible
   - Feature points listed
4. **Test Orange Branding:**
   - Background gradient uses orange
   - Borders are orange
   - No blue colors

**Expected Results:**
- ✅ Page displays correctly
- ✅ Logo visible
- ✅ Orange branding consistent
- ✅ No console errors

**Screenshots Required:**
- Full AAA page

---

### 8. Responsive Design Testing

**Test ID:** RESPONSIVE-001  
**Priority:** High  
**Estimated Time:** 15 minutes

**Test on Multiple Viewports:**

**Mobile (375px width):**
- [ ] Homepage navigation collapses to hamburger menu
- [ ] Pricing cards stack vertically
- [ ] Quiz questions fit on screen
- [ ] WiseBot chat interface usable
- [ ] All buttons have adequate touch targets (44x44px min)
- [ ] Text is readable without zooming

**Tablet (768px width):**
- [ ] Pricing cards display in 2 columns
- [ ] Navigation menu horizontal
- [ ] All sections properly spaced
- [ ] Forms are usable

**Desktop (1920px width):**
- [ ] All content properly centered
- [ ] Max-width constraints respected
- [ ] No horizontal scrolling
- [ ] All hover states work

**Expected Results:**
- ✅ All viewports render correctly
- ✅ No horizontal scrolling
- ✅ Touch targets adequate on mobile
- ✅ Navigation works on all sizes
- ✅ Text readable on all devices

**Screenshots Required:**
- Mobile homepage
- Mobile pricing page
- Tablet pricing page
- Desktop full view

---

### 9. Aesthetics Deep Dive (NEW FOCUS AREA)

**Test ID:** AESTHETICS-001  
**Priority:** High  
**Estimated Time:** 15 minutes

**Focus:** Visual design quality, brand consistency, professional appearance

**Steps:**
1. **Visual Hierarchy:**
   - [ ] Hero section feels balanced (not excessive top padding)
   - [ ] Headings clearly stand out from body text
   - [ ] CTAs are visually prominent
   - [ ] Information flows naturally top-to-bottom

2. **Color Consistency:**
   - [ ] Orange (#E87722) used consistently
   - [ ] No blue colors visible
   - [ ] Hover states use orange-600
   - [ ] Gradients use orange tones

3. **Spacing & Rhythm:**
   - [ ] Sections have consistent vertical rhythm
   - [ ] Cards have appropriate internal padding
   - [ ] No cramped or overly spacious areas
   - [ ] Mobile spacing feels intentional

4. **Professional Appearance:**
   - [ ] Design feels modern and polished
   - [ ] No visual clutter
   - [ ] Brand personality comes through
   - [ ] Appropriate use of whitespace

**Expected Results:**
- ✅ Hero section balanced (not excessive padding)
- ✅ Consistent orange branding
- ✅ Professional, modern appearance
- ✅ Good visual hierarchy
- ✅ Appropriate spacing throughout

**Screenshots Required:**
- Full homepage (check spacing)
- Hero section close-up
- Section transitions
- Card spacing detail

---

### 10. Accessibility Deep Dive (ENHANCED)

**Test ID:** A11Y-002  
**Priority:** High  
**Estimated Time:** 25 minutes

**Keyboard Navigation:**
- [ ] Tab through all interactive elements
- [ ] Focus indicators visible (orange rings)
- [ ] All buttons/keyboard accessible
- [ ] Skip links work (if implemented)
- [ ] Modal dialogs trap focus

**Screen Reader Testing:**
- [ ] All images have alt text
- [ ] Form labels associated with inputs
- [ ] Headings properly structured (h1 → h2 → h3)
- [ ] ARIA labels where needed
- [ ] Landmarks properly defined

**Color Contrast:**
- [ ] Orange text on white meets WCAG AA (4.5:1)
- [ ] Orange buttons meet contrast requirements
- [ ] Error messages have sufficient contrast
- [ ] Links distinguishable from body text

**WCAG 2.1 AA Checklist:**
- [ ] 1.1.1 Non-text Content (alt text)
- [ ] 1.3.1 Info and Relationships (semantic HTML)
- [ ] 1.4.3 Contrast (Minimum) (4.5:1)
- [ ] 2.1.1 Keyboard (all functionality)
- [ ] 2.4.2 Page Titled (descriptive titles)
- [ ] 2.4.3 Focus Order (logical tab order)
- [ ] 3.2.1 On Focus (no context changes)
- [ ] 4.1.2 Name, Role, Value (ARIA)

**Expected Results:**
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ Color contrast meets WCAG AA
- ✅ All WCAG 2.1 AA criteria met

**Screenshots Required:**
- Focus indicators
- Keyboard navigation path
- Screen reader output (if possible)

---

### 10. Text Size & Readability (NEW FOCUS AREA)

**Test ID:** TEXT-001  
**Priority:** High  
**Estimated Time:** 15 minutes

**Focus:** Text sizing, readability, mobile optimization

**Steps:**
1. **Mobile Text Sizes (375px viewport):**
   - [ ] Base text is ≥16px (readable without zoom)
   - [ ] Headings scale appropriately (h1: 36px, h2: 30px)
   - [ ] Small text (labels) is ≥12px
   - [ ] No text too small to read comfortably

2. **Desktop Text Sizes (1920px viewport):**
   - [ ] Headings scale up appropriately
   - [ ] Body text remains readable (not too large)
   - [ ] Line length comfortable (max ~75 characters)

3. **Line Height:**
   - [ ] Body text has comfortable line spacing (1.5-1.75)
   - [ ] Headings have tighter spacing (1.1-1.2)
   - [ ] Lists have adequate spacing

4. **Font Weight:**
   - [ ] Headings are bold enough to stand out
   - [ ] Body text is not too heavy
   - [ ] Emphasis (bold) used appropriately

**Expected Results:**
- ✅ All text readable on mobile without zoom
- ✅ Text sizes scale appropriately
- ✅ Comfortable line height
- ✅ Appropriate font weights

**Screenshots Required:**
- Mobile text sizes (zoom to 200% to verify)
- Desktop text sizes
- Line height examples

---

### 11. Mobile Responsiveness Deep Dive (ENHANCED)

**Test ID:** MOBILE-001  
**Priority:** Critical  
**Estimated Time:** 20 minutes

**Focus:** Mobile usability, touch targets, viewport handling

**Steps:**
1. **Viewport Handling (375px - iPhone SE):**
   - [ ] No horizontal scrolling
   - [ ] All content fits within viewport
   - [ ] Images scale properly
   - [ ] Forms are usable

2. **Touch Targets:**
   - [ ] All buttons ≥44x44px
   - [ ] Links have adequate spacing
   - [ ] Dropdown items are tappable
   - [ ] Form inputs are easy to tap

3. **Navigation:**
   - [ ] Hamburger menu works
   - [ ] Mobile menu is accessible
   - [ ] Dropdowns work on touch
   - [ ] All links are tappable

4. **Forms:**
   - [ ] Input fields are large enough
   - [ ] Submit buttons are prominent
   - [ ] Error messages visible
   - [ ] Keyboard doesn't cover inputs

5. **Content Layout:**
   - [ ] Cards stack vertically
   - [ ] Grids adapt to single column
   - [ ] Text doesn't overflow
   - [ ] Images don't break layout

**Expected Results:**
- ✅ No horizontal scrolling
- ✅ All touch targets ≥44px
- ✅ Navigation works perfectly
- ✅ Forms are usable
- ✅ Content adapts properly

**Screenshots Required:**
- Mobile homepage (375px)
- Mobile pricing page
- Mobile quiz interface
- Mobile WiseBot chat
- Touch target measurements

---

### 12. Padding & Spacing Analysis (NEW FOCUS AREA)

**Test ID:** PADDING-001  
**Priority:** High  
**Estimated Time:** 15 minutes

**Focus:** Hero padding, section spacing, visual rhythm

**Steps:**
1. **Hero Section Padding:**
   - [ ] Top padding is reasonable (not excessive)
   - [ ] Content feels balanced (not pushed down too far)
   - [ ] Header + hero spacing feels intentional
   - [ ] Mobile: Tighter but not cramped
   - [ ] Desktop: Spacious but not wasteful

2. **Section Spacing:**
   - [ ] Consistent vertical rhythm between sections
   - [ ] Sections don't feel too close together
   - [ ] Sections don't feel too far apart
   - [ ] Mobile: Reduced but still comfortable
   - [ ] Desktop: Generous but not excessive

3. **Card Padding:**
   - [ ] Internal padding feels appropriate
   - [ ] Content doesn't feel cramped
   - [ ] Content doesn't feel lost in space
   - [ ] Consistent across all cards

4. **Element Spacing:**
   - [ ] Gaps between elements are consistent
   - [ ] Related items are grouped appropriately
   - [ ] Unrelated items have clear separation
   - [ ] Visual rhythm feels intentional

**Expected Results:**
- ✅ Hero section: Balanced, not excessive
- ✅ Sections: Consistent vertical rhythm
- ✅ Cards: Appropriate internal padding
- ✅ Elements: Comfortable spacing
- ✅ Overall: Professional, intentional spacing

**Screenshots Required:**
- Hero section (measure top padding)
- Section transitions (measure spacing)
- Card padding detail
- Overall spacing rhythm

---

### 13. Look and Feel Assessment (NEW FOCUS AREA)

**Test ID:** LOOKFEEL-001  
**Priority:** Medium  
**Estimated Time:** 10 minutes

**Focus:** Overall design quality, brand personality, user perception

**Steps:**
1. **First Impression:**
   - [ ] Design feels modern and professional
   - [ ] Brand personality comes through
   - [ ] Appropriate for K-12 education market
   - [ ] Trustworthy and credible

2. **Visual Consistency:**
   - [ ] Consistent styling throughout
   - [ ] No jarring style changes
   - [ ] Components feel cohesive
   - [ ] Brand identity is clear

3. **Whitespace Usage:**
   - [ ] Appropriate use of whitespace
   - [ ] Not cluttered
   - [ ] Not too sparse
   - [ ] Breathing room for content

4. **Visual Flow:**
   - [ ] Eye moves naturally through page
   - [ ] Important elements stand out
   - [ ] Information hierarchy clear
   - [ ] CTAs are prominent

**Expected Results:**
- ✅ Professional, modern design
- ✅ Clear brand identity
- ✅ Appropriate for target market
- ✅ Good visual flow

**Screenshots Required:**
- Full homepage (first impression)
- Key sections (visual flow)
- Brand elements

---

### 14. Performance Testing

**Test ID:** PERF-001  
**Priority:** Medium  
**Estimated Time:** 10 minutes

**Lighthouse Audit:**
1. Open Chrome DevTools → Lighthouse
2. Run audit on:
   - Homepage
   - Pricing page
   - WiseBot page
   - Quiz page
3. **Check Metrics:**
   - Performance: Target 90+
   - Accessibility: Target 95+
   - Best Practices: Target 90+
   - SEO: Target 90+

**Core Web Vitals:**
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

**Page Load Times:**
- [ ] Homepage: < 3s
- [ ] Pricing page: < 2s
- [ ] WiseBot page: < 2s
- [ ] Quiz page: < 2s

**Network Analysis:**
- [ ] Images optimized (WebP format)
- [ ] JavaScript bundles minified
- [ ] CSS optimized
- [ ] No unnecessary requests

**Expected Results:**
- ✅ Lighthouse scores meet targets
- ✅ Core Web Vitals pass
- ✅ Page load times acceptable
- ✅ No performance regressions

**Screenshots Required:**
- Lighthouse report (homepage)
- Network waterfall
- Performance metrics

---

### 11. Cross-Browser Testing

**Test ID:** BROWSER-001  
**Priority:** Medium  
**Estimated Time:** 15 minutes

**Test on:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Check:**
- [ ] Homepage renders correctly
- [ ] Pricing page displays
- [ ] WiseBot works
- [ ] Quiz functions
- [ ] Forms submit
- [ ] Orange colors consistent
- [ ] No layout breaks

**Expected Results:**
- ✅ Consistent experience across browsers
- ✅ No browser-specific bugs
- ✅ Orange branding consistent

---

### 12. Error Handling & Edge Cases

**Test ID:** ERROR-001  
**Priority:** Medium  
**Estimated Time:** 10 minutes

**Test Scenarios:**
1. **Network Errors:**
   - Disable network → Try WiseBot
   - Verify error message displays
   - Re-enable → Verify recovery

2. **Invalid Inputs:**
   - Submit quiz with no answers
   - Submit contact form with invalid email
   - Enter very long text in forms

3. **404 Handling:**
   - Navigate to `/nonexistent-page`
   - Verify 404 page displays
   - Check navigation back to homepage

4. **API Failures:**
   - Simulate API timeout
   - Verify graceful error handling
   - Check user-friendly error messages

**Expected Results:**
- ✅ All errors handled gracefully
- ✅ User-friendly error messages
- ✅ Recovery paths available
- ✅ No unhandled exceptions

---

## 📊 Test Report Template

### Executive Summary
- **Total Tests:** [Number]
- **Passed:** [Number]
- **Failed:** [Number]
- **Blocked:** [Number]
- **Overall Grade:** [A-F]

### Critical Issues
- List any critical bugs found
- Include severity and impact

### Recommendations
- Priority fixes
- Enhancement suggestions
- Performance improvements

### Screenshots
- Organize by test ID
- Include before/after if applicable

---

## 🎯 Success Criteria

**Must Pass:**
- ✅ All critical test scenarios pass
- ✅ Orange branding consistent throughout
- ✅ Pricing page functional
- ✅ WiseBot citations working
- ✅ No critical accessibility issues
- ✅ Mobile responsive
- ✅ Core Web Vitals pass

**Nice to Have:**
- ⭐ Lighthouse scores 90+
- ⭐ All browsers compatible
- ⭐ Zero console errors
- ⭐ Perfect accessibility score

---

## 📝 Notes for Tester

1. **Orange Brand Color:** Primary orange is `#E87722`. Check that this exact color is used, not variations.

2. **Citations:** WiseBot should display citations for queries that match knowledge sources. If no citations appear, check:
   - Knowledge sources table has data
   - API route is working
   - Citation parsing logic

3. **Pricing Page:** Verify all three tiers display and CTAs link to contact form with correct service parameter.

4. **Database:** If features don't work, verify:
   - Migrations 004 and 005 are applied
   - Seed data exists
   - RLS policies allow access

5. **Performance:** Use Chrome DevTools for accurate measurements. Test on actual network conditions, not just "Fast 3G".

---

## 🚀 Post-Test Actions

1. **Document Findings:**
   - Create test report
   - Include screenshots
   - List all bugs with severity

2. **Prioritize Fixes:**
   - Critical bugs first
   - High priority next
   - Medium/low can wait

3. **Share Results:**
   - Update project status
   - Create GitHub issues for bugs
   - Celebrate successes! 🎉

---

**Test Plan Version:** 2.0  
**Last Updated:** January 22, 2026  
**Next Review:** After major feature additions
