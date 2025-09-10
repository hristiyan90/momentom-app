# CI Gates (PR blocking)

## TL;DR
Every pull request must pass **three gates**:
1) **OpenAPI conformance & diff** (no breaking/undeclared changes),
2) **Postman/Newman tests** (collection runs green),
3) **H1–H7 smoke** suite passes.

Fail any gate → fail the PR.

## Acceptance
- CI runs on PRs; blocks merge if any gate fails.
- Artifacts (Newman HTML report, logs, diff output) are uploaded on failure.
- Badges available for README.

## Assumptions
- Node.js 20.x, npm available in CI.
- Docker is available (for `tufin/oasdiff` diffs). If Docker is disallowed, swap to `npx @redocly/cli diff`.
- The repo contains:
  - `openapi/momentom_api_openapi_1.0.1.yaml`
  - `postman/momentom_postman_collection.json`
  - `postman/momentom_postman_environment.json`
  - H1–H7 smoke entry point: **`npm run smoke`**.

---

## Steps

### 1) OpenAPI conformance & diff
- Fetch main spec
- Run oasdiff (fail on any change)
- Validate with swagger-cli
- Upload diff artifact

### 2) Newman / Postman
- Run collection against PREVIEW_BASE_URL
- Upload HTML report artifact

### 3) H1–H7 smoke
- npm ci
- npm run smoke
- Upload smoke logs artifact

Add README badge:
![CI](https://github.com/hristiyan90/momentom-app/actions/workflows/ci.yml/badge.svg)
