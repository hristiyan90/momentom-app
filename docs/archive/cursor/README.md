# Cursor Workflow Archive

**Date Archived:** October 27, 2025
**Reason:** Migrated to Claude Code multi-agent workflow

## What Changed

The project transitioned from Cursor IDE to Claude Code for implementation.

**Previous workflow:**
- Single Cursor AI agent acting as Full-Stack Dev Lead
- Manual context loading via CURSOR_BOOT.md
- C0→C1→C5 process for each task (Planning → Implementation → Verification)
- Developer manually switches between Claude Web (for specs) and Cursor (for implementation)

**New workflow:**
- Claude Code as central orchestrator
- Multiple specialized subagents (Product Architect, Backend Engineer, Frontend Engineer, QA, Security, etc.)
- All work consolidated in one environment (no tool switching)
- Same quality standards, different execution model
- Subagents invoked via Task tool with detailed prompts

## Preserved Concepts

The core process philosophy (C0→C1→C5) was preserved and adapted:

**C0 (Planning)** → Claude Code Orchestrator + Product Architect subagent
- Context analysis and dependency review
- Specification creation
- Approach proposal and approval

**C1 (Implementation)** → Specialized Engineer subagents
- Backend Engineer: API routes, business logic, database queries
- Frontend Engineer: React components, UI state, hooks
- Database Engineer: Migrations, RLS policies, schema changes
- Work in parallel when possible

**C5 (Verification)** → QA + Security subagents
- QA Engineer: Functional testing, edge cases, acceptance criteria
- Security Auditor: RLS isolation tests, auth validation
- Performance Engineer: Load testing, caching verification
- Documentation updates and PR creation

## Quality Standards Preserved

All quality standards from the Cursor workflow remain in effect:

✅ **Policy Compliance:**
- ETag policy (canonical JSON, SHA-256, 304 responses)
- Auth mapping (JWT verification, RLS enforcement)
- CI gates (OpenAPI diff, Newman tests, smoke tests)

✅ **Development Practices:**
- Small, reversible commits (≤1 hour of change)
- Evidence-based verification (cURLs, test outputs, screenshots)
- OpenAPI contract discipline (no schema changes without RFC)
- AUTO_LOG.md decision tracking

✅ **Code Quality:**
- Comprehensive testing
- Security-first approach (RLS on all athlete data)
- Performance considerations (caching, pagination)
- Documentation updates with every change

## Files in This Archive

### Process Documentation
- `CURSOR_BOOT.md` - Original Cursor onboarding document (comprehensive context loading)
- `CURSOR_WORKFLOW.md` - Original workflow document (C0→C1→C5 process)

### Cursor Configuration
- `operating-agreement.md` - Cursor operating instructions (Full-Stack Dev Lead role)
- `rules.md` - Cursor IDE-specific rules
- `context.md` - Cursor context mechanism configuration

## Migration Guide

If you need to reference the old workflow:

1. **Finding equivalent Claude Code docs:**
   - `CURSOR_BOOT.md` → See `/CLAUDE.md`
   - `CURSOR_WORKFLOW.md` → See `/docs/process/CLAUDE_CODE_WORKFLOW.md`
   - `operating-agreement.md` → See "Working with Claude Code" section in `/CLAUDE.md`

2. **Process mapping:**
   - C0 (Cursor Planning) → Claude Code Orchestrator planning mode + PA subagent
   - C1 (Cursor Implementation) → Engineer subagents (Backend/Frontend/Database)
   - C5 (Cursor Verification) → QA + Security subagents

3. **Quality standards:**
   - All policies remain unchanged (see `/docs/policy/`)
   - All architectural principles preserved (see `/docs/architecture/`)
   - PR template migrated to `/docs/templates/PULL_REQUEST_TEMPLATE.md`

## Why Archive Instead of Delete?

- **Historical reference:** Shows evolution of development workflow
- **Knowledge preservation:** Cursor workflow established excellent patterns
- **Future flexibility:** May return to Cursor or hybrid approach
- **Onboarding:** Helps new team members understand project history
- **Documentation:** Process philosophy has value independent of tool

## See Also

- `/CLAUDE.md` - Claude Code central reference (replaces CURSOR_BOOT.md)
- `/docs/process/CLAUDE_CODE_WORKFLOW.md` - Multi-agent workflow (replaces CURSOR_WORKFLOW.md)
- `/docs/process/MULTI_AGENT_WORKFLOW.md` - Agent ecosystem overview
- `/docs/templates/` - Reusable templates (PR template, etc.)
