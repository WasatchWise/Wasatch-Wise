# Get Remaining Merchant IDs from AWIN Dashboard 🔍

**Status:** ✅ Sitpack ID Found (119965) | ⏳ 3 More Needed

---

## ✅ COMPLETED

**Sitpack Merchant ID:** `119965`

---

## ⏳ REMAINING IDs NEEDED

1. ⏳ **FLEXTAIL** Merchant ID
2. ⏳ **VSGO** Merchant ID  
3. ⏳ **GoWithGuide US** Merchant ID

---

## 📋 STEP-BY-STEP GUIDE

### Method 1: From "My Programmes" Tab (Easiest)

**Steps:**
1. Log into AWIN Dashboard: https://www.awin.com
2. Click **"My Programmes"** tab at the top
3. You should see all your joined programs listed
4. For each program, look for one of these:
   - **"Program ID"** or **"Merchant ID"** in the left sidebar
   - Click on the program name to open details
   - Look in the URL: `/publisher/programs/[MERCHANT_ID]`
   - Or in the program details page under "Program Information"

### Method 2: From "Advertisers" Tab

**Steps:**
1. Click **"Advertisers"** tab
2. Click **"Joined"** sub-tab
3. Search for each program name
4. Click on the program
5. Look for **"Merchant ID"** or **"Program ID"** in the details

### Method 3: From URL (Quickest)

**Steps:**
1. In AWIN Dashboard, click on each program
2. Look at the browser URL bar
3. You'll see something like: `https://ui.awin.com/.../programs/119965`
4. The number at the end (`119965`) is the Merchant ID

---

## 🎯 SPECIFIC LOCATIONS

### Finding FLEXTAIL Merchant ID:

1. Search for "FLEXTAIL" in My Programmes
2. Click on "FLEXTAIL" 
3. **Location options:**
   - Left sidebar → "Program Details" → Merchant ID
   - URL bar → Look for `/programs/[NUMBER]`
   - Program page → "Program Information" section

**What it looks like:**
```
Program ID: XXXXX
or
Merchant ID: XXXXX
```

### Finding VSGO Merchant ID:

1. Search for "VSGO" in My Programmes
2. Click on "VSGO"
3. **Location options:**
   - Left sidebar → "Program Details" → Merchant ID
   - URL bar → Look for `/programs/[NUMBER]`
   - Program page → "Program Information" section

**What it looks like:**
```
Program ID: XXXXX
or
Merchant ID: XXXXX
```

### Finding GoWithGuide US Merchant ID:

1. Search for "GoWithGuide" or "GoWithGuide US" in My Programmes
2. Click on the program
3. **Location options:**
   - Left sidebar → "Program Details" → Merchant ID
   - URL bar → Look for `/programs/[NUMBER]`
   - Program page → "Program Information" section

**What it looks like:**
```
Program ID: XXXXX
or
Merchant ID: XXXXX
```

---

## ✅ VERIFICATION

Once you have all 3 remaining IDs, verify them by checking:

1. ✅ They're all numbers (usually 5-6 digits)
2. ✅ They're different from each other
3. ✅ They're different from Booking.com (6776)
4. ✅ They're different from Sitpack (119965)

---

## 📝 QUICK REFERENCE

When you find each ID, update this checklist:

- [x] **Sitpack:** `119965` ✅
- [ ] **FLEXTAIL:** `______`
- [ ] **VSGO:** `______`
- [ ] **GoWithGuide US:** `______`

---

## 🚀 ONCE YOU HAVE ALL IDs

**Update `.env.local`:**
```bash
# Existing
AWIN_SITPACK_MERCHANT_ID=119965

# Add these:
AWIN_FLEXTAIL_MERCHANT_ID=[FILL_IN]
AWIN_VSGO_MERCHANT_ID=[FILL_IN]
AWIN_GOWITHGUIDE_MERCHANT_ID=[FILL_IN]
```

**Then test:**
```bash
npm run affiliate:monitor
```

You should see all 4 programs marked as ✅ configured!

---

## 💡 TIPS

- **Can't find it?** Try clicking around in the program details - sometimes it's under "Program Information", "Account Details", or "Settings"
- **Still stuck?** Look in the browser URL when viewing the program - the merchant ID is often in the URL path
- **Need help?** The AWIN support team can help you find these IDs if you're having trouble

---

**Last Updated:** January 19, 2026  
**Progress:** 1 of 4 IDs found (25% complete)
