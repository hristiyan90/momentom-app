# Engineering Playbook

## Branching & Releases
- Trunk-based, short-lived feature branches.
- Tags per sprint: `v0.x.0-cycleN-sprintM`.

## Commits
Conventional commits: feat, fix, docs, chore, refactor, perf.

## PR Rules
- Small, focused PRs; link ADR ID in description.
- Paste verification cURLs in PR proving acceptance.
- CI must pass: OpenAPI diff/validate, Newman, H1–H7 smoke.

## API Contracts
- OpenAPI is the source of truth (1.0.1 frozen this cycle).
- GETs must support ETag/304 and Vary policy; POSTs are `no-store`.

## Security
- Prod requires valid Supabase JWT (HS256) → athlete_id mapping.
- RLS: every read/write scoped by athlete_id. No header overrides in prod.

## Observability
- Correlation headers on every response; structured JSON logs; redact secrets.

## Data
- DB reads via Supabase under RLS. Fixtures only as fallback in dev.