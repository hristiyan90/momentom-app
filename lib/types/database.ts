export interface Database {
  public: {
    Tables: {
      athlete: {
        Row: {
          athlete_id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          athlete_id?: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          athlete_id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      plan: {
        Row: {
          plan_id: string;
          athlete_id: string;
          name: string;
          version: number;
          plan_json: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          plan_id?: string;
          athlete_id: string;
          name: string;
          version?: number;
          plan_json: unknown;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_id?: string;
          athlete_id?: string;
          name?: string;
          version?: number;
          plan_json?: unknown;
          created_at?: string;
          updated_at?: string;
        };
      };
      adaptation_preview_cache: {
        Row: {
          adaptation_id: string;
          athlete_id: string;
          plan_id: string;
          scope: string;
          impact_start: string;
          impact_end: string;
          reason_code: string;
          triggers: unknown;
          changes_json: unknown;
          plan_version_before: number;
          rationale_text: string;
          driver_attribution: unknown | null;
          data_snapshot: unknown | null;
          checksum: string;
          idempotency_key: string | null;
          explainability_id: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          adaptation_id?: string;
          athlete_id: string;
          plan_id: string;
          scope: string;
          impact_start: string;
          impact_end: string;
          reason_code: string;
          triggers: unknown;
          changes_json: unknown;
          plan_version_before: number;
          rationale_text: string;
          driver_attribution?: unknown | null;
          data_snapshot?: unknown | null;
          checksum: string;
          idempotency_key?: string | null;
          explainability_id?: string | null;
          created_at?: string;
          expires_at: string;
        };
        Update: {
          adaptation_id?: string;
          athlete_id?: string;
          plan_id?: string;
          scope?: string;
          impact_start?: string;
          impact_end?: string;
          reason_code?: string;
          triggers?: unknown;
          changes_json?: unknown;
          plan_version_before?: number;
          rationale_text?: string;
          driver_attribution?: unknown | null;
          data_snapshot?: unknown | null;
          checksum?: string;
          idempotency_key?: string | null;
          explainability_id?: string | null;
          created_at?: string;
          expires_at?: string;
        };
      };
      adaptation_decision: {
        Row: {
          id: string;
          adaptation_id: string;
          athlete_id: string;
          plan_id: string;
          decision: string;
          changes_json: unknown;
          plan_version_before: number;
          plan_version_after: number | null;
          decided_at: string;
          rationale_text: string;
          driver_attribution: unknown | null;
          explainability_id: string | null;
        };
        Insert: {
          id?: string;
          adaptation_id: string;
          athlete_id: string;
          plan_id: string;
          decision: string;
          changes_json: unknown;
          plan_version_before: number;
          plan_version_after?: number | null;
          decided_at?: string;
          rationale_text: string;
          driver_attribution?: unknown | null;
          explainability_id?: string | null;
        };
        Update: {
          id?: string;
          adaptation_id?: string;
          athlete_id?: string;
          plan_id?: string;
          decision?: string;
          changes_json?: unknown;
          plan_version_before?: number;
          plan_version_after?: number | null;
          decided_at?: string;
          rationale_text?: string;
          driver_attribution?: unknown | null;
          explainability_id?: string | null;
        };
      };
      wellness_data: {
        Row: {
          wellness_id: string;
          athlete_id: string;
          date: string;
          data_type: 'sleep' | 'rhr' | 'weight';
          value_json: unknown;
          source_type: string;
          metadata: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          wellness_id?: string;
          athlete_id: string;
          date: string;
          data_type: 'sleep' | 'rhr' | 'weight';
          value_json: unknown;
          source_type?: string;
          metadata?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          wellness_id?: string;
          athlete_id?: string;
          date?: string;
          data_type?: 'sleep' | 'rhr' | 'weight';
          value_json?: unknown;
          source_type?: string;
          metadata?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      garmin_sync_config: {
        Row: {
          config_id: string;
          athlete_id: string;
          enabled: boolean;
          frequency: 'daily' | 'weekly' | 'manual_only';
          preferred_time: string;
          data_types: string[];
          garmin_db_path: string | null;
          garmin_monitoring_db_path: string | null;
          last_sync_at: string | null;
          next_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          config_id?: string;
          athlete_id: string;
          enabled?: boolean;
          frequency?: 'daily' | 'weekly' | 'manual_only';
          preferred_time?: string;
          data_types?: string[];
          garmin_db_path?: string | null;
          garmin_monitoring_db_path?: string | null;
          last_sync_at?: string | null;
          next_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          config_id?: string;
          athlete_id?: string;
          enabled?: boolean;
          frequency?: 'daily' | 'weekly' | 'manual_only';
          preferred_time?: string;
          data_types?: string[];
          garmin_db_path?: string | null;
          garmin_monitoring_db_path?: string | null;
          last_sync_at?: string | null;
          next_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      garmin_sync_history: {
        Row: {
          sync_id: string;
          athlete_id: string;
          sync_type: 'scheduled' | 'manual';
          data_types: string[];
          status: 'running' | 'completed' | 'failed' | 'cancelled';
          started_at: string;
          completed_at: string | null;
          duration_ms: number | null;
          activities_imported: number;
          wellness_records_imported: number;
          activities_skipped: number;
          wellness_skipped: number;
          errors: unknown;
          metadata: unknown;
          created_at: string;
        };
        Insert: {
          sync_id?: string;
          athlete_id: string;
          sync_type: 'scheduled' | 'manual';
          data_types: string[];
          status?: 'running' | 'completed' | 'failed' | 'cancelled';
          started_at?: string;
          completed_at?: string | null;
          duration_ms?: number | null;
          activities_imported?: number;
          wellness_records_imported?: number;
          activities_skipped?: number;
          wellness_skipped?: number;
          errors?: unknown;
          metadata?: unknown;
          created_at?: string;
        };
        Update: {
          sync_id?: string;
          athlete_id?: string;
          sync_type?: 'scheduled' | 'manual';
          data_types?: string[];
          status?: 'running' | 'completed' | 'failed' | 'cancelled';
          started_at?: string;
          completed_at?: string | null;
          duration_ms?: number | null;
          activities_imported?: number;
          wellness_records_imported?: number;
          activities_skipped?: number;
          wellness_skipped?: number;
          errors?: unknown;
          metadata?: unknown;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
