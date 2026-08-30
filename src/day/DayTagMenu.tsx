import styles from './DayTagMenu.module.scss'
import { Button } from '#src/button/Button.js'
import { fromIsoDate, type IsoDate } from '#src/date/iso-date.js'
import { setAnswers } from '#src/day/day-answers.js'
import { visibleTags } from '#src/day/day-tags.js'
import type { DayEntry } from '#src/day/day.model.js'
import { Dialog } from '#src/dialog/Dialog.js'
import { TagField } from '#src/tag/TagField.js'
import type { ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { validateSelection } from '#src/tag/tag.validation.js'
import { createEffect, createSignal, For, on, Show, untrack, type JSX } from 'solid-js'

/**
 * The tag menu for one day. Edits are held as a draft and only reach the caller on save, so a
 * selection that breaks its tag's rules cannot be stored.
 */
export function DayTagMenu(props: DayTagMenuProps): JSX.Element {
  const [draft, setDraft] = createSignal<DayEntry>(untrack(() => props.entry))

  createEffect(
    on(
      () => [props.open, props.date] as const,
      () => {
        setDraft(() => props.entry)
      },
    ),
  )

  function tags(): Tag[] {
    return visibleTags(props.tags, draft())
  }

  function change(tagId: TagId, answers: ChoiceId[] | undefined): void {
    setDraft((current) => setAnswers(current, tagId, answers))
  }

  function isValid(): boolean {
    return tags().every((tag) => isTagValid(tag, draft()))
  }

  function save(): void {
    props.onSave(draft())
  }

  return (
    <Dialog
      open={props.open}
      title={formatDay(props.date)}
      onClose={props.onClose}
      footer={
        <Button disabled={!isValid()} onClick={save}>
          Save
        </Button>
      }
    >
      <Show
        when={tags().length > 0}
        fallback={<p class={styles.empty}>No tags yet. Add some in tag configuration.</p>}
      >
        <div class={styles.list}>
          <For each={tags()}>
            {(tag) => (
              <TagField
                tag={tag}
                answers={draft().answers[tag.id]}
                onChange={(answers) => {
                  change(tag.id, answers)
                }}
              />
            )}
          </For>
        </div>
      </Show>
    </Dialog>
  )
}

function isTagValid(tag: Tag, entry: DayEntry): boolean {
  const answers = entry.answers[tag.id]

  return answers === undefined || validateSelection(tag, answers).length === 0
}

function formatDay(date: IsoDate): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(fromIsoDate(date))
}

export interface DayTagMenuProps {
  open: boolean
  date: IsoDate
  tags: Tag[]
  entry: DayEntry
  onSave: (entry: DayEntry) => void
  onClose: () => void
}
