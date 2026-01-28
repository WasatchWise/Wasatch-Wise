# Claude Code Email System Exploration

## Context
It's Tuesday (email day) and we need to ensure emails are sent as **rich branded HTML** (with Groove logo, signature, Google reviews badge), not generic plain text with `<br>` tags.

---

## ✅ FIXED - January 27, 2026

The `dispatch-emails.ts` script has been updated to generate **rich branded HTML emails** at send time.

**Changes made:**
- Added `buildBrandedHtmlEmail()` function with full Groove branding
- Emails now include: Groove logo header, brand colors, CTA button, signature block, Google reviews badge (4.9 ⭐ / 920+ reviews)
- Plain text version is still sent as fallback for email clients that don't support HTML

**To send emails:**
```bash
cd apps/pipeline-iq
npx tsx scripts/dispatch-emails.ts
```

---

## DIAGNOSIS (For Reference)

### Root Cause Identified
There are **TWO different email generators** and the wrong one is being used:

| Generator | Location | Output | Used By |
|-----------|----------|--------|---------|
| Simple (BAD) | `lib/utils/email-generator.ts` | `{ subject, body }` plain text only | `scripts/backfill-queue.ts` |
| Rich (GOOD) | `lib/workflows/warm-call/nepq-email-generator.ts` | `{ subject, body, html, ... }` with branded HTML | Not connected to queue! |

### The Pipeline Break
```
backfill-queue.ts 
    → uses SIMPLE generator 
    → stores only `email_body` (plain text)
    → outreach_queue table (no HTML column!)

dispatch-emails.ts
    → reads `email_body` from queue
    → does `finalBody.replace(/\n/g, '<br>')` ← UGLY!
    → sends via SendGrid
```

### What's Missing
1. `outreach_queue` table has NO `email_html` column (only `email_body` text)
2. `backfill-queue.ts` uses the wrong generator
3. `dispatch-emails.ts` doesn't generate HTML at send time

---

## YOUR TASK: Fix the Email Pipeline

### Option A: Generate HTML at Dispatch Time (Recommended)
Modify `scripts/dispatch-emails.ts` to:
1. Import `wrapEmailInHtml` from `lib/groove/email-html.ts`
2. Replace the simple `<br>` conversion with the branded HTML wrapper
3. Use Mike's signature from org config

### Option B: Store HTML in Queue (More Complex)
1. Add migration: `ALTER TABLE outreach_queue ADD COLUMN email_html TEXT;`
2. Update `backfill-queue.ts` to use the rich generator
3. Update `dispatch-emails.ts` to use `email_html` if present

### Option C: Hybrid (Best Long-Term)
1. Add `email_html` column to queue
2. Update backfill to generate and store rich HTML
3. Update dispatch to use stored HTML, with fallback to generated

---

## Files to Modify

### Primary Fix (dispatch-emails.ts)
```typescript
// Add import at top
import { wrapEmailInHtml } from '../lib/groove/email-html'

// Replace line ~160:
// OLD: html: finalBody.replace(/\n/g, '<br>'),
// NEW:
const richHtml = wrapEmailInHtml(finalBody, {
    name: 'Mike Sartain',
    title: 'Business Development',
    company: 'Groove Technologies',
    phone: '(801) 682-3100',
    email: 'msartain@getgrooven.com',
    website: 'getgrooven.com'
})

// Then in sendEmailWithSendGrid call:
html: richHtml,
```

### Secondary: Update backfill-queue.ts
Switch from simple generator to rich generator:
```typescript
// OLD:
import { generateNEPQEmail } from '../lib/utils/email-generator'

// NEW:
import { generateNEPQEmail } from '../lib/workflows/warm-call/nepq-email-generator'
```

---

## Key Files Reference

### Email Generation
- `lib/utils/email-generator.ts` - Simple generator (plain text only) ❌
- `lib/workflows/warm-call/nepq-email-generator.ts` - Rich generator with branded HTML ✅
- `lib/groove/email-html.ts` - HTML wrapper with logo/signature ✅

### Queue & Dispatch
- `scripts/backfill-queue.ts` - Populates queue (uses wrong generator)
- `scripts/dispatch-emails.ts` - Sends from queue (no HTML generation)
- `supabase/migrations/008_outreach_queue.sql` - Queue schema (no HTML column)

### Config
- `lib/config/organization.ts` - Has `GROOVE_CONFIG` with branding/signature

---

## Verification Steps

1. After fix, run email preview:
   ```bash
   cd apps/pipeline-iq
   npx tsx scripts/dispatch-emails.ts --dry-run
   ```

2. Or use the email preview page:
   - Start dev server: `npm run dev`
   - Visit: `http://localhost:3000/email-preview`

3. Check SendGrid dashboard for sent emails to verify HTML rendering

---

## Priority
**HIGH** - This is affecting production email quality. Emails are going out looking like plain text with `<br>` tags instead of professional branded HTML with Groove logo.

## Estimated Fix Time
- Option A (dispatch-time HTML): ~15 minutes
- Option B (queue storage): ~30 minutes
- Option C (hybrid): ~45 minutes
