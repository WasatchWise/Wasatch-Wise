# Quick Start: Add Merchant IDs to .env.local 🚀

**Status:** 1 of 4 Complete (25%)

---

## ✅ COMPLETED

**Sitpack Merchant ID:** `119965`

---

## ⏳ ADD THESE 3 TO `.env.local`

Once you retrieve them from AWIN Dashboard, add these lines:

```bash
AWIN_FLEXTAIL_MERCHANT_ID=[ADD_HERE]
AWIN_VSGO_MERCHANT_ID=[ADD_HERE]
AWIN_GOWITHGUIDE_MERCHANT_ID=[ADD_HERE]
```

---

## 📋 STEP-BY-STEP: FIND IN AWIN DASHBOARD

### Method 1: From URL (Fastest)

1. Log into AWIN: https://www.awin.com
2. Go to **"My Programmes"** tab
3. Click on **FLEXTAIL**
4. Look at browser URL bar
5. You'll see: `https://ui.awin.com/.../programs/[NUMBER]`
6. The number is your Merchant ID!

**Repeat for:**
- VSGO
- GoWithGuide US

### Method 2: From Program Details

1. Click on the program name
2. Look in left sidebar → **"Program Details"**
3. Find **"Merchant ID"** or **"Program ID"**
4. Copy the number

---

## ✅ VERIFY IT WORKED

After adding all 3 IDs to `.env.local`:

```bash
npm run affiliate:monitor
```

**You should see:**
```
✅ Sitpack Merchant ID: 119965
✅ FLEXTAIL Merchant ID: [YOUR_ID]
✅ VSGO Merchant ID: [YOUR_ID]
✅ GoWithGuide US Merchant ID: [YOUR_ID]
```

---

## 🎯 EXPECTED FORMAT

All merchant IDs are typically:
- 5-6 digit numbers
- Different from each other
- Different from Booking.com (6776)
- Different from Sitpack (119965)

**Examples:**
- ✅ `119965` (Sitpack - already found)
- ✅ `6776` (Booking.com - already configured)
- ⏳ `[5-6 digits]` (FLEXTAIL, VSGO, GoWithGuide US)

---

## 🚀 ONCE ALL 4 IDs ARE ADDED

**You're ready to:**
1. ✅ Test in development: `npm run dev`
2. ✅ Run health check: `npm run affiliate:monitor`
3. ✅ Deploy to production: `vercel --prod`

---

**Need Help?** See `GET_REMAINING_MERCHANT_IDS.md` for detailed instructions.
