# Manual Testing Guide: Sprint 1.5 - Task 3: Authentication Routes

## Overview
This guide provides step-by-step instructions for manually testing all 5 authentication API endpoints.

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Ensure Supabase is configured:**
   - `SUPABASE_URL` in `.env.local`
   - `SUPABASE_ANON_KEY` in `.env.local`
   - `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
   - `NEXT_PUBLIC_BASE_URL` in `.env.local`

3. **Have a terminal ready for cURL commands**

---

## Test 1: Signup - Valid Data

**Expected:** 201 Created with tokens and user info

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "SecurePass123!",
    "name": "Test Athlete",
    "date_of_birth": "1990-01-01"
  }' \
  -v
```

**Verify:**
- Status: 201
- Response has: `access_token`, `refresh_token`, `user` object
- Headers: `X-Request-Id`, `Cache-Control: no-store`
- User record created in Supabase Auth
- `athlete_profiles` record created with matching `athlete_id`

**Save the `access_token` for later tests:**
```bash
export TOKEN="<paste-access-token-here>"
```

---

## Test 2: Signup - Duplicate Email

**Expected:** 409 Conflict

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "SecurePass123!",
    "name": "Test Athlete",
    "date_of_birth": "1990-01-01"
  }' \
  -v
```

Then run the same command again with the same email.

**Verify:**
- Status: 409
- Error message: "Email already exists"

---

## Test 3: Signup - Invalid Email (Client-side Validation)

**Expected:** 400 Bad Request

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "SecurePass123!",
    "name": "Test Athlete",
    "date_of_birth": "1990-01-01"
  }' \
  -v
```

**Verify:**
- Status: 400
- Error message: "Invalid email format" (caught by client-side validation)

---

## Test 3b: Signup - Invalid Email (Server-side Validation)

**Expected:** 400 Bad Request

This tests Supabase's email validation (e.g., invalid domain):

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-invalid@example.com",
    "password": "SecurePass123!",
    "name": "Test Athlete",
    "date_of_birth": "1990-01-01"
  }' \
  -v
```

**Verify:**
- Status: 400 (not 500)
- Error message: "Invalid email address format. Please use a valid email provider."
- This catches emails that pass our regex but fail Supabase validation

---

## Test 4: Signup - Weak Password

**Expected:** 400 Bad Request

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-weak@example.com",
    "password": "short",
    "name": "Test Athlete",
    "date_of_birth": "1990-01-01"
  }' \
  -v
```

**Verify:**
- Status: 400
- Error message: "Password must be at least 8 characters"

---

## Test 5: Signup - Under 13 Years Old

**Expected:** 400 Bad Request

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-young@example.com",
    "password": "SecurePass123!",
    "name": "Young Athlete",
    "date_of_birth": "'$(date -v-10y +%Y-%m-%d)'"
  }' \
  -v
```

**Verify:**
- Status: 400
- Error message: "Must be at least 13 years old"

---

## Test 6: Login - Valid Credentials

**Expected:** 200 OK with tokens

Use the email from Test 1 (signup):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<email-from-test-1>",
    "password": "SecurePass123!"
  }' \
  -v
```

**Verify:**
- Status: 200
- Response has: `access_token`, `refresh_token`, `user` object
- Headers: `X-Request-Id`, `Cache-Control: no-store`
- Cookies set: `sb-access-token`, `sb-refresh-token`

**Update TOKEN variable:**
```bash
export TOKEN="<new-access-token>"
```

---

## Test 7: Login - Invalid Password

**Expected:** 401 Unauthorized

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<email-from-test-1>",
    "password": "WrongPassword123!"
  }' \
  -v
```

**Verify:**
- Status: 401
- Error message: "Invalid credentials"
- Header: `WWW-Authenticate`

---

## Test 8: Login - Missing Fields

**Expected:** 400 Bad Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<email-from-test-1>"
  }' \
  -v
```

**Verify:**
- Status: 400
- Error message: "Missing required fields"

---

## Test 9: Session - With Valid Token

**Expected:** 200 OK with session data and ETag

```bash
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer $TOKEN" \
  -v
```

**Verify:**
- Status: 200
- Response has: `user` object, `expires_at`
- Headers: `ETag`, `Cache-Control: private, no-cache`, `Vary: Authorization, X-Client-Timezone`

**Save ETag:**
```bash
export ETAG="<paste-etag-header-value>"
```

---

## Test 10: Session - With ETag (304 Not Modified)

**Expected:** 304 Not Modified

```bash
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer $TOKEN" \
  -H "If-None-Match: $ETAG" \
  -v
```

**Verify:**
- Status: 304
- No response body
- Headers: `ETag`, `Cache-Control: private, no-cache`

---

## Test 11: Session - Without Token

