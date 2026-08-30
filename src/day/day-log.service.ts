import { inject, registerDI } from '#src/di/di.js'
import { ErrorService } from '#src/error/error.service.js'
import type { LoadResult } from '#src/storage/load-result.js'
import { StorageService } from '#src/storage/storage.service.js'
import { setAnswers } from '#src/day/day-answers.js'
import { isDayLog } from '#src/day/day.guard.js'
import type { DayEntry, DayLog } from '#src/day/day.model.js'
import type { IsoDate } from '#src/date/iso-date.js'
import type { ChoiceId, TagId } from '#src/tag/tag.model.js'

const storageKey = 'day-tagger.day-log'
const schemaVersion = 1

/**
 * Loads and stores the day log. A read it cannot make sense of is reported as unreadable and left
 * exactly where it is, so nothing is written over until the caller decides what to do.
 */
export class DayLogService {
  private readonly storage: StorageService
  private readonly errors: ErrorService

  constructor(storage: StorageService, errors: ErrorService) {
    this.storage = storage
    this.errors = errors
  }

  load(): LoadResult<DayLog> {
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

    if (!isDayLog(parsed)) {
      return this.unreadable(raw, 'it does not match the expected shape')
    }

    if (parsed.schemaVersion !== schemaVersion) {
      return this.unreadable(raw, `it is version ${String(parsed.schemaVersion)}`)
    }

    return { status: 'ok', value: parsed }
  }

  save(value: DayLog): void {
    this.storage.write(storageKey, { ...value, schemaVersion })
  }

  readDay(log: DayLog, date: IsoDate): DayEntry {
    return log.days[date] ?? { date, answers: {} }
  }

  /** Returns a new log with the tag's answers set. An undefined value removes the tag. */
  writeAnswers(log: DayLog, date: IsoDate, tagId: TagId, answers: ChoiceId[] | undefined): DayLog {
    const entry = setAnswers(this.readDay(log, date), tagId, answers)

    return { ...log, days: { ...log.days, [date]: entry } }
  }

  private unreadable(raw: string, reason: string): LoadResult<DayLog> {
    void this.errors.trackErrorMessage(`Stored the day log was left alone because ${reason}.`)

    return { status: 'unreadable', raw, reason }
  }
}

export function emptyDayLog(): DayLog {
  return { schemaVersion, days: {} }
}

registerDI(DayLogService, () => new DayLogService(inject(StorageService), inject(ErrorService)))
