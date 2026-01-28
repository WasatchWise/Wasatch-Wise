# 🚀 Quick Deployment Guide

**Status:** ✅ Build Verified - Ready to Deploy  
**Changes:** FAQ Page, Schema.org Markup, Security Headers

---

## Recommended: Preview First (Safest)

### Step 1: Create Preview Deployment
```bash
cd /Users/johnlyman/Desktop/slctrips-v2/slctrips-v2
vercel
```

This will:
- Create a preview deployment
- Give you a URL like: `slctrips-v2-abc123.vercel.app`
- **Does NOT affect production**

### Step 2: Test Preview URL
Use the checklist in `DEPLOYMENT_SUMMARY_DEC2025.md`:

**Quick Tests (10 min):**
- [ ] Visit `https://[preview-url]/faq` - Should load
- [ ] Check browser console - No CSP violations
- [ ] Test homepage - Should work normally
- [ ] Test a destination page - Should work
- [ ] Test a TripKit page - Should work

**If everything works:**
```bash
vercel --prod  # Promote to production
```

**If issues found:**
- Fix locally
- Redeploy preview: `vercel`
- Test again
- Then promote: `vercel --prod`

---

## Alternative: Direct Production (If Confident)

### Option A: Git Push (Auto-Deploy)
```bash
cd /Users/johnlyman/Desktop/slctrips-v2/slctrips-v2
git add .
git commit -m "feat: Add FAQ page, Schema.org markup, and security headers"
git push origin main
```

Vercel will auto-deploy if configured.

### Option B: Vercel CLI Direct
```bash
cd /Users/johnlyman/Desktop/slctrips-v2/slctrips-v2
vercel --prod
```

**⚠️ Warning:** This goes straight to production. Test preview first if unsure.

---

## Post-Deployment Checklist

After deployment (production or preview):

### 1. FAQ Page (2 min)
- Visit `/faq`
- Verify content displays
- Check footer links work

### 2. Schema.org (5 min)
- Visit https://search.google.com/test/rich-results
- Test homepage (Organization schema)
- Test a destination page (TouristAttraction)
- Test a TripKit page (Product)

### 3. Security Headers (5 min)
- Visit https://securityheaders.com
- Enter your site URL
- Should score **A or A+**
- Check all headers present

### 4. Browser Console (5 min)
- Open DevTools (F12)
- Check Console tab
- **No CSP violations** (red errors)
- **No JavaScript errors**

### 5. Site Functionality (10 min)
- Homepage works
- Navigation works
- Destinations page works
- TripKit pages work
- Footer links work

**Total Testing Time:** ~30 minutes

---

## Troubleshooting

### CSP Blocking Resources
**Symptom:** Resources fail to load, console shows CSP errors

**Fix:**
1. Note which resource is blocked
2. Add to CSP in `next.config.js`
3. Redeploy

### FAQ Page 404
**Symptom:** `/faq` returns 404

**Fix:**
1. Verify `src/app/faq/page.tsx` exists
2. Verify `slctrips-v2/legal/FAQ.md` exists
3. Rebuild: `npm run build`
4. Redeploy

### Schema.org Not Detected
**Symptom:** Google Rich Results Test shows no schema

**Fix:**
1. View page source
2. Search for `application/ld+json`
3. Verify JSON is valid
4. May take 24-48 hours for Google to index

---

## Rollback Plan

If critical issues:

```bash
# Revert last commit
git revert HEAD
git push origin main

# OR rollback in Vercel dashboard
# Vercel → Deployments → Previous deployment → Promote
```

---

## Success Criteria

✅ **Must Pass:**
- FAQ page accessible
- No JavaScript errors
- No CSP violations
- Site functionality unchanged

✅ **Should Pass:**
- Security headers score A or A+
- Schema.org detected by Google
- All external services load

---

**Ready when you are!** 🚀

