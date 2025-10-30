# 🚀 Workout Library Deployment Guide - Dashboard SQL Editor

**Estimated Time:** 4 minutes
**Method:** Supabase Dashboard SQL Editor
**Status:** Ready to deploy

---

## 📍 Step 0: Open Supabase SQL Editor

**Go to:** https://supabase.com/dashboard/project/xgegukbclypvohdrwufa/sql

Or navigate:
1. https://supabase.com/dashboard
2. Select project: `momentom-app`
3. Click "SQL Editor" in left sidebar

---

## 📝 Step 1: Create Table & Functions (2 minutes)

### Instructions:
1. Click **"+ New query"** in SQL Editor
2. Open file: **`supabase/migrations/20251029_workout_library.sql`**
3. **Copy entire file** (179 lines, 6.3 KB)
4. **Paste** into SQL Editor
5. Click **"Run"** or press **Cmd+Enter**

### Expected Output:
```
Success. No rows returned
```

### What This Creates:
- ✅ `workout_library` table with validation constraints
- ✅ 5 indexes (sport, phase, zone, focus_tags)
- ✅ 4 RLS policies (read-only for authenticated users)
- ✅ 3 helper functions:
  - `get_workouts_by_sport_phase()`
  - `get_workouts_by_zone()`
  - `search_workouts_by_tags()`

---

## 📊 Step 2: Seed 85 Workouts (2 minutes)

### Instructions:
1. Click **"+ New query"** in SQL Editor
2. Open file: **`supabase/migrations/20251029_seed_workout_library.sql`**
3. **Copy entire file** (331 lines, 75.9 KB)
4. **Paste** into SQL Editor
5. Click **"Run"** or press **Cmd+Enter**

### Expected Output:
```
DELETE 0 (if no previous workouts)

-- Then verification queries show:

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

Duration distribution:
20-30 min  | 15
31-45 min  | 27
46-60 min  | 29
61-90 min  | 13
91+ min    | 1
```

### What This Does:
- ✅ Clears any existing workouts (DELETE)
- ✅ Inserts 85 workouts with complete structure
- ✅ Runs automatic verification queries
- ✅ Shows distribution statistics

---

## ✅ Step 3: Verify Deployment (1 minute)

### Instructions:
1. Click **"+ New query"** in SQL Editor
2. Open file: **`scripts/verify-workout-library.sql`**
3. **Copy entire file**
4. **Paste** into SQL Editor
5. Click **"Run"** or press **Cmd+Enter**

### Expected Results:

**Query 1: Table exists**
```
table_exists: true
```

**Query 2: Count total workouts**
```
total_workouts: 85
```

**Query 3: Distribution by Sport**
```
bike   | 25 | 29.4%
run    | 23 | 27.1%
strength | 17 | 20.0%
swim   | 20 | 23.5%
```

**Query 4: Distribution by Phase**
```
base     | 25 | 29.4%
build    | 27 | 31.8%
peak     | 16 | 18.8%
recovery | 8  | 9.4%
taper    | 9  | 10.6%
```

**Query 7-9: Helper Functions**
- Should return 5 results each showing workouts

**Query 10: RLS Policies**
```
workout_library_read_all    | SELECT | authenticated
workout_library_no_insert   | INSERT | (prevents all)
workout_library_no_update   | UPDATE | (prevents all)
workout_library_no_delete   | DELETE | (prevents all)
```

---

## 🎯 Success Criteria Checklist

After running all 3 steps, verify:

- [x] Table `workout_library` exists
- [x] 85 workouts seeded
- [x] All sports present: bike (25), run (23), swim (20), strength (17)
- [x] All phases present: base, build, peak, taper, recovery
- [x] Zone distribution: Z2 (27), Strength (17), Z4 (15), Z3 (13), Z5 (7), Z1 (6)
- [x] 3 helper functions work
- [x] RLS policies prevent modifications
- [x] Only SELECT allowed for authenticated users

---

## 🔧 Troubleshooting

### Error: "relation update_updated_at_column does not exist"

**Fix:** Remove lines 56-59 from `20251029_workout_library.sql`:
```sql
-- Comment out the trigger:
-- CREATE TRIGGER update_workout_library_updated_at
--   BEFORE UPDATE ON public.workout_library
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();
```

### Error: "duplicate key value" or "table already exists"

**Fix:** Drop the table first:
```sql
DROP TABLE IF EXISTS public.workout_library CASCADE;
```
Then re-run Step 1.

### Error: "permission denied"

**Fix:** Make sure you're logged into the correct Supabase project and have database permissions.

---

## 📁 File Locations

All files are in your repository:

1. **Table Schema:**
   `supabase/migrations/20251029_workout_library.sql`
   (179 lines, 6.3 KB)

2. **Seed Data:**
   `supabase/migrations/20251029_seed_workout_library.sql`
   (331 lines, 75.9 KB)

3. **Verification:**
   `scripts/verify-workout-library.sql`
   (60+ lines with 10 verification queries)

---

## 🚦 After Deployment

Once verified, you can:

1. ✅ **Use in Sprint 2 Plan Generation:**
   ```typescript
   const { data } = await supabase
     .from('workout_library')
     .select('*')
     .eq('sport', 'run')
     .eq('phase', 'base');
   ```

2. ✅ **Query with helper functions:**
   ```sql
   SELECT * FROM get_workouts_by_sport_phase('bike', 'build');
   SELECT * FROM get_workouts_by_zone('run', 'z4', 60);
   SELECT * FROM search_workouts_by_tags('swim', ARRAY['endurance']);
   ```

3. ✅ **Move to next Sprint 1.5 task:**
   - GAP-1: Onboarding Persistence
   - GAP-6/7: RLS Policies

---

## ⏱️ Deployment Checklist

- [ ] Step 1: Run `20251029_workout_library.sql` (table creation)
- [ ] Verify: "Success. No rows returned"
- [ ] Step 2: Run `20251029_seed_workout_library.sql` (85 workouts)
- [ ] Verify: See workout distribution statistics
- [ ] Step 3: Run `verify-workout-library.sql` (verification)
- [ ] Verify: All 10 queries return expected results
- [ ] Success: Table exists, 85 workouts loaded, helper functions work

---

**Ready to start? Open the SQL Editor and begin with Step 1!**

https://supabase.com/dashboard/project/xgegukbclypvohdrwufa/sql
