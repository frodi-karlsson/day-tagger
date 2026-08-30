import { registerDI } from '#src/di/di.js'

/** Typed wrapper around a Storage implementation. Never throws on unreadable values. */
export class StorageService {
  private readonly storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  /** The stored text, untouched. Use this when a parse failure needs to be distinguished. */
  readRaw(key: string): string | null {
    return this.storage.getItem(key)
  }

  read(key: string): unknown {
    const raw = this.storage.getItem(key)
    if (raw === null) {
      return null
    }

    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  write(key: string, value: unknown): void {
    this.storage.setItem(key, JSON.stringify(value))
  }

  remove(key: string): void {
    this.storage.removeItem(key)
  }
}

registerDI(StorageService, () => new StorageService(localStorage))
