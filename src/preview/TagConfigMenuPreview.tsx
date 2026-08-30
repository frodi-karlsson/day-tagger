import { TagConfigMenu } from '#src/tag/TagConfigMenu.js'
import type { TagConfig, TagId } from '#src/tag/tag.model.js'
import { createSignal, type JSX } from 'solid-js'

/** Holds the config state TagConfigMenu needs, so the preview page passes plain props. */
export function TagConfigMenuPreview(props: TagConfigMenuPreviewProps): JSX.Element {
  const [config, setConfig] = createSignal<TagConfig>(props.initialConfig)
  const [open, setOpen] = createSignal(true)

  function change(next: TagConfig): void {
    setConfig(next)
  }

  function close(): void {
    setOpen(false)
  }

  return (
    <TagConfigMenu
      open={open()}
      config={config()}
      initialEditing={props.initialEditing}
      onChange={change}
      onClose={close}
    />
  )
}

export interface TagConfigMenuPreviewProps {
  initialConfig: TagConfig
  initialEditing?: TagId
}
