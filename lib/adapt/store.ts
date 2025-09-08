import type { Session, Readiness, LoadPoint, Adaptation, DiffChange } from '@/lib/adapt/schema';
import { createSupabaseAdmin } from '@/lib/supabase/server';

// Standardized error for missing readiness data
export class MissingReadinessError extends Error {
  code = 'MISSING_READINESS';
  retryAfterSec = 300; // 5 minutes
  constructor(msg = 'Readiness data not available') { 
    super(msg); 
  }
}

// Mock data for development
export async function fetchPlanSummary(athleteId: string): Promise<{ plan_id: string; version: number; blocks: Array<{ phase: string; start_date: string; end_date: string }> }> {
  console.log('📊 Fetching plan summary...');
  
  // Return mock plan data with proper UUID
  const plan = {
    plan_id: '00000000-0000-0000-0000-000000000abc',
    version: 12,
    blocks: [
      {
        phase: 'build',
        start_date: '2025-09-01',
        end_date: '2025-09-08'
      }
    ]
  };
  
  console.log('📋 Plan:', plan);
  return plan;
}

export async function fetchSessionsInWindow(athleteId: string, startISO: string, endISO: string): Promise<Session[]> {
  console.log('📅 Fetching sessions in window:', { startISO, endISO });
  
  // Return mock session data with proper schema
  return [
    {
      session_id: 'ses_001',
      date: '2025-09-06',
      sport: 'run',
      title: 'Easy Run',
      planned_duration_min: 60,
      planned_load: 45,
      planned_zone_primary: 'z2',
      status: 'planned',
      priority: 'key'
    },
    {
      session_id: 'ses_002',
      date: '2025-09-07',
      sport: 'bike',
      title: 'Bike Ride',
      planned_duration_min: 90,
      planned_load: 60,
      planned_zone_primary: 'z3',
      status: 'planned',
      priority: 'supporting'
    }
  ];
}

export async function fetchReadiness(athleteId: string, date: string): Promise<Readiness | null> {
  console.log('📊 Fetching readiness for date:', date);
  
  // Simulate missing readiness for specific dates
  if (date === '2025-09-07') {
    console.log('🚫 Simulating missing readiness for 2025-09-07');
    throw new MissingReadinessError('Readiness data not available for 2025-09-07');
  }
  
  // Return mock readiness data
  const readiness: Readiness = {
    date,
    overall: 7,
    sleep: 8,
    stress: 6,
    fatigue: 7,
    motivation: 8,
    notes: 'Feeling good today'
  };
  
  console.log('✅ Readiness fetched successfully');
  return readiness;
}

export async function fetchDailyLoadWindow(athleteId: string, startISO: string, endISO: string): Promise<LoadPoint[]> {
  console.log('📈 Fetching load data in window:', { startISO, endISO });
  
  // Return mock load data
  return [
    {
      date: '2025-09-06',
      load: 45,
      duration_min: 60,
      intensity: 'moderate'
    }
  ];
}

export async function fetchBlockers(athleteId: string, startISO: string, endISO: string): Promise<any[]> {
  console.log('🚫 Fetching blockers in window:', { startISO, endISO });
  
  // Return empty blockers for now
  return [];
}

// Helper function to convert database row to Adaptation object
function dbRowToAdaptation(row: any): Adaptation {
  return {
    adaptation_id: row.adaptation_id,
    plan_id: row.plan_id,
    scope: row.scope,
    impact_window: { start: row.impact_start, end: row.impact_end },
    reason_code: row.reason_code,
    triggers: row.triggers ?? [],
    changes: row.changes_json ?? [],
    decision: 'proposed',
    plan_version_before: row.plan_version_before,
    plan_version_after: null,
    rationale: {
      text: row.rationale_text,
      driver_attribution: row.driver_attribution ?? [],
      data_snapshot: row.data_snapshot ?? {}
    }
  };
}

