import type { ChoiceId, Tag } from '#src/tag/tag.model.js'

/** Checks a day's answers for one tag. An empty result means the selection is legal. */
export function validateSelection(tag: Tag, selected: ChoiceId[]): SelectionProblem[] {
  const problems: SelectionProblem[] = []

  if (tag.choices === undefined) {
    if (selected.length > 0) {
      problems.push('unexpected-answers')
    }

    return problems
  }

  if (new Set(selected).size !== selected.length) {
    problems.push('duplicate-answers')
  }

  const options = new Map(tag.choices.options.map((option) => [option.id, option]))

  for (const id of selected) {
    const option = options.get(id)

    if (option === undefined) {
      problems.push('unknown-answer')
    } else if (!option.active) {
      problems.push('inactive-answer')
    }
  }

  if (selected.length < tag.choices.minAnswers) {
    problems.push('too-few-answers')
  }

  if (selected.length > tag.choices.maxAnswers) {
    problems.push('too-many-answers')
  }

  return [...new Set(problems)]
}

export type SelectionProblem =
  | 'unexpected-answers'
  | 'duplicate-answers'
  | 'unknown-answer'
  | 'inactive-answer'
  | 'too-few-answers'
  | 'too-many-answers'
