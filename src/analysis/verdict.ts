import { ratioOf, type Association } from '#src/analysis/association.js'

/** Below this many days carrying the cause, a claim is worth making but not worth leaning on. */
const minimumSightings = 5

/** A gap this small is not worth a claim, however many days it came from. */
const flatDifference = 0.05

/**
 * What the numbers say, as a claim rather than a pair of percentages. How much the claim can be
 * leaned on is a separate question, answered by sightingsCaveat, so that thin evidence qualifies
 * a result rather than withholding it.
 */
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

/**
 * A caveat to sit under a claim drawn from few days, or nothing when the evidence holds up.
 * Says why the claim is shaky rather than only that it is, so the reader knows what would
 * settle it.
 */
export function sightingsCaveat(association: Association, causeName: string): string | undefined {
  const sightings = association.withCause.total

  if (sightings === 0 || sightings >= minimumSightings) {
    return undefined
  }

  const days = sightings === 1 ? '1 day' : `${String(sightings)} days`

  return `Only ${days} with ${causeName} so far, so this can still swing a long way.`
}

/** One decimal, without a pointless trailing zero. 2 rather than 2.0. */
function multiplier(value: number): string {
  return String(Math.round(value * 10) / 10)
}

/**
 * The shape of a relationship, before it is put into words. A ratio carries the exact
 * multiplier, so the wording can be precise rather than reaching for "about twice".
 */
export type Verdict =
  | { kind: 'none' }
  | { kind: 'flat' }
  | { kind: 'absent' }
  | { kind: 'exclusive' }
  | { kind: 'ratio'; direction: 'more' | 'less'; times: number }
