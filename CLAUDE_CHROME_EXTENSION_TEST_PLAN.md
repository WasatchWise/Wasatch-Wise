# Comprehensive HCI Test Plan for Claude Chrome Extension
## WasatchWise Platform Testing

**Test Date:** [Date]
**Tester:** Claude Chrome Extension
**Target Domain:** www.wasatchwise.com
**Test Environment:** Production (www.wasatchwise.com)

---

## 🎯 Test Objectives

1. **Validate Core User Journeys** - Ensure all primary user flows work correctly
2. **Verify Domain Configuration** - Confirm www.wasatchwise.com is properly wired
3. **Check Accessibility** - WCAG 2.1 AA compliance
4. **Test Responsive Design** - Mobile, tablet, and desktop viewports
5. **Validate AI Features** - WiseBot chat functionality and knowledge base integration
6. **Test Form Submissions** - Contact forms, quiz submissions, email capture
7. **Verify Navigation** - All internal links and routing
8. **Check Performance** - Page load times and interaction responsiveness

---

## 🌐 Domain Wiring Instructions

### For Vercel Deployment

1. **Access Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Navigate to the `wasatchwise` project

2. **Add Domain**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `www.wasatchwise.com`
   - Click **Add**

3. **Configure DNS (GoDaddy)**
   - Log into GoDaddy account
   - Navigate to DNS Management for `wasatchwise.com`
   - Add/Update the following records:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     TTL: 1 Hour
     ```

4. **Verify Domain**
   - Wait 5-10 minutes for DNS propagation
   - Check Vercel dashboard for domain status (should show "Valid Configuration")
   - Test: Navigate to https://www.wasatchwise.com

5. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working (should redirect HTTP → HTTPS)

---

## 📋 Pre-Test Checklist

- [ ] Domain is accessible at www.wasatchwise.com
- [ ] HTTPS is working (SSL certificate active)
- [ ] All environment variables are set in Vercel
- [ ] Database migrations are applied
- [ ] Knowledge base is seeded
- [ ] Test browser extensions are disabled (except Claude)
- [ ] Browser cache is cleared
- [ ] Network throttling is disabled for initial tests

---

## 🧪 Test Scenarios

### 1. Homepage & Navigation

**Test ID:** HOME-001  
**Priority:** Critical  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to https://www.wasatchwise.com
2. Verify page loads without errors
3. Check that all navigation links in header are visible:
   - Services
   - Methodology
   - Case Studies
   - Resources
   - AI Readiness Quiz
   - WiseBot
   - Adult AI Academy
   - Registry
4. Click each navigation link and verify:
   - Links to anchor sections work (e.g., `/#services`)
   - Direct route links work (e.g., `/tools/ai-readiness-quiz`)
   - No 404 errors
5. Scroll through homepage and verify:
   - Hero section displays correctly
   - Three-column benefit grid is visible
   - All sections render properly
   - Images load (wisebot.png, AAA.png, wasatchwiselogo.png)
6. Check footer links:
   - All links are clickable
   - No broken links
   - Social media links (if present) work

**Expected Results:**
- ✅ Page loads in < 3 seconds
- ✅ All navigation links work
- ✅ No console errors
- ✅ Images display correctly
- ✅ Footer is accessible

**Screenshots Required:**
- Full homepage view
- Header navigation
- Footer

---

### 2. AI Readiness Quiz Flow

**Test ID:** QUIZ-001  
**Priority:** Critical  
**Estimated Time:** 10 minutes

**Steps:**
1. Navigate to `/tools/ai-readiness-quiz` or click "AI Readiness Quiz" from navigation
2. Verify quiz page loads
3. Complete the quiz:
   - Fill in organization name
   - Select role
   - Answer all 10 questions
   - Verify narrative text appears for each question option
   - Check that subtext is displayed for questions
4. Submit the quiz
5. Verify results page displays:
   - Score is shown
   - Analysis is provided
   - "Book Your Cognitive Audit" button is present
6. Click "Book Your Cognitive Audit" button
7. Verify it navigates to `/contact`

**Expected Results:**
- ✅ Quiz loads without errors
- ✅ All questions are answerable
- ✅ Narrative text enhances understanding
- ✅ Results page shows meaningful analysis
- ✅ Submission is successful
- ✅ Navigation to contact page works

**Screenshots Required:**
- Quiz start page
- Mid-quiz (question 5)
- Results page
- Contact page after navigation

---

### 3. WiseBot Chat Functionality

**Test ID:** WISEBOT-001  
**Priority:** Critical  
**Estimated Time:** 15 minutes

**Steps:**
1. Navigate to `/tools/wisebot` or click "WiseBot" from navigation
2. Verify WiseBot page loads:
   - WiseBot icon (wisebot.png) displays
   - Heading says "WiseBot (AI Assistant)"
   - Example prompts are visible
   - Input field is present
3. Test knowledge base integration:
   - Ask: "What is FERPA?"
   - Verify response cites knowledge base
   - Check that response is relevant and accurate
4. Test general query:
   - Ask: "How do I evaluate an AI tool for my district?"
   - Verify response is helpful
   - Check that streaming response works
