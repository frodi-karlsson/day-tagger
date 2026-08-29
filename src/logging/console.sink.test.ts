import { expect, test, vi } from 'vitest';
import { getConsoleSink } from './console.sink.js';

test('should write to the console method matching the level', async () => {
  const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const sink = getConsoleSink('[Test]');

  await sink('warn', 'careful');

  expect(spy).toHaveBeenCalledWith('[Test]', 'careful');
});

test('should forward every argument after the prefix', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const sink = getConsoleSink('[Test]');

  await sink('error', 'broke', { id: 1 });

  expect(spy).toHaveBeenCalledWith('[Test]', 'broke', { id: 1 });
});
