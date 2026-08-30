/** The persisted root for tag configuration. */
export interface TagConfig {
  schemaVersion: number
  tags: Tag[]
}

export interface Tag {
  id: TagId
  label: string
  /** Switched off rather than deleted, so days already tagged with it still resolve. */
  active: boolean
  /** Absent means a plain on or off tag with nothing to answer. */
  choices?: ChoiceSet
}

export interface ChoiceSet {
  options: Choice[]
  minAnswers: number
  maxAnswers: number
}

export interface Choice {
  id: ChoiceId
  label: string
  /** Same soft delete rule as Tag. */
  active: boolean
}

export type TagId = string & { readonly __brand: 'TagId' }

export type ChoiceId = string & { readonly __brand: 'ChoiceId' }
