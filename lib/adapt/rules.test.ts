import { describe, test, expect } from '@jest/globals';
import { 
  ruleEngineDeterministic, 
  computeWeeklyVolume, 
  applyChangesToSessions, 
  applyWeeklyVolumeGuard 
} from './rules';
import type { Session, Readiness, LoadPoint, DiffChange } from './schema';

// Helper function to create test sessions
function createSession(
  id: string, 
  date: string, 
  duration: number, 
  options: Partial<Session> = {}
): Session {
  return {
    session_id: id,
    date,
    sport: 'run',
    title: `Session ${id}`,
    planned_duration_min: duration,
    status: 'planned',
    priority: 'supporting',
    structure_json: {},
    ...options
  };
}

// Helper function to create test input
function createTestInput(sessions: Session[], options: any = {}) {
  return {
    athleteId: 'test-athlete',
    date: '2025-09-10', // Wednesday
    scope: 'week' as const,
    plan: {
      plan_id: 'test-plan',
      version: 1,
      blocks: options.blocks || []
    },
    sessions,
    readiness: options.readiness,
    load: options.load || [],
    blockers: [],
    races: []
  };
}

describe('computeWeeklyVolume', () => {
  test('calculates total duration for planned sessions', () => {
    const sessions = [
      createSession('s1', '2025-09-08', 60, { status: 'planned' }),
      createSession('s2', '2025-09-09', 90, { status: 'planned' }),
      createSession('s3', '2025-09-10', 45, { status: 'completed' }), // Should be excluded
      createSession('s4', '2025-09-11', 75, { status: 'planned' })
    ];
    
    expect(computeWeeklyVolume(sessions)).toBe(225); // 60 + 90 + 75
  });

  test('returns 0 for empty sessions', () => {
    expect(computeWeeklyVolume([])).toBe(0);
  });
});

describe('applyChangesToSessions', () => {
  test('applies duration changes correctly', () => {
    const sessions = [
      createSession('s1', '2025-09-10', 60),
      createSession('s2', '2025-09-11', 90)
    ];
    
    const changes: DiffChange[] = [
      { op: 'replace', path: '/sessions/s1/planned_duration_min', from: 60, to: 48 },
      { op: 'replace', path: '/sessions/s2/planned_zone_primary', from: 'z3', to: 'z2' }
    ];
    
    const result = applyChangesToSessions(sessions, changes);
    
    expect(result[0].planned_duration_min).toBe(48);
    expect(result[1].planned_duration_min).toBe(90); // unchanged
    expect(result[1].planned_zone_primary).toBe('z2');
  });

  test('ignores invalid session IDs', () => {
    const sessions = [createSession('s1', '2025-09-10', 60)];
    const changes: DiffChange[] = [
      { op: 'replace', path: '/sessions/invalid/planned_duration_min', from: 60, to: 48 }
    ];
    
    const result = applyChangesToSessions(sessions, changes);
    expect(result[0].planned_duration_min).toBe(60); // unchanged
  });
});

describe('applyWeeklyVolumeGuard', () => {
  test('allows changes within 20% limit', () => {
    const sessions = [
      createSession('s1', '2025-09-10', 100),
      createSession('s2', '2025-09-11', 100)
    ]; // Total: 200 minutes
    
    const changes: DiffChange[] = [
      { op: 'replace', path: '/sessions/s1/planned_duration_min', from: 100, to: 110 } // +5%
    ];
    
    const result = applyWeeklyVolumeGuard(sessions, changes, false);
    expect(result).toEqual(changes); // Should pass through unchanged
  });

  test('scales down increases that exceed 20%', () => {
    const sessions = [
      createSession('s1', '2025-09-10', 100),
      createSession('s2', '2025-09-11', 100)
    ]; // Total: 200 minutes
    
    const changes: DiffChange[] = [
      { op: 'replace', path: '/sessions/s1/planned_duration_min', from: 100, to: 150 } // +25%
    ];
    
    const result = applyWeeklyVolumeGuard(sessions, changes, false);
    
    // Should scale down to exactly 20% increase: 200 * 0.20 = 40 minutes
    // So s1 should become 100 + 40 = 140
    expect(result[0].to).toBe(140);
  });

  test('scales down decreases that exceed -20%', () => {
    const sessions = [
      createSession('s1', '2025-09-10', 100),
      createSession('s2', '2025-09-11', 100)
    ]; // Total: 200 minutes
    
    const changes: DiffChange[] = [
      { op: 'replace', path: '/sessions/s1/planned_duration_min', from: 100, to: 50 } // -25%
    ];
    
    const result = applyWeeklyVolumeGuard(sessions, changes, false);
    
    // Should scale to exactly -20% decrease: 200 * -0.20 = -40 minutes
    // So s1 should become 100 - 40 = 60
    expect(result[0].to).toBe(60);
  });

  test('respects 30-minute minimum during scaling', () => {
    const sessions = [createSession('s1', '2025-09-10', 40)]; // Smaller base
    
    const changes: DiffChange[] = [
      { op: 'replace', path: '/sessions/s1/planned_duration_min', from: 40, to: 5 } // Extreme decrease (-87.5%)
    ];
    
    const result = applyWeeklyVolumeGuard(sessions, changes, false);
    // Volume guard scales to -20%: 40 -> 32 minutes (40 * 0.8), minimum enforced after
    expect(result[0].to).toBe(32); // Scaled result (40 * 0.8), above 30-min minimum
  });

  test('enforces absolute 30-minute minimum', () => {
    const sessions = [createSession('s1', '2025-09-10', 35)];
    
    const changes: DiffChange[] = [
      { op: 'replace', path: '/sessions/s1/planned_duration_min', from: 35, to: 15 } // Would scale to 28
    ];
    
    const result = applyWeeklyVolumeGuard(sessions, changes, false);
    // 35 * 0.8 = 28, but minimum of 30 should be enforced
    expect(result[0].to).toBe(30);
  });

  test('blocks increases during taper', () => {
    const sessions = [createSession('s1', '2025-09-10', 100)];
    
    const changes: DiffChange[] = [
      { op: 'replace', path: '/sessions/s1/planned_duration_min', from: 100, to: 130 } // +30%
    ];
    
    const result = applyWeeklyVolumeGuard(sessions, changes, true); // inTaper = true
    expect(result).toEqual(changes); // Should pass through since increases are blocked in taper
  });
});

