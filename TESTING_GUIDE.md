# Testing Guide: GAP-1, GAP-2, GAP-3 Features

**Last Updated:** 2025-10-30
**Sprint:** 1.5 - Foundation & User Lifecycle

---

## Quick Start

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if needed)
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
open http://localhost:3000
```

---

## What to Test

### ✅ GAP-2: Session Management (Auto-Refresh)

**What it does:** Automatically refreshes your authentication session before it expires, keeping you logged in.

**How to test:**

1. **Navigate to test page:**
   ```
   http://localhost:3000/test-session
   ```

2. **What you'll see:**
   - Session status widget showing:
     - ✅ Session active
     - User email
     - Time until expiration
     - Last refresh timestamp
   - Auto-refresh countdown timer
   - Manual "Refresh Now" button

3. **Test auto-refresh:**
   - Watch the countdown timer
   - Session should auto-refresh at 5-minute mark
   - "Last refresh" timestamp updates
   - No interruption to your experience

4. **Test in cockpit:**
   ```
   http://localhost:3000/cockpit
   ```
   - Check session widget in top-right corner
   - Verify auto-refresh works while using app

**Expected behavior:**
- ✅ Session never expires while you're active
- ✅ Countdown shows time until next refresh
- ✅ Manual refresh button works immediately
- ✅ No login redirects during active use

---

### ✅ GAP-3: Workout Library (85 Workouts)

**What it does:** Provides a database of 85 professionally designed workouts for training plan generation.

**How to test:**

1. **Check database directly:**
   - Go to Supabase Dashboard: https://supabase.com/dashboard/project/xgegukbclypvohdrwufa/editor
   - Select `workout_library` table
   - Verify 85 rows exist

2. **View distribution:**
   - **Sports:** Bike (25), Run (23), Swim (20), Strength (17)
   - **Phases:** Base, Build, Peak, Taper, Recovery
   - **Zones:** Z1-Z5, Strength

3. **Test helper functions (SQL Editor):**
   ```sql
   -- Get all bike base workouts
   SELECT * FROM get_workouts_by_sport_phase('bike', 'base');

   -- Get run workouts under 60 minutes in zone 4
   SELECT * FROM get_workouts_by_zone('run', 'z4', 60);

   -- Search workouts by tags
   SELECT * FROM search_workouts_by_tags('swim', ARRAY['endurance']);
   ```

**Expected behavior:**
- ✅ 85 workouts in database
- ✅ All sports represented
- ✅ Workouts have complete structure (title, description, segments)
- ✅ Helper functions return relevant workouts

**Files to reference:**
- `library/workouts.json` - Source data (85 workouts)
- `supabase/migrations/20251029_workout_library.sql` - Table schema
- `supabase/migrations/20251029_seed_workout_library.sql` - Seeded data

---

### ✅ GAP-1: Onboarding Persistence

**What it does:** Saves your onboarding data to the database as you progress through the steps.

**How to test - Main Onboarding Flow:**

1. **Start onboarding:**
   ```
   http://localhost:3000/onboarding
   ```

2. **Step 1: Profile**
   - Fill out: Name, Date of Birth, Experience Level, Weekly Hours, Training Days
   - Click "Next Step"
   - **Watch for:**
     - ✅ Loading spinner appears
     - ✅ Button disabled during save
     - ✅ Advances to next step after save

3. **Verify data saved:**
   - Open Supabase Dashboard
   - Go to `athlete_profiles` table
   - Find your entry (search by email)
   - ✅ Confirm data matches what you entered

4. **Test page refresh:**
   - Refresh the page (F5 or Cmd+R)
   - **Expected:** Page reloads but data is NOT lost
   - Note: Current implementation saves incrementally but doesn't reload on page refresh yet

5. **Step 2: Goals/Races**
   - Add a race (date, type, priority, location)
   - Click "Next Step"
   - **Watch for:** Loading spinner → Success

6. **Verify race saved:**
   - Check `race_calendar` table in Supabase
   - Find your race entry
   - ✅ Confirm race details match

7. **Step 3-7: Continue through flow**
   - Complete remaining steps
   - Each "Next Step" saves data
   - Watch for loading feedback

**How to test - Quick Start Flow:**

1. **Start quick start:**
   ```
   http://localhost:3000/onboarding/quick-start
   ```

2. **Fill out quick form:**
   - Choose race date
   - Select race type
   - Set experience level
   - Configure preferences

3. **Click "Generate My Training Plan"**
   - **Watch for:**
     - ✅ Loading spinner with "Generating plan..."
     - ✅ Button disabled during save
     - ✅ All data saves at once (profile + preferences + race)

4. **Verify all data saved:**
   - Check `athlete_profiles` table
   - Check `athlete_preferences` table
   - Check `race_calendar` table
   - ✅ All should have your data

**Test error handling:**

1. **Simulate auth error:**
   - Clear your cookies/session
   - Try to save onboarding data
   - **Expected:** Error message appears, redirects to login after 2 seconds

2. **Test validation errors:**
   - Try entering invalid data (e.g., future date of birth)
   - **Expected:** Client-side validation prevents submission OR API returns clear error message

**Test loading states:**

1. During any save operation:
   - ✅ Button shows spinner
   - ✅ Button text changes to "Saving..."
   - ✅ Button is disabled (prevents double-click)

**Expected behavior:**
- ✅ Data persists to database on each step
- ✅ Loading spinners provide feedback
- ✅ Error messages are clear and actionable
- ✅ Can complete onboarding over multiple sessions
- ✅ Quick start saves all data in one operation

---

## Database Tables to Check

Access Supabase: https://supabase.com/dashboard/project/xgegukbclypvohdrwufa/editor

### 1. athlete_profiles
**What to check:**
- Your email
- Name (first + last combined)
- Date of birth (YYYY-MM-DD)
- Experience level (beginner/intermediate/advanced/elite)
- Available hours per week
- Training days per week
- Optional: FTP, threshold pace, max HR

### 2. athlete_preferences
**What to check:**
- Athlete ID matches your profile
- Training time preference
- Weekly availability (Monday-Sunday booleans)
- Metric preferences (km/mi, m/ft, c/f)
- Equipment flags (power meter, HR monitor, trainer, pool)

### 3. race_calendar
**What to check:**
- Race date (future date)
- Race type (sprint, olympic, 70.3, 140.6, etc.)
- Priority (A, B, or C)
- Race name and location (if provided)
- Status (planned by default)

### 4. athlete_constraints
**What to check:**
- Constraint type (injury, equipment_limitation, time_restriction)
- Affected disciplines (array: run, bike, swim, strength)
- Severity (minor, moderate, major)
- Start/end dates
- Description

### 5. workout_library
**What to check:**
- 85 total workouts
- Distribution across sports
- Complete structure_json for each workout

---

## Testing Workflow

### Complete End-to-End Test

1. **Setup:**
   ```bash
   npm run dev
   ```

2. **Create account (if needed):**
   - Navigate to signup
   - Create test account
   - Verify email (if required)

3. **Test GAP-2 (Session):**
   - Go to `/test-session`
   - Verify session widget shows active session
   - Watch countdown timer
   - Test manual refresh button

4. **Test GAP-1 (Onboarding):**
   - Go to `/onboarding`
   - Complete all steps, watching for:
     - Loading spinners
     - Successful saves
     - Navigation between steps
   - After each step, check Supabase tables

5. **Test Quick Start:**
   - Go to `/onboarding/quick-start`
   - Fill out form
   - Generate plan
   - Verify all data saved

6. **Test GAP-3 (Workout Library):**
   - Open Supabase SQL Editor
   - Run verification queries
   - Test helper functions

7. **Test Data Persistence:**
   - Complete onboarding halfway
   - Close browser
   - Reopen and navigate back to onboarding
   - **Future:** Data should reload (not implemented yet)

---

## Common Issues & Solutions

### Issue: "Session expired" error
**Solution:** Your auth session timed out. Log in again. GAP-2 should prevent this!

### Issue: "Profile not found" error
**Solution:** You need to complete Step 1 (Profile) before other steps can save.

### Issue: Data doesn't appear in database
**Solution:**
- Check you're logged in (valid session)
- Verify loading spinner appeared (save was attempted)
- Check browser console for errors
- Verify Supabase RLS policies allow your user

### Issue: Loading spinner stuck
**Solution:**
- Check browser console for errors
- Verify API endpoint is responding
- Check Supabase connection
- Try refreshing page and retrying

### Issue: Can't find workout library data
**Solution:**
- Verify you ran the seed migration
- Check correct Supabase project (momentom-app)
- Run verification queries from `scripts/verify-workout-library.sql`

---

## API Endpoints (for manual testing)

You can test APIs directly using browser DevTools or tools like Postman:

### Profile
```bash
# Create/update profile
POST http://localhost:3000/api/athlete/profile
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User",
  "date_of_birth": "1990-01-01",
  "experience_level": "intermediate",
  "available_hours_per_week": 10,
  "training_days_per_week": 5
}

