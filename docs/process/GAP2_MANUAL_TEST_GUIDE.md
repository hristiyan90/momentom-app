# GAP-2 Session Auto-Refresh - Manual Testing Guide

**Date:** October 28, 2025
**Branch:** `feat/gap-2-session-auto-refresh`
**Status:** Ready for Testing

---

## Prerequisites

1. **Checkout the feature branch:**
   ```bash
   git checkout feat/gap-2-session-auto-refresh
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Environment variables set up:**
   - Supabase URL and keys configured
   - `.env.local` file present with credentials

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   - Navigate to `http://localhost:3000`
   - Open DevTools Console (to see session logs)

---

## Test Scenarios

### Test 1: Verify Hook Integration (Quick Check)

**Objective:** Confirm the `useSession` hook is working and fetching session data

**Steps:**
1. Navigate to any protected page (e.g., `/cockpit`, `/profile`, `/onboarding`)
2. Open DevTools Console
3. Look for session-related logs

**Expected Console Output:**
```
Session fetched on mount
Session state: { session: {...}, loading: false, error: null }
```

**Success Criteria:**
- ✅ No console errors
- ✅ Session object present (if logged in)
- ✅ No "SessionProvider not found" errors

---

### Test 2: Session State Display (Component Test)

**Objective:** Create a simple test component to visualize session state

**Create Test Page:** `app/test-session/page.tsx`

```typescript
'use client';

import { useSession } from '@/lib/hooks/useSession';

export default function TestSessionPage() {
  const { session, loading, error, isRefreshing } = useSession();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Session State Test</h1>

      <div className="space-y-4">
        {/* Loading State */}
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Loading:</h2>
          <p className={loading ? "text-yellow-600" : "text-green-600"}>
            {loading ? "🔄 Loading..." : "✅ Loaded"}
          </p>
        </div>

        {/* Refreshing State */}
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Refreshing:</h2>
          <p className={isRefreshing ? "text-blue-600" : "text-gray-600"}>
            {isRefreshing ? "🔄 Refreshing session..." : "⏸️ Not refreshing"}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 border border-red-500 rounded bg-red-50">
            <h2 className="font-semibold text-red-700">Error:</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Session Data */}
        {session && (
          <div className="p-4 border rounded bg-green-50">
            <h2 className="font-semibold text-green-700 mb-2">Session Active:</h2>
            <div className="space-y-2 text-sm">
              <p><strong>User Email:</strong> {session.user.email}</p>
              <p><strong>User ID:</strong> {session.user.id}</p>
              <p><strong>Expires At:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
              <p><strong>Time Until Expiry:</strong> {Math.floor((session.expires_at! - Date.now() / 1000) / 60)} minutes</p>
              <p><strong>Has Refresh Token:</strong> {session.refresh_token ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        )}

        {/* Not Logged In */}
        {!loading && !session && (
          <div className="p-4 border border-yellow-500 rounded bg-yellow-50">
            <h2 className="font-semibold text-yellow-700">Not Logged In</h2>
            <p className="text-yellow-600">Please log in to see session data</p>
          </div>
        )}

        {/* Raw Session JSON */}
        {session && (
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-semibold mb-2">Raw Session Data:</h2>
            <pre className="text-xs overflow-auto max-h-64 bg-gray-100 p-2 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Steps:**
1. Create the test page above
2. Navigate to `http://localhost:3000/test-session`
3. Observe the session state display

**Success Criteria:**
- ✅ Page loads without errors
- ✅ Session state displays correctly
- ✅ User email and ID visible
- ✅ Expires at timestamp is accurate
- ✅ "Has Refresh Token" shows ✅ Yes

---

### Test 3: Auto-Refresh Timer (Quick Simulation)

**Objective:** Test that auto-refresh logic triggers correctly

**Note:** This test simulates the refresh by modifying the session state temporarily

**Create Test Component:** Add to `app/test-session/page.tsx`

