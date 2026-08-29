export interface PreviewRoute {
  /** Path to the .astro file, relative to this folder. */
  entrypoint: string
  /** Route the preview is served from. */
  pattern: string
}
