# 🚨 CRITICAL FIX: Site URL Configuration

**Issue:** `NEXT_PUBLIC_SITE_URL` is set to `http://localhost:3000`  
**Should Be:** `https://www.slctrips.com`  
**Impact:** All email links will be broken

---

## ⚠️ Why This Is Critical

**Current Problem:**
- Free guide emails link to `http://localhost:3000/welcome-wagon` ❌
- TripKit purchase emails link to `http://localhost:3000/tk/[code]` ❌
- Access code links won't work for users ❌
- Upgrade links in emails broken ❌

**After Fix:**
- Emails link to `https://www.slctrips.com/welcome-wagon` ✅
- Access codes work from email clicks ✅
- All links functional ✅

---

## 🔧 How to Fix (5 minutes)

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/wasatch-wises-projects/slctrips-v2/settings/environment-variables

2. **Find `NEXT_PUBLIC_SITE_URL`:**
   - Look in Production environment variables
   - Current value: `http://localhost:3000`

3. **Update Value:**
   - Click edit on `NEXT_PUBLIC_SITE_URL`
   - Change to: `https://www.slctrips.com`
   - Save

4. **Redeploy:**
   - Vercel will auto-redeploy, OR
   - Go to Deployments → Redeploy latest

5. **Verify:**
   - Wait 2-3 minutes for deployment
   - Test by checking email links (after next test)

---

### Option 2: Vercel CLI

```bash
# Set production environment variable
vercel env add NEXT_PUBLIC_SITE_URL production
# When prompted, enter: https://www.slctrips.com

# Redeploy
vercel --prod
```

---

## ✅ Verification Steps

### After Fix:

1. **Check Environment Variable:**
   - Vercel Dashboard → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_SITE_URL` = `https://www.slctrips.com`

2. **Test Email Links:**
   - Sign up for free guide
   - Check email
   - Verify links point to `https://www.slctrips.com` (not localhost)

3. **Test Access Code Link:**
   - Purchase TripKit
   - Check email
   - Verify access code link is `https://www.slctrips.com/tk/[code]`

---

## 🧪 Quick Test After Fix

**Test Email Link:**
1. Sign up for free guide with test email
2. Check email received
3. Click link in email
4. **Should go to:** `https://www.slctrips.com/welcome-wagon`
5. **Should NOT go to:** `http://localhost:3000/welcome-wagon`

---

## 📝 Notes

- This only affects **new emails** sent after the fix
- Existing emails already sent will still have localhost links
- No database changes needed
- No code changes needed
- Just environment variable update + redeploy

---

## ⏱️ Timeline

- **Fix Time:** 5 minutes
- **Deploy Time:** 2-3 minutes
- **Total:** ~8 minutes

**Then proceed with HCI testing!**

---

**Action Required:** Update `NEXT_PUBLIC_SITE_URL` in Vercel production environment to `https://www.slctrips.com`