// Helper function to convert Adaptation object to database row
function adaptationToDbRow(adaptation: Adaptation, additionalFields: any = {}) {
  return {
    adaptation_id: adaptation.adaptation_id,
    athlete_id: adaptation.athlete_id,
    plan_id: adaptation.plan_id,
    scope: adaptation.scope,
    impact_start: adaptation.impact_start,
    impact_end: adaptation.impact_end,
    reason_code: adaptation.reason_code,
    triggers: adaptation.triggers,
    changes_json: adaptation.changes,
    plan_version_before: adaptation.plan_version_before,
    rationale_text: adaptation.rationale.text,
    driver_attribution: adaptation.rationale.driver_attribution,
    data_snapshot: adaptation.rationale.data_snapshot,
    explainability_id: adaptation.explainability_id,
    ...additionalFields
  };
}

export async function getCachedPreviewOrNull(athleteId: string, checksum: string): Promise<Adaptation | null> {
  const supabase = createSupabaseAdmin();
  
  console.log('🔍 Looking up cached preview:', { athleteId, checksum });
  
  const { data, error } = await supabase
    .from('adaptation_preview_cache')
    .select('*')
    .eq('athlete_id', athleteId)
    .eq('checksum', checksum)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  if (error) {
    // PGRST116 = no rows found, which is expected
    if (error.code === 'PGRST116') {
      console.log('📝 No cached preview found');
      return null;
    }
    console.error('❌ Cache lookup error:', error);
    return null;
  }

  if (!data) {
    console.log('📝 No cached preview data');
    return null;
  }

  console.log('✅ Found cached preview:', data.adaptation_id);
  return dbRowToAdaptation(data);
}

export type IdempotencyCacheResult = {
  adaptation: Adaptation;
  isReplay: boolean;
  idempotencyKey?: string;
};

// Helper function to validate UUID format
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function getCachedPreviewWithIdempotency(
  athleteId: string, 
  checksum: string, 
  idempotencyKey?: string
): Promise<IdempotencyCacheResult | null> {
  const supabase = createSupabaseAdmin();
  
  console.log('🔍 Looking up cached preview with idempotency:', { athleteId, checksum, idempotencyKey });
  
  // If idempotency key is provided and is a valid UUID, look for exact match first
  if (idempotencyKey && isValidUUID(idempotencyKey)) {
    const { data: idempotentData, error: idempotentError } = await supabase
      .from('adaptation_preview_cache')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('idempotency_key', idempotencyKey)
      .eq('checksum', checksum)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single();

    if (!idempotentError && idempotentData) {
      console.log('✅ Found idempotent replay:', idempotentData.adaptation_id);
      return {
        adaptation: dbRowToAdaptation(idempotentData),
        isReplay: true,
        idempotencyKey
      };
    }
    
    if (idempotentError && idempotentError.code !== 'PGRST116') {
      console.error('❌ Idempotent cache lookup error:', idempotentError);
    }
  } else if (idempotencyKey) {
    console.log('⚠️ Idempotency key provided but not a valid UUID, using checksum-only lookup');
  }
  
  // Fall back to regular checksum-based cache lookup
  const regularResult = await getCachedPreviewOrNull(athleteId, checksum);
  if (regularResult) {
    console.log('✅ Found regular cached preview (not idempotent replay)');
    return {
      adaptation: regularResult,
      isReplay: false,
      idempotencyKey
    };
  }
  
  return null;
}

export async function getPreviewById(athleteId: string, adaptationId: string): Promise<Adaptation | null> {
  const supabase = createSupabaseAdmin();
  
  console.log('🔍 Looking up preview by ID:', { athleteId, adaptationId });
  
  const { data, error } = await supabase
    .from('adaptation_preview_cache')
    .select('*')
    .eq('athlete_id', athleteId)
    .eq('adaptation_id', adaptationId)
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('📝 No preview found for ID:', adaptationId);
      return null;
    }
    console.error('❌ Preview lookup error:', error);
    return null;
  }

  if (!data) {
    console.log('📝 No preview data for ID:', adaptationId);
    return null;
  }

  console.log('✅ Found preview by ID:', data.adaptation_id);
  return dbRowToAdaptation(data);
}

