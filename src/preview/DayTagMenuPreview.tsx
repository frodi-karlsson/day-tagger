import type { IsoDate } from '#src/date/iso-date.js'
import { DayTagMenu } from '#src/day/DayTagMenu.js'
import type { DayEntry } from '#src/day/day.model.js'
import type { Tag } from '#src/tag/tag.model.js'
import { createSignal, type JSX } from 'solid-js'

/** Holds the state DayTagMenu needs, so the preview page passes plain serialisable props. */
export function DayTagMenuPreview(props: DayTagMenuPreviewProps): JSX.Element {
  const [entry, setEntry] = createSignal<DayEntry>(props.initialEntry)
  const [open, setOpen] = createSignal(true)

  function save(next: DayEntry): void {
    setEntry(() => next)
    setOpen(false)
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
      onSave={save}
      onClose={close}
    />
  )
}

export interface DayTagMenuPreviewProps {
  date: IsoDate
  tags: Tag[]
  initialEntry: DayEntry
}
