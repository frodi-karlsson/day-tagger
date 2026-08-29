import { assert } from '#src/error/assert.js'
import type { FullConfig } from '@playwright/test'
import { execFileSync } from 'node:child_process'

/** Builds with preview routes on, then starts astro's preview server on the configured port. */
export default function globalSetup(config: FullConfig): void {
  const env = { ...process.env, APP_ENV: 'e2e' }

  execFileSync('pnpm', ['run', 'build'], { env, stdio: 'inherit' })
  execFileSync('pnpm', ['exec', 'astro', 'preview', '--port', readPort(config)], {
    env,
    stdio: 'inherit',
  })
}

function readPort(config: FullConfig): string {
  const baseURL = config.projects[0]?.use.baseURL

  assert(baseURL !== undefined, 'No baseURL configured, so the preview server has no port.')

  return new URL(baseURL).port
}
