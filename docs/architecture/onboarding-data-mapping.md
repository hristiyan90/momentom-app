# Onboarding Data Mapping

**Document:** `docs/architecture/onboarding-mapping.md`  
**Last Updated:** October 10, 2025  
**Purpose:** Map UI onboarding fields to database schema

---

## Overview

This document maps all fields collected in the onboarding UI (both Quick Start and Advanced Setup) to their corresponding database columns in the athlete data schema.

---

## Quick Start Onboarding Fields

### Step 1: Goals & Races

| UI Field | Database Table | Column | Type | Required | Default | Validation |
|----------|----------------|--------|------|----------|---------|------------|
| Training Mode (Race/Maintenance) | `athlete_preferences` | `focus_discipline` | TEXT | No | 'balanced' | enum: swim/bike/run/balanced |
| Race Priority (A/B/C) | `race_calendar` | `priority` | TEXT | Yes (if race mode) | - | enum: A/B/C |
| Race Type | `race_calendar` | `race_type` | TEXT | Yes (if race mode) | - | enum: sprint/olympic/half_iron/full_iron/other |
| Race Date | `race_calendar` | `race_date` | DATE | Yes (if race mode) | - | future date |
| Race Location | `race_calendar` | `location` | TEXT | No | null | - |
| Has Finish Time Goal | `race_calendar` | `goal_type` | TEXT | No | null | enum: finish/time/placement |
| Swim Time Goal | `race_calendar` | `goal_time_minutes` (derived) | INTEGER | No | null | Parse HH:MM:SS → minutes |
| Bike Time Goal | *Not stored separately* | - | - | - | - | Combined into total goal |
| Run Time Goal | *Not stored separately* | - | - | - | Combined into total goal |
| Focus Area (if maintenance) | `athlete_preferences` | `focus_discipline` | TEXT | Yes (if maintenance) | - | enum: endurance/strength/speed → balanced |

**Notes:**
- Quick Start only captures **one** race (the primary A-race)
- Maintenance mode maps focus area to `focus_discipline`
- Finish time goals are combined into total race time (not split by discipline in MVP)

### Step 2: Training Preferences

| UI Field | Database Table | Column | Type | Required | Default | Validation |
|----------|----------------|--------|------|----------|---------|------------|
| Rest Day | *Not in schema - App logic* | - | - | - | - | Used for plan generation |
| Weekly Hours | `athlete_profiles` | `available_hours_per_week` | DECIMAL(4,1) | Yes | - | 1.0-30.0 |
| Periodization (3:1 vs 2:1) | *Not in schema - App logic* | - | - | - | - | Used for plan generation |
| Start Date | *Not in schema - App logic* | - | - | - | - | Used for plan generation |

**Notes:**
- Weekly Hours: UI shows ranges ("3-5h", "6-8h"), need to **parse to midpoint** (e.g., "6-8" → 7.0)
- Rest day, periodization, and start date are **plan generation inputs**, not athlete profile data

### Step 3: Primary Metrics

| UI Field | Database Table | Column | Type | Required | Default | Validation |
|----------|----------------|--------|------|----------|---------|------------|
| Use Defaults (checkbox) | *Not stored* | - | - | - | - | If checked, use defaults below |
| Swim Metric | *Not in schema - Preferences/Config* | - | - | - | 'pace' | enum: pace/hr |
| Bike Metric | *Not in schema - Preferences/Config* | - | - | - | 'power' | enum: power/hr |
| Run Metric | *Not in schema - Preferences/Config* | - | - | - | 'pace' | enum: pace/power/hr |

**Notes:**
- Metric choices affect **workout display/targeting**, not stored in athlete_profiles
- May add to `athlete_preferences` table in future, but MVP uses defaults

---

## Advanced Setup Onboarding Fields

### Step 1: Basic Profile

