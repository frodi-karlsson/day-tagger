import { loadPersistedState } from '#src/app/load-state.js'
import { DayLogService } from '#src/day/day-log.service.js'
import { registerDI, resetDI } from '#src/di/di.js'
import { ErrorService } from '#src/error/error.service.js'
import type { Logger } from '#src/logging/logger.js'
import { StorageService } from '#src/storage/storage.service.js'
import { defaultState, Store } from '#src/store/store.js'
import { TagConfigService } from '#src/tag/tag-config.service.js'
import type { TagId } from '#src/tag/tag.model.js'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

let store: Store

beforeEach(() => {
  localStorage.clear()
  store = new Store(defaultState())

  const logger: Logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  const storage = new StorageService(localStorage)
  const errors = new ErrorService(logger)

  registerDI(TagConfigService, () => new TagConfigService(storage, errors))
  registerDI(DayLogService, () => new DayLogService(storage, errors))
})

afterEach(() => {
  resetDI()
})

test('should report nothing when there is nothing stored', () => {
  expect(loadPersistedState(store)).toBeUndefined()
})

test('should leave the store alone when there is nothing stored', () => {
  loadPersistedState(store)

  expect(store.get('tagConfig').tags).toEqual([])
})

test('should fill the store from what was saved', () => {
  const tag = { id: 'walked' as TagId, label: 'Walked', hue: 40, active: true }
  localStorage.setItem('day-tagger.tag-config', JSON.stringify({ schemaVersion: 1, tags: [tag] }))

  loadPersistedState(store)

  expect(store.get('tagConfig').tags).toEqual([tag])
})

test('should report unreadable tag configuration', () => {
  localStorage.setItem('day-tagger.tag-config', '{')

  expect(loadPersistedState(store)).toMatchObject({ what: 'tag configuration' })
})

test('should report an unreadable day log', () => {
  localStorage.setItem('day-tagger.day-log', '{')

  expect(loadPersistedState(store)).toMatchObject({ what: 'day log' })
})

test('should not fill the store when something is unreadable', () => {
  localStorage.setItem('day-tagger.tag-config', '{')

  loadPersistedState(store)

  expect(store.get('tagConfig').tags).toEqual([])
})

test('should hand back the raw text', () => {
  localStorage.setItem('day-tagger.day-log', 'nonsense')

  expect(loadPersistedState(store)).toMatchObject({ raw: 'nonsense' })
})
