# B3e-T2: GarminDB Database Schema Analysis and Data Mapping

**Task:** B3e-T2 - Database Schema Analysis and Data Mapping  
**Feature:** B3e GarminDB Data Integration  
**Date:** 2025-09-26  
**Status:** Complete

## Executive Summary

This document provides comprehensive analysis of GarminDB SQLite database structure and defines precise field mappings to Momentom's PostgreSQL schema. Analysis covers 1,000+ activities spanning 2021-2025 with detailed performance metrics, wellness data, and granular tracking records.

**Key Findings:**
- **4 primary databases** with 24 tables containing activity and wellness data
- **97% data quality** (970+ activities successfully parsed)
- **3.6M+ granular records** with GPS, HR, power, and pace data
- **9 distinct sport types** requiring mapping to Momentom's 5 categories
- **Complex timezone handling** needed for accurate date conversion

## Database Structure Analysis

### 1. GarminDB Database Files

| Database | Size | Purpose | Key Tables |
|----------|------|---------|------------|
| `garmin_activities.db` | 448 MB | Activity details & performance metrics | activities, activity_laps, activity_records |
| `garmin_monitoring.db` | 113 MB | Daily wellness monitoring | monitoring, monitoring_hr, monitoring_intensity |
| `garmin.db` | 74 MB | Sleep, weight, RHR, device info | sleep, weight, resting_hr, daily_summary |
| `garmin_summary.db` | 6.8 MB | Aggregated statistics | days_summary, weeks_summary, months_summary |

### 2. Core Activities Schema (`garmin_activities.db`)

#### 2.1 `activities` Table (Primary Activity Data)

**Structure:** 57 columns, 1,000 records

| Column | Type | Purpose | Sample Value | Mapping Notes |
|--------|------|---------|--------------|---------------|
| `activity_id` | VARCHAR(PK) | Unique identifier | "8098161323" | Maps to sessions.session_id |
| `name` | VARCHAR | Activity title | "Wokingham Running" | Maps to sessions.title |
| `sport` | VARCHAR | Sport type | "running" | Requires mapping to Momentom sports |
| `sub_sport` | VARCHAR | Sport subtype | "generic" | Additional categorization |
| `start_time` | DATETIME | Activity start | "2022-01-11 10:29:23" | Maps to sessions.date (extract date) |
| `stop_time` | DATETIME | Activity end | "2022-01-11 11:37:43" | Used to calculate duration |
| `elapsed_time` | TIME | Total duration | "01:06:51.670000" | Maps to sessions.actual_duration_min |
| `moving_time` | TIME | Active duration | "00:58:53.945000" | More accurate for training time |
| `distance` | FLOAT | Distance (km) | 9.02165 | Maps to sessions.actual_distance_m (×1000) |
| `calories` | INTEGER | Energy expenditure | 775 | Supplementary metric |
| `avg_hr` | INTEGER | Average heart rate | 166 | Key performance metric |
| `max_hr` | INTEGER | Maximum heart rate | 188 | Peak intensity indicator |
| `avg_speed` | FLOAT | Average speed | 9.19 | Pace calculation base |
| `max_speed` | FLOAT | Maximum speed | 15.52 | Peak performance |
| `training_effect` | FLOAT | Aerobic benefit | 4.1 | Training load indicator |
| `anaerobic_training_effect` | FLOAT | Anaerobic benefit | 0.7 | High-intensity impact |

**Heart Rate Zones:** 10 columns (hrz_1_hr through hrz_5_time) providing detailed zone distribution

#### 2.2 `activity_laps` Table (Interval Data)

**Structure:** 51 columns, 8,592 records  
**Relationship:** Multiple laps per activity (1:many)

| Column | Type | Purpose | Sample Value |
|--------|------|---------|--------------|
| `activity_id` | VARCHAR(FK) | Parent activity | "8098161323" |
| `lap` | INTEGER | Lap number | 0, 1, 2... |
| `start_time` | DATETIME | Lap start | "2022-01-11 10:29:23" |
| `distance` | FLOAT | Lap distance | 1.0 |
| `avg_hr` | INTEGER | Lap avg HR | 166 |

