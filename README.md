# Momentom

**Adaptive, athlete-first coaching for endurance athletes.**  
Momentom blends **adaptive training**, **real-time readiness**, **fuel guidance**, and a transparent
**AI coach** into one clean experience.

## Status
<!--STATUS:BEGIN-->
# Project Status
- Cycle: Cycle-2
- Sprint: Sprint-1
- Current focus: **B2 — Manual Workout Upload (TCX/GPX)**
- Next up: B3 — TBD
- Last change: 2025-01-10

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
- **Cursor system files**: `/.cursor/rules.md` · `/.cursor/context.md` · `/.cursor/CURSOR_OPERATING_AGREEMENT.md`

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
- **Cursor Rules & Workflow:** `/.cursor/rules.md`, `docs/process/CURSOR_WORKFLOW.md`, `/.cursor/CURSOR_OPERATING_AGREEMENT.md`
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