```typescript
'use client';

import { useSession } from '@/lib/hooks/useSession';
import { useState } from 'react';

export default function TestSessionPage() {
  const { session, loading, error, isRefreshing } = useSession();
  const [simulatedExpiry, setSimulatedExpiry] = useState<number | null>(null);

  // Simulate near-expiry session
  const simulateNearExpiry = () => {
    if (session) {
      // Set expiry to 4 minutes from now (will trigger refresh at < 5 min)
      const newExpiry = Math.floor(Date.now() / 1000) + 240; // 4 minutes
      setSimulatedExpiry(newExpiry);
      console.log('⚠️ Simulated session expiry set to 4 minutes from now');
      console.log('Auto-refresh should trigger within 30 seconds');
    }
  };

  // Calculate time until expiry
  const expiresAt = simulatedExpiry || session?.expires_at;
  const timeUntilExpiry = expiresAt ? Math.floor((expiresAt - Date.now() / 1000)) : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Session Auto-Refresh Test</h1>

      {/* Previous state display components... */}

      {/* Auto-Refresh Test */}
      {session && (
        <div className="p-4 border rounded bg-blue-50">
          <h2 className="font-semibold text-blue-700 mb-2">Auto-Refresh Test:</h2>

          <div className="space-y-2 mb-4">
            <p><strong>Current Time Until Expiry:</strong> {timeUntilExpiry}s ({Math.floor(timeUntilExpiry / 60)} min)</p>
            <p><strong>Auto-refresh triggers at:</strong> &lt; 300s (5 minutes)</p>
            <p><strong>Will trigger?</strong> {timeUntilExpiry < 300 ? '✅ Yes' : '❌ No'}</p>
          </div>

          <button
            onClick={simulateNearExpiry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Simulate Near-Expiry (4 min)
          </button>

          {simulatedExpiry && (
            <p className="mt-2 text-sm text-blue-600">
              ⚠️ Simulation active. Watch console for refresh attempts.
            </p>
          )}
        </div>
      )}

      {/* Console Log Monitor */}
      <div className="p-4 border rounded bg-gray-50 mt-4">
        <h2 className="font-semibold mb-2">What to Watch in Console:</h2>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Token expires in XXXs, triggering refresh</li>
          <li>Refresh attempt 1/3</li>
          <li>Session refresh successful (or retry messages)</li>
          <li>Refresh already in progress (if concurrent attempts)</li>
        </ul>
      </div>
    </div>
  );
}
```

**Steps:**
1. Update the test page with the above code
2. Navigate to `http://localhost:3000/test-session`
3. Ensure you're logged in
4. Click "Simulate Near-Expiry (4 min)" button
5. Watch console logs (should see refresh trigger within 30 seconds)

**Expected Console Output:**
```
⚠️ Simulated session expiry set to 4 minutes from now
Auto-refresh should trigger within 30 seconds
Token expires in 240s, triggering refresh
Refresh attempt 1/3
Session refresh successful
```

**Success Criteria:**
- ✅ Button click triggers simulation
- ✅ Console shows "Token expires in XXXs, triggering refresh"
- ✅ Console shows "Refresh attempt 1/3"
- ✅ Console shows "Session refresh successful" (if Supabase available)
- ✅ `isRefreshing` state updates during refresh

---

### Test 4: Retry Logic (Network Failure Simulation)

**Objective:** Test retry logic with exponential backoff

**⚠️ Warning:** This requires blocking network requests to Supabase

**Steps:**
1. Open DevTools → Network tab
2. Right-click → "Block request URL"
3. Add pattern: `*supabase.co*` or specific refresh endpoint
4. Navigate to `/test-session`
5. Click "Simulate Near-Expiry (4 min)"
6. Watch console logs

**Expected Console Output:**
```
Token expires in 240s, triggering refresh
Refresh attempt 1/3
Refresh attempt 1 failed: [error message]
Waiting 1000ms before retry attempt 2
Refresh attempt 2/3
Refresh attempt 2 failed: [error message]
Waiting 2000ms before retry attempt 3
Refresh attempt 3/3
Refresh attempt 3 failed: [error message]
All refresh attempts failed, redirecting to login
```

**Expected Behavior:**
- ✅ 3 retry attempts with delays: 1s, 2s
- ✅ After 3 failures, redirect to `/login`

**Success Criteria:**
- ✅ Retry attempts logged correctly
- ✅ Delays match exponential backoff (1s, 2s, 4s)
- ✅ Redirect to `/login` after all failures

---

### Test 5: Real Auto-Refresh (Full Integration)

**Objective:** Test actual auto-refresh in production-like scenario

**⚠️ Note:** This test takes ~55 minutes for real token expiry

**Alternative Quick Method:**
1. Login to application
2. Use browser DevTools to manually edit the session cookie expiry
3. Set cookie to expire in 5 minutes
4. Watch for auto-refresh

