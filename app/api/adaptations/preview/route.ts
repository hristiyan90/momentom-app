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
      
      // Enhanced 401 response with proper WWW-Authenticate header
      const authHeader = req.headers.get('Authorization');
      const hasBearerToken = authHeader && authHeader.startsWith('Bearer ');
      
      return withSecurityHeaders(NextResponse.json({ 
        error: { 
          code: 'AUTH_REQUIRED', 
          message: 'Authentication required', 
          request_id: request_id 
        } 
      }, { 
        status: 401,
        headers: {
          'X-Request-Id': request_id,
          'X-Explainability-Id': explainability_id
        }
      }), { 
        noStore: true,
        wwwAuthenticate: hasBearerToken ? 'Bearer realm="momentom", error="invalid_token"' : 'Bearer realm="momentom"'
      });
    }
    
    const athleteId = auth.athleteId;
    console.log('👤 Athlete ID:', athleteId);

    const tz = req.headers.get('X-Client-Timezone') ?? undefined;
    const { startISO, endISO } = computeImpactWindow(date, scope, tz);
    console.log('⏰ Impact window:', { startISO, endISO });

    const plan = await fetchPlanSummary(athleteId);
    
    // Determine if readiness is required
    const requiresReadiness = strictMode || scope === 'today' || scope === 'next_72h';
    console.log('🎯 Readiness required:', requiresReadiness);
    
    let readiness: Readiness | null = null;
    
    if (requiresReadiness) {
      try {
        readiness = await fetchReadiness(athleteId, date);
      } catch (error) {
        if (error instanceof MissingReadinessError) {
          // Check if bypass is allowed
          if (allowMissing) {
            console.log('✅ Readiness missing but bypass allowed, continuing...');
            readiness = null; // Continue without readiness
          } else {
            const retrySec = 300; // 5 minutes
            
            console.log('🚫 Readiness missing and required, returning 424');
            
            // Emit trace for missing readiness
            traceInfo(explainability_id, 'readiness_missing', {
              scope, 
              strictMode, 
              allowMissing, 
              retry_after_sec: retrySec,
              request_id
            });
            
            console.log('🚫 Returning 424 - readiness required but missing');
            
            // Return 424 UNPROCESSABLE_DEPENDENCY with contract-accurate body
          return withSecurityHeaders(NextResponse.json({
            error: {
              code: "UNPROCESSABLE_DEPENDENCY",
              message: "Upstream ingest incomplete",
              fallback_hint: "partial",
              request_id: request_id,
              retry_after: "PT5M"
            }
          }, {
            status: 424,
            headers: {
              'Retry-After': String(retrySec),
              'Warning': '199 - readiness missing',
              'X-Explainability-Id': explainability_id,
              'X-Request-Id': request_id
            }
          }), { noStore: true });
          }
        }
        
        // Non-missing errors or allowed-missing cases fall through
        console.log('🔄 Continuing without readiness data');
      }
    }
    
    const [sessions, load, blockers] = await Promise.all([
      fetchSessionsInWindow(athleteId, startISO, endISO),
      fetchDailyLoadWindow(athleteId, startISO, endISO),
      fetchBlockers(athleteId, startISO, endISO),
    ]);
    
    console.log('📈 Data fetched:', {
      sessions: sessions.length,
      readiness: readiness ? 'yes' : 'no',
      load: load.length,
      blockers: blockers.length
    });

    const checksum = createHash('sha256').update(JSON.stringify({ athleteId, date, scope, planVersion: plan.version, sessions, readiness, load, blockers })).digest('hex');
    console.log('🔒 Checksum:', checksum.substring(0, 8) + '...');
    
    console.log('🔍 Checking cache with idempotency...');
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
      sessions,
      readiness,
      load,
      blockers,
      plan,
      date,
      scope
    }, explainability_id);
    
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
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
    
    console.log('✅ Preview created successfully:', adaptation.adaptation_id);
    
    // Emit trace for new adaptation
    traceInfo(explainability_id, 'adaptation_preview', { 
      scope, 
      reason_code: out.reason_code, 
      change_count: out.changes.length, 
      request_id,
      idempotency_key,
      replayed: false
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