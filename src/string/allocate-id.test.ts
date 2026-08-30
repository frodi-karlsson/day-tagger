import { allocateId } from '#src/string/allocate-id.js'
import { expect, test } from 'vitest'

test('should slugify the label when nothing is taken', () => {
  expect(allocateId('Trigger Food', [])).toBe('trigger-food')
})

test('should suffix the first collision with two', () => {
  expect(allocateId('Coffee', ['coffee'])).toBe('coffee-2')
})

test('should keep counting past an existing suffix', () => {
  expect(allocateId('Coffee', ['coffee', 'coffee-2'])).toBe('coffee-3')
})

test('should take the first free suffix rather than the highest', () => {
  expect(allocateId('Coffee', ['coffee', 'coffee-3'])).toBe('coffee-2')
})

test('should ignore ids that do not collide', () => {
  expect(allocateId('Coffee', ['tea', 'water'])).toBe('coffee')
})

test('should fall back when the label has nothing to slugify', () => {
  expect(allocateId('!!!', [], 'tag')).toBe('tag')
})

test('should suffix the fallback when it is taken too', () => {
  expect(allocateId('!!!', ['tag'], 'tag')).toBe('tag-2')
})
