# Auth Mapping (JWT → athlete_id)

## Overview
This policy defines the JWT to athlete_id mapping system for authentication and authorization in the Momentom API. It covers JWT verification using Supabase secrets, athlete_id resolution from user metadata, RLS enforcement, and development vs production authentication modes.

**Implementation Reference:** See `docs/specs/1.5-A-complete-supabase-auth.md` for Sprint 1.5 implementation details, code samples, and complete RLS policies.

**Related Documentation:**
- `docs/architecture/auth-flow.md` - Detailed authentication flows
- `docs/architecture/auth-modes.md` - Production vs development modes
- `supabase/migrations/20251011000001_rls_policies.sql` - RLS policy implementation

---

## TL;DR
- **Verify** JWT (HS256 via `SUPABASE_JWT_SECRET`) using `Authorization: Bearer <jwt>` or `sb-access-token` cookie.
- **Resolve athlete_id**: prefer `user_metadata.athlete_id` (UUID). If absent, **fallback** to `sub` **only if** it is a UUID. Else **401**.
- **RLS invariant**: every read/write scoped by `athlete_id`; **no header overrides in prod**.
- **Dev override**: `X-Athlete-Id` allowed **only if** `AUTH_MODE != "prod"` **and** `ALLOW_HEADER_OVERRIDE=true`.

---

## Acceptance
- Valid token → **200**; all queries filtered by `athlete_id`.
- Invalid token → **401** with `WWW-Authenticate: Bearer error="invalid_token"`.
- Both Bearer and Cookie supported.
- **Prod** ignores `X-Athlete-Id`; **Dev** may enable behind env gate.

### Error Response Examples
```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token", error_description="JWT verification failed"
X-Request-Id: req_123456789
Content-Type: application/json

{
  "error": "authentication_required",
  "message": "Valid JWT token required"
}
```

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token", error_description="athlete_id not found"
X-Request-Id: req_123456790
Content-Type: application/json

{
  "error": "athlete_mapping_failed",
  "message": "Unable to resolve athlete_id from token"
}
```

---

## Assumptions
- Supabase issues HS256 JWTs; `SUPABASE_JWT_SECRET` available to API.
- `sub` = Supabase user id (UUID). Only usable if it matches athlete row UUID.
- Correlation header `X-Request-Id` added upstream. No schema changes here.

---

## Flow
1. Extract token → prefer `Authorization: Bearer` → else `sb-access-token` cookie.
2. Verify with `jose` (HS256; secret from `SUPABASE_JWT_SECRET`; reject exp/nbf/alg mismatch).
3. Map athlete_id:  
   - Use `user_metadata.athlete_id` (UUID) if present.  
   - Else if `sub` is UUID → use `sub`.  
   - Else 401.  
4. Enforce RLS: attach `athlete_id` to request context → all SQL filters on it.  
5. Prod ignores overrides. Dev may allow via `X-Athlete-Id` if env-gated.

---

## Session Management

**Token Lifecycle:**
- **JWT Access Token:** 1 hour expiration
- **Refresh Token:** 7 day expiration
- **Auto-Refresh:** Client refreshes 5 minutes before JWT expiration
- **Failed Refresh:** Redirect to login after 3 consecutive failures

**Implementation:** See `docs/specs/1.5-A-complete-supabase-auth.md` Section 5 for session refresh code.

---

## Implementation Notes

### JWT Verification Error Handling
- **Expired token**: Return 401 with `error="invalid_token", error_description="token_expired"`
- **Invalid signature**: Return 401 with `error="invalid_token", error_description="signature_verification_failed"`
- **Missing token**: Return 401 with `error="invalid_token", error_description="token_missing"`
- **Malformed token**: Return 401 with `error="invalid_token", error_description="malformed_token"`

### Environment Variables
- `AUTH_MODE`: Set to `"prod"` for production, `"dev"` for development
- `ALLOW_HEADER_OVERRIDE`: Set to `"true"` to allow `X-Athlete-Id` header in dev mode
- `SUPABASE_JWT_SECRET`: HS256 secret for JWT verification
- `SUPABASE_URL`: Supabase project URL (for additional verification if needed)

### Security Considerations
- **Token Storage**: Never log JWT tokens in plaintext
- **Secret Management**: Use environment variables for `SUPABASE_JWT_SECRET`
- **Header Validation**: Strictly validate `X-Athlete-Id` format (must be valid UUID)
- **Rate Limiting**: Implement rate limiting on auth endpoints
- **Audit Logging**: Log authentication attempts (without sensitive data)

### RLS Implementation
Complete RLS policies provided in `supabase/migrations/20251011000001_rls_policies.sql` including:
- `athlete_profiles` - SELECT/INSERT/UPDATE policies
- `athlete_preferences` - SELECT/INSERT/UPDATE policies
- `race_calendar` - SELECT/INSERT/UPDATE/DELETE policies
- `athlete_constraints` - SELECT/INSERT/UPDATE/DELETE policies
- `sessions` - SELECT/INSERT/UPDATE/DELETE policies
- `readiness_daily` - SELECT/INSERT policies
- `plan` - SELECT/ALL policies

**Validation:** 3-account RLS test required (see `supabase/tests/rls_validation.sql`)

---

## Policy Compliance

**Sprint 1.5 Implementation Must:**
- ✅ Implement all authentication flows per this policy
- ✅ Enforce RLS on every athlete-scoped table
- ✅ Use correct error response formats
- ✅ Gate dev overrides properly (AUTH_MODE + ALLOW_HEADER_OVERRIDE)
- ✅ Pass 3-account RLS isolation test
- ✅ Never expose JWT secrets in logs or client code

**Testing Requirements:**
- Unit tests: JWT verification with valid/invalid/expired tokens
- Integration tests: athlete_id resolution from various token states
- Security tests: 3-account RLS isolation (zero leakage)
- Performance tests: JWT verification < 10ms

**Monitoring:**
- Track authentication success/failure rates
- Monitor JWT verification performance
- Alert on unusual authentication patterns
- Log correlation IDs (X-Request-Id) for request tracing