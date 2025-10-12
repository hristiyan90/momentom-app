| ID   | Title                      | Status   | Date       | Owner              | Supersedes | Links                        |
|------|----------------------------|----------|------------|--------------------|------------|-------------------------------|
| 0001 | ETag policy for GETs        | Accepted | 2025-09-10 | Product Architect  | —          | [etag-policy.md](../policy/etag-policy.md) |
| 0002 | Auth mapping (JWT→athlete)  | Accepted | 2025-09-10 | Product Architect  | —          | [auth-mapping.md](../policy/auth-mapping.md) |
| 0003 | CI gates (PR blocking)      | Accepted | 2025-09-10 | Product Architect  | —          | [ci-gates.md](../policy/ci-gates.md) |
| 0004 | Workout Library v0 shape    | Accepted | 2025-09-10 | Sports Science     | —          | [README.md](../library/README.md) |
| 0005 | Email Verification Non-Blocking | Accepted | 2025-10-11 | Product Architect | —          | [C2-S1-5-a-auth.md](../specs/C2-S1-5-a-auth.md) |
| 0006 | Store Date of Birth, Not Age | Accepted | 2025-10-11 | Product Architect | —          | [C2-S1-5-c-schema.md](../specs/C2-S1-5-c-schema.md) |
| 0007 | athlete_profiles Table Name | Accepted | 2025-10-11 | Product Architect | —          | [C2-S1-5-c-schema.md](../specs/C2-S1-5-c-schema.md) |
| 0008 | All Fitness Thresholds Optional | Accepted | 2025-10-11 | Product Architect | —          | [C2-S1-5-c-schema.md](../specs/C2-S1-5-c-schema.md) |
| 0009 | Experience Level Mapping | Accepted | 2025-10-11 | Product Architect | —          | [C2-S1-5-c-schema.md](../specs/C2-S1-5-c-schema.md) |
| 0010 | Hybrid Garmin Integration Approach | Accepted | 2025-10-11 | Product Architect | —          | [C2-S1-5-e-garmin.md](../specs/C2-S1-5-e-garmin.md#2-strategic-decision-hybrid-approach) |
| 0011 | Workout Library v1 Expansion | Accepted | 2025-10-11 | Sports Science | 0004 | [README.md](../library/README.md) |
| 0012 | Sprint 1.5 Task 1 - Database Foundation | Accepted | 2025-10-12 | Cursor (Implementation) | —    | [20251011000002_athlete_schema.sql](../../supabase/migrations/20251011000002_athlete_schema.sql), [20251011000001_rls_policies.sql](../../supabase/migrations/20251011000001_rls_policies.sql) |
| 0013 | Sprint 1.5 Task 2 - Authentication Middleware | Accepted | 2025-10-12 | Cursor (Implementation) | —    | [lib/auth/errors.ts](../../lib/auth/errors.ts), [lib/auth/client.ts](../../lib/auth/client.ts), [lib/auth/session.ts](../../lib/auth/session.ts), [lib/auth/athlete.ts](../../lib/auth/athlete.ts) |