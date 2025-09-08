import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

// Mock console.log to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

describe('Middleware - Dev Route Protection', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    test('blocks /api/dev/* routes with 404', async () => {
      const request = new NextRequest('http://localhost:3000/api/dev/adapt-cache');
      const response = await middleware(request);
      
      expect(response.status).toBe(404);
      
      const body = await response.json();
      expect(body).toEqual({ error: 'Not found' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🚫 Blocked dev route in production: /api/dev/adapt-cache'
      );
    });

    test('blocks /dev/* routes with 404', async () => {
      const request = new NextRequest('http://localhost:3000/dev/supabase-check');
      const response = await middleware(request);
      
      expect(response.status).toBe(404);
      
      const body = await response.json();
      expect(body).toEqual({ error: 'Not found' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🚫 Blocked dev route in production: /dev/supabase-check'
      );
    });

    test('allows non-dev routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/adaptations/preview');
      const response = await middleware(request);
      
      // NextResponse.next() returns a response with x-middleware-next header
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('blocks nested dev routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/dev/deep/nested/route');
      const response = await middleware(request);
      
      expect(response.status).toBe(404);
      expect(consoleSpy).toHaveBeenCalledWith(
        '🚫 Blocked dev route in production: /api/dev/deep/nested/route'
      );
    });
  });

  describe('in development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    test('allows /api/dev/* routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/dev/adapt-cache');
      const response = await middleware(request);
      
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('allows /dev/* routes', async () => {
      const request = new NextRequest('http://localhost:3000/dev/supabase-check');
      const response = await middleware(request);
      
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('in test environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    test('allows dev routes in test environment', async () => {
      const request = new NextRequest('http://localhost:3000/api/dev/adapt-cache');
      const response = await middleware(request);
      
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
