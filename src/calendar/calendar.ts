import { toIsoDate, type IsoDate } from '#src/date/iso-date.js'
import { assert } from '#src/error/assert.js'

const daysPerWeek = 7

/**
 * Lays out a month as whole weeks. The grid is only as tall as it needs to be, so a month
 * that fits in four or five weeks does not carry an empty trailing row.
 */
export function buildMonth(month: MonthRef, weekStartsOn: WeekStart = 1): CalendarMonth {
  assert(month.month >= 1 && month.month <= 12, `Month ${String(month.month)} is out of range.`)

  const firstOfMonth = new Date(month.year, month.month - 1, 1)
  const lead = (firstOfMonth.getDay() - weekStartsOn + daysPerWeek) % daysPerWeek
  const dayCount = daysInMonth(month)
  const cellCount = Math.ceil((lead + dayCount) / daysPerWeek) * daysPerWeek

  const days: CalendarDay[] = []

  for (let offset = 0; offset < cellCount; offset += 1) {
    const date = new Date(month.year, month.month - 1, 1 - lead + offset)

    days.push({
      date: toIsoDate(date),
      dayOfMonth: date.getDate(),
      inMonth: date.getMonth() === month.month - 1 && date.getFullYear() === month.year,
    })
  }

  return { ...month, weeks: toWeeks(days) }
}

/** Moves by whole months, rolling the year over as needed. */
export function shiftMonth(month: MonthRef, delta: number): MonthRef {
  const shifted = new Date(month.year, month.month - 1 + delta, 1)

  return { year: shifted.getFullYear(), month: shifted.getMonth() + 1 }
}

export function daysInMonth(month: MonthRef): number {
  return new Date(month.year, month.month, 0).getDate()
}

function toWeeks(days: CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = []

  for (let start = 0; start < days.length; start += daysPerWeek) {
    weeks.push(days.slice(start, start + daysPerWeek))
  }

  return weeks
}

export interface MonthRef {
  year: number
  /** 1 through 12, so it reads the same way it is written. */
  month: number
}

export interface CalendarMonth extends MonthRef {
  weeks: CalendarDay[][]
}

export interface CalendarDay {
  date: IsoDate
  dayOfMonth: number
  /** False for the neighbouring month's days that pad the first and last week. */
  inMonth: boolean
}

/** 0 is Sunday, 1 is Monday. */
export type WeekStart = 0 | 1
