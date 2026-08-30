import { isDayEntry, isDayLog } from '#src/day/day.guard.js'
import { describe, expect, test } from 'vitest'

const entry = { date: '2026-08-30', answers: { alcohol: ['wine'] } }

describe('isDayLog', () => {
  test('should accept an empty log', () => {
    expect(isDayLog({ schemaVersion: 1, days: {} })).toBe(true)
  })

  test('should accept a log holding a day', () => {
    expect(isDayLog({ schemaVersion: 1, days: { '2026-08-30': entry } })).toBe(true)
  })

  test('should reject a key that is not a calendar date', () => {
    expect(isDayLog({ schemaVersion: 1, days: { yesterday: entry } })).toBe(false)
  })

  test('should reject days that are an array', () => {
    expect(isDayLog({ schemaVersion: 1, days: [] })).toBe(false)
  })

  test('should reject a missing version', () => {
    expect(isDayLog({ days: {} })).toBe(false)
  })
})

describe('isDayEntry', () => {
  test('should accept an entry with answers', () => {
    expect(isDayEntry(entry)).toBe(true)
  })

  test('should accept an entry with no answers', () => {
    expect(isDayEntry({ date: '2026-08-30', answers: {} })).toBe(true)
  })

  test('should accept a tag applied with an empty answer list', () => {
    expect(isDayEntry({ date: '2026-08-30', answers: { walked: [] } })).toBe(true)
  })

  test('should reject a date that is not a calendar date', () => {
    expect(isDayEntry({ ...entry, date: '2026-02-30' })).toBe(false)
  })

  test('should reject answers that are not lists', () => {
    expect(isDayEntry({ date: '2026-08-30', answers: { alcohol: 'wine' } })).toBe(false)
  })

  test('should reject an answer list holding a non string', () => {
    expect(isDayEntry({ date: '2026-08-30', answers: { alcohol: [1] } })).toBe(false)
  })
})
