import type { AstroIntegration } from 'astro'
import { readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const assetDir = '_astro'
const manifestName = 'precache-manifest.json'

/**
 * Lists everything the service worker should cache up front. The shell only names its entry
 * chunks, so anything reached through a dynamic import is invisible until it is requested,
 * which is too late to be useful offline.
 */
export function precacheManifest(): AstroIntegration {
  return {
    name: 'precache-manifest',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir)
        const assets = await readAssets(join(root, assetDir))
        const urls = ['/', ...assets.map((name) => `/${assetDir}/${name}`)]

        await writeFile(join(root, manifestName), JSON.stringify(urls), 'utf8')
      },
    },
  }
}

async function readAssets(path: string): Promise<string[]> {
  try {
    return await readdir(path)
  } catch {
    return []
  }
}
