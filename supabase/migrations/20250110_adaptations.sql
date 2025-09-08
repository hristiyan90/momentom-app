-- 20250110_adaptations.sql
-- Contract-accurate schema for Adaptations MVP (preview cache + decision audit)

create extension if not exists pgcrypto;

-- PREVIEW CACHE (idempotent 24h by checksum)
create table if not exists public.adaptation_preview_cache (
  adaptation_id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athlete(athlete_id) on delete cascade,
  plan_id uuid not null references public.plan(plan_id) on delete cascade,
  scope text not null check (scope in ('today','next_72h','week')),
  impact_start timestamptz not null,
  impact_end   timestamptz not null,
  reason_code text not null check (reason_code in ('low_readiness','missed_session','monotony_high','ramp_high','illness')),
  triggers jsonb not null,
  changes_json jsonb not null,               -- DiffChange[]
  plan_version_before integer not null,
  rationale_text text not null,
  driver_attribution jsonb null,             -- ReadinessDriver[]
  data_snapshot jsonb null,
  checksum text not null,                    -- deterministic hash of inputs
  idempotency_key uuid null,
  explainability_id text null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null            -- now()+24h
);

comment on table public.adaptation_preview_cache is '24h idempotent cache of adaptation previews';
comment on column public.adaptation_preview_cache.changes_json is 'Array of {op,path,from,to} diffs';

create index if not exists apc_athlete_created_idx on public.adaptation_preview_cache (athlete_id, created_at desc);
create index if not exists apc_checksum_idx on public.adaptation_preview_cache (athlete_id, checksum) include (adaptation_id, expires_at);
create index if not exists apc_plan_idx on public.adaptation_preview_cache (plan_id);

-- DECISIONS (authoritative write-back + versioning)
create table if not exists public.adaptation_decision (
  id uuid primary key default gen_random_uuid(),
  adaptation_id uuid not null,
  athlete_id uuid not null references public.athlete(athlete_id) on delete cascade,
  plan_id uuid not null references public.plan(plan_id) on delete cascade,
  decision text not null check (decision in ('accepted','modified','rejected')),
  changes_json jsonb not null,                -- final applied DiffChange[]
  plan_version_before integer not null,
  plan_version_after integer null,
  decided_at timestamptz not null default now(),
  rationale_text text not null,
  driver_attribution jsonb null,
  explainability_id text null
);

comment on table public.adaptation_decision is 'Audit of user decisions on adaptation previews';

create index if not exists ad_athlete_decided_idx on public.adaptation_decision (athlete_id, decided_at desc);
create index if not exists ad_plan_idx on public.adaptation_decision (plan_id);

-- RLS
alter table public.adaptation_preview_cache enable row level security;
alter table public.adaptation_decision enable row level security;

drop policy if exists "apc_owner" on public.adaptation_preview_cache;
create policy "apc_owner" on public.adaptation_preview_cache
  using (auth.uid()::text = athlete_id::text)
  with check (auth.uid()::text = athlete_id::text);

drop policy if exists "ad_owner" on public.adaptation_decision;
create policy "ad_owner" on public.adaptation_decision
  using (auth.uid()::text = athlete_id::text)
  with check (auth.uid()::text = athlete_id::text);
