import { NextResponse } from 'next/server';

export function GET(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const url = new URL(req.url);
  const ath = url.searchParams.get('ath') ?? 'ath_mock';
  
  const g: any = globalThis as any;
  const store = g.__ADAPT_STORE__ ?? { byChecksum: {}, byId: {} };
  
  return NextResponse.json({
    byId: Object.keys(store.byId?.[ath] ?? {}),
    byChecksum: Object.keys(store.byChecksum?.[ath] ?? {})
  });
}

// DEV-ONLY. Do not enable in production.
