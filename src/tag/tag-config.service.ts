import { inject, registerDI } from '#src/di/di.js'
import { ErrorService } from '#src/error/error.service.js'
import { StorageService } from '#src/storage/storage.service.js'
import { isTagConfig } from '#src/tag/tag.guard.js'
import type { TagConfig } from '#src/tag/tag.model.js'

const storageKey = 'day-tagger.tag-config'
const schemaVersion = 1

/** Loads and stores tag configuration. A read it cannot trust falls back to an empty config. */
export class TagConfigService {
  private readonly storage: StorageService
  private readonly errors: ErrorService

  constructor(storage: StorageService, errors: ErrorService) {
    this.storage = storage
    this.errors = errors
  }

  load(): TagConfig {
    const stored = this.storage.read(storageKey)

    if (stored === null) {
      return emptyTagConfig()
    }

    if (!isTagConfig(stored)) {
      return this.discard('Stored tag config did not match the expected shape.')
    }

    if (stored.schemaVersion !== schemaVersion) {
      return this.discard(`Stored tag config is version ${String(stored.schemaVersion)}.`)
    }

    return stored
  }

  save(config: TagConfig): void {
    this.storage.write(storageKey, { ...config, schemaVersion })
  }

  private discard(reason: string): TagConfig {
    void this.errors.trackErrorMessage(reason)

    return emptyTagConfig()
  }
}

export function emptyTagConfig(): TagConfig {
  return { schemaVersion, tags: [] }
}

registerDI(
  TagConfigService,
  () => new TagConfigService(inject(StorageService), inject(ErrorService)),
)
