/**
 * Shared mock Supabase DB client for engine tests.
 *
 * Creates a chainable mock that returns { data: null, error: null }
 * by default. Tests can override specific return values as needed.
 */

import { vi } from 'vitest';

export function createMockDbClient() {
  const chainable: Record<string, ReturnType<typeof vi.fn>> = {};

  // Build chainable mock — every method returns `this` for chaining,
  // except `single()` which terminates the chain.
  const builder = () => {
    const mock: Record<string, unknown> = {};
    const methods = [
      'select', 'insert', 'update', 'upsert', 'delete',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in',
      'order', 'limit', 'match', 'filter',
    ];

    for (const method of methods) {
      mock[method] = vi.fn().mockReturnValue(mock);
    }

    // Terminal methods
    mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
    // Make non-terminal calls also resolve to { data: [], error: null } when awaited
    mock.then = undefined; // Don't make the whole object thenable

    // Store references for test assertions
    Object.assign(chainable, mock);

    return mock;
  };

  const client = {
    from: vi.fn(() => builder()),
    _chainable: chainable,
  };

  return client;
}
