import { defineConfig } from '@playwright/test'

const viewport = { width: 900, height: 700 }

export default defineConfig({
  testDir: 'src',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  reporter: 'list',
  timeout: 10_000,
  // astro preview always detaches, so webServer cannot own its lifecycle.
  globalSetup: './src/preview/preview-server.setup.ts',
  globalTeardown: './src/preview/preview-server.teardown.ts',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      // Glyph antialiasing differs between macOS and linux even with the font bundled. A
      // looser per pixel tolerance ignores those small deltas, while a real colour or layout
      // change stays far above it. The ratio is only a backstop.
      threshold: 0.35,
      maxDiffPixelRatio: 0.02,
      pathTemplate: '{testDir}/{testFileDir}/screenshots/{arg}-{projectName}{ext}',
    },
  },
  projects: [
    {
      name: 'light',
      use: { browserName: 'chromium', colorScheme: 'light', deviceScaleFactor: 1, viewport },
    },
    {
      name: 'dark',
      use: { browserName: 'chromium', colorScheme: 'dark', deviceScaleFactor: 1, viewport },
    },
  ],
  use: { baseURL: 'http://localhost:4331' },
})
