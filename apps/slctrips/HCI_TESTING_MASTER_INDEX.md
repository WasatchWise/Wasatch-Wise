# 🧪 HCI Testing - Master Index

**Purpose:** Complete guide for testing 11 personas on production site  
**Status:** Ready to Execute  
**Total Time:** 65-90 minutes

---

## 📚 Documentation Index

### 1. **HCI_TESTING_PERSONAS.md** ⭐ START HERE
**What it is:** 11 detailed personas with step-by-step test journeys  
**Use for:** Understanding what to test for each persona  
**Time:** Reference during testing

### 2. **HCI_TESTING_EXECUTION_GUIDE.md** ⭐ EXECUTE THIS
**What it is:** Step-by-step execution plan with verification steps  
**Use for:** Actually running the tests  
**Time:** 65-90 minutes

### 3. **HCI_TESTING_QUICK_REFERENCE.md** ⭐ KEEP HANDY
**What it is:** Quick reference card with test cards, URLs, SQL  
**Use for:** Quick lookups during testing  
**Time:** Reference as needed

### 4. **HCI_TESTING_REPORT.md**
**What it is:** Implementation analysis and code review  
**Use for:** Understanding how things work under the hood  
**Time:** Read before testing (optional)

### 5. **PRODUCTION_CONFIG_CHECKLIST.md** ⚠️ DO FIRST
**What it is:** Configuration verification checklist  
**Use for:** Ensuring services are set up before testing  
**Time:** 10 minutes (before testing)

### 6. **HCI_TESTING_RESULTS_TEMPLATE.csv**
**What it is:** Spreadsheet template for tracking results  
**Use for:** Documenting test results  
**Time:** Fill out during/after testing

---

## 🚀 Quick Start Guide

### Step 1: Verify Configuration (10 min)
1. Open `PRODUCTION_CONFIG_CHECKLIST.md`
2. Verify SendGrid API key is set
3. Verify Stripe webhook is configured
4. Test database connection

### Step 2: Prepare Testing (5 min)
1. Open `HCI_TESTING_EXECUTION_GUIDE.md`
2. Open `HCI_TESTING_QUICK_REFERENCE.md`
3. Open `HCI_TESTING_RESULTS_TEMPLATE.csv`
4. Prepare test email addresses
5. Have Stripe test card ready: `4242 4242 4242 4242`

### Step 3: Execute Tests (65-90 min)
1. Follow `HCI_TESTING_EXECUTION_GUIDE.md`
2. Test each persona systematically
3. Use `test-hci-flow.mjs` script to verify database
4. Document results in CSV template

### Step 4: Review Results (10 min)
1. Review all test results
2. Document critical issues
3. Create action items for fixes

---

## 🛠️ Testing Tools

### Database Verification Script
**File:** `test-hci-flow.mjs`

**Commands:**
```bash
# Check email signup
node test-hci-flow.mjs --check-email test@example.com

# Check purchases
node test-hci-flow.mjs --check-purchase test@example.com

# Check access code
node test-hci-flow.mjs --check-access-code TK-XXXX-XXXX

# Recent signups
node test-hci-flow.mjs --recent-signups 10

# Recent purchases
node test-hci-flow.mjs --recent-purchases 10

# Recent access codes
node test-hci-flow.mjs --recent-codes 10
```

---

## 📋 The 11 Personas

1. **Sarah** - Free Guide Signup (5 min)
2. **James** - TripKit Purchase (10 min)
3. **Maria** - Corporate Inquiry (5 min)
4. **David** - 90-Day Reservation (5 min)
5. **Lisa** - Multiple Purchases (5 min)
6. **Robert** - Access Code Redemption (5 min)
7. **Emily** - TK-000 Free Access (5 min)
8. **Michael** - Email Delivery (5 min)
9. **Jennifer** - Error Handling (10 min)
10. **Alex** - Mobile Experience (5 min)
11. **Chris** - Complete Journey (10 min)

**Total:** ~65 minutes (plus verification time)

---

## 🎯 Key Testing Points

### Welcome Wagon Flows
- ✅ Free guide signup → Email delivery (HTML, not PDF)
- ✅ Corporate inquiry → Database record
- ✅ 90-day reservation → Database record with preferences

### TripKit Purchase Flow
- ✅ Stripe checkout → Payment processing
- ✅ Access code generation → `TK-XXXX-XXXX` format
- ✅ Email delivery → Access code in email
- ✅ Access code redemption → `/tk/[code]` works

### Access & Content
- ✅ TK-000 free access → Instant access
- ✅ Access code validation → Works/errors handled
- ✅ TripKit content → Displays correctly

### Email Delivery
- ✅ All emails arrive → Check spam folders
- ✅ Email content → HTML format, readable
- ✅ Links work → All links functional

---

## 📊 Expected Results Summary

### Persona 1: Free Guide
- ✅ Form submits successfully
- ✅ Email arrives (HTML format)
- ✅ Database record created
- ✅ Email contains guide content

### Persona 2: TripKit Purchase
- ✅ Stripe checkout works
- ✅ Payment processes
- ✅ Access code generated
- ✅ Email with access code sent
- ✅ Access code works

### Persona 3-11: [See HCI_TESTING_PERSONAS.md for details]

---

## 🔍 Verification Methods

### Database Verification
- Use `test-hci-flow.mjs` script
- Check Supabase dashboard
- Run SQL queries

### Email Verification
- Check inbox
- Check spam folder
- Verify SendGrid dashboard
- Test email links

### Functional Verification
- Test each flow end-to-end
- Verify error handling
- Check mobile experience
- Test edge cases

---

## ⚠️ Common Issues & Solutions

### Emails Not Arriving
**Check:**
1. SendGrid API key configured?
2. Check spam folder
3. Verify SendGrid dashboard
4. Check email address is valid

### Access Codes Not Working
**Check:**
1. Code format correct? (`TK-XXXX-XXXX`)
2. Code exists in database?
3. Webhook processed correctly?
4. Check database with script

### Payment Fails
**Check:**
1. Using test card: `4242 4242 4242 4242`
2. Stripe test mode enabled?
3. Webhook configured?
4. Check Stripe dashboard

---

## 📝 Testing Checklist

### Before Testing
- [ ] Configuration verified
- [ ] Test emails ready
- [ ] Test card ready
- [ ] Tools open
- [ ] Database access ready

### During Testing
- [ ] Follow execution guide
- [ ] Test each persona
- [ ] Verify database records
- [ ] Check emails
- [ ] Document results

### After Testing
- [ ] Review all results
- [ ] Document issues
- [ ] Create action items
- [ ] Share findings

---

## 🎯 Success Metrics

### Must Pass (Critical)
- ✅ All 11 personas can complete their journeys
- ✅ Emails arrive for all flows
- ✅ Access codes work
- ✅ Database records created
- ✅ No critical errors

### Should Pass (Important)
- ✅ Error handling works
- ✅ Mobile experience good
- ✅ Email content readable
- ✅ All links work

---

## 🚀 Ready to Test!

**Start Here:**
1. Read `PRODUCTION_CONFIG_CHECKLIST.md` (10 min)
2. Follow `HCI_TESTING_EXECUTION_GUIDE.md` (65-90 min)
3. Use `HCI_TESTING_QUICK_REFERENCE.md` for quick lookups
4. Document results in `HCI_TESTING_RESULTS_TEMPLATE.csv`

**Need Help?**
- I can walk you through each persona
- Help verify database records
- Debug issues as they arise
- Review results after testing

**Let's test!** 🧪

---

**All documents ready. Configuration check first, then execute tests!**

