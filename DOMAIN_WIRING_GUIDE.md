# Domain Wiring Guide: www.wasatchwise.com

## Quick Setup Steps

### 1. Vercel Configuration

1. **Access Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select project: `wasatchwise`

2. **Add Domain**
   - Navigate to: **Settings** → **Domains**
   - Click: **Add Domain**
   - Enter: `www.wasatchwise.com`
   - Click: **Add**

3. **Verify Domain Status**
   - Wait for Vercel to validate the domain
   - Status should show: "Valid Configuration" (green checkmark)
   - If invalid, follow the DNS instructions below

---

### 2. GoDaddy DNS Configuration

1. **Log into GoDaddy**
   - Go to: https://www.godaddy.com
   - Navigate to: **My Products** → **DNS**

2. **Find Domain**
   - Select: `wasatchwise.com`
   - Click: **DNS** or **Manage DNS**

3. **Add/Update CNAME Record**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 1 Hour (or 3600 seconds)
   ```

4. **Remove Conflicting Records** (if any)
   - If there's an existing `www` A record, delete it
   - If there's an existing `www` CNAME pointing elsewhere, update it

5. **Save Changes**
   - Click **Save** or **Add Record**
   - Wait for confirmation

---

### 3. DNS Propagation

**Wait Time:** 5-60 minutes (typically 10-15 minutes)

**Check Propagation:**
```bash
# Check DNS resolution
dig www.wasatchwise.com CNAME

# Expected output should show:
# www.wasatchwise.com. IN CNAME cname.vercel-dns.com.
```

**Online Tools:**
- https://dnschecker.org/#CNAME/www.wasatchwise.com
- https://www.whatsmydns.net/#CNAME/www.wasatchwise.com

---

### 4. SSL Certificate

**Automatic Provisioning:**
- Vercel automatically provisions SSL certificates via Let's Encrypt
- Certificate is issued within 1-2 minutes after domain is verified
- HTTPS is automatically enabled

**Verify SSL:**
- Visit: https://www.wasatchwise.com
- Check browser shows: 🔒 Secure (green lock icon)
- Test: https://www.ssllabs.com/ssltest/analyze.html?d=www.wasatchwise.com

---

### 5. HTTP to HTTPS Redirect

**Automatic:**
- Vercel automatically redirects HTTP → HTTPS
- Test: http://www.wasatchwise.com should redirect to https://www.wasatchwise.com

**Manual Configuration (if needed):**
Add to `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "x-forwarded-proto",
          "value": "http"
        }
      ],
      "destination": "https://www.wasatchwise.com/:1",
      "permanent": true
    }
  ]
}
```

---

### 6. Root Domain (wasatchwise.com)

**Option A: Redirect to www (Recommended)**
1. In GoDaddy DNS, add:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel's IP)
   TTL: 1 Hour
   ```
2. In Vercel, add domain: `wasatchwise.com`
3. Configure redirect in Vercel:
   - Settings → Domains → wasatchwise.com
   - Redirect to: `https://www.wasatchwise.com`

**Option B: Serve Both (Not Recommended)**
- Add both `wasatchwise.com` and `www.wasatchwise.com` to Vercel
- Configure DNS for both
- More complex, requires duplicate SSL certificates

---

### 7. Verification Checklist

- [ ] DNS CNAME record is added in GoDaddy
- [ ] DNS propagation is complete (checked via dnschecker.org)
- [ ] Domain is added in Vercel dashboard
- [ ] Domain status shows "Valid Configuration"
- [ ] SSL certificate is issued (green lock in browser)
- [ ] https://www.wasatchwise.com loads correctly
- [ ] HTTP redirects to HTTPS
- [ ] All pages load without errors
- [ ] No mixed content warnings

---

### 8. Troubleshooting

**Issue: "Invalid Configuration" in Vercel**
- **Solution:** Check DNS propagation. Wait 10-15 minutes and refresh.

**Issue: SSL Certificate Not Issued**
- **Solution:** Ensure domain is verified first. SSL is issued automatically after verification.

**Issue: Domain Resolves but Site Doesn't Load**
- **Solution:** 
  1. Check Vercel deployment is successful
  2. Verify domain is linked to correct project
  3. Check for DNS caching (clear browser cache, try incognito)

**Issue: Mixed Content Warnings**
- **Solution:** Ensure all resources (images, scripts) use HTTPS URLs

**Issue: CNAME Conflict**
- **Solution:** Remove any existing A records for `www` subdomain

---

### 9. Additional Domains

**For other domains (adultaiacademy.com, askbeforeyouapp.com):**

Repeat the same process:
1. Add domain in Vercel
2. Configure DNS in GoDaddy (or respective registrar)
3. Wait for propagation
4. Verify SSL certificate

**Subdomain Setup:**
```
Type: CNAME
Name: [subdomain] (e.g., "app", "admin")
Value: cname.vercel-dns.com
TTL: 1 Hour
```

---

### 10. Quick Reference

**Vercel Dashboard:**
- https://vercel.com/dashboard → wasatchwise → Settings → Domains

**GoDaddy DNS:**
- https://www.godaddy.com → My Products → DNS → wasatchwise.com

**Test URLs:**
- http://www.wasatchwise.com (should redirect to HTTPS)
- https://www.wasatchwise.com (should load site)

**DNS Check:**
- https://dnschecker.org/#CNAME/www.wasatchwise.com

---

**Last Updated:** [Date]  
**Status:** ✅ Complete / ⚠️ In Progress / ❌ Needs Attention
