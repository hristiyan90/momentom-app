# Feature Spec: GAP-3 Workout Library Infrastructure

**Feature ID:** GAP-3
**Status:** ✅ Implemented
**Sprint:** 1.5 Foundation & User Lifecycle
**Type:** Database Infrastructure
**Priority:** High

---

## Overview

Implement comprehensive workout library infrastructure with database schema, seeding pipeline, and helper functions to support plan generation (Sprint 2). Includes 85 evidence-based workouts across all sports and training phases.

---

## Problem Statement

**Current State:**
- No workout library table in database
- No structured workout data for plan generation
- Cannot select workouts based on sport/phase/zone
- Plan generation algorithm (Sprint 2) has no data source

**Requirements:**
- Structured workout library with validation constraints
- Read-only access for authenticated users via RLS
- Helper functions for efficient workout selection
- Minimum 15 workouts per sport (Run, Bike, Swim, Strength)
- All training phases covered (Base, Build, Peak, Taper, Recovery)

---

## Solution

### Database Schema (`workout_library` table)

**Table:** `public.workout_library`

**Columns:**
- `workout_id` (TEXT PRIMARY KEY) - Unique identifier (e.g., `run_base_z2_endurance_45`)
- `sport` (TEXT NOT NULL) - One of: run, bike, swim, strength
- `title` (TEXT NOT NULL) - Human-readable workout name
- `description` (TEXT NOT NULL) - Detailed workout description
- `phase` (TEXT NOT NULL) - Training phase: base, build, peak, taper, recovery
- `focus_tags` (TEXT[] NOT NULL) - Searchable tags (e.g., ['threshold', 'intervals'])
- `primary_zone` (TEXT) - Primary training zone: z1-z5, strength
- `duration_min` (INTEGER NOT NULL) - Total workout duration (20-360 minutes)
- `load_hint` (INTEGER NOT NULL) - Training load estimate (40-300 TSS equivalent)
- `structure_json` (JSONB NOT NULL) - Workout segments with intervals, warmup, cooldown
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Constraints:**
- `sport` CHECK constraint: must be one of ['run', 'bike', 'swim', 'strength']
- `phase` CHECK constraint: must be one of ['base', 'build', 'peak', 'taper', 'recovery']
- `primary_zone` CHECK constraint: must be one of ['z1', 'z2', 'z3', 'z4', 'z5', 'strength']
- `duration_min` CHECK: 0 < duration_min <= 360
- `load_hint` CHECK: 0 < load_hint <= 300

**Indexes:**
- PRIMARY KEY on `workout_id`
- GIN index on `focus_tags` for full-text search
- B-tree indexes on `sport`, `phase`, `primary_zone` for filtering

**RLS Policies:**
- Read-only access for all authenticated users
- No INSERT/UPDATE/DELETE permissions (managed via migrations only)

---

### Helper Functions

#### 1. `get_workouts_by_sport_phase(p_sport TEXT, p_phase TEXT)`

**Purpose:** Fetch workouts filtered by sport and training phase

**Parameters:**
- `p_sport` - Sport filter ('run', 'bike', 'swim', 'strength')
- `p_phase` - Training phase ('base', 'build', 'peak', 'taper', 'recovery')

**Returns:** TABLE with all workout columns

**Example:**
```sql
SELECT * FROM get_workouts_by_sport_phase('run', 'base');
```

#### 2. `get_workouts_by_zone(p_sport TEXT, p_zone TEXT, p_max_duration INT)`

**Purpose:** Fetch workouts by sport, zone, and duration constraint

**Parameters:**
- `p_sport` - Sport filter
- `p_zone` - Primary zone ('z1', 'z2', 'z3', 'z4', 'z5', 'strength')
- `p_max_duration` - Maximum workout duration in minutes

**Returns:** TABLE with all workout columns

**Example:**
```sql
SELECT * FROM get_workouts_by_zone('run', 'z4', 60);
```

#### 3. `search_workouts_by_tags(p_sport TEXT, p_required_tags TEXT[])`

**Purpose:** Full-text search workouts by focus tags

**Parameters:**
- `p_sport` - Sport filter
- `p_required_tags` - Array of required tags (e.g., ['threshold', 'intervals'])

**Returns:** TABLE with all workout columns, ordered by tag match relevance

**Example:**
```sql
SELECT * FROM search_workouts_by_tags('bike', ARRAY['threshold']);
```

---

### Workout Library Data

**Total Workouts:** 85 (84% of 101 target)

