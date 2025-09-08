import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Guard dev routes in production
  if (process.env.NODE_ENV === 'production') {
    const { pathname } = request.nextUrl;
    
    if (pathname.startsWith('/api/dev/') || pathname.startsWith('/dev/')) {
      console.log(`🚫 Blocked dev route in production: ${pathname}`);
      return NextResponse.json(
        { error: 'Not found' }, 
        { status: 404 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/dev/:path*',
    '/dev/:path*'
  ]
};
