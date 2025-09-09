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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
