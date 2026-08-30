import { matches, type Aspect } from '#src/analysis/aspect.js'
import type { Observation } from '#src/analysis/series.js'

/** How often an aspect held, across every day in the series. */
export function frequencyOf(aspect: Aspect, series: Observation[]): Frequency {
  const days = series.filter((observation) => matches(aspect, observation.entry)).length

  return { days, total: series.length, ratio: ratioOf(days, series.length) }
}

/**
 * How often an option held on the days its own tag was applied. "When I drank, how often was it
 * wine" is a different question from "how often did I drink wine", and usually the one meant.
 */
export function frequencyWithinTag(aspect: Aspect, series: Observation[]): Frequency | undefined {
  if (aspect.kind !== 'option') {
    return undefined
  }

  const applied = series.filter((observation) =>
    matches({ kind: 'tag', tagId: aspect.tagId }, observation.entry),
  )

  const days = applied.filter((observation) => matches(aspect, observation.entry)).length

  return { days, total: applied.length, ratio: ratioOf(days, applied.length) }
}

function ratioOf(days: number, total: number): number {
  return total === 0 ? 0 : days / total
}

export interface Frequency {
  days: number
  total: number
  /** 0 to 1. Zero when there is nothing to divide by. */
  ratio: number
}
