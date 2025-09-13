# Auto-Log Ritual (Decision Log / ADR / RFC)

Run this **after your plan is approved**, before coding starts.

## When to create an RFC
If a task would change **OpenAPI**, **RLS**, **security policy**, or **caching semantics**, first:
1) Create `docs/rfcs/RFC_<slug>.md` (Status: Proposed, Summary, Motivation, Impact, Alternatives).
2) Add a row to `docs/decisions/DECISION_LOG.md` linking the RFC.
3) **Do not** change `/openapi/` or `/docs/policy/` until the RFC is marked **Accepted**.

## When to write an ADR
If you make a notable architectural/process decision that does **not** change contracts/policy:
1) Create `docs/decisions/ADR_<nnnn>_<slug>.md` (Status: Accepted/Rejected/Superseded).
2) Append a row to `docs/decisions/DECISION_LOG.md` with ID, title, date, owner, links.

## If no ADR/RFC is needed
Add a “Decisions” section in the PR description with a one-liner:
> No ADR/RFC needed. No contract/policy/RLS/caching changes.

Commit these records as `docs(decisions): ...` inside the same PR.