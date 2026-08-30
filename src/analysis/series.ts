import { addDays, daysBetween, type IsoDate } from '#src/date/iso-date.js'
import { readDay } from '#src/day/day-log.js'
import type { DayEntry, DayLog } from '#src/day/day.model.js'

/**
 * Every calendar day from the first tagged one up to today, including the ones with nothing on
 * them. A day you did not tag is a day the thing did not happen, which is what makes a
 * percentage mean anything.
 */
export function buildSeries(log: DayLog, today: IsoDate): Observation[] {
  const first = firstTaggedDay(log)

  if (first === undefined || daysBetween(first, today) < 0) {
    return []
  }

  const length = daysBetween(first, today) + 1

  return Array.from({ length }, (_, offset) => {
    const date = addDays(first, offset)

    return { date, entry: readDay(log, date) }
  })
}

function firstTaggedDay(log: DayLog): IsoDate | undefined {
  const dates = Object.keys(log.days).sort()

  return dates.at(0) as IsoDate | undefined
}

export interface Observation {
  date: IsoDate
  entry: DayEntry
}
