# Build Context

## Canonical Specs
- OpenAPI: `openapi/momentom_api_openapi_1.0.1.yaml`
- H1–H7 smoke matrix: `README-dev.md`

## Policies
- ETag: `docs/policy/etag-policy.md`
- Auth mapping: `docs/policy/auth-mapping.md`
- CI gates: `docs/policy/ci-gates.md`

## Current State
- A1–A4 (auth, RLS reads, keyset pagination, ETag) shipped.
- Library v0 (B1) in progress.

## Environments
- Preview/Prod app (API under `/api`): https://v0-endurance-app-ui.vercel.app/