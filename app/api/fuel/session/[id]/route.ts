import { NextRequest, NextResponse } from 'next/server';
import { withSecurityHeaders } from '@/lib/http/headers';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return withSecurityHeaders(NextResponse.json({ 
    session_id: params.id, 
    weight_kg: 75, 
    pre: { carb_g_per_kg: [1.0, 2.0], fluid_ml_per_kg: [5, 10] }, 
    during: { carb_g_per_h: [60, 90], fluid_l_per_h: [0.4, 0.8], sodium_mg_per_h: [300, 800] }, 
    post: { carb_g_per_kg: [1.0, 1.2], protein_g: [20, 40], fluid_replacement_pct: 150 }, 
    modifiers: { heat: true, altitude: false, fasted_variant: false } 
  }), { cacheHint: "private, max-age=60, stale-while-revalidate=60" });
}
