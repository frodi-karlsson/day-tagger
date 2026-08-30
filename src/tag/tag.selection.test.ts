import type { Choice, ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { isAnswerDisabled, toggleAnswer } from '#src/tag/tag.selection.js'
import { describe, expect, test } from 'vitest'

const wine = choice('wine')
const liquor = choice('liquor')
const cider = choice('cider')

describe('toggleAnswer', () => {
  test('should add an answer that is not selected', () => {
    const tag = choiceTag(0, 3)

    expect(toggleAnswer(tag, [wine.id], liquor.id)).toEqual([wine.id, liquor.id])
  })

  test('should remove an answer that is selected', () => {
    const tag = choiceTag(0, 3)

    expect(toggleAnswer(tag, [wine.id, liquor.id], wine.id)).toEqual([liquor.id])
  })

  test('should replace the answer when only one is allowed', () => {
    const tag = choiceTag(0, 1)

    expect(toggleAnswer(tag, [wine.id], liquor.id)).toEqual([liquor.id])
  })

  test('should still clear the answer when only one is allowed', () => {
    const tag = choiceTag(0, 1)

    expect(toggleAnswer(tag, [wine.id], wine.id)).toEqual([])
  })

  test('should ignore a new answer once the maximum is reached', () => {
    const tag = choiceTag(0, 2)

    expect(toggleAnswer(tag, [wine.id, liquor.id], cider.id)).toEqual([wine.id, liquor.id])
  })

  test('should leave a tag with no choices alone', () => {
    const tag = plainTag()

    expect(toggleAnswer(tag, [], wine.id)).toEqual([])
  })

  test('should not mutate the answers it is given', () => {
    const tag = choiceTag(0, 3)
    const answers = [wine.id]

    toggleAnswer(tag, answers, liquor.id)

    expect(answers).toEqual([wine.id])
  })
})

describe('isAnswerDisabled', () => {
  test('should enable an option while there is room', () => {
    const tag = choiceTag(0, 2)

    expect(isAnswerDisabled(tag, [wine.id], liquor.id)).toBe(false)
  })

  test('should disable an unselected option once the maximum is reached', () => {
    const tag = choiceTag(0, 2)

    expect(isAnswerDisabled(tag, [wine.id, liquor.id], cider.id)).toBe(true)
  })

  test('should keep a selected option enabled so it can be cleared', () => {
    const tag = choiceTag(0, 2)

    expect(isAnswerDisabled(tag, [wine.id, liquor.id], wine.id)).toBe(false)
  })

  test('should keep options enabled when only one answer is allowed', () => {
    const tag = choiceTag(0, 1)

    expect(isAnswerDisabled(tag, [wine.id], liquor.id)).toBe(false)
  })

  test('should disable everything for a tag with no choices', () => {
    const tag = plainTag()

    expect(isAnswerDisabled(tag, [], wine.id)).toBe(true)
  })
})

function choiceId(value: string): ChoiceId {
  return value as ChoiceId
}

function choice(name: string): Choice {
  return { id: choiceId(name), label: name, active: true }
}

function plainTag(): Tag {
  return { id: 'alcohol' as TagId, label: 'Alcohol', hue: 40, active: true }
}

function choiceTag(minAnswers: number, maxAnswers: number): Tag {
  return {
    ...plainTag(),
    choices: { options: [wine, liquor, cider], minAnswers, maxAnswers },
  }
}
