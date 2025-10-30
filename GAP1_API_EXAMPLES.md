# GAP-1 API Testing Examples

Complete guide for testing the Onboarding Persistence API routes with curl examples.

---

## Prerequisites

```bash
# Set your environment variables
export API_BASE="http://localhost:3000"
export JWT_TOKEN="your-jwt-token-here"
export ATHLETE_ID="your-athlete-id-uuid"

# Or for production
export API_BASE="https://api.momentom.app"
```

---

## 1. Create Athlete Profile

### POST /api/athlete/profile

**Minimal Profile (Quick Start)**
```bash
curl -X POST "${API_BASE}/api/athlete/profile" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "athlete@example.com",
    "name": "John Doe",
    "date_of_birth": "1990-05-15",
    "experience_level": "intermediate",
    "available_hours_per_week": 10.0,
    "training_days_per_week": 5
  }'
```

**Complete Profile (Advanced Setup)**
```bash
curl -X POST "${API_BASE}/api/athlete/profile" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "athlete@example.com",
    "name": "Jane Smith",
    "date_of_birth": "1985-03-20",
    "experience_level": "advanced",
    "ftp_watts": 250,
    "threshold_pace_min_per_km": 4.2,
    "swim_css_pace_min_per_100m": 1.45,
    "max_heart_rate": 185,
    "resting_heart_rate": 48,
    "available_hours_per_week": 15.0,
    "training_days_per_week": 6
  }'
```

**Expected Response (200)**
```json
{
  "data": {
    "athlete_id": "uuid-here",
    "email": "athlete@example.com",
    "name": "John Doe",
    "date_of_birth": "1990-05-15",
    "experience_level": "intermediate",
    "ftp_watts": null,
    "threshold_pace_min_per_km": null,
    "swim_css_pace_min_per_100m": null,
    "max_heart_rate": null,
    "resting_heart_rate": null,
    "available_hours_per_week": 10.0,
    "training_days_per_week": 5,
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:00:00Z"
  }
}
```

**Error Examples**

Age too young (< 13):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Athlete must be at least 13 years old",
    "request_id": "req_abc123"
  }
}
```

Duplicate email:
```json
{
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email address is already registered",
    "request_id": "req_abc123"
  }
}
```

---

## 2. Create/Update Athlete Preferences

### POST /api/athlete/preferences

**Quick Start Preferences**
```bash
curl -X POST "${API_BASE}/api/athlete/preferences" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "focus_discipline": "balanced",
    "preferred_run_metric": "pace",
    "preferred_bike_metric": "power",
    "preferred_swim_metric": "pace",
    "monday_available": true,
    "tuesday_available": true,
    "wednesday_available": true,
    "thursday_available": true,
    "friday_available": true,
    "saturday_available": true,
    "sunday_available": false,
    "has_bike": true,
    "has_pool_access": true,
    "has_power_meter": true,
    "has_hr_monitor": true
  }'
```

**Advanced Setup Preferences**
```bash
curl -X POST "${API_BASE}/api/athlete/preferences" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "preferred_training_time": "morning",
    "focus_discipline": "bike",
    "preferred_run_metric": "pace",
    "preferred_bike_metric": "power",
    "preferred_swim_metric": "pace",
    "sunday_available": true,
    "monday_available": true,
    "tuesday_available": true,
    "wednesday_available": true,
    "thursday_available": true,
    "friday_available": true,
    "saturday_available": false,
    "has_bike": true,
    "has_pool_access": true,
    "has_power_meter": true,
    "has_hr_monitor": true
  }'
```

**Partial Update (only some fields)**
```bash
curl -X POST "${API_BASE}/api/athlete/preferences" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "focus_discipline": "run",
    "preferred_training_time": "evening"
  }'
