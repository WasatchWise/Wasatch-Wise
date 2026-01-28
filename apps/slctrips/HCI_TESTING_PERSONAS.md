# 🧪 HCI Testing Personas - Production Site

**Purpose:** Test real user journeys on production site  
**Total Personas:** 11  
**Testing Focus:** Welcome Wagon flows, TripKit purchases, access codes, email delivery

---

## 📋 Testing Overview

### What We're Testing

1. **Welcome Wagon Free Guide** - Email signup and PDF/email delivery
2. **Welcome Wagon Reservation** - 90-day guide reservation flow
3. **Welcome Wagon Corporate** - Corporate inquiry form
4. **TripKit Purchase** - Full checkout and access code flow
5. **TK-000 Free Access** - Educational content access
6. **Access Code Redemption** - Using codes to access purchased TripKits
7. **Email Delivery** - Confirmation emails, guides, access codes

---

## 👥 Persona 1: Sarah - New Relocator (Free Guide)

**Profile:**
- **Name:** Sarah Martinez
- **Email:** sarah.martinez.test+1@example.com
- **Situation:** Moving to Salt Lake City in 2 weeks from California
- **Goal:** Get free Week 1 Survival Guide
- **Tech Comfort:** Medium (uses email regularly)

**Test Journey:**
1. Visit https://www.slctrips.com/welcome-wagon
2. Click "Get Free Guide" button
3. Enter email: `sarah.martinez.test+1@example.com`
4. Enter name: "Sarah"
5. Submit form

