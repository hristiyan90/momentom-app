# useSession Hook - Architecture Diagram

Visual guide to understanding the session management system.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Component                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  const { session, loading, error, isRefreshing } =    │  │
│  │         useSession()                                  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   useSession Hook                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   State      │  │   Timers     │  │   Refresh    │     │
│  │  Management  │  │   (30s poll) │  │   Logic      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Client SDK                             │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  auth.getSession()│         │ auth.refreshSession()│     │
│  └──────────────────┘         └──────────────────┘         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Browser Cookies                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  sb-access-token (httpOnly)                          │  │
│  │  sb-refresh-token (httpOnly)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Session Lifecycle

```
1. Component Mount
   │
   ├─► fetchSession()
   │   │
   │   ├─► supabaseClient.auth.getSession()
   │   │   │
   │   │   └─► Reads cookies → Returns Session object
   │   │
   │   └─► setSession(session)
   │       setLoading(false)
   │
   ├─► Start expiration timer (30s interval)
   │
   └─► Component renders with session data

2. During Session (Normal Use)
   │
   ├─► Every 30 seconds: Check time until expiry
   │   │
   │   ├─► If > 5 minutes: Do nothing
   │   │
   │   └─► If < 5 minutes: Trigger refresh
   │       │
   │       └─► Go to step 3
   │
   └─► User continues using app

3. Refresh Triggered
   │
   ├─► Set isRefreshing = true (UI shows indicator)
   │
   ├─► Call refreshSession()
   │   │
   │   ├─► Attempt 1 (0s delay)
   │   │   │
   │   │   ├─► Success → Update session → Done ✅
   │   │   │
   │   │   └─► Failure → Wait 1s → Attempt 2
   │   │       │
   │   │       ├─► Success → Update session → Done ✅
   │   │       │
   │   │       └─► Failure → Wait 2s → Attempt 3
   │   │           │
   │   │           ├─► Success → Update session → Done ✅
   │   │           │
   │   │           └─► Failure → router.push('/login') 🔴
   │   │
   │   └─► Set isRefreshing = false
   │
   └─► Continue monitoring (back to step 2)

4. Session Expired / Refresh Failed
   │
   └─► router.push('/login')
       │
       └─► User must log in again
```

## Auto-Refresh Timeline

```
Hour-long token lifecycle:

0s                                                              3600s
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Normal Use (55 minutes)            Warning (5 minutes)        │
│  - No API calls                     - Check every 30s          │
│  - Token valid                      - Refresh triggered        │
│                                     - Retry if needed          │
│                                                                │
└────────────────────────── 3300s ─────────────────────────────┘
                              ▲
                              │
                        Refresh trigger point
                        (5 minutes before expiry)


Detailed warning period:

3300s    3305s    3310s    3330s    3360s    3390s    3600s
├────────┼────────┼────────┼────────┼────────┼────────┤
│        │        │        │        │        │        │
│ Check  │        │        │ Check  │ Check  │ Check  │ Expired
│ Detect │        │        │        │        │        │
│ < 5min │        │        │        │        │        │
│        │        │        │        │        │        │
└► Trigger refresh                                     │
   │                                                   │
   ├─► Attempt 1 (0s)                                 │
   ├─► Attempt 2 (+1s if needed)                      │
   ├─► Attempt 3 (+3s if needed)                      │
   │                                                   │
   └─► Success: New token valid until ~7200s          │
       Failure: Redirect to /login                    │
```

## Retry Logic Flow

