import { execFileSync } from 'node:child_process'

/** Stops the preview server that global setup left running in the background. */
export default function globalTeardown(): void {
  execFileSync('pnpm', ['exec', 'astro', 'preview', 'stop'], { stdio: 'inherit' })
}
