import { env } from '#src/env/env.js'
import { previewRouteList } from '#src/preview/preview-routes.const.js'
import type { AstroIntegration } from 'astro'

/** Adds the component preview routes, but only in environments that ask for them. */
export function previewRoutes(): AstroIntegration {
  return {
    name: 'preview-routes',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        if (!env.hasComponentTestingRoutesEnabled) {
          return
        }

        for (const route of previewRouteList) {
          injectRoute({
            pattern: route.pattern,
            entrypoint: new URL(route.entrypoint, import.meta.url),
          })
        }
      },
    },
  }
}
