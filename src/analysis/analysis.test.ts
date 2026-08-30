import {
  allAspects,
  describeAspect,
  matches,
  sameAspect,
  type Aspect,
} from '#src/analysis/aspect.js'
import { associate, ratioOf } from '#src/analysis/association.js'
import { frequencyOf, frequencyWithinTag } from '#src/analysis/frequency.js'
import { buildSeries, type Observation } from '#src/analysis/series.js'
import type { IsoDate } from '#src/date/iso-date.js'
import type { DayEntry, DayLog } from '#src/day/day.model.js'
import type { Choice, ChoiceId, Tag, TagId } from '#src/tag/tag.model.js'
import { describe, expect, test } from 'vitest'

const drank: Aspect = { kind: 'tag', tagId: 'drink' as TagId }
const drankWine: Aspect = { kind: 'option', tagId: 'drink' as TagId, choiceId: 'wine' as ChoiceId }
const stomach: Aspect = { kind: 'tag', tagId: 'stomach' as TagId }

describe('matches', () => {
  test('should match a tag that was applied', () => {
    expect(matches(drank, entry({ drink: [] }))).toBe(true)
  })

  test('should not match a tag that was not applied', () => {
    expect(matches(drank, entry({}))).toBe(false)
  })

  test('should match an option that was answered', () => {
    expect(matches(drankWine, entry({ drink: ['wine'] }))).toBe(true)
  })

  test('should not match an option that was not answered', () => {
    expect(matches(drankWine, entry({ drink: ['beer'] }))).toBe(false)
  })

  test('should not match an option when the tag is absent', () => {
    expect(matches(drankWine, entry({}))).toBe(false)
  })
})

describe('allAspects', () => {
  test('should offer the tag and each of its options', () => {
    expect(allAspects([drinkTag()])).toEqual([
      { kind: 'tag', tagId: 'drink' },
      { kind: 'option', tagId: 'drink', choiceId: 'wine' },
      { kind: 'option', tagId: 'drink', choiceId: 'beer' },
    ])
  })

  test('should skip a deleted tag', () => {
    expect(allAspects([{ ...drinkTag(), active: false }])).toEqual([])
  })

  test('should skip a deleted option', () => {
    const tag = withDeletedOption(drinkTag(), 'beer')

    expect(allAspects([tag])).toHaveLength(2)
  })
})

describe('describeAspect', () => {
  test('should name a tag', () => {
    expect(describeAspect(drank, [drinkTag()])).toBe('Drink')
  })

  test('should name an option under its tag', () => {
    expect(describeAspect(drankWine, [drinkTag()])).toBe('Drink: Wine')
  })

  test('should fall back to the id when the tag is gone', () => {
    expect(describeAspect(drank, [])).toBe('drink')
  })
})

describe('sameAspect', () => {
  test('should match identical tag aspects', () => {
    expect(sameAspect(drank, { kind: 'tag', tagId: 'drink' as TagId })).toBe(true)
  })

  test('should tell a tag from one of its options', () => {
    expect(sameAspect(drank, drankWine)).toBe(false)
  })

  test('should tell two options apart', () => {
    const beer: Aspect = { kind: 'option', tagId: 'drink' as TagId, choiceId: 'beer' as ChoiceId }

    expect(sameAspect(drankWine, beer)).toBe(false)
  })
})

describe('buildSeries', () => {
  test('should run from the first tagged day to today', () => {
    const log = logOf({ '2026-08-01': { drink: [] }, '2026-08-03': { drink: [] } })

    expect(dates(buildSeries(log, day('2026-08-04')))).toEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
      '2026-08-04',
    ])
  })

  test('should include days with nothing tagged', () => {
    const log = logOf({ '2026-08-01': { drink: [] } })
    const series = buildSeries(log, day('2026-08-02'))

    expect(series.at(1)?.entry.answers).toEqual({})
  })

  test('should return nothing when no day is tagged', () => {
    expect(buildSeries(logOf({}), day('2026-08-04'))).toEqual([])
  })

  test('should return nothing when today is before the first entry', () => {
    const log = logOf({ '2026-08-05': { drink: [] } })

    expect(buildSeries(log, day('2026-08-04'))).toEqual([])
  })
})

describe('frequencyOf', () => {
  test('should count the days an aspect held', () => {
    const series = seriesOf([{ drink: [] }, {}, { drink: [] }, {}])

    expect(frequencyOf(drank, series)).toEqual({ days: 2, total: 4, ratio: 0.5 })
  })

  test('should report zero for an empty series', () => {
    expect(frequencyOf(drank, [])).toEqual({ days: 0, total: 0, ratio: 0 })
  })
})

