import { matches, type Aspect } from '#src/analysis/aspect.js'
import type { Observation } from '#src/analysis/series.js'

/**
 * How often the effect follows the cause, against how often it turns up without it.
 *
 * The window looks forward and includes the day itself, so a window of 0 asks about the same
 * day and a window of 2 asks about the day itself or either of the next two. Days too close to
 * the end to be observed over the whole window are left out entirely, since counting them would
 * quietly report the effect as rarer than it is.
 */
export function associate(
  cause: Aspect,
  effect: Aspect,
  series: Observation[],
  windowDays: number,
): Association {
  const observable = series.slice(0, Math.max(series.length - windowDays, 0))

  const withCause = { total: 0, withEffect: 0 }
  const withoutCause = { total: 0, withEffect: 0 }

  observable.forEach((observation, index) => {
    const side = matches(cause, observation.entry) ? withCause : withoutCause
    const window = series.slice(index, index + windowDays + 1)

    side.total += 1

    if (window.some((day) => matches(effect, day.entry))) {
      side.withEffect += 1
    }
  })

  return {
    windowDays,
    observedDays: observable.length,
    withCause,
    withoutCause,
    difference: ratioOf(withCause) - ratioOf(withoutCause),
  }
}

export function ratioOf(side: AssociationSide): number {
  return side.total === 0 ? 0 : side.withEffect / side.total
}

export interface AssociationSide {
  total: number
  withEffect: number
}

export interface Association {
  windowDays: number
  /** Days that could be observed over the whole window. */
  observedDays: number
  withCause: AssociationSide
  withoutCause: AssociationSide
  /** How much likelier the effect is with the cause than without, from -1 to 1. */
  difference: number
}
