alter table if exists public.musicians
  add column if not exists seeking_band boolean default false;

alter table if exists public.musicians
  add column if not exists available_for_lessons boolean default false;
