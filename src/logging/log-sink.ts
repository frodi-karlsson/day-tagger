import type { LogSink } from './logger';

/** Builds a sink that writes to the console, tagged with `prefix`. */
export function getLogSink(prefix: string): LogSink {
  return (level, ...args) => {
    console[level](prefix, ...args);
  };
}
