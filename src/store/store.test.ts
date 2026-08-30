import type { IsoDate } from '#src/date/iso-date.js'
import { defaultState, Store, type StoreState } from '#src/store/store.js'
import { createMemo, createRoot } from 'solid-js'
import { beforeEach, describe, expect, test } from 'vitest'

let store: Store

beforeEach(() => {
  store = new Store(defaultState())
})

describe('constructor', () => {
  test('should use the state it is given', () => {
    const seeded = new Store({ ...defaultState(), openMenu: 'tags' })

    expect(seeded.get('openMenu')).toBe('tags')
  })

  test('should not share state between instances', () => {
    const other = new Store(defaultState())

    other.set('openMenu', 'day')

    expect(store.get('openMenu')).toBeUndefined()
  })

  test('should start on today', () => {
    const today = new Date()
    const expected = `${String(today.getFullYear())}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

    expect(store.get('selectedDate')).toBe(expected)
  })

  test('should start on this month', () => {
    const today = new Date()

    expect(store.get('month')).toEqual({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    })
  })

  test('should start with nothing stored', () => {
    expect(store.get('tagConfig').tags).toEqual([])
    expect(store.get('dayLog').days).toEqual({})
  })
})

describe('get', () => {
  test('should track the key it reads', () => {
    createRoot(() => {
      const menu = createMemo(() => store.get('openMenu'))

      store.set('openMenu', 'tags')

      expect(menu()).toBe('tags')
    })
  })
})

describe('set', () => {
  test('should replace the value', () => {
    store.set('selectedDate', '2026-01-01' as IsoDate)

    expect(store.get('selectedDate')).toBe('2026-01-01')
  })

  test('should leave other keys alone', () => {
    const before: StoreState['month'] = store.get('month')

    store.set('openMenu', 'day')

    expect(store.get('month')).toEqual(before)
  })
})

describe('update', () => {
  test('should derive the value from the previous one', () => {
    store.set('month', { year: 2026, month: 8 })

    store.update('month', (prev) => ({ ...prev, month: prev.month + 1 }))

    expect(store.get('month')).toEqual({ year: 2026, month: 9 })
  })
})

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
