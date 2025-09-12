# CI Gates Policy

## Overview

This document defines the CI/CD gate requirements for the Momentom API, ensuring code quality, API contract compliance, and deployment safety through automated checks.

## Gate Architecture

### PR-Blocking Gates
All gates must pass before a PR can be merged to main branch. Failed gates block the merge and require fixes.

### Gate Categories
1. **Code Quality**: Linting, formatting, type checking
2. **API Contract**: OpenAPI validation, schema compliance
3. **Testing**: Unit tests, integration tests, Postman tests
4. **Security**: Vulnerability scanning, dependency checks
5. **Performance**: Load testing, response time validation

## Gate 1: Code Quality

### Linting
- **Tool**: ESLint with TypeScript rules
- **Configuration**: `.eslintrc.json` with strict rules
- **Scope**: All TypeScript and JavaScript files
- **Failure**: Any linting errors block the PR

### Formatting
- **Tool**: Prettier with consistent configuration
- **Configuration**: `.prettierrc` with standard formatting
- **Scope**: All code files (TS, JS, JSON, MD, YAML)
- **Failure**: Any formatting inconsistencies block the PR

### Type Checking
- **Tool**: TypeScript compiler (`tsc --noEmit`)
- **Configuration**: `tsconfig.json` with strict mode
- **Scope**: All TypeScript files
- **Failure**: Any type errors block the PR

### Dependencies
- **Tool**: `npm audit` for vulnerability scanning
- **Configuration**: Audit level `moderate` or higher
- **Scope**: All production dependencies
- **Failure**: High or critical vulnerabilities block the PR

## Gate 2: API Contract Validation

### OpenAPI Specification
- **Tool**: `swagger-cli` for YAML validation
- **Configuration**: Strict validation mode
- **Scope**: `openapi/momentom_api_openapi_*.yaml`
- **Failure**: Any YAML syntax or schema errors block the PR

### OpenAPI Diff
- **Tool**: `oasdiff` for breaking change detection
- **Configuration**: `--fail-on=breaking` mode
- **Scope**: Compare against main branch
- **Failure**: Any breaking changes block the PR

### Schema Compliance
- **Tool**: Custom validation against OpenAPI schema
- **Configuration**: Strict mode with all required fields
- **Scope**: All API responses and requests
- **Failure**: Any schema violations block the PR

## Gate 3: API Testing

### Postman Collection Tests
- **Tool**: Newman (Postman CLI)
- **Configuration**: HTML reporter with detailed results
- **Scope**: All API endpoints with various scenarios
- **Failure**: Any test failures block the PR

### Test Coverage
- **Endpoints**: All API routes must be tested
- **Scenarios**: Success, error, and edge cases
- **Authentication**: Both dev and prod modes
- **ETag**: Conditional request behavior

### Smoke Tests
- **Tool**: Custom shell script (`scripts/smoke_h1_h7.sh`)
- **Configuration**: Basic health checks and endpoint availability
- **Scope**: Critical API functionality
- **Failure**: Any smoke test failures block the PR

## Gate 4: Security Validation

### Dependency Scanning
- **Tool**: `npm audit` with security focus
- **Configuration**: High and critical vulnerabilities only
- **Scope**: All dependencies (production and development)
- **Failure**: Any high/critical vulnerabilities block the PR

### Secret Scanning
- **Tool**: Custom regex patterns for secret detection
- **Configuration**: Common secret patterns (API keys, passwords, tokens)
- **Scope**: All code files and configuration
- **Failure**: Any exposed secrets block the PR

### Authentication Testing
- **Tool**: Custom tests for auth bypass attempts
- **Configuration**: Various attack vectors and edge cases
- **Scope**: All authentication endpoints
- **Failure**: Any security vulnerabilities block the PR

## Gate 5: Performance Validation

### Response Time
- **Tool**: Custom performance tests
- **Configuration**: 95th percentile < 500ms for API responses
- **Scope**: All API endpoints
- **Failure**: Slow responses block the PR

### Load Testing
- **Tool**: Artillery or similar load testing tool
- **Configuration**: 100 concurrent users for 5 minutes
- **Scope**: Critical API endpoints
- **Failure**: High error rates or timeouts block the PR

