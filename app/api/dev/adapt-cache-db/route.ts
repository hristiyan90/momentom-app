import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { getAthleteIdFromAuth } from '@/lib/supabase/server';

export async function GET(req: Request) {
  // Guard: dev-only
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const auth = await getAthleteIdFromAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  
  try {
    // Get adaptation preview cache counts/IDs
    const { data: previewCache, error: previewError } = await supabase
      .from('adaptation_preview_cache')
      .select('adaptation_id, checksum, created_at, expires_at')
      .eq('athlete_id', auth.athleteId)
      .order('created_at', { ascending: false });

    if (previewError) {
      return NextResponse.json({ error: previewError.message }, { status: 500 });
    }

    // Get adaptation decisions counts/IDs
    const { data: decisions, error: decisionsError } = await supabase
      .from('adaptation_decision')
      .select('id, adaptation_id, decision, decided_at, plan_version_after')
      .eq('athlete_id', auth.athleteId)
      .order('decided_at', { ascending: false });

    if (decisionsError) {
      return NextResponse.json({ error: decisionsError.message }, { status: 500 });
    }

    return NextResponse.json({
      athlete_id: auth.athleteId,
      preview_cache: {
        count: previewCache?.length || 0,
        ids: previewCache?.map(p => p.adaptation_id) || [],
        recent: previewCache?.slice(0, 5) || []
      },
      decisions: {
        count: decisions?.length || 0,
        ids: decisions?.map(d => d.id) || [],
        recent: decisions?.slice(0, 5) || []
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DEV-ONLY. Database inspection for adaptation cache and decisions.
