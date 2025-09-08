#!/bin/bash

# Momentom H1-H7 Smoke Test Suite
# Tests all hardening features: 424, volume guard, correlation, idempotency, security, auth

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="http://localhost:3000"
TODAY="2025-09-06"
MISSING_DATE="2025-09-07"
FRESH_DATE="2025-09-15"
TIMEZONE="Europe/London"
ATHLETE_ID="00000000-0000-0000-0000-000000000001"
IDEMPOTENCY_KEY="550e8400-e29b-41d4-a716-446655440000"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test results array
declare -a TEST_RESULTS=()

# Helper functions
log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [[ "$status" == "PASS" ]]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✅ $test_name${NC}"
        TEST_RESULTS+=("PASS:$test_name")
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}❌ $test_name${NC}"
        echo -e "${RED}   $message${NC}"
        TEST_RESULTS+=("FAIL:$test_name:$message")
    fi
}

check_status() {
    local response="$1"
    local expected_status="$2"
    local test_name="$3"
    
    local actual_status=$(echo "$response" | head -n 1 | grep -o '[0-9]\{3\}')
    if [[ "$actual_status" == "$expected_status" ]]; then
        log_test "$test_name" "PASS" ""
    else
        log_test "$test_name" "FAIL" "Expected status $expected_status, got $actual_status"
    fi
}

check_header() {
    local response="$1"
    local header_name="$2"
    local expected_value="$3"
    local test_name="$4"
    
    if echo "$response" | grep -qi "$header_name: $expected_value"; then
        log_test "$test_name" "PASS" ""
    else
        local actual_value=$(echo "$response" | grep -i "$header_name:" | head -n 1 | cut -d: -f2 | xargs)
        log_test "$test_name" "FAIL" "Expected $header_name: $expected_value, got: $actual_value"
    fi
}

check_json_field() {
    local response="$1"
    local field_path="$2"
    local expected_value="$3"
    local test_name="$4"
    
    # Extract JSON body from response (find the last line which should be JSON)
    local json_body=$(echo "$response" | tail -n 1)
    local actual_value=$(echo "$json_body" | jq -r "$field_path" 2>/dev/null || echo "null")
    if [[ "$actual_value" == "$expected_value" ]]; then
        log_test "$test_name" "PASS" ""
    else
        log_test "$test_name" "FAIL" "Expected $field_path = $expected_value, got: $actual_value"
    fi
}

check_json_exists() {
    local response="$1"
    local field_path="$2"
    local test_name="$3"
    
    # Extract JSON body from response (find the last line which should be JSON)
    local json_body=$(echo "$response" | tail -n 1)
    if echo "$json_body" | jq -e "$field_path" >/dev/null 2>&1; then
        log_test "$test_name" "PASS" ""
    else
        log_test "$test_name" "FAIL" "Field $field_path does not exist or is null"
    fi
}

# Generate fresh request ID
generate_request_id() {
    python3 -c "import uuid; print(str(uuid.uuid4()))" 2>/dev/null || echo "req-$(date +%s)-$$"
}

# Generate fresh idempotency key
generate_idempotency_key() {
    python3 -c "import uuid; print(str(uuid.uuid4()))" 2>/dev/null || echo "idem-$(date +%s)-$$"
}

echo -e "${BLUE}🧪 Momentom H1-H7 Smoke Test Suite${NC}"
echo "=========================================="
echo ""

# Check if server is running
echo -e "${YELLOW}🔍 Checking server availability...${NC}"
if ! curl -s "$BASE_URL/api/health/env" >/dev/null 2>&1; then
    echo -e "${RED}❌ Server not running at $BASE_URL${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# H1: 424 Readiness Missing + Bypass Mechanisms
echo -e "${BLUE}📋 H1: 424 Readiness Missing + Bypass${NC}"
echo "=========================================="

# H1.1: Missing readiness → 424
echo "Testing missing readiness (424 response)..."
RESPONSE=$(curl -s -i -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -d "{\"date\":\"$MISSING_DATE\",\"scope\":\"today\"}")

check_status "$RESPONSE" "424" "H1.1: Missing readiness returns 424"
check_header "$RESPONSE" "Retry-After" "300" "H1.2: Retry-After header present"
check_json_field "$RESPONSE" ".error.code" "UNPROCESSABLE_DEPENDENCY" "H1.3: Error code correct"
check_json_field "$RESPONSE" ".error.fallback_hint" "partial" "H1.4: Fallback hint correct"

