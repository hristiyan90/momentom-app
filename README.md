# Momentom

**Adaptive, athlete-first coaching for endurance athletes.**  
Momentom blends **adaptive training**, **real-time readiness**, **fuel guidance**, and a transparent
**AI coach** into one clean experience.

> Status: Cycle-2 / Sprint-1 in progress. Contracts frozen at **OpenAPI 1.0.1**.  
> A1–A4 infra shipped (Supabase reads + RLS, keyset pagination, strong ETags, prod JWT auth).  
> B1 (Workout Library v0 seed + read-only GET) now active.

## Quick Links

- **Live app (Prod):** https://v0-endurance-app-ui.vercel.app/
- **OpenAPI 1.0.1:** openapi/momentom_api_openapi_1.0.1.yaml
- **Postman:** postman/momentom_postman_collection.json (+ environment)
- **Dev notes & Smoke (H1–H7):** README-dev.md
- **Policies:** docs/policy/ (ETag, Auth mapping, CI gates)
- **Workout Library docs:** docs/library/

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
- **Auth**: Supabase JWT (HS256) → athlete_id mapping (prod); dev header override gated
- **Caching**: strong ETag from **canonical JSON**, Vary: X-Client-Timezone (and X-Athlete-Id in dev)
- **Observability**: JSON logs + correlation headers
- **CI gates**: OpenAPI diff, Postman/Newman, H1–H7 smoke

## Contributing

- Start with: docs/vision/vision.md, docs/product/overview.md, docs/architecture/overview.md
- See policies in docs/policy/
- Decision records in docs/ops/decision-log.md