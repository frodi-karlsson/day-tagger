import styles from './TagConfigMenu.module.scss'
import { Button } from '#src/button/Button.js'
import { Dialog } from '#src/dialog/Dialog.js'
import { TagEditor } from '#src/tag/TagEditor.js'
import { addTag, updateTag } from '#src/tag/tag.edit.js'
import type { Tag, TagConfig, TagId } from '#src/tag/tag.model.js'
import { createSignal, For, Show, type JSX } from 'solid-js'

/**
 * Tags as a list, with one tag's settings behind an edit step. Keeping the detail out of the
 * list is what stops the overlay becoming unreadable once there are more than a few tags.
 */
export function TagConfigMenu(props: TagConfigMenuProps): JSX.Element {
  const [editing, setEditing] = createSignal<TagId | 'new' | undefined>(props.initialEditing)
  const [newLabel, setNewLabel] = createSignal('')

  function edited(): Tag | undefined {
    return props.config.tags.find((tag) => tag.id === editing())
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

    const next = addTag(props.config, label)

    props.onChange(next)
    setEditing(next.tags.at(-1)?.id)
  }

  function liveTags(): Tag[] {
    return props.config.tags.filter((tag) => tag.active)
  }

  function replace(tag: Tag): void {
    props.onChange(updateTag(props.config, tag.id, () => tag))

    if (!tag.active) {
      setEditing(undefined)
    }
  }

  function back(): void {
    setEditing(undefined)
  }

  return (
    <Dialog
      open={props.open}
      title={title()}
      onClose={props.onClose}
      onBack={editing() === undefined ? undefined : back}
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
  )
}

function swatch(hue: number): string {
  return `oklch(var(--tag-lightness) var(--tag-chroma) ${String(hue)})`
}

export interface TagConfigMenuProps {
  open: boolean
  config: TagConfig
  onChange: (config: TagConfig) => void
  onClose: () => void
  /** Opens straight into one tag's settings rather than the list. */
  initialEditing?: TagId
}
