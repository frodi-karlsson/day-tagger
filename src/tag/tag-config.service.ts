import { inject, registerDI } from '#src/di/di.js'
import { ErrorService } from '#src/error/error.service.js'
import type { LoadResult } from '#src/storage/load-result.js'
import { StorageService } from '#src/storage/storage.service.js'
import { isTagConfig } from '#src/tag/tag.guard.js'
import type { TagConfig } from '#src/tag/tag.model.js'

const storageKey = 'day-tagger.tag-config'
const schemaVersion = 1

/**
 * Loads and stores tag configuration. A read it cannot make sense of is reported as unreadable and left
 * exactly where it is, so nothing is written over until the caller decides what to do.
 */
export class TagConfigService {
  private readonly storage: StorageService
  private readonly errors: ErrorService

  constructor(storage: StorageService, errors: ErrorService) {
    this.storage = storage
    this.errors = errors
  }

  load(): LoadResult<TagConfig> {
    const raw = this.storage.readRaw(storageKey)

    if (raw === null) {
      return { status: 'empty' }
    }

    let parsed: unknown

    try {
      parsed = JSON.parse(raw)
    } catch {
      return this.unreadable(raw, 'it is not valid JSON')
    }

    if (!isTagConfig(parsed)) {
      return this.unreadable(raw, 'it does not match the expected shape')
    }

    if (parsed.schemaVersion !== schemaVersion) {
      return this.unreadable(raw, `it is version ${String(parsed.schemaVersion)}`)
    }

    return { status: 'ok', value: parsed }
  }

  save(value: TagConfig): void {
    this.storage.write(storageKey, { ...value, schemaVersion })
  }

  private unreadable(raw: string, reason: string): LoadResult<TagConfig> {
    void this.errors.trackErrorMessage(`Stored tag configuration was left alone because ${reason}.`)

    return { status: 'unreadable', raw, reason }
  }
}

export function emptyTagConfig(): TagConfig {
  return { schemaVersion, tags: [] }
}

registerDI(
  TagConfigService,
  () => new TagConfigService(inject(StorageService), inject(ErrorService)),
)
