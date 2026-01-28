-- Claim support for musician profiles
alter table if exists public.musicians
  add column if not exists claimed_by uuid references auth.users(id) on delete set null;

alter table if exists public.musicians
  add column if not exists claimed_at timestamptz;

create index if not exists musicians_claimed_by_idx on public.musicians(claimed_by);

comment on column public.musicians.claimed_by is 'User who has claimed/owns this musician profile';