**Use Case:** Detailed interval analysis, lap splits, pacing analysis

#### 2.3 `activity_records` Table (Granular GPS/Sensor Data)

**Structure:** 12 columns, 3,612,524 records  
**Granularity:** Second-by-second tracking data

| Column | Type | Purpose | Sample Value |
|--------|------|---------|--------------|
| `activity_id` | VARCHAR(FK) | Parent activity | "8098161323" |
| `record` | INTEGER | Record sequence | 0, 1, 2... |
| `timestamp` | DATETIME | Record time | "2022-01-11 10:29:23" |
| `position_lat` | FLOAT | GPS latitude | 51.4061196 |
| `position_long` | FLOAT | GPS longitude | -0.8372274 |
| `hr` | INTEGER | Heart rate | 74 |
| `speed` | FLOAT | Instantaneous speed | 0.0 |
| `altitude` | FLOAT | Elevation | 50.8 |

**Use Case:** GPS tracks, detailed performance analysis, power curves

### 3. Wellness Data Schema (`garmin.db`)

#### 3.1 `sleep` Table

| Column | Type | Purpose | Sample Value |
|--------|------|---------|--------------|
| `day` | DATE(PK) | Sleep date | "2025-04-15" |
| `start` | DATETIME | Sleep start | "2025-04-14 22:58:00" |
| `end` | DATETIME | Sleep end | "2025-04-15 06:56:00" |
| `total_sleep` | TIME | Total sleep time | "07:41:00" |
| `deep_sleep` | TIME | Deep sleep | "01:38:00" |
| `light_sleep` | TIME | Light sleep | "04:17:00" |
| `rem_sleep` | TIME | REM sleep | "01:46:00" |
| `score` | INTEGER | Sleep score | 87 |

#### 3.2 `resting_hr` Table

| Column | Type | Purpose | Sample Value |
|--------|------|---------|--------------|
| `day` | DATE(PK) | Measurement date | "2025-07-29" |
| `resting_heart_rate` | FLOAT | RHR value | 46.0 |

#### 3.3 `weight` Table

| Column | Type | Purpose | Sample Value |
|--------|------|---------|--------------|
| `day` | DATE(PK) | Measurement date | "2024-11-30" |
| `weight` | FLOAT | Weight (kg) | 72.5 |

## Field Mapping: GarminDB → Momentom

### Core Session Mapping

| Momentom Field | GarminDB Source | Transformation | Notes |
|----------------|-----------------|----------------|-------|
| `session_id` | `activities.activity_id` | UUID conversion | Generate new UUID, store original in metadata |
| `athlete_id` | *Static* | User-provided constant | Fixed for import batch |
| `date` | `activities.start_time` | DATE(start_time) | Extract date component, handle timezone |
| `sport` | `activities.sport` | Sport mapping function | See Sport Mapping section |
| `title` | `activities.name` | Direct copy or generate | Use name if present, generate if NULL |
| `planned_duration_min` | `NULL` | NULL | Historical data has no planned values |
| `planned_load` | `NULL` | NULL | Historical data has no planned values |
| `status` | *Static* | 'completed' | All historical activities are completed |
| `actual_duration_min` | `activities.moving_time` | TIME_TO_MINUTES(moving_time) | Convert TIME to integer minutes |
| `actual_distance_m` | `activities.distance` | distance * 1000 | Convert km to meters |
| `source_file_type` | *Static* | 'garmin' | Indicate import source |
| `source_ingest_id` | *Generate* | Link to batch import record | For traceability |

### Sport Mapping

| GarminDB Sport | Momentom Sport | Mapping Logic |
|----------------|----------------|---------------|
| `running` | `run` | Direct mapping |
| `walking` | `run` | Walking categorized as running |
| `cycling` | `bike` | Direct mapping |
| `swimming` | `swim` | Direct mapping |
| `fitness_equipment` | `strength` | Gym equipment → strength training |
| `snowboarding` | `strength` | Alternative sport → strength |
| `hiking` | `run` | Hiking categorized as running |
| `rock_climbing` | `strength` | Climbing → strength training |
| `UnknownEnumValue_54` | `strength` | Unknown sports → strength (fallback) |

