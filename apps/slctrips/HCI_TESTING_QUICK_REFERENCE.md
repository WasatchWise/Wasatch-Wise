# 🚀 HCI Testing Quick Reference Card

**Print this and keep it handy during testing!**

---

## 📧 Test Email Addresses

Use these for testing (add +1, +2, etc. for multiple tests):

- `test+persona1@example.com` - Free Guide
- `test+persona2@example.com` - TripKit Purchase
- `test+persona3@example.com` - Corporate
- `test+persona4@example.com` - Reservation
- `test+persona5@example.com` - Multiple Purchases
- `test+persona6@example.com` - Access Code Test
- `test+persona7@example.com` - TK-000 Free
- `test+persona8@example.com` - Email Delivery
- `test+persona9@example.com` - Error Testing
- `test+persona10@example.com` - Mobile
- `test+persona11@example.com` - Complete Journey

---

## 💳 Stripe Test Card

**Card Number:** `4242 4242 4242 4242`  
**Expiry:** Any future date (e.g., 12/25)  
**CVC:** Any 3 digits (e.g., 123)  
**ZIP:** Any 5 digits (e.g., 12345)

---

## 🔗 Key URLs

- **Homepage:** https://www.slctrips.com
- **Welcome Wagon:** https://www.slctrips.com/welcome-wagon
- **TripKits:** https://www.slctrips.com/tripkits
- **TK-000:** https://www.slctrips.com/tripkits/meet-the-mt-olympians
- **FAQ:** https://www.slctrips.com/faq
- **Access Code:** https://www.slctrips.com/tk/[CODE]

---

## ✅ Quick Test Checklist

### Welcome Wagon Free Guide
1. Go to `/welcome-wagon`
2. Click "Get Free Guide"
3. Enter email + name
4. Submit
5. ✅ Check email (inbox + spam)
6. ✅ Verify database record

### TripKit Purchase
1. Go to `/tripkits`
2. Click "Purchase" on any TripKit
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. ✅ Get access code on success page
6. ✅ Check email for access code
7. ✅ Visit `/tk/[code]` - should work

### Access Code Test
1. Copy access code from email/success page
2. Visit `https://www.slctrips.com/tk/[CODE]`
3. ✅ TripKit should load
4. ✅ Destinations should show

---

## 🐛 Quick Troubleshooting

**Email not arriving?**
- Check spam folder
- Verify SendGrid API key set
- Check SendGrid dashboard

**Access code not working?**
- Verify code format: `TK-XXXX-XXXX`
- Check database: `SELECT * FROM tripkit_access_codes WHERE access_code = '[CODE]'`
- Verify webhook processed

**Payment fails?**
- Use test card: `4242 4242 4242 4242`
- Check Stripe test mode enabled
- Check browser console for errors

**Form doesn't submit?**
- Check browser console
- Check network tab
- Verify database connection

---

## 📊 Database Quick Checks

### Check Recent Signups
```sql
SELECT email, source, created_at 
FROM email_captures 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Recent Purchases
```sql
SELECT customer_email, product_type, amount_paid, purchased_at
FROM purchases
ORDER BY purchased_at DESC
LIMIT 5;
```

### Check Access Codes
```sql
SELECT access_code, customer_email, tripkit_id, created_at
FROM tripkit_access_codes
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📧 Email Format Notes

**Free Guide Email:**
- Format: HTML email (NOT PDF)
- Subject: "🏔️ Your Week 1 Survival Guide - Welcome to Utah!"
- Contains: Checklist, Utah tips, top 5 destinations

**TripKit Purchase Email:**
- Format: HTML email
- Subject: "🎉 Thanks for your purchase!"
- Contains: Access code, TripKit name, access link

**Reservation Email:**
- May not send email (just database record)
- Will notify when product launches

---

## ⚡ Quick Test Scenarios

### Scenario 1: Happy Path (5 min)
1. Sign up for free guide → Check email
2. Purchase TripKit → Get access code
3. Use access code → View TripKit
✅ All should work

### Scenario 2: Error Path (5 min)
1. Invalid email → Should show error
2. Declined card → Should show Stripe error
3. Invalid access code → Should show error
✅ Errors should be clear

### Scenario 3: Mobile (5 min)
1. Test on phone
2. Sign up for free guide
3. Purchase TripKit
✅ Should work on mobile

---

## 📝 What to Document

For each test:
- ✅ What worked
- ❌ What failed
- 🐛 Bugs found
- 📸 Screenshots (if issues)
- 💾 Database verification

---

**Keep this handy during testing!** 📋

