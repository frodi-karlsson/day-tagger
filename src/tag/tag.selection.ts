import type { ChoiceId, Tag } from '#src/tag/tag.model.js'

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