```

**Expected Response (200)**
```json
{
  "data": {
    "athlete_id": "uuid-here",
    "preferred_training_time": "morning",
    "focus_discipline": "balanced",
    "preferred_run_metric": "pace",
    "preferred_bike_metric": "power",
    "preferred_swim_metric": "pace",
    "sunday_available": false,
    "monday_available": true,
    "tuesday_available": true,
    "wednesday_available": true,
    "thursday_available": true,
    "friday_available": true,
    "saturday_available": true,
    "has_bike": true,
    "has_pool_access": true,
    "has_power_meter": true,
    "has_hr_monitor": true,
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:00:00Z"
  }
}
```

---

## 3. Create Races (Batch)

### POST /api/races

**Single A-Race (Quick Start)**
```bash
curl -X POST "${API_BASE}/api/races" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "races": [
      {
        "race_date": "2025-08-15",
        "race_type": "70.3",
        "priority": "A",
        "race_name": "Ironman 70.3 Lake Placid",
        "location": "Lake Placid, NY",
        "status": "planned"
      }
    ]
  }'
```

**Multiple Races (Advanced Setup)**
```bash
curl -X POST "${API_BASE}/api/races" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "races": [
      {
        "race_date": "2025-08-15",
        "race_type": "70.3",
        "priority": "A",
        "race_name": "Ironman 70.3 Lake Placid",
        "location": "Lake Placid, NY",
        "status": "planned",
        "notes": "Goal: Sub 5:30"
      },
      {
        "race_date": "2025-06-01",
        "race_type": "olympic",
        "priority": "B",
        "race_name": "NYC Triathlon",
        "location": "New York, NY",
        "status": "planned"
      },
      {
        "race_date": "2025-04-20",
        "race_type": "sprint",
        "priority": "C",
        "race_name": "Spring Sprint",
        "location": "Central Park",
        "status": "planned"
      }
    ]
  }'
```

**Past Race (Completed)**
```bash
curl -X POST "${API_BASE}/api/races" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "races": [
      {
        "race_date": "2024-09-10",
        "race_type": "olympic",
        "priority": "B",
        "race_name": "Past Olympic",
        "location": "Boston, MA",
        "status": "completed",
        "notes": "Finished in 2:45:30"
      }
    ]
  }'
```

**Expected Response (201)**
```json
{
  "data": [
    {
      "race_id": "uuid-1",
      "athlete_id": "uuid-athlete",
      "race_date": "2025-08-15",
      "race_type": "70.3",
      "priority": "A",
      "race_name": "Ironman 70.3 Lake Placid",
      "location": "Lake Placid, NY",
      "status": "planned",
      "notes": "Goal: Sub 5:30",
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ],
  "meta": {
    "count": 1,
    "message": "Successfully created 1 race(s)"
  }
}
```

---

## 4. Get All Races

### GET /api/races

```bash
curl -X GET "${API_BASE}/api/races" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Expected Response (200)**
```json
{
  "data": [
    {
      "race_id": "uuid-1",
      "athlete_id": "uuid-athlete",
      "race_date": "2025-04-20",
      "race_type": "sprint",
      "priority": "C",
      "race_name": "Spring Sprint",
      "location": "Central Park",
      "status": "planned",
      "notes": null,
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    },
    {
      "race_id": "uuid-2",
      "athlete_id": "uuid-athlete",
      "race_date": "2025-08-15",
      "race_type": "70.3",
      "priority": "A",
      "race_name": "Ironman 70.3 Lake Placid",
      "location": "Lake Placid, NY",
      "status": "planned",
      "notes": "Goal: Sub 5:30",
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ]
}
```

---

## 5. Get Single Race

### GET /api/races/[race_id]

```bash
export RACE_ID="your-race-uuid"

curl -X GET "${API_BASE}/api/races/${RACE_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Expected Response (200)**
```json
{
  "data": {
    "race_id": "uuid-1",
    "athlete_id": "uuid-athlete",
    "race_date": "2025-08-15",
    "race_type": "70.3",
    "priority": "A",
    "race_name": "Ironman 70.3 Lake Placid",
    "location": "Lake Placid, NY",
    "status": "planned",
    "notes": "Goal: Sub 5:30",
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:00:00Z"
  }
}
```

---

## 6. Update Race

### PATCH /api/races/[race_id]

```bash
curl -X PATCH "${API_BASE}/api/races/${RACE_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "race_name": "Updated Race Name",
    "notes": "Updated notes"
  }'
