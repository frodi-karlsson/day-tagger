import { expect, test } from '@playwright/test'

// Typed one key at a time on purpose. A single fill() sets the value in one go and would pass
// even while every keystroke was rebuilding the input.
test('should keep focus while renaming an option', async ({ page }) => {
  await page.goto('/_preview/tag-config-menu-edit')

  const input = page.getByLabel('Option label', { exact: true })
  await input.click()
  await input.fill('')
  await page.keyboard.type('Red wine')

  await expect(input).toHaveValue('Red wine')
  await expect(input).toBeFocused()
})
