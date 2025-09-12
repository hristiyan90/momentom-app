import { NextRequest, NextResponse } from 'next/server';
import { ruleEngineDeterministic, computeImpactWindow } from '@/lib/adapt/rules';
import { fetchPlanSummary, fetchSessionsInWindow, fetchReadiness, fetchDailyLoadWindow, fetchBlockers, getCachedPreviewWithIdempotency, putPreviewCache, isValidUUID, MissingReadinessError } from '@/lib/adapt/store';
import { makeExplainabilityId, traceInfo } from '@/lib/obs/trace';
import { getAthleteIdFromAuth, createSupabaseAdmin } from '@/lib/supabase/server';
import { withSecurityHeaders } from '@/lib/http/headers';
import { createHash, randomUUID } from 'crypto';
import type { Readiness } from '@/lib/adapt/schema';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Starting preview request...');
    
    const { date, scope } = await req.json() as { date: string; scope: 'today' | 'next_72h' | 'week' };
    console.log('📅 Request params:', { date, scope });
    
    // Generate correlation IDs for tracing
    const explainability_id = makeExplainabilityId();
    const request_id = req.headers.get('X-Request-Id') || randomUUID();
    const idempotency_key = req.headers.get('Idempotency-Key') || undefined;
    
    // Check for strict mode and allow missing flags
    const strictHeader = req.headers.get('X-Strict-Readiness');
    const allowHeader = req.headers.get('X-Allow-Missing-Readiness');
    const allowQuery = new URL(req.url).searchParams.get('allowMissingReadiness');
    const envStrict = process.env.READINESS_STRICT === '1';
    
    const strictMode = strictHeader === 'true' || envStrict;
    const allowMissing = (allowQuery === '1') || (allowHeader && allowHeader.toLowerCase() === 'true');
    
    console.log('🔧 Readiness policy:', { strictMode, allowMissing });
    
    const auth = await getAthleteIdFromAuth(req);
    if (!auth) {
      console.log('❌ Authentication failed');
      return withSecurityHeaders(NextResponse.json({ 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Authentication required',
          request_id 
        } 
      }, { 
        status: 401,
        headers: {
          'X-Request-Id': request_id,
          'WWW-Authenticate': 'Bearer'
        }
      }), { noStore: true });
    }
    
    const { athlete_id: athleteId } = auth;
    console.log('✅ Authenticated athlete:', athleteId);
    
    // Compute impact window
    const { startISO, endISO } = computeImpactWindow(date, scope);
    console.log('📅 Impact window:', { start: startISO, end: endISO, scope });
    
    // Fetch plan and readiness data
    const [plan, sessions, readiness, dailyLoad, blockers] = await Promise.all([
      fetchPlanSummary(athleteId),
      fetchSessionsInWindow(athleteId, startISO, endISO),
      fetchReadiness(athleteId, date),
      fetchDailyLoadWindow(athleteId, startISO, endISO),
      fetchBlockers(athleteId, startISO, endISO)
    ]);
    
    console.log('📊 Data fetched:', {
      plan: plan?.plan_id,
      sessions: sessions?.length || 0,
      readiness: readiness?.date,
      dailyLoad: dailyLoad?.length || 0,
      blockers: blockers?.length || 0
    });
    
    // Check readiness requirements
    if (!readiness && !allowMissing) {
      console.log('❌ Missing readiness data and not allowed');
      const retryAfter = strictMode ? 300 : 60; // 5min strict, 1min normal
      
      return withSecurityHeaders(NextResponse.json({ 
        error: { 
          code: 'MISSING_READINESS', 
          message: 'Readiness data required but not available',
          request_id,
          retry_after_seconds: retryAfter
        } 
      }, { 
        status: 424,
        headers: {
          'X-Request-Id': request_id,
          'Retry-After': String(retryAfter)
        }
      }), { noStore: true });
    }
    
    // Create checksum for caching
    const checksum = createHash('sha256')
      .update(JSON.stringify({ 
        athleteId, 
        date, 
        scope, 
        planVersion: plan?.version || 0,
        readinessDate: readiness?.date || null,
        readinessScore: readiness?.score || null
      }))
      .digest('hex');
    
    console.log('🔍 Cache checksum:', checksum);
    
    // Check cache with idempotency
    const cacheResult = await getCachedPreviewWithIdempotency(athleteId, checksum, idempotency_key);
    if (cacheResult) {
      const { adaptation, isReplay, idempotencyKey } = cacheResult;
      console.log('✅ Returning cached result:', adaptation.adaptation_id, { isReplay, idempotencyKey });
      
      // If this is a regular cache hit (not idempotent replay) and we have an idempotency key,
      // update the cache record to store the idempotency key for future lookups
      if (!isReplay && idempotency_key && isValidUUID(idempotency_key)) {
        console.log('💾 Updating cached preview with idempotency key...');
        try {
          const supabase = createSupabaseAdmin();
          await supabase
            .from('adaptation_preview_cache')
            .update({ idempotency_key })
            .eq('adaptation_id', adaptation.adaptation_id);
          console.log('✅ Updated cache with idempotency key');
        } catch (error) {
          console.warn('⚠️ Failed to update cache with idempotency key:', error);
          // Don't fail the request, just log the warning
        }
      }
      
      // Emit trace for cache hit with idempotency info
      traceInfo(explainability_id, 'adaptation_preview_cached', { 
        scope, 
        request_id,
        idempotency_key: idempotencyKey,
        replayed: isReplay 
      });
      
      const headers: Record<string, string> = {
        'X-Explainability-Id': adaptation.explainability_id || explainability_id,
        'X-Request-Id': request_id
      };
      
      // Add idempotency headers if key was provided
      if (idempotencyKey) {
        headers['Idempotency-Replayed'] = String(isReplay);
        headers['Idempotency-Key'] = idempotencyKey;
      }
      
      return withSecurityHeaders(NextResponse.json(adaptation, { 
        status: 200,
        headers
      }), { noStore: true });
    }
    
    console.log('🤖 Running rules engine...');
    const out = ruleEngineDeterministic({
      plan,
      sessions: sessions || [],
      readiness: readiness || null,
      dailyLoad: dailyLoad || [],
      blockers: blockers || [],
      impactStart: startISO,
      impactEnd: endISO,
      scope,
      allowMissingReadiness: allowMissing
    });
    
    console.log('📝 Rules output:', {
      reason_code: out.reason_code,
      changes: out.changes.length,
      triggers: out.triggers
    });
    
    // Check for volume guard clamping and emit trace
    if (out.data_snapshot?.volume_guard?.clamped) {
      const vg = out.data_snapshot.volume_guard;
      traceInfo(explainability_id, 'volume_guard_clamp', {
        before_min: vg.original_volume,
        after_min: vg.new_volume,
        delta_pct: vg.delta_percent,
        in_taper: vg.in_taper ?? false,
        request_id
      });
    }
    
    const adaptation = await putPreviewCache({
      athlete_id: athleteId,
      plan_id: plan.plan_id,
      scope,
      impact_start: startISO,
      impact_end: endISO,
      reason_code: out.reason_code,
      triggers: out.triggers,
      changes_json: out.changes,
      plan_version_before: plan.version,
      rationale_text: out.rationale_text,
      driver_attribution: out.driver_attribution,
      data_snapshot: out.data_snapshot,
      checksum,
      idempotency_key,
      explainability_id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h TTL
    });
    
    console.log('✅ Created adaptation:', adaptation.adaptation_id);
    
    // Emit trace for new adaptation
    traceInfo(explainability_id, 'adaptation_preview_created', { 
      scope, 
      request_id,
      adaptation_id: adaptation.adaptation_id,
      reason_code: out.reason_code,
      changes_count: out.changes.length
    });
    
    const headers: Record<string, string> = {
      'X-Explainability-Id': adaptation.explainability_id || explainability_id,
      'X-Request-Id': request_id
    };
    
    // Add idempotency headers if key was provided
    if (idempotency_key) {
      headers['Idempotency-Replayed'] = 'false';
      headers['Idempotency-Key'] = idempotency_key;
    }
    
    return withSecurityHeaders(NextResponse.json(adaptation, { 
      status: 200,
      headers
    }), { noStore: true });
    
  } catch (error) {
    console.error('❌ Preview request failed:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    const request_id = req.headers.get('X-Request-Id') || randomUUID();
    
    return withSecurityHeaders(NextResponse.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Internal server error', 
        request_id 
      } 
    }, { 
      status: 500,
      headers: {
        'X-Request-Id': request_id
      }
    }), { noStore: true });
  }
}
