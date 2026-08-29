import type { LogSink } from './logger.js'

/** Sink that writes to the matching `console` method, tagged with `prefix`. */
export function getConsoleSink(prefix: string): LogSink {
  return (level, ...args) => {
    console[level](prefix, ...args)
  }
}