| UI Field | Database Table | Column | Type | Required | Default | Validation |
|----------|----------------|--------|------|----------|---------|------------|
| First Name | `athletes` or `athlete_profiles` | `first_name` (if exists) | TEXT | Yes | - | - |
| Last Name | `athletes` or `athlete_profiles` | `last_name` (if exists) | TEXT | No | null | - |
| Date of Birth | `athlete_profiles` | `age` (derived) | INTEGER | Yes | - | Calculate from DoB: 13-99 |
| Sex at Birth | `athlete_profiles` | `gender` | TEXT | Yes | - | enum: male/female |
| Units | `athlete_preferences` | `unit_system` | TEXT | Yes | 'metric' | enum: metric/imperial |
| Height | `athlete_profiles` | `height_cm` | INTEGER | Yes | - | 100-250 cm OR convert from ft |
| Weight | `athlete_profiles` | `weight_kg` | DECIMAL(5,2) | Yes | - | 30-200 kg OR convert from lbs |
| Timezone | `athlete_preferences` | `timezone` | TEXT | Yes | 'UTC' | IANA timezone string |

**Notes:**
- `first_name` and `last_name` may be in `athletes` table or `athlete_profiles` (confirm schema)
- **Age is derived** from Date of Birth: `EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))`
- **Unit conversion** must happen before storage (always store in metric)

### Step 2: Goals & Races

**Same as Quick Start Goals step**, plus:

| UI Field | Database Table | Column | Type | Required | Default | Validation |
|----------|----------------|--------|------|----------|---------|------------|
| Most Recent Race (checkbox) | `race_calendar` | `status` | TEXT | No | 'planned' | If past race, set to 'completed' |
| Recent Race Sport | `race_calendar` | `race_type` (infer) | TEXT | No (if has recent) | - | Map sport → distance |
| Recent Race Distance | `race_calendar` | `race_type` | TEXT | No (if has recent) | - | enum values |
| Recent Race Result | `race_calendar` | `goal_time_minutes` (actual) | INTEGER | No | null | Parse time → minutes |
| Recent Race Split Times | *Not stored in MVP* | - | - | - | - | Future: session table linkage |

**Notes:**
- Advanced setup allows adding **past race** results for baseline estimation
- Past race sets `status='completed'` and `race_date` in past

### Step 3: Training History

| UI Field | Database Table | Column | Type | Required | Default | Validation |
|----------|----------------|--------|------|----------|---------|------------|
| Weekly Hours (last 6mo) | `athlete_profiles` | `available_hours_per_week` | DECIMAL(4,1) | Yes | - | Parse range → midpoint |
| Experience Level | `athlete_profiles` | `experience_level` | TEXT | Yes | - | enum: beginner/intermediate/competitive → advanced |
| Current Volume | *Duplicate of weekly hours* | - | - | - | - | Same as weekly hours field |
| Periodization | *Plan generation input* | - | - | - | - | Not stored in profile |
| Rest Day | *Plan generation input* | - | - | - | - | Not stored in profile |
| Start Date | *Plan generation input* | - | - | - | - | Not stored in profile |

**Notes:**
- "Competitive" experience level in UI maps to "advanced" in database enum
- UI shows "competitive" but schema uses "beginner/intermediate/advanced/elite"

### Step 4: Training Preferences

**Same as Quick Start Preferences step**

### Step 5: Primary Metrics & Thresholds

| UI Field | Database Table | Column | Type | Required | Default | Validation |
|----------|----------------|--------|------|----------|---------|------------|
| Swim Metric (pace/hr) | *Preferences* | - | - | - | 'pace' | - |
| Bike Metric (power/hr) | *Preferences* | - | - | - | 'power' | - |
| Run Metric (pace/power/hr) | *Preferences* | - | - | - | 'pace' | - |
| I Know My Thresholds (checkbox) | *Conditional trigger* | - | - | - | false | Shows threshold fields if true |
| Critical Swim Speed (CSS) | `athlete_profiles` | `swim_css_pace_min_per_100m` | DECIMAL(4,2) | No | null | Parse MM:SS/100m → decimal |
| Functional Threshold Power (FTP) | `athlete_profiles` | `ftp_watts` | INTEGER | No | null | 50-500 watts |
| Lactate Threshold HR (LTHR) | `athlete_profiles` | `max_heart_rate` *or custom* | INTEGER | No | null | 100-220 bpm |
| Lactate Threshold Pace (LTP) | `athlete_profiles` | `threshold_pace_min_per_km` | DECIMAL(4,2) | No | null | Parse MM:SS/km → decimal |

