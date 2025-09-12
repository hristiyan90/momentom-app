# Momentom — High-Level Feature Map

## MVP (Now → Next)
- **Workout Library v0**: ~120–150 predefined workouts (Run/Bike/Swim/Strength) with time-based segments.
- **Plan & Sessions (GET)**: Served from Supabase with RLS; keyset pagination; strong ETags.
- **Adaptations**: `/adaptations/preview` (deterministic rules) + `/adaptations/{id}/decision` (audit + version bump).
- **Readiness**: driver weight renormalisation; reason codes; partial data handling.
- **Fuelling Guidance**: mg/h sodium derived from mg/L × L/h; carbs and fluid bands shown.
- **Manual Ingest**: **POST /api/ingest/workout** (TCX/GPX) → staging → normalised session; UI dropzone + status.
- **Auth Modes**: dev (header override) vs prod (JWT only) with RLS invariants.
- **Coach Tom v0**: read-only explainer (no schema changes).
- **CI Gates**: OpenAPI diff, Newman/Postman, H1–H7 smoke; README badge.
- **Observability**: structured logs, correlation/explainability headers.

## Shortly After MVP
- **Races & Blockers**: stored and fed into adaptations (no new schema).
- **Workout export**: generate downloadable **TCX** (and **ZWO** for bike).
- **Manual readiness entry**: AM markers when device data absent.

## Later
- **Plan Builder automation** (rule-based → ML).
- **Wearables integrations** (Garmin/Apple/Coros/Polar/Wahoo) + ingest pipelines.
- **Advanced personalisation** and long-horizon modelling.
- **Mobile-first deepening** (PWA polish → native decision).
- **Privacy/GDPR** flows; analytics opt-in with request/trace IDs.

## Decision Log (living)
- OpenAPI 1.0.1 **frozen** through Cycle-2.
- Strong ETag policy on GET; POST no-store (see `docs/policy/etag-policy.md`).
- Prod auth: JWT → `athlete_id`; **no** header overrides.