5. Test follow-up question:
   - Ask a follow-up based on previous response
   - Verify conversation context is maintained
6. Test error handling:
   - Submit empty message (should show validation error)
   - Submit very long message (should show length error)
7. Check AI usage logging:
   - Verify requests are logged (check browser network tab for API calls)
   - Confirm `kb_enhanced` flag is set when KB is used

**Expected Results:**
- ✅ WiseBot page loads correctly
- ✅ Knowledge base search works
- ✅ Responses are accurate and cite KB when relevant
- ✅ Streaming responses work smoothly
- ✅ Conversation context is maintained
- ✅ Error handling works correctly
- ✅ API calls are successful (200 status)

**Screenshots Required:**
- WiseBot interface
- Knowledge base enhanced response
- General query response
- Error message (if applicable)

---

### 4. Contact Form Submission

**Test ID:** CONTACT-001  
**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to `/contact` or click contact link
2. Fill out contact form:
   - Name
   - Email
   - Organization
   - Message
3. Submit form
4. Verify success message appears
5. Check email is sent (if email service is configured)
6. Test form validation:
   - Submit empty form (should show errors)
   - Submit with invalid email (should show error)
   - Submit with valid data (should succeed)

**Expected Results:**
- ✅ Form loads correctly
- ✅ All fields are accessible
- ✅ Validation works
- ✅ Submission is successful
- ✅ Success message displays
- ✅ Email is sent (if configured)

**Screenshots Required:**
- Contact form
- Success message
- Validation error (if applicable)

---

### 5. Vendor Registry

**Test ID:** REGISTRY-001  
**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Navigate to `/registry` or click "Registry" from navigation
2. Verify registry page loads:
   - Search form is visible
   - Vendor cards display (if vendors exist)
3. Test search functionality:
   - Enter a vendor name
   - Submit search
   - Verify results filter correctly
4. Test empty state:
   - Search for non-existent vendor
   - Verify "No vendors found" message appears
5. Check vendor cards:
   - Verify all vendor information displays
   - Check SDPC member badges
   - Verify compliance status
   - Test "Visit website" links

**Expected Results:**
- ✅ Registry page loads
- ✅ Search functionality works
- ✅ Vendor cards display correctly
- ✅ Empty state message appears when appropriate
- ✅ All links work

**Screenshots Required:**
- Registry page with vendors
- Search results
- Empty state

---

### 6. Adult AI Academy Page

**Test ID:** AAA-001  
**Priority:** Medium  
**Estimated Time:** 3 minutes

**Steps:**
1. Navigate to `/adult-ai-academy` or click "Adult AI Academy" from navigation
2. Verify page loads:
   - AAA.png logo displays
   - Page title is correct
   - Content sections are visible
3. Check all links on the page
4. Verify responsive design (test on mobile viewport)

**Expected Results:**
- ✅ Page loads correctly
- ✅ Logo displays
- ✅ All content is readable
- ✅ Links work
- ✅ Responsive design works

**Screenshots Required:**
- Desktop view
- Mobile view

---

### 7. Responsive Design Testing

**Test ID:** RESPONSIVE-001  
**Priority:** High  
**Estimated Time:** 10 minutes

**Test on Multiple Viewports:**

**Desktop (1280x720):**
1. Test all pages on desktop viewport
2. Verify layout is correct
3. Check navigation menu
4. Verify images scale properly

**Tablet (834x1194):**
1. Test homepage
2. Test quiz
3. Test WiseBot
4. Verify touch targets are adequate (min 44x44px)

**Mobile (390x844):**
1. Test all major pages
2. Verify mobile navigation works
3. Check form inputs are usable
4. Verify text is readable (min 16px)
5. Test touch interactions

**Expected Results:**
- ✅ All viewports render correctly
- ✅ Navigation works on all devices
- ✅ Touch targets are adequate
- ✅ Text is readable
- ✅ Forms are usable
- ✅ No horizontal scrolling

**Screenshots Required:**
- Desktop: Homepage, Quiz, WiseBot
- Tablet: Homepage, Quiz
- Mobile: Homepage, Quiz, WiseBot, Contact

---

### 8. Accessibility Testing

**Test ID:** A11Y-001  
**Priority:** High  
**Estimated Time:** 15 minutes

**Keyboard Navigation:**
1. Navigate entire site using only keyboard (Tab, Enter, Arrow keys)
2. Verify all interactive elements are focusable
3. Check focus indicators are visible
4. Verify skip links work (if present)

**Screen Reader Testing:**
1. Use screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through homepage
3. Test form labels are announced
4. Verify heading hierarchy (h1 → h2 → h3)
5. Check alt text for images

**Color Contrast:**
1. Test text contrast ratios:
   - Body text: WCAG AA (4.5:1)
   - Large text: WCAG AA (3:1)
2. Verify interactive elements have sufficient contrast
3. Check focus indicators are visible

**ARIA Labels:**
1. Verify form inputs have labels
2. Check buttons have accessible names
3. Verify navigation landmarks are present