**Notes:**
- Thresholds are **optional** in onboarding
- If not provided, plan will include testing protocols in early weeks
- **Parse time formats carefully**: "1:30/100m" → 1.50 (decimal minutes)

### Step 6: Understanding Readiness

**No data collection** - Educational step only

### Step 7: Review & Confirm

**No new data** - Display summary for user review

### Step 8: Generate Plan

**No profile data** - Triggers plan generation algorithm

---

## Data Transformation Rules

### Time Parsing

**CSS (Critical Swim Speed):**
- UI format: "1:30/100m" (MM:SS per 100m)
- Parse to: 1.50 (decimal minutes)
- Storage: `DECIMAL(4,2)` in `swim_css_pace_min_per_100m`

**LTP (Lactate Threshold Pace):**
- UI format: "4:00/km" (MM:SS per km)
- Parse to: 4.00 (decimal minutes)
- Storage: `DECIMAL(4,2)` in `threshold_pace_min_per_km`

**Race Time Goals:**
- UI format: "HH:MM:SS" (e.g., "02:30:45")
- Parse to: 150 (total minutes: 2*60 + 30)
- Storage: `INTEGER` in `goal_time_minutes`

### Unit Conversion

**Height:**
- If `units='Imperial'`: convert feet to cm (1 ft = 30.48 cm)
- Storage: Always cm in `height_cm`

**Weight:**
- If `units='Imperial'`: convert lbs to kg (1 lb = 0.453592 kg)
- Storage: Always kg in `weight_kg`

### Range to Value

**Weekly Hours:**
- UI ranges: "3-5", "6-8", "9-12", "13-16", "17+"
- Parse to midpoint: "6-8" → 7.0, "17+" → 17.0
- Storage: `DECIMAL(4,1)` in `available_hours_per_week`

### Experience Level Mapping

- UI "Beginner" → DB "beginner"
- UI "Intermediate" → DB "intermediate"  
- UI "Competitive" → DB "advanced" (not "competitive")
- UI "Elite" (if added) → DB "elite"

---

## Missing Fields Analysis

### Fields in UI but NOT in Schema

1. **First Name / Last Name**: Not in `athlete_profiles` table
   - **Recommendation**: Add to `athletes` table or `athlete_profiles`

2. **Rest Day Preference**: UI collects, but not stored
   - **Recommendation**: Add `preferred_rest_day` to `athlete_preferences` (TEXT enum: monday-sunday)

3. **Periodization Style**: UI collects (3:1 vs 2:1), but not stored
   - **Recommendation**: Add `periodization_style` to `athlete_preferences` (TEXT enum: 3:1, 2:1)

4. **Plan Start Date**: UI collects, but not stored in profile
   - **Recommendation**: Store in `training_plans` table when plan generated

5. **Primary Metrics**: UI collects (pace/power/hr per discipline), but not stored
   - **Recommendation**: Add to `athlete_preferences`:
     - `swim_primary_metric` (TEXT enum: pace, hr)
     - `bike_primary_metric` (TEXT enum: power, hr)
     - `run_primary_metric` (TEXT enum: pace, power, hr)

### Fields in Schema but NOT in UI

1. **Years Training**: `athlete_profiles.years_training` (INTEGER)
   - **Recommendation**: Optional field in Advanced Setup, Step 3 (Training History)

