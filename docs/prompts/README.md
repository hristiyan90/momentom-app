# Agent Prompt Templates

This directory contains reusable prompt templates for launching Claude Code subagents via the Task tool.

## How Templates Work

Claude Code (the orchestrator) uses these templates when launching specialist subagents. Each template provides:

1. **Role definition** - What the agent specializes in
2. **Context loading** - What project knowledge the agent needs
3. **Task structure** - How to present the work to be done
4. **Output format** - What deliverables are expected
5. **Quality standards** - Policies and patterns to follow

## Available Templates

### Strategic Planning
- `product-architect.md` - Feature specs, API contracts, architectural decisions
- `sports-science.md` - Training methodology, workout validation
- `ai-ml-engineer.md` - Algorithm design, personalization logic

### Implementation
- `backend-engineer.md` - API routes, business logic, server-side code
- `frontend-engineer.md` - React components, hooks, UI state
- `database-engineer.md` - Migrations, RLS policies, SQL optimization

### Quality Assurance
- `qa-engineer.md` - Testing, verification, acceptance criteria
- `security-auditor.md` - Auth review, RLS validation, penetration testing
- `performance-engineer.md` - Optimization, profiling, benchmarking

### Operations
- `devops-engineer.md` - Deployment, CI/CD, environment configuration

## Usage

These templates are used internally by Claude Code when you request agent assistance:

```
You: "I need a spec for onboarding persistence"

Claude Code: [Uses product-architect.md template]
[Launches Task with populated template]
[Returns: Complete specification]
```

You don't invoke templates directly—Claude Code manages this coordination.

## Template Structure

Each template follows this format:

```markdown
# [Agent Name] Prompt Template

## Role & Specialization
[What this agent does best]

## Context to Load
[What files/docs the agent needs to review]

## Task Format
[How to structure the request]

## Quality Standards
[Policies and patterns to follow]

## Output Requirements
[What deliverables are expected]

## Examples
[Sample invocations and expected outputs]
```

## Customization

If you find agents aren't producing optimal results:

1. Review the relevant template
2. Suggest improvements to Claude Code
3. Claude Code will adjust the template for future invocations

Templates evolve based on project needs and feedback.

## See Also

- `/CLAUDE.md` - Complete agent roster and capabilities
- `docs/process/CLAUDE_CODE_WORKFLOW.md` - How agents coordinate
- `docs/process/MULTI_AGENT_WORKFLOW.md` - Agent ecosystem overview
