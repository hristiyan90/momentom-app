# GAP-1 API Quick Reference

Fast lookup guide for Onboarding Persistence API endpoints.

---

## Endpoints Summary

| Method | Endpoint | Purpose | Status Code |
|--------|----------|---------|-------------|
| POST | `/api/athlete/profile` | Create/update profile (UPSERT) | 200 |
| POST | `/api/athlete/preferences` | Create/update preferences (UPSERT) | 200 |
| POST | `/api/races` | Batch create races | 201 |
| GET | `/api/races` | List all races | 200 |
| GET | `/api/races/[race_id]` | Get single race | 200 |
| PATCH | `/api/races/[race_id]` | Update race | 200 |
| DELETE | `/api/races/[race_id]` | Delete race | 200 |
| POST | `/api/athlete/constraints` | Batch create constraints | 201 |
| GET | `/api/athlete/constraints` | List constraints | 200 |

---

## Authentication

**Required Header:**
```
Authorization: Bearer <jwt-token>
```

**Or Cookie:**
```
sb-access-token=<jwt-token>
```

**Dev Mode Override:**
```
X-Athlete-Id: <uuid>
```
(Only works when `AUTH_MODE=dev` and `ALLOW_HEADER_OVERRIDE=true`)

---

## Request Examples

### Profile (Minimal)
```json
POST /api/athlete/profile
{
  "email": "athlete@example.com",
  "name": "John Doe",
  "date_of_birth": "1990-05-15",
  "experience_level": "intermediate",
  "available_hours_per_week": 10.0,
  "training_days_per_week": 5
}
```

### Preferences (Minimal)
```json
POST /api/athlete/preferences
{
  "focus_discipline": "balanced",
  "sunday_available": false
}
```

### Races (Single)
```json
POST /api/races
{
  "races": [{
    "race_date": "2025-08-15",
    "race_type": "70.3",
    "priority": "A"
  }]
}
```

### Constraints (Single)
```json
POST /api/athlete/constraints
{
  "constraints": [{
    "constraint_type": "injury",
    "affected_disciplines": ["run"],
    "start_date": "2025-11-01",
    "end_date": "2025-11-14",
    "severity": "moderate"
  }]
}
```

---

## Field Enums

### experience_level
- `beginner`
- `intermediate`
- `advanced`
- `elite`

### race_type
- `sprint`
- `olympic`
- `70.3`
- `140.6`
- `marathon`
- `ultra`
- `5k`
- `10k`
- `half_marathon`

### priority
- `A` (most important)
- `B`
- `C`

### status
- `planned`
- `completed`
- `dns` (did not start)
- `dnf` (did not finish)

### constraint_type
- `injury`
- `equipment`
- `availability`

### affected_disciplines
- `swim`
- `bike`
- `run`
- `strength`

### severity
- `mild`
- `moderate`
- `severe`

### focus_discipline
- `swim`
- `bike`
- `run`
- `balanced`

### preferred_training_time
- `morning`
- `afternoon`
- `evening`
- `flexible`

### Metric preferences
- Run: `pace`, `power`, `hr`
- Bike: `power`, `hr`
- Swim: `pace`, `hr`

---

## Validation Rules

### Profile
- Email: Valid email format
- Date of birth: Must be in past, athlete must be 13+ years old
- Available hours: 1.0 - 30.0
- Training days: 1 - 7
- Available hours ≤ training days × 24

### Thresholds (Optional)
- FTP: 50 - 500 watts
- Threshold pace: 2.5 - 8.0 min/km
- CSS: 1.0 - 4.0 min/100m
- Max HR: 100 - 220 bpm
- Resting HR: 30 - 100 bpm

### Preferences
- At least one training day must be available

### Races
- Planned races must have future date
- Batch: 1-50 races per request

### Constraints
- End date must be ≥ start date (if provided)
- At least one affected discipline required
- Batch: 1-50 constraints per request

---

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `AUTH_REQUIRED` | 401 | Missing/invalid JWT token |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_EMAIL` | 400 | Email already registered |
| `PROFILE_NOT_FOUND` | 400 | Athlete profile doesn't exist |
| `RACE_NOT_FOUND` | 404 | Race not found or no permission |
| `INVALID_RACE_ID` | 400 | Invalid UUID format |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected error |

---

## Response Headers

All responses include:
- `X-Request-Id`: Correlation ID for tracing
- `X-Explainability-Id`: Explainability correlation
- `Cache-Control`: Caching directive
- Security headers (nosniff, referrer-policy, etc.)

---

## Query Parameters

### GET /api/athlete/constraints
- `?active=true` - Only active constraints
- `?date=YYYY-MM-DD` - Active on specific date

---

## Date Format

All dates must use: `YYYY-MM-DD`

Examples:
- `2025-08-15`
- `1990-05-20`
- `2024-12-31`

---

## Common Workflows

### Quick Start Onboarding
1. POST `/api/athlete/profile` (minimal)
2. POST `/api/athlete/preferences` (minimal)
3. POST `/api/races` (1 A-race)

### Advanced Setup Onboarding
1. POST `/api/athlete/profile` (with thresholds)
2. POST `/api/athlete/preferences` (complete)
3. POST `/api/races` (multiple races)
4. POST `/api/athlete/constraints` (if needed)

### Update Profile
1. POST `/api/athlete/profile` (same endpoint, UPSERT)

### Manage Races
1. GET `/api/races` (list all)
2. PATCH `/api/races/[race_id]` (update)
3. DELETE `/api/races/[race_id]` (remove)

### Check Constraints
1. GET `/api/athlete/constraints?active=true`
2. GET `/api/athlete/constraints?date=2025-11-10`

---

## Files Reference

- Routes: `/app/api/athlete/`, `/app/api/races/`
- Auth: `/lib/auth/athlete.ts`, `/lib/auth/client.ts`
- Policies: `/docs/policy/auth-mapping.md`
- Schema: `/supabase/migrations/20251011000002_athlete_schema.sql`

---

## Testing

### Local Dev
```bash
export API_BASE="http://localhost:3000"
export JWT_TOKEN="your-jwt-token"
```

### Production
```bash
export API_BASE="https://api.momentom.app"
export JWT_TOKEN="your-jwt-token"
```

### Quick Test
```bash
curl -X GET "${API_BASE}/api/races" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

---

## Notes

- athlete_id is extracted from JWT (not from request body)
- RLS ensures data isolation between athletes
- All batch operations are atomic (all or nothing)
- Timestamps are UTC (ISO 8601)
- UUIDs are auto-generated
- Profile and preferences use UPSERT (no separate update endpoint)
