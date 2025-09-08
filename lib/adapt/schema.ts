export type ReadinessDriver = { 
  key: 'hrv' | 'rhr' | 'sleep' | 'soreness' | 'mood' | 'prior_strain' | 'context'; 
  z: number; 
  weight: number; 
  contribution: number; 
};

export type Readiness = { 
  date: string; 
  score: number | null; 
  band: 'green' | 'amber' | 'red'; 
  drivers: ReadinessDriver[]; 
  flags?: string[]; 
  data_quality?: { missing?: string[]; clipped?: boolean }; 
};

export type LoadPoint = { 
  date: string; 
  day_load?: number; 
  ctl?: number; 
  atl?: number; 
  form?: number; 
  monotony?: number; 
  ramp_rate_pct?: number; 
};

export type Session = {
  session_id: string; 
  date: string; 
  sport: 'swim' | 'bike' | 'run' | 'strength' | 'mobility'; 
  title: string;
  planned_duration_min: number; 
  planned_load?: number; 
  planned_zone_primary?: 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | null;
  status: 'planned' | 'completed' | 'missed' | 'partial'; 
  priority?: 'key' | 'supporting' | 'recovery' | null;
  structure_json?: any; 
  fuel_adherence_pct?: number | null; 
  etag?: string;
};

export type DiffChange = { 
  op: 'add' | 'remove' | 'replace'; 
  path: string; 
  from?: any; 
  to?: any; 
};

export type Adaptation = {
  adaptation_id: string; 
  plan_id: string; 
  scope: 'today' | 'next_72h' | 'week';
  impact_window: { start: string; end: string }; 
  reason_code: 'low_readiness' | 'missed_session' | 'monotony_high' | 'ramp_high' | 'illness';
  triggers: string[]; 
  changes: DiffChange[]; 
  decision: 'proposed' | 'accepted' | 'modified' | 'rejected';
  plan_version_before: number; 
  plan_version_after: number | null;
  rationale: { 
    text: string; 
    driver_attribution: ReadinessDriver[]; 
    data_snapshot?: Record<string, unknown> 
  };
};
