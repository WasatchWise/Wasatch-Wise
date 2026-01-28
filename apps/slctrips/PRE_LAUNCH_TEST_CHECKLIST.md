# Pre-Launch Test Checklist - DRY RUN

**Time Required:** 15 minutes
**When to Run:** After deployment, before announcing

---

## Test 1: Welcome Wagon Free Guide Form (5 min)

### Setup
- [ ] Open: https://www.slctrips.com/welcome-wagon
- [ ] Open browser DevTools (F12) → Console tab
- [ ] Open Supabase Dashboard → Table Editor → email_captures

### Test Steps
1. [ ] Click "Get Free Guide" button
2. [ ] Modal opens without errors
3. [ ] Enter email: `dan+test-free-{timestamp}@slctrips.com`
4. [ ] Enter name: "Dan Test Free"
5. [ ] Click "Send Me the Free Guide"
6. [ ] See success message: "Success! Check your email for the Week 1 Survival Guide."
7. [ ] Modal closes automatically
8. [ ] No errors in browser console

### Verification in Supabase
```sql
SELECT
  email,
  source,
  visitor_type,
  notes,
  created_at
FROM email_captures
WHERE email LIKE 'dan+test-free%'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
```
email: dan+test-free-{timestamp}@slctrips.com
source: welcome_wagon_free_guide
visitor_type: relocating
notes: Name: Dan Test Free
created_at: [recent timestamp]
```

### ✅ PASS Criteria
- [ ] Form submits without errors
- [ ] Success message appears
- [ ] Record appears in Supabase within 5 seconds
- [ ] `notes` field contains name
- [ ] `source` is 'welcome_wagon_free_guide'

---

## Test 2: Welcome Wagon Reservation Form (3 min)

### Setup
- [ ] Stay on https://www.slctrips.com/welcome-wagon
- [ ] Console still open, no errors from previous test

### Test Steps
1. [ ] Click "Reserve Yours Now" button (yellow/orange)
2. [ ] Reservation modal opens
3. [ ] Enter email: `dan+test-reserve-{timestamp}@slctrips.com`
4. [ ] Enter name: "Dan Test Reserve"
5. [ ] Click "Reserve My Spot"
6. [ ] See success message about email notification
7. [ ] Modal closes

### Verification in Supabase
```sql
SELECT
  email,
  source,
  visitor_type,
  preferences,
  notes
FROM email_captures
WHERE email LIKE 'dan+test-reserve%'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
```
source: reservation_welcome-wagon
preferences: ["welcome-wagon-90-day"]
notes: Name: Dan Test Reserve, Reservation: 90-Day Welcome Wagon ($49)
```

### ✅ PASS Criteria
- [ ] Form submits successfully
- [ ] `preferences` array includes 'welcome-wagon-90-day'
- [ ] `notes` includes reservation details

---

## Test 3: TK-045 Display Verification (2 min)

### Setup
- [ ] Navigate to: https://www.slctrips.com/tripkits (listing page)
- [ ] Then to TK-045 detail page

### Test Steps - Listing Page
1. [ ] Find "250 Under $25" in TripKit grid
2. [ ] Verify tagline shows: "Growing to 250 curated budget adventures..."
3. [ ] Verify count shows: "25 locations" (not 250)

### Test Steps - Detail Page
1. [ ] Click on "250 Under $25"
2. [ ] Verify progress badge appears: "🚀 Growing to 250 • 25 Live • New Weekly"
3. [ ] Scroll down to "Our Journey to 250" section
4. [ ] Verify progress bar shows: "25/250" at 10%
5. [ ] Verify 4 bullet points under "What you get:"
   - [ ] "25 destinations available now"
   - [ ] "Automatic access to all future destinations"
   - [ ] "4-5 new verified adventures added weekly"
   - [ ] "Founder pricing locked forever"

### ✅ PASS Criteria
- [ ] Progress badge visible and animated
- [ ] Progress bar renders correctly
- [ ] Copy matches Option B messaging
- [ ] No UI layout breaks

---

## Test 4: Deep Dive Stories Display (2 min)

### Setup
- [ ] Navigate to: https://www.slctrips.com/tripkits/ski-utah-complete

### Test Steps
1. [ ] Scroll to "Deep Dive Stories" section
2. [ ] Verify stories are visible (should show ~16)
3. [ ] Each story has:
   - [ ] Title
   - [ ] Subtitle/summary
   - [ ] Featured image (or placeholder)
   - [ ] Reading time
4. [ ] Click on one story
5. [ ] Story detail page loads without 404

### ✅ PASS Criteria
- [ ] Stories section appears
- [ ] At least 10 stories visible
- [ ] All story cards render properly
- [ ] Story links work

---

## Test 5: Stripe Test Checkout (3 min)

**⚠️ IMPORTANT:** This requires Stripe test mode. Do NOT use real card.

