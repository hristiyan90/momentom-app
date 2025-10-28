/**
 * Example Usage: useSession Hook
 *
 * This file demonstrates different ways to use the useSession hook
 * in your components for authentication and session management.
 */

'use client';

import { useSession } from '@/lib/hooks/useSession';
import { useSessionContext } from '@/lib/hooks/SessionProvider';

/**
 * Example 1: Basic usage in a protected page
 * Shows loading state, error handling, and session display
 */
export function ProtectedPage() {
  const { session, loading, error, isRefreshing } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Session Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Active Session</h1>
          <p className="text-gray-600 mb-6">Please log in to access this page.</p>
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h1 className="text-3xl font-bold mb-4">Protected Content</h1>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Email:</strong> {session.user.email}
            </p>
            <p className="text-gray-700">
              <strong>User ID:</strong> {session.user.id}
            </p>
            <p className="text-gray-700">
              <strong>Token expires:</strong>{' '}
              {new Date((session.expires_at || 0) * 1000).toLocaleString()}
            </p>
          </div>

          {/* Show refresh indicator */}
          {isRefreshing && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-700 text-sm">Refreshing session...</span>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Your Protected Content</h2>
          <p className="text-gray-600">
            This content is only visible to authenticated users.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 2: Using SessionProvider for global access
 * This pattern is useful when you need session data in multiple nested components
 */
export function UserProfile() {
  const { session, isRefreshing } = useSessionContext();

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
        {session.user.email?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-medium">{session.user.email}</p>
        {isRefreshing && (
          <p className="text-xs text-gray-500">Refreshing session...</p>
        )}
      </div>
    </div>
  );
}

/**
 * Example 3: Conditional rendering based on session
 */
export function DashboardHeader() {
  const { session, loading } = useSessionContext();

  if (loading) {
    return <div className="h-16 bg-gray-100 animate-pulse"></div>;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">Dashboard</h1>

          {session ? (
            <UserProfile />
          ) : (
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Example 4: Session expiration timer
 * Shows a countdown when session is close to expiring
 */
export function SessionExpirationTimer() {
  const { session, isRefreshing } = useSessionContext();
  const [timeRemaining, setTimeRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!session?.expires_at) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = session.expires_at! - now;
      setTimeRemaining(remaining > 0 ? remaining : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (timeRemaining === null || timeRemaining > 600) {
    // Don't show timer if more than 10 minutes remaining
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
        timeRemaining < 300 ? 'bg-yellow-100 border-yellow-300' : 'bg-blue-100 border-blue-300'
      } border`}
    >
      <div className="flex items-center space-x-3">
        {isRefreshing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Refreshing session...</span>
          </>
        ) : (
          <>
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="text-sm font-medium">Session expires in</p>
              <p className="text-lg font-bold">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Example 5: Layout wrapper with SessionProvider
 * Add this to your app/layout.tsx or a top-level layout
 */
export function RootLayoutWithSession({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main>{children}</main>
        <SessionExpirationTimer />
      </div>
    </SessionProvider>
  );
}
