/**
 * Onboarding Persistence Hook
 *
 * Provides integrated API persistence for onboarding data.
 * Handles loading existing data, saving steps, and error management.
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  saveAthleteProfile,
  getAthleteProfile,
  saveAthletePreferences,
  getAthletePreferences,
  saveRaces,
  getRaces,
  saveConstraints,
  getErrorMessage,
  isAuthError,
  type AthleteProfile,
  type AthletePreferences,
  type Race,
  type Constraint,
  type ApiError,
} from '@/lib/api/onboarding';

// ============================================================================
// Types
// ============================================================================

export interface UseOnboardingPersistenceReturn {
  // State
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;

  // Profile actions
  saveProfile: (profileData: any) => Promise<boolean>;
  loadProfile: () => Promise<any | null>;

  // Preferences actions
  savePreferences: (preferencesData: any) => Promise<boolean>;
  loadPreferences: () => Promise<any | null>;

  // Races actions
  saveRaceData: (racesData: any[]) => Promise<boolean>;
  loadRaces: () => Promise<any[]>;

  // Constraints actions
  saveConstraintData: (constraintsData: any[]) => Promise<boolean>;

  // Error management
  clearError: () => void;
}

// ============================================================================
// Mappers - Convert UI data to API format
// ============================================================================

/**
 * Map UI profile data to API format
 */
function mapProfileToApi(profileData: any): AthleteProfile | null {
  try {
    // Calculate age from date of birth
    const dob = new Date(profileData.dateOfBirth);
    const today = new Date();
    const age = Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Map experience level
    const experienceMap: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'elite'> = {
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
      'elite': 'elite',
    };

    return {
      email: profileData.email || `${profileData.firstName.toLowerCase()}.${profileData.lastName.toLowerCase()}@temp.local`,
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      date_of_birth: profileData.dateOfBirth,
      experience_level: experienceMap[profileData.experienceLevel] || 'beginner',
      available_hours_per_week: parseFloat(profileData.weeklyHours) || 5,
      training_days_per_week: parseInt(profileData.trainingDays) || 4,
    };
  } catch (error) {
    console.error('[Profile Mapper] Error:', error);
    return null;
  }
}

/**
 * Map UI preferences data to API format
 */
function mapPreferencesToApi(preferencesData: any): AthletePreferences {
  // Map rest day to day availability
  const restDayMap: Record<string, string> = {
    'monday': 'monday_available',
    'tuesday': 'tuesday_available',
    'wednesday': 'wednesday_available',
    'thursday': 'thursday_available',
    'friday': 'friday_available',
    'saturday': 'saturday_available',
    'sunday': 'sunday_available',
  };

  const availability: any = {
    sunday_available: true,
    monday_available: true,
    tuesday_available: true,
    wednesday_available: true,
    thursday_available: true,
    friday_available: true,
    saturday_available: true,
  };

  // Set rest day to false
  if (preferencesData.restDay && restDayMap[preferencesData.restDay]) {
    availability[restDayMap[preferencesData.restDay]] = false;
  }

  return {
    preferred_training_time: 'flexible',
    focus_discipline: 'balanced',
    preferred_run_metric: (preferencesData.runMetric || 'pace') as 'pace' | 'power' | 'hr',
    preferred_bike_metric: (preferencesData.bikeMetric || 'power') as 'power' | 'hr',
    preferred_swim_metric: (preferencesData.swimMetric || 'pace') as 'pace' | 'hr',
    ...availability,
    has_bike: true,
    has_pool_access: true,
    has_power_meter: false,
    has_hr_monitor: false,
  };
}

/**
 * Map UI race data to API format
 */
function mapRacesToApi(racesData: any[]): Race[] {
  return racesData
    .filter(race => race.raceDate && race.raceType && race.racePriority)
    .map(race => ({
      race_date: race.raceDate,
      race_type: mapRaceType(race.raceType),
      priority: race.racePriority as 'A' | 'B' | 'C',
      race_name: race.raceName || undefined,
      location: race.raceLocation || undefined,
      notes: race.notes || undefined,
      status: 'planned' as const,
    }));
}

/**
 * Map UI race type to API format
 */
