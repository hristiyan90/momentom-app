#!/bin/bash

echo "🧪 Testing Fixed Idempotency Implementation"
echo "=========================================="
echo ""

echo "=== Starting dev server ==="
npm run dev &
SERVER_PID=$!
sleep 5

echo ""
echo "=== Test with fresh date to avoid cache conflicts ==="
KEY="550e8400-e29b-41d4-a716-446655440000"
REQ='{"date":"2025-09-15","scope":"today"}'

echo "Using Idempotency-Key: $KEY"
echo "Using request: $REQ"
echo ""

echo "=== First call (should create new adaptation) ==="
curl -s -D /tmp/h5_preview1_fixed.h -o /tmp/h5_preview1_fixed.json \
  -X POST "http://localhost:3000/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $KEY" \
  -H "X-Client-Timezone: Europe/London" \
  -H "X-Request-Id: hdr_test_fixed_1" \
  -H "X-Athlete-Id: 00000000-0000-0000-0000-000000000001" \
  -d "$REQ"

echo "First call headers:"
grep -Ei '^(idempotency-replayed|idempotency-key):' /tmp/h5_preview1_fixed.h
echo "Expected: Idempotency-Replayed: false"
echo ""

echo "=== Second call (should replay cached adaptation) ==="
curl -s -D /tmp/h5_preview2_fixed.h -o /tmp/h5_preview2_fixed.json \
  -X POST "http://localhost:3000/api/adaptations/preview" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $KEY" \
  -H "X-Client-Timezone: Europe/London" \
  -H "X-Request-Id: hdr_test_fixed_2" \
  -H "X-Athlete-Id: 00000000-0000-0000-0000-000000000001" \
  -d "$REQ"

echo "Second call headers:"
grep -Ei '^(idempotency-replayed|idempotency-key):' /tmp/h5_preview2_fixed.h
echo "Expected: Idempotency-Replayed: true"
echo ""

echo "=== Comparing adaptation IDs ==="
echo "First call adaptation ID:"
jq -r '.adaptation_id' /tmp/h5_preview1_fixed.json
echo "Second call adaptation ID:"
jq -r '.adaptation_id' /tmp/h5_preview2_fixed.json

echo ""
echo "=== Checking if IDs match ==="
if diff <(jq -r '.adaptation_id' /tmp/h5_preview1_fixed.json) <(jq -r '.adaptation_id' /tmp/h5_preview2_fixed.json) >/dev/null 2>&1; then
  echo "✅ Replay returns same adaptation ID"
else
  echo "❌ Replay returns different adaptation ID"
fi

echo ""
echo "=== Stopping server ==="
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "🎯 Test Complete!"