### Setup
- [ ] Ensure Stripe is in TEST mode (check dashboard)
- [ ] Navigate to any paid TripKit (e.g., TK-002)
- [ ] Have test card ready: `4242 4242 4242 4242`

### Test Steps
1. [ ] Click "Purchase TripKit" or similar CTA button
2. [ ] Stripe Checkout opens (verify test mode banner at top)
3. [ ] Fill in:
   - Email: `dan+stripe-test@slctrips.com`
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 84111)
4. [ ] Click "Pay"
5. [ ] Redirected to success page
6. [ ] Success message appears

### Verification in Supabase

**Check Access Code:**
```sql
SELECT
  access_code,
  tripkit_id,
  customer_email,
  amount_paid,
  created_at
FROM tripkit_access_codes
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- Access code generated (e.g., `TK-ABC123-DEF456`)
- Customer email matches
- Amount paid matches TripKit price
- Created timestamp is recent

**Check Purchase Record:**
```sql
SELECT
  customer_email,
  amount_paid,
  payment_status,
  stripe_session_id
FROM purchases
ORDER BY purchased_at DESC
LIMIT 1;
```

**Expected Result:**
- `payment_status`: 'completed'
- `stripe_session_id`: starts with 'cs_test_'

### ✅ PASS Criteria
- [ ] Checkout completes without errors
- [ ] Access code created in `tripkit_access_codes`
- [ ] Purchase recorded in `purchases`
- [ ] Payment status is 'completed'
- [ ] No webhook errors in Stripe dashboard

---

## Test 6: Stripe Webhook Verification (1 min)

### Setup
- [ ] Open Stripe Dashboard → Developers → Webhooks
- [ ] Find webhook endpoint for your production URL

### Test Steps
1. [ ] Click on webhook endpoint
2. [ ] Check recent events (should show from test above)
3. [ ] Find `checkout.session.completed` event
4. [ ] Verify:
   - [ ] Response code: 200
   - [ ] No error messages
   - [ ] Response body: `{"received": true}`

### ✅ PASS Criteria
- [ ] Webhook received event
- [ ] Returned 200 status
- [ ] No errors in webhook logs

---

## Summary Checklist

After completing all tests:

### Forms
- [ ] Welcome Wagon Free Guide works
- [ ] Welcome Wagon Reservation works
- [ ] Corporate form works (optional - similar to above)

### TK-045 Display
- [ ] Progress badge visible
- [ ] Progress tracker renders
- [ ] Copy matches Option B
- [ ] Destination count shows 25

### Stories
- [ ] Deep Dive stories appear on TK-002

### Stripe
- [ ] Test checkout completes
- [ ] Access code generated
- [ ] Purchase recorded
- [ ] Webhook successful

### Database Records
- [ ] At least 2 new `email_captures` entries
- [ ] At least 1 new `tripkit_access_codes` entry
- [ ] At least 1 new `purchases` entry
- [ ] At least 1 new `customer_product_access` entry (if testing Welcome Wagon purchase)

---

## If Any Test Fails

### Form Submission Errors
1. Check browser console for errors
2. Check Supabase logs: Dashboard → Logs → API
3. Verify environment variables deployed
4. Check RLS policies on `email_captures`

### Stripe Errors
1. Check Stripe Dashboard → Developers → Events
2. Verify webhook endpoint is correct
3. Check webhook signing secret matches env var
4. Look for errors in webhook logs

### Display Issues
1. Clear browser cache (Cmd/Ctrl + Shift + R)
2. Check deployed build includes latest changes
3. Verify Vercel deployment completed successfully

---

## Post-Test Cleanup (Optional)

If you want to remove test data:

```sql
-- Remove test email captures
DELETE FROM email_captures
WHERE email LIKE 'dan+test-%';

-- Remove test access codes (use carefully!)
DELETE FROM tripkit_access_codes
WHERE customer_email LIKE 'dan+stripe-test%';

-- Remove test purchases (use carefully!)
DELETE FROM purchases
WHERE customer_email LIKE 'dan+stripe-test%';
```

**⚠️ WARNING:** Only run cleanup in TEST environment. Never in production with real customer data.

---

## Quick Reference

**Test URLs:**
- Welcome Wagon: https://www.slctrips.com/welcome-wagon
- TK-045: https://www.slctrips.com/tripkits/250-under-25
- TK-002: https://www.slctrips.com/tripkits/ski-utah-complete
- TripKit Listing: https://www.slctrips.com/tripkits

**Test Emails:**
- Free Guide: `dan+test-free-{timestamp}@slctrips.com`
- Reservation: `dan+test-reserve-{timestamp}@slctrips.com`
- Stripe: `dan+stripe-test@slctrips.com`

**Stripe Test Card:**
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

**Total Time:** ~15 minutes
**All Tests Pass** = Ready for launch! 🚀
