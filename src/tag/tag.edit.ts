import { nextHue } from '#src/tag/tag.color.js'
import { allocateChoiceId, allocateTagId } from '#src/tag/tag.id.js'
import type { Choice, ChoiceId, Tag, TagConfig, TagId } from '#src/tag/tag.model.js'

/** Adds a tag with an id nothing else uses and a hue far from the ones already taken. */
export function addTag(config: TagConfig, label: string): TagConfig {
  const id = allocateTagId(
    label,
    config.tags.map((tag) => tag.id),
  )

  const tag: Tag = { id, label, hue: nextHue(config.tags.length), active: true }

  return { ...config, tags: [...config.tags, tag] }
}

export function updateTag(config: TagConfig, tagId: TagId, update: (tag: Tag) => Tag): TagConfig {
  return { ...config, tags: config.tags.map((tag) => (tag.id === tagId ? update(tag) : tag)) }
}

/** Adds an option, creating the choice set when this is the tag's first one. */
export function addChoice(tag: Tag, label: string): Tag {
  const options = tag.choices?.options ?? []

  const choice: Choice = {
    id: allocateChoiceId(
      label,
      options.map((option) => option.id),
    ),
    label,
    active: true,
  }

  return {
    ...tag,
    choices: {
      minAnswers: tag.choices?.minAnswers ?? 0,
      maxAnswers: tag.choices?.maxAnswers ?? 1,
      options: [...options, choice],
    },
  }
}

export function updateChoice(
  tag: Tag,
  choiceId: ChoiceId,
  update: (choice: Choice) => Choice,
): Tag {
  if (tag.choices === undefined) {
    return tag
  }

  const options = tag.choices.options.map((option) =>
    option.id === choiceId ? update(option) : option,
  )

  return { ...tag, choices: { ...tag.choices, options } }
}
