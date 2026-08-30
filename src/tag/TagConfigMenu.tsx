import styles from './TagConfigMenu.module.scss'
import { Button } from '#src/button/Button.js'
import { Dialog } from '#src/dialog/Dialog.js'
import { TagEditor } from '#src/tag/TagEditor.js'
import { addTag, updateTag } from '#src/tag/tag.edit.js'
import type { Tag, TagConfig } from '#src/tag/tag.model.js'
import { createSignal, For, Show, type JSX } from 'solid-js'

/** The overlay for building tags. Every edit emits a whole replacement config. */
export function TagConfigMenu(props: TagConfigMenuProps): JSX.Element {
  const [tagLabel, setTagLabel] = createSignal('')

  function add(): void {
    const label = tagLabel().trim()

    if (label === '') {
      return
    }

    props.onChange(addTag(props.config, label))
    setTagLabel('')
  }

  function replace(tag: Tag): void {
    props.onChange(updateTag(props.config, tag.id, () => tag))
  }

  return (
    <Dialog open={props.open} title="Tag configuration" onClose={props.onClose}>
      <Show
        when={props.config.tags.length > 0}
        fallback={<p class={styles.empty}>No tags yet. Add your first one below.</p>}
      >
        <div class={styles.list}>
          <For each={props.config.tags}>{(tag) => <TagEditor tag={tag} onChange={replace} />}</For>
        </div>
      </Show>

      <div class={styles.add}>
        <input
          class={styles.input}
          aria-label="New tag label"
          placeholder="Add a tag"
          value={tagLabel()}
          onInput={(event) => {
            setTagLabel(event.currentTarget.value)
          }}
        />

        <Button onClick={add}>Add</Button>
      </div>
    </Dialog>
  )
}

export interface TagConfigMenuProps {
  open: boolean
  config: TagConfig
  onChange: (config: TagConfig) => void
  onClose: () => void
}
