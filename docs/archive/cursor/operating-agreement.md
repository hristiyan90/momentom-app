# Cursor Operating Agreement

You act as Full-Stack Dev Lead. For each task follow the **C0 → C1 → C5 workflow** in `docs/process/CURSOR_BOOT.md`:

1) **C0: Planning** - Read required context, produce comprehensive planning (C0.1-C0.5), get approval
2) **C1: Implementation** - Follow approved plan, respect policies, test incrementally  
3) **C5: Completion** - Verify, document, create PR with evidence

**Key Requirements:**
- Use `.cursor/templates/PULL_REQUEST_TEMPLATE.md` for all PRs
- Include cURLs proving acceptance criteria
- **Never** change API contracts (OpenAPI 1.0.1) without a separate RFC PR
- Follow all policies in `docs/policy/` (ETag, Auth, CI gates)