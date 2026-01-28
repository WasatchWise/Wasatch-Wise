-- Fix user_tripkit_progress table to support upsert
-- The client uses onConflict: 'access_code_id,tripkit_id', so we need a unique constraint there.
-- 1. Ensure table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.user_tripkit_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_code_id UUID NOT NULL,
    tripkit_id UUID NOT NULL,
    customer_email TEXT,
    destinations_visited TEXT [],
    destinations_wishlist TEXT [],
    destination_notes JSONB,
    trip_name TEXT,
    trip_notes TEXT,
    completion_percentage INTEGER,
    last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Add unique constraint for upsert (this fixes the 400 error)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_tripkit_progress_access_code_id_tripkit_id_key'
) THEN
ALTER TABLE public.user_tripkit_progress
ADD CONSTRAINT user_tripkit_progress_access_code_id_tripkit_id_key UNIQUE (access_code_id, tripkit_id);
END IF;
END $$;
-- 3. Enable RLS
ALTER TABLE public.user_tripkit_progress ENABLE ROW LEVEL SECURITY;
-- 4. Add policy for authenticated users (since the page is protected)
DROP POLICY IF EXISTS "Allow authenticated users to manage progress" ON public.user_tripkit_progress;
CREATE POLICY "Allow authenticated users to manage progress" ON public.user_tripkit_progress FOR ALL TO authenticated USING (true) WITH CHECK (true);