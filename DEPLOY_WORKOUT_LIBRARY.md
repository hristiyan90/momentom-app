# Deploy Workout Library to Supabase

**Status:** Ready to deploy
**Migrations:** 2 files (table schema + 85 workouts)
**Time:** ~2 minutes

---

## Step 1: Open Supabase SQL Editor

Navigate to:
```
https://supabase.com/dashboard/project/xgegukbclypvohdrwufa/sql
```

Or:
1. Go to https://supabase.com/dashboard
2. Select your project: `momentom-app`
3. Click "SQL Editor" in left sidebar

---

## Step 2: Run Table Schema Migration

**File:** `supabase/migrations/20251029_workout_library.sql`

**Instructions:**
1. Click "+ New query" in SQL Editor
2. Copy the ENTIRE contents of this file (179 lines)
3. Paste into the SQL Editor
4. Click "Run" or press Cmd+Enter

**What this creates:**
- ✅ `workout_library` table with validation constraints
- ✅ 5 indexes (sport, phase, zone, focus_tags)
- ✅ 4 RLS policies (read-only for authenticated users)
- ✅ 3 helper functions (get by sport/phase, by zone, search by tags)

**Expected output:**
```
Success. No rows returned
```

---

## Step 3: Run Seed Migration (85 Workouts)

**File:** `supabase/migrations/20251029_seed_workout_library.sql`

**Instructions:**
1. Click "+ New query" in SQL Editor
2. Copy the ENTIRE contents of this file (75.9 KB, 331 lines)
3. Paste into the SQL Editor
4. Click "Run" or press Cmd+Enter

**What this does:**
- Deletes any existing workouts (for idempotency)
- Inserts 85 workouts with complete structure_json
- Runs verification queries automatically

**Expected output:**
```
Total workouts inserted: 85

Sport distribution:
bike   | 25 | {base,build,peak,recovery,taper}
run    | 23 | {base,build,peak,recovery,taper}
strength | 17 | {base,build,peak,taper}
swim   | 20 | {base,build,peak,recovery,taper}

Phase distribution:
base     | 25 | {bike,run,strength,swim}
build    | 27 | {bike,run,strength,swim}
peak     | 16 | {bike,run,strength,swim}
recovery | 8  | {bike,run,swim}
taper    | 9  | {bike,run,strength,swim}

Zone distribution:
z2       | 27 | 31.8%
strength | 17 | 20.0%
z4       | 15 | 17.6%
z3       | 13 | 15.3%
z5       | 7  | 8.2%
z1       | 6  | 7.1%
```

---

## Step 4: Verify Deployment

**File:** `scripts/verify-workout-library.sql`

**Instructions:**
1. Click "+ New query" in SQL Editor
2. Copy the ENTIRE contents of `scripts/verify-workout-library.sql`
3. Paste into the SQL Editor
4. Click "Run" or press Cmd+Enter

**Expected results:**
- ✅ Table exists: `true`
- ✅ Total workouts: `85`
- ✅ All sports present (bike, run, swim, strength)
- ✅ All phases present (base, build, peak, taper, recovery)
- ✅ Helper functions return results
- ✅ RLS policy exists for SELECT

---

## Troubleshooting

### Error: "relation update_updated_at_column does not exist"

**Solution:** The trigger function doesn't exist. Remove the trigger section from the migration:

```sql
-- Comment out or remove these lines (56-59):
-- CREATE TRIGGER update_workout_library_updated_at
--   BEFORE UPDATE ON public.workout_library
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();
```

Then re-run the migration.

### Error: "duplicate key value violates unique constraint"

**Solution:** Table already exists. Run this first:

```sql
DROP TABLE IF EXISTS public.workout_library CASCADE;
```

Then re-run Step 2.

### Error: Migration runs but no data appears

**Solution:** Check RLS policies are correct:

```sql
-- Verify you can read the table
SELECT COUNT(*) FROM public.workout_library;

-- If you get 0 or permission error, check RLS:
SELECT * FROM pg_policies WHERE tablename = 'workout_library';
```

---

## Quick Verification Queries

After deployment, run these to confirm everything works:

### Count workouts by sport
```sql
SELECT sport, COUNT(*) as count
FROM public.workout_library
GROUP BY sport
ORDER BY sport;
```

### Test helper function
```sql
SELECT workout_id, title, duration_min
FROM public.get_workouts_by_sport_phase('run', 'base')
LIMIT 5;
```

### Search by tags
```sql
SELECT workout_id, title, focus_tags
FROM public.search_workouts_by_tags('bike', ARRAY['threshold'])
LIMIT 5;
```

---

## Success Criteria

After deployment, you should have:
- [x] `workout_library` table exists
- [x] 85 workouts seeded
- [x] All sports covered (17-25 workouts each)
- [x] All phases covered (base, build, peak, taper, recovery)
- [x] 3 helper functions working
- [x] RLS policies preventing direct modifications
- [x] Indexes created for efficient querying

---

## Next Steps

Once deployment is verified:

1. ✅ Mark GAP-3 as **Production Deployed**
2. ✅ Update STATUS.md
3. ✅ Move to GAP-1 (Onboarding Persistence) or GAP-6/7 (RLS Policies)

---

**Estimated time:** 2-3 minutes
**Files to copy:** 3 files (schema, seed, verify)
**SQL Editor location:** https://supabase.com/dashboard/project/xgegukbclypvohdrwufa/sql