**Distribution by Sport:**
| Sport | Count | Percentage |
|-------|-------|------------|
| Bike | 25 | 29% |
| Run | 23 | 27% |
| Swim | 20 | 24% |
| Strength | 17 | 20% |

**Distribution by Phase:**
| Phase | Count | Percentage |
|-------|-------|------------|
| Build | 27 | 32% |
| Base | 25 | 29% |
| Peak | 16 | 19% |
| Taper | 9 | 11% |
| Recovery | 8 | 9% |

**Distribution by Zone:**
| Zone | Count | Purpose |
|------|-------|---------|
| Z2 | 27 | Aerobic base building |
| Strength | 17 | Resistance training |
| Z4 | 15 | Threshold/lactate work |
| Z3 | 13 | Tempo/muscular endurance |
| Z5 | 7 | VO2max/speed work |
| Z1 | 6 | Recovery/active rest |

**Evidence-Based Protocols:**
- Joe Friel periodization (Training Bible series)
- Stephen Seiler polarized training (80/10/10 distribution)
- Coggan power zones (cycling)
- Laursen & Jenkins threshold protocols
- Billat VO2max intervals
- Mujika & Padilla taper strategies

---

## Technical Specification

### Migration Files

**1. Table Schema (`20251029_workout_library.sql`)**
- Creates `workout_library` table
- Adds validation constraints
- Creates indexes (PRIMARY KEY, GIN, B-tree)
- Implements RLS policies
- Creates 3 helper functions
- **Size:** 6.4 KB

**2. Seed Migration (`20251029_seed_workout_library.sql`)**
- Seeds 85 workouts with complete structure_json
- Includes verification queries
- Idempotent (DELETE before INSERT)
- **Size:** 75.9 KB

### Generation Script

**File:** `scripts/generate-workout-seed.js`

**Purpose:** Generate SQL INSERT statements from `library/workouts.json`

**Features:**
- Reads JSON source data
- Generates parameterized SQL with proper escaping
- Groups workouts by sport for organization
- Includes verification queries
- Outputs statistics (sport/phase/zone distribution)

**Usage:**
```bash
node scripts/generate-workout-seed.js
```

**Output:** `supabase/migrations/20251029_seed_workout_library.sql`

---

## Deployment Instructions

### Option 1: Supabase Dashboard (Recommended)
1. Navigate to: https://supabase.com/dashboard/project/{PROJECT_REF}/editor
2. Go to **SQL Editor**
3. Run migrations in order:
   - First: `20251029_workout_library.sql` (create table)
   - Second: `20251029_seed_workout_library.sql` (seed 85 workouts)

### Option 2: Supabase CLI
```bash
# Link to project
npx supabase link --project-ref {PROJECT_REF}

# Push migrations to remote
npx supabase db push
```

### Option 3: Local Development
```bash
# Ensure Docker is running
docker info

# Reset local database with all migrations
npx supabase db reset --local
```

---

## Verification Queries

### Count Total Workouts (expect 85)
```sql
SELECT COUNT(*) as total_workouts
FROM public.workout_library;
```

### Distribution by Sport
```sql
SELECT
  sport,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT phase ORDER BY phase) as phases
FROM public.workout_library
GROUP BY sport
ORDER BY sport;
```

### Distribution by Phase
```sql
SELECT
  phase,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT sport ORDER BY sport) as sports
FROM public.workout_library
GROUP BY phase
ORDER BY phase;
```

### Distribution by Zone
```sql
SELECT
  primary_zone,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.workout_library), 1) as percentage
FROM public.workout_library
GROUP BY primary_zone
ORDER BY count DESC;
```

### Test Helper Functions
```sql
-- Get all base phase running workouts
SELECT workout_id, title, duration_min, load_hint
FROM public.get_workouts_by_sport_phase('run', 'base');

-- Get Z4 threshold workouts under 60 minutes
SELECT workout_id, title, duration_min, load_hint
FROM public.get_workouts_by_zone('run', 'z4', 60);

-- Search for threshold workouts
SELECT workout_id, title, focus_tags
FROM public.search_workouts_by_tags('bike', ARRAY['threshold']);
```

---

## Integration Points (Sprint 2)

### Plan Generation Engine

**Endpoint:** `POST /api/plan/generate`

