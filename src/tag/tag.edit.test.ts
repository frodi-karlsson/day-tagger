import { addChoice, addTag, moveTag, updateChoice, updateTag } from '#src/tag/tag.edit.js'
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

  test('should restore a deleted tag with the same name', () => {
    const config = deleteTag(addTag(empty(), 'Coffee'), 'coffee')

    const next = addTag(config, 'Coffee')

    expect(next.tags).toHaveLength(1)
    expect(next.tags.at(0)?.active).toBe(true)
  })

  test('should keep a restored tag on its original id', () => {
    const config = deleteTag(addTag(empty(), 'Coffee'), 'coffee')

    const next = addTag(config, 'Coffee')

    expect(next.tags.at(0)?.id).toBe('coffee')
  })

  test('should take the label as retyped when restoring', () => {
    const config = deleteTag(addTag(empty(), 'Coffee'), 'coffee')

    const next = addTag(config, 'COFFEE')

    expect(next.tags.at(0)?.label).toBe('COFFEE')
  })

  test('should still suffix when the clash is with a live tag', () => {
    const next = addTag(addTag(empty(), 'Coffee'), 'Coffee')

    expect(next.tags.map((tag) => tag.id)).toEqual(['coffee', 'coffee-2'])
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

  test('should restore a deleted option with the same name', () => {
    const tag = deleteOption(addChoice(plainTag(), 'Wine'), 'wine')

    const next = addChoice(tag, 'Wine')

    expect(next.choices?.options).toHaveLength(1)
    expect(next.choices?.options.at(0)?.active).toBe(true)
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

function deleteTag(config: TagConfig, id: string): TagConfig {
  return updateTag(config, id as TagId, (tag) => ({ ...tag, active: false }))
}

function deleteOption(tag: Tag, id: string): Tag {
  return updateChoice(tag, id as ChoiceId, (choice) => ({ ...choice, active: false }))
}

function plainTag(): Tag {
  return { id: 'alcohol' as TagId, label: 'Alcohol', hue: 40, active: true }
}

describe('moveTag', () => {
  test('should swap a tag with the one above it', () => {
    const config = threeTags()

    expect(labelsOf(moveTag(config, 'two' as TagId, -1))).toEqual(['Two', 'One', 'Three'])
  })

  test('should swap a tag with the one below it', () => {
    const config = threeTags()

    expect(labelsOf(moveTag(config, 'two' as TagId, 1))).toEqual(['One', 'Three', 'Two'])
  })

  test('should do nothing at the top', () => {
    const config = threeTags()

    expect(labelsOf(moveTag(config, 'one' as TagId, -1))).toEqual(['One', 'Two', 'Three'])
  })

  test('should do nothing at the bottom', () => {
    const config = threeTags()

    expect(labelsOf(moveTag(config, 'three' as TagId, 1))).toEqual(['One', 'Two', 'Three'])
  })

  test('should skip over a deleted tag', () => {
    const config = updateTag(threeTags(), 'two' as TagId, (tag) => ({ ...tag, active: false }))

    expect(labelsOf(moveTag(config, 'three' as TagId, -1))).toEqual(['Three', 'Two', 'One'])
  })

  test('should do nothing when the tag is unknown', () => {
    const config = threeTags()

    expect(labelsOf(moveTag(config, 'missing' as TagId, 1))).toEqual(['One', 'Two', 'Three'])
  })

  test('should not mutate the config it is given', () => {
    const config = threeTags()

    moveTag(config, 'one' as TagId, 1)

    expect(labelsOf(config)).toEqual(['One', 'Two', 'Three'])
  })
})

function threeTags(): TagConfig {
  return addTag(addTag(addTag(empty(), 'One'), 'Two'), 'Three')
}

function labelsOf(config: TagConfig): string[] {
  return config.tags.map((tag) => tag.label)
}
