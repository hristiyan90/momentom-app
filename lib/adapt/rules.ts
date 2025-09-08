import type { DiffChange, Readiness, Session, LoadPoint } from '@/lib/adapt/schema';

export function computeImpactWindow(date: string, scope: 'today' | 'next_72h' | 'week', tz?: string) {
  const d0 = new Date(`${date}T00:00:00${tz ? '' : 'Z'}`);
  if (scope === 'today') return { startISO: d0.toISOString(), endISO: new Date(d0.getTime() + 24 * 3600 * 1000 - 1).toISOString() };
  if (scope === 'next_72h') return { startISO: d0.toISOString(), endISO: new Date(d0.getTime() + 72 * 3600 * 1000).toISOString() };
  const dow = d0.getUTCDay(); 
  const delta = (dow === 0 ? -6 : 1 - dow);
  const mon = new Date(d0); 
  mon.setUTCDate(d0.getUTCDate() + delta);
  const sun = new Date(mon); 
  sun.setUTCDate(mon.getUTCDate() + 7);
  return { startISO: mon.toISOString(), endISO: sun.toISOString() };
}

type PreviewInput = {
  athleteId: string; 
  date: string; 
  scope: 'today' | 'next_72h' | 'week';
  plan: { 
    plan_id: string; 
    version: number; 
    blocks?: { phase: 'base' | 'build' | 'peak' | 'taper'; start_date: string; end_date: string }[] 
  };
  sessions: Session[]; 
  readiness?: Readiness; 
  load: LoadPoint[];
  blockers: { start: string; end: string; type: string; plan_impact: string }[]; 
  races: { date: string; priority: 'A' | 'B' | 'C' }[];
};

type PreviewOutput = {
  reason_code: 'low_readiness' | 'missed_session' | 'monotony_high' | 'ramp_high' | 'illness';
  triggers: string[]; 
  changes: DiffChange[]; 
  rationale_text: string;
  driver_attribution?: Readiness['drivers']; 
  data_snapshot?: Record<string, unknown>;
};

type PlanSummary = {
  plan_id: string;
  version: number;
  blocks?: { phase: 'base' | 'build' | 'peak' | 'taper'; start_date: string; end_date: string }[];
};

type VolumeGuardResult = {
  clampedChanges: DiffChange[];
  metrics: {
    clamped: boolean;
    before_min: number;
    after_min: number;
    delta_pct: number;
    in_taper: boolean;
  };
  violates: boolean;
};

/**
 * Compute the weekly volume for a set of sessions
 */
function computeWeeklyVolume(sessions: Session[]): number {
  return sessions
    .filter(s => s.status === 'planned')
    .reduce((total, session) => total + session.planned_duration_min, 0);
}

/**
 * Apply a set of changes to sessions and return the modified sessions
 */
function applyChangesToSessions(sessions: Session[], changes: DiffChange[]): Session[] {
  const modifiedSessions = sessions.map(s => ({ ...s })); // Deep copy
  
  for (const change of changes) {
    // Parse path like "/sessions/ses_001/planned_duration_min"
    const pathMatch = change.path.match(/^\/sessions\/([^\/]+)\/(.+)$/);
    if (!pathMatch) continue;
    
    const [, sessionId, field] = pathMatch;
    const sessionIndex = modifiedSessions.findIndex(s => s.session_id === sessionId);
    if (sessionIndex === -1) continue;
    
    if (change.op === 'replace') {
      (modifiedSessions[sessionIndex] as any)[field] = change.to;
    }
    // Note: We maintain "no deletes" invariant - only replace operations
  }
  
  return modifiedSessions;
}

/**
 * Apply weekly volume guard with comprehensive metrics
 */
