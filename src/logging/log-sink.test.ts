import { expect, test, vi } from 'vitest';
import { getLogSink } from './log-sink';

test('should write to the console method matching the level', async () => {
  const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const sink = getLogSink('[Test]');

  await sink('warn', 'careful');

  expect(spy).toHaveBeenCalledWith('[Test]', 'careful');
});

test('should forward every argument after the prefix', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const sink = getLogSink('[Test]');

  await sink('error', 'failed', { id: 1 });

  expect(spy).toHaveBeenCalledWith('[Test]', 'failed', { id: 1 });
});