**Workout Selection Logic:**
```typescript
import { supabaseClient } from '@/lib/auth/client';

// Get workouts by phase and sport
const { data: baseWorkouts } = await supabaseClient
  .from('workout_library')
  .select('*')
  .eq('sport', athleteProfile.primary_sport)
  .eq('phase', 'base')
  .order('duration_min', { ascending: true });

// Get workouts by zone with duration constraint
const { data: z4Workouts } = await supabaseClient
  .rpc('get_workouts_by_zone', {
    p_sport: 'run',
    p_zone: 'z4',
    p_max_duration: athleteProfile.available_hours_per_week * 60
  });

// Search by tags
const { data: thresholdWorkouts } = await supabaseClient
  .rpc('search_workouts_by_tags', {
    p_sport: 'bike',
    p_required_tags: ['threshold', 'sweet_spot']
  });
```

### Workout Customization

**Use Cases:**
- Adjust duration based on athlete's available time
- Scale load based on fitness level
- Filter by equipment availability
- Match workout to race distance (sprint, Olympic, Half, Full)

---

## Testing & Validation

### Database Tests
- [x] Table created with proper constraints
- [x] RLS policies enforce read-only access
- [x] Helper functions return correct results
- [x] All 85 workouts seeded successfully
- [x] No duplicate workout_ids
- [x] All required fields populated

### Data Quality Tests
- [x] Sport distribution balanced (17-25 per sport)
- [x] Phase coverage complete (all 5 phases)
- [x] Zone distribution supports polarized training
- [x] Duration ranges appropriate (20-120 minutes)
- [x] Load hints realistic (40-300 TSS equivalent)
- [x] Evidence-based work:rest ratios validated

### Integration Tests (Sprint 2)
- [ ] Plan generation can query workouts by phase
- [ ] Workout selection respects duration constraints
- [ ] Tag-based search returns relevant workouts
- [ ] RLS policies prevent unauthorized modifications

---

## Success Criteria

### MVP Requirements ✅
- [x] `workout_library` table exists with validation
- [x] 15+ workouts per sport (Run: 23, Bike: 25, Swim: 20, Strength: 17)
- [x] All phases represented across all sports
- [x] Helper functions for workout selection
- [x] RLS policies configured (read-only)
- [x] 80%+ of target workouts seeded (85/101 = 84%)

### Production Ready ✅
- [x] Sufficient coverage for plan generation (Sprint 2)
- [x] Evidence-based workout design validated
- [x] Database infrastructure complete and tested
- [x] Deployment instructions documented
- [x] Verification queries provided

---

## Future Work

### Remaining 16 Workouts (Optional - Future Sprint)

**Gaps by Sport:**
- Run: 3 more (endurance 120', fartlek, VO2max short)
- Bike: 1 more (40/20 intervals)
- Swim: 1 more (descending ladder)
- Strength: 1 more (Olympic lift focus)
- Taper: 4 more (cross-sport neuromuscular)

**Gaps by Zone:**
- Z4 (Threshold): Need 11 more workouts
- Z2 (Aerobic): Need 8 more workouts

See `/docs/library/expansion_summary.md` for detailed specifications.

### Enhancements (Sprint 3+)
- Workout export functionality (.TCX, .ZWO formats)
- Workout preview UI in athlete dashboard
- Custom workout creation by coaches
- Workout difficulty ratings
- Equipment filters (treadmill, trainer, open water)

---

## Files Modified

### Database Migrations
- `supabase/migrations/20251029_workout_library.sql` - Table schema (6.4 KB)
- `supabase/migrations/20251029_seed_workout_library.sql` - 85 workouts (75.9 KB)

### Data & Scripts
- `library/workouts.json` - Validated 85-workout source data
- `scripts/generate-workout-seed.js` - Migration generator

### Documentation
- `GAP3_WORKOUT_LIBRARY.md` - Complete deployment guide
- `docs/specs/gap-3-workout-library.md` - This specification

---

## Compliance

### Policy Adherence
- ✅ RLS policies implemented (read-only for authenticated users)
- ✅ Migration-based schema changes only
- ✅ No direct database modifications
- ✅ Comprehensive documentation provided

### Quality Gates
- ✅ Library validation tests pass (85+ workouts)
- ✅ All required sports present
- ✅ All required phases present (base, build, peak, taper, recovery)
- ✅ JSON structure validated
- ✅ Template structure validated

---

## References

- Sprint 1.5 Plan: `/docs/process/sprints/sprint-1.5-plan.md`
- Task 1.5-D: Workout Library Seeding
- Library Expansion Plan: `/docs/library/expansion_summary.md`
- Evidence Brief: `/docs/library/evidence_brief.md`
- Template Specification: `/docs/library/template.workout.json`
