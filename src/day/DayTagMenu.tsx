import styles from './DayTagMenu.module.scss'
import { fromIsoDate, type IsoDate } from '#src/date/iso-date.js'
import { visibleTags } from '#src/day/day-tags.js'
import type { DayEntry } from '#src/day/day.model.js'
import { Dialog } from '#src/dialog/Dialog.js'
import { TagField } from '#src/tag/TagField.js'
import type { ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { For, Show, type JSX } from 'solid-js'

/** The tag menu for one day, shown as an overlay over the calendar. */
export function DayTagMenu(props: DayTagMenuProps): JSX.Element {
  function tags(): Tag[] {
    return visibleTags(props.tags, props.entry)
  }

  return (
    <Dialog open={props.open} title={formatDay(props.date)} onClose={props.onClose}>
      <Show
        when={tags().length > 0}
        fallback={<p class={styles.empty}>No tags yet. Add some in tag configuration.</p>}
      >
        <div class={styles.list}>
          <For each={tags()}>
            {(tag) => (
              <TagField
                tag={tag}
                answers={props.entry.answers[tag.id]}
                onChange={(answers) => {
                  props.onChange(tag.id, answers)
                }}
              />
            )}
          </For>
        </div>
      </Show>
    </Dialog>
  )
}

function formatDay(date: IsoDate): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(fromIsoDate(date))
}

export interface DayTagMenuProps {
  open: boolean
  date: IsoDate
  tags: Tag[]
  entry: DayEntry
  onChange: (tagId: TagId, answers: ChoiceId[] | undefined) => void
  onClose: () => void
}
