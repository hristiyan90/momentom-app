# B2 Database Migration Instructions

## Manual Migration via Supabase Dashboard

Since the automated migration has issues, please run this SQL manually in the Supabase SQL Editor:

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `xgegukbclypvohdrwufa`
3. Go to SQL Editor

### Step 2: Run the Migration SQL

Copy and paste this SQL into the SQL Editor and execute:

```sql
-- B2 Manual Workout Upload Phase 1: Database schema
-- Creates ingest_staging table and sessions table with RLS policies

-- SESSIONS TABLE (referenced in spec but missing)
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

-- INDEXES
create index if not exists sessions_athlete_date_idx on public.sessions (athlete_id, date desc);
create index if not exists sessions_athlete_sport_idx on public.sessions (athlete_id, sport);
create index if not exists sessions_source_ingest_idx on public.sessions (source_ingest_id) where source_ingest_id is not null;
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
```

### Step 3: Verify Tables Created

After running the SQL, verify the tables exist by running this query:

```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sessions', 'ingest_staging')
ORDER BY table_name;
```

### Step 4: Test RLS Policies

Test that RLS is working by running:

```sql
-- This should show the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('sessions', 'ingest_staging');
```

## Next Steps

Once the migration is complete:
1. The API routes will be able to connect to real database tables
2. We can remove the mock responses and implement real functionality
3. Phase 4 (UI components) can proceed with working backend

## Storage Bucket

The `workout-uploads` storage bucket was already created in the previous step, so that's ready to go.
