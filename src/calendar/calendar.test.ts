import { buildMonth, daysInMonth, shiftMonth } from '#src/calendar/calendar.js'
import { describe, expect, test } from 'vitest'

describe('buildMonth', () => {
  test('should lay every week out as seven days', () => {
    const month = buildMonth({ year: 2026, month: 8 })

    expect(month.weeks.every((week) => week.length === 7)).toBe(true)
  })

  test('should start the week on monday by default', () => {
    const month = buildMonth({ year: 2026, month: 8 })

    expect(month.weeks[0]?.[0]?.date).toBe('2026-07-27')
  })

  test('should start the week on sunday when asked', () => {
    const month = buildMonth({ year: 2026, month: 8 }, 0)

    expect(month.weeks[0]?.[0]?.date).toBe('2026-07-26')
  })

  test('should pad the first week with the previous month', () => {
    const month = buildMonth({ year: 2026, month: 8 })

    expect(month.weeks[0]?.[0]?.inMonth).toBe(false)
  })

  test('should hold every day of the month exactly once', () => {
    const month = buildMonth({ year: 2026, month: 8 })
    const owned = month.weeks.flat().filter((day) => day.inMonth)

    expect(owned).toHaveLength(31)
  })

  test('should run the month from the first to the last day', () => {
    const month = buildMonth({ year: 2026, month: 8 })
    const owned = month.weeks.flat().filter((day) => day.inMonth)

    expect(owned.at(0)?.date).toBe('2026-08-01')
    expect(owned.at(-1)?.date).toBe('2026-08-31')
  })

  test('should use six weeks when the month needs them', () => {
    const month = buildMonth({ year: 2026, month: 8 })

    expect(month.weeks).toHaveLength(6)
  })

  test('should use five weeks when that is enough', () => {
    const month = buildMonth({ year: 2026, month: 2 })

    expect(month.weeks).toHaveLength(5)
  })

  test('should use four weeks for a february that starts on the first day of the week', () => {
    const month = buildMonth({ year: 2027, month: 2 })

    expect(month.weeks).toHaveLength(4)
  })

  test('should add no padding when the month fills its weeks exactly', () => {
    const month = buildMonth({ year: 2027, month: 2 })

    expect(month.weeks.flat().every((day) => day.inMonth)).toBe(true)
  })

  test('should include the leap day', () => {
    const month = buildMonth({ year: 2024, month: 2 })
    const owned = month.weeks.flat().filter((day) => day.inMonth)

    expect(owned.at(-1)?.date).toBe('2024-02-29')
  })

  test('should number the days of the month', () => {
    const month = buildMonth({ year: 2026, month: 8 })
    const owned = month.weeks.flat().filter((day) => day.inMonth)

    expect(owned.at(0)?.dayOfMonth).toBe(1)
  })

  test('should carry the month it was asked for', () => {
    const month = buildMonth({ year: 2026, month: 8 })

    expect({ year: month.year, month: month.month }).toEqual({ year: 2026, month: 8 })
  })

  test('should reject a month outside the year', () => {
    expect(() => buildMonth({ year: 2026, month: 13 })).toThrow('out of range')
  })
})

describe('shiftMonth', () => {
  test('should move forward within a year', () => {
    expect(shiftMonth({ year: 2026, month: 8 }, 1)).toEqual({ year: 2026, month: 9 })
  })

  test('should move backward within a year', () => {
    expect(shiftMonth({ year: 2026, month: 8 }, -1)).toEqual({ year: 2026, month: 7 })
  })

  test('should roll over into the next year', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
  })

  test('should roll back into the previous year', () => {
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
  })

  test('should move by more than a year', () => {
    expect(shiftMonth({ year: 2026, month: 8 }, 18)).toEqual({ year: 2028, month: 2 })
  })

  test('should stay put for zero', () => {
    expect(shiftMonth({ year: 2026, month: 8 }, 0)).toEqual({ year: 2026, month: 8 })
  })
})

describe('daysInMonth', () => {
  test('should count a long month', () => {
    expect(daysInMonth({ year: 2026, month: 8 })).toBe(31)
  })

  test('should count a short month', () => {
    expect(daysInMonth({ year: 2026, month: 11 })).toBe(30)
  })

  test('should count february outside a leap year', () => {
    expect(daysInMonth({ year: 2026, month: 2 })).toBe(28)
  })

  test('should count february in a leap year', () => {
    expect(daysInMonth({ year: 2024, month: 2 })).toBe(29)
  })
})
