# PR Title

> **Note:** This template follows the workflow defined in `docs/process/CURSOR_BOOT.md` and `docs/process/TASK_FLOW.md`.  
> For the complete template format, see: `docs/cursor/templates/PULL_REQUEST_TEMPLATE.md`

## What
Brief description of what changed and why.
- **Spec:** docs/specs/<feature>.md

## Why
Business justification and context for the change.

## How
Technical approach and implementation details.

## Tests (cURLs + expected)
Verification steps with actual cURL commands and expected responses.
- [ ] Contract fidelity: no schema/shape changes to existing responses.
- [ ] RLS enforced: queries scoped to `athlete_id`.
- [ ] Keyset pagination: `next_cursor` stable; filters co-exist.
- [ ] Caching: `ETag` present on GET; `Vary: X-Client-Timezone` (+ dev `X-Athlete-Id` only).
- [ ] Auth mapping: prod JWT → athlete_id; dev header override gated.
- [ ] Headers intact: correlation/security & cache-control as per policy.
- [ ] Tests: OpenAPI diff ✅; Newman ✅; H1–H7 smoke ✅.

## Risks / Rollback
Potential issues and how to undo the changes if needed.
- Risk level:
- Rollback plan:

## Follow-ups
Next steps or related work that should be done.

---

### Inputs from other roles (requested in C0)
| Role | Needed Item | Path/Link | Blocking? | Due | Notes |
|------|-------------|-----------|-----------|-----|-------|
| Product Architect | Confirm ETag/Auth applicability | docs/policy/* | No | — | — |
| UX | Dropzone copy & error states | docs/ux/* | No | — | Using defaults |
| Ops | Max upload size / bucket | .env.local | **Yes** | — | Needs value or default |

### Ops Digest (to include before requesting review)
Use the template in `docs/process/AUTO_LOG.md` and paste the "OPS DIGEST" into this PR as a comment.