**Expected Results:**
- ✅ Success message: "Success! Check your email for the Week 1 Survival Guide."
- ✅ Email saved to `email_captures` table with `source='welcome_wagon_free_guide'`
- ✅ Email received within 2 minutes (check spam folder)
- ✅ Email contains HTML guide (not PDF attachment - it's HTML email)
- ✅ Email includes checklist, Utah tips, top 5 destinations
- ✅ Email has link to upgrade to 90-day guide

**What to Verify:**
- [ ] Form submission works
- [ ] Success message appears
- [ ] Email arrives (check inbox AND spam)
- [ ] Email content is readable (HTML format)
- [ ] Links in email work
- [ ] Database record created correctly

**Potential Issues:**
- Email goes to spam
- SendGrid not configured (email won't send)
- Form validation errors
- Database insert fails

---

## 👥 Persona 2: James - TripKit Buyer (First Purchase)

**Profile:**
- **Name:** James Thompson
- **Email:** james.thompson.test+1@example.com
- **Situation:** Planning Utah ski trip, wants "Ski Utah Complete" TripKit
- **Goal:** Purchase and access TripKit
- **Tech Comfort:** High (comfortable with online purchases)

**Test Journey:**
1. Visit https://www.slctrips.com/tripkits
2. Find "Ski Utah Complete" (or any active TripKit)
3. Click "Purchase TripKit" or "Buy Now"
4. Complete Stripe checkout with test card: `4242 4242 4242 4242`
5. Enter email: `james.thompson.test+1@example.com`
6. Complete payment

**Expected Results:**
- ✅ Redirected to `/checkout/success` page
- ✅ Access code displayed on success page
- ✅ Access code format: `TK-XXXX-XXXX` (8 characters)
- ✅ Email received with access code and link
- ✅ Can click "Access Your TripKit Now" button
- ✅ Taken to `/tk/[access-code]` page
- ✅ TripKit content displays (destinations, stories, etc.)
- ✅ Database records:
  - `purchases` table has record
  - `tripkit_access_codes` table has record
  - `customer_product_access` table has record (if Welcome Wagon)

**What to Verify:**
- [ ] Stripe checkout loads correctly
- [ ] Payment processes (test mode)
- [ ] Success page shows access code
- [ ] Access code is copyable
- [ ] Email arrives with access code
- [ ] Access code works at `/tk/[code]`
- [ ] TripKit content is accessible
- [ ] Database records created

**Potential Issues:**
- Stripe checkout doesn't load
- Payment fails
- Access code not generated
- Email not sent
- Access code doesn't work
- Webhook not processing

---

## 👥 Persona 3: Maria - Corporate HR Manager

**Profile:**
- **Name:** Maria Rodriguez
- **Email:** maria.rodriguez.test+1@example.com
- **Situation:** HR manager relocating 15 employees to Utah
- **Goal:** Inquire about Corporate Edition
- **Tech Comfort:** High

**Test Journey:**
1. Visit https://www.slctrips.com/welcome-wagon
2. Scroll to "Corporate/HR Edition" card
3. Click "Contact for Corporate Pricing"
4. Enter email: `maria.rodriguez.test+1@example.com`
5. Enter company: "TechCorp Inc"
6. Enter employees: "15"
7. Submit form

**Expected Results:**
- ✅ Success message: "Thank you! We'll be in touch within 24 hours."
- ✅ Email saved to `email_captures` with `source='welcome_wagon_corporate'`
- ✅ Notes field contains: "Company: TechCorp Inc, Employees: 15"
- ✅ No email sent (just database record for follow-up)

**What to Verify:**
- [ ] Form submission works
- [ ] Success message appears
- [ ] Database record created with company info
- [ ] Notes field populated correctly

**Potential Issues:**
- Form validation errors
- Database insert fails
- Company info not saved

---

## 👥 Persona 4: David - 90-Day Guide Reservation

**Profile:**
- **Name:** David Chen
- **Email:** david.chen.test+1@example.com
- **Situation:** Moving in 3 months, wants to reserve 90-Day Welcome Wagon
- **Goal:** Reserve spot for when product launches
- **Tech Comfort:** Medium

**Test Journey:**
1. Visit https://www.slctrips.com/welcome-wagon
2. Click "Reserve Yours Now" on 90-Day Welcome Wagon card
3. Enter email: `david.chen.test+1@example.com`
4. Enter name: "David"
5. Submit form

**Expected Results:**
- ✅ Success message: "Success! We'll email you at [email] when the 90-Day Welcome Wagon is available for purchase."
- ✅ Email saved to `email_captures` with `source='reservation_welcome-wagon'`
- ✅ Preferences array contains: `['welcome-wagon-90-day']`
- ✅ Notes field contains: "Name: David, Reservation: 90-Day Welcome Wagon ($49)"
- ✅ No immediate email (will be notified when product launches)

**What to Verify:**
- [ ] Form submission works
- [ ] Success message appears
- [ ] Database record created
- [ ] Preferences array populated
- [ ] Notes field has reservation info

**Potential Issues:**
- Form validation errors
- Preferences not saved correctly
- Database insert fails

---

## 👥 Persona 5: Lisa - Multiple TripKit Purchases

**Profile:**
- **Name:** Lisa Anderson
- **Email:** lisa.anderson.test+1@example.com
- **Situation:** Utah travel enthusiast, wants multiple TripKits
- **Goal:** Purchase 2-3 different TripKits
- **Tech Comfort:** High

**Test Journey:**
1. Purchase first TripKit (e.g., "Ski Utah Complete")
2. Complete checkout, get access code #1
3. Return to TripKits page
4. Purchase second TripKit (e.g., "Haunted Highway")
5. Complete checkout, get access code #2
6. Verify both access codes work

**Expected Results:**
- ✅ Each purchase generates unique access code
- ✅ Each access code works independently
- ✅ Can access both TripKits
- ✅ Database has separate records for each purchase
- ✅ Emails received for each purchase

**What to Verify:**
- [ ] Multiple purchases work
- [ ] Each access code is unique
- [ ] Both codes work
- [ ] Database has separate records
- [ ] No conflicts between purchases

**Potential Issues:**
- Access codes conflict
- Second purchase fails
- Database issues with multiple records

---

## 👥 Persona 6: Robert - Access Code Redemption

**Profile:**
- **Name:** Robert Kim
- **Email:** robert.kim.test+1@example.com
- **Situation:** Received access code via email, wants to use it
- **Goal:** Redeem access code to view TripKit
- **Tech Comfort:** Medium

**Test Journey:**
1. Purchase a TripKit (get access code)
2. Copy access code from email or success page
3. Visit https://www.slctrips.com/tk/[access-code]
4. Verify TripKit loads

**Expected Results:**
- ✅ Access code page loads
- ✅ TripKit name displays
- ✅ Destinations list shows
- ✅ Deep Dive stories show (if available)
- ✅ Can navigate TripKit content
- ✅ Access code is validated

**What to Verify:**
- [ ] Access code URL works
- [ ] Invalid codes show error
- [ ] Valid codes show TripKit
- [ ] All TripKit features work
- [ ] Navigation works

**Potential Issues:**
- Access code not found
- TripKit doesn't load
- Invalid code handling
- Missing content

---

## 👥 Persona 7: Emily - TK-000 Free Educational Access

**Profile:**
- **Name:** Emily Johnson
- **Email:** emily.johnson.test+1@example.com
- **Situation:** Teacher looking for free Utah educational content
- **Goal:** Access TK-000 "Free Utah" educational TripKit
- **Tech Comfort:** Medium

**Test Journey:**
1. Visit https://www.slctrips.com/tripkits/meet-the-mt-olympians (or TK-000 page)
2. Enter email: `emily.johnson.test+1@example.com`
3. Submit email gate form
4. Access TK-000 content

**Expected Results:**
- ✅ Email gate form appears
- ✅ Email saved to database
- ✅ Instant access granted (no payment)
- ✅ Can view 29 TK-000 destinations
- ✅ Educational content displays
- ✅ No access code needed (free access)

**What to Verify:**
- [ ] Email gate works
- [ ] Access granted immediately
- [ ] Content displays
- [ ] No payment required
- [ ] Database record created

**Potential Issues:**
- Email gate doesn't work
- Access not granted
- Content doesn't load
- Payment required (should be free)

---

## 👥 Persona 8: Michael - Email Delivery Test

**Profile:**
- **Name:** Michael Brown
- **Email:** michael.brown.test+1@example.com
- **Situation:** Testing email delivery for all flows
- **Goal:** Verify emails arrive for all actions
- **Tech Comfort:** High

**Test Journey:**
1. Sign up for free guide → Check email
2. Reserve 90-day guide → Check email (should be notification only)
3. Purchase TripKit → Check email
4. Verify all emails arrive and are readable

**Expected Results:**
- ✅ Free guide email arrives (HTML format, not PDF)
- ✅ Reservation confirmation (if implemented)
- ✅ TripKit purchase email with access code
- ✅ All emails are readable
- ✅ Links in emails work
- ✅ Email formatting is correct

**What to Verify:**
- [ ] All emails arrive
- [ ] Email content is correct
- [ ] Links work
- [ ] Formatting is good
- [ ] No spam issues
- [ ] SendGrid configured correctly

**Potential Issues:**
- Emails go to spam
- SendGrid not configured
- Email content broken
- Links don't work
- Missing emails

---

## 👥 Persona 9: Jennifer - Error Handling Test

**Profile:**
- **Name:** Jennifer Lee
- **Email:** jennifer.lee.test+1@example.com
- **Situation:** Testing error scenarios
- **Goal:** Verify error handling works
- **Tech Comfort:** High

**Test Journey:**
1. Submit form with invalid email
2. Try to purchase with declined card
3. Try invalid access code
4. Test network errors
5. Test form validation

**Expected Results:**
- ✅ Invalid email shows error
- ✅ Declined card shows Stripe error
- ✅ Invalid access code shows error page
- ✅ Network errors handled gracefully
- ✅ Form validation works

**What to Verify:**
- [ ] Error messages are clear
- [ ] User can recover from errors
- [ ] No crashes or white screens
- [ ] Error logging works (Sentry)

**Potential Issues:**
- Errors not handled
- White screen of death
- Unclear error messages
- No error recovery

---

## 👥 Persona 10: Alex - Mobile User Experience

**Profile:**
- **Name:** Alex Taylor
- **Email:** alex.taylor.test+1@example.com
- **Situation:** Testing on mobile device
- **Goal:** Complete all flows on mobile
- **Tech Comfort:** High

**Test Journey:**
1. Visit site on mobile (iPhone/Android)
2. Sign up for free guide on mobile
3. Purchase TripKit on mobile
4. Use access code on mobile
5. Check email on mobile

**Expected Results:**
- ✅ Site is mobile-responsive
- ✅ Forms work on mobile
- ✅ Stripe checkout works on mobile
- ✅ Access code entry works
- ✅ Email is mobile-friendly

**What to Verify:**
- [ ] Mobile layout works
- [ ] Touch targets are large enough
- [ ] Forms are usable
- [ ] Payment works
- [ ] No horizontal scrolling

**Potential Issues:**
- Layout broken on mobile
- Forms hard to use
- Payment issues
- Text too small
- Buttons too small

---

## 👥 Persona 11: Chris - Complete Journey (All Features)

**Profile:**
- **Name:** Chris Wilson
- **Email:** chris.wilson.test+1@example.com
- **Situation:** New to Utah, wants everything
- **Goal:** Test complete user journey
- **Tech Comfort:** Medium-High

**Test Journey:**
1. Visit homepage
2. Sign up for free guide
3. Browse destinations
4. Purchase a TripKit
5. Use access code
6. Reserve 90-day guide
7. Contact for corporate info
8. Check all emails received

**Expected Results:**
- ✅ All features work together
- ✅ No conflicts between actions
- ✅ All emails arrive
- ✅ All database records created
- ✅ Complete journey is smooth

**What to Verify:**
- [ ] End-to-end journey works
- [ ] No conflicts
- [ ] All features accessible
- [ ] Data integrity maintained

**Potential Issues:**
- Feature conflicts
- Data integrity issues
- Missing functionality
- Broken links

---

## 📊 Testing Checklist Summary

### Welcome Wagon Flows
- [ ] Free guide signup works
- [ ] Free guide email arrives (HTML, not PDF)
- [ ] Reservation form works
- [ ] Corporate inquiry works
- [ ] All database records created

### TripKit Purchase Flows
- [ ] Stripe checkout works
- [ ] Payment processes
- [ ] Access code generated
- [ ] Access code email sent
- [ ] Access code works
- [ ] Success page displays code

### Access & Content
- [ ] TK-000 free access works
- [ ] Access codes redeem correctly
- [ ] TripKit content displays
- [ ] Invalid codes handled

### Email Delivery
- [ ] All emails arrive
- [ ] Email content correct
- [ ] Links work
- [ ] Mobile-friendly

### Error Handling
- [ ] Validation errors clear
- [ ] Payment errors handled
- [ ] Network errors handled
- [ ] No crashes

---

## 🔍 Database Verification Queries

### Check Welcome Wagon Signups
```sql
SELECT * FROM email_captures 
WHERE source IN ('welcome_wagon_free_guide', 'reservation_welcome-wagon', 'welcome_wagon_corporate')
ORDER BY created_at DESC
LIMIT 10;
```

### Check TripKit Purchases
```sql
SELECT p.*, t.name as tripkit_name, tac.access_code
FROM purchases p
LEFT JOIN tripkits t ON p.product_id = t.id::text
LEFT JOIN tripkit_access_codes tac ON p.id = tac.purchase_id
WHERE p.product_type = 'tripkit'
ORDER BY p.purchased_at DESC
LIMIT 10;
```

### Check Access Codes
```sql
SELECT * FROM tripkit_access_codes
ORDER BY created_at DESC
LIMIT 10;
```

### Check Customer Access
```sql
SELECT * FROM customer_product_access
ORDER BY granted_at DESC
LIMIT 10;
```

---

## 📧 Email Testing Notes

### Important: Email Format
- **Free Guide:** HTML email (NOT PDF attachment)
- **TripKit Purchase:** HTML email with access code
- **Reservation:** May not send email (just database record)

### Email Providers to Test
- Gmail
- Outlook
- Yahoo
- Apple Mail
- Check spam folders!

### SendGrid Configuration
- Verify `SENDGRID_API_KEY` is set in Vercel
- Check SendGrid dashboard for delivery status
- Monitor bounce/spam reports

---

## 🐛 Common Issues & Solutions

### Issue: Email Not Arriving
**Check:**
1. SendGrid API key configured?
2. Check spam folder
3. Check SendGrid dashboard
4. Verify email address is valid

### Issue: Access Code Not Working
**Check:**
1. Code format correct? (`TK-XXXX-XXXX`)
2. Code exists in database?
3. Code not expired?
4. Webhook processed correctly?

### Issue: Payment Fails
**Check:**
1. Using test card: `4242 4242 4242 4242`
2. Stripe test mode enabled?
3. Stripe webhook configured?
4. Check Stripe dashboard

### Issue: Form Submission Fails
**Check:**
1. Browser console errors
2. Network tab for API errors
3. Database connection
4. Form validation

---

## ✅ Success Criteria

### Must Pass (Critical)
- ✅ Welcome Wagon free guide signup works
- ✅ TripKit purchase completes
- ✅ Access codes generated and work
- ✅ Emails arrive (check spam)
- ✅ Database records created

### Should Pass (Important)
- ✅ All forms work
- ✅ Error handling works
- ✅ Mobile experience good
- ✅ Email content readable

### Nice to Have (Optional)
- ✅ Email formatting perfect
- ✅ All links work
- ✅ Fast response times
- ✅ No console errors

---

## 📝 Testing Report Template

After testing each persona, document:

**Persona:** [Name]  
**Date:** [Date]  
**Tester:** [Your name]  
**Status:** ✅ Pass / ❌ Fail / ⚠️ Partial

**What Worked:**
- [List items]

**What Failed:**
- [List items]

**Issues Found:**
- [List bugs]

**Screenshots:**
- [Attach if issues]

**Database Verification:**
- [SQL query results]

---

**Ready to test!** 🚀

Start with Persona 1 (Sarah - Free Guide) and work through systematically. Document everything!

