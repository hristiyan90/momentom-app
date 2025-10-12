import { NextRequest } from 'next/server';
import { getAthleteId, getAuthFlags } from '../athlete';
import { UnauthorizedError } from '../errors';
import * as jose from 'jose';

// Mock jose library
jest.mock('jose', () => ({
  jwtVerify: jest.fn()
}));

describe('getAuthFlags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('defaults to dev mode with allow=true', () => {
    delete process.env.AUTH_MODE;
    delete process.env.ALLOW_HEADER_OVERRIDE;
    
    const flags = getAuthFlags();
    expect(flags.mode).toBe('dev');
    expect(flags.allow).toBe(true);
  });

  it('sets prod mode correctly', () => {
    process.env.AUTH_MODE = 'prod';
    
    const flags = getAuthFlags();
    expect(flags.mode).toBe('prod');
    expect(flags.allow).toBe(false);
  });

  it('respects ALLOW_HEADER_OVERRIDE=false in dev mode', () => {
    process.env.AUTH_MODE = 'dev';
    process.env.ALLOW_HEADER_OVERRIDE = 'false';
    
    const flags = getAuthFlags();
    expect(flags.mode).toBe('dev');
    expect(flags.allow).toBe(false);
  });

  it('allows header override when AUTH_MODE=dev and ALLOW_HEADER_OVERRIDE=true', () => {
    process.env.AUTH_MODE = 'dev';
    process.env.ALLOW_HEADER_OVERRIDE = 'true';
    
    const flags = getAuthFlags();
    expect(flags.allow).toBe(true);
  });
});

describe('getAthleteId', () => {
  const originalEnv = process.env;
  const validAthleteId = '11111111-1111-1111-1111-111111111111';
  const validSub = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.SUPABASE_JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Dev mode with X-Athlete-Id header', () => {
    beforeEach(() => {
      process.env.AUTH_MODE = 'dev';
      process.env.ALLOW_HEADER_OVERRIDE = 'true';
    });

    it('returns athlete_id from X-Athlete-Id header when valid UUID', async () => {
      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'x-athlete-id': validAthleteId }
      });

      const result = await getAthleteId(req);
      expect(result).toBe(validAthleteId);
    });

    it('throws UnauthorizedError for invalid UUID in X-Athlete-Id', async () => {
      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'x-athlete-id': 'not-a-uuid' }
      });

      await expect(getAthleteId(req)).rejects.toThrow(UnauthorizedError);
      await expect(getAthleteId(req)).rejects.toMatchObject({
        code: 'INVALID_ATHLETE_ID'
      });
    });

    it('logs warning when using X-Athlete-Id override', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'x-athlete-id': validAthleteId }
      });

      await getAthleteId(req);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[DEV MODE] Using X-Athlete-Id header override:',
        validAthleteId
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Production mode ignores X-Athlete-Id', () => {
    beforeEach(() => {
      process.env.AUTH_MODE = 'prod';
    });

    it('ignores X-Athlete-Id header in prod mode', async () => {
      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'x-athlete-id': validAthleteId }
      });

      await expect(getAthleteId(req)).rejects.toThrow(UnauthorizedError);
      await expect(getAthleteId(req)).rejects.toMatchObject({
        code: 'AUTHENTICATION_REQUIRED'
      });
    });
  });

  describe('JWT verification', () => {
    beforeEach(() => {
      process.env.AUTH_MODE = 'prod';
    });

    it('returns athlete_id from user_metadata when present', async () => {
      (jose.jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          sub: validSub,
          exp: Math.floor(Date.now() / 1000) + 3600,
          user_metadata: { athlete_id: validAthleteId }
        },
        protectedHeader: { alg: 'HS256' }
      });

      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'authorization': 'Bearer valid-token' }
      });

      const result = await getAthleteId(req);
      expect(result).toBe(validAthleteId);
    });

    it('falls back to sub when user_metadata.athlete_id not present', async () => {
      (jose.jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          sub: validSub,
          exp: Math.floor(Date.now() / 1000) + 3600,
          user_metadata: null
        },
        protectedHeader: { alg: 'HS256' }
      });

      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'authorization': 'Bearer valid-token' }
      });

      const result = await getAthleteId(req);
      expect(result).toBe(validSub);
    });

    it('throws AUTHENTICATION_REQUIRED when token missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/plan');

      await expect(getAthleteId(req)).rejects.toThrow(UnauthorizedError);
      await expect(getAthleteId(req)).rejects.toMatchObject({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Valid JWT token required'
      });
    });

    it('throws INVALID_TOKEN when JWT verification fails', async () => {
      (jose.jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid signature'));

      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'authorization': 'Bearer invalid-token' }
      });

      await expect(getAthleteId(req)).rejects.toThrow(UnauthorizedError);
      await expect(getAthleteId(req)).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        message: 'JWT verification failed'
      });
    });

    it('throws TOKEN_EXPIRED when token exp is in the past', async () => {
      (jose.jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          sub: validSub,
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
          user_metadata: { athlete_id: validAthleteId }
        },
        protectedHeader: { alg: 'HS256' }
      });

      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'authorization': 'Bearer expired-token' }
      });

      await expect(getAthleteId(req)).rejects.toThrow(UnauthorizedError);
      await expect(getAthleteId(req)).rejects.toMatchObject({
        code: 'TOKEN_EXPIRED',
        message: 'Token expired'
      });
    });

    it('throws ATHLETE_MAPPING_FAILED when neither metadata nor sub are valid UUIDs', async () => {
      (jose.jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          sub: 'not-a-uuid',
          exp: Math.floor(Date.now() / 1000) + 3600,
          user_metadata: { athlete_id: 'also-not-a-uuid' }
        },
        protectedHeader: { alg: 'HS256' }
      });

      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'authorization': 'Bearer valid-token' }
      });

      await expect(getAthleteId(req)).rejects.toThrow(UnauthorizedError);
      await expect(getAthleteId(req)).rejects.toMatchObject({
        code: 'ATHLETE_MAPPING_FAILED',
        message: 'Unable to resolve athlete_id from token'
      });
    });

    it('extracts token from sb-access-token cookie as fallback', async () => {
      (jose.jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          sub: validSub,
          exp: Math.floor(Date.now() / 1000) + 3600,
          user_metadata: { athlete_id: validAthleteId }
        },
        protectedHeader: { alg: 'HS256' }
      });

      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: {
          'cookie': 'sb-access-token=cookie-token'
        }
      });

      const result = await getAthleteId(req);
      expect(result).toBe(validAthleteId);
    });
  });

  describe('Dev mode with ALLOW_HEADER_OVERRIDE=false', () => {
    beforeEach(() => {
      process.env.AUTH_MODE = 'dev';
      process.env.ALLOW_HEADER_OVERRIDE = 'false';
    });

    it('ignores X-Athlete-Id header when override disabled', async () => {
      const req = new NextRequest('http://localhost:3000/api/plan', {
        headers: { 'x-athlete-id': validAthleteId }
      });

      await expect(getAthleteId(req)).rejects.toThrow(UnauthorizedError);
      await expect(getAthleteId(req)).rejects.toMatchObject({
        code: 'AUTHENTICATION_REQUIRED'
      });
    });
  });
});

