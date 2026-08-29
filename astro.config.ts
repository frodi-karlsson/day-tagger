import { previewRoutes } from '#src/preview/preview-routes.integration.js'
import solid from '@astrojs/solid-js'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), previewRoutes()],
})
