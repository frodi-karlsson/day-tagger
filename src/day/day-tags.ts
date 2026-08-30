import type { DayEntry } from '#src/day/day.model.js'
import type { Tag } from '#src/tag/tag.model.js'

/**
 * The tags a day's menu should offer. Active tags always, plus any retired tag this day was
 * already tagged with, so an answer recorded before the tag was switched off can still be
 * seen and cleared rather than sitting there unreachable.
 */
export function visibleTags(tags: Tag[], entry: DayEntry): Tag[] {
  return tags.filter((tag) => tag.active || tag.id in entry.answers)
}
