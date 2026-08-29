import { devEnv } from '#src/env/env.dev.js'
import { e2eEnv } from '#src/env/env.e2e.js'
import { prodEnv } from '#src/env/env.prod.js'
import { resolveEnv } from '#src/env/env.js'
import { describe, expect, test } from 'vitest'

describe('resolveEnv', () => {
  test('should fall back to dev when the name is missing', () => {
    expect(resolveEnv(undefined)).toBe(devEnv)
  })

  test('should fall back to dev when the name is empty', () => {
    expect(resolveEnv('')).toBe(devEnv)
  })

  test('should return the environment matching the name', () => {
    expect(resolveEnv('e2e')).toBe(e2eEnv)
  })

  test('should return prod for prod', () => {
    expect(resolveEnv('prod')).toBe(prodEnv)
  })

  test('should throw on an unknown name', () => {
    expect(() => resolveEnv('staging')).toThrow('Unknown APP_ENV "staging"')
  })

  test('should list the known names when it throws', () => {
    expect(() => resolveEnv('staging')).toThrow('dev, e2e, prod')
  })

  test('should enable component testing routes outside prod', () => {
    expect(devEnv.hasComponentTestingRoutesEnabled).toBe(true)
    expect(e2eEnv.hasComponentTestingRoutesEnabled).toBe(true)
    expect(prodEnv.hasComponentTestingRoutesEnabled).toBe(false)
  })
})
