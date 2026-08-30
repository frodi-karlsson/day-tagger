import styles from './TagEditor.module.scss'
import { Button } from '#src/button/Button.js'
import { classNames } from '#src/string/class-names.js'
import { addChoice, updateChoice } from '#src/tag/tag.edit.js'
import type { Choice, ChoiceId, Tag } from '#src/tag/tag.model.js'
import { validateTag } from '#src/tag/tag.validation.js'
import { createSignal, For, Show, type JSX } from 'solid-js'

/** Edits one tag in place. Every change emits a whole replacement tag. */
export function TagEditor(props: TagEditorProps): JSX.Element {
  const [optionLabel, setOptionLabel] = createSignal('')

  function change(next: Tag): void {
    props.onChange(next)
  }

  function addOption(): void {
    const label = optionLabel().trim()

    if (label === '') {
      return
    }

    change(addChoice(props.tag, label))
    setOptionLabel('')
  }

  function setBound(bound: 'minAnswers' | 'maxAnswers', value: number): void {
    if (props.tag.choices === undefined) {
      return
    }

    change({ ...props.tag, choices: { ...props.tag.choices, [bound]: value } })
  }

  return (
    <section class={classNames(styles.editor, !props.tag.active && styles.retired)}>
      <div class={styles.row}>
        <span class={styles.swatch} style={{ 'background-color': swatch(props.tag.hue) }} />

        <input
          class={styles.input}
          aria-label="Tag label"
          value={props.tag.label}
          onInput={(event) => {
            change({ ...props.tag, label: event.currentTarget.value })
          }}
        />

        <Button
          variant={props.tag.active ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            change({ ...props.tag, active: !props.tag.active })
          }}
        >
          {props.tag.active ? 'Retire' : 'Restore'}
        </Button>
      </div>

      <div class={styles.row}>
        <span class={styles.label}>Colour</span>

        <input
          type="range"
          class={styles.input}
          aria-label="Tag colour"
          min="0"
          max="359"
          value={String(props.tag.hue)}
          onInput={(event) => {
            change({ ...props.tag, hue: Number(event.currentTarget.value) })
          }}
        />
      </div>

      <div class={styles.options}>
        <For each={props.tag.choices?.options ?? []}>
          {(option) => (
            <div class={styles.row}>
              <input
                class={styles.input}
                aria-label="Option label"
                value={option.label}
                onInput={(event) => {
                  change(renameOption(props.tag, option.id, event.currentTarget.value))
                }}
              />

              <Button
                variant={option.active ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => {
                  change(toggleOption(props.tag, option.id, option))
                }}
              >
                {option.active ? 'Retire' : 'Restore'}
              </Button>
            </div>
          )}
        </For>

        <div class={styles.row}>
          <input
            class={styles.input}
            aria-label="New option label"
            placeholder="Add an option"
            value={optionLabel()}
            onInput={(event) => {
              setOptionLabel(event.currentTarget.value)
            }}
          />

          <Button size="sm" onClick={addOption}>
            Add
          </Button>
        </div>

        <Show when={props.tag.choices !== undefined}>
          <div class={styles.row}>
            <span class={styles.label}>Answers</span>

            <input
              type="number"
              class={classNames(styles.input, styles.number)}
              aria-label="Minimum answers"
              value={String(props.tag.choices?.minAnswers ?? 0)}
              onInput={(event) => {
                setBound('minAnswers', Number(event.currentTarget.value))
              }}
            />

            <span class={styles.label}>to</span>

            <input
              type="number"
              class={classNames(styles.input, styles.number)}
              aria-label="Maximum answers"
              value={String(props.tag.choices?.maxAnswers ?? 1)}
              onInput={(event) => {
                setBound('maxAnswers', Number(event.currentTarget.value))
              }}
            />
          </div>
        </Show>
      </div>

      <Show when={validateTag(props.tag).length > 0}>
        <ul class={styles.problems}>
          <For each={validateTag(props.tag)}>{(problem) => <li>{problem.code}</li>}</For>
        </ul>
      </Show>
    </section>
  )
}

function renameOption(tag: Tag, choiceId: ChoiceId, label: string): Tag {
  return updateChoice(tag, choiceId, (choice) => ({ ...choice, label }))
}

function toggleOption(tag: Tag, choiceId: ChoiceId, option: Choice): Tag {
  return updateChoice(tag, choiceId, (choice) => ({ ...choice, active: !option.active }))
}

function swatch(hue: number): string {
  return `oklch(var(--tag-lightness) var(--tag-chroma) ${String(hue)})`
}

export interface TagEditorProps {
  tag: Tag
  onChange: (tag: Tag) => void
}
