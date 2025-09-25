/**
 * Custom hooks for cockpit data fetching with loading/error states
 * Uses B3a state management infrastructure
 */

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching plan data
 */
export function usePlanData(athleteId: string): UseDataState<{
  plan_id: string;
  version: number;
  status: string;
  start_date: string;
  end_date: string;
  blocks: Array<{
    block_id: string;
    phase: string;
    week_index: number;
    focus: string;
    start_date: string;
    end_date: string;
    planned_hours: number;
  }>;
}> {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      apiClient.setAthleteId(athleteId);
      const response = await apiClient.getPlan();
      
      if (response.error) {
        setError(response.error);
        setData(null);
      } else {
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (athleteId) {
      fetchData();
    }
  }, [athleteId]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching sessions data
 */
export function useSessionsData(
  athleteId: string,
  params?: {
    start?: string;
    end?: string;
    sport?: string;
    limit?: number;
  }
): UseDataState<{
  items: Array<{
    session_id: string;
    date: string;
    sport: string;
    title: string;
    planned_duration_min: number;
    planned_load: number;
    planned_zone_primary: string;
    status: string;
    structure_json: {
      segments: Array<{ zone: number; duration: number }>;
    };
  }>;
  next_cursor: string | null;
}> {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      apiClient.setAthleteId(athleteId);
      const response = await apiClient.getSessions(params);
      
      if (response.error) {
        setError(response.error);
        setData(null);
      } else {
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (athleteId) {
      fetchData();
    }
  }, [athleteId, params?.start, params?.end, params?.sport, params?.limit]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching readiness data
 */
export function useReadinessData(
  athleteId: string,
  date?: string
): UseDataState<{
  date: string;
  score: number;
  band: 'green' | 'amber' | 'red';
  drivers: Array<{
    key: string;
    z: number;
    weight: number;
    contribution: number;
  }>;
  flags: string[];
  data_quality: {
    missing: string[];
    clipped: boolean;
  };
}> {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      apiClient.setAthleteId(athleteId);
      const response = await apiClient.getReadiness(date);
      
      if (response.error) {
        setError(response.error);
        setData(null);
      } else {
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (athleteId) {
      fetchData();
    }
  }, [athleteId, date]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Combined hook for all cockpit data
 */
export function useCockpitData(athleteId: string) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const plan = usePlanData(athleteId);
  const sessions = useSessionsData(athleteId, {
    start: today,
    end: tomorrow,
    limit: 10,
  });
  const readiness = useReadinessData(athleteId, today);

  return {
    plan,
    sessions,
    readiness,
    loading: plan.loading || sessions.loading || readiness.loading,
    hasError: !!(plan.error || sessions.error || readiness.error),
    errors: {
      plan: plan.error,
      sessions: sessions.error,
      readiness: readiness.error,
    },
    refetchAll: async () => {
      await Promise.all([
        plan.refetch(),
        sessions.refetch(),
        readiness.refetch(),
      ]);
    },
  };
}
