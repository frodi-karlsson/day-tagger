import type { IsoDate } from '#src/date/iso-date.js'
import { DayLogService, emptyDayLog } from '#src/day/day-log.service.js'
import { writeAnswers } from '#src/day/day-log.js'
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
  test('should report empty when nothing is stored', () => {
    expect(service.load()).toEqual({ status: 'empty' })
  })

  test('should return what was saved', () => {
    const log = writeAnswers(emptyDayLog(), today, alcohol, [wine])

    service.save(log)

    expect(service.load()).toEqual({ status: 'ok', value: log })
  })

  test('should report unreadable rather than discard a broken shape', () => {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 1, days: [] }))

    expect(service.load()).toMatchObject({ status: 'unreadable' })
  })

  test('should leave the stored text in place', () => {
    const stored = JSON.stringify({ schemaVersion: 1, days: [] })
    localStorage.setItem(storageKey, stored)

    service.load()

    expect(localStorage.getItem(storageKey)).toBe(stored)
  })

  test('should report unreadable for another version', () => {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 99, days: {} }))

    expect(service.load()).toMatchObject({ status: 'unreadable' })
  })
})
