# Specification: Complete Supabase Auth Integration

**Task ID:** 1.5-A  
**Sprint:** 1.5 - Foundation & User Lifecycle  
**Owner:** Product Architect  
**Status:** 🏗️ Partially Implemented (RLS policies in PR #30, Auth middleware pending)  
**Updated:** October 12, 2025

---

## 1) Scope

### In Scope
- Complete Supabase Auth signup/login flows
- Email verification (non-blocking)
- Password reset functionality
- JWT → athlete_id resolution and RLS enforcement
- Production vs development authentication modes
- Session management and token refresh
- Complete RLS policies for all athlete-scoped tables

### Out of Scope
- Social login (Google/Apple) - Sprint 2+
- Multi-factor authentication - Sprint 3+
- Account deletion/GDPR compliance - Sprint 5+
- Role-based access control (admin/coach) - Sprint 4+

---

## 2) Requirements

### Functional Requirements

#### FR-1: Signup Flow
- User provides email, password, basic profile (name, date_of_birth)
- System validates email format, password strength (min 8 chars)
- System creates Supabase auth user
- System sends verification email (non-blocking - user can proceed)
- System creates corresponding `athlete_profiles` record with `athlete_id = auth.uid()`
- User redirected to onboarding flow regardless of verification status

#### FR-2: Login Flow
- User provides email and password
- System validates credentials against Supabase Auth
- System issues JWT with 1-hour expiration
- System resolves `athlete_id` from JWT (see FR-4)
- Client stores token in `sb-access-token` cookie

#### FR-3: Email Verification
- **Non-blocking:** Unverified users can access app with banner prompt
- Verification email sent on signup
- User clicks verification link → Supabase confirms email
- Banner removed after verification
- Re-send verification option available in user settings

#### FR-4: JWT → athlete_id Resolution
Priority order:
1. Use `user_metadata.athlete_id` if present (UUID)
2. Fallback to `sub` claim if valid UUID format
3. Return 401 if neither available

#### FR-5: Session Management
- JWT tokens expire after 1 hour
- Client auto-refreshes 5 minutes before expiration
- Refresh token valid for 7 days
- Failed refresh redirects to login

#### FR-6: Password Reset
- User requests reset via email
- System sends reset link (expires in 1 hour)
- User clicks link, provides new password
- System validates password strength and updates

#### FR-7: RLS Enforcement
- All athlete-scoped tables enforce `athlete_id` scoping
- Every SELECT/INSERT/UPDATE/DELETE filtered by `auth.uid()`
- Dev mode override via `X-Athlete-Id` header (gated by env vars)
- Production ignores all header overrides

### Non-Functional Requirements

#### NFR-1: Security
- JWT verification using HS256 with `SUPABASE_JWT_SECRET`
- Reject expired tokens (exp), not-yet-valid tokens (nbf), algorithm mismatches
- Password hashing via Supabase Auth (bcrypt)
- No PII in logs (redact tokens, emails, passwords)

#### NFR-2: Performance
- JWT verification < 10ms
- Auth check middleware overhead < 5ms
- RLS policy queries < 50ms

#### NFR-3: Availability
- Auth service dependency: Supabase Auth (99.9% SLA)
- Graceful degradation: Show cached data if JWT refresh fails temporarily

---

## 3) Data Model & Migrations

### Complete Migration: RLS Policies

**File:** `supabase/migrations/20251011000001_rls_policies.sql`

```sql
-- =====================================================
-- RLS Policies for Athlete-Scoped Tables
-- Sprint 1.5-A: Complete Supabase Auth Integration
-- =====================================================

-- Helper function to get current athlete_id from JWT
CREATE OR REPLACE FUNCTION public.get_current_athlete_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- =====================================================
-- athlete_profiles
-- =====================================================

ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;

-- Read own profile
CREATE POLICY "Athletes read own profile"
  ON public.athlete_profiles
  FOR SELECT
  USING (athlete_id = auth.uid());

-- Insert own profile (signup)
CREATE POLICY "Athletes insert own profile"
  ON public.athlete_profiles
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

-- Update own profile
CREATE POLICY "Athletes update own profile"
  ON public.athlete_profiles
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- No DELETE policy (account deletion is separate Sprint 5 feature)

-- =====================================================
-- athlete_preferences
-- =====================================================

ALTER TABLE public.athlete_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own preferences"
  ON public.athlete_preferences
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes insert own preferences"
  ON public.athlete_preferences
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes update own preferences"
  ON public.athlete_preferences
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- =====================================================
-- race_calendar
-- =====================================================

ALTER TABLE public.race_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own races"
  ON public.race_calendar
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes insert own races"
  ON public.race_calendar
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes update own races"
  ON public.race_calendar
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes delete own races"
  ON public.race_calendar
  FOR DELETE
  USING (athlete_id = auth.uid());

-- =====================================================
-- athlete_constraints
-- =====================================================

ALTER TABLE public.athlete_constraints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own constraints"
  ON public.athlete_constraints
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes insert own constraints"
  ON public.athlete_constraints
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes update own constraints"
  ON public.athlete_constraints
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes delete own constraints"
  ON public.athlete_constraints
  FOR DELETE
  USING (athlete_id = auth.uid());

-- =====================================================
-- sessions (existing table from Cycle 1)
-- =====================================================

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own sessions"
  ON public.sessions
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes insert own sessions"
  ON public.sessions
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes update own sessions"
  ON public.sessions
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes delete own sessions"
  ON public.sessions
  FOR DELETE
  USING (athlete_id = auth.uid());

-- =====================================================
-- readiness_daily (existing table from Cycle 1)
-- =====================================================

ALTER TABLE public.readiness_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own readiness"
  ON public.readiness_daily
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "System insert readiness"
  ON public.readiness_daily
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

-- No UPDATE/DELETE - readiness is immutable after calculation

-- =====================================================
-- plan (existing table from Cycle 1)
-- =====================================================

ALTER TABLE public.plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own plan"
  ON public.plan
  FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "System manage plan"
  ON public.plan
  FOR ALL
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- =====================================================
-- Rollback Script
-- =====================================================

-- To rollback, drop all policies:
-- DROP POLICY "Athletes read own profile" ON public.athlete_profiles;
-- DROP POLICY "Athletes insert own profile" ON public.athlete_profiles;
-- ... (repeat for all policies)
-- DROP FUNCTION public.get_current_athlete_id();
```

### Validation: RLS Test Queries

**File:** `supabase/tests/rls_validation.sql`

```sql
-- =====================================================
-- RLS Validation Tests
-- Run as 3 different test users to verify isolation
-- =====================================================

-- Setup: Create 3 test athletes via Supabase Auth UI
-- athlete1: 11111111-1111-1111-1111-111111111111
-- athlete2: 22222222-2222-2222-2222-222222222222
-- athlete3: 33333333-3333-3333-3333-333333333333

-- Test 1: Athlete 1 can only see own profile
-- (Run with athlete1's JWT)
SELECT * FROM athlete_profiles;
-- Expected: Only athlete1's row

-- Test 2: Athlete 1 cannot see athlete 2's data
-- (Run with athlete1's JWT)
SELECT * FROM athlete_profiles WHERE athlete_id = '22222222-2222-2222-2222-222222222222';
-- Expected: 0 rows

-- Test 3: Cross-athlete session access blocked
-- (Run with athlete2's JWT)
SELECT * FROM sessions WHERE athlete_id = '11111111-1111-1111-1111-111111111111';
-- Expected: 0 rows

-- Test 4: Athlete cannot insert data for another athlete
-- (Run with athlete3's JWT)
INSERT INTO race_calendar (athlete_id, race_date, race_type, priority)
VALUES ('11111111-1111-1111-1111-111111111111', '2025-07-01', 'olympic', 'A');
-- Expected: ERROR - RLS policy violation

-- Test 5: Verify helper function returns correct athlete_id
SELECT get_current_athlete_id();
-- Expected: Returns UUID matching current JWT's auth.uid()
```

---

## 4) API Changes

### Authentication Modes

#### Production Mode (`AUTH_MODE=prod`)
```typescript
// app/lib/auth/middleware.ts
export async function getAuthenticatedAthleteId(request: Request): Promise<string> {
  const token = extractToken(request); // Bearer or sb-access-token cookie
  
  if (!token) {
    throw new UnauthorizedError('Valid JWT token required');
  }
  
  // Verify JWT
  const payload = await verifyJWT(token, process.env.SUPABASE_JWT_SECRET!);
  
  // Resolve athlete_id
  const athleteId = payload.user_metadata?.athlete_id || payload.sub;
  
  if (!isValidUUID(athleteId)) {
    throw new UnauthorizedError('Unable to resolve athlete_id from token');
  }
  
  return athleteId;
}
```

#### Development Mode (`AUTH_MODE=dev` + `ALLOW_HEADER_OVERRIDE=true`)
```typescript
export async function getAuthenticatedAthleteId(request: Request): Promise<string> {
  // Check for dev override
  if (process.env.AUTH_MODE !== 'prod' && process.env.ALLOW_HEADER_OVERRIDE === 'true') {
    const headerAthleteId = request.headers.get('X-Athlete-Id');
    if (headerAthleteId && isValidUUID(headerAthleteId)) {
      console.warn('[DEV MODE] Using X-Athlete-Id header override:', headerAthleteId);
      return headerAthleteId;
    }
  }
  
  // Standard JWT verification
  return getAuthenticatedAthleteIdFromJWT(request);
}
```

### Error Responses

#### 401 Unauthorized - Invalid Token
```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token", error_description="JWT verification failed"
Content-Type: application/json
X-Request-Id: req_abc123

{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Valid JWT token required",
    "request_id": "req_abc123"
  }
}
```

#### 401 Unauthorized - Athlete Mapping Failed
```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token", error_description="athlete_id not found"
Content-Type: application/json
X-Request-Id: req_abc124

{
  "error": {
    "code": "ATHLETE_MAPPING_FAILED",
    "message": "Unable to resolve athlete_id from token",
    "request_id": "req_abc124"
  }
}
```

---

## 5) Implementation Guidance

### File Structure
```
app/
├── lib/
│   └── auth/
│       ├── middleware.ts          # Auth middleware (JWT verification)
│       ├── client.ts              # Supabase client initialization
│       ├── session.ts             # Session management (refresh logic)
│       └── errors.ts              # Auth-specific error classes
├── api/
│   ├── auth/
│   │   ├── signup/route.ts        # POST /api/auth/signup
│   │   ├── login/route.ts         # POST /api/auth/login
│   │   ├── logout/route.ts        # POST /api/auth/logout
│   │   ├── reset-password/route.ts # POST /api/auth/reset-password
│   │   └── verify-email/route.ts  # GET /api/auth/verify-email
│   └── [existing endpoints...]
supabase/
├── migrations/
│   └── 20251011000001_rls_policies.sql
└── tests/
    └── rls_validation.sql
```

### Environment Variables
```bash
# Production
AUTH_MODE=prod
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret
ALLOW_HEADER_OVERRIDE=false

# Development
AUTH_MODE=dev
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret
ALLOW_HEADER_OVERRIDE=true  # Optional: enable X-Athlete-Id override
```

### Session Refresh Logic
```typescript
// app/lib/auth/session.ts
export async function refreshSession(refreshToken: string): Promise<Session> {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  
  if (error) {
    throw new SessionRefreshError('Failed to refresh session', error);
  }
  
  return data.session;
}

// Client-side auto-refresh (5 minutes before expiration)
setInterval(async () => {
  const session = await supabase.auth.getSession();
  const expiresAt = session.data.session?.expires_at;
  
  if (expiresAt && (expiresAt - Date.now() / 1000) < 300) {
    await supabase.auth.refreshSession();
  }
}, 60000); // Check every minute
```

---

## 6) Testing & Validation

### Definition of Done

#### Authentication Flow
- [ ] Signup creates Supabase auth user + athlete_profiles record
- [ ] Email verification sends confirmation email
- [ ] Unverified users can access app with banner prompt
- [ ] Login issues valid JWT with 1-hour expiration
- [ ] Session auto-refreshes 5 minutes before expiration
- [ ] Logout clears session and redirects to login
- [ ] Password reset flow sends email and updates password

#### RLS Enforcement
- [ ] 3-account RLS test passes (no cross-athlete data leakage)
- [ ] All athlete-scoped tables have SELECT/INSERT/UPDATE policies
- [ ] `get_current_athlete_id()` function returns correct UUID
- [ ] Attempting to access another athlete's data returns 0 rows
- [ ] Attempting to insert data for another athlete fails with policy violation

#### Development Mode
- [ ] `X-Athlete-Id` header override works in dev mode
- [ ] Dev override requires `AUTH_MODE=dev` AND `ALLOW_HEADER_OVERRIDE=true`
- [ ] Production mode ignores `X-Athlete-Id` header completely
- [ ] Console warning logged when dev override used

#### Error Handling
- [ ] Invalid JWT returns 401 with `WWW-Authenticate` header
- [ ] Missing token returns 401 with clear error message
- [ ] Expired token triggers auto-refresh
- [ ] Failed refresh after 3 retries redirects to login

#### Documentation
- [ ] `docs/architecture/auth-flow.md` created
- [ ] `docs/architecture/auth-modes.md` created (prod vs dev)
- [ ] Newman tests pass for all auth scenarios
- [ ] RLS validation queries documented

### Manual Test Scenarios

#### Test 1: Signup Flow
```bash
# Create new account
curl -X POST https://api.momentom.app/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newathlete@example.com",
    "password": "SecurePass123!",
    "name": "New Athlete",
    "date_of_birth": "1990-05-15"
  }'

# Expected: 201 Created with JWT token
# Verify: Check inbox for verification email
# Verify: athlete_profiles record created in database
```

#### Test 2: RLS Isolation
```bash
# Login as Athlete 1
TOKEN1=$(curl -X POST https://api.momentom.app/v1/auth/login \
  -d '{"email":"athlete1@example.com","password":"pass123"}' | jq -r '.access_token')

# Login as Athlete 2
TOKEN2=$(curl -X POST https://api.momentom.app/v1/auth/login \
  -d '{"email":"athlete2@example.com","password":"pass123"}' | jq -r '.access_token')

# Athlete 1 gets own plan
curl -H "Authorization: Bearer $TOKEN1" https://api.momentom.app/v1/plan
# Expected: Returns athlete1's plan

# Athlete 2 gets own plan
curl -H "Authorization: Bearer $TOKEN2" https://api.momentom.app/v1/plan
# Expected: Returns athlete2's plan (different from athlete1)

# Verify tokens don't cross-access
curl -H "Authorization: Bearer $TOKEN1" https://api.momentom.app/v1/sessions | jq '.sessions | length'
curl -H "Authorization: Bearer $TOKEN2" https://api.momentom.app/v1/sessions | jq '.sessions | length'
# Expected: Different session counts, no overlap
```

#### Test 3: Dev Mode Override
```bash
# Set env vars: AUTH_MODE=dev, ALLOW_HEADER_OVERRIDE=true

# Access as athlete via header override
curl -H "X-Athlete-Id: 11111111-1111-1111-1111-111111111111" \
  http://localhost:3000/api/plan

# Expected: Returns plan for athlete 11111111...
# Expected: Console warning logged about dev override
```

#### Test 4: Password Reset
```bash
# Request password reset
curl -X POST https://api.momentom.app/v1/auth/reset-password \
  -d '{"email":"athlete1@example.com"}'

# Expected: 200 OK, email sent
# Check inbox, click reset link
# Submit new password
# Login with new password succeeds
```

### Newman/Postman Collection

**File:** `postman/auth-tests.json`

```json
{
  "info": {
    "name": "Sprint 1.5-A: Auth Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Signup - Valid",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/auth/signup",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"password\":\"Pass123!\",\"name\":\"Test\",\"date_of_birth\":\"1990-01-01\"}"
        }
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": [
            "pm.test('Status 201', () => pm.response.to.have.status(201));",
            "pm.test('Returns access_token', () => pm.expect(pm.response.json()).to.have.property('access_token'));"
          ]
        }
      }]
    },
    {
      "name": "Login - Valid Credentials",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"password\":\"Pass123!\"}"
        }
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": [
            "pm.test('Status 200', () => pm.response.to.have.status(200));",
            "pm.collectionVariables.set('auth_token', pm.response.json().access_token);"
          ]
        }
      }]
    },
    {
      "name": "Access Protected Resource",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/plan",
        "header": [
          {"key": "Authorization", "value": "Bearer {{auth_token}}"}
        ]
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": ["pm.test('Status 200', () => pm.response.to.have.status(200));"]
        }
      }]
    },
    {
      "name": "Access Without Token - 401",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/plan"
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": [
            "pm.test('Status 401', () => pm.response.to.have.status(401));",
            "pm.test('WWW-Authenticate header present', () => pm.response.to.have.header('WWW-Authenticate'));"
          ]
        }
      }]
    }
  ]
}
```

---

## 7) Documentation Deliverables

### docs/architecture/auth-flow.md

```markdown
# Authentication Flow

## Overview
Momentom uses Supabase Auth for user authentication with JWT-based session management and Row-Level Security (RLS) enforcement.

## Signup Flow
1. User submits email, password, name, date_of_birth
2. System creates Supabase auth user
3. System sends verification email (non-blocking)
4. System creates athlete_profiles record with athlete_id = auth.uid()
5. User redirected to onboarding (can proceed while unverified)

## Login Flow
1. User submits email and password
2. Supabase Auth validates credentials
3. System issues JWT (1-hour expiration) + refresh token (7-day expiration)
4. Client stores tokens in httpOnly cookies
5. All API requests include JWT in Authorization header

## Session Management
- JWT auto-refreshes 5 minutes before expiration
- Refresh token used to obtain new JWT
- Failed refresh after 3 retries → redirect to login

## RLS Enforcement
- Every database query filtered by auth.uid()
- athlete_id resolved from JWT → used in RLS policies
- No cross-athlete data access possible

## Dev Mode Override
- Enable with: AUTH_MODE=dev + ALLOW_HEADER_OVERRIDE=true
- Use X-Athlete-Id header to impersonate athlete
- Production mode ignores this header completely
```

### docs/architecture/auth-modes.md

```markdown
# Authentication Modes

## Production Mode
**Environment:**
- AUTH_MODE=prod
- ALLOW_HEADER_OVERRIDE=false

**Behavior:**
- All requests must include valid JWT
- athlete_id resolved from JWT only
- X-Athlete-Id header ignored completely
- Strict RLS enforcement

## Development Mode
**Environment:**
- AUTH_MODE=dev
- ALLOW_HEADER_OVERRIDE=true (optional)

**Behavior:**
- Can use X-Athlete-Id header to bypass JWT
- Console warning logged when override used
- Useful for testing multi-athlete scenarios
- Never enable in production

## Security Notes
- Production deployment MUST have AUTH_MODE=prod
- Vercel env vars separated by environment
- No dev overrides in preview/production branches
```

---

## 8) Open Questions - RESOLVED

### Q1: Email Verification Blocking?
**Decision:** Non-blocking. Unverified users can access app with banner prompt. Improves conversion, verification can happen later.

### Q2: Session Expiration Duration?
**Decision:** JWT 1 hour, refresh token 7 days. Balances security and UX. Auto-refresh at 5 min before expiry.

### Q3: athlete_id Source of Truth?
**Decision:** Prefer `user_metadata.athlete_id`, fallback to `sub` if UUID. Allows flexibility for future user→athlete mapping complexity.

### Q4: Dev Override in Preview Env?
**Decision:** No. Preview env uses AUTH_MODE=prod. Dev override only in local development.

---

## 9) Success Criteria

### Must Have
✅ Signup creates auth user + athlete_profiles record  
✅ Login issues JWT with correct athlete_id  
✅ RLS policies prevent cross-athlete data access  
✅ 3-account test passes (complete isolation)  
✅ Session auto-refreshes before expiration  
✅ Dev mode override works (gated by env vars)  
✅ Production mode ignores dev overrides  

### Should Have
✅ Email verification flow complete (non-blocking)  
✅ Password reset flow functional  
✅ Newman tests cover all auth scenarios  
✅ Documentation complete (auth-flow.md, auth-modes.md)  

### Nice to Have
- Auth error analytics (login failures, token refresh failures)
- Rate limiting on auth endpoints
- Account lockout after failed attempts

---

## 10) Implementation Notes

### Critical Path
1. Create RLS policies migration (foundational for all athlete data)
2. Implement JWT verification middleware
3. Add auth routes (signup, login, logout)
4. Test RLS isolation with 3 accounts
5. Add session refresh logic
6. Document auth flow

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS policy gaps | High - data leakage | 3-account test + manual audit |
| JWT secret exposed | Critical - auth bypass | Use env vars, never commit |
| Dev override in prod | High - security breach | Strict env checks, CI validation |
| Session refresh race | Medium - bad UX | Implement mutex/debounce |

### Dependencies
- Supabase project created and configured
- JWT secret available in env vars
- Email service configured (for verification/reset)
- athlete_profiles table exists (from Task 1.5-C)

---

**Status:** ✅ Production-Ready Specification  
**Next Steps:** Implement auth middleware → RLS policies → auth routes → testing