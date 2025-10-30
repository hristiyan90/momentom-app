/**
 * API Client for Onboarding Data Persistence (GAP-1)
 *
 * This module provides client-side functions to interact with the onboarding
 * persistence APIs. All functions handle authentication via session cookies
 * and provide proper error handling.
 */

// ============================================================================
// Types
// ============================================================================

export interface AthleteProfile {
  email: string;
  name: string;
  date_of_birth: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  ftp_watts?: number | null;
  threshold_pace_min_per_km?: number | null;
  swim_css_pace_min_per_100m?: number | null;
  max_heart_rate?: number | null;
  resting_heart_rate?: number | null;
  available_hours_per_week: number;
  training_days_per_week: number;
}

export interface AthletePreferences {
  preferred_training_time?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  focus_discipline?: 'swim' | 'bike' | 'run' | 'balanced';
  preferred_run_metric?: 'pace' | 'power' | 'hr';
  preferred_bike_metric?: 'power' | 'hr';
  preferred_swim_metric?: 'pace' | 'hr';
  sunday_available?: boolean;
  monday_available?: boolean;
  tuesday_available?: boolean;
  wednesday_available?: boolean;
  thursday_available?: boolean;
  friday_available?: boolean;
  saturday_available?: boolean;
  has_bike?: boolean;
  has_pool_access?: boolean;
  has_power_meter?: boolean;
  has_hr_monitor?: boolean;
}

export interface Race {
  race_date: string;
  race_type: 'sprint' | 'olympic' | '70.3' | '140.6' | 'marathon' | 'ultra' | '5k' | '10k' | 'half_marathon';
  priority: 'A' | 'B' | 'C';
  race_name?: string;
  location?: string;
  notes?: string;
  status?: 'planned' | 'completed' | 'dns' | 'dnf';
}

export interface Constraint {
  constraint_type: 'injury' | 'equipment' | 'availability';
  affected_disciplines: Array<'swim' | 'bike' | 'run' | 'strength'>;
  start_date: string;
  end_date?: string | null;
  severity: 'mild' | 'moderate' | 'severe';
  description?: string | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  request_id?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: any;
}

// ============================================================================
// Athlete Profile API
// ============================================================================

/**
 * Create or update athlete profile
 *
 * @param profile - Athlete profile data
 * @returns Profile data on success
 * @throws ApiError on failure
 */
export async function saveAthleteProfile(profile: AthleteProfile): Promise<AthleteProfile> {
  const response = await fetch('/api/athlete/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  const result: ApiResponse<AthleteProfile> = await response.json();

  if (!response.ok) {
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to save profile' };
  }

  if (!result.data) {
    throw { code: 'NO_DATA', message: 'No data returned from server' };
  }

  return result.data;
}

/**
 * Retrieve athlete profile
 *
 * @returns Profile data if exists, null if not found
 * @throws ApiError on failure
 */
export async function getAthleteProfile(): Promise<AthleteProfile | null> {
  const response = await fetch('/api/athlete/profile', {
    method: 'GET',
  });

  // 404 is expected if profile doesn't exist yet
  if (response.status === 404) {
    return null;
  }

  const result: ApiResponse<AthleteProfile> = await response.json();

  if (!response.ok) {
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to retrieve profile' };
  }

  return result.data || null;
}

// ============================================================================
// Athlete Preferences API
// ============================================================================

/**
 * Create or update athlete preferences
 *
 * @param preferences - Athlete preferences data
 * @returns Preferences data on success
 * @throws ApiError on failure
 */
export async function saveAthletePreferences(preferences: AthletePreferences): Promise<AthletePreferences> {
  const response = await fetch('/api/athlete/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });

  const result: ApiResponse<AthletePreferences> = await response.json();

  if (!response.ok) {
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to save preferences' };
  }

  if (!result.data) {
    throw { code: 'NO_DATA', message: 'No data returned from server' };
  }

  return result.data;
}

/**
 * Retrieve athlete preferences
 *
 * @returns Preferences data if exists, null if not found
 * @throws ApiError on failure
 */
export async function getAthletePreferences(): Promise<AthletePreferences | null> {
  const response = await fetch('/api/athlete/preferences', {
    method: 'GET',
  });

  // 404 is expected if preferences don't exist yet
  if (response.status === 404) {
    return null;
  }

  const result: ApiResponse<AthletePreferences> = await response.json();

  if (!response.ok) {
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to retrieve preferences' };
  }

  return result.data || null;
}

// ============================================================================
// Races API
// ============================================================================

/**
 * Batch create races
 *
 * @param races - Array of race objects
 * @returns Created races data
 * @throws ApiError on failure
 */
export async function saveRaces(races: Race[]): Promise<Race[]> {
  const response = await fetch('/api/races', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ races }),
  });

  const result: ApiResponse<Race[]> = await response.json();

  if (!response.ok) {
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to save races' };
  }

  if (!result.data) {
    throw { code: 'NO_DATA', message: 'No data returned from server' };
  }

  return result.data;
}

