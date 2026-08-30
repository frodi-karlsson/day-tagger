import { isChoice, isChoiceSet, isTag, isTagConfig } from '#src/tag/tag.guard.js'
import { describe, expect, test } from 'vitest'

const choice = { id: 'wine', label: 'Wine', active: true }
const plainTag = { id: 'alcohol', label: 'Alcohol', hue: 40, active: true }
const choiceTag = { ...plainTag, choices: { options: [choice], minAnswers: 0, maxAnswers: 1 } }

describe('isTagConfig', () => {
  test('should accept an empty config', () => {
    expect(isTagConfig({ schemaVersion: 1, tags: [] })).toBe(true)
  })

  test('should accept a config holding tags', () => {
    expect(isTagConfig({ schemaVersion: 1, tags: [plainTag, choiceTag] })).toBe(true)
  })

  test('should reject a missing version', () => {
    expect(isTagConfig({ tags: [] })).toBe(false)
  })

  test('should reject tags that are not an array', () => {
    expect(isTagConfig({ schemaVersion: 1, tags: {} })).toBe(false)
  })

  test('should reject a config holding a broken tag', () => {
    expect(isTagConfig({ schemaVersion: 1, tags: [{ id: 'x' }] })).toBe(false)
  })
})

describe('isTag', () => {
  test('should accept a tag with no choices', () => {
    expect(isTag(plainTag)).toBe(true)
  })

  test('should accept a tag with choices', () => {
    expect(isTag(choiceTag)).toBe(true)
  })

  test('should reject a missing hue', () => {
    const { hue, ...withoutHue } = plainTag

    expect(hue).toBe(40)
    expect(isTag(withoutHue)).toBe(false)
  })

  test('should reject a hue that is a string', () => {
    expect(isTag({ ...plainTag, hue: '40' })).toBe(false)
  })

  test('should reject broken choices', () => {
    expect(isTag({ ...plainTag, choices: { options: [] } })).toBe(false)
  })

  test('should reject a primitive', () => {
    expect(isTag('alcohol')).toBe(false)
  })
})

describe('isChoiceSet', () => {
  test('should accept a set with options', () => {
    expect(isChoiceSet({ options: [choice], minAnswers: 0, maxAnswers: 1 })).toBe(true)
  })

  test('should accept a set with no options', () => {
    expect(isChoiceSet({ options: [], minAnswers: 0, maxAnswers: 1 })).toBe(true)
  })

  test('should reject missing bounds', () => {
    expect(isChoiceSet({ options: [] })).toBe(false)
  })

  test('should reject a broken option', () => {
    expect(isChoiceSet({ options: [{ id: 'wine' }], minAnswers: 0, maxAnswers: 1 })).toBe(false)
  })
})

describe('isChoice', () => {
  test('should accept a choice', () => {
    expect(isChoice(choice)).toBe(true)
  })

  test('should reject a missing active flag', () => {
    expect(isChoice({ id: 'wine', label: 'Wine' })).toBe(false)
  })
})
