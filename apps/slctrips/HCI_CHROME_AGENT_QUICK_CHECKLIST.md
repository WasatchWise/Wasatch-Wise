# HCI Quick Checklist for Chrome Agent ⚡

**Purpose:** Fast reference checklist for Chrome Agent  
**Use:** Quick verification of critical functionality  
**Time:** 15-20 minutes for quick check

---

## 🚨 CRITICAL PATH (5 min)

- [ ] Homepage loads (`/`)
- [ ] "Explore Destinations" button works
- [ ] "Get Your TripKit" button works
- [ ] Navigation menu works
- [ ] No console errors

---

## 💰 PURCHASE FLOW (5 min)

- [ ] Navigate to `/tripkits`
- [ ] Click paid TripKit
- [ ] Purchase button visible
- [ ] Checkout loads (Stripe)
- [ ] Payment processes (test card: `4242 4242 4242 4242`)
- [ ] Success page shows access code
- [ ] Access code works at `/tk/[code]`

---

## 🔐 AUTHENTICATION (3 min)

- [ ] Sign up works (`/auth/signup`)
- [ ] Sign in works (`/auth/signin`)
- [ ] Redirects work after auth
- [ ] Password reset link works

---

## 📚 LIBRARY ACCESS (2 min)

- [ ] Library page loads (`/account/my-tripkits`)
- [ ] Purchased TripKits visible
- [ ] Can view TripKit content
- [ ] Navigation works

---

## 🎁 FREE ACCESS (2 min)

- [ ] TK-000 page loads (`/tripkits/tk-000`)
- [ ] Email gate works
- [ ] Free access granted
- [ ] Content accessible

---

## 🤖 AI CONCIERGE (3 min)

- [ ] Dan button visible on TripKit page
- [ ] Chat opens
- [ ] Weather query works
- [ ] Destination search works
- [ ] ⚠️ Flag: Ski conditions may be outdated
- [ ] ⚠️ Flag: Canyon status may be inaccurate

---

## 📱 MOBILE CHECK (2 min)

- [ ] Set viewport to 375x667
- [ ] Layout responsive
- [ ] Buttons clickable
- [ ] Text readable
- [ ] No horizontal scroll

---

## ⚠️ ERROR HANDLING (2 min)

- [ ] Wrong password shows error
- [ ] Invalid access code shows error
- [ ] 404 page helpful
- [ ] Can recover from errors

---

## 💰 AFFILIATE LINKS (5 min) 💰 CRITICAL

- [ ] Homepage "Rent a Car" link works
- [ ] Homepage "Find Hotels" link works
- [ ] Links use AWIN tracking (check URL parameters)
- [ ] AWIN MasterTag loads (DevTools → Network)
- [ ] Links open Booking.com correctly
- [ ] Analytics tracking fires (DevTools → Network → gtag)
- [ ] Destination page affiliate links work
- [ ] TripKit affiliate links work (if present)

---

## 📊 QUICK SCORE

**Pass:** ✅  
**Warning:** ⚠️  
**Fail:** ❌

**Critical Path:** ___/5  
**Purchase Flow:** ___/7  
**Authentication:** ___/4  
**Library:** ___/4  
**Free Access:** ___/4  
**AI Concierge:** ___/6  
**Mobile:** ___/5  
**Errors:** ___/4  
**Affiliate Links:** ___/8 💰

**Total Score:** ___/47

---

## 🐛 QUICK ISSUES LOG

**Critical:**
- [ ] Issue 1: _______________
- [ ] Issue 2: _______________

**High:**
- [ ] Issue 1: _______________
- [ ] Issue 2: _______________

**Medium:**
- [ ] Issue 1: _______________

---

**Quick check complete!** ⚡

For detailed testing, use `HCI_CHROME_AGENT_TEST_SUITE_2025.md`