/**
 * Retrieve all races for authenticated athlete
 *
 * @returns Array of races (empty if none exist)
 * @throws ApiError on failure
 */
export async function getRaces(): Promise<Race[]> {
  const response = await fetch('/api/races', {
    method: 'GET',
  });

  const result: ApiResponse<Race[]> = await response.json();

  if (!response.ok) {
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to retrieve races' };
  }

  return result.data || [];
}

/**
 * Get a single race by ID
 *
 * @param raceId - Race ID
 * @returns Race data if found, null if not found
 * @throws ApiError on failure
 */
export async function getRace(raceId: string): Promise<Race | null> {
  const response = await fetch(`/api/races/${raceId}`, {
    method: 'GET',
  });

  // 404 is expected if race doesn't exist
  if (response.status === 404) {
    return null;
  }

  const result: ApiResponse<Race> = await response.json();

  if (!response.ok) {
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to retrieve race' };
  }

  return result.data || null;
}

/**
 * Delete a race by ID
 *
 * @param raceId - Race ID to delete
 * @returns True on success
 * @throws ApiError on failure
 */
export async function deleteRace(raceId: string): Promise<boolean> {
  const response = await fetch(`/api/races/${raceId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const result: ApiResponse<never> = await response.json();
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to delete race' };
  }

  return true;
}

// ============================================================================
// Constraints API
// ============================================================================

/**
 * Batch create athlete constraints
 *
 * @param constraints - Array of constraint objects
 * @returns Created constraints data
 * @throws ApiError on failure
 */
export async function saveConstraints(constraints: Constraint[]): Promise<Constraint[]> {
  const response = await fetch('/api/athlete/constraints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ constraints }),
  });

  const result: ApiResponse<Constraint[]> = await response.json();

  if (!response.ok) {
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to save constraints' };
  }

  if (!result.data) {
    throw { code: 'NO_DATA', message: 'No data returned from server' };
  }

  return result.data;
}

/**
 * Retrieve all constraints for authenticated athlete
 *
 * @param options - Optional filter parameters
 * @returns Array of constraints (empty if none exist)
 * @throws ApiError on failure
 */
export async function getConstraints(options?: { active?: boolean; date?: string }): Promise<Constraint[]> {
  const params = new URLSearchParams();
  if (options?.active) params.set('active', 'true');
  if (options?.date) params.set('date', options.date);

  const url = `/api/athlete/constraints${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
  });

  const result: ApiResponse<Constraint[]> = await response.json();

  if (!response.ok) {
    throw result.error || { code: 'UNKNOWN_ERROR', message: 'Failed to retrieve constraints' };
  }

  return result.data || [];
}

// ============================================================================
// Error Handling Helper
// ============================================================================

/**
 * Get user-friendly error message from API error
 *
 * @param error - API error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: ApiError): string {
  switch (error.code) {
    case 'UNAUTHORIZED':
    case 'AUTH_REQUIRED':
      return 'Your session has expired. Please log in again.';
    case 'VALIDATION_ERROR':
      return error.message || 'Please check your input and try again.';
    case 'PROFILE_NOT_FOUND':
      return 'Please complete your profile first.';
    case 'DATABASE_ERROR':
      return 'Something went wrong. Please try again.';
    case 'DUPLICATE_EMAIL':
      return 'This email address is already registered.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Check if error is an authentication error (should redirect to login)
 *
 * @param error - API error object
 * @returns True if authentication error
 */
export function isAuthError(error: ApiError): boolean {
  return error.code === 'UNAUTHORIZED' || error.code === 'AUTH_REQUIRED';
}
