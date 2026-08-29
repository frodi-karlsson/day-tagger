import type { PreviewRoute } from '#src/preview/preview-routes.model.js'

/** Add a component here to give it a preview route. */
export const previewRouteList: PreviewRoute[] = [
  { pattern: '/_preview/button', entrypoint: './button.astro' },
]
