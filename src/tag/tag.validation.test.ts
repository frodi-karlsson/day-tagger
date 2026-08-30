import type { Choice, ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { validateSelection, validateTag } from '#src/tag/tag.validation.js'
import { describe, expect, test } from 'vitest'

const wine = choice('wine')
const liquor = choice('liquor')

describe('validateSelection', () => {
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
})

describe('validateTag', () => {
  test('should accept a plain tag', () => {
    expect(validateTag(plainTag())).toEqual([])
  })

  test('should accept a tag with choices', () => {
    expect(validateTag(choiceTag(1, 2))).toEqual([])
  })

  test('should reject a blank id', () => {
    const tag = { ...plainTag(), id: tagId('  ') }

    expect(validateTag(tag)).toEqual([{ code: 'empty-id' }])
  })

  test('should reject a blank label', () => {
    const tag = { ...plainTag(), label: '   ' }

    expect(validateTag(tag)).toEqual([{ code: 'empty-label' }])
  })

  test('should reject a hue off the wheel', () => {
    const tag = { ...plainTag(), hue: 400 }

    expect(validateTag(tag)).toEqual([{ code: 'invalid-hue' }])
  })

  test('should reject choices with no options', () => {
    const tag = choiceTag(0, 1, [])

    expect(validateTag(tag)).toContainEqual({ code: 'no-options' })
  })

  test('should name the option that is duplicated', () => {
    const tag = choiceTag(0, 2, [wine, wine])

    expect(validateTag(tag)).toEqual([{ code: 'duplicate-option-id', optionId: wine.id }])
  })

  test('should name the option with a blank label', () => {
    const blank = { ...choice('cider'), label: ' ' }
    const tag = choiceTag(0, 2, [wine, blank])

    expect(validateTag(tag)).toEqual([{ code: 'empty-option-label', optionId: blank.id }])
  })

  test('should reject a negative minimum', () => {
    const tag = choiceTag(-1, 2)

    expect(validateTag(tag)).toEqual([{ code: 'negative-min-answers' }])
  })

  test('should reject a maximum below one', () => {
    const tag = choiceTag(0, 0)

    expect(validateTag(tag)).toEqual([{ code: 'zero-max-answers' }])
  })

  test('should reject a maximum below the minimum', () => {
    const tag = choiceTag(2, 1)

    expect(validateTag(tag)).toEqual([{ code: 'max-below-min' }])
  })

  test('should reject a minimum no active option can satisfy', () => {
    const retired = { ...choice('cider'), active: false }
    const tag = choiceTag(2, 3, [wine, retired])

    expect(validateTag(tag)).toEqual([{ code: 'unreachable-min-answers' }])
  })

  test('should allow a maximum above the option count', () => {
    const tag = choiceTag(0, 9)

    expect(validateTag(tag)).toEqual([])
  })
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
  return { id: tagId('alcohol'), label: 'Alcohol', hue: 40, active: true }
}

function choiceTag(minAnswers: number, maxAnswers: number, options = [wine, liquor]): Tag {
  return { ...plainTag(), choices: { options, minAnswers, maxAnswers } }
}
