/**
 * YOUSELL Structured Logger
 *
 * JSON-formatted logging with levels, request IDs, engine context,
 * and timing. Replaces console.log/error for production observability.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Product scanned', { engine: 'discovery', productId: '123' });
 *   logger.error('Scan failed', { engine: 'discovery', error: err });
 *
 *   // Request-scoped:
 *   const log = logger.withContext({ requestId: 'abc', engine: 'scoring' });
 *   log.info('Score calculated', { score: 85 });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL = (process.env.LOG_LEVEL as LogLevel) || 'info';
const SERVICE_NAME = process.env.SERVICE_NAME || 'yousell-admin';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatEntry(level: LogLevel, message: string, meta: Record<string, unknown> = {}): string {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    ...meta,
  };

  // Serialize errors properly
  if (entry.error instanceof Error) {
    entry.error = {
      name: entry.error.name,
      message: entry.error.message,
      stack: entry.error.stack,
    };
  }

  return JSON.stringify(entry);
}

export class Logger {
  private context: Record<string, unknown>;

  constructor(context: Record<string, unknown> = {}) {
    this.context = context;
  }

  /**
   * Create a child logger with additional context merged in.
   * Useful for request-scoped or engine-scoped logging.
   */
  withContext(extra: Record<string, unknown>): Logger {
    return new Logger({ ...this.context, ...extra });
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('debug')) return;
    console.debug(formatEntry('debug', message, { ...this.context, ...meta }));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('info')) return;
    console.info(formatEntry('info', message, { ...this.context, ...meta }));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('warn')) return;
    console.warn(formatEntry('warn', message, { ...this.context, ...meta }));
  }

  error(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('error')) return;
    console.error(formatEntry('error', message, { ...this.context, ...meta }));
  }

  /**
   * Time an async operation and log its duration.
   */
  async time<T>(label: string, fn: () => Promise<T>, meta?: Record<string, unknown>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.info(`${label} completed`, { ...meta, durationMs: Date.now() - start });
      return result;
    } catch (err) {
      this.error(`${label} failed`, { ...meta, durationMs: Date.now() - start, error: err });
      throw err;
    }
  }
}

/** Global logger singleton */
export const logger = new Logger();

/**
 * Create an engine-scoped logger.
 */
export function engineLogger(engine: string): Logger {
  return logger.withContext({ engine });
}

/**
 * Create a request-scoped logger.
 */
export function requestLogger(requestId: string, extra?: Record<string, unknown>): Logger {
  return logger.withContext({ requestId, ...extra });
}