**Expected Results:**
- ✅ All pages are keyboard navigable
- ✅ Screen reader announces content correctly
- ✅ Color contrast meets WCAG AA
- ✅ ARIA labels are present
- ✅ Focus indicators are visible

**Screenshots Required:**
- Keyboard focus on navigation
- Screen reader output (if possible)
- Color contrast test results

---

### 9. Performance Testing

**Test ID:** PERF-001  
**Priority:** Medium  
**Estimated Time:** 5 minutes

**Metrics to Check:**
1. **First Contentful Paint (FCP):** < 1.8s
2. **Largest Contentful Paint (LCP):** < 2.5s
3. **Time to Interactive (TTI):** < 3.8s
4. **Cumulative Layout Shift (CLS):** < 0.1
5. **First Input Delay (FID):** < 100ms

**Steps:**
1. Open Chrome DevTools → Lighthouse
2. Run performance audit on:
   - Homepage
   - Quiz page
   - WiseBot page
3. Check network tab for:
   - Image optimization
   - Code splitting
   - Caching headers
4. Test on slow 3G connection (throttle network)

**Expected Results:**
- ✅ All Core Web Vitals pass
- ✅ Images are optimized
- ✅ Code is split appropriately
- ✅ Caching is configured

**Screenshots Required:**
- Lighthouse scores for each page
- Network waterfall (slow 3G)

---

### 10. Error Handling & Edge Cases

**Test ID:** ERROR-001  
**Priority:** Medium  
**Estimated Time:** 10 minutes

**Test Cases:**
1. **404 Errors:**
   - Navigate to `/non-existent-page`
   - Verify 404 page displays
   - Check navigation back to homepage works

2. **API Errors:**
   - Disconnect network
   - Try to submit quiz
   - Verify error message displays
   - Reconnect and verify recovery

3. **Form Validation:**
   - Submit forms with invalid data
   - Verify error messages are clear
   - Check that valid data can be resubmitted

4. **Empty States:**
   - Test registry with no vendors
   - Test quiz with no results
   - Verify empty states are user-friendly

**Expected Results:**
- ✅ 404 page is helpful
- ✅ Error messages are clear
- ✅ Recovery from errors works
- ✅ Empty states are informative

**Screenshots Required:**
- 404 page
- Error message
- Empty state

---

## 🔍 Additional Checks

### SEO & Meta Tags
- [ ] Page titles are unique and descriptive
- [ ] Meta descriptions are present
- [ ] Open Graph tags are present (if applicable)
- [ ] Canonical URLs are correct
- [ ] Structured data (JSON-LD) is present (if applicable)

### Security
- [ ] HTTPS is enforced
- [ ] No mixed content warnings
- [ ] CORS headers are correct
- [ ] API routes require authentication (where needed)
- [ ] No sensitive data in client-side code

### Analytics & Tracking
- [ ] Analytics scripts load (if configured)
- [ ] No tracking errors in console
- [ ] Events fire correctly (if configured)

---

## 📊 Test Results Template

```
Test ID: [ID]
Status: ✅ PASS / ❌ FAIL / ⚠️ WARN
Time Taken: [X] minutes
Issues Found: [List any issues]
Screenshots: [Links to screenshots]
Notes: [Additional notes]
```

---

## 🐛 Bug Reporting Format

For any issues found, report using this format:

**Bug ID:** BUG-001  
**Severity:** Critical / High / Medium / Low  
**Test ID:** [Related test ID]  
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:** [What should happen]  
**Actual Behavior:** [What actually happens]  
**Screenshots:** [Attach screenshots]  
**Browser/Device:** [Browser version, device, viewport]  
**Console Errors:** [Any console errors]

---

## ✅ Sign-Off

**Tester:** Claude Chrome Extension  
**Date:** [Date]  
**Overall Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

**Summary:**
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Warnings: [X]

**Critical Issues:** [List any critical issues]  
**Recommendations:** [Any recommendations for improvements]

---

## 📝 Notes for Claude Chrome Extension

1. **Use Browser DevTools:**
   - Console tab for JavaScript errors
   - Network tab for API calls
   - Lighthouse for performance
   - Accessibility tab for a11y checks

2. **Test Data:**
   - Use realistic test data for forms
   - Don't use production user accounts
   - Use test email addresses

3. **Screenshots:**
   - Take screenshots of all major pages
   - Capture error states
   - Document any visual issues

4. **Documentation:**
   - Document all findings
   - Include console errors
   - Note any unexpected behavior

5. **Domain Verification:**
   - Confirm www.wasatchwise.com resolves correctly
   - Verify SSL certificate is valid
   - Check DNS propagation is complete

---

## 🔗 Quick Links for Testing

- **Homepage:** https://www.wasatchwise.com
- **Quiz:** https://www.wasatchwise.com/tools/ai-readiness-quiz
- **WiseBot:** https://www.wasatchwise.com/tools/wisebot
- **Contact:** https://www.wasatchwise.com/contact
- **Registry:** https://www.wasatchwise.com/registry
- **Adult AI Academy:** https://www.wasatchwise.com/adult-ai-academy

---

**End of Test Plan**
