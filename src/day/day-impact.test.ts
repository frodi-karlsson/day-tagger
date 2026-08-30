import type { IsoDate } from '#src/date/iso-date.js'
import { daysAffectedBy } from '#src/day/day-impact.js'
import type { DayEntry, DayLog } from '#src/day/day.model.js'
import type { Choice, ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { expect, test } from 'vitest'

const wine = option('wine')
const liquor = option('liquor')
const beer = option('beer')

test('should report nothing when the tags are unchanged', () => {
  const tags = [drinks(0, 3)]

  expect(daysAffectedBy(tags, tags, logOf(day('2026-08-01', ['wine'])))).toEqual([])
})

test('should report a day holding an option that was deleted', () => {
  const before = [drinks(0, 3)]
  const after = [withDeletedOption(drinks(0, 3), 'beer')]

  expect(daysAffectedBy(before, after, logOf(day('2026-08-01', ['beer'])))).toEqual(['2026-08-01'])
})

test('should report a day short of a raised minimum', () => {
  const before = [drinks(0, 3)]
  const after = [drinks(2, 3)]

  expect(daysAffectedBy(before, after, logOf(day('2026-08-01', ['wine'])))).toEqual(['2026-08-01'])
})

test('should report a day over a lowered maximum', () => {
  const before = [drinks(0, 3)]
  const after = [drinks(0, 1)]

  const log = logOf(day('2026-08-01', ['wine', 'liquor']))

  expect(daysAffectedBy(before, after, log)).toEqual(['2026-08-01'])
})

test('should report a day using a tag that was deleted', () => {
  const before = [drinks(0, 3)]
  const after = [{ ...drinks(0, 3), active: false }]

  expect(daysAffectedBy(before, after, logOf(day('2026-08-01', ['wine'])))).toEqual(['2026-08-01'])
})

test('should leave days that do not use the changed tag alone', () => {
  const walked: Tag = { id: 'walked' as TagId, label: 'Walked', hue: 1, active: true }
  const before = [drinks(0, 3), walked]
  const after = [drinks(2, 3), walked]

  const log = logOf(day('2026-08-01', []), day('2026-08-02', ['wine']))
  log.days['2026-08-01' as IsoDate] = {
    date: '2026-08-01' as IsoDate,
    answers: { walked: [] } as Record<TagId, ChoiceId[]>,
  }

  expect(daysAffectedBy(before, after, log)).toEqual(['2026-08-02'])
})

test('should ignore a day that was already broken', () => {
  const before = [drinks(3, 3)]
  const after = [drinks(2, 3)]

  expect(daysAffectedBy(before, after, logOf(day('2026-08-01', ['wine'])))).toEqual([])
})

test('should report every affected day', () => {
  const before = [drinks(0, 3)]
  const after = [drinks(2, 3)]

  const log = logOf(day('2026-08-01', ['wine']), day('2026-08-02', ['liquor']))

  expect(daysAffectedBy(before, after, log)).toEqual(['2026-08-01', '2026-08-02'])
})

test('should not mind renaming, which leaves ids alone', () => {
  const before = [drinks(0, 3)]
  const after = [{ ...drinks(0, 3), label: 'Booze' }]

  expect(daysAffectedBy(before, after, logOf(day('2026-08-01', ['wine'])))).toEqual([])
})

function option(id: string): Choice {
  return { id: id as ChoiceId, label: id, active: true }
}

function drinks(minAnswers: number, maxAnswers: number): Tag {
  return {
    id: 'drinks' as TagId,
    label: 'Drinks',
    hue: 40,
    active: true,
    choices: { options: [wine, liquor, beer], minAnswers, maxAnswers },
  }
}

function withDeletedOption(tag: Tag, id: string): Tag {
  return {
    ...tag,
    choices: {
      options: (tag.choices?.options ?? []).map((choice) =>
        choice.id === id ? { ...choice, active: false } : choice,
      ),
      minAnswers: tag.choices?.minAnswers ?? 0,
      maxAnswers: tag.choices?.maxAnswers ?? 1,
    },
  }
}

function day(date: string, answers: string[]): DayEntry {
  return {
    date: date as IsoDate,
    answers: { drinks: answers as ChoiceId[] } as Record<TagId, ChoiceId[]>,
  }
}

function logOf(...entries: DayEntry[]): DayLog {
  const days = Object.fromEntries(entries.map((entry) => [entry.date, entry]))

  return { schemaVersion: 1, days }
}
