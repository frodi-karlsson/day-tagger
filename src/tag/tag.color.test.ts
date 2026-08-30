import { isHue, nextHue } from '#src/tag/tag.color.js'
import { describe, expect, test } from 'vitest'

describe('nextHue', () => {
  test('should start at the top of the wheel', () => {
    expect(nextHue(0)).toBe(0)
  })

  test('should stay on the wheel', () => {
    const hues = Array.from({ length: 50 }, (_, index) => nextHue(index))

    expect(hues.every(isHue)).toBe(true)
  })

  test('should keep consecutive tags apart', () => {
    const gap = Math.abs(nextHue(1) - nextHue(0))

    expect(gap).toBeGreaterThan(60)
  })

  test('should not repeat within a realistic number of tags', () => {
    const hues = Array.from({ length: 20 }, (_, index) => nextHue(index))

    expect(new Set(hues).size).toBe(20)
  })
})

describe('isHue', () => {
  test('should accept a hue on the wheel', () => {
    expect(isHue(200)).toBe(true)
  })

  test('should accept zero', () => {
    expect(isHue(0)).toBe(true)
  })

  test('should reject a full turn', () => {
    expect(isHue(360)).toBe(false)
  })

  test('should reject a negative hue', () => {
    expect(isHue(-1)).toBe(false)
  })

  test('should reject a value that is not a number', () => {
    expect(isHue(Number.NaN)).toBe(false)
  })
})