**Expected:** 401 Unauthorized

```bash
curl http://localhost:3000/api/auth/session \
  -v
```

**Verify:**
- Status: 401
- Error message about authentication
- Header: `WWW-Authenticate`

---

## Test 12: Password Reset - Valid Email

**Expected:** 200 OK with generic message

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<email-from-test-1>"
  }' \
  -v
```

**Verify:**
- Status: 200
- Message: "If the email exists, a password reset link has been sent"
- Headers: `X-Request-Id`, `Cache-Control: no-store`
- Check email inbox for password reset link (if email service configured)

---

## Test 13: Password Reset - Invalid Email Format

**Expected:** 400 Bad Request

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email"
  }' \
  -v
```

**Verify:**
- Status: 400
- Error message: "Invalid email format"

---

## Test 14: Password Reset - Non-existent Email (Security Test)

**Expected:** 200 OK with same generic message (no email enumeration)

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent-12345@example.com"
  }' \
  -v
```

**Verify:**
- Status: 200 (NOT 404)
- Message: "If the email exists, a password reset link has been sent"
- This prevents email enumeration attacks

---

## Test 15: Logout - With Valid Token

**Expected:** 200 OK

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -v
```

**Verify:**
- Status: 200
- Message: "Successfully logged out"
- Headers: `X-Request-Id`, `Cache-Control: no-store`
- Cookies cleared: `sb-access-token`, `sb-refresh-token` (maxAge=0)

---

## Test 16: Logout - Without Token

**Expected:** 401 Unauthorized

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -v
```

**Verify:**
- Status: 401
- Error message about authentication
- Header: `WWW-Authenticate`

---

## Test 17: Session - After Logout (Token Invalid)

**Expected:** 401 Unauthorized

```bash
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer $TOKEN" \
  -v
```

**Verify:**
- Status: 401
- Token is no longer valid after logout

---

## Automated Testing with Postman/Newman

Run the complete test suite:

```bash
# Install Newman if needed
npm install -g newman

# Run all 18 integration tests
newman run postman/auth-routes-tests.json \
  --environment postman/environments/local.json
```

**Expected:** All 18 tests should pass.

---

## Database Verification

After running tests, verify in Supabase Dashboard:

1. **Auth Users:**
   - Navigate to Authentication > Users
   - Should see test users created from signup tests
   - Check that email_confirmed_at is initially null

2. **Athlete Profiles:**
   - Query: `SELECT * FROM athlete_profiles ORDER BY created_at DESC LIMIT 5;`
   - Should see matching records for each signup
   - Verify default values:
     - `experience_level`: 'beginner'
     - `available_hours_per_week`: 8.0
     - `training_days_per_week`: 4

3. **RLS Policies:**
   - Try querying athlete_profiles as another user
   - Should only see own profile (RLS enforced)

---

## Rollback Verification

To test the rollback mechanism (delete auth user if profile creation fails):

1. **Temporarily break profile creation** by modifying `app/api/auth/signup/route.ts`:
   ```typescript
   // Change athlete_id to an invalid value
   athlete_id: 'invalid-id',
   ```

2. **Attempt signup:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "rollback-test@example.com",
       "password": "SecurePass123!",
       "name": "Rollback Test",
       "date_of_birth": "1990-01-01"
     }'
   ```

3. **Verify:**
   - Should return 500 error
   - Check Supabase Auth: rollback-test@example.com should NOT exist
   - Rollback successfully deleted the orphaned auth user

4. **Revert the change** after testing

---

## Success Criteria

✅ All 18 manual tests pass  
✅ All 30 unit tests pass (`npm test -- lib/auth/__tests__/`)  
✅ No linter errors  
✅ Database records created correctly  
✅ RLS policies enforced  
✅ Rollback mechanism works  
✅ ETag caching works (304 responses)  
✅ No email enumeration (password reset returns 200 for non-existent emails)  
✅ COPPA compliance enforced (age ≥13)

---

## Next Steps

After all tests pass:
1. Report results to user
2. Proceed to C5 verification and PR creation
3. Update STATUS.md and related documentation
4. Create Pull Request with test evidence

---

## Troubleshooting

**Issue:** 500 errors on signup  
**Solution:** Check Supabase credentials in `.env.local`

**Issue:** JWT verification fails  
**Solution:** Ensure `SUPABASE_JWT_SECRET` is set correctly

**Issue:** Cookies not set  
**Solution:** Check browser DevTools > Application > Cookies (secure flag requires HTTPS in production)

**Issue:** Email not sent  
**Solution:** Configure SMTP in Supabase Dashboard > Authentication > Email Templates

**Issue:** RLS policy errors  
**Solution:** Ensure migrations from Task 1 (PR #30) are applied

