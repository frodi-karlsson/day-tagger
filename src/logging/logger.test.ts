import { expect, test, vi } from 'vitest';
import { getLogger, type LogLevel } from './logger';

const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

test.each(levels)('should tag %s calls with their level', async (level) => {
  const sink = vi.fn();
  const logger = getLogger(sink);

  await logger[level]('hello');

  expect(sink).toHaveBeenCalledWith(level, 'hello');
});

test('should forward every argument to the sink', async () => {
  const sink = vi.fn();
  const logger = getLogger(sink);

  await logger.info('user', { id: 1 }, 42);

  expect(sink).toHaveBeenCalledWith('info', 'user', { id: 1 }, 42);
});

test('should call the sink once per log call', async () => {
  const sink = vi.fn();
  const logger = getLogger(sink);

  await logger.warn('once');

  expect(sink).toHaveBeenCalledTimes(1);
});

test('should return the result of an async sink', async () => {
  const sink = vi.fn(() => Promise.resolve());
  const logger = getLogger(sink);

  const result = logger.error('boom');

  await expect(result).resolves.toBeUndefined();
});