### Performance Metrics Enhancement

Beyond basic session data, GarminDB provides rich metrics for enhanced features:

| Metric Category | GarminDB Fields | Storage Strategy |
|-----------------|-----------------|------------------|
| Heart Rate | `avg_hr`, `max_hr`, `hrz_*_time` | Store in session metadata JSON |
| Training Effect | `training_effect`, `anaerobic_training_effect` | Session metadata |
| Power (cycling) | Available in some records | Session metadata |
| Pace/Speed | `avg_speed`, `max_speed` | Calculate pace from speed |
| Environmental | `avg_temperature`, `ascent`, `descent` | Session metadata |

## Data Quality Assessment

### 1. Completeness Analysis

| Metric | Value | Impact |
|--------|-------|--------|
| **Total Activities** | 1,000 | Full dataset available |
| **Successfully Parsed** | 970+ (97%) | High success rate |
| **Parse Failures** | ~30 (3%) | Minimal data loss |
| **NULL Names** | 20 (2%) | Require title generation |
| **Date Range** | 2021-09-10 to 2025-08-29 | 4-year span |

### 2. Data Quality Issues

#### Critical Issues
1. **NULL Activity Names (20 records):** Require title generation strategy
2. **Timezone Inconsistency:** Mixed UTC/local timestamps need standardization
3. **Unknown Sport Types:** "UnknownEnumValue_54" requires fallback mapping

#### Minor Issues
1. **Parse Errors (~3%):** Some FIT files failed parsing due to timezone/format issues
2. **Missing Heart Rate Zones:** Some activities lack HR zone data
3. **Elevation Data Gaps:** Not all activities have altitude information

### 3. Edge Cases

| Edge Case | Count | Handling Strategy |
|-----------|-------|-------------------|
| Activities with 0 distance | 87 (fitness_equipment) | Allow 0 distance for gym workouts |
| Very short activities (<5 min) | TBD | Import all, filter in UI if needed |
| Very long activities (>10 hours) | TBD | Validate against realistic limits |
| Duplicate activity IDs | 0 | No duplicates found |

## Sample Transformation Queries

### 1. Basic Activity Import Query

```sql
-- Extract core session data from GarminDB
SELECT 
  activity_id as garmin_activity_id,
  CASE 
    WHEN name IS NOT NULL THEN name
    ELSE sport || ' - ' || DATE(start_time)
  END as title,
  DATE(start_time) as session_date,
  CASE sport
    WHEN 'running' THEN 'run'
    WHEN 'walking' THEN 'run'
    WHEN 'cycling' THEN 'bike'
    WHEN 'swimming' THEN 'swim'
    WHEN 'fitness_equipment' THEN 'strength'
    ELSE 'strength'
  END as mapped_sport,
  CAST((
    CAST(strftime('%H', moving_time) AS INTEGER) * 60 +
    CAST(strftime('%M', moving_time) AS INTEGER)
  ) AS INTEGER) as duration_minutes,
  CAST(distance * 1000 AS INTEGER) as distance_meters,
  avg_hr,
  max_hr,
  calories,
  training_effect,
  start_time,
  stop_time
FROM activities 
WHERE start_time IS NOT NULL
ORDER BY start_time;
```

### 2. Activity with Performance Metrics