function applyWeeklyVolumeGuardInternal(
  sessions: Session[], 
  changes: DiffChange[], 
  inTaper: boolean
): VolumeGuardResult {
  const originalVolume = computeWeeklyVolume(sessions);
  const modifiedSessions = applyChangesToSessions(sessions, changes);
  const newVolume = computeWeeklyVolume(modifiedSessions);
  
  const delta = newVolume - originalVolume;
  const deltaPercent = originalVolume > 0 ? (delta / originalVolume) * 100 : 0;
  
  // Check if changes would violate the ±20% limit
  const violates = Math.abs(deltaPercent) > 20 && !(inTaper && delta >= 0);
  
  // If within ±20% or in taper (no increases), return original changes
  if (!violates) {
    return {
      clampedChanges: changes,
      metrics: {
        clamped: false,
        before_min: originalVolume,
        after_min: newVolume,
        delta_pct: Math.round(deltaPercent * 100) / 100,
        in_taper: inTaper
      },
      violates: false
    };
  }
  
  // Calculate scaling factor to bring delta to exactly 20% (or -20%)
  const targetDelta = originalVolume * (deltaPercent > 0 ? 0.20 : -0.20);
  const scalingFactor = targetDelta / delta;
  
  // Apply scaling only to duration changes, and only scale down (never up)
  const scaledChanges: DiffChange[] = [];
  
  for (const change of changes) {
    if (change.path.includes('/planned_duration_min') && change.op === 'replace') {
      const originalDuration = change.from as number;
      const proposedDuration = change.to as number;
      const durationDelta = proposedDuration - originalDuration;
      
      let scaledDuration: number;
      if (durationDelta > 0) {
        // For increases, scale down the increase
        const scaledIncrease = Math.max(0, durationDelta * Math.min(scalingFactor, 1.0));
        scaledDuration = Math.round(originalDuration + scaledIncrease);
      } else {
        // For decreases, scale down the decrease (make it less severe)
        const scaledDecrease = durationDelta * Math.min(Math.abs(scalingFactor), 1.0);
        scaledDuration = Math.round(originalDuration + scaledDecrease);
      }
      
      // Ensure we don't go below 30 minutes minimum
      scaledDuration = Math.max(30, scaledDuration);
      
      scaledChanges.push({
        ...change,
        to: scaledDuration
      });
    } else {
      // Non-duration changes pass through unchanged
      scaledChanges.push(change);
    }
  }
  
  // Calculate final volume after clamping
  const clampedSessions = applyChangesToSessions(sessions, scaledChanges);
  const clampedVolume = computeWeeklyVolume(clampedSessions);
  const clampedDeltaPercent = originalVolume > 0 ? ((clampedVolume - originalVolume) / originalVolume) * 100 : 0;
  
  return {
    clampedChanges: scaledChanges,
    metrics: {
      clamped: true,
      before_min: originalVolume,
      after_min: clampedVolume,
      delta_pct: Math.round(clampedDeltaPercent * 100) / 100,
      in_taper: inTaper
    },
    violates: true
  };
}

/**
 * Public API for decision route: Apply weekly volume guard with comprehensive metrics
 */
export function applyWeeklyVolumeGuard(input: {
  sessions: Session[];
  changes: DiffChange[];
  plan: PlanSummary;
  date?: string; // Optional, used for taper detection
}): VolumeGuardResult {
  const inTaper = input.date ? 
    input.plan.blocks?.some(b => 
      b.phase === 'taper' && 
      b.start_date <= input.date! && 
      input.date! <= b.end_date
    ) ?? false : false;
    
  return applyWeeklyVolumeGuardInternal(input.sessions, input.changes, inTaper);
}