export async function putPreviewCache(row: { 
  athlete_id: string; 
  plan_id: string; 
  scope: 'today' | 'next_72h' | 'week'; 
  impact_start: string; 
  impact_end: string; 
  reason_code: any; 
  triggers: string[]; 
  changes_json: DiffChange[]; 
  plan_version_before: number; 
  rationale_text: string; 
  driver_attribution?: any; 
  data_snapshot?: Record<string, unknown>; 
  checksum: string; 
  idempotency_key?: string; 
  explainability_id: string; 
  expires_at: string; 
}): Promise<Adaptation> {
  const supabase = createSupabaseAdmin();
  
  // Ensure proper null handling for optional fields
  const dbRow = {
    athlete_id: row.athlete_id,
    plan_id: row.plan_id,
    scope: row.scope,
    impact_start: row.impact_start,
    impact_end: row.impact_end,
    reason_code: row.reason_code,
    triggers: row.triggers,
    changes_json: row.changes_json,
    plan_version_before: row.plan_version_before,
    rationale_text: row.rationale_text,
    driver_attribution: row.driver_attribution || null,
    data_snapshot: row.data_snapshot || null,
    checksum: row.checksum,
    idempotency_key: (row.idempotency_key && isValidUUID(row.idempotency_key)) ? row.idempotency_key : null,
    explainability_id: row.explainability_id,
    expires_at: row.expires_at
  };

  console.log('💾 Inserting adaptation preview:', { 
    athlete_id: dbRow.athlete_id, 
    checksum: dbRow.checksum,
    scope: dbRow.scope,
    reason_code: dbRow.reason_code
  });

  const { data, error } = await supabase
    .from('adaptation_preview_cache')
    .insert(dbRow)
    .select('*')
    .single();

  if (error) {
    console.error('❌ Supabase insert error:', error);
    throw new Error(`Failed to insert adaptation preview: ${error.message}`);
  }

  if (!data) {
    console.error('❌ No data returned from adaptation preview insert');
    throw new Error('No data returned from adaptation preview insert');
  }

  console.log('✅ Successfully inserted adaptation:', data.adaptation_id);
  return dbRowToAdaptation(data);
}

export async function writeDecision(input: {
  adaptation_id: string;
  athlete_id: string;
  plan_id: string;
  decision: 'accepted' | 'modified' | 'rejected';
  final_changes: DiffChange[];
  plan_version_before: number;
  rationale_text: string;
  driver_attribution: any[];
  explainability_id: string;
}): Promise<{ plan_version_after: number | null }> {
  const supabase = createSupabaseAdmin();
  
  console.log('💾 Writing decision:', { 
    adaptation_id: input.adaptation_id, 
    decision: input.decision 
  });

  const { data, error } = await supabase
    .from('adaptation_decision')
    .insert({
      adaptation_id: input.adaptation_id,
      athlete_id: input.athlete_id,
      plan_id: input.plan_id,
      decision: input.decision,
      changes_json: input.final_changes,
      plan_version_before: input.plan_version_before,
      plan_version_after: input.decision === 'rejected' ? null : input.plan_version_before + 1,
      rationale_text: input.rationale_text,
      driver_attribution: input.driver_attribution,
      explainability_id: input.explainability_id
    })
    .select('*')
    .single();

  if (error) {
    console.error('❌ Decision write error:', error);
    throw new Error(`Failed to write decision: ${error.message}`);
  }

  console.log('✅ Decision written successfully:', data.id);
  
  return { plan_version_after: data.plan_version_after };
}

export async function bumpPlanVersion(planId: string): Promise<number> {
  const supabase = createSupabaseAdmin();
  
  console.log('📈 Bumping plan version:', planId);
  
  // First get the current version
  const { data: currentData, error: fetchError } = await supabase
    .from('plan')
    .select('version')
    .eq('plan_id', planId)
    .single();

  if (fetchError) {
    console.error('❌ Plan fetch error:', fetchError);
    throw new Error(`Failed to fetch plan: ${fetchError.message}`);
  }

  if (!currentData) {
    console.error('❌ No plan found');
    throw new Error('No plan found');
  }

  const newVersion = currentData.version + 1;

  // Update to the new version
  const { data, error } = await supabase
    .from('plan')
    .update({ version: newVersion })
    .eq('plan_id', planId)
    .select('version')
    .single();

  if (error) {
    console.error('❌ Plan version bump error:', error);
    throw new Error(`Failed to bump plan version: ${error.message}`);
  }

  if (!data) {
    console.error('❌ No data returned from plan version bump');
    throw new Error('No data returned from plan version bump');
  }

  console.log('✅ Plan version bumped to:', data.version);
  return data.version;
}