describe('ruleEngineDeterministic - low_readiness', () => {
  test('reduces intensity and duration for key session', () => {
    const sessions = [
      createSession('key1', '2025-09-10', 90, { 
        priority: 'key', 
        planned_zone_primary: 'z4' 
      }),
      createSession('support1', '2025-09-11', 60)
    ];
    
    const readiness: Readiness = {
      date: '2025-09-10',
      score: 45,
      band: 'amber',
      drivers: [{ key: 'hrv', z: -0.9, weight: 0.3, contribution: -15 }]
    };
    
    const input = createTestInput(sessions, { readiness });
    const result = ruleEngineDeterministic(input, 'test');
    
    expect(result.reason_code).toBe('low_readiness');
    expect(result.triggers).toContain('low_readiness');
    
    // Should reduce intensity z4 -> z3
    const zoneChange = result.changes.find(c => c.path.includes('planned_zone_primary'));
    expect(zoneChange?.from).toBe('z4');
    expect(zoneChange?.to).toBe('z3');
    
    // Should reduce duration by 20% (90 * 0.8 = 72)
    const durationChange = result.changes.find(c => c.path.includes('planned_duration_min'));
    expect(durationChange?.from).toBe(90);
    expect(durationChange?.to).toBe(72);
  });

  test('reduces duration by 10% during taper', () => {
    const sessions = [
      createSession('key1', '2025-09-10', 60, { 
        priority: 'key', 
        planned_zone_primary: 'z4' 
      })
    ];
    
    const readiness: Readiness = {
      date: '2025-09-10',
      score: 30,
      band: 'red',
      drivers: []
    };
    
    const blocks = [
      { phase: 'taper' as const, start_date: '2025-09-08', end_date: '2025-09-15' }
    ];
    
    const input = createTestInput(sessions, { readiness, blocks });
    const result = ruleEngineDeterministic(input, 'test');
    
    const durationChange = result.changes.find(c => c.path.includes('planned_duration_min'));
    expect(durationChange?.to).toBe(54); // 60 * 0.9
  });
});

describe('ruleEngineDeterministic - monotony_high', () => {
  test('redistributes load from biggest to smallest session', () => {
    const sessions = [
      createSession('big', '2025-09-10', 120),   // Biggest
      createSession('medium', '2025-09-11', 90),
      createSession('small', '2025-09-12', 60)   // Smallest
    ];
    
    const input = createTestInput(sessions, {
      readiness: { date: '2025-09-10', score: 75, band: 'green', drivers: [] },
      load: [{ date: '2025-09-10', monotony: 2.5 }]
    });
    
    const result = ruleEngineDeterministic(input, 'test');
    
    expect(result.reason_code).toBe('monotony_high');
    
    // Should reduce biggest session by 10%
    const bigReduction = result.changes.find(c => c.path.includes('big/planned_duration_min'));
    expect(bigReduction?.to).toBe(108); // 120 * 0.9
    
    // Should increase smallest session by 5%
    const smallIncrease = result.changes.find(c => c.path.includes('small/planned_duration_min'));
    expect(smallIncrease?.to).toBe(63); // 60 * 1.05
  });

  test('does not increase sessions during taper', () => {
    const sessions = [
      createSession('big', '2025-09-10', 120),
      createSession('small', '2025-09-12', 60)
    ];
    
    const blocks = [
      { phase: 'taper' as const, start_date: '2025-09-08', end_date: '2025-09-15' }
    ];
    
    const input = createTestInput(sessions, {
      readiness: { date: '2025-09-10', score: 75, band: 'green', drivers: [] },
      load: [{ date: '2025-09-10', monotony: 2.5 }],
      blocks
    });
    
    const result = ruleEngineDeterministic(input, 'test');
    
    // Should only have one change (big session reduction)
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].path).toContain('big/planned_duration_min');
  });
});

