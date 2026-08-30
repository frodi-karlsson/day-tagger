import { ratioOf, type Association } from '#src/analysis/association.js'

/** Days with the cause below which a claim gets a caveat. */
const minimumSightings = 5

/** Differences below this are reported as flat. */
const flatDifference = 0.05

/** The shape of the relationship. Sample size is answered separately by sightingsCaveat. */
export function verdictOf(association: Association): Verdict {
  if (association.withCause.total === 0) {
    return { kind: 'none' }
  }

  if (Math.abs(association.difference) < flatDifference) {
    return { kind: 'flat' }
  }

  const after = ratioOf(association.withCause)
  const otherwise = ratioOf(association.withoutCause)

  if (after === 0) {
    return { kind: 'absent' }
  }

  if (otherwise === 0) {
    return { kind: 'exclusive' }
  }

  return after > otherwise
    ? { kind: 'ratio', direction: 'more', times: after / otherwise }
    : { kind: 'ratio', direction: 'less', times: otherwise / after }
}

export function verdictSentence(verdict: Verdict, causeName: string, effectName: string): string {
  if (verdict.kind === 'none') {
    return `${causeName} has not come up yet, so there is nothing to compare.`
  }

  if (verdict.kind === 'flat') {
    return `${effectName} is about as likely either way.`
  }

  if (verdict.kind === 'absent') {
    return `${effectName} has never followed ${causeName}.`
  }

  if (verdict.kind === 'exclusive') {
    return `${effectName} has only ever followed ${causeName}.`
  }

  const likelihood = verdict.direction === 'more' ? 'as likely' : 'less likely'

  return `${effectName} is ${multiplier(verdict.times)}× ${likelihood} after ${causeName}.`
}

/** A caveat for a claim drawn from few days, or nothing once there are enough. */
export function sightingsCaveat(association: Association, causeName: string): string | undefined {
  const sightings = association.withCause.total

  if (sightings === 0 || sightings >= minimumSightings) {
    return undefined
  }

  const days = sightings === 1 ? '1 day' : `${String(sightings)} days`

  return `Only ${days} with ${causeName} so far, so this can still swing a long way.`
}

/** One decimal, without a trailing zero. 2 rather than 2.0. */
function multiplier(value: number): string {
  return String(Math.round(value * 10) / 10)
}

/** The shape of a relationship, before it is put into words. */
export type Verdict =
  | { kind: 'none' }
  | { kind: 'flat' }
  | { kind: 'absent' }
  | { kind: 'exclusive' }
  | { kind: 'ratio'; direction: 'more' | 'less'; times: number }
