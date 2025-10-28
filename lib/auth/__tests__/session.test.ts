// Mock the Supabase client module
jest.mock('../client', () => ({
  supabaseClient: {
    auth: {
      refreshSession: jest.fn(),
      getUser: jest.fn()
    }
  },
  supabaseServer: {
    auth: {
      refreshSession: jest.fn(),
      getUser: jest.fn()
    }
  }
}));

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { refreshSession, getSession } from '../session';
import { SessionRefreshError } from '../errors';
import { supabaseClient } from '../client';
import type { Session, User } from '@supabase/supabase-js';

// Helper to create a mock session
function createMockSession(overrides?: Partial<Session>): Session {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as User,
    ...overrides
  };
}

// Helper to create a mock user
function createMockUser(): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as User;
}

// Helper to create a mock Request with Authorization header and optional cookies
function createMockRequest(token: string, cookies?: string): Request {
  const headers = new Headers({
    'Authorization': `Bearer ${token}`,
    ...(cookies && { 'cookie': cookies })
  });

  return new Request('https://example.com', { headers });
}

// Helper to create a JWT token with specific expiration
function createMockJWT(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: 'user-123', exp }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
}

describe('refreshSession', () => {
  beforeEach(() => {
    (supabaseClient.auth.refreshSession as jest.Mock).mockClear();
    (supabaseClient.auth.getUser as jest.Mock).mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('succeeds on first attempt (no retries needed)', async () => {
    const mockSession = createMockSession();

    (supabaseClient.auth.refreshSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession, user: mockSession.user },
      error: null
    });

    const result = await refreshSession('valid-refresh-token');

    expect(result).toEqual(mockSession);
    expect(supabaseClient.auth.refreshSession).toHaveBeenCalledTimes(1);
    expect(supabaseClient.auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'valid-refresh-token'
    });
  });

  it('retries 3 times on temporary failure', async () => {
    const mockSession = createMockSession();

    // Fail twice, then succeed on third attempt
    (supabaseClient.auth.refreshSession as jest.Mock)
      .mockResolvedValueOnce({
        data: { session: null, user: null },
        error: new Error('Temporary error 1')
      })
      .mockResolvedValueOnce({
        data: { session: null, user: null },
        error: new Error('Temporary error 2')
      })
      .mockResolvedValueOnce({
        data: { session: mockSession, user: mockSession.user },
        error: null
      });

    // Run the refresh in the background while advancing timers
    const promise = refreshSession('valid-refresh-token');

    // First attempt happens immediately (0ms delay), advance through second attempt delay (1 second)
    await jest.advanceTimersByTimeAsync(1000);

    // Advance through third attempt delay (2 seconds)
    await jest.advanceTimersByTimeAsync(2000);

    const result = await promise;

    expect(result).toEqual(mockSession);
    expect(supabaseClient.auth.refreshSession).toHaveBeenCalledTimes(3);
  });

  it('throws SessionRefreshError after 3 failures', async () => {
    // Fail all three attempts
    (supabaseClient.auth.refreshSession as jest.Mock).mockResolvedValue({
      data: { session: null, user: null },
      error: new Error('Persistent error')
    });

    const promise = refreshSession('invalid-refresh-token');

    // First attempt happens immediately (0ms delay), advance through second attempt delay (1 second)
    await jest.advanceTimersByTimeAsync(1000);

    // Advance through third attempt delay (2 seconds)
    await jest.advanceTimersByTimeAsync(2000);

    await expect(promise).rejects.toThrow(SessionRefreshError);
    await expect(promise).rejects.toThrow('Failed to refresh session after 3 attempts');

    expect(supabaseClient.auth.refreshSession).toHaveBeenCalledTimes(3);
  });

  it('uses correct backoff delays (0s, 1s, 2s)', async () => {
    const delays: number[] = [];
    let lastTime = Date.now();

    (supabaseClient.auth.refreshSession as jest.Mock).mockImplementation(async () => {
      const currentTime = Date.now();
      delays.push(currentTime - lastTime);
      lastTime = currentTime;
      return {
        data: { session: null, user: null },
        error: new Error('Force retry')
      };
    });

    const promise = refreshSession('test-token');

    // First call happens immediately
    await Promise.resolve();

    // Advance through second attempt delay (1 second)
    await jest.advanceTimersByTimeAsync(1000);
    await Promise.resolve();

    // Advance through third attempt delay (2 seconds)
    await jest.advanceTimersByTimeAsync(2000);
    await Promise.resolve();

    // Wait for the final rejection
    await expect(promise).rejects.toThrow(SessionRefreshError);

    // Verify delays are correct (0ms, 1000ms, 2000ms)
    expect(delays).toHaveLength(3);
    expect(delays[0]).toBe(0); // First attempt immediate
    expect(delays[1]).toBe(1000); // Second attempt after 1s
    expect(delays[2]).toBe(2000); // Third attempt after 2s
  });

  it('includes original error details in SessionRefreshError', async () => {
    const originalError = new Error('Network timeout');

    (supabaseClient.auth.refreshSession as jest.Mock).mockResolvedValue({
      data: { session: null, user: null },
      error: originalError
    });

    const promise = refreshSession('test-token');

    // Advance through all retries (1s + 2s)
    await jest.advanceTimersByTimeAsync(1000);
    await jest.advanceTimersByTimeAsync(2000);

    try {
      await promise;
      fail('Should have thrown SessionRefreshError');
    } catch (error) {
      expect(error).toBeInstanceOf(SessionRefreshError);
      if (error instanceof SessionRefreshError) {
        expect(error.originalError).toBeDefined();
        expect(error.originalError?.message).toContain('Network timeout');
      }
    }
  });
});