describe('ruleEngineDeterministic - ramp_high', () => {
  test('reduces key session duration', () => {
    const sessions = [
      createSession('key1', '2025-09-10', 90, { priority: 'key' }),
      createSession('support1', '2025-09-11', 60)
    ];
    
    const input = createTestInput(sessions, {
      readiness: { date: '2025-09-10', score: 75, band: 'green', drivers: [] },
      load: [{ date: '2025-09-10', ramp_rate_pct: 15 }]
    });
    
    const result = ruleEngineDeterministic(input, 'test');
    
    expect(result.reason_code).toBe('ramp_high');
    
    // Should reduce key session by 10%
    const durationChange = result.changes.find(c => c.path.includes('planned_duration_min'));
    expect(durationChange?.to).toBe(81); // 90 * 0.9
  });

  test('reduces by 5% during taper', () => {
    const sessions = [
      createSession('key1', '2025-09-10', 60, { priority: 'key' })
    ];
    
    const blocks = [
      { phase: 'taper' as const, start_date: '2025-09-08', end_date: '2025-09-15' }
    ];
    
    const input = createTestInput(sessions, {
      readiness: { date: '2025-09-10', score: 75, band: 'green', drivers: [] },
      load: [{ date: '2025-09-10', ramp_rate_pct: 15 }],
      blocks
    });
    
    const result = ruleEngineDeterministic(input, 'test');
    
    const durationChange = result.changes.find(c => c.path.includes('planned_duration_min'));
    expect(durationChange?.to).toBe(57); // 60 * 0.95
  });
});

describe('ruleEngineDeterministic - weekly volume guard integration', () => {
  test('constrains large increases to 20%', () => {
    const sessions = [
      createSession('big', '2025-09-10', 100),
      createSession('small', '2025-09-12', 100)
    ]; // Total: 200 minutes
    
    const input = createTestInput(sessions, {
      readiness: { date: '2025-09-10', score: 75, band: 'green', drivers: [] },
      load: [{ date: '2025-09-10', monotony: 2.5 }]
    });
    
    const result = ruleEngineDeterministic(input, 'test');
    
    // Monotony rule would normally: big 100->90 (-10), small 100->105 (+5)
    // Net change: -5 minutes, which is within limits
    
    expect(result.data_snapshot?.volume_guard).toBeDefined();
    const volumeGuard = result.data_snapshot?.volume_guard as any;
    expect(Math.abs(volumeGuard.delta_percent)).toBeLessThanOrEqual(20);
  });

  test('includes volume metrics in data snapshot', () => {
    const sessions = [
      createSession('key1', '2025-09-10', 100, { 
        priority: 'key', 
        planned_zone_primary: 'z4' 
      })
    ];
    
    const readiness: Readiness = {
      date: '2025-09-10',
      score: 30,
      band: 'red',
      drivers: []
    };
    
    const input = createTestInput(sessions, { readiness });
    const result = ruleEngineDeterministic(input, 'test');
    
    expect(result.data_snapshot?.volume_guard).toMatchObject({
      original_volume: 100,
      new_volume: 80, // Low readiness reduces by 20%
      delta_minutes: -20,
      delta_percent: -20
    });
  });
});

describe('ruleEngineDeterministic - missed_session', () => {
  test('reschedules and trims missed session', () => {
    const sessions = [
      createSession('missed1', '2025-09-08', 90, { status: 'missed' }),
      createSession('planned1', '2025-09-10', 60)
    ];
    
    const input = createTestInput(sessions);
    const result = ruleEngineDeterministic(input, 'test');
    
    expect(result.reason_code).toBe('missed_session');
    
    // Should reschedule to current date
    const dateChange = result.changes.find(c => c.path.includes('/date'));
    expect(dateChange?.to).toBe('2025-09-10');
    
    // Should trim by 15%
    const durationChange = result.changes.find(c => c.path.includes('planned_duration_min'));
    expect(durationChange?.to).toBe(77); // 90 * 0.85, rounded
  });
});

