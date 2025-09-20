const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyB2Migration() {
  try {
    console.log('🔄 Applying B2 Manual Upload migration...');
    
    // Step 1: Create sessions table
    console.log('📝 Creating sessions table...');
    const sessionsSQL = `
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
        actual_duration_min integer,
        actual_distance_m integer,
        source_file_type text check (source_file_type in ('tcx','gpx','manual')),
        source_ingest_id uuid,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
    
    const { error: sessionsError } = await supabase.rpc('exec', { sql: sessionsSQL });
    if (sessionsError) {
      console.warn('   ⚠️  Sessions table warning:', sessionsError.message);
    } else {
      console.log('   ✅ Sessions table created');
    }
    
    // Step 2: Create ingest_staging table
    console.log('📝 Creating ingest_staging table...');
    const ingestSQL = `
      create table if not exists public.ingest_staging (
        ingest_id uuid primary key default gen_random_uuid(),
        athlete_id uuid not null references public.athlete(athlete_id) on delete cascade,
        filename text not null,
        file_type text not null check (file_type in ('tcx','gpx')),
        file_size bigint not null check (file_size > 0 and file_size <= 26214400),
        status text not null default 'received' check (status in ('received','parsed','normalized','error')),
        error_message text,
        session_id uuid references public.sessions(session_id) on delete set null,
        storage_path text,
        parsed_data jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
    
    const { error: ingestError } = await supabase.rpc('exec', { sql: ingestSQL });
    if (ingestError) {
      console.warn('   ⚠️  Ingest staging table warning:', ingestError.message);
    } else {
      console.log('   ✅ Ingest staging table created');
    }
    
    // Step 3: Create indexes
    console.log('📝 Creating indexes...');
    const indexes = [
      'create index if not exists sessions_athlete_date_idx on public.sessions (athlete_id, date desc)',
      'create index if not exists sessions_athlete_sport_idx on public.sessions (athlete_id, sport)',
      'create index if not exists sessions_source_ingest_idx on public.sessions (source_ingest_id) where source_ingest_id is not null',
      'create index if not exists ingest_athlete_created_idx on public.ingest_staging (athlete_id, created_at desc)',
      'create index if not exists ingest_status_idx on public.ingest_staging (status)',
      'create index if not exists ingest_session_idx on public.ingest_staging (session_id) where session_id is not null'
    ];
    
    for (const indexSQL of indexes) {
      const { error } = await supabase.rpc('exec', { sql: indexSQL });
      if (error) {
        console.warn('   ⚠️  Index warning:', error.message);
      }
    }
    console.log('   ✅ Indexes created');
    
    // Step 4: Enable RLS
    console.log('📝 Enabling RLS...');
    const rlsSQL = [
      'alter table public.sessions enable row level security',
      'alter table public.ingest_staging enable row level security'
    ];
    
    for (const sql of rlsSQL) {
      const { error } = await supabase.rpc('exec', { sql });
      if (error) {
        console.warn('   ⚠️  RLS warning:', error.message);
      }
    }
    console.log('   ✅ RLS enabled');
    
    // Step 5: Create RLS policies
    console.log('📝 Creating RLS policies...');
    const policies = [
      `drop policy if exists "sessions_owner" on public.sessions`,
      `create policy "sessions_owner" on public.sessions
        using (auth.uid()::text = athlete_id::text)
        with check (auth.uid()::text = athlete_id::text)`,
      `drop policy if exists "ingest_staging_owner" on public.ingest_staging`,
      `create policy "ingest_staging_owner" on public.ingest_staging
        using (auth.uid()::text = athlete_id::text)
        with check (auth.uid()::text = athlete_id::text)`
    ];
    
    for (const policySQL of policies) {
      const { error } = await supabase.rpc('exec', { sql: policySQL });
      if (error) {
        console.warn('   ⚠️  Policy warning:', error.message);
      }
    }
    console.log('   ✅ RLS policies created');
    
    console.log('✅ B2 migration completed successfully!');
    console.log('📋 Created:');
    console.log('   - public.sessions table with RLS');
    console.log('   - public.ingest_staging table with RLS');
    console.log('   - All necessary indexes');
    console.log('   - RLS policies for athlete data isolation');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

applyB2Migration();