### Resource Usage
- **Tool**: Memory and CPU monitoring
- **Configuration**: Memory usage < 512MB, CPU < 80%
- **Scope**: All API operations
- **Failure**: Resource exhaustion blocks the PR

## Implementation Details

### GitHub Actions Workflow
```yaml
name: CI Gates
on: [pull_request]
jobs:
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Format check
        run: npm run format:check
      - name: Type check
        run: npm run type-check
      - name: Security audit
        run: npm audit --audit-level=moderate

  api-contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: OpenAPI validation
        run: npx swagger-cli validate openapi/momentom_api_openapi_*.yaml
      - name: OpenAPI diff
        run: npx oasdiff diff main openapi/momentom_api_openapi_*.yaml --fail-on=breaking

  api-testing:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Start server
        run: npm run dev &
      - name: Wait for server
        run: sleep 10
      - name: Run Postman tests
        run: npx newman run postman/momentom-api.json -r html
      - name: Run smoke tests
        run: npm run smoke
```

### Required Scripts
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format:check": "prettier --check .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "smoke": "bash scripts/smoke_h1_h7.sh",
    "test:api": "newman run postman/momentom-api.json"
  }
}
```

## Gate Configuration

### Failure Thresholds
- **Code Quality**: 0 errors allowed
- **API Contract**: 0 breaking changes allowed
- **Testing**: 100% test pass rate required
- **Security**: 0 high/critical vulnerabilities allowed
- **Performance**: 95th percentile < 500ms required

### Bypass Conditions
- **Emergency Fixes**: Security patches can bypass non-security gates
- **Documentation**: Documentation-only changes can bypass testing gates
- **Configuration**: Environment configuration changes can bypass code gates
- **Approval**: All bypasses require maintainer approval

## Monitoring and Reporting

### Gate Status Dashboard
- **Real-time**: Current status of all gates
- **History**: Historical gate performance
- **Trends**: Gate failure patterns and improvements

### Failure Notifications
- **Immediate**: Slack/email notifications for gate failures
- **Escalation**: Maintainer notification after 1 hour
- **Resolution**: Success notification when gates pass

### Metrics Collection
- **Gate Pass Rate**: Percentage of successful gate runs
- **Failure Causes**: Breakdown of gate failure reasons
- **Resolution Time**: Average time to fix gate failures
- **Performance Impact**: Gate execution time and resource usage

## Gate Maintenance

### Regular Updates
- **Dependencies**: Monthly updates to testing tools
- **Rules**: Quarterly review of gate rules and thresholds
- **Configuration**: Annual review of gate configurations

### Performance Optimization
- **Parallel Execution**: Run independent gates in parallel
- **Caching**: Cache dependencies and build artifacts
- **Resource Allocation**: Optimize resource usage for gate execution

### Rule Evolution
- **New Requirements**: Add gates for new quality requirements
- **Threshold Adjustments**: Modify thresholds based on performance data
- **Tool Upgrades**: Upgrade testing tools and frameworks

## Troubleshooting

### Common Issues
- **Flaky Tests**: Investigate and fix unstable tests
- **Performance Degradation**: Optimize slow-running gates
- **False Positives**: Adjust rules to reduce false positives
- **Resource Constraints**: Scale resources for gate execution

### Debugging Process
1. **Identify**: Determine which gate is failing
2. **Investigate**: Check logs and error messages
3. **Reproduce**: Reproduce the issue locally
4. **Fix**: Implement the necessary fixes
5. **Verify**: Confirm the fix resolves the issue

### Support Escalation
- **Level 1**: Developer self-service debugging
- **Level 2**: Team lead assistance
- **Level 3**: Platform team intervention
- **Level 4**: External tool support

## Future Enhancements

### Advanced Testing
- **Contract Testing**: Pact-based contract testing
- **Chaos Engineering**: Failure injection testing
- **Mutation Testing**: Code mutation analysis

### AI-Powered Gates
- **Code Review**: AI-assisted code review
- **Security Analysis**: AI-powered vulnerability detection
- **Performance Prediction**: ML-based performance forecasting

### Integration Improvements
- **IDE Integration**: Real-time gate feedback in IDEs
- **Pre-commit Hooks**: Local gate execution before commit
- **Smart Caching**: Intelligent cache invalidation