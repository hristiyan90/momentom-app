'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from './useSession';
import type { Session } from '@supabase/supabase-js';

/**
 * Session context value interface
 */
interface SessionContextValue {
  session: Session | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
}

/**
 * Session context for global session access
 */
const SessionContext = createContext<SessionContextValue | undefined>(undefined);

/**
 * SessionProvider component
 * Wraps the application to provide global session state
 *
 * Usage:
 * ```tsx
 * <SessionProvider>
 *   <YourApp />
 * </SessionProvider>
 * ```
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const sessionData = useSession();

  return (
    <SessionContext.Provider value={sessionData}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook to access session context
 * Must be used within a SessionProvider
 *
 * @throws Error if used outside SessionProvider
 * @returns Session context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { session, loading, isRefreshing } = useSessionContext();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!session) return <div>Not logged in</div>;
 *
 *   return <div>Welcome {session.user.email}</div>;
 * }
 * ```
 */
export function useSessionContext() {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error('useSessionContext must be used within SessionProvider');
  }

  return context;
}
