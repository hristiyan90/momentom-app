# Cycle 1 — Foundation & v0 UI

> Goal: stand up the repo, deploy a live preview, set initial specs/contracts, and produce a clickable UI that we’ll wire to real data in Cycle-2.

## Scope & Status

| ID     | Title                                         | Status | PR     | Spec / Artifacts |
|------: |-----------------------------------------------|--------|--------|------------------|
| C1-A1  | Repo init, Vercel preview, base Next.js app   | Done   | <link> | README.md, vercel.json |
| C1-A2  | v0 UI scaffolding (onboarding, dash, calendar, session detail, races, zones) | Done | <link> | `/app/**` (UI), design notes |
| C1-A3  | OpenAPI baseline 1.0.1 + Postman skeleton     | Done   | <link> | `openapi/momentom_api_openapi_1.0.1.yaml`, `postman/*` |
| C1-A4  | Mock API (GETs) w/ sample data                | Done   | <link> | `/app/api/*` (mock), Postman collection |
| C1-A5  | Project docs skeleton                         | Done   | <link> | `docs/product/*`, `docs/process/*`, `docs/architecture/overview.md` |
| C1-A6  | Basic CI (build/lint)                         | Done   | <link> | `.github/workflows/*` (initial) |
| C1-A7  | Decision Log seeded                           | Done   | <link> | `docs/decisions/DECISION_LOG.md` |

## Decision Highlights
- Established **OpenAPI 1.0.1** as the frozen contract for early MVP.
- Agreed on **Supabase (Postgres + RLS)**, **Next.js API routes**, and **Vercel** deploy path.

## Evidence / Links
- Live preview URL in root **README.md** (Quick Links).
- Postman env + collection committed under `postman/`.

## Notes
Cycle-1 was intentionally UI-heavy and contract-light to accelerate learning; Cycle-2 wires real data + policies.