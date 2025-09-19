import { ParsedWorkoutData } from '@/lib/parsers/workout-files';
import { serverClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/data/sources';

/**
 * Session mapping utilities for B2 Manual Workout Upload
 * Converts parsed workout data to sessions table format
 */

export interface SessionInsertData {
  athlete_id: string;
  date: string;
  sport: string;
  title: string;
  planned_duration_min?: number;
  planned_load?: number;
  planned_zone_primary?: string;
  status: string;
  structure_json: object;
  actual_duration_min: number;
  actual_distance_m?: number;
  source_file_type: 'tcx' | 'gpx';
  source_ingest_id: string;
}

/**
 * Map parsed workout data to session insert format
 */
export function mapParsedWorkoutToSession(
  parsedData: ParsedWorkoutData,
  athleteId: string,
  ingestId: string
): SessionInsertData {
  return {
    athlete_id: athleteId,
    date: parsedData.date,
    sport: parsedData.sport,
    title: parsedData.title || `${parsedData.sport.charAt(0).toUpperCase() + parsedData.sport.slice(1)} Workout`,
    status: 'completed', // Uploaded workouts are already completed
    structure_json: {
      segments: [], // Basic structure for uploaded workouts
      source: 'file_upload',
      metadata: parsedData.metadata
    },
    actual_duration_min: parsedData.duration_minutes,
    actual_distance_m: parsedData.distance_meters,
    source_file_type: parsedData.source_format,
    source_ingest_id: ingestId
  };
}

/**
 * Create session record from parsed workout data
 */
export async function createSessionFromParsedData(
  parsedData: ParsedWorkoutData,
  athleteId: string,
  ingestId: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const supabase = serverClient();
    
    const sessionData = mapParsedWorkoutToSession(parsedData, athleteId, ingestId);
    
    const { data, error } = await supabase
      .from(TABLES.sessions)
      .insert(sessionData)
      .select('session_id')
      .single();
    
    if (error) {
      return { success: false, error: `Session creation failed: ${error.message}` };
    }
    
    return { success: true, sessionId: data.session_id };
  } catch (error) {
    return { 
      success: false, 
      error: `Session creation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Update ingest staging record with session ID
 */
export async function updateIngestWithSession(
  ingestId: string,
  sessionId: string,
  status: 'normalized' | 'error' = 'normalized'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = serverClient();
    
    const { error } = await supabase
      .from(TABLES.ingest_staging)
      .update({
        session_id: sessionId,
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('ingest_id', ingestId);
    
    if (error) {
      return { success: false, error: `Ingest update failed: ${error.message}` };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: `Ingest update error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Update ingest staging record with error
 */
export async function updateIngestWithError(
  ingestId: string,
  errorMessage: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = serverClient();
    
    const { error } = await supabase
      .from(TABLES.ingest_staging)
      .update({
        status: 'error',
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('ingest_id', ingestId);
    
    if (error) {
      return { success: false, error: `Ingest error update failed: ${error.message}` };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: `Ingest error update failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Get ingest staging record by ID
 */
export async function getIngestRecord(
  ingestId: string,
  athleteId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = serverClient();
    
    const { data, error } = await supabase
      .from(TABLES.ingest_staging)
      .select('*')
      .eq('ingest_id', ingestId)
      .eq('athlete_id', athleteId) // RLS enforcement
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Ingest record not found' };
      }
      return { success: false, error: `Ingest query failed: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: `Ingest query error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Create initial ingest staging record
 */
export async function createIngestRecord(
  athleteId: string,
  filename: string,
  fileType: 'tcx' | 'gpx',
  fileSize: number,
  storagePath: string
): Promise<{ success: boolean; ingestId?: string; error?: string }> {
  try {
    const supabase = serverClient();
    
    const { data, error } = await supabase
      .from(TABLES.ingest_staging)
      .insert({
        athlete_id: athleteId,
        filename,
        file_type: fileType,
        file_size: fileSize,
        status: 'received',
        storage_path: storagePath
      })
      .select('ingest_id')
      .single();
    
    if (error) {
      return { success: false, error: `Ingest record creation failed: ${error.message}` };
    }
    
    return { success: true, ingestId: data.ingest_id };
  } catch (error) {
    return { 
      success: false, 
      error: `Ingest record creation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Update ingest record with parsed data
 */
export async function updateIngestWithParsedData(
  ingestId: string,
  parsedData: ParsedWorkoutData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = serverClient();
    
    const { error } = await supabase
      .from(TABLES.ingest_staging)
      .update({
        status: 'parsed',
        parsed_data: parsedData,
        updated_at: new Date().toISOString()
      })
      .eq('ingest_id', ingestId);
    
    if (error) {
      return { success: false, error: `Parsed data update failed: ${error.message}` };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: `Parsed data update error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

