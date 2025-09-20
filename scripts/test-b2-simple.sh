#!/bin/bash
# Simple B2 Manual Workout Upload Test Suite
# Uses curl commands for reliable testing

set -e

API_BASE="http://localhost:3000/api"
TEST_DIR="test-files"
RESULTS_FILE="test-results.json"

# Initialize results
echo '{"tests":[],"summary":{"passed":0,"failed":0,"total":0}}' > $RESULTS_FILE

# Helper function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_status="$3"
    local description="$4"
    
    echo "🧪 Testing: $test_name"
    
    # Run the command and capture output
    local output
    local status_code
    
    if output=$(eval "$command" 2>&1); then
        status_code=0
    else
        status_code=$?
    fi
    
    # Extract HTTP status code from curl output if available
    local http_status=$(echo "$output" | grep -o "HTTP/[0-9.]* [0-9]*" | tail -1 | awk '{print $2}' || echo "unknown")
    
    # Check if test passed
    local passed=false
    if [[ "$http_status" == "$expected_status" ]]; then
        passed=true
        echo "✅ $test_name - PASSED"
    else
        echo "❌ $test_name - FAILED (Expected: $expected_status, Got: $http_status)"
        echo "   Output: $output"
    fi
    
    # Update results JSON
    local temp_file=$(mktemp)
    jq --arg name "$test_name" \
       --argjson passed "$passed" \
       --arg status "$http_status" \
       --arg output "$output" \
       --arg description "$description" \
       '.tests += [{"name": $name, "passed": $passed, "status": $status, "output": $output, "description": $description}]' \
       $RESULTS_FILE > $temp_file && mv $temp_file $RESULTS_FILE
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s http://localhost:3000/api/ingest/workout > /dev/null 2>&1; then
    echo "❌ Server is not running. Please start with 'npm run dev'"
    exit 1
fi
echo "✅ Server is running"

echo "🚀 Starting B2 Manual Workout Upload Test Suite..."
echo ""

# Test 1: Valid TCX file upload
run_test "Valid TCX Upload" \
    "curl -s -w 'HTTP/%{http_version} %{http_code}' -X POST $API_BASE/ingest/workout -F 'file=@$TEST_DIR/small.tcx' -F 'source=test' -F 'notes=Test upload'" \
    "201" \
    "Upload a valid TCX file and expect 201 Created"

# Test 2: Valid GPX file upload  
run_test "Valid GPX Upload" \
    "curl -s -w 'HTTP/%{http_version} %{http_code}' -X POST $API_BASE/ingest/workout -F 'file=@$TEST_DIR/sample.gpx' -F 'source=test'" \
    "201" \
    "Upload a valid GPX file and expect 201 Created"

# Test 3: Invalid file type
run_test "Invalid File Type" \
    "curl -s -w 'HTTP/%{http_version} %{http_code}' -X POST $API_BASE/ingest/workout -F 'file=@$TEST_DIR/invalid.xml' -F 'source=test'" \
    "415" \
    "Upload invalid file type and expect 415 Unsupported Media Type"

# Test 4: Missing file
run_test "Missing File" \
    "curl -s -w 'HTTP/%{http_version} %{http_code}' -X POST $API_BASE/ingest/workout -F 'source=test'" \
    "400" \
    "Upload without file and expect 400 Bad Request"

# Test 5: Malformed TCX file
run_test "Malformed TCX" \
    "curl -s -w 'HTTP/%{http_version} %{http_code}' -X POST $API_BASE/ingest/workout -F 'file=@$TEST_DIR/malformed.tcx' -F 'source=test'" \
    "500" \
    "Upload malformed TCX and expect 500 Internal Server Error"

# Test 6: Status endpoint (using a known ingest ID from previous tests)
run_test "Status Endpoint" \
    "curl -s -w 'HTTP/%{http_version} %{http_code}' -X GET $API_BASE/ingest/workout/770e2f66-d67a-48a0-a984-4f2b5de1a5eb" \
    "200" \
    "Get status of existing ingest record and expect 200 OK"

# Test 7: Invalid ingest ID format
run_test "Invalid Ingest ID" \
    "curl -s -w 'HTTP/%{http_version} %{http_code}' -X GET $API_BASE/ingest/workout/invalid-id" \
    "400" \
    "Get status with invalid ID format and expect 400 Bad Request"

# Test 8: Unsupported method on GET endpoint
run_test "Unsupported Method on GET" \
    "curl -s -w 'HTTP/%{http_version} %{http_code}' -X POST $API_BASE/ingest/workout/770e2f66-d67a-48a0-a984-4f2b5de1a5eb" \
    "405" \
    "Use POST method on GET endpoint and expect 405 Method Not Allowed"

# Test 9: Unsupported method on POST endpoint
run_test "Unsupported Method on POST" \
    "curl -s -w 'HTTP/%{http_version} %{http_code}' -X GET $API_BASE/ingest/workout" \
    "405" \
    "Use GET method on POST endpoint and expect 405 Method Not Allowed"

# Calculate summary
echo ""
echo "📊 Test Results Summary:"

passed=$(jq '.tests | map(select(.passed == true)) | length' $RESULTS_FILE)
failed=$(jq '.tests | map(select(.passed == false)) | length' $RESULTS_FILE)
total=$(jq '.tests | length' $RESULTS_FILE)

echo "✅ Passed: $passed"
echo "❌ Failed: $failed" 
echo "📈 Total: $total"
echo "🎯 Success Rate: $(( (passed * 100) / total ))%"

# Update summary in results file
jq --argjson passed "$passed" --argjson failed "$failed" --argjson total "$total" \
   '.summary = {"passed": $passed, "failed": $failed, "total": $total}' \
   $RESULTS_FILE > $temp_file && mv $temp_file $RESULTS_FILE

if [ $failed -gt 0 ]; then
    echo ""
    echo "❌ Failed Tests:"
    jq -r '.tests[] | select(.passed == false) | "   - \(.name): \(.description)"' $RESULTS_FILE
fi

echo ""
echo "🎉 Test suite completed!"
echo "📄 Detailed results saved to: $RESULTS_FILE"