# H1.5: Bypass via query parameter
echo "Testing bypass via query parameter..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/adaptations/preview?allowMissingReadiness=1" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -d "{\"date\":\"$MISSING_DATE\",\"scope\":\"today\"}")

check_json_field "$RESPONSE" ".decision" "proposed" "H1.5: Query bypass works"

# H1.6: Bypass via header
echo "Testing bypass via header..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -H "X-Allow-Missing-Readiness: true" \
    -d "{\"date\":\"$MISSING_DATE\",\"scope\":\"today\"}")

check_json_field "$RESPONSE" ".decision" "proposed" "H1.6: Header bypass works"

echo ""

# H2: Volume Guard + Decision Guardrails
echo -e "${BLUE}📋 H2: Volume Guard + Decision Guardrails${NC}"
echo "============================================="

# H2.1: Preview with volume guard metrics
echo "Testing preview with volume guard..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -d "{\"date\":\"$FRESH_DATE\",\"scope\":\"week\"}")

check_json_exists "$RESPONSE" ".rationale.data_snapshot.volume_guard" "H2.1: Volume guard metrics present"
check_json_field "$RESPONSE" ".decision" "proposed" "H2.2: Preview returns proposed"

# H2.3: Decision clamp mode (default)
ADP_ID=$(echo "$RESPONSE" | jq -r '.adaptation_id')
echo "Testing decision clamp mode..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/adaptations/$ADP_ID/decision" \
    -H "Content-Type: application/json" \
    -d '{"decision":"modified","modified_changes":[{"op":"replace","path":"/sessions/ses_001/planned_duration_min","from":60,"to":120}]}')

check_json_field "$RESPONSE" ".decision" "modified" "H2.3: Decision clamp mode works"
check_json_exists "$RESPONSE" ".plan_version_after" "H2.4: Plan version after present"

# H2.5: Decision block mode (422)
echo "Testing decision block mode..."
RESPONSE=$(curl -s -i -X POST "$BASE_URL/api/adaptations/$ADP_ID/decision" \
    -H "Content-Type: application/json" \
    -H "X-Guard-Mode: block" \
    -d '{"decision":"modified","modified_changes":[{"op":"replace","path":"/sessions/ses_001/planned_duration_min","from":60,"to":120}]}')

check_status "$RESPONSE" "422" "H2.5: Block mode returns 422"

echo ""

# H3: Correlation Headers
echo -e "${BLUE}📋 H3: Correlation Headers${NC}"
echo "============================="

# H3.1: Custom request ID
echo "Testing custom request ID..."
REQUEST_ID=$(generate_request_id)
RESPONSE=$(curl -s -i -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -H "X-Request-Id: $REQUEST_ID" \
    -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}")

check_header "$RESPONSE" "X-Request-Id" "$REQUEST_ID" "H3.1: Custom request ID preserved"
check_header "$RESPONSE" "X-Explainability-Id" "" "H3.2: Explainability ID present"

# H3.3: Auto-generated request ID
echo "Testing auto-generated request ID..."
RESPONSE=$(curl -s -i -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}")

check_header "$RESPONSE" "X-Request-Id" "" "H3.3: Auto-generated request ID present"
check_header "$RESPONSE" "X-Explainability-Id" "" "H3.4: Auto-generated explainability ID present"

echo ""

# H4: Idempotency
echo -e "${BLUE}📋 H4: Idempotency${NC}"
echo "====================="

# H4.1: First call (no replay)
echo "Testing first idempotent call..."
IDEMPOTENCY_KEY=$(generate_idempotency_key)
RESPONSE=$(curl -s -i -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
    -d "{\"date\":\"$FRESH_DATE\",\"scope\":\"today\"}")

check_header "$RESPONSE" "Idempotency-Replayed" "false" "H4.1: First call not replayed"
check_json_field "$RESPONSE" ".decision" "proposed" "H4.2: First call returns proposed"

# H4.3: Replay call (replayed)
echo "Testing idempotent replay..."
RESPONSE=$(curl -s -i -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
    -d "{\"date\":\"$FRESH_DATE\",\"scope\":\"today\"}")

check_header "$RESPONSE" "Idempotency-Replayed" "true" "H4.3: Replay call marked as replayed"
check_json_field "$RESPONSE" ".decision" "proposed" "H4.4: Replay call returns same result"

