# Deploy Guardians Update to Production

## The Issue

The production site is showing a server-side error because:
1. ✓ Database has the guardians data
2. ✓ RLS policy is enabled
3. ✗ **Production build is outdated** - it doesn't have the new TypeScript types and component updates

## Solution: Redeploy to Vercel

### Option 1: Git Push (Recommended)

```bash
cd slctrips-v2

# Stage all changes
git add .

# Commit the guardians updates
git commit -m "Add Mt. Olympians (Guardians) - 29 county characters

- Created guardians table migration with all 29 guardians
- Updated TypeScript Guardian type with animal_type, archetype, abilities
- Enhanced GuardianCard to display animal type and archetype
- Added RLS policy for public read access
- Cross-referenced with official pantheon list"

# Push to trigger Vercel deployment
git push
```

This will automatically trigger a new deployment on Vercel.

### Option 2: Manual Redeploy on Vercel

1. Go to: https://vercel.com/dashboard
2. Find your **slctrips-v2** project
3. Click on the latest deployment
4. Click **"Redeploy"** button
5. Confirm the redeploy

### Option 3: Force Deploy from CLI

If you have Vercel CLI installed:

```bash
cd slctrips-v2
npx vercel --prod
```

## After Deployment

### 1. Wait for Build to Complete

Monitor the deployment at: https://vercel.com/dashboard

Build should take 2-5 minutes.

### 2. Verify the Site

Once deployed, visit: https://www.slctrips.com/guardians

You should see:
- ✓ "29 Mt. Olympians • X Destinations" in the header
- ✓ All 29 guardian cards displayed
- ✓ Each card shows: Name, County, Animal Type, Archetype, Bio

### 3. Test Filtering

- Try searching for "Dan" - should show Wasatch Sasquatch
- Try filtering by element (Air, Earth, Fire, Water)
- Try searching by county name

## What Was Changed

### Database Changes
- Added `animal_type`, `archetype`, `abilities` columns to guardians table
- Populated 29 guardians with complete data
- Added unique constraint on `county` column
- Enabled RLS with public read policy

### Code Changes
- `src/lib/types.ts` - Updated Guardian type
- `src/components/GuardianCard.tsx` - Enhanced to show animal_type & archetype
- Created migrations in `supabase/migrations/`

## Troubleshooting

### If the page still shows an error:

1. **Check Vercel Environment Variables**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Verify:
     - `NEXT_PUBLIC_SUPABASE_URL` = https://mkepcjzqnbowrgbvjfem.supabase.co
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)

2. **Clear Vercel Cache**:
   - In deployment settings, toggle "Clear Build Cache" and redeploy

3. **Check Build Logs**:
   - Go to the deployment in Vercel
   - Click on "Building" to see logs
   - Look for TypeScript errors or build failures

4. **Hard Refresh Browser**:
   - Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Try in an incognito window

### If guardians still don't show (but no error):

Run this SQL to verify RLS:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename = 'guardians';

-- Check policy exists
SELECT * FROM pg_policies WHERE tablename = 'guardians';
```

## Expected Result

After successful deployment, the guardians page should display all 29 Mt. Olympians beautifully formatted with their names, animal types, archetypes, and bios!
