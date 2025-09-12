# PR Title

## Summary
- What changed and why.

## Checklist
- [ ] Contract fidelity: no schema/shape changes to existing responses.
- [ ] RLS enforced: queries scoped to `athlete_id`.
- [ ] Keyset pagination: `next_cursor` stable; filters co-exist.
- [ ] Caching: `ETag` present on GET; `Vary: X-Client-Timezone` (+ dev `X-Athlete-Id` only).
- [ ] Auth mapping: prod JWT → athlete_id; dev header override gated.
- [ ] Headers intact: correlation/security & cache-control as per policy.
- [ ] Tests: OpenAPI diff ✅; Newman ✅; H1–H7 smoke ✅.

## Evidence
- Paste 3–5 cURL calls proving acceptance (200 + ETag, 304 path, auth paths, pagination).
- Link to Postman run or CI artifacts.

## Risk & Rollback
- Risk level:
- Rollback plan: