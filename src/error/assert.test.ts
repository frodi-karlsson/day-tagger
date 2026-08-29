import { assert } from '#src/error/assert.js'
import { describe, expect, test } from 'vitest'

describe('assert', () => {
  test('should do nothing when the condition holds', () => {
    expect(() => {
      assert(true)
    }).not.toThrow()
  })

  test('should throw when the condition fails', () => {
    expect(() => {
      assert(false)
    }).toThrow()
  })

  test('should throw with the given message', () => {
    expect(() => {
      assert(false, 'the sky fell')
    }).toThrow('the sky fell')
  })

  test('should fall back to a default message', () => {
    expect(() => {
      assert(false)
    }).toThrow('Assertion failed.')
  })
})
