# ETag Policy


## Overview
This policy defines the implementation of HTTP ETags for caching and conditional requests in the Momentom API. ETags provide a mechanism for clients to cache responses and make conditional requests, reducing bandwidth usage and improving performance. The policy covers canonical JSON serialization, strong ETag generation, appropriate HTTP headers, and caching behavior for different endpoint types.
## TL;DR
- **Where**: Apply **ETag** on **GET** endpoints only (per OpenAPI 1.0.1).
- **What to hash**: Compute a **strong ETag** from the **final serialized JSON body** (canonical JSON:
  recursively sorted keys, UTF-8, stable numbers).
- **Vary**: Always `Vary: X-Client-Timezone`; in **dev-only override mode**, also
  `Vary: X-Athlete-Id` (gated by `AUTH_MODE` and `ALLOW_HEADER_OVERRIDE`).
- **Cache-Control**:
  - GET **`/readiness`**: `private, max-age=30, stale-while-revalidate=30`
  - Other GETs: `private, max-age=60, stale-while-revalidate=60`
  - **POST/PATCH**: `no-store`
- **304 rule**: If `If-None-Match` matches the strong ETag → **304** with **empty body**, keep the same
  `Vary` + `Cache-Control` and correlation/security headers.
- **Clarifications**: Include `ETag` on **200 and 206** responses; **omit** `ETag` on **4xx/5xx**.

## Acceptance
- GET responses include `ETag`, `Cache-Control`, and `Vary` (per above), computed from canonical JSON.
- `If-None-Match` short-circuits to **304**, no body.
- **Dev** builds add `Vary: X-Athlete-Id` **only when** `AUTH_MODE != "prod"` AND `ALLOW_HEADER_OVERRIDE=true`;
  **Prod** does not.
- **POST/PATCH**: `Cache-Control: no-store`, no `ETag`.

## Assumptions
- OpenAPI **1.0.1** is the canonical contract (no schema change).
- Shipped correlation/security headers include: `X-Request-Id`, `X-Explainability-Id`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
  _(Recommended to add `X-Frame-Options: DENY` in code/CDN.)_
- `X-Client-Timezone` affects windowing/formatting; ETag must vary by it.

## Policy

### 1) Strong ETag
Use strong validators (no `W/` prefix). Our GET responses are deterministic after materialization.

### 2) Hash Target (canonical JSON)
- Start from the **final** body after localisation/formatting and filtering.
- Canonicalise (sort keys recursively; UTF-8; stable number serialization).
- Compute **SHA-256**, hex-encode, wrap in quotes: `ETag: "sha256:<hex>"`.

**Canonical JSON Implementation:**
```javascript
// Example canonical JSON serialization
function canonicalize(obj) {
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize);
  
  const sorted = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = canonicalize(obj[key]);
  });
  return sorted;
}

// Generate ETag
const canonical = canonicalize(responseBody);
const json = JSON.stringify(canonical);
const hash = crypto.createHash('sha256').update(json, 'utf8').digest('hex');
const etag = `"sha256:${hash}"`;
```

**Collision Handling:**
- SHA-256 collision probability is negligible for practical purposes
- If collision detected (extremely unlikely), log warning and use timestamp fallback
- Monitor ETag generation for any anomalies

### 3) Headers
**200 GET (example)**  
ETag: "sha256:9f5a…"  
Cache-Control: private, max-age=60, stale-while-revalidate=60  
Vary: X-Client-Timezone

**GET /readiness only**  
Cache-Control: private, max-age=30, stale-while-revalidate=30

**Dev builds (override enabled)**  
Vary: X-Client-Timezone, X-Athlete-Id

**POST/PATCH**  
Cache-Control: no-store  
(no ETag)

**Non-2xx**  
No `ETag` on 4xx/5xx.

### 4) 304 Behaviour
If `If-None-Match` matches the computed strong ETag:
- Respond **304 Not Modified**, **no body**,
- Include the same `Cache-Control`, `Vary`, and correlation/security headers
  (keep `X-Request-Id` and `X-Explainability-Id`).

## Performance Considerations
- **ETag computation**: Should be < 1ms for typical response sizes (< 10KB)
- **Memory usage**: Canonical JSON should not exceed 2x original response size
- **Caching**: ETag computation only on cache miss; 304 responses skip body generation
- **Monitoring**: Track ETag generation time and cache hit rates

## cURL checks
API=https://api.momentom.app/v1
TZ=Europe/London

# 1) First GET (200) returns ETag
curl -i -H "X-Client-Timezone: $TZ" "$API/readiness?date=2025-09-10"

# 2) Conditional GET (304)
ETAG='"sha256:abc123..."'
curl -i -H "X-Client-Timezone: $TZ" -H "If-None-Match: $ETAG" "$API/readiness?date=2025-09-10"

# 3) Timezone varies ETag
curl -sI -H "X-Client-Timezone: Europe/London" \
  "$API/sessions?start=2025-09-08T00:00:00Z&end=2025-09-15T00:00:00Z" | grep -i etag
curl -sI -H "X-Client-Timezone: America/Chicago" \
  "$API/sessions?start=2025-09-08T00:00:00Z&end=2025-09-15T00:00:00Z" | grep -i etag

# 4) Dev-only override varies ETag (feature gated)
curl -sI -H "X-Client-Timezone: $TZ" \
  -H "X-Athlete-Id: 11111111-1111-1111-1111-111111111111" "$API/plan" | grep -i etag

# 5) POST is no-store (no ETag)
APP=https://v0-endurance-app-ui.vercel.app
curl -i -X POST "$APP/api/adaptations/preview" -H "Content-Type: application/json" \
  -d '{"date":"2025-09-10","scope":"today"}'