function mapRaceType(raceType: string): Race['race_type'] {
  const typeMap: Record<string, Race['race_type']> = {
    'Sprint': 'sprint',
    'Olympic': 'olympic',
    '70.3': '70.3',
    'Ironman 70.3': '70.3',
    '140.6': '140.6',
    'Ironman': '140.6',
    'T100': 'sprint', // Map to closest equivalent
    '5K': '5k',
    '10K': '10k',
    'Half Marathon': 'half_marathon',
    'Marathon': 'marathon',
    'Ultra': 'ultra',
  };

  return typeMap[raceType] || 'sprint';
}

/**
 * Map UI constraint data to API format
 */
function mapConstraintsToApi(constraintsData: any): Constraint[] {
  if (!constraintsData.hasConstraints) {
    return [];
  }

  const disciplines: Array<'swim' | 'bike' | 'run' | 'strength'> = [];
  if (constraintsData.affectedDisciplines) {
    if (constraintsData.affectedDisciplines.includes('swim')) disciplines.push('swim');
    if (constraintsData.affectedDisciplines.includes('bike')) disciplines.push('bike');
    if (constraintsData.affectedDisciplines.includes('run')) disciplines.push('run');
  }

  if (disciplines.length === 0) {
    return [];
  }

  return [{
    constraint_type: (constraintsData.constraintType || 'availability') as 'injury' | 'equipment' | 'availability',
    affected_disciplines: disciplines,
    start_date: constraintsData.startDate,
    end_date: constraintsData.endDate || null,
    severity: 'mild' as const,
    description: constraintsData.description || null,
  }];
}

// ============================================================================
// Hook
// ============================================================================

export function useOnboardingPersistence(): UseOnboardingPersistenceReturn {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle API errors consistently
   */
  const handleApiError = useCallback((err: any) => {
    const apiError = err as ApiError;
    const errorMessage = getErrorMessage(apiError);
    setError(errorMessage);

    // Redirect to login if auth error
    if (isAuthError(apiError)) {
      setTimeout(() => {
        router.push('/login?redirect=/onboarding');
      }, 2000);
    }

    return false;
  }, [router]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // Profile Operations
  // ============================================================================

  const saveProfile = useCallback(async (profileData: any): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const apiProfile = mapProfileToApi(profileData);
      if (!apiProfile) {
        setError('Invalid profile data');
        return false;
      }

      await saveAthleteProfile(apiProfile);
      return true;
    } catch (err) {
      return handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  }, [handleApiError]);

  const loadProfile = useCallback(async (): Promise<any | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const profile = await getAthleteProfile();
      return profile;
    } catch (err) {
      handleApiError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  // ============================================================================
  // Preferences Operations
  // ============================================================================

  const savePreferences = useCallback(async (preferencesData: any): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const apiPreferences = mapPreferencesToApi(preferencesData);
      await saveAthletePreferences(apiPreferences);
      return true;
    } catch (err) {
      return handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  }, [handleApiError]);

  const loadPreferences = useCallback(async (): Promise<any | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const preferences = await getAthletePreferences();
      return preferences;
    } catch (err) {
      handleApiError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  // ============================================================================
  // Races Operations
  // ============================================================================

  const saveRaceData = useCallback(async (racesData: any[]): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const apiRaces = mapRacesToApi(racesData);
      if (apiRaces.length === 0) {
        return true; // No races to save is valid
      }

      await saveRaces(apiRaces);
      return true;
    } catch (err) {
      return handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  }, [handleApiError]);

  const loadRaces = useCallback(async (): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const races = await getRaces();
      return races || [];
    } catch (err) {
      handleApiError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  // ============================================================================
  // Constraints Operations
  // ============================================================================

  const saveConstraintData = useCallback(async (constraintsData: any): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const apiConstraints = mapConstraintsToApi(constraintsData);
      if (apiConstraints.length === 0) {
        return true; // No constraints to save is valid
      }

      await saveConstraints(apiConstraints);
      return true;
    } catch (err) {
      return handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  }, [handleApiError]);

  return {
    isSaving,
    isLoading,
    error,
    saveProfile,
    loadProfile,
    savePreferences,
    loadPreferences,
    saveRaceData,
    loadRaces,
    saveConstraintData,
    clearError,
  };
}
