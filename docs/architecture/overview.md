# Architecture Overview

## Stack

- **Frontend:** Next.js (React) on Vercel
- **API:** Next.js Route Handlers (`app/api/**`) — serverless-friendly
- **DB:** Supabase Postgres with **Row-Level Security (RLS)**
- **Auth:** Supabase JWT (HS256) → runtime mapping to `athlete_id`
- **Storage:** Supabase buckets (TCX/GPX ingest), Postgres tables
- **Caching:** Strong **ETag** from **canonical JSON**; `Vary: X-Client-Timezone` (+ `X-Athlete-Id` in dev only)
- **CI:** GitHub Actions (OpenAPI diff, Newman, H1–H7 smoke)

## System Context
[Browser/UI]  ───── HTTP(S) ────>  [Next.js API (Vercel)]
                                       │
                                       │ Supabase JS / SQL (RLS)
                                       ▼
                               [Postgres (RLS policies)]
                                       │
                                       └──> [Supabase Storage: TCX/GPX]

### High-level request flow
1. Client sends request with `X-Client-Timezone` (and JWT if prod).  
2. API validates auth → resolves **athlete_id** → applies RLS-scoped queries.  
3. Response assembled → **canonicalized JSON** → **SHA-256 ETag** → cache headers.  
4. Conditional requests with `If-None-Match` return **304** when identical.

## Key Behaviours & Invariants

- **RLS everywhere:** All data access filtered by `athlete_id`. No header overrides in **prod**.
- **Auth modes:**
  - **Prod:** Supabase JWT (Bearer or `sb-access-token` cookie) → `athlete_id` from `user_metadata.athlete_id` or `sub` (UUID).
  - **Dev:** Optional `X-Athlete-Id` override **only if** gated (non-prod + `ALLOW_HEADER_OVERRIDE=true`).
- **Caching:**
  - Strong **ETag** computed from **final, canonical JSON** (sorted keys, stable numeric formatting).
  - `Vary: X-Client-Timezone` (and `X-Athlete-Id` in dev override).
  - `Cache-Control`: `/readiness` 30s; most other GETs 60s; **POST/PATCH** `no-store`.
- **Pagination:** **Keyset** (opaque `next_cursor`), deterministic ordering (e.g., `(date, session_id)`).
- **Partial data hygiene:** If inputs missing, return **206 Partial Content** + `Warning` header + `data_quality.flags=["partial_data"]`.
- **Contracts frozen:** OpenAPI **1.0.1**; no shape changes without ADR + spec update.

## Primary Endpoints (excerpt)

- `GET /api/plan` — athlete plan view (phases, upcoming). ETag.
- `GET /api/sessions?start&end&sport&cursor&limit` — **keyset** pagination. ETag.
- `GET /api/readiness?date` — drivers, weights, score; **30s cache**; **206** on partial.
- `GET /api/fuel/session/[id]` — fueling bands; **sodium mg/h = mg/L × L/h** (derived).
- **B1:** `GET /api/workout-library` — read-only, paginated library items (no schema changes).
- **Admin (server-only):** seed loader for library ingest (script or protected route).
- **Preview/no-store:** `POST /api/adaptations/preview` (decision preview; idempotent; no-store).

> All GETs compute ETag over the **final** serialized JSON body (after filters/timezone).

## Data Sketch (non-exhaustive)

- `athletes` — `athlete_id (uuid)`, profile…
- `sessions` — `session_id (uuid)`, `athlete_id`, `sport`, `date`, `structure_json`, load, status
- `plan` — `athlete_id`, windows, periodisation markers, session refs/denorm
- `readiness_daily` — `athlete_id`, drivers, **weights renormalized to 1.00** if missing, score, `data_quality`
- `fuel_sessions` — `session_id`, carbs/fluids/**sodium mg/h**
- `workout_library` — `workout_id`, `sport`, `phase`, title, `primary_zone`, `duration_min`, `structure_json`
- `ingest_staging` — raw uploads (TCX/GPX), parse status, normalized outputs

## Error & Partial Responses

- **401** invalid/absent JWT (prod) with `WWW-Authenticate` header.
- **404** with stable error shape (fidelity to Cycle-1).
- **206** + `Warning` when any readiness driver missing; result still consumable.
- Always preserve correlation/security headers across **200/206/304/4xx/5xx**.

## Observability & Ops

- **Headers:** `X-Request-Id`, `X-Explainability-Id`; JSON logs (redacted), `LOG_LEVEL`.
- **Redaction:** strip tokens, secrets, and PII; log structured events (`traceInfo()` sink).
- **Vercel env hygiene:** clear separation Preview vs Prod; no dev overrides in prod.

## CI/CD Gates

- **OpenAPI diff vs `main`** (block on any undeclared change).
- **Postman/Newman** run against preview base.
- **H1–H7 smoke** suite (README-dev).
- Optional badge surfacing CI status in `README.md`.

## Security & Privacy

- **RLS first:** every query uses `athlete_id` scope.
- **JWT verification:** HS256 via `SUPABASE_JWT_SECRET`; reject `nbf/exp/alg` violations.
- **Headers in prod:** ignore `X-Athlete-Id`; dev only via env gate.
- **Storage:** server-only ingest path; never expose presigned URLs publicly.
- **No PII in logs**; retain minimal operational metadata.

## Admin & Seeding

- **Workout Library v0** delivered as `/library/workouts.json` (flat array).  
  Seed process: privileged script/route ingests JSON → `workout_library` table.  
  GET endpoint is **read-only**; UI renders without schema changes.

## Open Questions / Future

- **Wearables**: Garmin/Apple/Strava integrations + ingestion cadence.
- **Builder MVP**: deterministic rules from Library v0 → plan assembly (Later).
- **Advanced Adaptations**: personalization/ML beyond rule set.
- **Privacy/GDPR**: deletion/retention policies and user-initiated export.
- **Mobile**: PWA vs native for push and offline.

## References

- Policies: `docs/policy/` (ETag, Auth mapping, CI gates)  
- Library docs: `docs/library/`  
- Decision Log: `docs/decisions/decision-log.md`  
- OpenAPI: `openapi/momentom_api_openapi_1.0.1.yaml`