import { slugify } from '#src/string/slugify.js'
import { describe, expect, test } from 'vitest'

describe('slugify', () => {
  test('should lowercase the value', () => {
    expect(slugify('Primary')).toBe('primary')
  })

  test('should replace a run of separators with one dash', () => {
    expect(slugify('primary,   enabled')).toBe('primary-enabled')
  })

  test('should drop leading and trailing separators', () => {
    expect(slugify('  primary!  ')).toBe('primary')
  })

  test('should keep digits', () => {
    expect(slugify('Heading 2')).toBe('heading-2')
  })

  test('should leave an already clean slug alone', () => {
    expect(slugify('primary-enabled')).toBe('primary-enabled')
  })

  test('should return an empty string when nothing survives', () => {
    expect(slugify('!!!')).toBe('')
  })
})
