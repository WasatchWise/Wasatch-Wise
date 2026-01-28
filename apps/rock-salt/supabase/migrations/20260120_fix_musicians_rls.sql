-- Fix Missing Column & RLS
-- Date: 2026-01-20
-- 1. Ensure columns exist (Fixes "column claimed_by does not exist")
alter table if exists public.musicians
add column if not exists claimed_by uuid references auth.users(id) on delete
set null;
alter table if exists public.musicians
add column if not exists claimed_at timestamptz;
-- 2. Enable RLS
alter table public.musicians enable row level security;
-- 3. READ: Allow public read access
drop policy if exists "Public read" on public.musicians;
create policy "Public read" on public.musicians for
select using (true);
-- 4. UPDATE: Allow users to update their own claimed profile
drop policy if exists "Users can update own musician profile" on public.musicians;
create policy "Users can update own musician profile" on public.musicians for
update using (auth.uid() = claimed_by);
-- 5. INSERT: Allow authenticated users to create new musician profiles
drop policy if exists "Authenticated users can create musician profiles" on public.musicians;
create policy "Authenticated users can create musician profiles" on public.musicians for
insert with check (auth.role() = 'authenticated');