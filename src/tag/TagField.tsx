import styles from './TagField.module.scss'
import { Button } from '#src/button/Button.js'
import type { Choice, ChoiceId, Tag } from '#src/tag/tag.model.js'
import { classNames } from '#src/string/class-names.js'
import { isAnswerDisabled, toggleAnswer, visibleOptions } from '#src/tag/tag.selection.js'
import { validateSelection, type SelectionProblem } from '#src/tag/tag.validation.js'
import { For, Show, type JSX } from 'solid-js'

/** One tag, with its options revealed underneath once the tag is applied. */
export function TagField(props: TagFieldProps): JSX.Element {
  function applied(): boolean {
    return props.answers !== undefined
  }

  function answers(): ChoiceId[] {
    return props.answers ?? []
  }

  function options(): Choice[] {
    return visibleOptions(props.tag, answers())
  }

  function toggleTag(): void {
    props.onChange(applied() ? undefined : [])
  }

  function toggleOption(choiceId: ChoiceId): void {
    props.onChange(toggleAnswer(props.tag, answers(), choiceId))
  }

  function problems(): SelectionProblem[] {
    return applied() ? validateSelection(props.tag, answers()) : []
  }

  return (
    <div class={styles.field}>
      <Button variant={applied() ? 'primary' : 'secondary'} onClick={toggleTag}>
        {props.tag.label}
      </Button>

      <Show when={applied() && options().length > 0}>
        <div class={styles.options}>
          <For each={options()}>
            {(option) => (
              <Button
                size="sm"
                class={classNames(!option.active && styles.stale)}
                variant={answers().includes(option.id) ? 'primary' : 'secondary'}
                disabled={isAnswerDisabled(props.tag, answers(), option.id)}
                onClick={() => {
                  toggleOption(option.id)
                }}
              >
                {option.label}
              </Button>
            )}
          </For>
        </div>
      </Show>

      <Show when={problems().length > 0}>
        <ul class={styles.problems}>
          <For each={problems()}>{(problem) => <li>{describe(props.tag, problem)}</li>}</For>
        </ul>
      </Show>
    </div>
  )
}

function describe(tag: Tag, problem: SelectionProblem): string {
  switch (problem) {
    case 'too-few-answers':
      return `Pick at least ${String(tag.choices?.minAnswers ?? 0)}.`
    case 'too-many-answers':
      return `Pick at most ${String(tag.choices?.maxAnswers ?? 0)}.`
    case 'unexpected-answers':
      return 'This tag takes no answers.'
    case 'duplicate-answers':
      return 'Each answer can only be picked once.'
    case 'unknown-answer':
    case 'inactive-answer':
      return 'An answer is no longer available.'
  }
}

export interface TagFieldProps {
  tag: Tag
  /** Undefined means the tag is not applied. An empty array means applied with no answers. */
  answers: ChoiceId[] | undefined
  onChange: (answers: ChoiceId[] | undefined) => void
}
