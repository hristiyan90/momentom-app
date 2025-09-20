import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Simple test without complex imports
    return NextResponse.json(
      { message: 'B2 POST endpoint working', method: 'POST' },
      { 
        status: 201, 
        headers: { 
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Cache-Control': 'no-store' } }
  );
}
