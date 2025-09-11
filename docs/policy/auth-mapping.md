# Auth Mapping (JWT → athlete_id)

## TL;DR
- **Verify** JWT (HS256 via `SUPABASE_JWT_SECRET`) using `Authorization: Bearer <jwt>` or `sb-access-token` cookie.
- **Resolve athlete_id**: prefer `user_metadata.athlete_id` (UUID). If absent, **fallback** to `sub` **only if** it is a UUID. Else **401**.
- **RLS invariant**: every read/write is scoped by `athlete_id`; **no header overrides in prod**.
- **Dev override gating**: `X-Athlete-Id` allowed **only if** `AUTH_MODE != "prod"` **and** `ALLOW_HEADER_OVERRIDE=true`.

## Acceptance
- Valid token with resolvable `athlete_id` → **200**; all queries filtered by `athlete_id`.
- Invalid token → **401** with `WWW-Authenticate: Bearer error="invalid_token"`.
- Cookie or Bearer both supported.
- **Prod** ignores any `X-Athlete-Id` header; **Dev** may enable it behind the env gate above.

## Assumptions
- Supabase issues HS256 JWTs; `SUPABASE_JWT_SECRET` available to the API process.
- JWT payload may include `user_metadata.athlete_id` (as `user_metadata.athlete_id` or `raw_user_meta_data.athlete_id`).
- `sub` is Supabase user id (UUID), usable as athlete_id if and only if the athlete row uses the same UUID.
- Correlation header `X-Request-Id` is added upstream. **No schema changes** in this policy.

---

## Flow

1. **Extract token**
   - Prefer `Authorization: Bearer <jwt>`.
   - If missing, read `sb-access-token` cookie.

2. **Verify** with jose (Node)
   - Algorithm: **HS256**
   - Secret: `SUPABASE_JWT_SECRET`
   - Reject expired, not-before, or alg mismatch.

3. **Decode & map**
   - If `user_metadata.athlete_id` exists and is a **UUID**, use it.
   - Else if `sub` is a **UUID**, use `sub`.
   - Else → **401**.

4. **Enforce RLS**
   - Attach `athlete_id` to request context; all SQL queries include `WHERE athlete_id = ctx.athlete_id`.
   - **Prod**: do **not** accept any header overrides.
   - **Dev**: optional `X-Athlete-Id` override **only if** `AUTH_MODE != "prod"` **and** `ALLOW_HEADER_OVERRIDE=true`.

5. **Audit**
   - On error, respond **401** with `WWW-Authenticate: Bearer error="invalid_token"` and do not leak parsing details.

---

## cURL checks

# 1) Bearer (200)
curl -i -H "Authorization: Bearer $JWT" "$API/plan"

# 2) Cookie (200)
curl -i --cookie "sb-access-token=$JWT" "$API/sessions?start=2025-09-08&end=2025-09-15"

# 3) Invalid (401)
curl -i -H "Authorization: Bearer BAD.TOKEN.STRING" "$API/plan"

# 4) Fallback via sub
# JWT without user_metadata.athlete_id but with UUID sub
curl -i -H "Authorization: Bearer $JWT_NO_META" "$API/readiness?date=2025-09-10"

# 5) Dev override (ignored in prod)
curl -i -H "Authorization: Bearer $JWT" -H "X-Athlete-Id: 11111111-1111-1111-1111-111111111111" "$API/plan"
