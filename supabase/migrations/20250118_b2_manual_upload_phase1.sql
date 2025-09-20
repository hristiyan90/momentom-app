-- 20250118_b2_manual_upload_phase1.sql
-- B2 Manual Workout Upload Phase 1: Database schema only
-- Creates ingest_staging table and sessions table with RLS policies

create extension if not exists pgcrypto;

-- SESSIONS TABLE (referenced in spec but missing)
-- Based on the structure used in lib/data/reads.ts fixture data
create table if not exists public.sessions (
  session_id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athlete(athlete_id) on delete cascade,
  date date not null,
  sport text not null check (sport in ('run','bike','swim','strength','mobility')),
  title text not null,
  planned_duration_min integer,
  planned_load integer,
  planned_zone_primary text,
  status text not null default 'planned' check (status in ('planned','completed','skipped')),
  structure_json jsonb not null default '{"segments":[]}',
  -- Completed workout fields (from file upload)
  actual_duration_min integer,
  actual_distance_m integer,
  source_file_type text check (source_file_type in ('tcx','gpx','manual')),
  source_ingest_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sessions is 'Workout sessions - planned and completed';
comment on column public.sessions.structure_json is 'Planned workout structure with segments';
comment on column public.sessions.source_ingest_id is 'Links to ingest_staging for uploaded workouts';

create index if not exists sessions_athlete_date_idx on public.sessions (athlete_id, date desc);
create index if not exists sessions_athlete_sport_idx on public.sessions (athlete_id, sport);
create index if not exists sessions_source_ingest_idx on public.sessions (source_ingest_id) where source_ingest_id is not null;

-- INGEST STAGING TABLE (per spec contract)
create table if not exists public.ingest_staging (
  ingest_id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athlete(athlete_id) on delete cascade,
  filename text not null,
  file_type text not null check (file_type in ('tcx','gpx')),
  file_size bigint not null check (file_size > 0 and file_size <= 26214400), -- 25MB in bytes
  status text not null default 'received' check (status in ('received','parsed','normalized','error')),
  error_message text,
  session_id uuid references public.sessions(session_id) on delete set null,
  storage_path text, -- bucket path for raw file
  parsed_data jsonb, -- extracted workout data before normalization
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ingest_staging is 'File upload staging with processing status tracking';
comment on column public.ingest_staging.file_size is 'File size in bytes (max 25MB)';
comment on column public.ingest_staging.storage_path is 'Supabase storage path: workout-uploads/raw/<athlete_id>/<ingest_id>.<ext>';
comment on column public.ingest_staging.parsed_data is 'Raw parsed workout data before session normalization';

create index if not exists ingest_athlete_created_idx on public.ingest_staging (athlete_id, created_at desc);
create index if not exists ingest_status_idx on public.ingest_staging (status);
create index if not exists ingest_session_idx on public.ingest_staging (session_id) where session_id is not null;

-- RLS POLICIES
alter table public.sessions enable row level security;
alter table public.ingest_staging enable row level security;

-- Sessions RLS: athlete owns their sessions
drop policy if exists "sessions_owner" on public.sessions;
create policy "sessions_owner" on public.sessions
  using (auth.uid()::text = athlete_id::text)
  with check (auth.uid()::text = athlete_id::text);

-- Ingest staging RLS: athlete owns their ingest records
drop policy if exists "ingest_staging_owner" on public.ingest_staging;
create policy "ingest_staging_owner" on public.ingest_staging
  using (auth.uid()::text = athlete_id::text)
  with check (auth.uid()::text = athlete_id::text);

-- STORAGE BUCKET SETUP (commented for manual setup via Supabase dashboard)
-- Bucket: workout-uploads
-- Path structure: workout-uploads/raw/<athlete_id>/<ingest_id>.<ext>
-- Max file size: 25MB
-- Allowed MIME types: application/xml, application/gpx+xml
-- RLS: Server-only access initially (no public access)

/* Manual Supabase Storage Setup Required:
1. Create bucket 'workout-uploads' in Supabase Storage
2. Set max file size to 25MB
3. Add RLS policies:
   - INSERT: (storage.foldername(name))[1] = auth.uid()::text
   - SELECT: (storage.foldername(name))[1] = auth.uid()::text
   - UPDATE: false (immutable files)
   - DELETE: (storage.foldername(name))[1] = auth.uid()::text (for cleanup)
*/
