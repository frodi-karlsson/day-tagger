import type { IsoDate } from '#src/date/iso-date.js'
import { visibleTags } from '#src/day/day-tags.js'
import type { DayEntry } from '#src/day/day.model.js'
import type { ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { expect, test } from 'vitest'

const today = '2026-08-30' as IsoDate
const alcohol = tag('alcohol', true)
const retired = tag('sleep', false)

test('should offer every active tag', () => {
  expect(visibleTags([alcohol], entry({}))).toEqual([alcohol])
})

test('should hide a retired tag the day does not use', () => {
  expect(visibleTags([alcohol, retired], entry({}))).toEqual([alcohol])
})

test('should keep a retired tag the day was already tagged with', () => {
  const applied = entry({ [retired.id]: [] })

  expect(visibleTags([alcohol, retired], applied)).toEqual([alcohol, retired])
})

test('should keep a retired tag that holds answers', () => {
  const applied = entry({ [retired.id]: ['deep' as ChoiceId] })

  expect(visibleTags([retired], applied)).toEqual([retired])
})

test('should preserve the order tags were configured in', () => {
  expect(visibleTags([retired, alcohol], entry({ [retired.id]: [] }))).toEqual([retired, alcohol])
})

test('should return nothing when there are no tags', () => {
  expect(visibleTags([], entry({}))).toEqual([])
})

function tag(id: string, active: boolean): Tag {
  return { id: id as TagId, label: id, hue: 40, active }
}

function entry(answers: Record<TagId, ChoiceId[]>): DayEntry {
  return { date: today, answers }
}
