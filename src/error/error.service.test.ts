import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Logger } from '#src/logging/logger.js';
import { ErrorService } from './error.service.js';

let logger: Logger;
let service: ErrorService;

beforeEach(() => {
  logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  service = new ErrorService(logger);
});

describe('trackError', () => {
  test('should report the error at error level', async () => {
    const error = new Error('boom');

    await service.trackError(error);

    expect(logger.error).toHaveBeenCalledWith(error);
  });

  test('should return the result of an async logger', async () => {
    logger.error = vi.fn(() => Promise.resolve());

    const result = service.trackError(new Error('boom'));

    await expect(result).resolves.toBeUndefined();
  });
});

describe('trackErrorMessage', () => {
  test('should report the message at error level', async () => {
    await service.trackErrorMessage('something broke');

    expect(logger.error).toHaveBeenCalledWith('something broke');
  });

  test('should not touch the other log levels', async () => {
    await service.trackErrorMessage('something broke');

    expect(logger.warn).not.toHaveBeenCalled();
  });
});