```
refreshSession() called
     │
     ├─► Check if refresh already in progress
     │   │
     │   ├─► Yes: Return false (skip)
     │   └─► No: Set refreshInProgress = true
     │
     ├─► Check if refresh_token exists
     │   │
     │   ├─► No: Redirect to /login immediately
     │   └─► Yes: Continue
     │
     ├─► Attempt 1 (0 seconds delay)
     │   │
     │   ├─► supabaseClient.auth.refreshSession()
     │   │
     │   ├─► Success?
     │   │   ├─► Yes: setSession(newSession)
     │   │   │        return true ✅
     │   │   │
     │   │   └─► No: Continue to Attempt 2
     │
     ├─► Wait 1 second
     │
     ├─► Attempt 2 (1 second delay)
     │   │
     │   ├─► supabaseClient.auth.refreshSession()
     │   │
     │   ├─► Success?
     │   │   ├─► Yes: setSession(newSession)
     │   │   │        return true ✅
     │   │   │
     │   │   └─► No: Continue to Attempt 3
     │
     ├─► Wait 2 seconds
     │
     ├─► Attempt 3 (3 seconds total delay)
     │   │
     │   ├─► supabaseClient.auth.refreshSession()
     │   │
     │   ├─► Success?
     │   │   ├─► Yes: setSession(newSession)
     │   │   │        return true ✅
     │   │   │
     │   │   └─► No: All attempts failed
     │
     └─► All attempts failed (7 seconds total)
         │
         └─► router.push('/login') 🔴
             return false
```

## State Management

```
┌─────────────────────────────────────────────────────────┐
│                    useSession State                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  session: Session | null                                │
│  ├─► null: No active session (logged out)              │
│  └─► Session: Active session with user data            │
│      ├─► access_token: JWT for API requests            │
│      ├─► refresh_token: Token to get new access_token  │
│      ├─► expires_at: Unix timestamp of expiration      │
│      └─► user: User object (id, email, etc.)           │
│                                                          │
│  loading: boolean                                       │
│  ├─► true: Initial session fetch in progress           │
│  └─► false: Session loaded (or confirmed no session)   │
│                                                          │
│  error: string | null                                   │
│  ├─► null: No errors                                   │
│  └─► string: Error message (fetch failed, etc.)        │
│                                                          │
│  isRefreshing: boolean                                  │
│  ├─► true: Token refresh in progress (show UI)         │
│  └─► false: No refresh happening                       │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Internal Refs                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  refreshInProgress: useRef<boolean>                     │
│  ├─► true: Refresh logic executing (prevent concurrent) │
│  └─► false: No refresh in progress                     │
│                                                          │
│  Note: This is separate from isRefreshing state         │
│        - ref: Internal flag (no re-render)              │
│        - state: External UI feedback (triggers render)  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Integration with Backend

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────┐            │
│  │  useSession Hook                        │            │
│  │  - Manages session state                │            │
│  │  - Auto-refreshes token                 │            │
│  │  - Handles retry logic                  │            │
│  └────────────────────────────────────────┘            │
│                      │                                   │
│                      │ Uses                              │
│                      ▼                                   │
│  ┌────────────────────────────────────────┐            │
│  │  Supabase Client SDK                    │            │
│  │  - auth.getSession()                    │            │
│  │  - auth.refreshSession()                │            │
│  └────────────────────────────────────────┘            │
│                      │                                   │
└──────────────────────┼───────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │ (includes cookies)
                       │
┌──────────────────────▼───────────────────────────────────┐
│                    Backend (Server)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────┐            │
│  │  API Routes (e.g., /api/data)          │            │
│  │  - Validates access_token               │            │
│  │  - Uses getAthleteId()                  │            │
│  └────────────────────────────────────────┘            │
│                      │                                   │
│                      │ Uses                              │
│                      ▼                                   │
│  ┌────────────────────────────────────────┐            │
│  │  lib/auth/session.ts                    │            │
│  │  - getSession(): Extract from request   │            │
│  │  - refreshSession(): Server-side refresh│            │
│  └────────────────────────────────────────┘            │
│                      │                                   │
└──────────────────────┼───────────────────────────────────┘
                       │
                       │ Supabase API calls
                       │
┌──────────────────────▼───────────────────────────────────┐
│                  Supabase (Auth Service)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  - Validates tokens                                      │
│  - Issues new tokens                                     │
│  - Manages sessions                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘

Flow Example:

1. User loads page → useSession() → getSession() → Display UI
2. Token about to expire → useSession() → refreshSession() → New token
3. User clicks button → API call → Backend validates → Returns data
4. Token expired → API returns 401 → useSession redirects → /login
```

