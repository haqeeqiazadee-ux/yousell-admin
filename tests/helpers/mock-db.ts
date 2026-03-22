/**
 * Shared mock Supabase DB client for engine tests.
 *
 * Creates a fully chainable mock where every method returns the same
 * builder object (supporting arbitrary chain order like Supabase).
 * The builder is also thenable, resolving to { data: null, error: null }.
 */

import { vi } from 'vitest';

export function createMockDbClient() {
  const builder = () => {
    const defaultResult = { data: null, error: null };
    const defaultListResult = { data: [], error: null };

    // All methods that can appear in a Supabase chain
    const methods = [
      'select', 'insert', 'update', 'upsert', 'delete',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in',
      'order', 'limit', 'match', 'filter', 'single',
      'maybeSingle', 'range', 'textSearch', 'not',
      'or', 'contains', 'containedBy', 'overlaps',
    ];

    const mock: Record<string, unknown> = {};

    for (const method of methods) {
      mock[method] = vi.fn().mockReturnValue(mock);
    }

    // Make the builder thenable so `await db.from('x').select().eq()` works
    mock.then = (resolve: (value: unknown) => void) => {
      return Promise.resolve(defaultListResult).then(resolve);
    };

    // Override single() to also be thenable but return single-row result
    mock.single = vi.fn().mockImplementation(() => {
      const singleResult: Record<string, unknown> = { ...mock };
      singleResult.then = (resolve: (value: unknown) => void) => {
        return Promise.resolve(defaultResult).then(resolve);
      };
      return singleResult;
    });

    return mock;
  };

  const client = {
    from: vi.fn(() => builder()),
  };

  return client;
}
