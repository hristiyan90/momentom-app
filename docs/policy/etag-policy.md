# ETag Policy

## TL;DR
- **Where**: Apply **ETag** on **GET** endpoints only (as per OpenAPI 1.0.1).
- **What to hash**: Compute a **strong ETag** from the **final serialized JSON body** (canonical, sorted keys, UTF-8, no whitespace variance).
- **Vary**: Always `Vary: X-Client-Timezone`; in **dev-only override mode**, also `Vary: X-Athlete-Id` (gated by `AUTH_MODE` and `ALLOW_HEADER_OVERRIDE`).
- **Cache-Control**:  
  - GET **`/readiness`**: `private, max-age=30, stale-while-revalidate=30`  
  - Other GETs (e.g., `/plan`, `/sessions`, `/metrics/*`, `/fuel/*`, `/races/*`): `private, max-age=60, stale-while-revalidate=60`  
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
  **Recommended (not yet shipped):** `X-Frame-Options: DENY` (to be added in code or CDN config).
- Canonical JSON = stable key ordering, stable number formatting, no volatile fields injected into the body.
- `X-Client-Timezone` affects windowing/formatting of certain responses; therefore ETag **must** vary by it.

---

## Policy

### 1) Strong ETag
Use **strong** validators (no `W/` prefix). Strong ETags guarantee byte-for-byte identity of the response body.

**Rationale:** Clients/UI cache aggressively and rely on 304 for fast reload. Our GET responses are deterministic once materialized; strong ETags are appropriate.

### 2) Hash Target (canonical JSON)
- Start from the **final** JSON body **after** all localisation/formatting (timezone, units) and filtering.
- Canonicalise:
  - **Sort keys** recursively.
  - **UTF-8** encoding.
  - **Numbers** serialized consistently (no trailing zeros variance).
  - No transient fields in body (e.g., no timestamps added just for logging).
- Compute **SHA-256**, hex-encode, wrap in quotes: `ETag: "sha256:<hex>"`.

### 3) Headers

**GET (example):**
ETag: "sha256:9f5a…"
Cache-Control: private, max-age=60, stale-while-revalidate=60
Vary: X-Client-Timezone

**GET /readiness only:**
Cache-Control: private, max-age=30, stale-while-revalidate=30

**Dev builds only (header override feature):**
Enabled only if: AUTH_MODE != "prod" AND ALLOW_HEADER_OVERRIDE=true
Vary: X-Client-Timezone, X-Athlete-Id

**POST/PATCH:**
Cache-Control: no-store
_No ETag header_
Always include the shipped correlation/security headers. If/when `X-Frame-Options: DENY` is added, include it on these responses as well.

### 4) 304 behaviour
When a GET request includes `If-None-Match` that exactly matches the computed strong ETag:
- Respond **304 Not Modified**,
- **No response body**,
- Include the same `Cache-Control`, `Vary`, and shipped correlation/security headers,
- **Explicitly keep** `X-Request-Id` and `X-Explainability-Id` on 304 responses.

## cURL checks
(keep as-is for developer usage in PRs)