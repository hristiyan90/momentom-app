# Authentication Mapping Policy

## Overview

This document defines the authentication mapping behavior for the Momentom API, including development header overrides and production JWT verification.

## Authentication Modes

### Development Mode (`AUTH_MODE=dev`)
- **Header Override**: `X-Athlete-Id` header accepted when `ALLOW_HEADER_OVERRIDE=1`
- **JWT Fallback**: Supabase JWT verification as fallback
- **Error Messages**: Generic "authentication required" for missing credentials
- **Use Case**: Local development, testing, debugging

### Production Mode (`AUTH_MODE=prod`)
- **JWT Required**: Supabase JWT verification mandatory
- **Header Override**: Disabled regardless of `ALLOW_HEADER_OVERRIDE` setting
- **Error Messages**: "prod mapping pending (A4)" for missing/invalid credentials
- **Use Case**: Production deployment, live user authentication

## Environment Variables

### AUTH_MODE
- **Values**: `dev` (default), `prod`
- **Purpose**: Controls authentication strictness
- **Dev Behavior**: Allows header override, generic error messages
- **Prod Behavior**: JWT only, specific error messages

### ALLOW_HEADER_OVERRIDE
- **Values**: `0`, `1` (default in dev), `true`, `false`, `yes`, `no`
- **Purpose**: Controls X-Athlete-Id header acceptance
- **Dev Mode**: Defaults to `1` (enabled)
- **Prod Mode**: Ignored (always disabled)

### SUPABASE_JWT_SECRET
- **Purpose**: Secret key for JWT verification
- **Required**: Only in production mode
- **Format**: Base64-encoded secret from Supabase dashboard
- **Security**: Must be kept secret, not committed to version control

## Header Override Behavior

### X-Athlete-Id Header
- **Format**: UUID v4 format required
- **Validation**: Must pass `isUuid()` function
- **Error**: "invalid athlete id header" for malformed UUIDs
- **Scope**: Only works in development mode with override enabled

### Header Processing
1. Check if `mode !== 'prod'` and `allow === true`
2. Extract `X-Athlete-Id` header value
3. Validate UUID format using regex
4. Return athlete ID if valid, throw error if invalid

## JWT Verification Process

### Token Extraction
1. **Authorization Header**: `Bearer <token>` format
2. **Supabase Cookie**: `sb-access-token` cookie (server-side)
3. **Priority**: Authorization header takes precedence over cookie

### JWT Verification
1. **Algorithm**: HS256 (HMAC with SHA-256)
2. **Secret**: `SUPABASE_JWT_SECRET` environment variable
3. **Library**: `jose` library for verification
4. **Claims**: Extract `sub` and `user_metadata.athlete_id`

### Athlete ID Mapping
1. **Primary**: `user_metadata.athlete_id` (if present and valid UUID)
2. **Fallback**: `sub` claim (if valid UUID)
3. **Error**: "authentication required" if no valid mapping found

## Error Handling

### Development Mode Errors
- **No Credentials**: "authentication required"
- **Invalid JWT**: "invalid token"
- **Invalid Header**: "invalid athlete id header"
- **No Mapping**: "authentication required"

### Production Mode Errors
- **No Credentials**: "prod mapping pending (A4)"
- **Invalid JWT**: "prod mapping pending (A4)"
- **No Mapping**: "prod mapping pending (A4)"
- **Header Override**: "prod mapping pending (A4)" (headers ignored)

## Response Headers

### X-Debug-Auth Header
- **Purpose**: Debug information for authentication state
- **Format**: JSON object with mode, allow, and saw_header flags
- **Example**: `{"mode":"dev","allow":true,"saw_header":true}`
- **Use Case**: Debugging authentication issues

### WWW-Authenticate Header
- **Purpose**: Indicates authentication method required
- **Format**: `Bearer realm="momentom", error="invalid_token"`
- **Use Case**: HTTP 401 responses to guide client authentication

## Security Considerations

### Header Override Security
- **Risk**: Development headers could be exploited in production
- **Mitigation**: Disabled in production mode regardless of environment
- **Validation**: UUID format validation prevents injection attacks

### JWT Security
- **Secret Management**: JWT secret must be properly secured
- **Algorithm**: HS256 is secure for HMAC-based tokens
- **Expiration**: JWT tokens should have appropriate expiration times
- **Validation**: All JWT claims must be validated before use

### Error Message Security
- **Information Disclosure**: Different error messages for dev vs prod
- **Debug Information**: X-Debug-Auth header only in development
- **Logging**: Sensitive information should not be logged

## Implementation Requirements

### Server-Side
1. Check environment variables for mode and override settings
2. Implement header override logic for development mode
3. Implement JWT verification for production mode
4. Return appropriate error messages based on mode
5. Include debug headers in development mode

### Client-Side
1. Include `X-Athlete-Id` header in development requests
2. Include `Authorization: Bearer <token>` header in production requests
3. Handle different error messages appropriately
4. Store and refresh JWT tokens as needed

## Testing Requirements

### Development Mode Tests
- [ ] Header override works with valid UUID
- [ ] Header override fails with invalid UUID
- [ ] JWT fallback works when header not present
- [ ] Error messages are generic and appropriate

### Production Mode Tests
- [ ] Header override is ignored
- [ ] JWT verification works with valid token
- [ ] JWT verification fails with invalid token
- [ ] Error messages indicate "prod mapping pending (A4)"

### Integration Tests
- [ ] Authentication works across all API endpoints
- [ ] Error handling is consistent across endpoints
- [ ] Debug headers are present in development mode
- [ ] Security headers are present in production mode

## Monitoring and Observability

### Metrics
- **Authentication Success Rate**: Percentage of successful authentications
- **Error Distribution**: Breakdown of authentication error types
- **Mode Usage**: Development vs production mode usage

### Logging
- **Authentication Attempts**: Log all authentication attempts
- **Error Details**: Log authentication errors with context
- **Security Events**: Log suspicious authentication patterns

### Alerts
- **High Error Rate**: Alert on high authentication failure rates
- **Invalid Tokens**: Alert on repeated invalid token attempts
- **Header Abuse**: Alert on header override attempts in production

## Migration Strategy

### Development to Production
1. **Environment Setup**: Configure production environment variables
2. **JWT Secret**: Set up Supabase JWT secret
3. **Mode Switch**: Change `AUTH_MODE` to `prod`
4. **Testing**: Verify JWT authentication works
5. **Monitoring**: Set up authentication monitoring

### Rollback Plan
1. **Mode Revert**: Change `AUTH_MODE` back to `dev`
2. **Header Re-enable**: Set `ALLOW_HEADER_OVERRIDE=1`
3. **Verification**: Test header override functionality
4. **Monitoring**: Watch for authentication issues

## Future Enhancements

### Multi-Tenant Support
- **Current**: Single athlete per request
- **Future**: Multiple athletes per organization
- **Implementation**: Organization-based JWT claims

### OAuth Integration
- **Current**: Supabase JWT only
- **Future**: OAuth providers (Google, Apple, etc.)
- **Implementation**: OAuth flow with JWT token exchange

### Session Management
- **Current**: Stateless JWT verification
- **Future**: Session-based authentication
- **Implementation**: Server-side session storage

### Advanced Security
- **Current**: Basic JWT verification
- **Future**: Multi-factor authentication
- **Implementation**: TOTP, SMS, or hardware tokens