```sql
-- Extract activity with detailed metrics for enhanced storage
SELECT 
  activity_id,
  json_object(
    'avg_hr', avg_hr,
    'max_hr', max_hr,
    'avg_speed_kmh', avg_speed,
    'max_speed_kmh', max_speed,
    'training_effect', training_effect,
    'anaerobic_training_effect', anaerobic_training_effect,
    'calories', calories,
    'avg_cadence', avg_cadence,
    'max_cadence', max_cadence,
    'elevation_gain_m', ascent,
    'elevation_loss_m', descent,
    'hr_zones', json_object(
      'zone_1_time_min', CAST((
        CAST(strftime('%H', hrz_1_time) AS INTEGER) * 60 +
        CAST(strftime('%M', hrz_1_time) AS INTEGER)
      ) AS INTEGER),
      'zone_2_time_min', CAST((
        CAST(strftime('%H', hrz_2_time) AS INTEGER) * 60 +
        CAST(strftime('%M', hrz_2_time) AS INTEGER)
      ) AS INTEGER),
      'zone_3_time_min', CAST((
        CAST(strftime('%H', hrz_3_time) AS INTEGER) * 60 +
        CAST(strftime('%M', hrz_3_time) AS INTEGER)
      ) AS INTEGER),
      'zone_4_time_min', CAST((
        CAST(strftime('%H', hrz_4_time) AS INTEGER) * 60 +
        CAST(strftime('%M', hrz_4_time) AS INTEGER)
      ) AS INTEGER),
      'zone_5_time_min', CAST((
        CAST(strftime('%H', hrz_5_time) AS INTEGER) * 60 +
        CAST(strftime('%M', hrz_5_time) AS INTEGER)
      ) AS INTEGER)
    )
  ) as performance_metrics
FROM activities
WHERE activity_id = '8098161323';
```

### 3. Wellness Data Extraction

```sql
-- Sleep data query
SELECT 
  day as date,
  json_object(
    'sleep_start', start,
    'sleep_end', end,
    'total_hours', ROUND(
      CAST(strftime('%H', total_sleep) AS REAL) + 
      CAST(strftime('%M', total_sleep) AS REAL) / 60, 1
    ),
    'deep_sleep_hours', ROUND(
      CAST(strftime('%H', deep_sleep) AS REAL) + 
      CAST(strftime('%M', deep_sleep) AS REAL) / 60, 1
    ),
    'rem_sleep_hours', ROUND(
      CAST(strftime('%H', rem_sleep) AS REAL) + 
      CAST(strftime('%M', rem_sleep) AS REAL) / 60, 1
    ),
    'sleep_score', score
  ) as sleep_data
FROM sleep 
WHERE total_sleep > '00:00:00'
ORDER BY day DESC;
```

### 4. Data Quality Validation Query

```sql
-- Validate data quality before import
SELECT 
  'Activities' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN name IS NULL THEN 1 END) as null_names,
  COUNT(CASE WHEN sport IS NULL THEN 1 END) as null_sports,
  COUNT(CASE WHEN start_time IS NULL THEN 1 END) as null_start_times,
  COUNT(CASE WHEN distance = 0 THEN 1 END) as zero_distance,
  MIN(start_time) as earliest_date,
  MAX(start_time) as latest_date
FROM activities

UNION ALL

SELECT 
  'Activity Laps' as table_name,
  COUNT(*) as total_records,
  NULL, NULL, NULL, NULL,
  MIN(start_time) as earliest_date,
  MAX(start_time) as latest_date
FROM activity_laps;
```

## Batch Processing Strategy

### 1. Processing Architecture

```
Phase 1: Data Extraction & Validation
├── Extract from GarminDB SQLite files
├── Validate data quality and completeness
├── Generate missing titles and handle NULLs
└── Create staging dataset

Phase 2: Data Transformation
├── Apply sport mapping
├── Convert time formats to minutes
├── Convert distances to meters
├── Generate JSON metadata for performance metrics
└── Create Momentom-compatible records

Phase 3: Database Import
├── Begin transaction
├── Batch insert sessions (500 records/batch)
├── Create ingest_staging records for traceability
├── Update athlete statistics
└── Commit or rollback on error
```

### 2. Batch Size Analysis

| Dataset | Records | Recommended Batch Size | Processing Time Est. |
|---------|---------|------------------------|---------------------|
| **Activities** | 1,000 | 100 records/batch | ~2-3 minutes |
| **Activity Laps** | 8,592 | 500 records/batch | ~3-4 minutes |
| **Activity Records** | 3.6M | 1,000 records/batch | ~15-20 minutes |
| **Sleep Data** | ~1,000 | 200 records/batch | ~1 minute |
| **Wellness Data** | ~500 each | 200 records/batch | ~30 seconds |

