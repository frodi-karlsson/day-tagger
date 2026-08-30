import type { DayEntry } from '#src/day/day.model.js'
import type { ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'

export function matches(aspect: Aspect, entry: DayEntry): boolean {
  const answers = entry.answers[aspect.tagId]

  if (answers === undefined) {
    return false
  }

  return aspect.kind === 'tag' || answers.includes(aspect.choiceId)
}

/** Every question worth asking of the current tags: each tag, and each of its options. */
export function allAspects(tags: Tag[]): Aspect[] {
  return tags
    .filter((tag) => tag.active)
    .flatMap((tag) => [
      { kind: 'tag', tagId: tag.id } as const,
      ...(tag.choices?.options ?? [])
        .filter((option) => option.active)
        .map((option) => ({ kind: 'option', tagId: tag.id, choiceId: option.id }) as const),
    ])
}

export function describeAspect(aspect: Aspect, tags: Tag[]): string {
  const tag = tags.find((candidate) => candidate.id === aspect.tagId)

  if (tag === undefined) {
    return aspect.tagId
  }

  if (aspect.kind === 'tag') {
    return tag.label
  }

  const option = tag.choices?.options.find((candidate) => candidate.id === aspect.choiceId)

  return `${tag.label}: ${option?.label ?? aspect.choiceId}`
}

/** A stable string for an aspect, so it can round trip through a select element. */
export function aspectKey(aspect: Aspect): string {
  return aspect.kind === 'tag' ? `tag:${aspect.tagId}` : `option:${aspect.tagId}:${aspect.choiceId}`
}

export function sameAspect(left: Aspect, right: Aspect): boolean {
  if (left.tagId !== right.tagId || left.kind !== right.kind) {
    return false
  }

  return left.kind === 'tag' || left.choiceId === (right as { choiceId: ChoiceId }).choiceId
}

/**
 * A yes or no question you can ask of a day. "Did I drink" and "did I drink wine" are the same
 * kind of thing at different grain, so both are modelled once rather than one being a special
 * case of the other.
 */
export type Aspect =
  { kind: 'tag'; tagId: TagId } | { kind: 'option'; tagId: TagId; choiceId: ChoiceId }
