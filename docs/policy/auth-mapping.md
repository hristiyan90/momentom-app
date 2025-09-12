# Auth Mapping (JWT → athlete_id)

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

## Implementation Notes

### JWT Verification Error Handling
- **Expired token**: Return 401 with `error="invalid_token", error_description="token_expired"`
- **Invalid signature**: Return 401 with `error="invalid_token", error_description="signature_verification_failed"`
- **Missing token**: Return 401 with `error="invalid_token", error_description="token_missing"`
- **Malformed token**: Return 401 with `error="invalid_token", error_description="malformed_token"`

### Optional DDL
```sql
create table if not exists public.athlete_user_map (
  user_sub text primary key,
  athlete_id uuid not null unique
);

insert into public.athlete_user_map (user_sub, athlete_id)
select u.id::text,
       coalesce( (u.raw_user_meta_data->>'athlete_id')::uuid, u.id ) as athlete_id
from auth.users u
on conflict (user_sub) do update
set athlete_id = excluded.athlete_id;

create or replace view public.v_athlete_identity as
select m.user_sub, m.athlete_id from public.athlete_user_map m;