import { serverClient } from '@/lib/supabase/server';

/**
 * Storage utilities for B2 Manual Workout Upload
 * Handles file upload/retrieval for ingest workflow
 */

export const INGEST_BUCKET = 'workout-uploads';
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
export const ALLOWED_MIME_TYPES = ['application/xml', 'application/gpx+xml', 'text/xml'];
export const ALLOWED_EXTENSIONS = ['.tcx', '.gpx'];

/**
 * Generate storage path for uploaded file
 * Format: workout-uploads/raw/<athlete_id>/<ingest_id>.<ext>
 */
export function generateStoragePath(athleteId: string, ingestId: string, fileType: 'tcx' | 'gpx'): string {
  return `raw/${athleteId}/${ingestId}.${fileType}`;
}

/**
 * Validate file for upload requirements
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size ${file.size} exceeds maximum ${MAX_FILE_SIZE} bytes (25MB)` };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return { valid: false, error: `File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  // Check MIME type if provided
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `MIME type ${file.type} not supported. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Determine file type from filename or MIME type
 */
export function determineFileType(file: File): 'tcx' | 'gpx' | null {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.tcx')) return 'tcx';
  if (fileName.endsWith('.gpx')) return 'gpx';
  
  // Fallback to MIME type
  if (file.type === 'application/gpx+xml') return 'gpx';
  
  return null;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFileToStorage(
  athleteId: string,
  ingestId: string,
  file: File,
  fileType: 'tcx' | 'gpx'
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const supabase = serverClient();
    const storagePath = generateStoragePath(athleteId, ingestId, fileType);
    
    // Convert File to ArrayBuffer for upload
    const fileBuffer = await file.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from(INGEST_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: file.type || 'application/xml',
        upsert: false // Prevent overwriting
      });
    
    if (error) {
      return { success: false, error: `Storage upload failed: ${error.message}` };
    }
    
    return { success: true, path: data.path };
  } catch (error) {
    return { success: false, error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Download file from Supabase Storage
 */
export async function downloadFileFromStorage(
  storagePath: string
): Promise<{ success: boolean; data?: ArrayBuffer; error?: string }> {
  try {
    const supabase = serverClient();
    
    const { data, error } = await supabase.storage
      .from(INGEST_BUCKET)
      .download(storagePath);
    
    if (error) {
      return { success: false, error: `Storage download failed: ${error.message}` };
    }
    
    const arrayBuffer = await data.arrayBuffer();
    return { success: true, data: arrayBuffer };
  } catch (error) {
    return { success: false, error: `Download error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFileFromStorage(
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = serverClient();
    
    const { error } = await supabase.storage
      .from(INGEST_BUCKET)
      .remove([storagePath]);
    
    if (error) {
      return { success: false, error: `Storage deletion failed: ${error.message}` };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: `Delete error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Check if storage bucket exists and is accessible
 */
export async function checkStorageHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    const supabase = serverClient();
    
    // Try to list files in bucket (should return even if empty)
    const { error } = await supabase.storage
      .from(INGEST_BUCKET)
      .list('', { limit: 1 });
    
    if (error) {
      return { healthy: false, error: `Storage health check failed: ${error.message}` };
    }
    
    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: `Storage error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
