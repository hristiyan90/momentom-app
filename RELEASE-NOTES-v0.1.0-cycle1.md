# Momentom v0.1.0-cycle1 Release Notes

**Release Date:** September 8, 2025  
**Branch:** `release/v0.1.0-cycle1`  
**Tag:** `v0.1.0-cycle1`

## 🎯 What's New

### 🚀 Adaptations MVP (Track A + B)
Complete implementation of the core adaptation engine with enterprise-grade reliability:

- **🧠 Preview Adaptations**: Generate AI-powered training adaptations with explainable reasoning
- **✅ Decision Processing**: Commit adaptation decisions with volume safety guards
- **📊 Data Integration**: Seamless integration with training plans, sessions, and readiness data
- **🔄 Supabase Persistence**: Full database-backed storage with RLS security

### 🛡️ Production Hardening (H1-H7)
Enterprise-ready features for reliability, security, and observability:

- **H1**: Missing readiness error handling with 424 responses and developer bypasses
- **H2**: Volume guard system preventing dangerous training load changes (±20% safety limit)
- **H3**: Request correlation with `X-Request-Id` and `X-Explainability-Id` headers
- **H4**: Idempotency key support preventing duplicate adaptations within 24h
- **H5**: Comprehensive security headers and intelligent cache control
- **H6**: Dual authentication modes (dev/prod) with JWT validation
- **H7**: Production environment gates for dev-only endpoints

## 📋 Changelog

### 🆕 New Endpoints
- `POST /api/adaptations/preview` - Generate adaptation previews
- `POST /api/adaptations/{id}/decision` - Commit adaptation decisions
- `GET /api/health/env` - Environment health check
- `GET /app/dev/supabase-check` - Browser Supabase client testing

### 🔧 Enhanced Endpoints
- `GET /api/readiness` - Added partial mode support (206 responses)
- `GET /api/sessions` - Added filtering by `start`, `end`, `sport` parameters
- All endpoints - Security headers, cache control, and correlation IDs

### 🗄️ Database Integration
- **Supabase Setup**: Complete cloud database configuration
- **RLS Security**: Row-level security for all tables
- **Migrations**: Base athlete/plan tables + adaptation storage
- **Dual Clients**: Browser (anon) and server (admin) configurations

### 🛠️ Infrastructure
- **Vercel Deployment**: Production-ready deployment pipeline
- **Environment Configuration**: Comprehensive env var management
- **Package Manager**: Standardized on npm with dependency locks

## 🧪 How to Test

### Quick Test Matrix
| Feature | Command | Expected |
|---------|---------|----------|
| **Missing Readiness** | `curl -X POST /api/adaptations/preview -d '{"date":"2025-09-07","scope":"today"}'` | HTTP 424, Retry-After |
| **Volume Guard** | `curl -X POST /api/adaptations/preview -d '{"date":"2025-09-08","scope":"today"}'` | Guard metrics |
| **Request Correlation** | `curl -H "X-Request-Id: test-123" /api/adaptations/preview` | Same ID returned |
| **Idempotency** | Two calls with same `Idempotency-Key` | First: false, Second: true |
| **Security Headers** | `curl -i /api/plan` | Cache-Control, X-Content-Type-Options |
| **Auth Prod Mode** | `AUTH_MODE=prod curl /api/adaptations/preview` | HTTP 401, WWW-Authenticate |

### Development Setup
```bash
# Start server
npm run dev

# Set test variables
export X_ATHLETE_ID="00000000-0000-0000-0000-000000000001"
export API_BASE="http://localhost:3000"
export TODAY="2025-09-06"
```

### Sample Test Commands

**Test Missing Readiness (H1):**
```bash
curl -s -i -X POST "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d '{"date":"2025-09-07","scope":"today"}'
# Expected: 424, Retry-After: 300, error code: UNPROCESSABLE_DEPENDENCY
```

**Test Volume Guard (H2):**
```bash
curl -s "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d '{"date":"2025-09-08","scope":"today"}' | jq '.data_snapshot.volume_guard'
# Expected: Guard metrics showing weekly volume analysis
```

