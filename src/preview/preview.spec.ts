import { assert } from '#src/error/assert.js'
import { previewRouteList } from '#src/preview/preview-routes.const.js'
import { expect, test } from '@playwright/test'

for (const route of previewRouteList) {
  const previewName = route.pattern.split('/').filter(Boolean).pop()
  assert(previewName !== undefined, `Preview route "${route.pattern}" has no name segment.`)

  test.describe(route.pattern, () => {
    test('should match every variant', async ({ page }) => {
      await page.goto(route.pattern)

      const variants = page.locator('[data-preview-variant]')
      await expect(variants.first()).toBeVisible()

      for (const variant of await variants.all()) {
        const name = await variant.getAttribute('data-preview-variant')
        assert(name !== null, `A variant on ${route.pattern} has no data-preview-variant value.`)

        await expect(variant).toHaveScreenshot([previewName, `${name}.png`])
      }
    })
  })
}
