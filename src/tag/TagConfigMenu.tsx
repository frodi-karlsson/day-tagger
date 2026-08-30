import styles from './TagConfigMenu.module.scss'
import { Button } from '#src/button/Button.js'
import type { DayLog } from '#src/day/day.model.js'
import { daysAffectedBy } from '#src/day/day-impact.js'
import { ConfirmDialog } from '#src/dialog/ConfirmDialog.js'
import { Dialog } from '#src/dialog/Dialog.js'
import { TagEditor } from '#src/tag/TagEditor.js'
import { addTag, updateTag } from '#src/tag/tag.edit.js'
import { validateTag } from '#src/tag/tag.validation.js'
import type { IsoDate } from '#src/date/iso-date.js'
import type { Tag, TagConfig, TagId } from '#src/tag/tag.model.js'
import { createEffect, createSignal, For, on, Show, untrack, type JSX } from 'solid-js'

/**
 * Tags as a list, with one tag's settings behind an edit step. Keeping the detail out of the
 * list is what stops the overlay becoming unreadable once there are more than a few tags.
 */
export function TagConfigMenu(props: TagConfigMenuProps): JSX.Element {
  const [editing, setEditing] = createSignal<TagId | 'new' | undefined>(props.initialEditing)
  const [newLabel, setNewLabel] = createSignal('')
  const [draft, setDraft] = createSignal<TagConfig>(untrack(() => props.config))
  const [confirming, setConfirming] = createSignal(false)

  createEffect(
    on(
      () => props.open,
      () => {
        setDraft(() => props.config)
        setEditing(props.initialEditing)
      },
    ),
  )

  function edited(): Tag | undefined {
    return draft().tags.find((tag) => tag.id === editing())
  }

  function title(): string {
    if (editing() === 'new') {
      return 'New tag'
    }

    return edited()?.label ?? 'Tags'
  }

  function openNew(): void {
    setNewLabel('')
    setEditing('new')
  }

  function create(): void {
    const label = newLabel().trim()

    if (label === '') {
      return
    }

    const next = addTag(draft(), label)

    setDraft(next)
    setEditing(next.tags.find((tag) => tag.label === label)?.id)
  }

  function liveTags(): Tag[] {
    return draft().tags.filter((tag) => tag.active)
  }

  function replace(tag: Tag): void {
    setDraft((current) => updateTag(current, tag.id, () => tag))

    if (!tag.active) {
      setEditing(undefined)
    }
  }

  function isValid(): boolean {
    return draft().tags.every((tag) => validateTag(tag).length === 0)
  }

  function affected(): IsoDate[] {
    return daysAffectedBy(props.config.tags, draft().tags, props.log)
  }

  function save(): void {
    if (affected().length > 0) {
      setConfirming(true)

      return
    }

    props.onSave(draft())
  }

  function confirm(): void {
    setConfirming(false)
    props.onSave(draft())
  }

  function back(): void {
    setEditing(undefined)
  }

  return (
    <>
      <Dialog
        open={props.open}
        title={title()}
        onClose={props.onClose}
        onBack={editing() === undefined ? undefined : back}
        footer={
          <Button disabled={!isValid()} onClick={save}>
            Save
          </Button>
        }
      >
        <Show when={editing() === 'new'}>
          <div class={styles.row}>
            <input
              class={styles.input}
              aria-label="New tag label"
              placeholder="Name this tag"
              value={newLabel()}
              onInput={(event) => {
                setNewLabel(event.currentTarget.value)
              }}
            />

            <Button class={styles.action} onClick={create}>
              Create
            </Button>
          </div>
        </Show>

        <Show when={edited()}>{(tag) => <TagEditor tag={tag()} onChange={replace} />}</Show>

        <Show when={editing() === undefined}>
          <Show
            when={props.config.tags.length > 0}
            fallback={<p class={styles.empty}>No tags yet.</p>}
          >
            <ul class={styles.list}>
              <For each={liveTags()}>
                {(tag) => (
                  <li class={styles.item}>
                    <span class={styles.swatch} style={{ 'background-color': swatch(tag.hue) }} />
                    <span class={styles.name}>{tag.label}</span>

                    <Button
                      variant="secondary"
                      size="sm"
                      class={styles.action}
                      onClick={() => {
                        setEditing(tag.id)
                      }}
                    >
                      Edit
                    </Button>
                  </li>
                )}
              </For>
            </ul>
          </Show>

          <div class={styles.add}>
            <Button onClick={openNew}>Add tag</Button>
          </div>
        </Show>
      </Dialog>

      <ConfirmDialog
        open={confirming()}
        title="This changes days you already tagged"
        message={`${String(affected().length)} tagged ${affected().length === 1 ? 'day no longer matches' : 'days no longer match'} these tags.`}
        detail="Those days keep their answers, but you will have to fix them before they can be saved again."
        confirmLabel="Save anyway"
        onConfirm={confirm}
        onCancel={() => {
          setConfirming(false)
        }}
      />
    </>
  )
}

function swatch(hue: number): string {
  return `oklch(var(--tag-lightness) var(--tag-chroma) ${String(hue)})`
}

export interface TagConfigMenuProps {
  open: boolean
  config: TagConfig
  log: DayLog
  onSave: (config: TagConfig) => void
  onClose: () => void
  /** Opens straight into one tag's settings rather than the list. */
  initialEditing?: TagId
}