2. **Max Heart Rate**: `athlete_profiles.max_heart_rate` (INTEGER)
   - **Recommendation**: Optional field in Advanced Setup, Step 5 (Thresholds)
   - Note: UI has LTHR but not max HR

3. **Resting Heart Rate**: `athlete_profiles.resting_heart_rate` (INTEGER)
   - **Recommendation**: Optional field in Advanced Setup, Step 5 (Thresholds)

4. **Equipment Access**: `has_bike`, `has_pool_access`, `has_gym_access`
   - **Recommendation**: Add to Advanced Setup, Step 4 (optional)

5. **Preferred Training Time**: `athlete_profiles.preferred_training_time`
   - **Recommendation**: Add to Advanced Setup, Step 4 (morning/afternoon/evening/flexible)

6. **Training Days Per Week**: `athlete_profiles.training_days_per_week`
   - **Recommendation**: Derive from `available_hours_per_week` or add explicit UI field

7. **Focus Discipline**: `athlete_preferences.focus_discipline`
   - **Partially collected**: Maintenance mode asks for focus area, but race mode doesn't
   - **Recommendation**: Add to race mode as well (which discipline to emphasize)

---

## Schema Refinements Needed

Based on UI analysis, recommend these schema changes:

### Add to `athletes` or `athlete_profiles`:
```sql
ALTER TABLE athlete_profiles ADD COLUMN first_name TEXT;
ALTER TABLE athlete_profiles ADD COLUMN last_name TEXT;
ALTER TABLE athlete_profiles ADD COLUMN date_of_birth DATE;
ALTER TABLE athlete_profiles ADD COLUMN training_days_per_week INTEGER CHECK (training_days_per_week BETWEEN 1 AND 7);
```

### Add to `athlete_preferences`:
```sql
ALTER TABLE athlete_preferences ADD COLUMN preferred_rest_day TEXT CHECK (preferred_rest_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));
ALTER TABLE athlete_preferences ADD COLUMN periodization_style TEXT CHECK (periodization_style IN ('3:1', '2:1'));
ALTER TABLE athlete_preferences ADD COLUMN swim_primary_metric TEXT CHECK (swim_primary_metric IN ('pace', 'hr'));
ALTER TABLE athlete_preferences ADD COLUMN bike_primary_metric TEXT CHECK (bike_primary_metric IN ('power', 'hr'));
ALTER TABLE athlete_preferences ADD COLUMN run_primary_metric TEXT CHECK (run_primary_metric IN ('pace', 'power', 'hr'));
```

### Add to `race_calendar`:
```sql
-- Split goal times already handled by swim/bike/run distance fields
-- No changes needed
```

---

## Implementation Checklist

- [ ] Add missing columns to schema (first_name, last_name, date_of_birth, etc.)
- [ ] Implement time parsing functions (CSS, LTP, race times)
- [ ] Implement unit conversion functions (height, weight)
- [ ] Implement range-to-value parsing (weekly hours)
- [ ] Map experience level correctly (competitive → advanced)
- [ ] Calculate age from date of birth on save
- [ ] Store timezone from browser auto-detect
- [ ] Default equipment access to false if not collected
- [ ] Handle optional threshold fields (null if not provided)
- [ ] Create plan generation trigger on onboarding complete
- [ ] Test both Quick Start and Advanced Setup flows end-to-end

---

## Summary

**Quick Start collects:**
- Race goal OR maintenance focus
- Weekly training hours
- Rest day, periodization, start date (plan generation only)
- Metric preferences (defaults recommended)

**Advanced Setup adds:**
- Full profile (name, DoB, sex, height, weight, timezone)
- Past race history (optional)
- Experience level and training volume
- Fitness thresholds (CSS, FTP, LTHR, LTP) - optional

**Total mappable fields:** ~20 to database, ~5 plan generation only

**Schema gaps:** Need to add first_name, last_name, date_of_birth, preferred_rest_day, periodization_style, primary_metric fields