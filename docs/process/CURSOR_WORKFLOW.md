# Cursor Workflow (FS Dev)

This is the high-level workflow for Full-Stack development tasks. For detailed processes, see the referenced documents.

## Quick Reference

1) **Read** docs/ and ADRs
2) **Propose** a plan in PR description (bullets + acceptance)
3) **Implement** in small commits; keep OpenAPI in sync
4) **Add** cURLs proving ETag/304/Auth in PR
5) **Ensure** CI green; request review from code owners

## Detailed Process

### Before Starting (C0)
- Read all required documents per `docs/process/CURSOR_BOOT.md`
- Create context digest (A-J format)
- Check policy alignment (ETag, Auth, CI Gates)
- Run dependency scan if needed
- Create PR draft with template from `docs/cursor/templates/PULL_REQUEST_TEMPLATE.md`

### Implementation (C1-C4)
- Follow `docs/process/TASK_FLOW.md` stages C1-C4
- Keep commits small and reversible (≤1 hour each)
- Maintain OpenAPI sync
- Include verification cURLs in PR

### Review & Merge (C5)
- Ensure all CI gates pass
- Update `docs/process/AUTO_LOG.md` with C0 and C5 entries
- Request review from code owners
- Merge with squash

## Cross-References

- **Master Process**: `docs/process/TASK_FLOW.md` (C0-C5 stages)
- **Detailed Steps**: `docs/process/CURSOR_BOOT.md` (required reading, context digest)
- **PR Template**: `docs/cursor/templates/PULL_REQUEST_TEMPLATE.md`
- **Decision Process**: `docs/process/AUTO_LOG.md` (ADR/RFC process)
- **Contributing**: `docs/process/CONTRIBUTING.md` (setup and testing)

## Quality Gates

- **CI**: OpenAPI diff, Newman, H1–H7 smoke
- **Headers**: ETag/Cache-Control/Vary per policy
- **Auth/RLS**: per `auth-mapping.md`
- **Size**: ≤1 hour of change; reversible

## Escalation

- **RFC needed**: OpenAPI schema changes, new policies, breaking changes
- **Inputs needed**: Any blocking dependencies from other roles
- **See**: `docs/process/CURSOR_BOOT.md` escalation points