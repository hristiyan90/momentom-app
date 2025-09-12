# Cursor Rules (Momentom)

## Contract & Scope
- **OpenAPI 1.0.1 is frozen.** No schema changes without a separate RFC PR approved by Product Architect.
- **RLS**: All reads/writes scoped by `athlete_id`.
- **Auth**: JWT → athlete mapping per `docs/policy/auth-mapping.md`.
- **Caching**: Strong **ETag** over canonical final JSON; `Vary: X-Client-Timezone`; dev-only `Vary: X-Athlete-Id` when the override gate is enabled (see ETag policy).
- **Pagination**: Keyset (cursor + limit) for `/sessions`.

## Process (must-do)
1) For each `/tasks/*`: create a short **Design Note** first (see template), then wait for “LGTM / proceed”.
2) After approval: implement in a **small PR** (≤300 line diff ideally).
3) Every PR must include **3–5 cURLs** that prove the Acceptance Criteria.
4) PR must pass **CI gates** (OpenAPI diff/validate, Newman, H1–H7 smoke).

## Style
- Type-safe adapters; pure route handlers.
- Keep secrets out of logs; use structured logs via `traceInfo()`.
- Error shapes and headers remain consistent with Cycle-1.