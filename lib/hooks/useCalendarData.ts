/**
 * Calendar-specific data hooks for date-range session queries
 * Uses B3a state management infrastructure
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api/client';

export interface UseCalendarDataState {
  sessions: {
    data: Array<{
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
    }> | null;
    loading: boolean;
    error: string | null;
  };
  plan: {
    data: {
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
    } | null;
    loading: boolean;
    error: string | null;
  };
  loading: boolean;
  hasError: boolean;
  errors: { sessions?: string; plan?: string };
  refetchAll: () => Promise<void>;
}

/**
 * Calendar data hook for month/week views with date filtering
 */
export function useCalendarData(
  athleteId: string,
  dateRange: { start: string; end: string }
): UseCalendarDataState {
  const [sessions, setSessions] = useState<{
    data: any[] | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: true, error: null });

  const [plan, setPlan] = useState<{
    data: any | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: true, error: null });

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errors, setErrors] = useState<{ sessions?: string; plan?: string }>({});

  const fetchSessions = useCallback(async () => {
    setSessions(prev => ({ ...prev, loading: true, error: null }));
    try {
      console.log(`🗓️ Fetching sessions for date range: ${dateRange.start} to ${dateRange.end}`);
      apiClient.setAthleteId(athleteId);
      const response = await apiClient.getSessions({
        start: dateRange.start,
        end: dateRange.end,
        limit: 100, // Fetch enough for calendar view
      });

      if (response.error) {
        setSessions({ data: null, loading: false, error: response.error });
        setErrors(prev => ({ ...prev, sessions: response.error }));
        setHasError(true);
      } else {
        const sessionCount = response.data?.items?.length || 0;
        console.log(`✅ Fetched ${sessionCount} sessions for ${dateRange.start} to ${dateRange.end}`);
        setSessions({ 
          data: response.data?.items || [], 
          loading: false, 
          error: null 
        });
        setErrors(prev => ({ ...prev, sessions: undefined }));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch sessions';
      setSessions({ data: null, loading: false, error: errorMessage });
      setErrors(prev => ({ ...prev, sessions: errorMessage }));
      setHasError(true);
    }
  }, [athleteId, dateRange.start, dateRange.end]);

  const fetchPlan = useCallback(async () => {
    setPlan(prev => ({ ...prev, loading: true, error: null }));
    try {
      apiClient.setAthleteId(athleteId);
      const response = await apiClient.getPlan();

      if (response.error) {
        setPlan({ data: null, loading: false, error: response.error });
        setErrors(prev => ({ ...prev, plan: response.error }));
        setHasError(true);
      } else {
        setPlan({ 
          data: response.data, 
          loading: false, 
          error: null 
        });
        setErrors(prev => ({ ...prev, plan: undefined }));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch plan';
      setPlan({ data: null, loading: false, error: errorMessage });
      setErrors(prev => ({ ...prev, plan: errorMessage }));
      setHasError(true);
    }
  }, [athleteId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    setErrors({});

    await Promise.all([fetchSessions(), fetchPlan()]);
    setLoading(false);
  }, [fetchSessions, fetchPlan]);

  useEffect(() => {
    if (athleteId && dateRange.start && dateRange.end) {
      fetchData();
    }
  }, [fetchData]);

  return {
    sessions,
    plan,
    loading,
    hasError,
    errors,
    refetchAll: fetchData,
  };
}

/**
 * Hook for week view data with specific week start
 */
export function useWeekData(athleteId: string, weekStart: Date) {
  const dateRange = useMemo(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
    };
  }, [weekStart]);

  return useCalendarData(athleteId, dateRange);
}

/**
 * Hook for month view data with specific year/month
 */
export function useMonthData(athleteId: string, year: number, month: number) {
  const dateRange = useMemo(() => {
    // Get full month range including partial weeks
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Extend to include partial weeks at start/end
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - ((lastDay.getDay() + 6) % 7)));

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }, [year, month]);

  return useCalendarData(athleteId, dateRange);
}
