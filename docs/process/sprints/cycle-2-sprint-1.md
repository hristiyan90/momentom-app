# Cycle 2 — Sprint 1

> Goal: replace mocks with real Supabase reads (RLS), add caching/auth hardening, seed the Workout Library v0, and lock a repeatable Cursor workflow.

## Scope & Status

| ID  | Title                                                                 | Status        | PR     | Spec / Artifacts |
|---: |-----------------------------------------------------------------------|---------------|--------|------------------|
| A1  | Replace mocked GETs with **Supabase reads + RLS** (plan/sessions/readiness/fuel) | ✅ Done       | <link> | `docs/architecture/overview.md`, OpenAPI 1.0.1 |
| A2  | **Sessions keyset pagination** (cursor/limit + soft filters)         | ✅ Done       | <link> | `docs/architecture/overview.md` (pagination), Postman tests |
| A3  | **ETag / If-None-Match** for GETs (POST = `no-store`)                 | ✅ Done       | <link> | `docs/policy/etag-policy.md`, curl checks in PR |
| A4  | **Auth hardening** (Supabase JWT → athlete_id; disable header override in prod) | ✅ Done | <link> | `docs/policy/auth-mapping.md`, PR evidence |
| B1  | **Workout Library v0** (seed + read-only GET)                         | ✅ Done       | <link> | `docs/library/README.md`, `library/workouts.json`, coverage/evidence notes |
| B1-b| **Cursor workflow** (docs + rules + templates + guards)               | ✅ Done       | <link> | `docs/process/*`, `/.cursor/*` |
| B2  | **Manual Workout Upload (TCX/GPX)** → POST `/api/_internal/ingest/workout`, parser → staging → normalized session; **UI dropzone + status** | 🚧 In progress | <link> | `docs/features/B2-manual-upload.md` (create), `docs/architecture/overview.md` |
| B3  | **UX wiring to live GETs** (Loading/Empty/Error/Partial) + re-shoot screenshots | ⏳ Pending | <link> | `docs/product/feature-map.md`, `docs/product/overview.md` |
| C1  | **Coach Tom v0 (light)** (read-only explainers from live data)        | ⏳ Pending    | <link> | `docs/product/overview.md`, `docs/architecture/overview.md` |
| C2  | **Observability sink** (traceInfo() → structured JSON logs)           | ⏳ Pending    | <link> | `docs/engineering/PLAYBOOK.md` (logging), README-dev |
| C3  | **CI pipeline** (OpenAPI diff, Newman, H1–H7 smoke; README badge)     | ⏳ Pending    | <link> | `docs/policy/ci-gates.md`, `.github/workflows/*` |
| C4  | **Vercel env hygiene** (Preview vs Prod secrets; doc the gates)       | ⏳ Pending    | <link> | `README-dev.md`, `docs/process/*` |

> Note: A1–A4 are the infra pieces that underpin B1; we also locked the Cursor A-to-Z working model (B1-b) so every new task is reproducible.

## Artifacts & Evidence
- **Policies**: ETag/Auth/CI under `docs/policy/`.
- **Library**: `library/workouts.json` (Drop-1), plus coverage/evidence/mapping notes under `docs/library/`.
- **Workflow**: `docs/process/cursor_workflow.md`, `docs/process/task_flow.md`, `/.cursor/rules.md`, templates.
- **cURL checks**: attached in PRs for A3/A4 and Library GETs.
- **RLS**: verified with per-athlete filters; partial data returns `206` + `Warning`.

## Decision Log (adds in this sprint)
- 0001 ETag policy for GETs → Accepted → `docs/policy/etag-policy.md`
- 0002 Auth mapping (JWT→athlete) → Accepted → `docs/policy/auth-mapping.md`
- 0003 CI gates (PR blocking) → Accepted → `docs/policy/ci-gates.md`
- 0004 Workout Library v0 shape → Accepted → `docs/library/README.md`

## Verification Summary (what CI/PR shows)
- OpenAPI diff vs main → ✅
- Newman collection run → ✅
- Smoke H1–H7 → ✅
- Manual cURLs:
  - `GET /api/sessions?cursor=…&limit=…` → `200` with `ETag` and `Vary: X-Client-Timezone`
  - `GET /api/readiness?date=…` → `200/206` + cache profile
  - `POST /api/_internal/ingest/workout` (B2) → `201` with `ingest_id` (when merged)

## Notes
- Keep the **Spec** column authoritative—if a task touches contract/policy, we expect an ADR + Decision Log row.