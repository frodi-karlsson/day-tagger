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
  test('should return an empty config when nothing is stored', () => {
    expect(service.load()).toEqual(emptyTagConfig())
  })

  test('should return what was saved', () => {
    service.save(config([tag()]))

    expect(service.load()).toEqual(config([tag()]))
  })

  test('should fall back when the stored shape is wrong', () => {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 1, tags: 'nope' }))

    expect(service.load()).toEqual(emptyTagConfig())
  })

  test('should report a stored shape it cannot read', () => {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 1, tags: 'nope' }))

    service.load()

    expect(logger.error).toHaveBeenCalledWith('Stored tag config did not match the expected shape.')
  })

  test('should fall back when the version is not the current one', () => {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 99, tags: [] }))

    expect(service.load()).toEqual(emptyTagConfig())
  })

  test('should report a version it cannot read', () => {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: 99, tags: [] }))

    service.load()

    expect(logger.error).toHaveBeenCalledWith('Stored tag config is version 99.')
  })

  test('should treat unparseable json as nothing stored', () => {
    localStorage.setItem(storageKey, '{')

    expect(service.load()).toEqual(emptyTagConfig())
  })
})

describe('save', () => {
  test('should stamp the current schema version', () => {
    service.save({ schemaVersion: 99, tags: [] })

    expect(service.load()).toEqual(emptyTagConfig())
  })

  test('should replace what was there before', () => {
    service.save(config([tag()]))

    service.save(config([]))

    expect(service.load().tags).toEqual([])
  })
})

function tag(): Tag {
  return { id: 'alcohol' as TagId, label: 'Alcohol', hue: 40, active: true }
}

function config(tags: Tag[]): TagConfig {
  return { schemaVersion: 1, tags }
}
