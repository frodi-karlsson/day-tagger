import { isIsoDate } from '#src/date/iso-date.js'
import type { DayEntry, DayLog } from '#src/day/day.model.js'
import { isRecord } from '#src/object/is-record.js'

/** Checks that a value read back from storage really is a day log. */
export function isDayLog(value: unknown): value is DayLog {
  if (!isRecord(value)) {
    return false
  }

  if (typeof value.schemaVersion !== 'number' || !isRecord(value.days)) {
    return false
  }

  return Object.entries(value.days).every(([date, entry]) => isIsoDate(date) && isDayEntry(entry))
}

export function isDayEntry(value: unknown): value is DayEntry {
  if (!isRecord(value)) {
    return false
  }

  if (typeof value.date !== 'string' || !isIsoDate(value.date)) {
    return false
  }

  if (!isRecord(value.answers)) {
    return false
  }

  return Object.values(value.answers).every(isAnswerList)
}

function isAnswerList(value: unknown): boolean {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}
