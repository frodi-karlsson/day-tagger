import type { Choice, ChoiceId, Tag } from '#src/tag/tag.model.js'

/**
 * Applies a click on one option. A single answer tag replaces its answer, a multi answer tag
 * adds until it is full. The result is always a legal selection.
 */
export function toggleAnswer(tag: Tag, answers: ChoiceId[], choiceId: ChoiceId): ChoiceId[] {
  if (tag.choices === undefined) {
    return answers
  }

  if (answers.includes(choiceId)) {
    return answers.filter((id) => id !== choiceId)
  }

  if (tag.choices.maxAnswers === 1) {
    return [choiceId]
  }

  if (answers.length >= tag.choices.maxAnswers) {
    return answers
  }

  return [...answers, choiceId]
}

/** True when clicking the option would do nothing, so the UI can grey it out. */
export function isAnswerDisabled(tag: Tag, answers: ChoiceId[], choiceId: ChoiceId): boolean {
  if (tag.choices === undefined) {
    return true
  }

  if (answers.includes(choiceId) || tag.choices.maxAnswers === 1) {
    return false
  }

  return answers.length >= tag.choices.maxAnswers
}

/**
 * The options a tag should offer. Deleted options stay visible while a day still holds them,
 * otherwise that answer could never be removed and the day would be stuck invalid.
 */
export function visibleOptions(tag: Tag, answers: ChoiceId[]): Choice[] {
  const options = tag.choices?.options ?? []

  return options.filter((option) => option.active || answers.includes(option.id))
}
