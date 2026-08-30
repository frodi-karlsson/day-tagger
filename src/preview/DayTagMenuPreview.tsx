import type { IsoDate } from '#src/date/iso-date.js'
import { DayTagMenu } from '#src/day/DayTagMenu.js'
import type { DayEntry } from '#src/day/day.model.js'
import type { ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { createSignal, type JSX } from 'solid-js'

/** Holds the state DayTagMenu needs, so the preview page passes plain serialisable props. */
export function DayTagMenuPreview(props: DayTagMenuPreviewProps): JSX.Element {
  const [entry, setEntry] = createSignal<DayEntry>(props.initialEntry)
  const [open, setOpen] = createSignal(true)

  function change(tagId: TagId, answers: ChoiceId[] | undefined): void {
    setEntry((current) => ({ ...current, answers: applyAnswers(current, tagId, answers) }))
  }

  function close(): void {
    setOpen(false)
  }

  return (
    <DayTagMenu
      open={open()}
      date={props.date}
      tags={props.tags}
      entry={entry()}
      onChange={change}
      onClose={close}
    />
  )
}

function applyAnswers(
  entry: DayEntry,
  tagId: TagId,
  answers: ChoiceId[] | undefined,
): Record<TagId, ChoiceId[]> {
  if (answers === undefined) {
    return Object.fromEntries(Object.entries(entry.answers).filter(([id]) => id !== tagId))
  }

  return { ...entry.answers, [tagId]: answers }
}

export interface DayTagMenuPreviewProps {
  date: IsoDate
  tags: Tag[]
  initialEntry: DayEntry
}
