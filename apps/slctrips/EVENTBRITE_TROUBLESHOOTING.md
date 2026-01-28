# 🔍 Eventbrite API Troubleshooting Guide

**Status**: Code is deployed, token is configured, but real-time events not appearing

---

## ✅ What We Know

1. **Code is Deployed** ✅
   - Eventbrite integration: Commit `fe2b4d9` (included in current deployment)
   - Function: `fetchEventsFromEventbrite()` exists
   - Integration: `searchEventsWithVertexAI()` calls Eventbrite first

2. **Token is Configured** ✅
   - `EVENTBRITE_API_TOKEN` added to Vercel
   - Applied to all environments
   - Token value: `FKILZ4KU7IJISJI4WNTG`

3. **Fallback is Working** ✅
   - System gracefully falls back to curated data
   - No errors or crashes
   - Disclaimers showing correctly

---

## 🔍 Diagnosis Steps

### Step 1: Verify Environment Variable is Accessible

The code checks for the token like this:
```typescript
const eventbriteToken = process.env.EVENTBRITE_API_TOKEN;
if (!eventbriteToken) {
  return null; // Falls back
}
```

**Possible Issues:**
- Environment variable not available at runtime
- Variable name mismatch
- Need to redeploy after adding variable

### Step 2: Check Vercel Function Logs

**How to Check:**
1. Go to Vercel Dashboard → Your Project
2. Navigate to **"Functions"** or **"Logs"** tab
3. Look for API route: `/api/dan/chat`
4. Check for:
   - "Eventbrite API error" messages
   - "Eventbrite API fetch error" messages
   - Any 401/403 authentication errors

**What to Look For:**
- ✅ If you see "Eventbrite API error: 401" → Token is invalid/expired
- ✅ If you see "Eventbrite API error: 429" → Rate limit exceeded
- ✅ If you see no Eventbrite logs → Code might not be trying Eventbrite
- ✅ If you see "Eventbrite API fetch error" → Network/API issue

### Step 3: Test API Directly

**Test the Eventbrite API token directly:**

```bash
# Test if token works
curl -H "Authorization: Bearer FKILZ4KU7IJISJI4WNTG" \
  "https://www.eventbriteapi.com/v3/users/me/?token=FKILZ4KU7IJISJI4WNTG"
```

**Expected Response:**
- ✅ If successful: Returns user info
- ❌ If 401: Token is invalid/expired

### Step 4: Verify Code Flow

The code should:
1. Try Eventbrite API first
2. If fails, try Vertex AI Search
3. If fails, use curated fallback

**Current behavior suggests:**
- Eventbrite is returning `null` (token not found or API call failing)
- System is falling back immediately

---

## 🔧 Solutions

### Solution 1: Redeploy After Adding Environment Variable

**Issue**: Environment variables added after deployment might not be available until redeploy

**Fix:**
1. Go to Vercel Dashboard → Deployments
2. Find latest deployment
3. Click **"Redeploy"** (this will pick up the new environment variable)

### Solution 2: Verify Environment Variable Name

**Check in Vercel:**
- Variable name: `EVENTBRITE_API_TOKEN` (exact match, case-sensitive)
- Value: `FKILZ4KU7IJISJI4WNTG` (no extra spaces)
- Environments: All selected (Production, Preview, Development)

### Solution 3: Check Token Permissions

**Eventbrite Token Requirements:**
- Must have "read public events" permission
- Must be an OAuth token (not just API key)
- Must be active (not expired)

**Verify:**
1. Go to Eventbrite Platform: https://www.eventbrite.com/platform/
2. Check your API key status
3. Verify it has proper permissions

### Solution 4: Add Debug Logging

**Temporary debug code** to see what's happening:

```typescript
// In fetchEventsFromEventbrite function
console.log('Eventbrite token check:', {
  hasToken: !!process.env.EVENTBRITE_API_TOKEN,
  tokenLength: process.env.EVENTBRITE_API_TOKEN?.length,
  tokenPrefix: process.env.EVENTBRITE_API_TOKEN?.substring(0, 5) + '...'
});
```

**Then check Vercel logs** to see if token is being read.

---

## 🧪 Quick Test

### Test 1: Check if Code is Running

**Add temporary logging:**
```typescript
// In searchEventsWithVertexAI function
console.log('Trying Eventbrite API...');
const eventbriteEvents = await fetchEventsFromEventbrite(area, category);
console.log('Eventbrite result:', eventbriteEvents ? 'SUCCESS' : 'FAILED');
```

**Check Vercel logs** after making a request to Dan.

### Test 2: Test API Endpoint Directly

**Make a test request:**
```bash
curl -X POST https://www.slctrips.com/api/dan/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What events are happening today?"}'
```

**Check response** - should show Eventbrite source if working.

---

## 🎯 Most Likely Issues

### Issue 1: Environment Variable Not Available at Runtime
**Cause**: Variable added after deployment, needs redeploy  
**Fix**: Redeploy from Vercel dashboard

### Issue 2: Token Invalid or Expired
**Cause**: Token might be wrong or expired  
**Fix**: Regenerate token in Eventbrite, update in Vercel

### Issue 3: Token Permissions
**Cause**: Token doesn't have "read public events" permission  
**Fix**: Check Eventbrite API key permissions

### Issue 4: API Rate Limit
**Cause**: Free tier limit exceeded  
**Fix**: Check Eventbrite usage dashboard

---

## 📋 Action Plan

### Immediate (5 minutes):
1. ✅ **Redeploy from Vercel** (picks up environment variable)
   - Go to Deployments → Latest → "Redeploy"

2. ✅ **Check Vercel Logs** after redeploy
   - Look for Eventbrite API calls
   - Check for any errors

3. ✅ **Test with Dan** after redeploy
   - Ask: "What events are happening today?"
   - Verify response source

### If Still Not Working:
4. ✅ **Verify Token in Eventbrite**
   - Check token is active
   - Verify permissions
   - Test token directly with curl

5. ✅ **Add Debug Logging** (temporary)
   - Add console.log to see what's happening
   - Check Vercel function logs

---

## 🔍 Debug Checklist

- [ ] Environment variable name is exact: `EVENTBRITE_API_TOKEN`
- [ ] Token value is correct: `FKILZ4KU7IJISJI4WNTG`
- [ ] Variable is added to Production environment
- [ ] Deployment happened AFTER variable was added
- [ ] Token is valid (test with curl)
- [ ] Token has proper permissions
- [ ] No rate limits exceeded
- [ ] Code is in current deployment (commit fe2b4d9+)

---

## 💡 Quick Fix

**Most likely solution**: Redeploy from Vercel

1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Click "..." on latest deployment
4. Click "Redeploy"
5. Wait for deployment to complete
6. Test with Dan again

**Why this works**: Environment variables are injected at build/runtime. If you added the variable after the last deployment, it won't be available until you redeploy.

---

**The code is ready. The token is configured. We just need to make sure they're connected!** 🚀