echo ""

# H5: Security & Cache Headers
echo -e "${BLUE}📋 H5: Security & Cache Headers${NC}"
echo "=================================="

# H5.1: POST routes (no-store)
echo "Testing POST route headers..."
RESPONSE=$(curl -s -i -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}")

check_header "$RESPONSE" "Cache-Control" "no-store" "H5.1: POST routes have no-store"
check_header "$RESPONSE" "X-Content-Type-Options" "nosniff" "H5.2: Security headers present"
check_header "$RESPONSE" "Referrer-Policy" "strict-origin-when-cross-origin" "H5.3: Referrer policy present"

# H5.4: GET readiness (30s cache)
echo "Testing GET readiness headers..."
RESPONSE=$(curl -s -i "http://localhost:3000/api/readiness")

check_header "$RESPONSE" "Cache-Control" "private, max-age=30" "H5.4: Readiness has 30s cache"

# H5.5: GET plan (60s cache)
echo "Testing GET plan headers..."
RESPONSE=$(curl -s -i "http://localhost:3000/api/plan")

check_header "$RESPONSE" "Cache-Control" "private, max-age=60" "H5.5: Plan has 60s cache"

echo ""

# H6: Authentication Modes
echo -e "${BLUE}📋 H6: Authentication Modes${NC}"
echo "============================="

# H6.1: Dev mode - X-Athlete-Id
echo "Testing dev mode with X-Athlete-Id..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -H "X-Athlete-Id: $ATHLETE_ID" \
    -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}")

check_json_field "$RESPONSE" ".decision" "proposed" "H6.1: X-Athlete-Id works in dev"

# H6.2: Dev mode - Bearer DUMMY
echo "Testing dev mode with Bearer DUMMY..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -H "Authorization: Bearer DUMMY" \
    -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}")

check_json_field "$RESPONSE" ".decision" "proposed" "H6.2: Bearer DUMMY works in dev"

# H6.3: Dev mode - no auth (fallback)
echo "Testing dev mode fallback..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/adaptations/preview" \
    -H "Content-Type: application/json" \
    -H "X-Client-Timezone: $TIMEZONE" \
    -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}")

check_json_field "$RESPONSE" ".decision" "proposed" "H6.3: No auth fallback works in dev"

echo ""

# H7: Production Auth Mode (if enabled)
echo -e "${BLUE}📋 H7: Production Auth Mode${NC}"
echo "============================="

# Check if AUTH_MODE is set to prod
if [[ "${AUTH_MODE:-dev}" == "prod" ]]; then
    echo "Testing production auth mode..."
    
    # H7.1: No auth → 401
    echo "Testing no auth in prod mode..."
    RESPONSE=$(curl -s -i -X POST "$BASE_URL/api/adaptations/preview" \
        -H "Content-Type: application/json" \
        -H "X-Client-Timezone: $TIMEZONE" \
        -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}")
    
    check_status "$RESPONSE" "401" "H7.1: No auth returns 401 in prod"
    check_header "$RESPONSE" "WWW-Authenticate" "Bearer realm=\"momentom\"" "H7.2: WWW-Authenticate header present"
    
    # H7.3: Bearer DUMMY → 401
    echo "Testing Bearer DUMMY in prod mode..."
    RESPONSE=$(curl -s -i -X POST "$BASE_URL/api/adaptations/preview" \
        -H "Content-Type: application/json" \
        -H "X-Client-Timezone: $TIMEZONE" \
        -H "Authorization: Bearer DUMMY" \
        -d "{\"date\":\"$TODAY\",\"scope\":\"today\"}")
    
    check_status "$RESPONSE" "401" "H7.3: Bearer DUMMY returns 401 in prod"
else
    echo "AUTH_MODE not set to 'prod', skipping H7 tests"
    log_test "H7.1" "SKIP" "AUTH_MODE not set to prod"
    log_test "H7.2" "SKIP" "AUTH_MODE not set to prod"
    log_test "H7.3" "SKIP" "AUTH_MODE not set to prod"
fi

echo ""

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "==============="
echo -e "Total tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Check the output above for details.${NC}"
    echo ""
    echo "Failed tests:"
    for result in "${TEST_RESULTS[@]}"; do
        if [[ $result == FAIL:* ]]; then
            echo "  - ${result#FAIL:}"
        fi
    done
    exit 1
fi
