-- 20250108_base_stubs.sql
create extension if not exists pgcrypto;

-- Minimal athlete table (stub)
create table if not exists public.athlete (
  athlete_id uuid primary key default gen_random_uuid()
);
comment on table public.athlete is 'Stub table: extend later via ALTER TABLE';

-- Minimal plan table (stub)
create table if not exists public.plan (
  plan_id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athlete(athlete_id) on delete cascade,
  version integer not null default 1,
  status text not null default 'active' check (status in ('active','archived','draft')),
  start_date date,
  end_date date
);
comment on table public.plan is 'Stub table: extend later via ALTER TABLE';

-- Enable RLS (owner-only)
alter table public.athlete enable row level security;
alter table public.plan enable row level security;

drop policy if exists "athlete_owner" on public.athlete;
create policy "athlete_owner" on public.athlete
  using (auth.uid()::text = athlete_id::text)
  with check (auth.uid()::text = athlete_id::text);

drop policy if exists "plan_owner" on public.plan;
create policy "plan_owner" on public.plan
  using (auth.uid()::text = athlete_id::text)
  with check (auth.uid()::text = athlete_id::text);
