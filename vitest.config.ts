import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Keeps solid-js and solid-js/store on the same build, otherwise reactivity is a no-op.
  resolve: { conditions: ['browser', 'development'] },
  test: {
    server: { deps: { inline: [/solid-js/] } },
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
})
