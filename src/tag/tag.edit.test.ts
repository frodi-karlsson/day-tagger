import { addChoice, addTag, updateChoice, updateTag } from '#src/tag/tag.edit.js'
import type { ChoiceId, Tag, TagConfig, TagId } from '#src/tag/tag.model.js'
import { describe, expect, test } from 'vitest'

describe('addTag', () => {
  test('should slugify the label into an id', () => {
    const next = addTag(empty(), 'Trigger Food')

    expect(next.tags.at(0)?.id).toBe('trigger-food')
  })

  test('should keep the label as written', () => {
    const next = addTag(empty(), 'Trigger Food')

    expect(next.tags.at(0)?.label).toBe('Trigger Food')
  })

  test('should add the tag as active', () => {
    const next = addTag(empty(), 'Walked')

    expect(next.tags.at(0)?.active).toBe(true)
  })

  test('should add the tag with no choices', () => {
    const next = addTag(empty(), 'Walked')

    expect(next.tags.at(0)?.choices).toBeUndefined()
  })

  test('should avoid an id already taken', () => {
    const next = addTag(addTag(empty(), 'Coffee'), 'Coffee')

    expect(next.tags.at(1)?.id).toBe('coffee-2')
  })

  test('should give each tag a different hue', () => {
    const next = addTag(addTag(empty(), 'One'), 'Two')

    expect(next.tags.at(0)?.hue).not.toBe(next.tags.at(1)?.hue)
  })

  test('should append rather than reorder', () => {
    const next = addTag(addTag(empty(), 'One'), 'Two')

    expect(next.tags.map((tag) => tag.label)).toEqual(['One', 'Two'])
  })

  test('should not mutate the config it is given', () => {
    const config = empty()

    addTag(config, 'Walked')

    expect(config.tags).toEqual([])
  })
})

describe('updateTag', () => {
  test('should replace the matching tag', () => {
    const config = addTag(empty(), 'Walked')

    const next = updateTag(config, 'walked' as TagId, (tag) => ({ ...tag, label: 'Strolled' }))

    expect(next.tags.at(0)?.label).toBe('Strolled')
  })

  test('should leave other tags alone', () => {
    const config = addTag(addTag(empty(), 'One'), 'Two')

    const next = updateTag(config, 'one' as TagId, (tag) => ({ ...tag, active: false }))

    expect(next.tags.at(1)?.active).toBe(true)
  })

  test('should do nothing when the tag is unknown', () => {
    const config = addTag(empty(), 'Walked')

    const next = updateTag(config, 'missing' as TagId, (tag) => ({ ...tag, label: 'No' }))

    expect(next.tags).toEqual(config.tags)
  })
})

describe('addChoice', () => {
  test('should create the choice set for the first option', () => {
    const next = addChoice(plainTag(), 'Wine')

    expect(next.choices).toEqual({
      options: [{ id: 'wine', label: 'Wine', active: true }],
      minAnswers: 0,
      maxAnswers: 1,
    })
  })

  test('should append to an existing set', () => {
    const next = addChoice(addChoice(plainTag(), 'Wine'), 'Liquor')

    expect(next.choices?.options.map((option) => option.id)).toEqual(['wine', 'liquor'])
  })

  test('should keep the bounds already set', () => {
    const tag = addChoice(plainTag(), 'Wine')
    const widened: Tag = { ...tag, choices: { options: [], minAnswers: 1, maxAnswers: 3 } }

    const next = addChoice(widened, 'Liquor')

    expect(next.choices).toMatchObject({ minAnswers: 1, maxAnswers: 3 })
  })

  test('should avoid an option id already taken', () => {
    const next = addChoice(addChoice(plainTag(), 'Wine'), 'Wine')

    expect(next.choices?.options.at(1)?.id).toBe('wine-2')
  })
})

describe('updateChoice', () => {
  test('should replace the matching option', () => {
    const tag = addChoice(plainTag(), 'Wine')

    const next = updateChoice(tag, 'wine' as ChoiceId, (choice) => ({ ...choice, active: false }))

    expect(next.choices?.options.at(0)?.active).toBe(false)
  })

  test('should leave other options alone', () => {
    const tag = addChoice(addChoice(plainTag(), 'Wine'), 'Liquor')

    const next = updateChoice(tag, 'wine' as ChoiceId, (choice) => ({ ...choice, active: false }))

    expect(next.choices?.options.at(1)?.active).toBe(true)
  })

  test('should do nothing for a tag with no choices', () => {
    const tag = plainTag()

    expect(updateChoice(tag, 'wine' as ChoiceId, (choice) => choice)).toEqual(tag)
  })
})

function empty(): TagConfig {
  return { schemaVersion: 1, tags: [] }
}

function plainTag(): Tag {
  return { id: 'alcohol' as TagId, label: 'Alcohol', hue: 40, active: true }
}
