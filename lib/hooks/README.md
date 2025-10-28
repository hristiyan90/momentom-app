# Session Management Hooks

This directory contains React hooks for managing user authentication and session state in the Momentum fitness app.

## Overview

The session management system provides automatic token refresh, retry logic, and seamless session state management for client-side components.

## Files

- **`useSession.ts`** - Core hook for session management with auto-refresh
- **`SessionProvider.tsx`** - Context provider for global session access
- **`examples/useSession.example.tsx`** - Usage examples and patterns

## Core Hook: `useSession`

### Features

1. **Automatic Session Fetching**
   - Fetches session from Supabase on mount
   - Handles loading and error states
   - Returns null for unauthenticated users

2. **Auto-Refresh Mechanism**
   - Monitors token expiration (checks every 30 seconds)
   - Triggers refresh when < 5 minutes until expiration
   - Prevents concurrent refresh attempts

3. **Retry Logic**
   - 3 maximum retry attempts
   - Exponential backoff: 1s, 2s, 4s between retries
   - Redirects to `/login` after 3 failed attempts

4. **Session State Management**
   - Updates session state on successful refresh
   - Clears error state on successful operations
   - Provides `isRefreshing` flag for UI feedback

### Interface

```typescript
interface UseSessionReturn {
  session: Session | null;      // Current Supabase session
  loading: boolean;              // Initial load state
  error: string | null;          // Error message if any
  isRefreshing: boolean;         // True during refresh operation
}

function useSession(): UseSessionReturn
```

### Basic Usage

```typescript
import { useSession } from '@/lib/hooks/useSession';

function MyComponent() {
  const { session, loading, error, isRefreshing } = useSession();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Please log in</div>;

  return (
    <div>
      <p>Welcome {session.user.email}</p>
      {isRefreshing && <span>Refreshing session...</span>}
    </div>
  );
}
```

## SessionProvider Pattern

For apps that need session data in multiple components, use the `SessionProvider` pattern to avoid prop drilling.

### Setup

Wrap your app in `SessionProvider` (e.g., in `app/layout.tsx`):

```typescript
import { SessionProvider } from '@/lib/hooks/SessionProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Usage with Context

Access session from any nested component:

```typescript
import { useSessionContext } from '@/lib/hooks/SessionProvider';

function UserProfile() {
  const { session, isRefreshing } = useSessionContext();

  if (!session) return null;

  return (
    <div>
      <p>{session.user.email}</p>
      {isRefreshing && <span>Refreshing...</span>}
    </div>
  );
}
```

## Implementation Details

### Refresh Timing

The hook implements the following timing logic:

```
Token Lifespan: 3600 seconds (1 hour)

Timeline:
0s ─────────────── 3300s ─────────── 3600s
     Normal           Warning         Expired
                    (< 5 min)

Actions:
- 3300s: Start 30-second polling
- 3305s: First refresh attempt
- If failed: Retry at 3306s, 3308s, 3312s
- After 3 failures: Redirect to /login
```

### Session Data Flow

```
1. Component Mount
   └─> useSession() calls supabaseClient.auth.getSession()
       └─> Sets session state
           └─> Starts expiration monitoring

2. Expiration Monitoring (every 30 seconds)
   └─> Check time until expiration
       └─> If < 5 minutes:
           └─> Call refreshSession()
               └─> Try supabaseClient.auth.refreshSession()
                   ├─> Success: Update session state
                   └─> Failure: Retry with backoff
                       └─> 3 failures: Redirect to /login

3. User Actions
   └─> Session state available in component
       └─> Use session.access_token for API calls
           └─> Backend validates and auto-refreshes if needed
