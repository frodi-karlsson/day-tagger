import type { Promisable } from '../promise/promisable';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogSink = (level: LogLevel, ...args: unknown[]) => Promisable<void>;

export type Logger = Record<LogLevel, (...args: unknown[]) => Promisable<void>>;

class SinkLogger implements Logger {
  private readonly sink: LogSink;

  constructor(sink: LogSink) {
    this.sink = sink;
  }

  debug(...args: unknown[]): Promisable<void> {
    return this.sink('debug', ...args);
  }

  info(...args: unknown[]): Promisable<void> {
    return this.sink('info', ...args);
  }

  warn(...args: unknown[]): Promisable<void> {
    return this.sink('warn', ...args);
  }

  error(...args: unknown[]): Promisable<void> {
    return this.sink('error', ...args);
  }
}

/** Builds a logger that forwards every call to `sink`, tagged with its level. */
export function getLogger(sink: LogSink): Logger {
  return new SinkLogger(sink);
}
