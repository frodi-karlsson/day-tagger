import type { IsoDate } from '#src/date/iso-date.js'
import { isDayLog } from '#src/day/day.guard.js'
import type { DayEntry, DayLog } from '#src/day/day.model.js'
import { inject, registerDI } from '#src/di/di.js'
import { ErrorService } from '#src/error/error.service.js'
import { StorageService } from '#src/storage/storage.service.js'
import type { ChoiceId, TagId } from '#src/tag/tag.model.js'

const storageKey = 'day-tagger.day-log'
const schemaVersion = 1

/** Loads and stores tagged days. A read it cannot trust falls back to an empty log. */
export class DayLogService {
  private readonly storage: StorageService
  private readonly errors: ErrorService

  constructor(storage: StorageService, errors: ErrorService) {
    this.storage = storage
    this.errors = errors
  }

  load(): DayLog {
    const stored = this.storage.read(storageKey)

    if (stored === null) {
      return emptyDayLog()
    }

    if (!isDayLog(stored)) {
      return this.discard('Stored day log did not match the expected shape.')
    }

    if (stored.schemaVersion !== schemaVersion) {
      return this.discard(`Stored day log is version ${String(stored.schemaVersion)}.`)
    }

    return stored
  }

  save(log: DayLog): void {
    this.storage.write(storageKey, { ...log, schemaVersion })
  }

  readDay(log: DayLog, date: IsoDate): DayEntry {
    return log.days[date] ?? { date, answers: {} }
  }

  /** Returns a new log with the tag's answers set. An undefined value removes the tag. */
  writeAnswers(log: DayLog, date: IsoDate, tagId: TagId, answers: ChoiceId[] | undefined): DayLog {
    const entry = this.readDay(log, date)

    if (answers === undefined) {
      const remaining = Object.entries(entry.answers).filter(([id]) => id !== tagId)

      return this.withDay(log, date, Object.fromEntries(remaining))
    }

    return this.withDay(log, date, { ...entry.answers, [tagId]: answers })
  }

  private withDay(log: DayLog, date: IsoDate, answers: Record<TagId, ChoiceId[]>): DayLog {
    return { ...log, days: { ...log.days, [date]: { date, answers } } }
  }

  private discard(reason: string): DayLog {
    void this.errors.trackErrorMessage(reason)

    return emptyDayLog()
  }
}

export function emptyDayLog(): DayLog {
  return { schemaVersion, days: {} }
}

registerDI(DayLogService, () => new DayLogService(inject(StorageService), inject(ErrorService)))
