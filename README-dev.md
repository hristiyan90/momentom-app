# Development Testing Guide

This document provides comprehensive testing procedures for the Momentom adaptation API endpoints.

## Quick Test Matrix (H1-H6)

Here's a concise overview of all features to test:

| Feature | Test Command | Expected Result |
|---------|-------------|-----------------|
| **H1: 424 Missing Readiness** | `curl -X POST /api/adaptations/preview -d '{"date":"2025-09-07","scope":"today"}'` | HTTP 424, Retry-After header |
| **H1: Dev Bypass** | `curl /api/adaptations/preview?allowMissingReadiness=1 -d '{"date":"2025-09-07","scope":"today"}'` | HTTP 200, adaptation created |
| **H2: Volume Guard** | `curl -X POST /api/adaptations/preview -d '{"date":"2025-09-08","scope":"today"}'` | Check `data_snapshot.volume_guard` |
| **H2: Decision Block** | `curl -X POST /api/adaptations/{id}/decision -H "X-Guard-Mode: block" -d '{"decision":"modified"}'` | HTTP 422 if violation |
| **H3: Request ID** | `curl -H "X-Request-Id: test-123" /api/adaptations/preview` | Same X-Request-Id in response |
| **H4: Idempotency** | Two calls with same `Idempotency-Key: uuid` | First: `Idempotency-Replayed: false`, Second: `true` |
| **H5: Security Headers** | `curl -i /api/plan` | Cache-Control, X-Content-Type-Options, etc. |
| **H6: Auth Dev Mode** | `curl -H "X-Athlete-Id: ath_mock" /api/adaptations/preview` | HTTP 200 (dev mode) |
| **H6: Auth Prod Mode** | `AUTH_MODE=prod curl /api/adaptations/preview` (no auth) | HTTP 401, WWW-Authenticate header |

## Base Test Setup

Start the development server:
```bash
npm run dev
```

Set up test environment variables:
```bash
export X_ATHLETE_ID="00000000-0000-0000-0000-000000000001"
export API_BASE="http://localhost:3000"
export TODAY="2025-09-06"
export MISSING_DATE="2025-09-07"  # Simulates missing readiness
export FRESH_DATE="2025-09-15"    # For idempotency tests
```

## Copy-Paste Test Commands

### H1: 424 Readiness Missing + Bypasses

```bash
# Test 1: Missing readiness → 424
curl -s -D /tmp/h1_424.h -o /tmp/h1_424.json \
  -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$MISSING_DATE\",\"scope\":\"today\"}"

echo "Status: $(head -n1 /tmp/h1_424.h)"
echo "Headers: $(grep -E 'Retry-After|Warning' /tmp/h1_424.h)"
echo "Error: $(jq -r '.error.code' /tmp/h1_424.json)"
# Expected: 424, Retry-After: 300, UNPROCESSABLE_DEPENDENCY

# Test 2: Bypass via query
curl -s "$API_BASE/api/adaptations/preview?allowMissingReadiness=1" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$MISSING_DATE\",\"scope\":\"today\"}" | jq -r '.adaptation_id // "ERROR"'
# Expected: Valid UUID (not ERROR)

# Test 3: Bypass via header
curl -s -H "X-Allow-Missing-Readiness: true" \
  -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$MISSING_DATE\",\"scope\":\"today\"}" | jq -r '.adaptation_id // "ERROR"'
# Expected: Valid UUID (not ERROR)

# Test 4: Strict mode
curl -s -H "X-Strict-Readiness: true" \
  -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$MISSING_DATE\",\"scope\":\"week\"}" | jq -r '.error.code // "NO_ERROR"'
# Expected: UNPROCESSABLE_DEPENDENCY
```

### H2: Volume Guard (Clamp/Block)

```bash
# Test 1: Preview with volume guard
curl -s "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"2025-09-08\",\"scope\":\"today\"}" | jq '.data_snapshot.volume_guard // "No guard data"'
# Expected: Volume guard metrics or null

# Test 2: Decision clamp mode (default)
ADP_ID=$(curl -s -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d '{"date":"2025-09-08","scope":"today"}' | jq -r '.adaptation_id')

curl -s "$API_BASE/api/adaptations/$ADP_ID/decision" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d '{"decision":"modified"}' | jq '{success, guard_applied}'
# Expected: {success: true, guard_applied: true/false}

# Test 3: Decision block mode
curl -s -D /tmp/h2_block.h -o /tmp/h2_block.json \
  -X POST "$API_BASE/api/adaptations/$ADP_ID/decision" \
  -H "Content-Type: application/json" \
  -H "X-Guard-Mode: block" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d '{"decision":"modified"}'

echo "Status: $(head -n1 /tmp/h2_block.h)"
echo "Result: $(jq -r '.error.code // .success' /tmp/h2_block.json)"
# Expected: 200 (success) or 422 (GUARDRAIL_VIOLATION)
```

