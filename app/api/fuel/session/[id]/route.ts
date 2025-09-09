import { NextRequest, NextResponse } from 'next/server';
import { withSecurityHeaders } from '@/lib/http/headers';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  // Base fluid and sodium ranges
  const fluidRange = [0.4, 0.8]; // L/h
  const sodiumConcentrationRange = [300, 800]; // mg/L
  
  // Calculate derived sodium per hour: concentration × fluid rate
  const sodiumPerHour = [
    Math.round(fluidRange[0] * sodiumConcentrationRange[0]), // 0.4 * 300 = 120
    Math.round(fluidRange[1] * sodiumConcentrationRange[1])  // 0.8 * 800 = 640
  ];

  return withSecurityHeaders(NextResponse.json({ 
    session_id: params.id, 
    weight_kg: 75, 
    pre: { carb_g_per_kg: [1.0, 2.0], fluid_ml_per_kg: [5, 10] }, 
    during: { 
      carb_g_per_h: [60, 90], 
      fluid_l_per_h: fluidRange, 
      sodium_mg_per_l: sodiumConcentrationRange,
      sodium_mg_per_h: sodiumPerHour
    }, 
    post: { carb_g_per_kg: [1.0, 1.2], protein_g: [20, 40], fluid_replacement_pct: 150 }, 
    modifiers: { heat: true, altitude: false, fasted_variant: false } 
  }), { cacheHint: "private, max-age=60, stale-while-revalidate=60" });
}
