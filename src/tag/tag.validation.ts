import { isHue } from '#src/tag/tag.color.js'
import type { ChoiceId, Tag, TagConfig, TagId } from '#src/tag/tag.model.js'

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

/**
 * Checks one tag definition. Run this against the candidate tag before saving an edit, which
 * is what keeps an unsatisfiable tag from ever being stored.
 */
export function validateTag(tag: Tag): TagProblem[] {
  const problems: TagProblem[] = []

  if (tag.id.trim() === '') {
    problems.push({ code: 'empty-id' })
  }

  if (tag.label.trim() === '') {
    problems.push({ code: 'empty-label' })
  }

  if (!isHue(tag.hue)) {
    problems.push({ code: 'invalid-hue' })
  }

  if (tag.choices === undefined) {
    return problems
  }

  const { options, minAnswers, maxAnswers } = tag.choices

  if (options.length === 0) {
    problems.push({ code: 'no-options' })
  }

  const seen = new Set<ChoiceId>()

  for (const option of options) {
    if (seen.has(option.id)) {
      problems.push({ code: 'duplicate-option-id', optionId: option.id })
    }

    seen.add(option.id)

    if (option.label.trim() === '') {
      problems.push({ code: 'empty-option-label', optionId: option.id })
    }
  }

  if (minAnswers < 0) {
    problems.push({ code: 'negative-min-answers' })
  }

  if (maxAnswers < 1) {
    problems.push({ code: 'zero-max-answers' })
  }

  if (maxAnswers < minAnswers) {
    problems.push({ code: 'max-below-min' })
  }

  if (minAnswers > options.filter((option) => option.active).length) {
    problems.push({ code: 'unreachable-min-answers' })
  }

  return problems
}

/** Checks rules that only exist across tags. Per tag rules live in validateTag. */
export function validateTagConfig(config: TagConfig): TagConfigProblem[] {
  const problems: TagConfigProblem[] = []
  const seen = new Set<TagId>()

  for (const tag of config.tags) {
    if (seen.has(tag.id)) {
      problems.push({ code: 'duplicate-tag-id', tagId: tag.id })
    }

    seen.add(tag.id)
  }

  return problems
}

export interface TagProblem {
  code: TagProblemCode
  optionId?: ChoiceId
}

export interface TagConfigProblem {
  code: 'duplicate-tag-id'
  tagId: TagId
}

export type SelectionProblem =
  | 'unexpected-answers'
  | 'duplicate-answers'
  | 'unknown-answer'
  | 'inactive-answer'
  | 'too-few-answers'
  | 'too-many-answers'

export type TagProblemCode =
  | 'empty-id'
  | 'empty-label'
  | 'invalid-hue'
  | 'no-options'
  | 'duplicate-option-id'
  | 'empty-option-label'
  | 'negative-min-answers'
  | 'zero-max-answers'
  | 'max-below-min'
  | 'unreachable-min-answers'
