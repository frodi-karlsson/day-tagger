import { registerDI } from '#src/di/di.js';
import { getConsoleSink } from '#src/logging/console.sink.js';
import { getLogger, type Logger } from '#src/logging/logger.js';
import type { Promisable } from '#src/promise/promisable.js';

/** Single place to report errors. Backed by a logger until a real reporter replaces it. */
export class ErrorService {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  trackError(error: Error): Promisable<void> {
    return this.logger.error(error);
  }

  trackErrorMessage(message: string): Promisable<void> {
    return this.logger.error(message);
  }
}

registerDI(ErrorService, () => new ErrorService(getLogger(getConsoleSink('[Error]'))));
