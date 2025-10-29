#!/usr/bin/env node

/**
 * Generate Supabase seed migration for workout library
 * Reads workouts.json and generates SQL INSERT statements
 */

const fs = require('fs');
const path = require('path');

const workoutsPath = path.join(__dirname, '..', 'library', 'workouts.json');
const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251029_seed_workout_library.sql');

// Read workouts
const workouts = JSON.parse(fs.readFileSync(workoutsPath, 'utf8'));

console.log(`Loaded ${workouts.length} workouts from library`);

// Group by sport for better organization
const bySport = workouts.reduce((acc, w) => {
  if (!acc[w.sport]) acc[w.sport] = [];
  acc[w.sport].push(w);
  return acc;
}, {});

// Generate SQL
let sql = `-- =====================================================
-- Seed Workout Library
-- Sprint 1.5 GAP-3: Comprehensive workout library seeding
-- =====================================================
-- Seeds ${workouts.length} workouts into workout_library table
-- Distribution: Run (${bySport.run?.length || 0}), Bike (${bySport.bike?.length || 0}), Swim (${bySport.swim?.length || 0}), Strength (${bySport.strength?.length || 0})

-- Clear existing workouts (for idempotency)
DELETE FROM public.workout_library;

-- Insert workout library
INSERT INTO public.workout_library (
  workout_id, sport, title, description, phase, focus_tags,
  primary_zone, duration_min, load_hint, structure_json
) VALUES\n`;

// Generate INSERT values
const values = workouts.map((w, idx) => {
  const focusTags = `ARRAY[${w.focus_tags.map(t => `'${t}'`).join(', ')}]::TEXT[]`;
  const structureJson = JSON.stringify(w.structure_json).replace(/'/g, "''");
  const description = w.description.replace(/'/g, "''");
  const title = w.title.replace(/'/g, "''");

  return `('${w.workout_id}', '${w.sport}', '${title}', '${description}', '${w.phase}',
  ${focusTags}, '${w.primary_zone}', ${w.duration_min}, ${w.load_hint},
  '${structureJson}'::JSONB)`;
}).join(',\n');

sql += values + ';\n\n';

// Add verification queries
sql += `-- =====================================================
-- Verification Queries
-- =====================================================

-- Count total workouts
SELECT
  'Total workouts inserted' as metric,
  COUNT(*)::TEXT as value
FROM public.workout_library;

-- Breakdown by sport
SELECT
  sport,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT phase ORDER BY phase) as phases
FROM public.workout_library
GROUP BY sport
ORDER BY sport;

-- Breakdown by phase
SELECT
  phase,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT sport ORDER BY sport) as sports
FROM public.workout_library
GROUP BY phase
ORDER BY phase;

-- Breakdown by zone
SELECT
  primary_zone,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.workout_library), 1) as percentage
FROM public.workout_library
GROUP BY primary_zone
ORDER BY count DESC;

-- Duration distribution
SELECT
  CASE
    WHEN duration_min <= 30 THEN '20-30 min'
    WHEN duration_min <= 45 THEN '31-45 min'
    WHEN duration_min <= 60 THEN '46-60 min'
    WHEN duration_min <= 90 THEN '61-90 min'
    ELSE '91+ min'
  END as duration_range,
  COUNT(*) as count
FROM public.workout_library
GROUP BY duration_range
ORDER BY MIN(duration_min);

-- =====================================================
-- Library Statistics
-- =====================================================

-- Current: ${workouts.length} workouts (Drop-1 expanded)
-- Target: 101 workouts (full library)
-- Remaining: ${101 - workouts.length} workouts to reach target
--
-- See: /docs/library/expansion_summary.md for full specification
`;

// Write to file
fs.writeFileSync(outputPath, sql);

console.log(`\n✅ Generated seed migration with ${workouts.length} workouts`);
console.log(`📝 Written to: ${outputPath}`);
console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

// Summary
console.log('\n📈 Workout Distribution:');
console.log('   By Sport:');
Object.entries(bySport).sort().forEach(([sport, workouts]) => {
  console.log(`     ${sport}: ${workouts.length}`);
});

const byPhase = workouts.reduce((acc, w) => {
  acc[w.phase] = (acc[w.phase] || 0) + 1;
  return acc;
}, {});
console.log('   By Phase:');
Object.entries(byPhase).sort().forEach(([phase, count]) => {
  console.log(`     ${phase}: ${count}`);
});

const byZone = workouts.reduce((acc, w) => {
  acc[w.primary_zone] = (acc[w.primary_zone] || 0) + 1;
  return acc;
}, {});
console.log('   By Zone:');
Object.entries(byZone).sort((a, b) => b[1] - a[1]).forEach(([zone, count]) => {
  console.log(`     ${zone}: ${count}`);
});

console.log('\n✅ Seed migration ready to deploy!');
