import type { Choice, ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { validateSelection } from '#src/tag/tag.validation.js'
import { expect, test } from 'vitest'

const wine = choice('wine')
const liquor = choice('liquor')

test('should accept an empty selection for a tag with no choices', () => {
  const tag = plainTag()

  expect(validateSelection(tag, [])).toEqual([])
})

test('should reject answers for a tag with no choices', () => {
  const tag = plainTag()

  expect(validateSelection(tag, [wine.id])).toEqual(['unexpected-answers'])
})

test('should accept a selection within the answer range', () => {
  const tag = choiceTag(0, 2)

  expect(validateSelection(tag, [wine.id])).toEqual([])
})

test('should accept an empty selection when no answers are required', () => {
  const tag = choiceTag(0, 2)

  expect(validateSelection(tag, [])).toEqual([])
})

test('should reject fewer answers than the minimum', () => {
  const tag = choiceTag(1, 2)

  expect(validateSelection(tag, [])).toEqual(['too-few-answers'])
})

test('should reject more answers than the maximum', () => {
  const tag = choiceTag(0, 1)

  expect(validateSelection(tag, [wine.id, liquor.id])).toEqual(['too-many-answers'])
})

test('should reject an answer the tag does not offer', () => {
  const tag = choiceTag(0, 2)

  expect(validateSelection(tag, [choiceId('cider')])).toEqual(['unknown-answer'])
})

test('should reject an answer that is no longer active', () => {
  const retired = { ...choice('cider'), active: false }
  const tag = choiceTag(0, 2, [wine, liquor, retired])

  expect(validateSelection(tag, [retired.id])).toEqual(['inactive-answer'])
})

test('should reject the same answer twice', () => {
  const tag = choiceTag(0, 2)

  expect(validateSelection(tag, [wine.id, wine.id])).toEqual(['duplicate-answers'])
})

test('should report each problem once', () => {
  const tag = choiceTag(0, 1)
  const unknown = choiceId('cider')

  expect(validateSelection(tag, [unknown, unknown])).toEqual([
    'duplicate-answers',
    'unknown-answer',
    'too-many-answers',
  ])
})

function choiceId(value: string): ChoiceId {
  return value as ChoiceId
}

function tagId(value: string): TagId {
  return value as TagId
}

function choice(name: string): Choice {
  return { id: choiceId(name), label: name, active: true }
}

function plainTag(): Tag {
  return { id: tagId('alcohol'), label: 'Alcohol', active: true }
}

function choiceTag(minAnswers: number, maxAnswers: number, options = [wine, liquor]): Tag {
  return { ...plainTag(), choices: { options, minAnswers, maxAnswers } }
}
