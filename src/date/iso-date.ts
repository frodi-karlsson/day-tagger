import { assert } from '#src/error/assert.js'

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

/** Formats a Date as a local calendar date. Time and timezone are dropped. */
export function toIsoDate(date: Date): IsoDate {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}` as IsoDate
}

/** Narrows a string that is a real calendar date. Rejects things like 2026-02-30. */
export function isIsoDate(value: string): value is IsoDate {
  if (!isoDatePattern.test(value)) {
    return false
  }

  const parsed = new Date(`${value}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  return toIsoDate(parsed) === value
}

/** Reads a calendar date back as a Date at local midnight, not UTC. */
export function fromIsoDate(value: IsoDate): Date {
  return new Date(`${value}T00:00:00`)
}

/** Moves by whole days, rolling months and years over. */
export function addDays(value: IsoDate, days: number): IsoDate {
  const date = fromIsoDate(value)

  date.setDate(date.getDate() + days)

  return toIsoDate(date)
}

/** How many whole days separate two calendar dates. Negative when `to` is earlier. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const start = fromIsoDate(from)
  const end = fromIsoDate(to)
  const dayMs = 24 * 60 * 60 * 1000

  return Math.round((end.getTime() - start.getTime()) / dayMs)
}

export function parseIsoDate(value: string): IsoDate {
  assert(isIsoDate(value), `"${value}" is not a calendar date in YYYY-MM-DD form.`)

  return value
}

export type IsoDate = string & { readonly __brand: 'IsoDate' }