**Test Idempotency (H4):**
```bash
IDEM_KEY="550e8400-e29b-41d4-a716-446655440000"

# First call
curl -s -i -X POST "$API_BASE/api/adaptations/preview" \
  -H "Idempotency-Key: $IDEM_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d '{"date":"2025-09-15","scope":"today"}' | grep "Idempotency-Replayed"
# Expected: Idempotency-Replayed: false

# Replay call
curl -s -i -X POST "$API_BASE/api/adaptations/preview" \
  -H "Idempotency-Key: $IDEM_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Athlete-Id: $X_ATHLETE_ID" \
  -d '{"date":"2025-09-15","scope":"today"}' | grep "Idempotency-Replayed"
# Expected: Idempotency-Replayed: true, same adaptation_id
```

**Test Production Auth (H6):**
```bash
# Production mode
export AUTH_MODE=prod

# No auth → 401
curl -s -i "$API_BASE/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-09-06","scope":"today"}'
# Expected: HTTP 401, WWW-Authenticate header

# Valid JWT format → 200
HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr -d '=' | tr '+/' '-_')
PAYLOAD=$(echo -n '{"sub":"user_123","exp":9999999999}' | base64 | tr -d '=' | tr '+/' '-_')
JWT_TOKEN="$HEADER.$PAYLOAD.signature"

curl -s "$API_BASE/api/adaptations/preview" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-09-06","scope":"today"}' | jq -r '.adaptation_id'
# Expected: Valid UUID adaptation ID
```

## 📚 Documentation

- **Full Testing Guide**: [README-dev.md](./README-dev.md)
- **API Specification**: [OpenAPI 1.0.1](./openapi/momentom_api_openapi_1.0.1.yaml)
- **Environment Setup**: [.env.example](./.env.example)

## 🚨 Known Limitations

### 🔬 Test Data & Mocking
- **Mock Data Only**: All endpoints currently use in-memory mock data
- **Fixed Scenarios**: Readiness data simulates missing data for `2025-09-07`
- **Static Athletes**: Limited to predefined athlete IDs for testing
- **No Real Integrations**: Strava, Garmin, and other integrations are API-only stubs

### 🏗️ Infrastructure
- **No Real AI/ML**: Adaptation generation uses rule-based logic, not actual ML models
- **Basic RLS**: Row-level security implementation is minimal for MVP
- **Memory Constraints**: Large datasets may cause performance issues
- **No Rate Limiting**: Production should implement request throttling

### 🔐 Security
- **JWT Validation**: Basic token format checking only, no signature verification
- **Development Fallbacks**: Debug bypasses should be disabled in true production
- **Cookie Support**: Session-based auth not yet implemented
- **CORS**: Basic cross-origin configuration, may need refinement

### 📊 Observability
- **Basic Logging**: Structured logs available but no external telemetry
- **No Metrics**: Performance metrics collection not implemented
- **Error Tracking**: Basic error responses, no crash reporting integration
- **No Distributed Tracing**: Request correlation limited to single service

### 🎯 Functional
- **Single Athlete Focus**: Multi-athlete scenarios not fully tested
- **Timezone Handling**: Limited timezone-aware calculations
- **Batch Operations**: No bulk adaptation processing
- **Coach Features**: Coach portal functionality is placeholder-only

## 🔄 Migration Guide

This is the initial MVP release. No migrations required.

Future releases will include database migration scripts in `supabase/migrations/`.

## 🚀 Deployment

**Production URL**: https://momentom-6b26aaf68-chris-1175s-projects.vercel.app

**Environment Requirements**:
- Node.js 18+
- npm 9+
- Supabase project with environment variables configured

**Key Environment Variables**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_MODE=prod
READINESS_STRICT=0
DECISION_GUARD_MODE=clamp
```

## 🎉 Acknowledgments

This release establishes the foundation for Momentom's intelligent training adaptation system, delivering both core functionality and enterprise-grade reliability features in a single coordinated release.

---
**Next Release**: v0.2.0 will focus on real AI/ML integration, enhanced coach features, and external service integrations.
