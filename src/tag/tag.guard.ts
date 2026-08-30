import { isRecord } from '#src/object/is-record.js'
import type { Choice, ChoiceSet, Tag, TagConfig } from '#src/tag/tag.model.js'

/** Checks that a value read back from storage really is a tag config. */
export function isTagConfig(value: unknown): value is TagConfig {
  if (!isRecord(value)) {
    return false
  }

  if (typeof value.schemaVersion !== 'number' || !Array.isArray(value.tags)) {
    return false
  }

  return value.tags.every(isTag)
}

export function isTag(value: unknown): value is Tag {
  if (!isRecord(value)) {
    return false
  }

  const hasFields =
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    typeof value.hue === 'number' &&
    typeof value.active === 'boolean'

  if (!hasFields) {
    return false
  }

  return value.choices === undefined || isChoiceSet(value.choices)
}

export function isChoiceSet(value: unknown): value is ChoiceSet {
  if (!isRecord(value)) {
    return false
  }

  if (typeof value.minAnswers !== 'number' || typeof value.maxAnswers !== 'number') {
    return false
  }

  return Array.isArray(value.options) && value.options.every(isChoice)
}

export function isChoice(value: unknown): value is Choice {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    typeof value.active === 'boolean'
  )
}
