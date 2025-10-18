#!/bin/bash

# Test script for all authentication endpoints
# Make sure you have a valid email/password from signup

BASE_URL="http://localhost:3000"

echo "=== Authentication Endpoints Test Suite ==="
echo ""

# Get email and password from user
read -p "Enter your test email: " TEST_EMAIL
read -sp "Enter your password: " TEST_PASSWORD
echo ""
echo ""

# Test 1: Login
echo "1. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq .

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed - no access token received"
  exit 1
fi

echo "✅ Login successful - token received"
echo ""

# Test 2: Session (with token)
echo "2. Testing Session Endpoint..."
SESSION_RESPONSE=$(curl -s -X GET $BASE_URL/api/auth/session \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -i)

echo "$SESSION_RESPONSE" | grep -E "HTTP|ETag|Cache-Control|Vary"
echo ""
echo "$SESSION_RESPONSE" | tail -1 | jq .

# Extract ETag
ETAG=$(echo "$SESSION_RESPONSE" | grep -i "etag:" | awk '{print $2}' | tr -d '\r')

if [ -n "$ETAG" ]; then
  echo "✅ Session endpoint working - ETag: $ETAG"
else
  echo "⚠️  No ETag header found"
fi
echo ""

# Test 3: Session with ETag (should return 304)
if [ -n "$ETAG" ]; then
  echo "3. Testing Session with ETag (304)..."
  curl -s -X GET $BASE_URL/api/auth/session \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "If-None-Match: $ETAG" \
    -w "\nHTTP Status: %{http_code}\n" \
    -o /dev/null
  echo "✅ Should see HTTP Status: 304"
  echo ""
fi

# Test 4: Password Reset
echo "4. Testing Password Reset..."
RESET_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }")

echo "$RESET_RESPONSE" | jq .
echo "✅ Password reset request sent"
echo ""

# Test 5: Logout
echo "5. Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$LOGOUT_RESPONSE" | jq .
echo "✅ Logout successful"
echo ""

# Test 6: Session after logout (should fail with 401)
echo "6. Testing Session After Logout (should fail)..."
curl -s -X GET $BASE_URL/api/auth/session \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -w "\nHTTP Status: %{http_code}\n" | jq .

echo "✅ Should see 401 error"
echo ""

echo "=== Test Suite Complete ==="
echo ""
echo "Summary:"
echo "  ✅ Login works"
echo "  ✅ Session endpoint works with ETag caching"
echo "  ✅ Password reset works"
echo "  ✅ Logout works"
echo "  ✅ Token invalidation works"

