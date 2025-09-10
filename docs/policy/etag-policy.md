# ETag Policy

## TL;DR
- **Where**: Apply **ETag** on **GET** endpoints only.
- **What to hash**: Compute a **strong ETag** from the **final serialized JSON body** (canonical, sorted keys, UTF-8).
- **ETag format**: quoted **base64url** of SHA-256 (matches current implementation).
- **Vary**: Always `Vary: X-Client-Timezone`; in **dev-only override mode**, also `Vary: X-Athlete-Id` (gated by `AUTH_MODE` and `ALLOW_HEADER_OVERRIDE`).
- **Cache-Control**:
  - GET **`/readiness`**: `private, max-age=30, stale-while-revalidate=30`
  - Other GETs (e.g., `/plan`, `/sessions`, `/fuel/*`): `private, max-age=60, stale-while-revalidate=60`
  - All **POST/PATCH**: `no-store`
- **304 rule**: If `If-None-Match` **exactly matches** the strong ETag → respond **304** with **empty body**, still include correlation/security headers and the same `Vary` + `Cache-Control`.

## Acceptance
- GET responses include `ETag`, `Cache-Control`, and `Vary` (per above) and are computed from canonical JSON.
- `If-None-Match` short-circuits to **304** when ETag matches; response has **no body**.
- **Dev** builds add `Vary: X-Athlete-Id` **only when** `AUTH_MODE != "prod"` **and** `ALLOW_HEADER_OVERRIDE=true`; **Prod** does not.
- **POST/PATCH** responses set `Cache-Control: no-store` and **omit** `ETag`.

## Assumptions
- OpenAPI **1.0.1** is the canonical contract. **No schema changes** in this policy.
- **Shipped correlation/security headers (H5)**:
  `X-Request-Id`, `X-Explainability-Id`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Canonical JSON = stable key ordering; no volatile fields in the body.
- `X-Client-Timezone` affects windowing/formatting; ETag **must** vary by it.

---

## Policy

### 1) Strong ETag
Use **strong** validators (no `W/` prefix).

### 2) Hash Target (canonical JSON)
- Start from the **final** JSON body **after** all localisation/formatting (timezone, units) and filtering.
- Canonicalise:
  - Sort keys recursively
  - UTF-8 encoding
  - Stable number formatting
- Compute **SHA-256**, **base64url encode**, wrap in quotes: `ETag: "Z4ww9…"`.

### 3) Headers

**GET (example):**
ETag: "…"
Cache-Control: private, max-age=60, stale-while-revalidate=60
Vary: X-Client-Timezone

**GET /readiness only:**
Cache-Control: private, max-age=30, stale-while-revalidate=30

**Dev builds only (header override ON):**
Vary: X-Client-Timezone, X-Athlete-Id

**POST/PATCH:**
Cache-Control: no-store
(no ETag)

Always include the shipped correlation/security headers.

### 4) 304 behaviour
When `If-None-Match` exactly matches the computed strong ETag:
- Respond **304 Not Modified**, **no body**,
- Include the same `Cache-Control`, `Vary`, and shipped correlation/security headers,
- Explicitly keep `X-Request-Id` and `X-Explainability-Id`.

---

## cURL checks

1) First GET (200) returns ETag
curl -i -H "X-Client-Timezone: Europe/London" "$API/readiness?date=2025-09-10"

2) Conditional GET (304) using If-None-Match
ETAG='"…"' # paste from previous response
curl -i -H "X-Client-Timezone: Europe/London" -H "If-None-Match: $ETAG" "$API/readiness?date=2025-09-10"

3) Vary on timezone produces different ETag
curl -sI -H "X-Client-Timezone: Europe/London"     "$API/sessions?start=2025-09-08&end=2025-09-15" | grep -i etag
curl -sI -H "X-Client-Timezone: America/Chicago"  "$API/sessions?start=2025-09-08&end=2025-09-15" | grep -i etag

4) Dev-only override varies cache key (when the feature gate is ON)
curl -sI -H "X-Client-Timezone: Europe/London" -H "X-Athlete-Id: 11111111-1111-1111-1111-111111111111" "$API/plan" | grep -i etag
curl -sI -H "X-Client-Timezone: Europe/London" -H "X-Athlete-Id: 22222222-2222-2222-2222-222222222222" "$API/plan" | grep -i etag
