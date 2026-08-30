import type { PreviewRoute } from '#src/preview/preview-routes.model.js'

/** Add a component here to give it a preview route. */
export const previewRouteList: PreviewRoute[] = [
  { pattern: '/_preview/button', entrypoint: './button.astro' },
  { pattern: '/_preview/tag-field', entrypoint: './tag-field.astro' },
  { pattern: '/_preview/calendar-view', entrypoint: './calendar-view.astro' },
  { pattern: '/_preview/day-tag-menu', entrypoint: './day-tag-menu.astro' },
  { pattern: '/_preview/day-tag-menu-empty', entrypoint: './day-tag-menu-empty.astro' },
  { pattern: '/_preview/tag-config-menu', entrypoint: './tag-config-menu.astro' },
  { pattern: '/_preview/tag-config-menu-edit', entrypoint: './tag-config-menu-edit.astro' },
  { pattern: '/_preview/tag-config-menu-empty', entrypoint: './tag-config-menu-empty.astro' },
]
