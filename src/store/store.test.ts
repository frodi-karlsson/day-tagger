import { Store } from './store.js'
import { createMemo, createRoot } from 'solid-js'
import { beforeEach, describe, expect, test } from 'vitest'

let store: Store

beforeEach(() => {
  store = new Store({ count: 0 })
})

describe('constructor', () => {
  test('should use the state it is given', () => {
    const seeded = new Store({ count: 7 })

    expect(seeded.get('count')).toBe(7)
  })

  test('should not share state between instances', () => {
    const other = new Store({ count: 0 })

    other.set('count', 3)

    expect(store.get('count')).toBe(0)
  })
})

describe('get', () => {
  test('should return the current value', () => {
    expect(store.get('count')).toBe(0)
  })

  test('should track the key it reads', () => {
    createRoot(() => {
      const doubled = createMemo(() => store.get('count') * 2)

      store.set('count', 5)

      expect(doubled()).toBe(10)
    })
  })
})

describe('set', () => {
  test('should replace the value', () => {
    store.set('count', 4)

    expect(store.get('count')).toBe(4)
  })
})

describe('update', () => {
  test('should derive the value from the previous one', () => {
    store.set('count', 2)

    store.update('count', (prev) => prev + 3)

    expect(store.get('count')).toBe(5)
  })
})
