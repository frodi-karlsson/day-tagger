import type { AstroIntegration } from 'astro'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const assetDir = '_astro'
const manifestName = 'precache-manifest.json'
const workerName = 'sw.js'
const buildIdToken = '__BUILD_ID__'

/**
 * Lists everything the service worker should cache up front, and stamps the worker with an id
 * derived from that list.
 *
 * Two problems need this. The shell only names its entry chunks, so anything behind a dynamic
 * import is invisible until it is requested, which is too late to be useful offline. And a
 * worker whose bytes never change is never reinstalled, so its precache would be frozen at
 * whatever the first deploy happened to contain.
 */
export function precacheManifest(): AstroIntegration {
  return {
    name: 'precache-manifest',
    hooks: {
      'astro:build:done': async ({ dir, pages }) => {
        const root = fileURLToPath(dir)
        const assets = await readAssets(join(root, assetDir))
        const urls = [...pages.map((page) => `/${page.pathname}`), ...assets]

        await writeFile(join(root, manifestName), JSON.stringify(urls), 'utf8')
        await stampWorker(root, buildIdOf(urls))
      },
    },
  }
}

async function readAssets(path: string): Promise<string[]> {
  try {
    const names = await readdir(path)

    return names.map((name) => `/${assetDir}/${name}`)
  } catch {
    return []
  }
}

/** Derived from the file names, so an unchanged build leaves the worker untouched. */
function buildIdOf(urls: string[]): string {
  return createHash('sha256')
    .update([...urls].sort().join('\n'))
    .digest('hex')
    .slice(0, 12)
}

async function stampWorker(root: string, buildId: string): Promise<void> {
  const path = join(root, workerName)
  const source = await readFile(path, 'utf8')

  await writeFile(path, source.replaceAll(buildIdToken, buildId), 'utf8')
}