## Error Handling Flow

```
Error occurs during refresh
     │
     ├─► Error Type: No refresh token
     │   └─► Action: Immediate redirect to /login
     │
     ├─► Error Type: Network error
     │   └─► Action: Retry with backoff
     │       │
     │       ├─► Attempt 1 fails → Wait 1s
     │       ├─► Attempt 2 fails → Wait 2s
     │       ├─► Attempt 3 fails → Wait 4s
     │       └─► All failed → Redirect to /login
     │
     ├─► Error Type: Invalid token (auth error)
     │   └─► Action: Retry with backoff
     │       └─► Same as network error
     │
     └─► Error Type: Token already expired
         └─► Action: Immediate redirect to /login


Error State Management:

┌─────────────────────────────────────────┐
│  Error occurs                            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Log error to console                    │
│  console.error('Refresh failed:', err)   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Check if last attempt                   │
├─────────────────────────────────────────┤
│  If Yes:                                 │
│    └─> router.push('/login')            │
│                                          │
│  If No:                                  │
│    └─> Wait and retry                   │
└─────────────────────────────────────────┘
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────┐
│                Resource Usage per Hour                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Normal Period (55 minutes):                            │
│  ├─► API Calls: 0                                       │
│  ├─► Memory: ~5KB (session object)                     │
│  └─► CPU: ~0% (setTimeout inactive)                    │
│                                                          │
│  Warning Period (5 minutes):                            │
│  ├─► API Calls: 0 (polling uses setTimeout)            │
│  ├─► Memory: ~5KB (same session object)                │
│  └─► CPU: ~0.01% (30s interval checks)                 │
│                                                          │
│  Refresh Operation (1-7 seconds):                       │
│  ├─► API Calls: 1-3 (depending on retries)             │
│  ├─► Memory: ~5KB (session object updated)             │
│  └─► CPU: ~1% (during API call)                        │
│                                                          │
│  Total per Hour:                                        │
│  ├─► API Calls: 2-4 (initial + refresh)                │
│  ├─► Memory: ~5KB steady state                         │
│  └─► CPU: < 0.1% average                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Token Storage                                 │
│  ├─► Access token: Memory only (cleared on close)      │
│  ├─► Refresh token: HttpOnly cookie (JS cannot access) │
│  └─► XSS Protection: No tokens in localStorage         │
│                                                          │
│  Layer 2: Transport Security                            │
│  ├─► HTTPS only: All requests encrypted                │
│  ├─► Secure cookies: Secure flag set                   │
│  └─► SameSite: CSRF protection                         │
│                                                          │
│  Layer 3: Token Validation                              │
│  ├─► Backend validates every request                   │
│  ├─► Short-lived access tokens (1 hour)                │
│  └─► Refresh tokens rotated on use                     │
│                                                          │
│  Layer 4: Error Handling                                │
│  ├─► Failed refresh → Redirect to login                │
│  ├─► No grace period for expired tokens                │
│  └─► Clean session state on error                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Key Timing Values
- **Token lifetime**: 3600 seconds (1 hour)
- **Warning threshold**: 300 seconds (5 minutes)
- **Poll interval**: 30 seconds
- **Max retries**: 3 attempts
- **Retry delays**: 1s, 2s, 4s (exponential backoff)

### Key Functions
- `useSession()`: Main hook
- `fetchSession()`: Get current session
- `refreshSession()`: Refresh with retry logic

### Key States
- `session`: Current session data
- `loading`: Initial load in progress
- `error`: Error message
- `isRefreshing`: Refresh in progress

### Key Events
- Component mount → Fetch session
- < 5 min to expiry → Start polling
- Poll detects expiry soon → Trigger refresh
- Refresh succeeds → Update session
- Refresh fails 3x → Redirect to login

---

For implementation details, see:
- `/lib/hooks/useSession.ts` - Source code
- `/lib/hooks/README.md` - Full documentation
- `/lib/hooks/QUICKSTART.md` - Getting started guide
