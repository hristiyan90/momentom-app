# CI Gates (PR blocking)

## Overview
All PRs must pass 8 gates before merge. Gates run in parallel where possible, with dependencies clearly defined.

## Gates

### 1. Code Quality
- ESLint (warnings only, not errors)
- TypeScript type checking (non-blocking during development)
- Security audit (moderate level)

### 2. OpenAPI Validation
- Schema validation using swagger-cli
- Breaking changes detection (warnings only)

### 3. Postman Tests
- Newman collection execution
- Timeout: 10s request/script
- Non-blocking failures (warnings only)

### 4. Smoke Tests
- H1-H7 endpoint validation
- Basic functionality checks
- Non-blocking failures

### 5. Production Auth Tests
- JWT extraction validation
- Error message verification
- Non-blocking failures

### 6. ETag Tests
- ETag generation and 304 responses
- Cache-Control header validation
- Non-blocking failures

### 7. Library Validation
- JSON structure validation
- Required files presence
- Schema compliance

### 8. Policy Validation
- Documentation completeness
- Required sections present
- File size validation

## Sample CI Configuration
```yaml
name: CI Comprehensive v2

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  # All 8 gates defined here
  # Each gate runs independently
  # Final gate depends on all others
```