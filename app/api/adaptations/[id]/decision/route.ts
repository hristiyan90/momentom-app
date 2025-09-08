import { NextRequest, NextResponse } from 'next/server';
import { getAthleteIdFromAuth } from '@/lib/supabase/server';
import { getPreviewById, writeDecision, fetchSessionsInWindow, fetchPlanSummary } from '@/lib/adapt/store';
import { applyWeeklyVolumeGuard } from '@/lib/adapt/rules';
import { makeExplainabilityId, traceInfo } from '@/lib/obs/trace';
import { withSecurityHeaders } from '@/lib/http/headers';
import { randomUUID } from 'crypto';
import type { DiffChange } from '@/lib/adapt/schema';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Generate correlation IDs for tracing
    const explainability_id = makeExplainabilityId();
    const request_id = req.headers.get('X-Request-Id') || randomUUID();
    
    const auth = await getAthleteIdFromAuth(req);
    if (!auth) {
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

    const prev = await getPreviewById(athleteId, params.id);
    if (!prev) return withSecurityHeaders(NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Adaptation not found', request_id: request_id } }, { 
      status: 404,
      headers: {
        'X-Explainability-Id': explainability_id,
        'X-Request-Id': request_id
      }
    }), { noStore: true });

    const { decision } = await req.json() as { decision: 'accepted' | 'modified' | 'rejected' };

    if (decision === 'accepted') {
      // Use original changes for accepted decision
      const finalChanges = prev.changes;
      
      const { plan_version_after } = await writeDecision({
        adaptation_id: prev.adaptation_id,
        athlete_id: athleteId,
        plan_id: prev.plan_id,
        decision,
        final_changes: finalChanges,
        plan_version_before: prev.plan_version_before,
        rationale_text: `Accepted: ${prev.rationale.text}`,
        driver_attribution: prev.rationale.driver_attribution || [],
        explainability_id
      });

      // Update the adaptation object with the decision
      const updatedAdaptation = {
        ...prev,
        decision: 'accepted' as const,
        plan_version_after: plan_version_after
      };

      return withSecurityHeaders(NextResponse.json(updatedAdaptation, { 
        status: 200,
        headers: {
          'X-Explainability-Id': explainability_id,
          'X-Request-Id': request_id
        }
      }), { noStore: true });
    }

    if (decision === 'modified') {
      // Apply weekly volume guard to prevent excessive changes
      const mode = req.headers.get('X-Guard-Mode') || process.env.DECISION_GUARD_MODE || 'clamp';
      
      try {
        // Fetch sessions and plan for guard validation
        const sessions = await fetchSessionsInWindow(athleteId, prev.impact_start, prev.impact_end);
        const plan = await fetchPlanSummary(athleteId);
        
        // Apply volume guard to the changes
        const guardResult = applyWeeklyVolumeGuard({
          sessions,
          changes: prev.changes,
          plan,
          date: prev.impact_start.split('T')[0]
        });
        
        const { clampedChanges, metrics, violates } = guardResult;
        
        // Emit trace for guard check
        traceInfo(explainability_id, 'decision_guard_check', {
          mode,
          clamped: metrics.clamped,
          original_volume: metrics.original_volume,
          new_volume: metrics.new_volume,
          delta_percent: metrics.delta_percent,
          in_taper: metrics.in_taper ?? false,
          violates,
          request_id
        });
        
        // In block mode, reject if guard violation
        if (mode === 'block' && violates) {
          return withSecurityHeaders(NextResponse.json({
            error: {
              code: 'GUARDRAIL_VIOLATION',
              message: 'Weekly volume change exceeds safety limits',
              details: {
                delta_percent: metrics.delta_percent,
                max_allowed: 20,
                in_taper: metrics.in_taper
              },
              request_id: request_id
            }
          }, { 
            status: 422,
            headers: {
              'X-Explainability-Id': explainability_id,
              'X-Request-Id': request_id
            }
          }), { noStore: true });
        }
        
        // Use clamped changes (either original or adjusted)
        const finalChanges = clampedChanges;
        
        const { plan_version_after } = await writeDecision({
          adaptation_id: prev.adaptation_id,
          athlete_id: athleteId,
          plan_id: prev.plan_id,
          decision,
          final_changes: finalChanges,
          plan_version_before: prev.plan_version_before,
          rationale_text: `Modified: ${prev.rationale.text}`,
          driver_attribution: prev.rationale.driver_attribution || [],
          explainability_id
        });

        // Update the adaptation object with the decision
        const updatedAdaptation = {
          ...prev,
          decision: 'modified' as const,
          plan_version_after: plan_version_after
        };

        return withSecurityHeaders(NextResponse.json(updatedAdaptation, { 
          status: 200,
          headers: {
            'X-Explainability-Id': explainability_id,
            'X-Request-Id': request_id
          }
        }), { noStore: true });
        
      } catch (error) {
        console.error('❌ Guard check failed, proceeding with original changes:', error);
        
        // Emit error trace and fail open
        traceInfo(explainability_id, 'decision_guard_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          request_id
        });
        
        // Fall back to original changes if guard fails
        const finalChanges = prev.changes;
        
        const { plan_version_after } = await writeDecision({
          adaptation_id: prev.adaptation_id,
          athlete_id: athleteId,
          plan_id: prev.plan_id,
          decision,
          final_changes: finalChanges,
          plan_version_before: prev.plan_version_before,
          rationale_text: `Modified (guard failed): ${prev.rationale.text}`,
          driver_attribution: prev.rationale.driver_attribution || [],
          explainability_id
        });

        // Update the adaptation object with the decision
        const updatedAdaptation = {
          ...prev,
          decision: 'modified' as const,
          plan_version_after: plan_version_after
        };

        return withSecurityHeaders(NextResponse.json(updatedAdaptation, { 
          status: 200,
          headers: {
            'X-Explainability-Id': explainability_id,
            'X-Request-Id': request_id
          }
        }), { noStore: true });
      }
    }

    if (decision === 'rejected') {
      const { plan_version_after } = await writeDecision({
        adaptation_id: prev.adaptation_id,
        athlete_id: athleteId,
        plan_id: prev.plan_id,
        decision,
        final_changes: [],
        plan_version_before: prev.plan_version_before,
        rationale_text: `Rejected: ${prev.rationale.text}`,
        driver_attribution: prev.rationale.driver_attribution || [],
        explainability_id
      });

      // Update the adaptation object with the decision
      const updatedAdaptation = {
        ...prev,
        decision: 'rejected' as const,
        plan_version_after: plan_version_after
      };

      return withSecurityHeaders(NextResponse.json(updatedAdaptation, { 
        status: 200,
        headers: {
          'X-Explainability-Id': explainability_id,
          'X-Request-Id': request_id
        }
      }), { noStore: true });
    }

    return withSecurityHeaders(NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid decision', request_id: request_id } }, { 
      status: 422,
      headers: {
        'X-Explainability-Id': explainability_id,
        'X-Request-Id': request_id
      }
    }), { noStore: true });

  } catch (error) {
    console.error('❌ Decision request failed:', error);
    
    const request_id = req.headers.get('X-Request-Id') || randomUUID();
    const explainability_id = makeExplainabilityId();
    
    return withSecurityHeaders(NextResponse.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Internal server error', 
        request_id 
      } 
    }, { 
      status: 500,
      headers: {
        'X-Explainability-Id': explainability_id,
        'X-Request-Id': request_id
      }
    }), { noStore: true });
  }
}