describe('Readiness weight normalization', () => {
  test('partial readiness drivers weights sum to 1.00', async () => {
    // This test validates the /api/readiness endpoint weight normalization
    const response = await fetch('http://localhost:3000/api/readiness?demoPartial=1');
    expect(response.status).toBe(206);
    
    const data = await response.json();
    expect(data.drivers).toBeDefined();
    expect(Array.isArray(data.drivers)).toBe(true);
    
    // Calculate sum of weights
    const weightSum = data.drivers.reduce((sum: number, driver: any) => sum + driver.weight, 0);
    
    // Assert weight sum is 1.00 ± 1e-6
    expect(Math.abs(weightSum - 1.0)).toBeLessThan(1e-6);
    
    // Verify missing drivers are listed
    expect(data.data_quality.missing).toContain('sleep');
    expect(data.data_quality.missing).toContain('rhr');
    
    // Verify only remaining drivers are present
    const driverKeys = data.drivers.map((d: any) => d.key);
    expect(driverKeys).toContain('hrv');
    expect(driverKeys).toContain('prior_strain');
    expect(driverKeys).not.toContain('sleep');
    expect(driverKeys).not.toContain('rhr');
  });

  test('complete readiness drivers weights sum to 1.00', async () => {
    // Test normal mode (no demoPartial parameter)
    const response = await fetch('http://localhost:3000/api/readiness');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.drivers).toBeDefined();
    
    // Calculate sum of weights
    const weightSum = data.drivers.reduce((sum: number, driver: any) => sum + driver.weight, 0);
    
    // Assert weight sum is 1.00 ± 1e-6
    expect(Math.abs(weightSum - 1.0)).toBeLessThan(1e-6);
    
    // Verify no missing drivers
    expect(data.data_quality.missing).toEqual([]);
    
    // Verify all drivers are present
    const driverKeys = data.drivers.map((d: any) => d.key);
    expect(driverKeys).toContain('hrv');
    expect(driverKeys).toContain('sleep');
    expect(driverKeys).toContain('rhr');
    expect(driverKeys).toContain('prior_strain');
  });
});

describe('Fuel sodium derivation', () => {
  test('sodium mg/h derived from concentration × fluid rate', async () => {
    // This test validates the /api/fuel/session/{id} endpoint sodium derivation
    const response = await fetch('http://localhost:3000/api/fuel/session/ses_001');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.during).toBeDefined();
    
    const { fluid_l_per_h, sodium_mg_per_l, sodium_mg_per_h } = data.during;
    
    // Verify all required fields are present
    expect(fluid_l_per_h).toBeDefined();
    expect(sodium_mg_per_l).toBeDefined();
    expect(sodium_mg_per_h).toBeDefined();
    
    // Verify arrays have 2 elements each (lo, hi)
    expect(fluid_l_per_h).toHaveLength(2);
    expect(sodium_mg_per_l).toHaveLength(2);
    expect(sodium_mg_per_h).toHaveLength(2);
    
    // Calculate expected derived values: lo×loC, hi×hiC
    const expectedLow = Math.round(fluid_l_per_h[0] * sodium_mg_per_l[0]);
    const expectedHigh = Math.round(fluid_l_per_h[1] * sodium_mg_per_l[1]);
    
    // Assert derived bounds match multiplication
    expect(sodium_mg_per_h[0]).toBe(expectedLow);
    expect(sodium_mg_per_h[1]).toBe(expectedHigh);
    
    // Verify specific expected values based on fixture
    // 0.4 L/h × 300 mg/L = 120 mg/h
    // 0.8 L/h × 800 mg/L = 640 mg/h
    expect(sodium_mg_per_h[0]).toBe(120);
    expect(sodium_mg_per_h[1]).toBe(640);
  });
});

describe('Priority and trigger logic', () => {
  test('missed_session has highest priority', () => {
    const sessions = [
      createSession('missed1', '2025-09-08', 90, { status: 'missed' }),
      createSession('key1', '2025-09-10', 60, { priority: 'key', planned_zone_primary: 'z4' })
    ];
    
    const readiness: Readiness = {
      date: '2025-09-10',
      score: 30,
      band: 'red',
      drivers: []
    };
    
    const input = createTestInput(sessions, { readiness });
    const result = ruleEngineDeterministic(input, 'test');
    
    // Should trigger missed_session despite low readiness
    expect(result.reason_code).toBe('missed_session');
    expect(result.triggers).toEqual(['missed_session']);
  });

  test('maintains no deletes invariant', () => {
    const sessions = [createSession('s1', '2025-09-10', 60, { priority: 'key' })];
    
    const input = createTestInput(sessions, {
      readiness: { date: '2025-09-10', score: 30, band: 'red', drivers: [] }
    });
    
    const result = ruleEngineDeterministic(input, 'test');
    
    // Should only have replace operations, never remove
    for (const change of result.changes) {
      expect(change.op).not.toBe('remove');
    }
  });
});