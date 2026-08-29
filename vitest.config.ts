import { getViteConfig } from 'astro/config';
import type { TestUserConfig } from 'vitest/config';

const test: TestUserConfig = {
  environment: 'happy-dom',
  include: ['src/**/*.test.ts'],
  restoreMocks: true,
};

export default getViteConfig({ test });