### H3: Correlation Headers

```bash
# Test 1: Custom request ID
curl -s -i -H "X-Request-Id: custom-test-123" \
  -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | grep -E "X-(Request-Id|Explainability-Id)"
# Expected: X-Request-Id: custom-test-123, X-Explainability-Id: xpl_*

# Test 2: Auto-generated request ID
curl -s -i -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | grep -E "X-(Request-Id|Explainability-Id)"
# Expected: X-Request-Id: <uuid>, X-Explainability-Id: xpl_*

# Test 3: Headers in 424 response
curl -s -i -H "X-Request-Id: error-424-test" \
  -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$MISSING_DATE\",\"scope\":\"today\"}" | grep -E "(424|X-Request-Id|X-Explainability-Id)"
# Expected: HTTP 424, both correlation headers present
```

### H4: Idempotency Key Replay

```bash
# Setup
IDEM_KEY="550e8400-e29b-41d4-a716-446655440000"

# Test 1: First call
curl -s -D /tmp/h4_first.h -o /tmp/h4_first.json \
  -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEM_KEY" \
  -H "X-Request-Id: idem-test-1" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$FRESH_DATE\",\"scope\":\"today\"}"

echo "First call headers:"
grep -i "Idempotency-" /tmp/h4_first.h
echo "First adaptation: $(jq -r '.adaptation_id' /tmp/h4_first.json)"
# Expected: Idempotency-Replayed: false

# Test 2: Replay call
curl -s -D /tmp/h4_replay.h -o /tmp/h4_replay.json \
  -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEM_KEY" \
  -H "X-Request-Id: idem-test-2" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$FRESH_DATE\",\"scope\":\"today\"}"

echo "Replay call headers:"
grep -i "Idempotency-" /tmp/h4_replay.h
echo "Replay adaptation: $(jq -r '.adaptation_id' /tmp/h4_replay.json)"
# Expected: Idempotency-Replayed: true, same adaptation_id

# Test 3: ID comparison
if [ "$(jq -r '.adaptation_id' /tmp/h4_first.json)" = "$(jq -r '.adaptation_id' /tmp/h4_replay.json)" ]; then
  echo "✅ Idempotency working: Same adaptation ID"
else
  echo "❌ Idempotency failed: Different adaptation IDs"
fi

# Test 4: Different input (no replay)
curl -s -H "Idempotency-Key: $IDEM_KEY" \
  -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d '{"date":"2025-09-16","scope":"today"}' | jq -r '.adaptation_id'
# Expected: Different adaptation_id (new input data)
```

### H5: Security & Cache Headers

```bash
# Test 1: POST routes (no-store)
curl -s -i -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | grep -E "Cache-Control|X-Content-Type-Options|Referrer-Policy|Cross-Origin-Resource-Policy|Vary"
# Expected: Cache-Control: no-store, security headers present

# Test 2: GET readiness (30s cache)
curl -s -i "$API_BASE/api/readiness" | grep -E "Cache-Control|Vary|X-Content-Type-Options"
# Expected: Cache-Control: private, max-age=30, stale-while-revalidate=30

# Test 3: GET routes (60s cache)
for endpoint in "plan" "sessions" "fuel/session/ses_001"; do
  echo "=== Testing /$endpoint ==="
  curl -s -i "$API_BASE/api/$endpoint" | grep -E "Cache-Control|Vary|X-Content-Type-Options"
  echo "Expected: Cache-Control: private, max-age=60, stale-while-revalidate=60"
  echo
done

# Test 4: Universal security headers check
curl -s -i "$API_BASE/api/plan" | grep -E "^(Content-Type|X-Content-Type-Options|Referrer-Policy|Cross-Origin-Resource-Policy|Vary):"
# Expected all headers present:
# Content-Type: application/json; charset=utf-8
# X-Content-Type-Options: nosniff  
# Referrer-Policy: no-referrer
# Cross-Origin-Resource-Policy: same-origin
# Vary: X-Request-Id, X-Client-Timezone
```

### H6: Authentication Modes