**Steps (Quick Method):**
1. Login to the app
2. Open DevTools → Application → Cookies
3. Find `sb-access-token` cookie
4. Decode the JWT (jwt.io) and note the `exp` field
5. Use the test page to monitor refresh behavior

**Steps (Full Method):**
1. Login to the app
2. Keep browser tab open for ~55 minutes
3. Monitor console logs
4. At ~55 min mark, should see auto-refresh trigger
5. Verify session continues without interruption

**Expected Console Output (at ~55 min mark):**
```
Token expires in 298s, triggering refresh
Refresh attempt 1/3
Session refresh successful
```

**Success Criteria:**
- ✅ No logout/redirect at 1-hour mark
- ✅ Seamless session continuation
- ✅ New tokens received
- ✅ User doesn't notice any interruption

---

### Test 6: Multiple Tabs (Session Sync)

**Objective:** Test session synchronization across browser tabs

**Steps:**
1. Open Tab A: Navigate to `/test-session`
2. Open Tab B: Navigate to `/cockpit` (or any protected page)
3. Watch console logs in both tabs
4. In Tab A, click "Simulate Near-Expiry (4 min)"
5. Observe both tabs

**Expected Behavior:**
- Tab A triggers refresh
- Tab B receives updated session (via Supabase client sync)
- Both tabs remain authenticated

**Success Criteria:**
- ✅ Only one tab performs refresh
- ✅ Both tabs receive new session data
- ✅ No duplicate refresh attempts

---

## Quick Verification Checklist

Run through this checklist for a comprehensive test:

**Setup:**
- [ ] Feature branch checked out
- [ ] Development server running
- [ ] Logged in to application
- [ ] DevTools console open

**Basic Functionality:**
- [ ] Session loads on mount
- [ ] `useSession` hook returns session data
- [ ] User email/ID displayed correctly
- [ ] Refresh token present in session

**Auto-Refresh Logic:**
- [ ] Timer checks every 30 seconds (see console logs)
- [ ] Refresh triggers when < 5 min to expiry
- [ ] `isRefreshing` state updates correctly

**Retry Logic:**
- [ ] 3 retry attempts on failure
- [ ] Exponential backoff delays (1s, 2s, 4s)
- [ ] Redirect to login after all failures

**Error Handling:**
- [ ] No unhandled errors in console
- [ ] Graceful handling of missing session
- [ ] Clear error messages

---

## Common Issues & Troubleshooting

### Issue: "useSession is not defined"
**Cause:** Hook not imported correctly
**Fix:** Ensure `import { useSession } from '@/lib/hooks/useSession'`

### Issue: "SessionProvider not found"
**Cause:** App not wrapped in SessionProvider
**Fix:** Add `<SessionProvider>` to app layout (optional for testing, hook works standalone)

### Issue: No refresh token in session
**Cause:** Session fetched from API endpoint instead of Supabase client
**Fix:** Hook uses `supabaseClient.auth.getSession()` which includes refresh_token

### Issue: Refresh doesn't trigger
**Cause:** Session expiry > 5 minutes
**Fix:** Use "Simulate Near-Expiry" button in test page

### Issue: Console shows many refresh attempts
**Cause:** Multiple components using `useSession` hook
**Fix:** Expected behavior - concurrent prevention should stop duplicates

---

## Reporting Results

After testing, please document:

1. **Which tests you ran:**
   - [ ] Test 1: Hook Integration
   - [ ] Test 2: Session State Display
   - [ ] Test 3: Auto-Refresh Timer
   - [ ] Test 4: Retry Logic
   - [ ] Test 5: Real Auto-Refresh
   - [ ] Test 6: Multiple Tabs

2. **What worked:**
   - List successful test scenarios

3. **What didn't work:**
   - List any failures or unexpected behavior
   - Include console errors
   - Include screenshots if helpful

4. **Overall assessment:**
   - Ready for production? (Yes/No)
   - Additional changes needed?

---

## Next Steps After Testing

**If tests pass:**
1. Approve PR #33
2. Merge to main branch
3. Deploy to staging
4. Monitor production logs

**If tests fail:**
1. Document failures in PR comments
2. Request fixes from Claude Code
3. Re-test after fixes

---

**Testing Contact:** Tag me in PR #33 with test results!
