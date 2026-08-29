import { assert } from '#src/error/assert.js'
import type { FullConfig } from '@playwright/test'
import { execFileSync } from 'node:child_process'

/** Builds with preview routes on, starts astro's preview server, and waits for it to answer. */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const env = { ...process.env, APP_ENV: 'e2e' }
  const baseUrl = readBaseUrl(config)

  execFileSync('pnpm', ['run', 'build'], { env, stdio: 'inherit' })
  execFileSync(
    'pnpm',
    ['exec', 'astro', 'preview', '--background', '--port', new URL(baseUrl).port],
    { env, stdio: 'inherit' },
  )

  await waitForServer(baseUrl)
}

function readBaseUrl(config: FullConfig): string {
  const baseUrl = config.projects[0]?.use.baseURL

  assert(baseUrl !== undefined, 'No baseURL configured, so the preview server has no port.')

  return baseUrl
}

async function waitForServer(url: string): Promise<void> {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)

      if (response.ok) {
        return
      }
    } catch {
      // Not listening yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  throw new Error(`Preview server never answered at ${url}.`)
}