```

**Expected Response (200)**
```json
{
  "data": {
    "race_id": "uuid-1",
    "athlete_id": "uuid-athlete",
    "race_date": "2025-08-15",
    "race_type": "70.3",
    "priority": "A",
    "race_name": "Updated Race Name",
    "location": "Lake Placid, NY",
    "status": "planned",
    "notes": "Updated notes",
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:01:00Z"
  }
}
```

---

## 7. Delete Race

### DELETE /api/races/[race_id]

```bash
curl -X DELETE "${API_BASE}/api/races/${RACE_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Expected Response (200)**
```json
{
  "data": {
    "race_id": "uuid-1",
    "athlete_id": "uuid-athlete",
    "race_date": "2025-08-15",
    "race_type": "70.3",
    "priority": "A",
    "race_name": "Ironman 70.3 Lake Placid",
    "location": "Lake Placid, NY",
    "status": "planned",
    "notes": "Goal: Sub 5:30",
    "created_at": "2025-10-30T00:00:00Z",
    "updated_at": "2025-10-30T00:00:00Z"
  },
  "message": "Race deleted successfully"
}
```

---

## 8. Create Constraints (Batch)

### POST /api/athlete/constraints

**Injury Constraint**
```bash
curl -X POST "${API_BASE}/api/athlete/constraints" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "constraints": [
      {
        "constraint_type": "injury",
        "affected_disciplines": ["run"],
        "start_date": "2025-11-01",
        "end_date": "2025-11-14",
        "severity": "moderate",
        "description": "Shin splint - no running for 2 weeks"
      }
    ]
  }'
```

**Equipment Constraint**
```bash
curl -X POST "${API_BASE}/api/athlete/constraints" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "constraints": [
      {
        "constraint_type": "equipment",
        "affected_disciplines": ["swim"],
        "start_date": "2025-12-01",
        "end_date": "2025-12-15",
        "severity": "severe",
        "description": "Pool closed for maintenance"
      }
    ]
  }'
```

**Availability Constraint (No end date)**
```bash
curl -X POST "${API_BASE}/api/athlete/constraints" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "constraints": [
      {
        "constraint_type": "availability",
        "affected_disciplines": ["bike", "run"],
        "start_date": "2025-11-20",
        "end_date": null,
        "severity": "mild",
        "description": "Limited to indoor training only"
      }
    ]
  }'
```

**Multiple Constraints**
```bash
curl -X POST "${API_BASE}/api/athlete/constraints" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "constraints": [
      {
        "constraint_type": "injury",
        "affected_disciplines": ["run"],
        "start_date": "2025-11-01",
        "end_date": "2025-11-14",
        "severity": "moderate",
        "description": "Shin splint"
      },
      {
        "constraint_type": "availability",
        "affected_disciplines": ["swim", "bike", "run"],
        "start_date": "2025-12-24",
        "end_date": "2025-12-31",
        "severity": "mild",
        "description": "Holiday travel"
      }
    ]
  }'
```

**Expected Response (201)**
```json
{
  "data": [
    {
      "constraint_id": "uuid-1",
      "athlete_id": "uuid-athlete",
      "constraint_type": "injury",
      "affected_disciplines": ["run"],
      "start_date": "2025-11-01",
      "end_date": "2025-11-14",
      "severity": "moderate",
      "description": "Shin splint - no running for 2 weeks",
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ],
  "meta": {
    "count": 1,
    "message": "Successfully created 1 constraint(s)"
  }
}
```

---

## 9. Get All Constraints

### GET /api/athlete/constraints