# Get profile
GET http://localhost:3000/api/athlete/profile
```

### Preferences
```bash
# Create/update preferences
POST http://localhost:3000/api/athlete/preferences
Content-Type: application/json

{
  "preferred_training_time": "morning",
  "available_monday": true,
  "available_tuesday": true,
  "available_wednesday": true,
  "available_thursday": true,
  "available_friday": true,
  "available_saturday": false,
  "available_sunday": false,
  "distance_unit": "km",
  "elevation_unit": "m",
  "temperature_unit": "c",
  "has_power_meter": false,
  "has_heart_rate_monitor": true,
  "has_indoor_trainer": false,
  "has_pool_access": true
}

# Get preferences
GET http://localhost:3000/api/athlete/preferences
```

### Races
```bash
# Create races
POST http://localhost:3000/api/races
Content-Type: application/json

{
  "races": [
    {
      "race_date": "2025-07-15",
      "race_type": "olympic",
      "priority": "A",
      "race_name": "Lake Placid Triathlon",
      "location": "Lake Placid, NY"
    }
  ]
}

# Get all races
GET http://localhost:3000/api/races

# Delete race
DELETE http://localhost:3000/api/races/[race_id]
```

---

## Success Criteria

After testing, you should verify:

### GAP-2: Session Management ✅
- [ ] Session widget shows active session
- [ ] Countdown timer counts down correctly
- [ ] Auto-refresh happens at 5-minute mark
- [ ] Manual refresh button works
- [ ] No unexpected logouts during testing

### GAP-3: Workout Library ✅
- [ ] 85 workouts in database
- [ ] All 4 sports represented
- [ ] Helper functions return correct results
- [ ] Workouts have complete structure

### GAP-1: Onboarding Persistence ✅
- [ ] Profile saves on Step 1
- [ ] Races save on Step 2
- [ ] Preferences save on Step 3
- [ ] Constraints save on Step 6
- [ ] Loading spinners appear during saves
- [ ] Error messages display on failures
- [ ] Quick start saves all data at once
- [ ] Data appears in Supabase tables

---

## Next Steps After Testing

1. **Report Issues:** If you find bugs, note:
   - What you were doing
   - What you expected
   - What actually happened
   - Any error messages
   - Browser console logs

2. **Verify in Production:** After testing locally, deploy to staging/production and repeat tests

3. **User Acceptance Testing:** Have real users test the onboarding flow

4. **Monitor:** Watch for errors in production logs

---

## Quick Reference

**Dev Server:**
```bash
npm run dev
```

**Supabase Dashboard:**
https://supabase.com/dashboard/project/xgegukbclypvohdrwufa

**Key URLs:**
- Main app: http://localhost:3000
- Onboarding: http://localhost:3000/onboarding
- Quick Start: http://localhost:3000/onboarding/quick-start
- Session Test: http://localhost:3000/test-session
- Cockpit: http://localhost:3000/cockpit

**Database Tables:**
- `athlete_profiles` - Profile data
- `athlete_preferences` - Training preferences
- `race_calendar` - Race goals
- `athlete_constraints` - Training limitations
- `workout_library` - 85 workout templates

---

**Happy Testing!** 🎉

If you encounter issues, check the browser console and Supabase logs for detailed error messages.