**Total Estimated Processing Time:** 20-30 minutes for complete import

### 3. Error Handling Strategy

| Error Type | Handling | Recovery Action |
|------------|----------|-----------------|
| **Parse Errors** | Log and skip | Continue with remaining records |
| **Constraint Violations** | Validate before insert | Fix data or mark as invalid |
| **Duplicate Keys** | Check existing records | Update or skip based on policy |
| **Timeout Errors** | Retry with smaller batches | Reduce batch size by 50% |
| **Database Errors** | Rollback transaction | Retry entire batch or fail |

### 4. Progress Tracking

```sql
-- Create import tracking table
CREATE TABLE import_progress (
  batch_id UUID PRIMARY KEY,
  table_name TEXT NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_succeeded INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running', -- running, completed, failed
  error_message TEXT
);
```

## Transformation Challenges & Solutions

### 1. Timezone Handling

**Challenge:** GarminDB timestamps may be in local timezone or UTC  
**Solution:** 
- Standardize all timestamps to UTC during import
- Store original timezone in metadata for reference
- Use session date (not time) for calendar display

### 2. Sport Mapping Ambiguity

**Challenge:** GarminDB has more sport types than Momentom (9 vs 5)  
**Solution:**
- Create comprehensive mapping table with fallbacks
- Store original sport in session metadata
- Allow manual recategorization in UI post-import

### 3. Performance Metrics Storage

**Challenge:** Rich GarminDB metrics don't fit Momentom's core schema  
**Solution:**
- Store core metrics in session fields (duration, distance)
- Store detailed metrics in session metadata JSON
- Enable gradual schema evolution for native support

### 4. Large Dataset Performance

**Challenge:** 3.6M+ granular records may overwhelm system  
**Solution:**
- Import summary data first (activities, laps)
- Store granular records separately for analysis features
- Implement lazy loading for detailed metrics

## Implementation Roadmap for T3-T6

### T3: Data Transformation Layer
**Deliverables:**
- Python/Node.js scripts for GarminDB → Momentom transformation
- Sport mapping utilities
- Time conversion and timezone handling
- JSON metadata generation for performance metrics

### T4: Batch Import Implementation  
**Deliverables:**
- API endpoints for batch import (`/api/import/garmin`)
- Progress tracking and error handling
- Transaction management for data integrity
- Import validation and rollback capabilities

### T5: Wellness Data Integration
**Deliverables:**
- Sleep data import to wellness tables
- RHR and weight data integration
- Daily summary aggregation
- Wellness trend analysis preparation

### T6: Testing and Validation
**Deliverables:**
- Comprehensive test suite with production data
- Data integrity validation
- Performance benchmarking
- User acceptance testing with real Garmin data

## Success Metrics

### Data Quality Targets
- ✅ **Import Success Rate:** ≥95% (Target: 970+ of 1,000 activities)
- ✅ **Data Completeness:** ≥98% of core fields populated
- ✅ **Sport Mapping Accuracy:** 100% of sports mapped to valid categories
- ✅ **Date Range Coverage:** Full 2021-2025 span maintained

### Performance Targets
- **Import Speed:** <30 minutes for 1,000+ activities
- **Memory Usage:** <2GB peak during import
- **Database Growth:** <500MB additional storage
- **Error Rate:** <1% for critical operations

### Functional Targets
- **Calendar Integration:** All activities visible in training calendar
- **Metrics Display:** Heart rate, pace, distance visible in session details
- **Search/Filter:** Activities searchable by sport, date, metrics
- **Data Integrity:** No corruption or loss during transformation

---

**Document Status:** Complete  
**Next Step:** Proceed to B3e-T3 (Data Transformation Layer Implementation)  
**Dependencies:** None - T2 analysis complete and ready for implementation
