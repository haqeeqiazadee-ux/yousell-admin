/**
 * Minimal Supabase client type for engine DB access.
 *
 * Uses `any` return types for chainable methods to avoid TS errors
 * with dynamic Supabase query builders. The real Supabase client
 * handles type safety at runtime.
 *
 * Engines use this via setDbClient() for testability.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SupabaseMinimalClient {
  from(table: string): SupabaseQueryBuilder;
}

export interface SupabaseQueryBuilder {
  select(columns?: string): any;
  insert(data: any): any;
  update(data: any): any;
  upsert(data: any, options?: any): any;
  delete(): any;
  eq(column: string, value: any): any;
  neq(column: string, value: any): any;
  gt(column: string, value: any): any;
  gte(column: string, value: any): any;
  lt(column: string, value: any): any;
  lte(column: string, value: any): any;
  in(column: string, values: any[]): any;
  order(column: string, options?: any): any;
  limit(count: number): any;
  single(): any;
  [key: string]: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
