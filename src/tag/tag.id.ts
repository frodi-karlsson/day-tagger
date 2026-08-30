import { allocateId } from '#src/string/allocate-id.js'
import type { ChoiceId, TagId } from '#src/tag/tag.model.js'

export function allocateTagId(label: string, taken: Iterable<TagId>): TagId {
  return allocateId(label, taken, 'tag') as TagId
}

export function allocateChoiceId(label: string, taken: Iterable<ChoiceId>): ChoiceId {
  return allocateId(label, taken, 'option') as ChoiceId
}
