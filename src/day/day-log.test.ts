import type { IsoDate } from '#src/date/iso-date.js'
import { emptyDayLog } from '#src/day/day-log.service.js'
import { readDay, writeAnswers, writeDay } from '#src/day/day-log.js'
import type { ChoiceId, TagId } from '#src/tag/tag.model.js'
import { describe, expect, test } from 'vitest'

const today = '2026-08-30' as IsoDate
const alcohol = 'alcohol' as TagId
const wine = 'wine' as ChoiceId

describe('readDay', () => {
  test('should return an empty entry for a day never tagged', () => {
    expect(readDay(emptyDayLog(), today)).toEqual({ date: today, answers: {} })
  })

  test('should return the stored entry', () => {
    const log = writeAnswers(emptyDayLog(), today, alcohol, [wine])

    expect(readDay(log, today).answers).toEqual({ alcohol: [wine] })
  })
})

describe('writeAnswers', () => {
  test('should apply a tag with its answers', () => {
    const log = writeAnswers(emptyDayLog(), today, alcohol, [wine])

    expect(readDay(log, today).answers[alcohol]).toEqual([wine])
  })

  test('should apply a tag with no answers', () => {
    const log = writeAnswers(emptyDayLog(), today, alcohol, [])

    expect(readDay(log, today).answers[alcohol]).toEqual([])
  })

  test('should remove the tag when answers are undefined', () => {
    const applied = writeAnswers(emptyDayLog(), today, alcohol, [wine])
    const walked = 'walked' as TagId
    const both = writeAnswers(applied, today, walked, [])

    const cleared = writeAnswers(both, today, alcohol, undefined)

    expect(cleared.days[today]?.answers).toEqual({ walked: [] })
  })

  test('should drop the day once its last tag goes', () => {
    const applied = writeAnswers(emptyDayLog(), today, alcohol, [wine])

    const cleared = writeAnswers(applied, today, alcohol, undefined)

    expect(cleared.days).toEqual({})
  })

  test('should leave other days alone', () => {
    const other = '2026-08-29' as IsoDate
    const first = writeAnswers(emptyDayLog(), other, alcohol, [wine])

    const second = writeAnswers(first, today, alcohol, [])

    expect(second.days[other]?.answers[alcohol]).toEqual([wine])
  })

  test('should not mutate the log it is given', () => {
    const log = emptyDayLog()

    writeAnswers(log, today, alcohol, [wine])

    expect(log.days).toEqual({})
  })
})

describe('writeDay', () => {
  test('should store a day that has tags', () => {
    const entry = { date: today, answers: { alcohol: [wine] } }

    expect(writeDay(emptyDayLog(), entry).days[today]).toEqual(entry)
  })

  test('should drop a day that has nothing tagged', () => {
    const applied = writeAnswers(emptyDayLog(), today, alcohol, [wine])

    const cleared = writeDay(applied, { date: today, answers: {} })

    expect(cleared.days).toEqual({})
  })

  test('should leave other days alone when dropping', () => {
    const other = '2026-08-29' as IsoDate
    const applied = writeAnswers(emptyDayLog(), other, alcohol, [wine])

    const cleared = writeDay(applied, { date: today, answers: {} })

    expect(Object.keys(cleared.days)).toEqual([other])
  })
})