```bash
# Test 1: Development mode (default)
echo "=== Dev Mode Tests ==="
curl -s -H "X-Athlete-Id: ath_mock" \
  "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | jq -r '.adaptation_id // "ERROR"'
# Expected: Valid UUID

curl -s -H "Authorization: Bearer DUMMY" \
  "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | jq -r '.adaptation_id // "ERROR"'
# Expected: Valid UUID

curl -s "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | jq -r '.adaptation_id // "ERROR"'
# Expected: Valid UUID (fallback)

# Test 2: Production mode
echo "=== Prod Mode Tests ==="
export AUTH_MODE=prod

# No auth → 401
curl -s -i "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | head -n1
# Expected: HTTP/1.1 401 Unauthorized

# Bearer DUMMY → 401
curl -s -i -H "Authorization: Bearer DUMMY" \
  "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | head -n1
# Expected: HTTP/1.1 401 Unauthorized

# Invalid JWT → 401 with WWW-Authenticate
curl -s -i -H "Authorization: Bearer aaa.bbb.ccc" \
  "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | grep -i "www-authenticate"
# Expected: WWW-Authenticate: Bearer realm="momentom", error="invalid_token"

# Valid JWT → 200
HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr -d '=' | tr '+/' '-_')
PAYLOAD=$(echo -n '{"sub":"user_123","exp":9999999999}' | base64 | tr -d '=' | tr '+/' '-_')
JWT_TOKEN="$HEADER.$PAYLOAD.signature"

curl -s -H "Authorization: Bearer $JWT_TOKEN" \
  "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | jq -r '.adaptation_id // "ERROR"'
# Expected: Valid UUID

# Header override test (should fail without ALLOW_HEADER_OVERRIDE)
curl -s -i -H "X-Athlete-Id: $X_ATHLETE_ID" \
  "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | head -n1
# Expected: HTTP/1.1 401 Unauthorized

# Header override with flag
export ALLOW_HEADER_OVERRIDE=1
curl -s -H "X-Athlete-Id: $X_ATHLETE_ID" \
  "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}" | jq -r '.adaptation_id // "ERROR"'
# Expected: Valid UUID

# Cleanup
unset AUTH_MODE ALLOW_HEADER_OVERRIDE
```

## Expected Headers by Route

| Route | Cache-Control | Correlation | Idempotency | Auth |
|-------|---------------|-------------|-------------|------|
| `POST /api/adaptations/preview` | `no-store, no-cache, must-revalidate` | ✅ X-Request-Id, X-Explainability-Id | ✅ Idempotency-Key, Idempotency-Replayed | ✅ WWW-Authenticate on 401 |
| `POST /api/adaptations/{id}/decision` | `no-store, no-cache, must-revalidate` | ✅ X-Request-Id, X-Explainability-Id | ❌ | ✅ WWW-Authenticate on 401 |
| `GET /api/readiness` | `private, max-age=30, stale-while-revalidate=30` | ❌ | ❌ | ❌ |
| `GET /api/plan` | `private, max-age=60, stale-while-revalidate=60` | ❌ | ❌ | ❌ |
| `GET /api/sessions` | `private, max-age=60, stale-while-revalidate=60` | ❌ | ❌ | ❌ |
| `GET /api/fuel/session/{id}` | `private, max-age=60, stale-while-revalidate=60` | ❌ | ❌ | ❌ |

**Universal Security Headers (All Routes):**
- `Content-Type: application/json; charset=utf-8`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Cross-Origin-Resource-Policy: same-origin`
- `Vary: X-Request-Id, X-Client-Timezone`

## Error Response Examples

### 424 Missing Readiness
```json
{
  "error": {
    "code": "UNPROCESSABLE_DEPENDENCY",
    "message": "Upstream ingest incomplete",
    "fallback_hint": "partial",
    "request_id": "uuid-v4",
    "retry_after": "PT5M"
  }
}
```

### 401 Authentication Required
```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required",
    "request_id": "uuid-v4"
  }
}
```

### 422 Guardrail Violation
```json
{
  "error": {
    "code": "GUARDRAIL_VIOLATION",
    "message": "Weekly volume change exceeds safety limits",
    "details": {
      "delta_percent": 25.0,
      "max_allowed": 20,
      "in_taper": false
    },
    "request_id": "uuid-v4"
  }
}
```

## Trace Events

Monitor server logs for these trace events:

```json
{"explainability_id":"xpl_abc123","event":"readiness_missing","scope":"today","retry_after_sec":300,"request_id":"uuid"}
{"explainability_id":"xpl_def456","event":"volume_guard_clamp","before_min":120,"after_min":96,"delta_pct":25,"request_id":"uuid"}
{"explainability_id":"xpl_ghi789","event":"adaptation_preview","scope":"today","replayed":false,"idempotency_key":"uuid","request_id":"uuid"}
{"explainability_id":"xpl_jkl012","event":"adaptation_preview_cached","scope":"today","replayed":true,"idempotency_key":"uuid","request_id":"uuid"}
{"explainability_id":"xpl_mno345","event":"decision_guard_check","mode":"block","violates":true,"request_id":"uuid"}
```

## Environment Variables Reference

| Variable | Values | Default | Purpose |
|----------|--------|---------|---------|
| `AUTH_MODE` | `dev`, `prod` | `dev` | Controls authentication strictness |
| `ALLOW_HEADER_OVERRIDE` | `0`, `1` | `0` | Allow X-Athlete-Id in non-prod when enabled |
| `READINESS_STRICT` | `0`, `1` | `0` | Force readiness requirement for all scopes |
| `DECISION_GUARD_MODE` | `clamp`, `block` | `clamp` | Volume guard behavior on violations |

This testing guide covers all implemented features H1-H6 with copy-pasteable commands and clear expected results.