import type { ChoiceId, Tag } from '#src/tag/tag.model.js'
import { TagField } from '#src/tag/TagField.js'
import { createSignal, type JSX } from 'solid-js'

/** Holds the state TagField needs, so the preview page can pass plain serialisable props. */
export function TagFieldPreview(props: TagFieldPreviewProps): JSX.Element {
  const [answers, setAnswers] = createSignal<ChoiceId[] | undefined>(props.initialAnswers)

  function update(next: ChoiceId[] | undefined): void {
    setAnswers(() => next)
  }

  return <TagField tag={props.tag} answers={answers()} onChange={update} />
}

export interface TagFieldPreviewProps {
  tag: Tag
  initialAnswers?: ChoiceId[]
}
