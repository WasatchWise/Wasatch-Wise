# Instructions for Claude Chrome Extension
## WasatchWise Platform Testing & Domain Configuration

---

## 🎯 Your Mission

1. **Run comprehensive HCI tests** on the WasatchWise platform
2. **Verify domain wiring** for www.wasatchwise.com
3. **Document all findings** in a test report

---

## 📚 Documents to Reference

1. **`CLAUDE_CHROME_EXTENSION_TEST_PLAN.md`** - Complete test scenarios and procedures
2. **`DOMAIN_WIRING_GUIDE.md`** - Step-by-step domain configuration instructions
3. **`tests/hci/README.md`** - Existing HCI test framework documentation

---

## 🚀 Getting Started

### Step 1: Verify Domain is Wired

**Action Items:**
1. Navigate to https://www.wasatchwise.com
2. Check if site loads (should see WasatchWise homepage)
3. Verify HTTPS is working (green lock icon in browser)
4. Check DNS resolution:
   - Open browser DevTools → Network tab
   - Look for any DNS errors
   - Verify all resources load over HTTPS

**If Domain is NOT Wired:**
1. Follow instructions in `DOMAIN_WIRING_GUIDE.md`
2. Access Vercel dashboard: https://vercel.com/dashboard
3. Add domain: `www.wasatchwise.com`
4. Configure DNS in GoDaddy (see guide)
5. Wait 10-15 minutes for DNS propagation
6. Verify SSL certificate is issued

**Expected Result:**
- ✅ https://www.wasatchwise.com loads successfully
- ✅ No SSL warnings
- ✅ All pages accessible

---

### Step 2: Run Test Scenarios

**Follow the test plan in order:**

1. **Homepage & Navigation** (Test ID: HOME-001)
   - Verify all links work
   - Check images load
   - Test navigation

2. **AI Readiness Quiz** (Test ID: QUIZ-001)
   - Complete full quiz flow
   - Verify results page
   - Test navigation to contact

3. **WiseBot Chat** (Test ID: WISEBOT-001)
   - Test knowledge base integration
   - Test general queries
   - Verify streaming responses

4. **Contact Form** (Test ID: CONTACT-001)
   - Submit form
   - Test validation
   - Verify success message

5. **Vendor Registry** (Test ID: REGISTRY-001)
   - Test search functionality
   - Verify vendor cards
   - Check empty states

6. **Adult AI Academy** (Test ID: AAA-001)
   - Verify page loads
   - Check logo displays
   - Test responsive design

7. **Responsive Design** (Test ID: RESPONSIVE-001)
   - Test desktop (1280x720)
   - Test tablet (834x1194)
   - Test mobile (390x844)

8. **Accessibility** (Test ID: A11Y-001)
   - Keyboard navigation
   - Screen reader testing
   - Color contrast
   - ARIA labels

9. **Performance** (Test ID: PERF-001)
   - Run Lighthouse audits
   - Check Core Web Vitals
   - Test on slow 3G

10. **Error Handling** (Test ID: ERROR-001)
    - Test 404 pages
    - Test API errors
    - Test form validation

---

### Step 3: Document Findings

**For Each Test:**
- ✅ Pass / ❌ Fail / ⚠️ Warning
- Screenshots (attach to report)
- Console errors (if any)
- Performance metrics
- Notes and observations

**Bug Report Format:**
```
Bug ID: BUG-001
Severity: Critical / High / Medium / Low
Test ID: [Related test]
Steps to Reproduce: [List steps]
Expected: [What should happen]
Actual: [What actually happens]
Screenshots: [Attach]
Browser: [Chrome version, viewport]
```

---

## 🔧 Tools to Use

### Browser DevTools
- **Console Tab:** Check for JavaScript errors
- **Network Tab:** Monitor API calls, check response codes
- **Lighthouse:** Performance, accessibility, SEO audits
- **Accessibility Tab:** Check ARIA labels, contrast

