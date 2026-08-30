import type { IsoDate } from '#src/date/iso-date.js'
import type { ChoiceId, TagId } from '#src/tag/tag.model.js'

/** The persisted root for tagged days. */
export interface DayLog {
  schemaVersion: number
  days: Record<IsoDate, DayEntry>
}

export interface DayEntry {
  date: IsoDate
  /** A present key means the tag applies. An empty array is valid for a tag with no choices. */
  answers: Record<TagId, ChoiceId[]>
}
