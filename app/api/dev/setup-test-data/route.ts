import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    
    console.log('🔧 Setting up test data...');
    
    // Insert test athletes
    const athletes = [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002', 
      '00000000-0000-0000-0000-000000000003'
    ];
    
    for (const athleteId of athletes) {
      const { error: athleteError } = await supabase
        .from('athlete')
        .upsert({ athlete_id: athleteId }, { onConflict: 'athlete_id' });
        
      if (athleteError) {
        console.error(`❌ Failed to insert athlete ${athleteId}:`, athleteError);
      } else {
        console.log(`✅ Athlete ${athleteId} ready`);
      }
    }
    
    // Insert test plans with proper UUIDs
    const plans = [
      { plan_id: '00000000-0000-0000-0000-000000000abc', athlete_id: '00000000-0000-0000-0000-000000000001', version: 12 },
      { plan_id: '00000000-0000-0000-0000-000000000def', athlete_id: '00000000-0000-0000-0000-000000000002', version: 8 },
      { plan_id: '00000000-0000-0000-0000-000000000ghi', athlete_id: '00000000-0000-0000-0000-000000000003', version: 5 }
    ];
    
    for (const plan of plans) {
      const { error: planError } = await supabase
        .from('plan')
        .upsert({
          plan_id: plan.plan_id,
          athlete_id: plan.athlete_id,
          version: plan.version,
          status: 'active',
          start_date: '2025-09-01',
          end_date: '2025-12-31'
        }, { onConflict: 'plan_id' });
        
      if (planError) {
        console.error(`❌ Failed to insert plan ${plan.plan_id}:`, planError);
      } else {
        console.log(`✅ Plan ${plan.plan_id} ready (v${plan.version})`);
      }
    }
    
    console.log('✅ Test data setup complete');
    
    return NextResponse.json({ 
      status: 'success',
      athletes: athletes.length,
      plans: plans.length
    });
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return NextResponse.json(
      { error: 'Setup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}