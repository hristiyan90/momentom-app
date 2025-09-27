# Workout Data Seeding for Calendar Testing

This directory contains tools for generating realistic workout data to test the calendar integration.

## 🎯 Purpose

The B3c calendar integration needs realistic test data across multiple months to verify:
- Month navigation with actual session data
- Week view functionality with varied workouts
- Empty states when no sessions exist
- Different sports and workout types display correctly

## 📊 Generated Data

The seeding tools create **4 months of realistic training data** (June-September 2025):

### Training Phases
- **June 1 - July 15**: Base Building (8 hrs/week, mostly endurance)
- **July 16 - August 31**: Build Phase (10 hrs/week, more intensity)
- **September 1-30**: Peak/Race Prep (9 hrs/week, race-specific training)

### Workout Variety
- **Sports**: Running, Cycling, Swimming, Strength Training
- **Intensities**: Recovery, Endurance, Tempo, Threshold, VO2 Max
- **Durations**: 20 minutes to 3+ hours
- **Weekly Patterns**: 3-6 workouts per week with recovery weeks every 4th week
- **Realistic Status**: Past workouts marked as completed/skipped, future as planned

### Sample Workouts
- **Running**: Easy runs, tempo runs, intervals, long runs
- **Cycling**: Base rides, sweet spot, FTP intervals, century rides
- **Swimming**: Technique, threshold sets, distance swims
- **Strength**: Core work, sport-specific, power development

## 🛠️ Usage Options

### Option 1: API Endpoint (Recommended)

Start the development server and call the seeding endpoint:

```bash
# Start the dev server
npm run dev

# Run the seeding script
node scripts/seed-realistic-workouts.js

# Or call directly with curl
curl -X POST http://localhost:3000/api/dev/seed-workout-data
```

This generates **100-150 varied sessions** across 4 months with realistic training patterns.

### Option 2: SQL Migration

If you prefer direct database access:

```bash
# Apply the migration (if using Supabase CLI)
supabase db reset

# Or copy/paste the SQL from supabase/migrations/20250925_seed_realistic_workouts.sql
# into the Supabase SQL Editor
```

This creates a **representative sample** of ~70 sessions covering key patterns.

### Option 3: Manual Database Insert

Copy the SQL from `supabase/migrations/20250925_seed_realistic_workouts.sql` and run it directly in your database client.

## 🧪 Testing the Calendar

After seeding data:

1. **Navigate to the calendar page** (`/calendar`)
2. **Start date**: Should load September 2025 (where data exists)
3. **Test navigation**: 
   - Go back to June/July/August 2025 to see training progression
   - Navigate to other months (should show empty states)
4. **Test view modes**:
   - Month view: Should show session indicators on dates
   - Week view: Should display detailed session lists
5. **Test interactions**:
   - Click on sessions to see details
   - Use refresh button (should reload data)
   - Navigate between months (should trigger new API calls)

## 📅 Expected Results

### June 2025 (Base Building)
- 3-5 workouts per week
- Mostly endurance and recovery sessions
- Longer weekend sessions

### July 2025 (Build Phase)
- 4-6 workouts per week  
- More tempo and threshold work
- Increased weekly hours

### August 2025 (Peak Build)
- 4-6 workouts per week
- VO2 max intervals and race-specific work
- High intensity sessions

### September 2025 (Race Prep)
- 3-5 workouts per week
- Race simulation and tapering
- Shorter, sharper sessions toward month end

## 🔧 Troubleshooting

### No Data Appears
1. Check that the seeding completed successfully
2. Verify you're looking at the correct date range (June-September 2025)
3. Check browser console for API errors
4. Ensure the test athlete exists: `00000000-0000-0000-0000-000000000001`

### API Endpoint Fails
1. Verify development server is running (`npm run dev`)
2. Check Supabase connection
3. Ensure database migrations are applied
4. Check that the athlete table has the test athlete

### Database Permission Issues
1. Verify RLS policies allow the test athlete to access sessions
2. Check that the athlete exists in the athlete table
3. Ensure Supabase service role key has proper permissions

## 🧹 Cleanup

To remove all seeded data:

```sql
DELETE FROM public.sessions 
WHERE athlete_id = '00000000-0000-0000-0000-000000000001' 
AND date >= '2025-06-01' 
AND date <= '2025-09-30';
```

## 🔗 Related Files

- `/app/api/dev/seed-workout-data/route.ts` - API endpoint for data generation
- `/scripts/seed-realistic-workouts.js` - Node.js script to call the API
- `/supabase/migrations/20250925_seed_realistic_workouts.sql` - SQL migration
- `/app/calendar/page.tsx` - Calendar component that displays the data
- `/lib/hooks/useCalendarData.ts` - Data fetching hooks
- `/lib/utils/calendarMappers.ts` - Data transformation utilities
