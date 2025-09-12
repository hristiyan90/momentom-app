# Decision Log

| Date       | Area        | Decision                                                     | Rationale                                   | Owner            |
|------------|-------------|--------------------------------------------------------------|---------------------------------------------|------------------|
| 2025-09-09 | Caching     | Strong ETag over canonical final JSON; Vary by TZ (+dev ID) | Deterministic caching & fast 304s           | Product Architect|
| 2025-09-09 | Auth        | JWT→athlete_id via user_metadata.athlete_id or sub(UUID)     | Stable RLS scoping in prod; dev override ok | Product Architect|
| 2025-09-09 | CI          | PRs block on OpenAPI diff, Newman, H1–H7 smoke               | Prevent contract drift                      | Product Architect|
| 2025-09-10 | Library     | Accept SSS Drop-1 seed (10 items)                            | UI validation before full set               | Sports Science   |
