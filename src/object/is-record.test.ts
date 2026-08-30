import { isRecord } from '#src/object/is-record.js'
import { expect, test } from 'vitest'

test('should accept a plain object', () => {
  expect(isRecord({ a: 1 })).toBe(true)
})

test('should accept an empty object', () => {
  expect(isRecord({})).toBe(true)
})

test('should reject an array', () => {
  expect(isRecord([1, 2])).toBe(false)
})

test('should reject null', () => {
  expect(isRecord(null)).toBe(false)
})

test('should reject undefined', () => {
  expect(isRecord(undefined)).toBe(false)
})

test('should reject a primitive', () => {
  expect(isRecord('nope')).toBe(false)
})