describe('frequencyWithinTag', () => {
  test('should count an option against the days its tag applied', () => {
    const series = seriesOf([{ drink: ['wine'] }, { drink: ['beer'] }, {}, {}])

    expect(frequencyWithinTag(drankWine, series)).toEqual({ days: 1, total: 2, ratio: 0.5 })
  })

  test('should not apply to a tag aspect', () => {
    expect(frequencyWithinTag(drank, seriesOf([{ drink: [] }]))).toBeUndefined()
  })
})

describe('associate', () => {
  test('should compare the effect with and without the cause on the same day', () => {
    const series = seriesOf([{ drink: [], stomach: [] }, { drink: [] }, { stomach: [] }, {}])

    const result = associate(drank, stomach, series, 0)

    expect(result.withCause).toEqual({ total: 2, withEffect: 1 })
    expect(result.withoutCause).toEqual({ total: 2, withEffect: 1 })
    expect(result.difference).toBe(0)
  })

  test('should look forward across the window', () => {
    const series = seriesOf([{ drink: [] }, { stomach: [] }, {}, {}])

    expect(associate(drank, stomach, series, 1).withCause).toEqual({ total: 1, withEffect: 1 })
  })

  test('should not look further than the window', () => {
    const series = seriesOf([{ drink: [] }, {}, { stomach: [] }, {}])

    expect(associate(drank, stomach, series, 1).withCause).toEqual({ total: 1, withEffect: 0 })
  })

  test('should count the day itself within a window', () => {
    const series = seriesOf([{ drink: [], stomach: [] }, {}, {}])

    expect(associate(drank, stomach, series, 1).withCause).toEqual({ total: 1, withEffect: 1 })
  })

  test('should drop days too close to the end to observe', () => {
    const series = seriesOf([{}, {}, {}, {}])

    expect(associate(drank, stomach, series, 2).observedDays).toBe(2)
  })

  test('should report the difference in likelihood', () => {
    const series = seriesOf([{ drink: [], stomach: [] }, { drink: [], stomach: [] }, {}, {}])

    expect(associate(drank, stomach, series, 0).difference).toBe(1)
  })

  test('should go negative when the cause makes the effect rarer', () => {
    const series = seriesOf([{ drink: [] }, { drink: [] }, { stomach: [] }, { stomach: [] }])

    expect(associate(drank, stomach, series, 0).difference).toBe(-1)
  })

  test('should handle a cause that never happened', () => {
    const series = seriesOf([{}, {}])

    expect(associate(drank, stomach, series, 0).withCause).toEqual({ total: 0, withEffect: 0 })
  })

  test('should survive an empty series', () => {
    expect(associate(drank, stomach, [], 0).observedDays).toBe(0)
  })
})

describe('ratioOf', () => {
  test('should divide the effect by the total', () => {
    expect(ratioOf({ total: 4, withEffect: 1 })).toBe(0.25)
  })

  test('should return zero rather than divide by zero', () => {
    expect(ratioOf({ total: 0, withEffect: 0 })).toBe(0)
  })
})

function day(value: string): IsoDate {
  return value as IsoDate
}

function entry(answers: Record<string, string[]>): DayEntry {
  return { date: day('2026-08-01'), answers: answers as Record<TagId, ChoiceId[]> }
}

function dates(series: Observation[]): string[] {
  return series.map((observation) => observation.date)
}

function seriesOf(answers: Record<string, string[]>[]): Observation[] {
  return answers.map((value, index) => ({
    date: day(`2026-08-${String(index + 1).padStart(2, '0')}`),
    entry: entry(value),
  }))
}

function logOf(days: Record<string, Record<string, string[]>>): DayLog {
  const entries = Object.entries(days).map(([date, answers]) => [
    date,
    { date: day(date), answers: answers as Record<TagId, ChoiceId[]> },
  ])

  return { schemaVersion: 1, days: Object.fromEntries(entries) as Record<IsoDate, DayEntry> }
}

function option(id: string, label: string): Choice {
  return { id: id as ChoiceId, label, active: true }
}

function drinkTag(): Tag {
  return {
    id: 'drink' as TagId,
    label: 'Drink',
    hue: 40,
    active: true,
    choices: {
      options: [option('wine', 'Wine'), option('beer', 'Beer')],
      minAnswers: 0,
      maxAnswers: 2,
    },
  }
}

function withDeletedOption(tag: Tag, id: string): Tag {
  return {
    ...tag,
    choices: {
      options: (tag.choices?.options ?? []).map((choice) =>
        choice.id === id ? { ...choice, active: false } : choice,
      ),
      minAnswers: 0,
      maxAnswers: 2,
    },
  }
}
