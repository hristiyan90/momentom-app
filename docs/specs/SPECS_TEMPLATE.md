# Feature Spec — TEMPLATE

**ID:** `<cycle>-<sprint>-<short>`  
**Title:** `<feature name>`  
**Owner:** `<role>` • **Status:** Draft → Approved → Implementing → Done

## 1) User story & outcomes
- As a `<user>`, I want `<capability>`, so that `<outcome>`.
- Success metrics: `<eg. 95% parse success, <1% 5xx>`

## 2) Scope
- **In:** …
- **Out:** …

## 3) Contracts (authoritative)
- **OpenAPI:** new/updated paths (method, path, request/response, errors).
- **Data model:** tables/cols + **RLS** policies (who can read/write).
- **Storage:** buckets/paths, size limits, MIME checks.
- **Headers/Cache:** align with ETag/Auth policies (link policies).

## 4) Non-functionals
Perf limits, idempotency, observability (logs/metrics), retry strategy, error taxonomy.

## 5) UX flow (1–2 images max)
States & microcopy (success, progress, error).

## 6) Acceptance checks (verifiable)
- Postman/Newman cases
- Smoke H1–H7 additions
- cURL snippets (ETag/304/Auth behavior)

## 7) Open questions / needs clarification
- [ ] …
- Blocking? yes/no

## 8) Tasks (numbered)
T-1 …, T-2 … (reference these IDs in commits/PR).