import type { ChoiceId, TagId } from '#src/tag/tag.model.js'
import { allocateChoiceId, allocateTagId } from '#src/tag/tag.id.js'
import { describe, expect, test } from 'vitest'

describe('allocateTagId', () => {
  test('should slugify the label', () => {
    expect(allocateTagId('Trigger Food', [])).toBe('trigger-food')
  })

  test('should avoid a tag id already in use', () => {
    expect(allocateTagId('Coffee', ['coffee' as TagId])).toBe('coffee-2')
  })

  test('should fall back to tag when the label has nothing to slugify', () => {
    expect(allocateTagId('???', [])).toBe('tag')
  })
})

describe('allocateChoiceId', () => {
  test('should slugify the label', () => {
    expect(allocateChoiceId('Red Wine', [])).toBe('red-wine')
  })

  test('should avoid a choice id already in use', () => {
    expect(allocateChoiceId('Wine', ['wine' as ChoiceId])).toBe('wine-2')
  })

  test('should fall back to option when the label has nothing to slugify', () => {
    expect(allocateChoiceId('???', [])).toBe('option')
  })
})