### Testing Tools
- **Lighthouse:** Built into Chrome DevTools
- **WAVE Extension:** Accessibility testing
- **Color Contrast Checker:** Verify WCAG compliance
- **Screen Reader:** NVDA (Windows) or VoiceOver (Mac)

### DNS Tools
- **dnschecker.org:** Check DNS propagation
- **whatsmydns.net:** Verify DNS records globally
- **SSL Labs:** Test SSL certificate (https://www.ssllabs.com/ssltest/)

---

## 📋 Quick Test Checklist

### Domain Verification
- [ ] www.wasatchwise.com loads
- [ ] HTTPS is working (green lock)
- [ ] No SSL warnings
- [ ] DNS resolves correctly
- [ ] HTTP redirects to HTTPS

### Core Functionality
- [ ] Homepage loads (< 3 seconds)
- [ ] Navigation links work
- [ ] Quiz completes successfully
- [ ] WiseBot responds correctly
- [ ] Contact form submits
- [ ] Registry search works

### Responsive Design
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] Touch targets adequate
- [ ] Text readable on mobile

### Accessibility
- [ ] Keyboard navigable
- [ ] Screen reader friendly
- [ ] Color contrast passes
- [ ] ARIA labels present
- [ ] Focus indicators visible

### Performance
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] TTI < 3.8s
- [ ] CLS < 0.1
- [ ] Images optimized

---

## 🐛 Common Issues to Watch For

### Domain Issues
- **DNS not propagated:** Wait 10-15 minutes, check dnschecker.org
- **SSL certificate pending:** Wait 1-2 minutes after domain verification
- **Mixed content:** Ensure all resources use HTTPS

### Functionality Issues
- **404 errors:** Check route configuration in Next.js
- **API errors:** Check network tab, verify API routes
- **Form submission fails:** Check validation, network errors

### Performance Issues
- **Slow load times:** Check image optimization, code splitting
- **Large bundle size:** Check Lighthouse recommendations
- **Poor Core Web Vitals:** Review performance audit

---

## 📊 Test Report Template

Create a test report with the following structure:

```markdown
# WasatchWise Platform Test Report
**Date:** [Date]
**Tester:** Claude Chrome Extension
**Domain:** www.wasatchwise.com

## Executive Summary
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Warnings: [X]
- Overall Status: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

## Domain Status
- DNS Configuration: ✅ / ❌
- SSL Certificate: ✅ / ❌
- HTTPS Redirect: ✅ / ❌

## Test Results
[For each test, include:]
- Test ID: [ID]
- Status: ✅ / ❌ / ⚠️
- Time: [X] minutes
- Issues: [List]
- Screenshots: [Links]

## Critical Issues
[List any critical bugs]

## Recommendations
[List improvements]

## Screenshots
[Attach all screenshots]
```

---

## 🎯 Success Criteria

**Test is Successful When:**
- ✅ All critical tests pass
- ✅ Domain is properly wired
- ✅ No blocking bugs found
- ✅ Performance meets targets
- ✅ Accessibility standards met
- ✅ All screenshots captured
- ✅ Test report is complete

---

## 📞 Support

**If you encounter issues:**
1. Check `DOMAIN_WIRING_GUIDE.md` for domain setup
2. Review `CLAUDE_CHROME_EXTENSION_TEST_PLAN.md` for detailed procedures
3. Check browser console for errors
4. Verify Vercel deployment status
5. Check DNS propagation status

---

## 🚀 Next Steps After Testing

1. **Review Test Report**
   - Identify critical issues
   - Prioritize fixes
   - Document recommendations

2. **Fix Critical Issues**
   - Address blocking bugs first
   - Fix domain issues if any
   - Optimize performance issues

3. **Re-test**
   - Re-run failed tests
   - Verify fixes work
   - Update test report

4. **Deploy**
   - Ensure all tests pass
   - Verify domain is working
   - Monitor for issues

---

**Good luck with testing! 🎉**

Remember:
- Take screenshots of everything
- Document all findings
- Be thorough but efficient
- Report issues clearly
- Celebrate successes! ✅
