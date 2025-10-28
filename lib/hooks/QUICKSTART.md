# useSession Hook - Quick Start Guide

Get started with session management in 5 minutes.

## Installation

No installation needed! The hook is already part of the project.

## Basic Usage

### Option 1: Direct Hook (Simple Pages)

Use this for individual components or pages that need session data:

```typescript
'use client';

import { useSession } from '@/lib/hooks/useSession';

export function MyProtectedPage() {
  const { session, loading, error, isRefreshing } = useSession();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome {session.user.email}</h1>
      {isRefreshing && <p>Refreshing session...</p>}
    </div>
  );
}
```

### Option 2: SessionProvider (Multiple Components)

Use this when multiple components need session data:

**Step 1**: Wrap your app in `app/layout.tsx`:

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

**Step 2**: Use session in any component:

```typescript
'use client';

import { useSessionContext } from '@/lib/hooks/SessionProvider';

export function UserMenu() {
  const { session, isRefreshing } = useSessionContext();

  if (!session) return null;

  return (
    <div>
      <p>{session.user.email}</p>
      {isRefreshing && <span className="text-xs">Refreshing...</span>}
    </div>
  );
}
```

## What It Does Automatically

1. ✅ Fetches session on component mount
2. ✅ Monitors token expiration every 30 seconds
3. ✅ Auto-refreshes when < 5 minutes remaining
4. ✅ Retries failed refreshes (3 attempts with backoff)
5. ✅ Redirects to `/login` if refresh fails

## Return Values

```typescript
{
  session: Session | null,    // Supabase session object
  loading: boolean,            // True during initial load
  error: string | null,        // Error message if any
  isRefreshing: boolean        // True during refresh
}
```

## Common Patterns

### Show Loading Spinner

```typescript
const { loading } = useSession();

if (loading) {
  return <Spinner />;
}
```

### Protect Routes

```typescript
const { session } = useSession();

if (!session) {
  return <LoginPrompt />;
}

return <ProtectedContent />;
```

### Display User Info

```typescript
const { session } = useSession();

return (
  <div>
    <p>Email: {session.user.email}</p>
    <p>ID: {session.user.id}</p>
  </div>
);
```

### Show Refresh Status

```typescript
const { isRefreshing } = useSession();

return (
  <div>
    {isRefreshing && (
      <div className="badge">
        Refreshing session...
      </div>
    )}
  </div>
);
```

## When to Use Each Pattern

| Scenario | Use |
|----------|-----|
| Single page needs session | Direct `useSession()` |
| Multiple components need session | `SessionProvider` + `useSessionContext()` |
| Check if user is logged in | `session !== null` |
| Show loading state | `loading === true` |
| Handle errors | Check `error` string |
| Show refresh indicator | Check `isRefreshing` |

## Troubleshooting

**Session is null even after login**
- Check if cookies are enabled
- Verify Supabase credentials in `.env.local`
- Check browser console for errors

**Hook causes re-renders**
- Normal behavior during refresh
- Use `React.memo()` for child components if needed

**Redirect loop to /login**
- Token may be expired
- Check refresh token is valid
- Clear cookies and log in again

## Examples

See `/lib/hooks/examples/useSession.example.tsx` for 5 complete examples including:
- Protected pages
- User profiles
- Dashboard headers
- Session expiration timers
- Layout patterns

## Full Documentation

For complete details, see:
- **README**: `/lib/hooks/README.md`
- **Implementation**: `/docs/implementation/useSession-implementation.md`
- **Auth Spec**: `/docs/specs/auth-spec-v3.md`

## Need Help?

Check the full README at `/lib/hooks/README.md` for:
- Implementation details
- Testing guidelines
- Troubleshooting guide
- Advanced features
