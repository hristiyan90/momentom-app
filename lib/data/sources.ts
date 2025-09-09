/**
 * Database table name constants for data layer
 * Maps logical data types to actual Supabase table names
 */
export const TABLES = {
  plan: 'plan',
  sessions: 'sessions', 
  readiness: 'readiness_daily',
  fuel: 'fuel_sessions'
} as const;

/**
 * Type for table name keys
 */
export type TableKey = keyof typeof TABLES;

/**
 * Type for actual table names
 */
export type TableName = typeof TABLES[TableKey];