```

### Why Client-Side Supabase?

The hook uses `supabaseClient.auth.refreshSession()` directly instead of calling a backend API endpoint because:

1. **Efficiency**: Direct Supabase SDK calls are faster and more reliable
2. **Token Security**: Refresh tokens are stored in httpOnly cookies, automatically included in requests
3. **Separation of Concerns**: Backend handles server-side validation, frontend handles client-side state

### Error Handling

The hook handles various error scenarios:

- **No refresh token**: Immediate redirect to `/login`
- **Network errors**: Retry with exponential backoff
- **Invalid token**: Redirect after 3 failed attempts
- **Token expired**: Immediate redirect to `/login`

### Performance Considerations

1. **Prevents Concurrent Refreshes**
   - Uses `useRef` to track refresh state
   - Avoids multiple simultaneous refresh requests

2. **Efficient Polling**
   - Only polls when < 5 minutes until expiration
   - Uses 30-second interval (balance between responsiveness and performance)

3. **Automatic Cleanup**
   - Clears intervals on unmount
   - Prevents memory leaks

## Integration with Backend

The hook integrates with the backend authentication system:

### Backend APIs Used

1. **GET `/api/auth/session`** (optional)
   - Returns user info and expiration time
   - Used by backend for server-side validation
   - Hook uses Supabase client directly instead

2. **Backend `refreshSession()` function**
   - Located in `lib/auth/session.ts`
   - Used by server-side API routes
   - Hook uses similar logic on client-side

### Session Cookie Flow

```
Browser
  ├─> Supabase Client (hook)
  │   ├─> auth.getSession() - reads cookies
  │   └─> auth.refreshSession() - updates cookies
  │
  └─> API Requests
      ├─> Includes: access_token in Authorization header
      └─> Includes: refresh_token in httpOnly cookie

Backend API Route
  └─> getAthleteId() validates access_token
      └─> getSession() extracts tokens
          └─> refreshSession() if needed
```

## Testing Considerations

### Manual Testing

1. **Normal Flow**
   - Log in and observe session state
   - Wait for token to approach expiration
   - Verify auto-refresh occurs

2. **Error Scenarios**
   - Disconnect network during refresh
   - Verify retry logic with exponential backoff
   - Verify redirect after 3 failures

3. **Edge Cases**
   - Token already expired on mount
   - Rapid component mount/unmount
   - Concurrent refresh attempts

### Test Checklist

- [ ] Session loads correctly on mount
- [ ] Loading state shows during initial fetch
- [ ] Auto-refresh triggers at 5 minutes
- [ ] 30-second polling starts in warning period
- [ ] Retry logic executes with proper delays
- [ ] Redirect occurs after 3 failed attempts
- [ ] Session state updates after successful refresh
- [ ] No concurrent refresh attempts
- [ ] Intervals cleared on unmount
- [ ] Error messages display correctly

## Future Enhancements

Potential improvements for future sprints:

1. **Visibility-Based Polling**
   - Pause polling when tab is hidden
   - Resume when tab becomes visible
   - Reduces unnecessary API calls

2. **Session Events**
   - Emit events on session changes
   - Allow components to react to auth state
   - Useful for analytics and logging

3. **Optimistic Refresh**
   - Start refresh earlier for long-running operations
   - Prevent mid-operation token expiration
   - Improve UX for forms and uploads

4. **Session Persistence**
   - Store session metadata in localStorage
   - Faster initial load
   - Reduce flash of "no session" state

5. **Advanced Error Recovery**
   - Distinguish between network errors and auth errors
   - Different retry strategies for different error types
   - User notification before redirect

## Troubleshooting

### Hook not refreshing session

**Symptoms**: Token expires without refresh attempt

**Solutions**:
- Check `session.expires_at` is set correctly
- Verify 30-second interval is running
- Check console for errors
- Ensure `session.refresh_token` exists

### Infinite refresh loop

**Symptoms**: Continuous refresh attempts

**Solutions**:
- Check `refreshInProgress.current` flag is working
- Verify `isRefreshing` state updates correctly
- Check for race conditions in useEffect

### Redirect not working

**Symptoms**: No redirect after failed refreshes

**Solutions**:
- Verify `next/navigation` is imported correctly
- Check router.push() is called
- Ensure `/login` route exists

### Session not updating in UI

**Symptoms**: UI shows stale session data

**Solutions**:
- Check session state is updating in hook
- Verify component is re-rendering
- Check if using SessionProvider correctly

## Related Documentation

- **Auth Spec**: `/docs/specs/auth-spec-v3.md` - Authentication requirements
- **Auth Mapping**: `/docs/specs/auth-mapping.md` - Policy implementation
- **Backend Session**: `/lib/auth/session.ts` - Server-side session management
- **Supabase Auth**: https://supabase.com/docs/guides/auth - Official documentation
