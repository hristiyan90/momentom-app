/**
 * API Client for authenticated requests to live endpoints
 * Handles authentication with X-Athlete-Id header pattern
 */

export interface ApiClientConfig {
  athleteId?: string;
  baseUrl?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

class ApiClient {
  private athleteId: string | null = null;
  private baseUrl: string;

  constructor(config: ApiClientConfig = {}) {
    this.athleteId = config.athleteId || null;
    this.baseUrl = config.baseUrl || '';
  }

  /**
   * Set athlete ID for authentication
   */
  setAthleteId(athleteId: string) {
    this.athleteId = athleteId;
  }

  /**
   * Get current athlete ID
   */
  getAthleteId(): string | null {
    return this.athleteId;
  }

  /**
   * Create headers for authenticated request
   */
  private createHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add X-Athlete-Id header for dev authentication
    if (this.athleteId) {
      headers['X-Athlete-Id'] = this.athleteId;
    }

    return headers;
  }

  /**
   * Make authenticated GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.createHeaders(),
        cache: 'no-store', // Ensure we get fresh data
      });

      if (!response.ok) {
        return {
          data: null,
          error: `Request failed with status ${response.status}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        data,
        error: null,
        status: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
      };
    }
  }

  /**
   * Get plan data for current athlete
   */
  async getPlan() {
    return this.get<{
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
    }>('/api/plan');
  }

  /**
   * Get sessions data for current athlete
   */
  async getSessions(params?: {
    start?: string;
    end?: string;
    sport?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.start) searchParams.set('start', params.start);
    if (params?.end) searchParams.set('end', params.end);
    if (params?.sport) searchParams.set('sport', params.sport);
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    const endpoint = `/api/sessions${query ? `?${query}` : ''}`;

    return this.get<{
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
    }>(endpoint);
  }

  /**
   * Get readiness data for current athlete
   */
  async getReadiness(date?: string) {
    const searchParams = new URLSearchParams();
    if (date) searchParams.set('date', date);

    const query = searchParams.toString();
    const endpoint = `/api/readiness${query ? `?${query}` : ''}`;

    return this.get<{
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
    }>(endpoint);
  }
}

// Default client instance
export const apiClient = new ApiClient();

// Helper hook for React components
export function useApiClient(athleteId?: string) {
  if (athleteId && athleteId !== apiClient.getAthleteId()) {
    apiClient.setAthleteId(athleteId);
  }
  return apiClient;
}
