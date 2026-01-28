alter table if exists public.musicians
  add column if not exists instruments text[] default '{}'::text[];

alter table if exists public.musicians
  add column if not exists disciplines text[] default '{}'::text[];
