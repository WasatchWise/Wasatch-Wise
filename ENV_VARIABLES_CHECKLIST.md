# Environment Variables Checklist for Vercel

## Required Environment Variables

### ✅ Core API Keys

**ANTHROPIC_API_KEY** (Required for WiseBot)
- **Name:** `ANTHROPIC_API_KEY` (note: includes `_API`)
- **Value:** Your Anthropic API key (starts with `sk-ant-...`)
- **Used in:**
  - `app/api/ai/chat/route.ts` - WiseBot chat
  - `lib/ai/claude.ts` - Claude API client
  - `lib/ai/analyze-audit.ts` - Audit analysis
- **Environment:** Production, Preview, Development

**RESEND_API_KEY** (Required for email)
- **Name:** `RESEND_API_KEY`
- **Value:** Your Resend API key
- **Used in:** `lib/email/send.ts`
- **Environment:** Production, Preview, Development

### ✅ Supabase

**NEXT_PUBLIC_SUPABASE_URL** (Required)
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- **Environment:** Production, Preview, Development

**NEXT_PUBLIC_SUPABASE_ANON_KEY** (Required)
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon/public key
- **Environment:** Production, Preview, Development

**SUPABASE_SERVICE_ROLE_KEY** (Required for server-side operations)
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your Supabase service role key (keep secret!)
- **Environment:** Production, Preview, Development

### ⚠️ Optional API Keys

**HEYGEN_API_KEY** (Optional - for video generation)
- **Name:** `HEYGEN_API_KEY`
- **Value:** Your HeyGen API key
- **Used in:** `lib/ai/heygen.ts`
- **Environment:** Production, Preview, Development

**HEYGEN_JOHN_AVATAR_ID** (Optional - for video generation)
- **Name:** `HEYGEN_JOHN_AVATAR_ID`
- **Value:** Your HeyGen avatar ID
- **Used in:** `lib/ai/heygen.ts`
- **Environment:** Production, Preview, Development

**ELEVENLABS_API_KEY** (Optional - for voice synthesis)
- **Name:** `ELEVENLABS_API_KEY`
- **Value:** Your ElevenLabs API key
- **Used in:** `lib/ai/elevenlabs.ts`, `app/api/voice/elevenlabs-tts/route.ts`
- **Environment:** Production, Preview, Development

**ELEVENLABS_JOHN_VOICE_ID** (Optional - for voice synthesis)
- **Name:** `ELEVENLABS_JOHN_VOICE_ID`
- **Value:** Your ElevenLabs voice ID
- **Used in:** `lib/ai/elevenlabs.ts`
- **Environment:** Production, Preview, Development

**OPENAI_API_KEY** (Optional - if using OpenAI features)
- **Name:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key
- **Environment:** Production, Preview, Development

---

## 🔍 How to Verify in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select project: `wasatchwise`

2. **Open Environment Variables**
   - Go to: **Settings** → **Environment Variables**

3. **Check Each Variable**
   - Verify name is **exactly** as listed above (case-sensitive!)
   - Check that value is set
   - Verify environment scope (Production, Preview, Development)

4. **Common Mistakes:**
   - ❌ `ANTHROPIC` (missing `_API_KEY`)
   - ✅ `ANTHROPIC_API_KEY` (correct)
   - ❌ `ANTHROPIC_API` (missing `_KEY`)
   - ✅ `ANTHROPIC_API_KEY` (correct)

---

## 🚨 Critical Variables for Launch

**Must Have:**
- ✅ `ANTHROPIC_API_KEY` - For WiseBot to work
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - For database
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For database
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - For server operations
- ✅ `RESEND_API_KEY` - For email

**Nice to Have:**
- ⚠️ `HEYGEN_API_KEY` - For video features
- ⚠️ `ELEVENLABS_API_KEY` - For voice features

---

## ✅ Verification Checklist

- [ ] `ANTHROPIC_API_KEY` is set (note: includes `_API`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] `RESEND_API_KEY` is set
- [ ] All variables are available for Production environment
- [ ] Variable names match exactly (case-sensitive)
- [ ] No typos in variable names

---

## 🔧 Quick Fix Guide

**If WiseBot is not working:**
1. Check `ANTHROPIC_API_KEY` is set (not `ANTHROPIC`)
2. Verify it's available for Production
3. Check the value starts with `sk-ant-...`
4. Redeploy after adding/updating

**If database errors:**
1. Check all three Supabase variables are set
2. Verify URLs and keys are correct
3. Check service role key is not the anon key

**If email not working:**
1. Check `RESEND_API_KEY` is set
2. Verify it's available for Production
3. Check Resend dashboard for API key status

---

**Last Updated:** January 22, 2026