describe('getSession', () => {
  beforeEach(() => {
    (supabaseClient.auth.refreshSession as jest.Mock).mockClear();
    (supabaseClient.auth.getUser as jest.Mock).mockClear();
  });

  it('extracts refresh_token from cookie correctly', async () => {
    const mockUser = createMockUser();
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const token = createMockJWT(expiresAt);

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    const cookies = 'sb-refresh-token=my-refresh-token; other-cookie=value';
    const request = createMockRequest(token, cookies);

    const session = await getSession(request);

    expect(session).not.toBeNull();
    expect(session?.refresh_token).toBe('my-refresh-token');
    expect(session?.access_token).toBe(token);
    expect(session?.user).toEqual(mockUser);
  });

  it('handles missing refresh_token cookie gracefully', async () => {
    const mockUser = createMockUser();
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const token = createMockJWT(expiresAt);

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    const cookies = 'other-cookie=value; another-cookie=data';
    const request = createMockRequest(token, cookies);

    const session = await getSession(request);

    expect(session).not.toBeNull();
    expect(session?.refresh_token).toBe('');
    expect(session?.access_token).toBe(token);
  });

  it('handles missing cookie header gracefully', async () => {
    const mockUser = createMockUser();
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const token = createMockJWT(expiresAt);

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    const request = createMockRequest(token); // No cookies

    const session = await getSession(request);

    expect(session).not.toBeNull();
    expect(session?.refresh_token).toBe('');
    expect(session?.access_token).toBe(token);
  });

  it('returns null when Authorization header is missing', async () => {
    const headers = new Headers();
    const request = new Request('https://example.com', { headers });

    const session = await getSession(request);

    expect(session).toBeNull();
  });

  it('returns null when token verification fails', async () => {
    const token = 'invalid-token';

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid token')
    });

    const request = createMockRequest(token);
    const session = await getSession(request);

    expect(session).toBeNull();
  });

  it('extracts expiration time from JWT payload', async () => {
    const mockUser = createMockUser();
    const expiresAt = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
    const token = createMockJWT(expiresAt);

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    const request = createMockRequest(token);
    const session = await getSession(request);

    expect(session).not.toBeNull();
    expect(session?.expires_at).toBe(expiresAt);
  });

  it('handles malformed JWT gracefully', async () => {
    const mockUser = createMockUser();
    const malformedToken = 'not.a.valid.jwt';

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    const request = createMockRequest(malformedToken);
    const session = await getSession(request);

    expect(session).not.toBeNull();
    // Should fall back to default 1 hour expiration
    expect(session?.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('parses cookies with various spacing', async () => {
    const mockUser = createMockUser();
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const token = createMockJWT(expiresAt);

    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    // Test various cookie formats
    const cookies = 'cookie1=value1;sb-refresh-token=refresh123;  cookie2=value2';
    const request = createMockRequest(token, cookies);

    const session = await getSession(request);

    expect(session).not.toBeNull();
    expect(session?.refresh_token).toBe('refresh123');
  });
});
