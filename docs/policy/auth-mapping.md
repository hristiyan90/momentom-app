# Auth Mapping (JWT → athlete_id)

## TL;DR
- **Production**: Extract `athlete_id` from Supabase JWT `user_metadata.athlete_id` or fallback to `sub` (if UUID).
- **Development**: Allow `X-Athlete-Id` header override when `AUTH_MODE=dev` and `ALLOW_HEADER_OVERRIDE=1`.
- **Error handling**: Return specific error messages for debugging.

## Policy

### Production Mode (`AUTH_MODE=prod`)
1. Extract JWT from `Authorization: Bearer <token>` header
2. Verify JWT signature using `SUPABASE_JWT_SECRET`
3. Extract `athlete_id` from:
   - `user_metadata.athlete_id` (preferred)
   - `sub` claim (if valid UUID format)
4. Return 401 with specific error if extraction fails

### Development Mode (`AUTH_MODE=dev`)
1. Check for `X-Athlete-Id` header if `ALLOW_HEADER_OVERRIDE=1`
2. Validate header value is UUID format
3. Fallback to JWT extraction (same as production)
4. Return 401 with specific error if all methods fail

### Error Messages
- `"prod mapping pending (A4)"` - Production mode, no valid JWT
- `"authentication required"` - Development mode, no valid auth
- `"invalid athlete_id format"` - Invalid UUID format in header

## Implementation
- Use `jose` library for JWT verification
- Validate UUID format with regex
- Include error context in response headers
- Log auth attempts for debugging