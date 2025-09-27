import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    
    console.log('🏃 Seeding realistic workout data...');
    
    const athleteId = '00000000-0000-0000-0000-000000000001';
    
    // First verify the athlete exists
    const { data: athlete, error: athleteError } = await supabase
      .from('athlete')
      .select('athlete_id')
      .eq('athlete_id', athleteId)
      .single();
    
    if (athleteError || !athlete) {
      console.error('❌ Test athlete not found. Run setup-test-data first.');
      return NextResponse.json(
        { error: 'Test athlete not found', details: 'Run /api/dev/setup-test-data first' },
        { status: 400 }
      );
    }
    
    // Clear existing sessions for this athlete to avoid duplicates
    // Using admin client which bypasses RLS
    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('athlete_id', athleteId);
    
    if (deleteError && !deleteError.message.includes('0 rows')) {
      console.warn('⚠️ Could not clear existing sessions:', deleteError);
    }
    
    const sessions = generateRealisticWorkouts(athleteId);
    console.log(`📅 Generated ${sessions.length} workout sessions`);
    
    // Insert sessions in batches to avoid timeout
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('sessions')
        .insert(batch);
      
      if (insertError) {
        console.error(`❌ Failed to insert batch ${Math.floor(i/batchSize) + 1}:`, insertError);
        return NextResponse.json(
          { error: 'Failed to insert workout data', details: insertError.message },
          { status: 500 }
        );
      }
      
      insertedCount += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} sessions`);
    }
    
    console.log('✅ Realistic workout data seeding complete');
    
    return NextResponse.json({ 
      status: 'success',
      sessionsInserted: insertedCount,
      dateRange: '2025-06-01 to 2025-09-30',
      sports: ['run', 'bike', 'swim', 'strength'],
      note: 'Realistic workout data with varied compliance patterns. Past sessions have realistic completion rates.',
      features: {
        completion_logic: 'Past sessions: 60-90% completion rate based on intensity, recency, and workout type',
        duration_variance: 'Completed sessions: 85-115% of planned duration',
        compliance_factors: 'Harder workouts skipped more, recent sessions completed more, Monday sessions often missed',
        future_sessions: 'All future sessions marked as planned'
      }
    });
    
  } catch (error) {
    console.error('❌ Workout seeding failed:', error);
    return NextResponse.json(
      { error: 'Workout seeding failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateRealisticWorkouts(athleteId: string) {
  const sessions = [];
  const startDate = new Date('2025-06-01');
  const endDate = new Date('2025-09-30');
  
  // Training phases with different focus
  const phases = [
    { 
      name: 'Base Building', 
      start: '2025-06-01', 
      end: '2025-07-15',
      weeklyHours: 8,
      intensityMix: { recovery: 30, endurance: 50, tempo: 15, threshold: 5, vo2: 0 }
    },
    { 
      name: 'Build Phase', 
      start: '2025-07-16', 
      end: '2025-08-31',
      weeklyHours: 10,
      intensityMix: { recovery: 20, endurance: 40, tempo: 25, threshold: 12, vo2: 3 }
    },
    { 
      name: 'Peak/Race Prep', 
      start: '2025-09-01', 
      end: '2025-09-30',
      weeklyHours: 9,
      intensityMix: { recovery: 25, endurance: 35, tempo: 20, threshold: 15, vo2: 5 }
    }
  ];
  
  // Workout templates by sport and intensity
  const workoutTemplates = {
    run: {
      recovery: [
        { title: 'Easy Recovery Run', duration: [30, 45], load: [25, 40], zone: 'z1' },
        { title: 'Recovery Jog', duration: [25, 35], load: [20, 35], zone: 'z1' }
      ],
      endurance: [
        { title: 'Base Aerobic Run', duration: [45, 75], load: [45, 70], zone: 'z2' },
        { title: 'Long Steady Run', duration: [60, 120], load: [60, 95], zone: 'z2' },
        { title: 'Progression Run', duration: [50, 80], load: [55, 85], zone: 'z2' }
      ],
      tempo: [
        { title: 'Tempo Run', duration: [35, 60], load: [65, 90], zone: 'z3' },
        { title: 'Cruise Intervals', duration: [40, 65], load: [70, 95], zone: 'z3' },
        { title: 'Threshold Segments', duration: [45, 70], load: [75, 100], zone: 'z3' }
      ],
      threshold: [
        { title: 'Lactate Threshold Run', duration: [35, 55], load: [85, 110], zone: 'z4' },
        { title: 'Hill Repeats', duration: [40, 60], load: [90, 115], zone: 'z4' },
        { title: 'Track Intervals', duration: [45, 65], load: [95, 120], zone: 'z4' }
      ],
      vo2: [
        { title: 'VO2 Max Intervals', duration: [30, 50], load: [100, 130], zone: 'z5' },
        { title: 'Short Hill Sprints', duration: [25, 45], load: [95, 125], zone: 'z5' }
      ]
    },
    bike: {
      recovery: [
        { title: 'Easy Spin', duration: [30, 60], load: [25, 45], zone: 'z1' },
        { title: 'Recovery Ride', duration: [45, 75], load: [30, 50], zone: 'z1' }
      ],
      endurance: [
        { title: 'Base Endurance Ride', duration: [60, 120], load: [60, 90], zone: 'z2' },
        { title: 'Long Steady Ride', duration: [90, 180], load: [80, 120], zone: 'z2' },
        { title: 'Aerobic Base Ride', duration: [75, 150], load: [70, 110], zone: 'z2' }
      ],
      tempo: [
        { title: 'Sweet Spot Intervals', duration: [60, 90], load: [90, 120], zone: 'z3' },
        { title: 'Tempo Efforts', duration: [70, 100], load: [95, 125], zone: 'z3' },
        { title: 'Sustained Power', duration: [50, 80], load: [85, 115], zone: 'z3' }
      ],
      threshold: [
        { title: 'FTP Intervals', duration: [60, 90], load: [110, 140], zone: 'z4' },
        { title: 'Lactate Threshold', duration: [50, 80], load: [105, 135], zone: 'z4' },
        { title: 'Over-Under Intervals', duration: [55, 85], load: [115, 145], zone: 'z4' }
      ],
      vo2: [
        { title: 'VO2 Max Efforts', duration: [45, 75], load: [120, 160], zone: 'z5' },
        { title: 'Neuromuscular Power', duration: [40, 70], load: [125, 165], zone: 'z5' }
      ]
    },
    swim: {
      recovery: [
        { title: 'Easy Technique Swim', duration: [30, 45], load: [20, 35], zone: 'z1' },
        { title: 'Recovery Swim', duration: [25, 40], load: [18, 32], zone: 'z1' }
      ],
      endurance: [
        { title: 'Aerobic Base Swim', duration: [45, 75], load: [40, 65], zone: 'z2' },
        { title: 'Continuous Swim', duration: [50, 80], load: [45, 70], zone: 'z2' },
        { title: 'Distance Swim', duration: [60, 90], load: [50, 75], zone: 'z2' }
      ],
      tempo: [
        { title: 'Threshold Swim Set', duration: [40, 65], load: [60, 85], zone: 'z3' },
        { title: 'Tempo Intervals', duration: [45, 70], load: [65, 90], zone: 'z3' }
      ],
      threshold: [
        { title: 'Lactate Threshold Swim', duration: [35, 60], load: [75, 100], zone: 'z4' },
        { title: 'CSS Intervals', duration: [40, 65], load: [80, 105], zone: 'z4' }
      ],
      vo2: [
        { title: 'VO2 Swim Intervals', duration: [30, 50], load: [85, 115], zone: 'z5' },
        { title: 'Sprint Sets', duration: [25, 45], load: [90, 120], zone: 'z5' }
      ]
    },
    strength: {
      recovery: [
        { title: 'Mobility & Stretching', duration: [20, 35], load: [15, 25], zone: null },
        { title: 'Recovery Yoga', duration: [30, 45], load: [18, 28], zone: null }
      ],
      endurance: [
        { title: 'General Strength', duration: [45, 60], load: [35, 50], zone: null },
        { title: 'Core & Stability', duration: [30, 45], load: [25, 40], zone: null },
        { title: 'Functional Movement', duration: [40, 55], load: [30, 45], zone: null }
      ],
      tempo: [
        { title: 'Sport-Specific Strength', duration: [50, 75], load: [45, 65], zone: null },
        { title: 'Power Development', duration: [45, 70], load: [50, 70], zone: null }
      ],
      threshold: [
        { title: 'High Intensity Strength', duration: [40, 60], load: [60, 80], zone: null },
        { title: 'Max Strength Work', duration: [45, 65], load: [65, 85], zone: null }
      ],
      vo2: [
        { title: 'Explosive Power Training', duration: [30, 50], load: [70, 90], zone: null }
      ]
    }
  };
  
  const currentDate = new Date(startDate);
  let weekCount = 0;
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Determine current phase
    const currentPhase = phases.find(phase => 
      dateStr >= phase.start && dateStr <= phase.end
    );
    
    if (!currentPhase) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // Weekly pattern: More workouts on weekdays, optional weekend sessions
    // Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6, Sunday = 0
    const isRecoveryWeek = Math.floor(weekCount / 7) % 4 === 3; // Every 4th week is recovery
    const workoutProbability = getWorkoutProbability(dayOfWeek, isRecoveryWeek);
    
    if (Math.random() < workoutProbability) {
      // Determine sport distribution (triathlon focus)
      const sport = selectSport(dayOfWeek);
      
      // Determine intensity based on phase and day
      const intensity = selectIntensity(currentPhase, dayOfWeek, isRecoveryWeek);
      
      // Select workout template
      const templates = workoutTemplates[sport][intensity];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Generate workout details
      const duration = randomBetween(template.duration[0], template.duration[1]);
      const load = randomBetween(template.load[0], template.load[1]);
      
      // Determine status with realistic compliance patterns
      const today = new Date();
      const sessionDate = new Date(dateStr);
      const isPast = sessionDate < today;
      const isFuture = sessionDate > today;
      
      let status: 'planned' | 'completed' | 'skipped';
      let actualDuration: number | null = null;
      
      if (isFuture) {
        status = 'planned';
      } else {
        // Past sessions: realistic compliance with varied patterns
        const daysAgo = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Base completion rate varies by workout type and how long ago
        let completionRate = 0.75; // Base 75% completion rate
        
        // Harder workouts get skipped more often
        if (intensity === 'vo2' || intensity === 'threshold') {
          completionRate -= 0.15; // 60% completion for hard sessions
        } else if (intensity === 'recovery') {
          completionRate += 0.15; // 90% completion for easy sessions
        }
        
        // Recent sessions more likely to be completed (motivation higher)
        if (daysAgo <= 7) {
          completionRate += 0.10;
        } else if (daysAgo <= 30) {
          completionRate += 0.05;
        } else if (daysAgo > 90) {
          completionRate -= 0.10; // Older sessions more likely missed
        }
        
        // Monday sessions often skipped (weekend recovery)
        if (dayOfWeek === 1) {
          completionRate -= 0.10;
        }
        
        // Recovery week sessions more likely completed
        if (isRecoveryWeek) {
          completionRate += 0.10;
        }
        
        // Weekend long sessions slightly more likely to be skipped
        if ((dayOfWeek === 0 || dayOfWeek === 6) && duration > 90) {
          completionRate -= 0.05;
        }
        
        // Clamp completion rate
        completionRate = Math.max(0.4, Math.min(0.95, completionRate));
        
        // Determine final status
        const rand = Math.random();
        if (rand < completionRate) {
          status = 'completed';
          // Realistic duration variance for completed sessions
          const variance = 0.85 + Math.random() * 0.3; // 85% to 115% of planned
          actualDuration = Math.round(duration * variance);
        } else {
          status = 'skipped';
          actualDuration = null;
        }
      }
      
      sessions.push({
        athlete_id: athleteId,
        date: dateStr,
        sport: sport,
        title: template.title,
        planned_duration_min: duration,
        planned_load: load,
        planned_zone_primary: template.zone,
        status: status,
        structure_json: { segments: [] },
        actual_duration_min: actualDuration,
        actual_distance_m: null,
        source_file_type: null,
        source_ingest_id: null
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    if (dayOfWeek === 0) weekCount++; // Increment week count on Sunday
  }
  
  return sessions;
}

function getWorkoutProbability(dayOfWeek: number, isRecoveryWeek: boolean): number {
  // Monday = 1, Tuesday = 2, etc., Sunday = 0
  const baseProbabilities = {
    0: 0.4, // Sunday - longer sessions or rest
    1: 0.8, // Monday - start week strong
    2: 0.9, // Tuesday - high activity
    3: 0.8, // Wednesday - regular training
    4: 0.9, // Thursday - key workout day
    5: 0.6, // Friday - lighter or rest
    6: 0.7  // Saturday - weekend session
  };
  
  const probability = baseProbabilities[dayOfWeek];
  return isRecoveryWeek ? probability * 0.6 : probability;
}

function selectSport(dayOfWeek: number): 'run' | 'bike' | 'swim' | 'strength' {
  // Sport distribution based on day of week
  const sportDistribution = {
    0: ['bike', 'run', 'swim'], // Sunday - longer endurance sessions
    1: ['strength', 'swim', 'run'], // Monday - strength or easy activity
    2: ['run', 'bike'], // Tuesday - key running or cycling day
    3: ['swim', 'strength', 'run'], // Wednesday - swimming or strength
    4: ['bike', 'run'], // Thursday - hard intervals
    5: ['swim', 'strength'], // Friday - easier sessions
    6: ['run', 'bike', 'swim'] // Saturday - varied training
  };
  
  const options = sportDistribution[dayOfWeek];
  return options[Math.floor(Math.random() * options.length)] as 'run' | 'bike' | 'swim' | 'strength';
}

function selectIntensity(phase: any, dayOfWeek: number, isRecoveryWeek: boolean): string {
  const intensities = ['recovery', 'endurance', 'tempo', 'threshold', 'vo2'];
  
  // Recovery week modifier
  if (isRecoveryWeek) {
    return Math.random() < 0.6 ? 'recovery' : 'endurance';
  }
  
  // Hard days: Tuesday, Thursday, Saturday
  const isHardDay = [2, 4, 6].includes(dayOfWeek);
  
  if (isHardDay) {
    // Higher probability of intense workouts
    const rand = Math.random() * 100;
    if (rand < phase.intensityMix.vo2) return 'vo2';
    if (rand < phase.intensityMix.vo2 + phase.intensityMix.threshold) return 'threshold';
    if (rand < phase.intensityMix.vo2 + phase.intensityMix.threshold + phase.intensityMix.tempo) return 'tempo';
    if (rand < 80) return 'endurance';
    return 'recovery';
  } else {
    // Easy/moderate days
    const rand = Math.random() * 100;
    if (rand < phase.intensityMix.recovery) return 'recovery';
    if (rand < phase.intensityMix.recovery + phase.intensityMix.endurance) return 'endurance';
    if (rand < 85) return 'tempo';
    return 'endurance';
  }
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
