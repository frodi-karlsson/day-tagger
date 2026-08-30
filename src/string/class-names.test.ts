import { classNames } from '#src/string/class-names.js'
import { expect, test } from 'vitest'

test('should join the names it is given', () => {
  expect(classNames('a', 'b')).toBe('a b')
})

test('should drop undefined names', () => {
  expect(classNames('a', undefined, 'b')).toBe('a b')
})

test('should drop names switched off by a condition', () => {
  expect(classNames('a', false, 'b')).toBe('a b')
})

test('should drop empty names', () => {
  expect(classNames('a', '', 'b')).toBe('a b')
})

test('should return an empty string when nothing survives', () => {
  expect(classNames(undefined, false)).toBe('')
})
