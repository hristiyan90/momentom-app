# ETag Policy

## Overview

This document defines the ETag-based conditional request behavior for the Momentom API. ETags provide efficient caching by allowing clients to check if content has changed without downloading the full response.

## ETag Generation

### Algorithm
- **Canonical JSON**: All responses are serialized to canonical JSON with sorted object keys
- **SHA256 Hash**: ETag is generated using SHA256 hash of the canonical JSON body
- **Format**: `"<base64url-encoded-hash>"` (wrapped in quotes)

### Implementation
```typescript
function etagFor(value: unknown): { etag: string; body: string } {
  const body = canonicalJson(value);
  const etag = computeEtagFromBody(body);
  return { etag, body };
}
```

## Conditional Request Handling

### If-None-Match Header
- **Present**: Check if client's ETag matches server's ETag
- **Match**: Return `304 Not Modified` with no body
- **No Match**: Return `200 OK` with full response and new ETag

### Response Headers
- **ETag**: Always present on 200/206 responses
- **Cache-Control**: Appropriate cache hints for each endpoint
- **Vary**: Include `X-Athlete-Id` for proper cache key generation

## Endpoint-Specific Behavior

### `/api/plan`
- **Status Codes**: 200, 304, 401
- **ETag**: Present on 200 responses only
- **Cache-Control**: `private, max-age=60, stale-while-revalidate=60`
- **Notes**: Plan data changes infrequently, longer cache duration

### `/api/readiness`
- **Status Codes**: 200, 206, 304, 401
- **ETag**: Present on 200/206 responses only
- **Cache-Control**: `private, max-age=30, stale-while-revalidate=30`
- **Notes**: Readiness data changes more frequently, shorter cache duration
- **206 Responses**: Partial data due to missing drivers, still gets ETag

### `/api/fuel/session/[id]`
- **Status Codes**: 200, 304, 401, 404
- **ETag**: Present on 200 responses only
- **Cache-Control**: `private, max-age=60, stale-while-revalidate=60`
- **Notes**: 404 responses do NOT include ETag (correct behavior)

## Error Response Behavior

### 401 Unauthorized
- **ETag**: Not present
- **Cache-Control**: `no-store, no-cache, must-revalidate`
- **Reason**: Authentication errors should not be cached

### 404 Not Found
- **ETag**: Not present
- **Cache-Control**: `no-store, no-cache, must-revalidate`
- **Reason**: Not found errors should not be cached

### 500 Internal Server Error
- **ETag**: Not present
- **Cache-Control**: `no-store, no-cache, must-revalidate`
- **Reason**: Server errors should not be cached

## Cache Key Considerations

### Vary Header
- **Required**: `X-Athlete-Id` must be included in Vary header
- **Reason**: Different athletes have different data, cache must be per-athlete
- **Additional**: Standard Next.js vary headers are also included

### Private Caching
- **Scope**: All responses use `private` cache control
- **Reason**: Data is athlete-specific and should not be cached by shared proxies
- **Browser**: Browsers can cache, but CDNs/proxies should not

## Implementation Requirements

### Server-Side
1. Generate canonical JSON for all response data
2. Compute SHA256 hash of JSON body
3. Format as quoted base64url string
4. Check `If-None-Match` header against computed ETag
5. Return 304 if match, 200 with ETag if no match

### Client-Side
1. Store ETag from previous response
2. Include `If-None-Match` header in subsequent requests
3. Handle 304 responses by using cached data
4. Handle 200 responses by updating cache and ETag

## Testing Requirements

### Functional Tests
- [ ] 200 response includes ETag header
- [ ] 304 response when If-None-Match matches
- [ ] 200 response when If-None-Match doesn't match
- [ ] 404 response excludes ETag header
- [ ] 401 response excludes ETag header

### Performance Tests
- [ ] ETag generation is fast (< 1ms)
- [ ] Canonical JSON is deterministic
- [ ] Same data produces same ETag
- [ ] Different data produces different ETag

### Integration Tests
- [ ] ETag works with authentication
- [ ] ETag works with different athletes
- [ ] ETag works with partial responses (206)
- [ ] Cache headers are correct for each endpoint

## Monitoring and Observability

### Metrics
- **ETag Hit Rate**: Percentage of 304 responses
- **ETag Generation Time**: Time to compute ETag
- **Cache Efficiency**: Bandwidth saved by 304 responses

### Logging
- **ETag Mismatches**: Log when client ETag doesn't match server
- **Cache Misses**: Log when no If-None-Match header present
- **Performance**: Log ETag generation time for slow responses

## Security Considerations

### ETag Leakage
- **Risk**: ETag might leak information about data content
- **Mitigation**: Use SHA256 hash, not direct content encoding
- **Review**: Regular security review of ETag generation

### Cache Poisoning
- **Risk**: Malicious ETag values could affect caching
- **Mitigation**: Validate ETag format before comparison
- **Implementation**: Only accept properly formatted ETags

## Future Enhancements

### Weak ETags
- **Current**: Strong ETags (byte-for-byte identical)
- **Future**: Weak ETags for semantic equivalence
- **Use Case**: Minor formatting changes that don't affect content

### ETag Compression
- **Current**: Full SHA256 hash
- **Future**: Truncated hash for smaller headers
- **Trade-off**: Collision risk vs. header size

### Cache Invalidation
- **Current**: Manual cache clearing
- **Future**: Automatic invalidation on data changes
- **Implementation**: Event-driven cache updates