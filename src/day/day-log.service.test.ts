import type { IsoDate } from '#src/date/iso-date.js'
import { DayLogService, emptyDayLog } from '#src/day/day-log.service.js'
import { ErrorService } from '#src/error/error.service.js'
import type { Logger } from '#src/logging/logger.js'
import { StorageService } from '#src/storage/storage.service.js'
import type { ChoiceId, TagId } from '#src/tag/tag.model.js'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const storageKey = 'day-tagger.day-log'
const today = '2026-08-30' as IsoDate
const alcohol = 'alcohol' as TagId
const wine = 'wine' as ChoiceId

let logger: Logger
let service: DayLogService

beforeEach(() => {
  localStorage.clear()
  logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  service = new DayLogService(new StorageService(localStorage), new ErrorService(logger))
})

describe('load', () => {
  test('should return an empty log when nothing is stored', () => {
    expect(service.load()).toEqual(emptyDayLog())
  })

  test('should return what was saved', () => {
    const log = service.writeAnswers(emptyDayLog(), today, alcohol, [wine])

    service.save(log)

    expect(service.load()).toEqual(log)
  })

  test('should fall back when the stored shape is wrong', () => {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 1, days: [] }))

    expect(service.load()).toEqual(emptyDayLog())
  })

  test('should report a stored shape it cannot read', () => {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 1, days: [] }))

    service.load()

    expect(logger.error).toHaveBeenCalledWith('Stored day log did not match the expected shape.')
  })

  test('should fall back when the version is not the current one', () => {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 99, days: {} }))

    expect(service.load()).toEqual(emptyDayLog())
  })
})

describe('readDay', () => {
  test('should return an empty entry for a day never tagged', () => {
    expect(service.readDay(emptyDayLog(), today)).toEqual({ date: today, answers: {} })
  })

  test('should return the stored entry', () => {
    const log = service.writeAnswers(emptyDayLog(), today, alcohol, [wine])

    expect(service.readDay(log, today).answers).toEqual({ alcohol: [wine] })
  })
})

describe('writeAnswers', () => {
  test('should apply a tag with its answers', () => {
    const log = service.writeAnswers(emptyDayLog(), today, alcohol, [wine])

    expect(service.readDay(log, today).answers[alcohol]).toEqual([wine])
  })

  test('should apply a tag with no answers', () => {
    const log = service.writeAnswers(emptyDayLog(), today, alcohol, [])

    expect(service.readDay(log, today).answers[alcohol]).toEqual([])
  })

  test('should remove the tag when answers are undefined', () => {
    const applied = service.writeAnswers(emptyDayLog(), today, alcohol, [wine])

    const cleared = service.writeAnswers(applied, today, alcohol, undefined)

    expect(cleared.days[today]?.answers).toEqual({})
  })

  test('should leave other days alone', () => {
    const other = '2026-08-29' as IsoDate
    const first = service.writeAnswers(emptyDayLog(), other, alcohol, [wine])

    const second = service.writeAnswers(first, today, alcohol, [])

    expect(second.days[other]?.answers[alcohol]).toEqual([wine])
  })

  test('should not mutate the log it is given', () => {
    const log = emptyDayLog()

    service.writeAnswers(log, today, alcohol, [wine])

    expect(log.days).toEqual({})
  })
})
