#!/bin/bash

# Test script to verify improved email error handling

BASE_URL="http://localhost:3000"

echo "=== Testing Email Error Handling Fix ==="
echo ""

echo "Test 1: Invalid email format (should return 400, not 500)"
echo "Testing: test-invalid@example.com"
echo ""
curl -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-invalid@example.com",
    "password": "SecurePass123!",
    "name": "Test",
    "date_of_birth": "1990-01-01"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq .

echo ""
echo "---"
echo ""

echo "Test 2: Valid email format (should return 201 with tokens)"
echo "Testing: test.athlete.$(date +%s)@gmail.com"
echo ""
VALID_EMAIL="test.athlete.$(date +%s)@gmail.com"
curl -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$VALID_EMAIL\",
    \"password\": \"SecurePass123!\",
    \"name\": \"Test Athlete\",
    \"date_of_birth\": \"1990-01-01\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq -r 'if .access_token then "✅ SUCCESS: Tokens received" else . end'

echo ""
echo "---"
echo ""

echo "Test 3: Client-side validation catches obvious invalid formats"
echo "Testing: not-an-email"
echo ""
curl -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "SecurePass123!",
    "name": "Test",
    "date_of_birth": "1990-01-01"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq .

echo ""
echo "=== Test Complete ==="
echo ""
echo "Expected Results:"
echo "  Test 1: HTTP 400 with 'Invalid email address format' message"
echo "  Test 2: HTTP 201 with tokens"
echo "  Test 3: HTTP 400 with 'Invalid email format' message (client-side validation)"

