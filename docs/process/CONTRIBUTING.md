# Contributing

1) Open a small PR.
2) Reference an ADR (or propose one).
3) Include verification cURLs in the PR body.
4) Keep contracts stable; if changing, update OpenAPI + ADR first.
5) Docs are living artifacts — update them when direction changes.

**See Also:**
- `docs/process/CURSOR_BOOT.md` - Complete workflow process
- `docs/process/TASK_FLOW.md` - Master task flow (C0-C5)
- `docs/process/CURSOR_WORKFLOW.md` - High-level workflow
- `docs/cursor/templates/pr.md` - PR template format

## Dev setup
- `npm ci`
- `cp .env.example .env.local` and set Supabase vars
- `npm run dev`

## Running tests
- **Newman**: `npm run postman`
- **Smoke H1–H7**: `npm run smoke`
- **OpenAPI validate**: `npx @apidevtools/swagger-cli validate openapi/*.yaml`