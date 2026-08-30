import type { IsoDate } from '#src/date/iso-date.js'
import { setAnswers } from '#src/day/day-answers.js'
import type { DayEntry, DayLog } from '#src/day/day.model.js'
import type { ChoiceId, TagId } from '#src/tag/tag.model.js'

/** Reading and writing days in a log. Pure, so it is safe to call while rendering. */
export function readDay(log: DayLog, date: IsoDate): DayEntry {
  return log.days[date] ?? { date, answers: {} }
}

/** Stores a day, dropping it entirely when nothing is tagged, so empty days leave no trace. */
export function writeDay(log: DayLog, entry: DayEntry): DayLog {
  if (Object.keys(entry.answers).length === 0) {
    const remaining = Object.entries(log.days).filter(([date]) => date !== entry.date)

    return { ...log, days: Object.fromEntries(remaining) }
  }

  return { ...log, days: { ...log.days, [entry.date]: entry } }
}

/** Returns a new log with the tag's answers set. An undefined value removes the tag. */
export function writeAnswers(
  log: DayLog,
  date: IsoDate,
  tagId: TagId,
  answers: ChoiceId[] | undefined,
): DayLog {
  return writeDay(log, setAnswers(readDay(log, date), tagId, answers))
}