**All constraints**
```bash
curl -X GET "${API_BASE}/api/athlete/constraints" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Only active constraints**
```bash
curl -X GET "${API_BASE}/api/athlete/constraints?active=true" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Constraints active on specific date**
```bash
curl -X GET "${API_BASE}/api/athlete/constraints?date=2025-11-10" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Expected Response (200)**
```json
{
  "data": [
    {
      "constraint_id": "uuid-1",
      "athlete_id": "uuid-athlete",
      "constraint_type": "injury",
      "affected_disciplines": ["run"],
      "start_date": "2025-11-01",
      "end_date": "2025-11-14",
      "severity": "moderate",
      "description": "Shin splint - no running for 2 weeks",
      "created_at": "2025-10-30T00:00:00Z",
      "updated_at": "2025-10-30T00:00:00Z"
    }
  ],
  "meta": {
    "count": 1,
    "filters": {
      "active": false,
      "date": null
    }
  }
}
```

---

## Error Responses

### 401 Unauthorized

**Missing Token**
```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Valid JWT token required",
    "request_id": "req_abc123"
  }
}
```

**Expired Token**
```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Token expired",
    "request_id": "req_abc123"
  }
}
```

### 400 Bad Request

**Validation Error**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "path": ["email"],
        "message": "Invalid email format"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

**Date Constraint Error**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "End date must be after or equal to start date",
    "request_id": "req_abc123"
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "RACE_NOT_FOUND",
    "message": "Race not found or you do not have permission to delete it",
    "request_id": "req_abc123"
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to save athlete profile",
    "request_id": "req_abc123"
  }
}
```

---

## Complete Onboarding Flow

Here's a complete example of the onboarding flow:

```bash
#!/bin/bash
set -e

API_BASE="http://localhost:3000"
JWT_TOKEN="your-jwt-token"

echo "1. Creating athlete profile..."
curl -X POST "${API_BASE}/api/athlete/profile" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newathlete@example.com",
    "name": "New Athlete",
    "date_of_birth": "1992-06-15",
    "experience_level": "intermediate",
    "available_hours_per_week": 12.0,
    "training_days_per_week": 5,
    "ftp_watts": 220,
    "threshold_pace_min_per_km": 4.5
  }'

echo "\n2. Setting preferences..."
curl -X POST "${API_BASE}/api/athlete/preferences" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "preferred_training_time": "morning",
    "focus_discipline": "balanced",
    "preferred_run_metric": "pace",
    "preferred_bike_metric": "power",
    "preferred_swim_metric": "pace",
    "sunday_available": false,
    "has_power_meter": true,
    "has_hr_monitor": true
  }'

echo "\n3. Adding race calendar..."
curl -X POST "${API_BASE}/api/races" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "races": [
      {
        "race_date": "2025-09-15",
        "race_type": "70.3",
        "priority": "A",
        "race_name": "Ironman 70.3 Boulder",
        "location": "Boulder, CO"
      }
    ]
  }'

echo "\n4. Adding constraints..."
curl -X POST "${API_BASE}/api/athlete/constraints" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "constraints": [
      {
        "constraint_type": "availability",
        "affected_disciplines": ["swim", "bike", "run"],
        "start_date": "2025-12-20",
        "end_date": "2026-01-05",
        "severity": "mild",
        "description": "Holiday break - reduced training"
      }
    ]
  }'

echo "\n✅ Onboarding complete!"
```

---

## Development Mode Testing

For local development with header override:

```bash
# Set AUTH_MODE=dev and ALLOW_HEADER_OVERRIDE=true in .env.local

curl -X GET "${API_BASE}/api/races" \
  -H "X-Athlete-Id: 11111111-1111-1111-1111-111111111111"
```

---

## Response Headers

All responses include these standard headers:

```
X-Request-Id: req_abc123xyz
X-Explainability-Id: xpl_abc123xy
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Cross-Origin-Resource-Policy: same-origin
Cache-Control: no-store, no-cache, must-revalidate
```

GET endpoints include caching headers:
```
Cache-Control: private, max-age=60, stale-while-revalidate=60
```

---

## Notes

1. All dates must be in `YYYY-MM-DD` format
2. UUIDs are auto-generated by the database
3. athlete_id is extracted from JWT, not from request body
4. RLS ensures athletes can only access their own data
5. Batch operations accept 1-50 items per request
6. All timestamps are in UTC (ISO 8601 format)
