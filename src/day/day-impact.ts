import type { IsoDate } from '#src/date/iso-date.js'
import type { DayEntry, DayLog } from '#src/day/day.model.js'
import type { Tag } from '#src/tag/tag.model.js'
import { validateSelection } from '#src/tag/tag.validation.js'

/**
 * The days a config change would spoil. A day counts when it reads cleanly against the tags as
 * they stand, and afterwards either breaks its tag's rules or leans on a tag being deleted.
 * Days already broken are left out, since the change is not what broke them.
 */
export function daysAffectedBy(previous: Tag[], next: Tag[], log: DayLog): IsoDate[] {
  const deleted = newlyDeleted(previous, next)

  return Object.values(log.days)
    .filter((entry) => isDayValid(previous, entry))
    .filter((entry) => !isDayValid(next, entry) || usesAny(entry, deleted))
    .map((entry) => entry.date)
}

function newlyDeleted(previous: Tag[], next: Tag[]): Set<string> {
  const live = new Set(previous.filter((tag) => tag.active).map((tag) => tag.id))

  return new Set(next.filter((tag) => !tag.active && live.has(tag.id)).map((tag) => tag.id))
}

function usesAny(entry: DayEntry, tagIds: Set<string>): boolean {
  return Object.keys(entry.answers).some((tagId) => tagIds.has(tagId))
}

function isDayValid(tags: Tag[], entry: DayEntry): boolean {
  return Object.entries(entry.answers).every(([tagId, answers]) => {
    const tag = tags.find((candidate) => candidate.id === tagId)

    return tag !== undefined && validateSelection(tag, answers).length === 0
  })
}
