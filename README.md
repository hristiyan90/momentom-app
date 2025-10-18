# Momentom

**Adaptive, athlete-first coaching for endurance athletes.**  
Momentom blends **adaptive training**, **real-time readiness**, **fuel guidance**, and a transparent
**AI coach** into one clean experience.

## Status
<!--STATUS:BEGIN-->
# Project Status

Update this file per merged task.

## Current
- Cycle: **2**
- Sprint: **1.5** (Foundation & User Lifecycle)
- Active focus: **Implementation Phase 3: Auth Routes ✅ → Session Management (Next)**
- Planning Doc: [Sprint 1.5 Plan](sprints/cycle-2-sprint-1-5-plan.md)

## Recently completed
- A1–A4 infra, policies in place
- B1 — Workout Library v0 (seed + GET)
- B2 — Manual Workout Upload (TCX/GPX) ✅
- B3a — State Management Infrastructure ✅
- B3b — Cockpit UI wiring ✅
- B3c — Calendar UI wiring ✅
- B3e — GarminDB Data Integration (T1-T6) ✅

## Sprint 1.5 - Specifications Complete ✅

### Task 1.5-A: Complete Supabase Auth Integration
- *Agent: Product Architect ✅*
- *Status: Specification Complete - Ready for Implementation*
- *Deliverables:*
  - Complete RLS policies SQL migration
  - JWT verification middleware spec
  - Auth routes (signup, login, logout, reset)
  - Session management with auto-refresh
  - Newman/Postman test collection
  - Documentation: auth-flow.md, auth-modes.md
- *Decisions: 0005 (Email verification non-blocking)*

### Task 1.5-C: Athlete Data Schema Expansion
- *Agent: Product Architect ✅*
- *Status: Specification Complete - Ready for Implementation*
- *Deliverables:*
  - 4-table schema migration (profiles, preferences, races, constraints)
  - Complete validation rules (age ≥13, date ranges, thresholds)
  - Helper functions (age calc, active constraints, next race)
  - Onboarding data mapping documentation
  - Test data seed scripts
- *Decisions: 0006 (DOB not age), 0007 (table name), 0008 (optional thresholds), 0009 (experience mapping)*

### Task 1.5-E: Garmin Integration Strategy
- *Agent: Product Architect ✅*
- *Status: Specification Complete - Ready for Implementation*
- *Deliverables:*
  - Strategic ADR: Hybrid approach (GarminDB → API)
  - GarminDB sync script specification
  - Sport mapping table
  - Sprint 3 migration path (Garmin Connect API)
  - Documentation: 0010-garmin-integration.md, garmin-setup.md
- *Decisions: 0010 (Hybrid Garmin approach)*

### Task 1.5-D: Expand Workout Library (50-100 workouts)
- *Agent: Sports Science ✅*
- *Status: Complete - 101 Workouts Delivered*
- *Deliverables:*
  - expanded_workout_library.json (101 workouts)
  - workout-library-v1.md (Complete documentation)
  - qa-validation-report.md (100% pass rate)
  - friel-validation-addendum.md (Triathlon protocol alignment)
  - Breakdown: Run (26), Bike (26), Swim (21), Strength (18)
  - All phases covered: Base, Build, Peak, Taper, Recovery
- *Decisions: 0011 (Workout Library v1 Expansion)*

### Task 1.5-B: Wire Onboarding UI to Storage
- *Agent: M_PR (implementation) + UX/UI*
- *Status: Ready to Start*
- *Dependencies: All specifications delivered (1.5-A, 1.5-C, 1.5-D)*

### Task 1.5-F/G: GarminDB Daily Sync (Wellness + Workouts)
- *Agent: M_PR (implementation)*
- *Status: Ready to Start*
- *Dependencies: All specifications delivered (1.5-E, 1.5-D)*

## Sprint 1.5 - Implementation Phase (In Progress)

**Day 1-2: Foundation**
- ✅ RLS policies + Athlete schema migrations (1.5-C) - PR #30
- ✅ Auth middleware (JWT verification) (1.5-A) - PR #31

**Day 3-4: Authentication**
- ✅ Auth routes (signup, login, logout, reset, session) (1.5-A) - PR #32
- ⏳ Session management implementation - Next

**Day 5-6: User Lifecycle**
- Onboarding UI wiring (1.5-B)
- Workout library database seeding (1.5-D)

**Day 7-8: Garmin Integration**
- GarminDB wellness sync (1.5-F)
- GarminDB workout sync (1.5-G)

## Sprint 2 - NEXT (Planned)
- Plan generation engine (deterministic, library-based)
- Live UI wiring (Cockpit, Calendar with real data)
- Data quality & session lifecycle
- See: [Sprint 1.5 Plan](sprints/cycle-2-sprint-1-5-plan.md)

## Sprint 3 - LATER (Planned)
- Readiness manual entry, workout export
- C2 Observability, C3 CI pipeline (basic)
- GTM alpha cohort prep
- Garmin Connect API migration
- See: [Sprint 1.5 Plan](sprints/cycle-2-sprint-1-5-plan.md)

## Parked Items
- C1: Coach Tom v0 (defer to Sprint 4)
- C4: Vercel env hygiene (defer to Sprint 4)
- B3d: Progress UI wiring (defer to Sprint 2)

---

## 📊 Sprint 1.5 Progress

**Specifications:** ✅ 4/4 Complete (PA: 3/3, Sports Science: 1/1)
**Implementation:** 🏗️ 2/6 Complete
  - ✅ Task 1: Database Foundation (Schema + RLS) - PR #30
  - ✅ Task 2: Auth Middleware (JWT verification, error classes) - PR #31
  - ⏳ Task 3: Auth Routes (signup, login, logout) - Next
