import { registerDI } from '../di/di';
import { getConsoleSink } from '../logging/console.sink';
import { getLogger, type Logger } from '../logging/logger';
import type { Promisable } from '../promise/promisable';

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
