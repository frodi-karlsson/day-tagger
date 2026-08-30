import { ErrorService } from '#src/error/error.service.js'
import type { Logger } from '#src/logging/logger.js'
import { StorageService } from '#src/storage/storage.service.js'
import { emptyTagConfig, TagConfigService } from '#src/tag/tag-config.service.js'
import type { Tag, TagConfig, TagId } from '#src/tag/tag.model.js'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const storageKey = 'day-tagger.tag-config'

let logger: Logger
let service: TagConfigService

beforeEach(() => {
  localStorage.clear()
  logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  service = new TagConfigService(new StorageService(localStorage), new ErrorService(logger))
})

describe('load', () => {
  test('should report empty when nothing is stored', () => {
    expect(service.load()).toEqual({ status: 'empty' })
  })

  test('should return what was saved', () => {
    service.save(config([tag()]))

    expect(service.load()).toEqual({ status: 'ok', value: config([tag()]) })
  })

  test('should report unreadable rather than discard a broken shape', () => {
    localStorage.setItem(storageKey, '{"schemaVersion":1,"tags":"nope"}')

    expect(service.load()).toMatchObject({ status: 'unreadable' })
  })

  test('should hand back the raw text it could not read', () => {
    localStorage.setItem(storageKey, '{"schemaVersion":1,"tags":"nope"}')

    const result = service.load()

    expect(result.status === 'unreadable' && result.raw).toBe('{"schemaVersion":1,"tags":"nope"}')
  })

  test('should leave the stored text in place', () => {
    localStorage.setItem(storageKey, '{"schemaVersion":1,"tags":"nope"}')

    service.load()

    expect(localStorage.getItem(storageKey)).toBe('{"schemaVersion":1,"tags":"nope"}')
  })

  test('should report unreadable for json it cannot parse', () => {
    localStorage.setItem(storageKey, '{')

    expect(service.load()).toMatchObject({ status: 'unreadable', reason: 'it is not valid JSON' })
  })

  test('should report unreadable for another version', () => {
    localStorage.setItem(storageKey, '{"schemaVersion":99,"tags":[]}')

    expect(service.load()).toMatchObject({ status: 'unreadable', reason: 'it is version 99' })
  })

  test('should report what it could not read', () => {
    localStorage.setItem(storageKey, '{')

    service.load()

    expect(logger.error).toHaveBeenCalledWith(
      'Stored tag configuration was left alone because it is not valid JSON.',
    )
  })
})

describe('save', () => {
  test('should stamp the current schema version', () => {
    service.save({ schemaVersion: 99, tags: [] })

    expect(service.load()).toEqual({ status: 'ok', value: emptyTagConfig() })
  })

  test('should replace what was there before', () => {
    service.save(config([tag()]))

    service.save(config([]))

    expect(service.load()).toEqual({ status: 'ok', value: emptyTagConfig() })
  })
})

function tag(): Tag {
  return { id: 'alcohol' as TagId, label: 'Alcohol', hue: 40, active: true }
}

function config(tags: Tag[]): TagConfig {
  return { schemaVersion: 1, tags }
}