**Blockers:** None

**Next Action:** Implement Auth Routes (signup, login, logout, password reset)
<!--STATUS:END-->

## Quick Links

- **Live app (Prod):** https://v0-endurance-app-ui.vercel.app/
- **OpenAPI 1.0.1:** `openapi/momentom_api_openapi_1.0.1.yaml`
- **Postman:** `postman/momentom_postman_collection.json` (+ environment)
- **Dev notes & Smoke (H1–H7):** `README-dev.md`
- **Policies**: `docs/policy/etag-policy.md` · `docs/policy/auth-mapping.md` · `docs/policy/ci-gates.md`
- **Workout Library docs:** `docs/library/`
- **Decision Log:** `docs/decisions/DECISION_LOG.md`
- **Process**: `docs/process/CURSOR_BOOT.md` · `docs/process/CURSOR_WORKFLOW.md` · `docs/process/TASK_FLOW.md`
- **Sprint History:** `docs/process/sprints/README.md`
- **Feature Specs:** `docs/specs/README.md`
- **Cursor system files**: `/docs/cursor/rules.md` · `/docs/cursor/context.md` · `/docs/cursor/CURSOR_OPERATING_AGREEMENT.md`

## For Cursor (FS Dev)

Before coding:
- Run **C0** from `docs/process/CURSOR_BOOT.md`.
- Paste the **Context Digest** and **Inputs from other roles** into the PR template.
- Link the feature spec in `docs/specs/`.

Docs guard will fail the PR if guarded code changes lack a matching spec.

## What is Momentom?

A next-gen endurance platform for triathletes and runners:
- **Workout & Plan Builder** (phased periodisation; library-backed at MVP)
- **Adaptations Engine** (readiness, compliance, constraints → intelligent changes)
- **Coach Tom (AI)** (explain *why*, not just *what* changed)
- **Fuel Guidance** (carbs/fluids/sodium bands with derivations)

## MVP Scope (high-level)

- **Auth & onboarding** (preferences, races; JWT prod auth)
- **Readiness** (drivers, bands, partial-data hygiene)
- **Workout Library v0** (seeded, pre-defined; time-based segments; run/bike/swim/strength)
- **Manual ingest** of completed workouts (**.TCX/.GPX**) → staging → normalized session
- **Manual morning metrics** (HRV, RHR, sleep, soreness) until device integrations arrive
- **Adaptations preview/decision** routes (reason codes, guardrails)
- **Caching & perf**: strong **ETag** on GETs; **keyset pagination**; RLS-scoped reads

## Architecture Snapshot

- **Frontend**: Next.js / React (Vercel)
- **Backend**: Next.js API routes
- **DB**: Supabase (Postgres + **RLS**)
- **Auth**: Supabase JWT (HS256) → `athlete_id` mapping (prod); dev header override gated
- **Caching**: strong ETag from **canonical JSON**, `Vary: X-Client-Timezone` (and `X-Athlete-Id` in dev)
- **Observability**: JSON logs + correlation headers
- **CI gates**: OpenAPI diff, Postman/Newman, H1–H7 smoke

## Contributing

- Start with: `docs/product/vision.md`, `docs/product/overview.md`, `docs/architecture/overview.md`
- Policies in `docs/policy/`
- Decision records in `docs/decisions/DECISION_LOG.md`

## For Cursor (FS Dev) — Start Here

Before proposing any plan or writing code:

1. **Run C0 — Context Sync** as defined in  
   `docs/process/CURSOR_BOOT.md`  
   *(Read all linked docs; produce a CONTEXT DIGEST A–J; stop. No code.)*

2. After approval, follow the **Auto-Log Ritual** in  
   `docs/process/auto_log.md`  
   *(Update Decision Log / ADR / RFC as applicable, inside your PR.)*

### Key links for Cursor
- Vision & USP: `docs/product/vision.md`
- Product Overview (MVP): `docs/product/overview.md`
- Feature Map: `docs/product/feature-map.md`
- Architecture Overview: `docs/architecture/overview.md`
- Engineering Playbook: `docs/engineering/PLAYBOOK.md`
- **Cursor Rules & Workflow:** `/docs/cursor/rules.md`, `docs/process/CURSOR_WORKFLOW.md`, `/docs/cursor/CURSOR_OPERATING_AGREEMENT.md`
- Policies: `docs/policy/etag-policy.md`, `docs/policy/auth-mapping.md`, `docs/policy/ci-gates.md`
- Workout Library: `docs/library/`, seed: `library/workouts.json`
- OpenAPI (frozen): `openapi/momentom_api_openapi_1.0.1.yaml`
- Postman: `postman/momentom_postman_collection.json`, env: `postman/momentom_postman_environment.json`
- Decisions: `docs/decisions/DECISION_LOG.md` (ADRs in `docs/decisions/`, RFCs in `docs/rfcs/`)

## For Cursor (FS Dev) — Start Here

Before proposing any plan or writing code:

1) **Run C0 — Context Sync**  
   Read the repo docs and produce the A–J CONTEXT DIGEST (no code).  
   ➜ See: `docs/process/CURSOR_BOOT.md`

2) **After plan approval, follow the Auto-Log Ritual**  
   Update Decision Log / ADR / RFC inside your PR when applicable.  
   ➜ See: `docs/process/auto_log.md`

### Kickoff template I paste for each task

> **Task:** <short title>  
> **Acceptance:**  
> - <bullet 1>  
> - <bullet 2>  
> **Out of scope:** <optional>  
> **Action:** Run **C0** from `docs/process/CURSOR_BOOT.md` and stop after the CONTEXT DIGEST.