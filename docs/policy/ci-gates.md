# CI Gates (PR blocking)

## TL;DR
Every pull request must pass **three gates**:
1) **OpenAPI conformance & diff** (no breaking/undeclared changes)  
2) **Postman/Newman tests** (collection runs green)  
3) **H1–H7 smoke** suite passes

Fail any gate → fail the PR.

## Acceptance
- CI runs on PRs; merges to `main` are blocked if any gate fails.
- Artifacts (Newman HTML, diff output, smoke logs) are uploaded on failure.
- Badge may be shown in README.

## Assumptions
- Node.js **20.x** in CI.
- Docker is available for `tufin/oasdiff`. If unavailable, use Redocly CLI diff.
- The repo contains:
  - `openapi/momentom_api_openapi_1.0.1.yaml`
  - `postman/momentom_postman_collection.json`
  - `postman/momentom_postman_environment.json`
  - H1–H7 smoke entry point: `npm run smoke` (as referenced in `README-dev.md`)

---

## Steps

### 1) OpenAPI conformance & diff
- **Validate** 3.1 syntax.
- **Diff** against `main` and **fail on any change**.

**Option A — Docker oasdiff (preferred)**
```bash
# Fetch main spec
curl -sSL -o artifacts/openapi_main.yaml \
  https://raw.githubusercontent.com/hristiyan90/momentom-app/main/openapi/momentom_api_openapi_1.0.1.yaml

# Diff (fail on any change)
docker run --rm -v "$PWD":/work tufin/oasdiff:latest \
  diff --fail-on=all --format=text \
  /work/artifacts/openapi_main.yaml /work/openapi/momentom_api_openapi_1.0.1.yaml \
  | tee artifacts/openapi-diff.txt

# Validate syntax
npx --yes @apidevtools/swagger-cli@4.0.4 validate openapi/momentom_api_openapi_1.0.1.yaml