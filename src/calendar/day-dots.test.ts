import { dayDots } from '#src/calendar/day-dots.js'
import type { IsoDate } from '#src/date/iso-date.js'
import type { DayEntry } from '#src/day/day.model.js'
import type { ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { expect, test } from 'vitest'

const walked = tag('walked', 200)
const alcohol = tag('alcohol', 40)
const mood = tag('mood', 280)

test('should show nothing for a day never tagged', () => {
  expect(dayDots([walked], undefined)).toEqual({ hues: [], overflow: 0 })
})

test('should show nothing for a day with no tags applied', () => {
  expect(dayDots([walked], entry({}))).toEqual({ hues: [], overflow: 0 })
})

test('should show a dot for each applied tag', () => {
  const applied = entry({ walked: [], mood: [] })

  expect(dayDots([walked, alcohol, mood], applied).hues).toEqual([200, 280])
})

test('should follow the order tags were configured in', () => {
  const applied = entry({ mood: [], walked: [] })

  expect(dayDots([mood, walked], applied).hues).toEqual([280, 200])
})

test('should ignore a tag the day does not carry', () => {
  const applied = entry({ walked: [] })

  expect(dayDots([walked, alcohol], applied).hues).toEqual([200])
})

test('should count a tag applied with answers', () => {
  const applied = entry({ alcohol: ['wine' as ChoiceId] })

  expect(dayDots([alcohol], applied).hues).toEqual([40])
})

test('should not overflow when the day fills the limit exactly', () => {
  const tags = [tag('a', 1), tag('b', 2), tag('c', 3), tag('d', 4)]
  const applied = entry({ a: [], b: [], c: [], d: [] })

  expect(dayDots(tags, applied)).toEqual({ hues: [1, 2, 3, 4], overflow: 0 })
})

test('should report the rest as overflow', () => {
  const tags = [tag('a', 1), tag('b', 2), tag('c', 3), tag('d', 4), tag('e', 5), tag('f', 6)]
  const applied = entry({ a: [], b: [], c: [], d: [], e: [], f: [] })

  expect(dayDots(tags, applied)).toEqual({ hues: [1, 2, 3, 4], overflow: 2 })
})

test('should respect a limit it is given', () => {
  const applied = entry({ walked: [], alcohol: [], mood: [] })

  expect(dayDots([walked, alcohol, mood], applied, 1)).toEqual({ hues: [200], overflow: 2 })
})

function tag(id: string, hue: number): Tag {
  return { id: id as TagId, label: id, hue, active: true }
}

function entry(answers: Record<string, ChoiceId[]>): DayEntry {
  return { date: '2026-08-30' as IsoDate, answers }
}
