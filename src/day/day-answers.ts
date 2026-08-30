import type { DayEntry } from '#src/day/day.model.js'
import type { ChoiceId, TagId } from '#src/tag/tag.model.js'

/** Sets one tag's answers on a day. An undefined value removes the tag from the day. */
export function setAnswers(
  entry: DayEntry,
  tagId: TagId,
  answers: ChoiceId[] | undefined,
): DayEntry {
  if (answers === undefined) {
    const remaining = Object.entries(entry.answers).filter(([id]) => id !== tagId)

    return { ...entry, answers: Object.fromEntries(remaining) }
  }

  return { ...entry, answers: { ...entry.answers, [tagId]: answers } }
}
