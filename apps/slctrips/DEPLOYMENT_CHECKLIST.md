# 🚀 Production Deployment Checklist

**Status:** All code fixes deployed ✅ | Database migration pending ⏳

---

## Phase 1: Database Migration (5 minutes)

### Step 1: Deploy customer_product_access Table

**Action Required:** Run SQL in Supabase Dashboard

```bash
# 1. Read the deployment guide
cat DEPLOY_CUSTOMER_ACCESS_TABLE.md

# 2. Copy the SQL from the guide and run it in Supabase SQL Editor
# (Located at: https://supabase.com/dashboard → SQL Editor)

# 3. Verify the migration worked
node verify-customer-access-table.mjs
```

**Expected Output:**
```
✅ Table exists and is queryable
✅ Webhook can insert records
✅ Ready for production!
```

---

## Phase 2: System Validation (2 minutes)

### Step 2: Run Full Production Readiness Check

```bash
node test-production-ready.mjs
```

**Expected Output:**
```
Results: 17 passed, 0 failed
🎉 ALL SYSTEMS GO!
```

If any tests fail, the script will tell you exactly what to fix.

---

## Phase 3: Live Testing (10 minutes)

### Step 3: Test Welcome Wagon Forms in Production

**On www.slctrips.com/welcome-wagon:**

1. **Test Free Guide Form:**
   - Enter email: `test+free@yourcompany.com`
   - Enter name: "Test Free"
   - Click "Get Free Guide"
   - ✅ Should show success message
   - ✅ Should insert into `email_captures` with source='welcome_wagon_free_guide'

2. **Test Reservation Form:**
   - Enter email: `test+reserve@yourcompany.com`
   - Enter name: "Test Reserve"
   - Click "Reserve Yours Now"
   - ✅ Should show success message
   - ✅ Should insert with source='reservation_welcome-wagon'

3. **Test Corporate Form:**
   - Enter email: `test+corp@yourcompany.com`
   - Enter company: "Test Corp"
   - Enter employees: "50"
   - Click "Contact for Corporate Pricing"
   - ✅ Should show success message
   - ✅ Should insert with source='welcome_wagon_corporate'

**Verify in Supabase:**
```sql
SELECT email, source, visitor_type, notes, preferences, created_at
FROM email_captures
WHERE email LIKE 'test+%@yourcompany.com'
ORDER BY created_at DESC;
```

### Step 4: Verify Deep Dive Stories Appear

**Visit:** www.slctrips.com/tripkits/ski-utah-complete (TK-002)

- ✅ Should see "Deep Dive Stories" section
- ✅ Should display ~16 stories (13 TK-002 + 3 TKE-002)

### Step 5: Test Stripe Checkout (Test Mode)

**Prerequisites:**
- Ensure Stripe is in test mode
- Use test card: `4242 4242 4242 4242`

**Test TripKit Purchase:**
1. Visit any TripKit detail page
2. Click "Purchase TripKit" button
3. Complete checkout with test card
4. ✅ Should redirect to success page
5. ✅ Should receive confirmation email (if SendGrid configured)
6. ✅ Should create record in `tripkit_access_codes`
7. ✅ Should create record in `purchases`

**Verify in Supabase:**
```sql
-- Check access code was created
SELECT * FROM tripkit_access_codes
ORDER BY created_at DESC LIMIT 5;

-- Check purchase was recorded
SELECT * FROM purchases
ORDER BY purchased_at DESC LIMIT 5;
```

---

## Phase 4: Dan's Review Prep

### Decision Needed: TK-045 Positioning

**Current State:**
- Product name: "250 Under $25"
- Actual destinations: 25
- Mismatch: 225 destinations short

**Options:**

**A) Quick Fix - Rename** (5 minutes)
- Change name to "25 Budget Adventures"
- Update description to match
- Pros: Honest, immediate
- Cons: Less impressive

**B) Gradual Rollout** (keeps name, adds disclaimer)
- Keep "250 Under $25" name
- Add subtitle: "Launching with 25 curated picks"
- Message: "More added weekly!"
- Pros: Maintains vision, sets expectations
- Cons: Requires communication strategy

**C) Full Build-Out** (requires data work)
- Add 225 more destinations
- Implement admission_fee filtering
- Deliver full 250 promise
- Pros: Delivers original vision
- Cons: Time investment

**Recommendation:** Option B for launch, transition to C over time.

---

## Phase 5: Final Launch Checks

### Before Accepting Real Payments:

- [ ] `customer_product_access` table deployed
- [ ] All 17 production readiness tests pass
- [ ] Welcome Wagon forms tested live
- [ ] Stripe test payment completes successfully
- [ ] Access codes generate correctly
- [ ] Email confirmations send (if configured)
- [ ] TK-045 positioning decided
- [ ] Dan has reviewed staging site

### Environment Variables Confirmed:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `SENDGRID_API_KEY` (optional but recommended)
- [ ] `NEXT_PUBLIC_SITE_URL`

---

## Quick Command Reference

```bash
# Deploy database migration
node verify-customer-access-table.mjs

# Run full system check
node test-production-ready.mjs

# Test Welcome Wagon forms
node test-welcome-wagon-insert.mjs

# Check TripKit counts
node check-counts-final.mjs

# Build and deploy
npm run build
vercel --prod  # or your deployment command
```

---

## Rollback Plan (If Needed)

If critical issues discovered post-deployment:

1. **Disable Stripe payments:**
   ```bash
   # Remove STRIPE_SECRET_KEY from .env
   # Deploy to disable checkout buttons
   ```

2. **Revert Welcome Wagon forms:**
   ```bash
   git revert [commit-hash]
   npm run build && vercel --prod
   ```

3. **Drop customer_product_access table:**
   ```sql
   DROP TABLE IF EXISTS customer_product_access CASCADE;
   ```

---

## Current Status

✅ **Code Deployed:**
- Welcome Wagon form handlers
- Deep Dive stories query
- TripKit destination counts

⏳ **Pending:**
- Database migration (customer_product_access)
- Live production testing
- TK-045 positioning decision

🎯 **Next Action:**
Run the SQL migration in Supabase, then execute `node test-production-ready.mjs`

---

**Questions?** Check CRITICAL_FIXES_APPLIED_NOV9_2025.md for detailed context.