export function ruleEngineDeterministic(input: PreviewInput, seed: string): PreviewOutput {
  const drivers = input.readiness?.drivers ?? [];
  const flags = input.readiness?.flags ?? [];
  const monotony = Math.max(...(input.load.map(l => l.monotony ?? 0)), 0);
  const ramp = Math.max(...(input.load.map(l => l.ramp_rate_pct ?? 0)), 0);
  const lowReadiness = (input.readiness?.band === 'red') || (input.readiness?.band === 'amber' && drivers.some(d => d.key === 'hrv' && d.z <= -0.8));
  const monotonyHigh = monotony >= 2.0 || flags.includes('monotony_high');
  const rampHigh = ramp >= 10 || flags.includes('ramp_high');
  const missed = input.sessions.filter(s => s.status === 'missed');

  let reason: PreviewOutput['reason_code'] | null = null; 
  const triggers: string[] = [];
  if (missed.length) { 
    reason = 'missed_session'; 
    triggers.push('missed_session'); 
  }
  if (!reason && lowReadiness) { 
    reason = 'low_readiness'; 
    triggers.push('low_readiness'); 
  }
  if (!reason && monotonyHigh) { 
    reason = 'monotony_high'; 
    triggers.push('monotony_high'); 
  }
  if (!reason && rampHigh) { 
    reason = 'ramp_high'; 
    triggers.push('ramp_high'); 
  }

  const inTaper = input.plan.blocks?.some(b => b.phase === 'taper' && b.start_date <= input.date && input.date <= b.end_date) ?? false;

  const rawChanges: DiffChange[] = []; 
  const snapshot: Record<string, unknown> = {};
  
  if (reason === 'low_readiness') {
    const keyToday = input.sessions.find(s => s.priority === 'key' || s.planned_zone_primary === 'z4' || s.planned_zone_primary === 'z5');
    if (keyToday) {
      rawChanges.push({ op: 'replace', path: `/sessions/${keyToday.session_id}/planned_zone_primary`, from: keyToday.planned_zone_primary, to: 'z3' });
      const trimmed = Math.round(keyToday.planned_duration_min * (inTaper ? 0.90 : 0.80));
      rawChanges.push({ op: 'replace', path: `/sessions/${keyToday.session_id}/planned_duration_min`, from: keyToday.planned_duration_min, to: trimmed });
      snapshot.hrv_z = (drivers.find(d => d.key === 'hrv')?.z ?? null);
    }
  } else if (reason === 'missed_session') {
    const s = missed[0]; 
    const toDate = input.date;
    rawChanges.push({ op: 'replace', path: `/sessions/${s.session_id}/date`, from: s.date, to: toDate });
    const trimmed = Math.round(s.planned_duration_min * 0.85);
    rawChanges.push({ op: 'replace', path: `/sessions/${s.session_id}/planned_duration_min`, from: s.planned_duration_min, to: trimmed });
  } else if (reason === 'monotony_high') {
    const sorted = input.sessions.filter(s => s.status === 'planned').sort((a, b) => b.planned_duration_min - a.planned_duration_min);
    if (sorted.length >= 2) {
      const big = sorted[0], small = sorted[sorted.length - 1];
      const bigTo = Math.max(30, Math.round(big.planned_duration_min * 0.90));
      const smallTo = Math.round(small.planned_duration_min * (inTaper ? 1.00 : 1.05));
      rawChanges.push({ op: 'replace', path: `/sessions/${big.session_id}/planned_duration_min`, from: big.planned_duration_min, to: bigTo });
      if (!inTaper) rawChanges.push({ op: 'replace', path: `/sessions/${small.session_id}/planned_duration_min`, from: small.planned_duration_min, to: smallTo });
      snapshot.monotony = monotony;
    }
  } else if (reason === 'ramp_high') {
    const key = input.sessions.find(s => s.priority === 'key');
    if (key) {
      const to = Math.round(key.planned_duration_min * (inTaper ? 0.95 : 0.90));
      rawChanges.push({ op: 'replace', path: `/sessions/${key.session_id}/planned_duration_min`, from: key.planned_duration_min, to });
      snapshot.ramp = ramp;
    }
  }

  // Apply weekly volume guard to constrain changes within ±20%
  const guardResult = applyWeeklyVolumeGuardInternal(input.sessions, rawChanges, inTaper);
  const changes = guardResult.clampedChanges;
  
  // Add volume guard metrics to snapshot
  snapshot.volume_guard = {
    original_volume: guardResult.metrics.before_min,
    new_volume: guardResult.metrics.after_min,
    delta_minutes: guardResult.metrics.after_min - guardResult.metrics.before_min,
    delta_percent: guardResult.metrics.delta_pct,
    clamped: guardResult.metrics.clamped,
    in_taper: guardResult.metrics.in_taper
  };

  const rationale =
    reason === 'low_readiness' ? 'Low readiness drivers detected; reducing intensity to Z3 and trimming duration.' :
    reason === 'missed_session' ? 'Missed session; rescheduling within window and trimming by ~15%.' :
    reason === 'monotony_high' ? 'High monotony; redistributing load to smooth daily variation.' :
    reason === 'ramp_high' ? 'High ramp rate; reducing key session duration to moderate weekly increase.' :
    'General adjustment.';

  return { 
    reason_code: reason ?? 'low_readiness', 
    triggers, 
    changes, 
    rationale_text: rationale, 
    driver_attribution: input.readiness?.drivers ?? [], 
    data_snapshot: snapshot 
  };
}

// Export helper functions for testing and external use
export { computeWeeklyVolume, applyChangesToSessions };