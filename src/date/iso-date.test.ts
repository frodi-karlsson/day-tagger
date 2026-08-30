import {
  addDays,
  daysBetween,
  fromIsoDate,
  isIsoDate,
  parseIsoDate,
  toIsoDate,
} from '#src/date/iso-date.js'
import { describe, expect, test } from 'vitest'

describe('toIsoDate', () => {
  test('should format a date as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 7, 30))).toBe('2026-08-30')
  })

  test('should pad single digit months and days', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  test('should use the local day rather than the utc one', () => {
    const lateEvening = new Date(2026, 7, 30, 23, 30)

    expect(toIsoDate(lateEvening)).toBe('2026-08-30')
  })
})

describe('isIsoDate', () => {
  test('should accept a real calendar date', () => {
    expect(isIsoDate('2026-08-30')).toBe(true)
  })

  test('should reject a day that does not exist', () => {
    expect(isIsoDate('2026-02-30')).toBe(false)
  })

  test('should reject a month that does not exist', () => {
    expect(isIsoDate('2026-13-01')).toBe(false)
  })

  test('should reject another format', () => {
    expect(isIsoDate('30/08/2026')).toBe(false)
  })

  test('should reject a date carrying a time', () => {
    expect(isIsoDate('2026-08-30T12:00:00')).toBe(false)
  })

  test('should accept a leap day in a leap year', () => {
    expect(isIsoDate('2024-02-29')).toBe(true)
  })

  test('should reject a leap day outside a leap year', () => {
    expect(isIsoDate('2026-02-29')).toBe(false)
  })
})

describe('fromIsoDate', () => {
  test('should return local midnight', () => {
    const date = fromIsoDate(parseIsoDate('2026-08-30'))

    expect([date.getHours(), date.getMinutes()]).toEqual([0, 0])
  })

  test('should keep the calendar day', () => {
    const date = fromIsoDate(parseIsoDate('2026-08-30'))

    expect([date.getFullYear(), date.getMonth() + 1, date.getDate()]).toEqual([2026, 8, 30])
  })

  test('should round trip through toIsoDate', () => {
    expect(toIsoDate(fromIsoDate(parseIsoDate('2026-01-05')))).toBe('2026-01-05')
  })
})

describe('parseIsoDate', () => {
  test('should return the value when it is a calendar date', () => {
    expect(parseIsoDate('2026-08-30')).toBe('2026-08-30')
  })

  test('should throw when it is not', () => {
    expect(() => parseIsoDate('nope')).toThrow('not a calendar date')
  })
})

describe('addDays', () => {
  test('should move forward within a month', () => {
    expect(addDays(parseIsoDate('2026-08-30'), 1)).toBe('2026-08-31')
  })

  test('should roll into the next month', () => {
    expect(addDays(parseIsoDate('2026-08-31'), 1)).toBe('2026-09-01')
  })

  test('should roll into the next year', () => {
    expect(addDays(parseIsoDate('2026-12-31'), 1)).toBe('2027-01-01')
  })

  test('should move backward', () => {
    expect(addDays(parseIsoDate('2026-09-01'), -1)).toBe('2026-08-31')
  })

  test('should cross a leap day', () => {
    expect(addDays(parseIsoDate('2024-02-28'), 1)).toBe('2024-02-29')
  })

  test('should skip the leap day outside a leap year', () => {
    expect(addDays(parseIsoDate('2026-02-28'), 1)).toBe('2026-03-01')
  })

  test('should stay put for zero', () => {
    expect(addDays(parseIsoDate('2026-08-30'), 0)).toBe('2026-08-30')
  })
})

describe('daysBetween', () => {
  test('should count a single day', () => {
    expect(daysBetween(parseIsoDate('2026-08-30'), parseIsoDate('2026-08-31'))).toBe(1)
  })

  test('should return zero for the same day', () => {
    expect(daysBetween(parseIsoDate('2026-08-30'), parseIsoDate('2026-08-30'))).toBe(0)
  })

  test('should go negative when the second is earlier', () => {
    expect(daysBetween(parseIsoDate('2026-08-31'), parseIsoDate('2026-08-30'))).toBe(-1)
  })

  test('should count across a month boundary', () => {
    expect(daysBetween(parseIsoDate('2026-08-30'), parseIsoDate('2026-09-02'))).toBe(3)
  })

  test('should survive a daylight saving change', () => {
    expect(daysBetween(parseIsoDate('2026-03-28'), parseIsoDate('2026-03-30'))).toBe(2)
  })
})
