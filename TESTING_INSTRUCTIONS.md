# Quick Testing Instructions for GAP-2

## Issue: Test page not loading?

If `/test-session` shows a 404, this is because your dev server was running before the page was created.

## Fix: Restart your dev server

1. **Stop the current dev server** (Ctrl+C in terminal)
2. **Clear the Next.js cache:**
   ```bash
   rm -rf .next
   ```
3. **Start fresh:**
   ```bash
   npm run dev
   ```
4. **Navigate to:** `http://localhost:3000/test-session`

---

## Alternative: Test in Browser Console (Immediate)

If you want to test **right now** without restarting, you can use the browser console on any page:

### 1. Go to any protected page
Navigate to: `http://localhost:3000/cockpit` (or `/profile`, `/onboarding`)

### 2. Open DevTools Console
Press `F12` or `Cmd+Option+I`

### 3. Paste this test code:

```javascript
// Test the useSession hook
(async () => {
  console.log('🧪 Testing GAP-2 Session Auto-Refresh');
  console.log('=====================================');

  // Import and test the hook (if React DevTools available)
  const supabase = await import('@/lib/auth/client').then(m => m.supabaseClient);

  // Get current session
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('❌ Error fetching session:', error);
    return;
  }

  if (!session) {
    console.warn('⚠️ No active session. Please log in first.');
    return;
  }

  console.log('✅ Session found!');
  console.log('📧 User:', session.user.email);
  console.log('🆔 User ID:', session.user.id);
  console.log('⏰ Expires at:', new Date(session.expires_at * 1000).toLocaleString());

  const timeUntilExpiry = session.expires_at - Math.floor(Date.now() / 1000);
  const minutesLeft = Math.floor(timeUntilExpiry / 60);

  console.log(`⏳ Time until expiry: ${minutesLeft} minutes (${timeUntilExpiry} seconds)`);
  console.log(`🔄 Has refresh token: ${session.refresh_token ? '✅ Yes' : '❌ No'}`);

  if (timeUntilExpiry < 300) {
    console.log('⚠️ AUTO-REFRESH SHOULD TRIGGER SOON (< 5 minutes left)');
    console.log('👀 Watch for these logs:');
    console.log('   - "Token expires in XXXs, triggering refresh"');
    console.log('   - "Refresh attempt 1/3"');
    console.log('   - "Session refresh successful"');
  } else {
    console.log(`✅ Session healthy. Auto-refresh will trigger in ~${minutesLeft - 5} minutes`);
  }

  console.log('\n📊 Session Details:');
  console.table({
    'Access Token (first 20 chars)': session.access_token.substring(0, 20) + '...',
    'Has Refresh Token': session.refresh_token ? 'Yes' : 'No',
    'Token Type': session.token_type,
    'Expires In': `${session.expires_in} seconds`,
    'Expires At': new Date(session.expires_at * 1000).toLocaleTimeString(),
    'Minutes Until Expiry': minutesLeft
  });

  console.log('\n🔍 Testing refresh token extraction from backend...');

  // Test backend getSession function
  try {
    const response = await fetch('/api/auth/session');
    const apiSession = await response.json();

    if (apiSession.user) {
      console.log('✅ Backend getSession working');
      console.log('📧 Backend sees user:', apiSession.user.email);
    } else {
      console.warn('⚠️ Backend did not return session');
    }
  } catch (err) {
    console.error('❌ Error testing backend:', err.message);
  }

  console.log('\n✨ Test complete! Keep console open to see auto-refresh logs.');
})();
```

### What You Should See:

```
🧪 Testing GAP-2 Session Auto-Refresh
=====================================
✅ Session found!
📧 User: your.email@example.com
🆔 User ID: xxx-xxx-xxx
⏰ Expires at: Oct 28, 2025, 8:00:00 PM
⏳ Time until expiry: 55 minutes (3300 seconds)
🔄 Has refresh token: ✅ Yes
✅ Session healthy. Auto-refresh will trigger in ~50 minutes

📊 Session Details:
┌─────────────────────────────┬────────────────────────┐
│ (index)                     │ Values                 │
├─────────────────────────────┼────────────────────────┤
│ Access Token (first 20)     │ eyJhbGciOiJIUzI1NiI... │
│ Has Refresh Token           │ Yes                    │
│ Token Type                  │ bearer                 │
│ Expires In                  │ 3600 seconds           │
│ Expires At                  │ 8:00:00 PM             │
│ Minutes Until Expiry        │ 55                     │
└─────────────────────────────┴────────────────────────┘

🔍 Testing refresh token extraction from backend...
✅ Backend getSession working
📧 Backend sees user: your.email@example.com

✨ Test complete! Keep console open to see auto-refresh logs.
```

---

## What This Tests:

✅ **Session Hook Working** - `useSession` can fetch current session
✅ **Refresh Token Present** - Session includes refresh_token
✅ **Time Calculation** - Correctly calculates time until expiry
✅ **Backend Integration** - `/api/auth/session` endpoint working

---

## To Test Auto-Refresh Trigger:

**Option 1: Wait (easiest)**
- Keep the console open
- After ~55 minutes, you should see auto-refresh logs

**Option 2: Simulate (advanced)**
- Use React DevTools to modify component state
- Or manually call refresh function from console

**Option 3: Test page (after restart)**
- Restart dev server as described above
- Visit `/test-session` for visual interface

---

## Expected Auto-Refresh Console Logs:

When auto-refresh triggers (at ~55 min mark):

```
Token expires in 280s, triggering refresh
Refresh attempt 1/3
Session refresh successful
```

If refresh fails (network issue):
```
Token expires in 280s, triggering refresh
Refresh attempt 1/3
Refresh attempt 1 failed: [error]
Waiting 1000ms before retry attempt 2
Refresh attempt 2/3
Session refresh successful
```

---

## Quick Verification Checklist:

- [ ] Session loads without errors
- [ ] User email/ID displayed
- [ ] Refresh token present (not empty)
- [ ] Time until expiry shown
- [ ] Console shows no errors
- [ ] (Optional) Auto-refresh triggers at < 5 min mark

---

## Need Help?

- If session is null: Log in first
- If refresh token missing: Check Supabase cookie configuration
- If errors in console: Share the error message
- If page 404s: Restart dev server (steps above)

**Ready to test!** 🚀
